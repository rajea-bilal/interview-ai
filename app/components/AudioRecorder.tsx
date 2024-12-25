"use client";

import { ReactMediaRecorder } from "react-media-recorder";
import React, { useState } from "react";
import SpeakingAnimation from "./SpeakingAnimation";


// uses react-media-recorder to record user audio  through the browser
// when user stops recording, component fetches recorded audio blob and pass to handleUserAudio for transcription
interface AudioRecorderProps {
  handleUserAudio: (audioBlob: Blob) => Promise<void>;
  isSpeaking?: boolean;
}

const AudioRecorder: React.FC<AudioRecorderProps> = ({ 
  handleUserAudio, 
  isSpeaking = false 
}) => {

  // temporary url provided by react-media-recorder 
  // url points to the recorded audio stored in the browser's memory
  const onStopRecording = async (blobUrl: string) => {
    try {
      // fetch the audio data from the browser's memory
      const response = await fetch(blobUrl);
      // convert the audio data to a blob
      const audioBlob = await response.blob();

      // send this audio blob to the 
      await handleUserAudio(audioBlob);
    } catch (error) {
      console.error('Error processing audio:', error);
    }
  };

  return (
    <div className="flex flex-col gap-4">
      {isSpeaking && (
        <div className="self-center">
          <SpeakingAnimation />
        </div>
      )}
      
      <ReactMediaRecorder
        audio
        mediaRecorderOptions={{
          mimeType: "audio/webm",
        }}
        onStop={onStopRecording}
        render={({ 
          startRecording, 
          stopRecording, 
          status 
        }) => (
          <div className="flex items-center justify-center gap-4">
            {status === "recording" ? (
              <button
                onClick={stopRecording}
                className="flex items-center gap-2 p-2 px-6 font-semibold rounded-full bg-red-500/20 text-red-600 hover:bg-red-500/30 transition-colors"
              >
                <span className="animate-pulse">●</span> Stop Recording
              </button>
            ) : (
              <button
                onClick={startRecording}
                className="shadow-sm p-2 px-6 font-semibold rounded-full bg-stone-600/10 text-stone-600 hover:bg-stone-600/20 transition-colors"
              >
                Speak
              </button>
            )}
          </div>
        )}
      />
    </div>
  );
};

export default AudioRecorder;
