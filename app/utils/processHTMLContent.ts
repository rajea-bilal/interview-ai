import { JSDOM } from 'jsdom';

export async function processHtmlContent(url: string): Promise<string | null> {
  try {
    const scrapingAntApiKey = process.env.SCRAPING_ANT_API_KEY;
    if (!scrapingAntApiKey) {
      throw new Error("ScrapingAnt API key is missing.");
    }

    // ScrapingAnt API endpoint with parameters
    const apiEndpoint = `https://api.scrapingant.com/v2/general?url=${encodeURIComponent(url)}&x-api-key=${scrapingAntApiKey}&browser=false&block_resource=stylesheet&block_resource=image&block_resource=media`;

    // Fetch the HTML through ScrapingAnt
    const response = await fetch(apiEndpoint);

    // Handle non-200 responses
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`ScrapingAnt Error: ${response.status} - ${errorText}`);
    }

    // Extract HTML content
    const html = await response.text();

    // Create virtual DOM using jsdom
    const dom = new JSDOM(html);
    const document = dom.window.document;

    // Remove scripts and styles to clean up the DOM
    const scripts = document.getElementsByTagName('script');
    const styles = document.getElementsByTagName('style');
    
    while (scripts.length > 0) {
      scripts[0].parentNode?.removeChild(scripts[0]);
    }
    while (styles.length > 0) {
      styles[0].parentNode?.removeChild(styles[0]);
    }

    // Extract text content from the cleaned HTML
    const textContent = document.body.textContent || '';
    const cleanedText = textContent.replace(/\s+/g, ' ').trim();

    return cleanedText;
  } catch (error) {
    console.error('Error processing HTML content:', error);
    return null;
  }
}
