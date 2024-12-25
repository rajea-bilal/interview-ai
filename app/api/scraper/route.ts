import  ScrapingAntClient from '@scrapingant/scrapingant-client';
import { NextRequest, NextResponse } from 'next/server';
import { parse } from 'node-html-parser';

const client = new ScrapingAntClient({ 
  apiKey: process.env.SCRAPING_ANT_API_KEY

});

export async function POST(req: NextRequest) {
  try {
    const { url } = await req.json();

    // go to this url and scrape the page
    const result = await client.scrape( url );

    //check if the result ha san error property
    if(result.error || !result.content) {
      console.error("Scraping error", result.error || "No content found")
      return NextResponse.json(
        { error: 'Failed to scrape job description' },
        { status: 500 }
      )
    }

    // parse HTML coming from scrapingAnt
    const root = parse(result.content)

    // clean unwanted elements, find script and style tags and remove them
    root.querySelectorAll('script, style').forEach(element => {
      element.remove()
    })

    // get all the text from the body tag and trim it
    const cleanText = root.textContent.trim()

    // console.log('cleanText', cleanText)
    return NextResponse.json({ 
      textContent: cleanText
    });

  } catch (error) {
    console.error('Scraping error:', error);
    return NextResponse.json(
      { error: 'Failed to scrape job description' },
      { status: 500 }
    );
  }
}
