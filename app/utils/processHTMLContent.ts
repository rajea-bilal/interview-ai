import { JSDOM } from 'jsdom';

export async function processHtmlContent(url: string): Promise<string | null> {
  try {
    const response = await fetch(url);
    const html = await response.text();

    // Create a virtual DOM using jsdom
    const dom = new JSDOM(html);
    const document = dom.window.document;

    // Extract JSON-LD if available
    const jsonLdElement = document.querySelector('script[type="application/ld+json"]');
    if (jsonLdElement) {
      const jsonLd = JSON.parse(jsonLdElement.textContent || '{}');
      if (jsonLd.description) {
        return jsonLd.description.replace(/\s+/g, ' ').trim();
      }
    }

    // Remove script and style elements to clean up the DOM
    ['script', 'style'].forEach(tag => {
      document.querySelectorAll(tag).forEach(el => el.remove());
    });

    // Fallback: Get all text content from the body
    const textContent = document.body.textContent || '';
    const cleanedText = textContent.replace(/\s+/g, ' ').trim();

    return cleanedText;
  } catch (error) {
    console.error('Error processing HTML content:', error);
    return null;
  }
}
