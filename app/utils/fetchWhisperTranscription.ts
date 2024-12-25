interface WhisperResponse {
  text: string;
}

export async function fetchWhisperTranscription(audioBlob: Blob): Promise<string> {
  try {
    const formData = new FormData();
    formData.append('audio', audioBlob);

    const response = await fetch('/api/openai-whisper', {
      method: 'POST',
      body: formData
    });

    if (!response.ok) {
      const errorBody = await response.json().catch(() => ({}));
      console.error(`Transcription failed: ${response.status} - ${errorBody.error || 'Unknown error'}`);
      return 'Transcription failed';  
    }

    const { text }: WhisperResponse = await response.json();
    return text;

  } catch (error) {
    console.error('Error transcribing audio:', error);
    return 'Transcription failed';
  }
} 