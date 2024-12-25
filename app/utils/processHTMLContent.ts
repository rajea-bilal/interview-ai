import { JSDOM } from 'jsdom';

export async function processHtmlContent(url: string, options?: { signal?: AbortSignal }): Promise<string | null> {
  try {
    const response = await fetch(url, options);
    const html = await response.text();

    // Create a virtual DOM using jsdom
    const dom = new JSDOM(html);
    const document = dom.window.document;

    // Early filtering - Remove unnecessary elements
    const selectorsToRemove = [
      'script', 'style', 'nav', 'footer', 'header', 'aside', '.ads', '.hidden', '.popup', '#sidebar'
    ];
    
    selectorsToRemove.forEach(selector => {
      document.querySelectorAll(selector).forEach(el => el.remove());
    });

    // Get all text content after filtering
    const textContent = document.body.textContent || '';
    
    // Clean up the text content (remove excess spaces)
    const cleanedText = textContent
      .replace(/\s+/g, ' ')
      .trim();

    return cleanedText;
  } catch (error) {
    console.error('Error processing HTML content:', error);
    return null;
  }
}
