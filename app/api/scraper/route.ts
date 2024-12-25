import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { processHtmlContent } from "@/app/utils/processHtmlContent";

// Define the POST handler for the API route
export async function POST(req: NextRequest) {
  try {
    // 1. Parse the incoming request body (assumes JSON format)
    const body = await req.json();
    const { url } = body;  // Extract the URL from the parsed request body

    // 2. Check if the URL is missing from the request
    if (!url) {
      // Return a 400 Bad Request response if the URL is not provided
      return new NextResponse(JSON.stringify({ error: "URL is required" }), {
        status: 400,
        headers: {
          "Content-Type": "application/json",  // Ensure response is JSON
        },
      });
    }

    try {
      // 3. Process the HTML content from the provided URL (scraping logic)
      const textContent = await processHtmlContent(url);

      // 4. Check if the extraction failed or returned empty
      if (!textContent) {
        console.error("No text content extracted from URL:", url);
        return new NextResponse(
          JSON.stringify({
            error: "Failed to extract text content",
            details: "The URL returned no text content",  // Informative message
          }),
          {
            status: 500,  // Internal Server Error
            headers: {
              "Content-Type": "application/json",
            },
          }
        );
      }

      // 5. Return the successfully extracted text content as a JSON response
      return new NextResponse(JSON.stringify({ textContent }), {
        status: 200,
        headers: {
          "Content-Type": "application/json",
        },
      });
      
    } catch (error) {
      // 6. Handle errors during HTML processing or scraping
      console.error("Error processing content:", error);
      return new NextResponse(
        JSON.stringify({
          error: "Failed to scrape the text content",
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
    
  } catch (error) {
    // 7. Handle errors during request parsing (e.g., invalid JSON)
    console.error("Request processing error:", error);
    return new NextResponse(
      JSON.stringify({
        error: "Invalid request",
        details: error instanceof Error ? error.message : "Unknown error",
      }),
      {
        status: 400,
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  }
}
