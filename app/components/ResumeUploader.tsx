import React, { useState, useEffect } from "react";
import Chat from "./Chat";
import RequestForm from "./RequestForm";
import { fetchOpenAIQuestion } from "../utils/fetchOpenAIQuestion";

const ResumeUploader = () => {
  const [showChat, setShowChat] = useState(false);
  const [initialText, setInitialText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [interviewData, setInterviewData] = useState({
    interviewType: "",
    jobDescriptionText: "",
    resumeText: "",
  });

  useEffect(() => {

 

    const startInterview = async () => {
      if (
      interviewData.resumeText && 
      (interviewData.jobDescriptionText || !isLoading)  
    ) {
        setIsLoading(true);

        const jobDescription = interviewData.jobDescriptionText || "The job description could not be retrieved. Proceeding with resume-driven interview, but first acknowledge the resume and explain that you will be using it to guide the interview since the job description is not available.";
       

        try {
          const messageToSend = `
          Hello, I’m glad to have the opportunity to speak with you today.  Based on your resume, let's start your ${interviewData.interviewType} interview.
          INTERVIEW TYPE: ${interviewData.interviewType} 
          --------
          RESUME: ${interviewData.resumeText}
          ---------
          JOB DESCRIPTION: ${jobDescription}

          ${interviewData.interviewType === 'leetcode' 
            ? 'Please generate coding questions in Markdown format. Use code blocks for code snippets.' 
            : 'Please generate behavioral questions in plain text format with structured formatting for clarity.'}`;

          // Send the message to OpenAI
          const response = await fetchOpenAIQuestion(
            [{ role: "user", content: messageToSend }],
            (message) => setInitialText(message)
          );

          setShowChat(true);
        } catch (error) {
          console.error("Error starting interview", error);
        } finally {
          setIsLoading(false);
        }
      }
    };

    startInterview();
  }, [interviewData.resumeText, interviewData.jobDescriptionText]);

  return (
    <>
      {!showChat && (
        <div className="mx-auto max-w-[600px] mt-10 bg-[rgba(0,0,0,0.05)] backdrop-blur-sm flex flex-col justify-center items-center rounded-lg w-full shadow-sm gap-10 p-6">
          <p className="text-transparent bg-gradient-to-r from-stone-500 via-stone-600 bg-clip-text font-bold text-2xl text-center">
            Fill in the form to start the interview
          </p>
          <RequestForm
            interviewData={interviewData}
            setInterviewData={setInterviewData}
            isLoading={isLoading}
            setIsLoading={setIsLoading}
          />
        </div>
      )}

      {showChat && (
        <div className="w-full max-w-[800px] mx-auto mt-8">
          <p className="text-transparent bg-gradient-to-r from-stone-500 via-stone-600 bg-clip-text font-bold text-2xl text-center">
            {interviewData.interviewType} Interview
          </p>
          <Chat initialText={initialText} interviewData={interviewData} />
        </div>
      )}
    </>
  );
};

export default ResumeUploader;
