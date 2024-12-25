"use client";
import dynamic from 'next/dynamic';
import { useEffect, useState, useRef } from "react";
import Image from 'next/image';

import { fetchOpenAIAudio } from "../utils/fetchOpenAIAudio";
import { fetchWhisperTranscription } from '../utils/fetchWhisperTranscription';
import { fetchOpenAIQuestion } from '../utils/fetchOpenAIQuestion';
const AudioRecorder = dynamic(
  () => import('./AudioRecorder'),
  { ssr: false }
);
import LoadingSpinner from "./LoadingSpinner";

import SpeakingAnimation from './SpeakingAnimation';
import MarkdownRenderer from './MarkdownRenderer';


interface ChatProps {
  initialText: string;
  interviewData: {
    jobDescriptionText: string;
    interviewType: string;
    resumeText: string;
  }
};

const authors = {
  user: { username: 'User', id: 1, avatarUrl: 'user-avatar.png'},
  ai: { username: 'Bob', id: 2, avatarUrl: '/lady-v1.png'}
}

// for the chat messages to be displated in the UI
type MessageType = {
  author: {
    username: string;
    id: number;
    avatarUrl: string
  }
  text?: string;
  type: string;
  audio?: string | null;
  timestamp: number;
};

// chat history for openAI
type AIMessage = {
  role: string
  content: string;
}
 

const Chat: React.FC<ChatProps> = ({ initialText, interviewData }) => {
  const { resumeText, jobDescriptionText, interviewType } = interviewData;
  // state for chat history UI
  const initialMessage = {
    author: authors.ai,
    text: initialText || 'Hello! I am Bob, your interviewer. How can I help you today?',
    type: 'text',
    audio: null,
    timestamp: +new Date()
  }

  // chat history for UI
  const [chatMessages, setChatMessages] = useState<MessageType[]>([initialMessage]);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const audioPlayedRef = useRef(false);

  // an object that stores the last message div element
  const lastMessageRef = useRef<HTMLDivElement>(null);
  // chat history for openAI
  // AI context for the system
  const resumeMessage = {
    role: 'system',
    content: `You help students prepare for technical interviews. Start the interview warmly.
    -------------------
    Interview Type: ${interviewType}
    -------------------
    Resume: ${resumeText}
    --------------------
    Job Description: ${jobDescriptionText}
    --------------------
    `
  }
  // First message from the AI
 const initialAIMessage: AIMessage = {
   role: 'assistant',
   content: initialText || 'Hello! I am Bob, your interviewer. How can I help you today?',
 }
 
 // state for openAI history messages
 const [aiMessages, setAIMessages] = useState<AIMessage[]>([
   resumeMessage,
   initialAIMessage
 ]);
 
 // we want to send the AIMessage to the openAI API 
 const scrollToLastMessage = () => {
  // lastMessageRef.current points to the last message div element
  if (lastMessageRef.current) {
    // scroll the chat so that the last message is visibile
    // make the scoll smooth
    lastMessageRef.current.scrollIntoView({ behavior: 'smooth' });
  }
 }
// automatically scroll to the last message whenever a new message is added
 useEffect(() => {
  scrollToLastMessage();
 }, [chatMessages]);

// fetch the initial audio for the first question
useEffect(() => {
  console.log('useEffect for fetching audio ran')
  let isComponentActive = true


    const fetchInitialAudio = async () => {
      // if audio has already been played, 
      // if the component is not active, exit
     if(audioPlayedRef.current || !isComponentActive) return;

     // fetch & play the audio ONCE when the component mounts
     try {
       audioPlayedRef.current = true;
        const audioUrl = await fetchOpenAIAudio({ text: initialText || "" });
      if (audioUrl && isComponentActive) {

        // create an audio object/player
        const audio = new Audio(audioUrl);
        
        setIsSpeaking(true);
        await audio.play();
        
        if (isComponentActive) {
          // store the audio url in chat history
          setChatMessages((prev) => {
            const updatedMessages = [...prev];
            updatedMessages[0].audio = audioUrl;
            return updatedMessages;
          });

          // reset speaking state when audio ends
          audio.onended = () => {
            if (isComponentActive) {
              setIsSpeaking(false);
            }
          };
        }
      }
     } catch(error) {
      console.error('Failed to fetch initial audio', error);  console.error('Error playing initial audio:', error);
      if (isComponentActive) {
        setIsSpeaking(false);
        audioPlayedRef.current = false;
      }
     }
   
  }

  fetchInitialAudio();

  // cleanup: stop audio if component unmounts
  return () => {
    isComponentActive = false; 
    audioPlayedRef.current = false;  
  };
}, [initialText])


  // Handle user's audio response
  const handleUserAudio = async (audioBlob: Blob) => {
    setIsSpeaking(true);
    try {
      const userText = await transcribeUserAudio(audioBlob);
      console.log('User Response:', userText);
      const userMessage = createUserMessage(userText, audioBlob);

      addMessageToChat(userMessage);
      // add user text response to openAI context
      await updateAIContext({ role: 'user', content: userText });
      // generate AI question based on user response
      await getNextAIResponse();
      
     } catch (error) {
       console.error('Failed to transcribe audio', error);
     } finally {
       setIsSpeaking(false);
     }
   };
      
      // 1. Transcribe Audio
  const transcribeUserAudio = async (audioBlob: Blob): Promise<string> => {
    return await fetchWhisperTranscription(audioBlob);
  };

  //2. create User Chat Message 
  const createUserMessage = (text: string, audioBlob: Blob): MessageType => (
    { 
        author: authors.user,
        text: text,
        type: 'text',
        audio: URL.createObjectURL(audioBlob),
      timestamp: +new Date()
    }
  );
  // 3. add message to chat UI
    const addMessageToChat = (message: MessageType) => {
    setChatMessages((prev) => [...prev, message]);
  }

// 4. update AI contex form openAI
  const updateAIContext = async (message: AIMessage) => {
  setAIMessages((prev) => {
    const updatedMessages = [...prev, message];
    console.log('updatedMessages being sent to openAI', updatedMessages)
    return updatedMessages;
  })
  };

// 5. Get AI Response and fetch audio
const getNextAIResponse = async () => {
  const updatedAIMessages = [...aiMessages];
  console.log('updatedAIMessages being sent to openAI', updatedAIMessages)

  try {
    const fullResponse = await fetchOpenAIQuestion(updatedAIMessages, () => {});
    console.log('fullResponse received for second question from openAI', fullResponse)
     // Create a new AI message with the full response
    const aiMessage = createAIMessage(fullResponse);
    
    // Add the AI message to the chat
    setChatMessages((prevMessages) => [...prevMessages, aiMessage]);

    // Update the AI message history (context)
    updateAIContext({ role: 'assistant', content: fullResponse });
    

    // Convert the full AI response to audio and attach it
    const audioUrl = await fetchOpenAIAudio({ text: fullResponse });
    if (audioUrl) {
      attachAudioToLastMessage(audioUrl);
      const audio = new Audio(audioUrl);
      setIsSpeaking(true);
      audio.play()

      // reset speaking state when audio ends
      audio.onended = () => {
        setIsSpeaking(false)
      }
    }
  } catch(error) {
     console.error('Error getting AI response:', error);
     setIsSpeaking(false)
  }
  
};

// 6. create AI Chat Message for chat UI
const createAIMessage = (response: string): MessageType => ({
  author: authors.ai,
  text: response,
  type: 'text',
  audio: null,
  timestamp: +new Date()
});

// 7. Attach Audio to the Last AI Message
const attachAudioToLastMessage = (audioUrl: string) => {
   console.log('Attaching audio to last message:', audioUrl);
  setChatMessages((prev) => {
    const updatedMessages = [...prev];
    updatedMessages[updatedMessages.length - 1].audio = audioUrl; 
    return updatedMessages;
  });
  
};

  return (
    <div className="w-full flex flex-col w-full">
      {/* Chat Messages */}
      <div className="bg-[rgba(0,0,0,0.1)] backdrop-blur-sm w-full overflow-y-auto p-4 rounded-lg flex flex-col gap-2 h-[400px] md:h-[500px] shadow-sm">
        {/* chat messages being mapped for display */}
        {chatMessages.map((message, index) => (
          // outer div for layout control and ensuring chat is scrolled to last message
          <div 
          key={index} 
          ref={index === chatMessages.length - 1 ? lastMessageRef : null}
          className="flex"
          >
   
            {/* div that renders the actual message */}
            <div className={`rounded-lg ${
              message.author.username === "User" ? "text-stone-50" : "text-stone-700"} text-sm`}
            >
              {/* chat author */}
              <span className="font-bold">
                {message.author.username === "Bob" ? "AI: " : "You: "}
              </span>

              {/* use MardownRenderer for AI responses */}
             {message.author.username === 'Bob' ? (
              <span className="text-sm">
                {message?.text?.includes("```") ? (
                  <MarkdownRenderer>{message.text || ""}</MarkdownRenderer>
                ) : (
                  message.text
                )}
              </span>
            ) : (
              <span className="text-sm">{message.text}</span>
            )}
              
            </div>
          </div>
        ))}
        
        {/* Transcribing indicator */}
        {isSpeaking && (
          <div className="flex items-center gap-2 text-stone-600 italic">
            {/* <LoadingSpinner className="w-4 h-4" /> */}
            <SpeakingAnimation />
            <span>Generating text...</span>
          </div>
        )}
      </div>

      {/* Audio Recorder */}
      <div className="mt-6">
        <AudioRecorder 
          handleUserAudio={handleUserAudio}
          isSpeaking={isSpeaking}
        />
      </div>
    </div>
  );
};

export default Chat;








