import React, { useState, useEffect } from "react";
import Chat from "./Chat";

import RequestForm from "./RequestForm";
import { fetchOpenAIQuestion } from "../utils/fetchOpenAIQuestion";



const ResumeUploader = () => {
  const [showChat, setShowChat] = useState(false);
  const [initialText,setInitialText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [interviewData, setInterviewData] = useState({
    interviewType: "",
    jobDescriptionText: "",
    resumeText: "",
  });


 useEffect(() => {
  console.log("Checking effect trigger");
  console.log("Resume Text:", interviewData.resumeText);
  console.log("Interview Type:", interviewData.interviewType);
  console.log("Job Description:", interviewData.jobDescriptionText);

  const startInterview = async () => {
    if (interviewData.resumeText && interviewData.jobDescriptionText) {
      setIsLoading(true);

      try {
        const messageToSend = `
        INTERVIEW TYPE: ${interviewData.interviewType} 
        --------
        RESUME: ${interviewData.resumeText}
        ---------
        JOB DESCRIPTION: ${interviewData.jobDescriptionText}

        ${interviewData.interviewType === 'leetcode' ? 
      'Please generate coding questions in Markdown format. Use code blocks for code snippets' : 
      'Please generate behavioral questions in plain text with structured formatting for clarity, but no need for code blocks.'}`;

        const response = await fetchOpenAIQuestion(
          [{ role: "user", content: messageToSend}], 
          (message) => setInitialText(message)
        );

        setShowChat(true);
      } catch (error) {
        console.error('Error starting interview', error);
      } finally {
        setIsLoading(false);
      }
    }
  };

  startInterview();
}, [interviewData]);

  return (
    <>
    {!showChat && (
       <div className="mx-auto max-w-[400px] md:max-w-[550px] lg:max-w-[600px]mt-6 bg-[rgba(0,0,0,0.05)] backdrop-blur-sm flex flex-col justify-center items-center rounded-lg w-full shadow-sm gap-10 p-4 md:p-6 mt-10">
      <p className="text-transparent bg-gradient-to-r from-stone-500 via-stone-600 bg-clip-text animate-shine bg-[length:200%_100%] font-bold text-2xl md:text-2xl text-center leading-snug md:leading-[2.5rem]">
       Fill in the form to start the interview
      </p>
      {!showChat ? (
        <>
          <RequestForm 
          interviewData={interviewData} 
          setInterviewData={setInterviewData} 
          isLoading={isLoading}
          setIsLoading={setIsLoading}
          />
       
        </>
      ) : null }
      </div>
    )}
   
       {showChat && (
         <div className="w-full max-w-[500px] md:max-w-[700px] lg:max-w-[800px] mx-auto mt-8">
          <p className="mb-4 text-transparent bg-gradient-to-r from-stone-500 via-stone-600 bg-clip-text animate-shine bg-[length:200%_100%] font-bold text-2xl md:text-2xl text-center leading-snug md:leading-[2.5rem]">
            {interviewData.interviewType} Interview
          </p>
        <Chat 
          initialText={initialText}
          interviewData={interviewData}
        /> 
        </div>
      )}
    </>
  );
};

  
 


       
       
          

export default ResumeUploader;
