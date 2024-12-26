import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

export const runtime = 'edge';

type RequestBody = {
  url: string;
};

export async function POST(req: NextRequest) {
  const body: RequestBody = await req.json();
  const { url } = body;
  console.log("url", url)
  if (!url) {
    return new NextResponse(JSON.stringify({ error: 'URL is required' }), {
      status: 400,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }

  const scrapingAntApiKey = process.env.SCRAPING_ANT_API_KEY;
  const apiEndpoint = `https://api.scrapingant.com/v2/general?url=${encodeURIComponent(url)}&x-api-key=${scrapingAntApiKey}&browser=false&block_resource=stylesheet&block_resource=image&block_resource=media&block_resource=font&block_resource=texttrack&block_resource=xhr&block_resource=fetch&block_resource=eventsource&block_resource=websocket&block_resource=manifest`

  try {
    const response = await fetch(apiEndpoint);
    if (!response.ok) {
      const errorText = await response.text();  // Log the actual error response
      throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
    }

    const htmlContent = await response.text();
    console.log("htmlContent", htmlContent)
    return new NextResponse(JSON.stringify({ textContent: htmlContent }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error('Error while calling ScrapingAnt:', error.message);
      return new NextResponse(JSON.stringify({ error: 'An error occurred during scraping', details: error.message }), {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
      },
    });
  }
}
