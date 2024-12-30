
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { processHtmlContent } from "@/app/utils/processHTMLContent";
import { OpenAI } from 'openai';


const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Summarization function using OpenAI GPT
async function summarizeText(text: string): Promise<string | null> {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4-turbo-preview",
      messages: [
        { role: "system", content: "Summarize job descriptions to highlight the role, responsibilities, and required skills." },
        { role: "user", content: `Summarize this job description:\n\n${text}` },
      ],
      max_tokens: 1000,
    });

    return response.choices[0]?.message?.content || "Summary not available.";
  } catch (error) {
    console.error("Error summarizing text:", error);
    return null;
  }
}

// Handle scraping request
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { url } = body;

    if (!url) {
      return new NextResponse(JSON.stringify({ error: "URL is required" }), {
        status: 400,
        headers: {
          "Content-Type": "application/json",
        },
      });
    }

    // Process URL to extract text content
    const textContent = await processHtmlContent(url);
    console.log('textContent from processHtmlContent', textContent)
    console.log('textContent length', textContent?.length)
    // Handle no content scenario
    if (!textContent) {
      return new NextResponse(
        JSON.stringify({
          error: "Failed to extract text content",
          details: "The URL returned no content, likely due to JavaScript rendering or blocks.",
        }),
        {
          status: 500,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
    }

    // Summarize if content exceeds the token limit
    let finalText = textContent;
    if (textContent.length > 8000) {
      console.log("Text too long – summarizing...");
      const summary = await summarizeText(textContent);
      if (summary) {
        finalText = summary;
      }
    }

    console.log('finalText', finalText)
    // Return the scraped/summarized text content
    return new NextResponse(JSON.stringify({ textContent: finalText }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    console.error("Error in scraper endpoint:", error);

    return new NextResponse(
      JSON.stringify({
        error: "Internal server error",
        details: error instanceof Error ? error.message : "Unknown error",
      }),
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  }
}
