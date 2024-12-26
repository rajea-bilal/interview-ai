
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

export const runtime = 'edge';

type RequestBody = {
  url: string;
};

// Helper function to add fetch timeout
async function fetchWithTimeout(resource: string, options: any = {}, timeout = 15000) {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);
  const response = await fetch(resource, {
    ...options,
    signal: controller.signal,
  });
  clearTimeout(id);
  return response;
}

export async function POST(req: NextRequest) {
  const body: RequestBody = await req.json();
  const { url } = body;

  if (!url) {
    return new NextResponse(JSON.stringify({ error: 'URL is required' }), {
      status: 400,
    });
  }

  const scrapingAntApiKey = process.env.SCRAPING_ANT_API_KEY;
  const apiEndpoint = `https://api.scrapingant.com/v2/general?url=${encodeURIComponent(url)}&x-api-key=${scrapingAntApiKey}&browser=false&block_resource=stylesheet&block_resource=image`;

  try {
    const response = await fetchWithTimeout(apiEndpoint, {}, 10000);  // 10s timeout
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
    }

    const htmlContent = await response.text();
    return new NextResponse(JSON.stringify({ textContent: htmlContent }), {
      status: 200,
    });
  } catch (error) {
    console.error('Error during scraping:', error);
    return new NextResponse(
      JSON.stringify({ error: 'Scraping failed', details: error.message }),
      { status: 500 }
    );
  }
}

