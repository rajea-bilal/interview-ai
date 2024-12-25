import { mockInterviewData } from "./mockData";

interface Props {
  text: string;
};

export async function fetchOpenAIAudio({ text}: Props) {
  try {
    if (!text) {
      console.error('No text provided for audio conversion');
      return null;
    }

    const response = await fetch('/api/openai-gpt', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        text: text,
        type: "speech"  // This tells the endpoint we want speech
      })
    });

    if (!response.ok) {
        const errorData = await response.json();
    console.error('OpenAI TTS Error:', errorData);
  throw new Error(errorData.message || 'Failed to convert text to speech');
    }

    const audioBlob = await response.blob();

    if (audioBlob.size === 0) {
  throw new Error('Received empty audio blob');
}
    const audioUrl = URL.createObjectURL(audioBlob);
    
    return audioUrl;

  } catch (error) {
    console.error('Error converting text to speech:', error);
    return null;
  }
}