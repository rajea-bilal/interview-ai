import OpenAI from "openai";
import { OpenAIStream, StreamingTextResponse } from "ai";

// Create an OpenAI API client with explicit configuration
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  baseURL: "https://api.openai.com/v1", // explicitly set the base URL
});

export const runtime = "edge";

export async function POST(req: Request) {

 
  try {
   
    const body = await req.json();
    // messages is an array of conversation objects between the user and the AI interviewer
    // text: the text to convert to speech
    // type: tells openAI what do do, speech or question generation
    const { messages, text, type } = body


    // generate audio using OpenAI TTS model
     if(type === "speech") {
      const audio = await openai.audio.speech.create({
        model: "tts-1",
        voice: "alloy",
        input: text,
        speed: 1.0,
        response_format: "mp3",
      }) as unknown as Response;

      // Get complete audio buffer at once (not streamed)
      const arrayBuffer = await audio.arrayBuffer()
      const buffer = Buffer.from(arrayBuffer)
      console.log('audio buffer being sent once');  
      return new Response(buffer, {
        headers: {
          'Content-Type': 'audio/mp3',
        }
      });
    }
     
 // if type is not specified, then generate a question

// instructions for the AI interviewer + history of the conversation between the user and the AI interviewer
const openAIContext = [
       {
      role: "system",
      content: `You are Bob, an expert technical interviewer for software engineers.

OBJECTIVE:
Conduct professional interviews based on the candidate's chosen interview type:
Analyze the data you get and ask questions one by one based on the type of interview the user selected.
- BEHAVIORAL: Focus on past experiences, teamwork, and problem-solving
- TECHNICAL: Ask coding questions, system design, and architecture
- PROJECT: Deep dive into their portfolio projects and technical decisions

INTERVIEW STYLE:
- Ask ONE question at a time
- Base questions on their resume and chosen interview type
- Keep questions relevant to software engineering roles

RULES:
- Keep questions concise and clear
- Wait for candidate's response before asking next question
- Ignore non-English responses
- Aim for 5-6 questions total

After all questions, provide brief, actionable feedback on their interview performance.`,
    },
    ...messages
]

const response = await openai.chat.completions.create({
  model: "gpt-4-1106-preview",
  messages: openAIContext,
  stream: true,
  temperature: 0.7,
});

const stream = OpenAIStream(response);
return new StreamingTextResponse(stream);

} catch (error: any) {
console.error('OpenAI API error:', error);

return new Response(
  JSON.stringify({
    error: error.message || 'An error occurred',
    details: error.toString(),
    status: error.status || 500
  }),
  { 
    status: error.status || 500,
    headers: {
      'Content-Type': 'application/json'
    }
  }
);
}
}



     

