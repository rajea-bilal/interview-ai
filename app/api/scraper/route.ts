
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { processHtmlContent } from "@/app/utils/processHtmlContent";

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

    // Process URL to extract text
    const textContent = await processHtmlContent(url);

    // Handle cases where no content is returned
    if (!textContent) {
      return new NextResponse(
        JSON.stringify({
          error: "Failed to extract text content",
          details: "No content was returned from the scraping API",
        }),
        {
          status: 500,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
    }

    // Return scraped text content
    return new NextResponse(JSON.stringify({ textContent }), {
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
