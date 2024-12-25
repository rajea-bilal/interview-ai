import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { processHtmlContent } from "@/app/utils/processHTMLContent";

// Define the POST handler for the API route
export async function POST(req: NextRequest) {
  try {
    // 1. Parse the incoming request body (assumes JSON format)
    const body = await req.json();
    const { url } = body;

    // 2. Check if the URL is missing from the request
    if (!url) {
      return new NextResponse(JSON.stringify({ error: "URL is required" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    try {
      // 3. Perform the scraping with a 10-second timeout
      const textContent = await scrapeWithTimeout(url, 10000);  // 10s timeout

      // 4. Check if the scraper returned no content
      if (!textContent) {
        console.error("No text content extracted from URL:", url);
        return new NextResponse(
          JSON.stringify({
            error: "Failed to extract text content",
            details: "The scraper returned no content or invalid data",
          }),
          {
            status: 500,
            headers: { "Content-Type": "application/json" },
          }
        );
      }

      // 5. Return the successfully extracted text content
      return new NextResponse(JSON.stringify({ textContent }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });

    } catch (error) {
      console.error("Scraping error:", error);
      return new NextResponse(
        JSON.stringify({
          error: "Failed to scrape the text content",
          details: error instanceof Error ? error.message : "Unknown error",
        }),
        {
          status: 500,
          headers: { "Content-Type": "application/json" },
        }
      );
    }
  } catch (error) {
    console.error("Request processing error:", error);
    return new NextResponse(
      JSON.stringify({
        error: "Invalid request",
        details: error instanceof Error ? error.message : "Unknown error",
      }),
      {
        status: 400,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}

// Simpler scraping function with timeout
async function scrapeWithTimeout(url: string, timeout: number) {
  const controller = new AbortController();  // Abort controller for timing out requests
  const id = setTimeout(() => controller.abort(), timeout);  // Abort after timeout

  try {
    const textContent = await processHtmlContent(url, { signal: controller.signal });
    clearTimeout(id);  // Clear timeout if scraping succeeds
    return textContent;
  } catch (error) {
    clearTimeout(id);  // Ensure timeout is cleared on error
    if (error instanceof Error && error.name === "AbortError") {
      throw new Error("Scraping timed out");
    }
    throw error;  // Throw other errors
  }
}
