import React, { useState } from "react";
import LoadingSpinner from "./LoadingSpinner";


interface InterviewData {
  jobDescriptionText: string;
  interviewType: string;
  resumeText: string;
}

interface RequestFormProps {
  interviewData: InterviewData;
  setInterviewData: React.Dispatch<React.SetStateAction<InterviewData>>;
  setIsLoading: React.Dispatch<React.SetStateAction<boolean>>;
  isLoading: boolean;

}

const RequestForm = ({ interviewData, setInterviewData, setIsLoading, isLoading, }: RequestFormProps) => {
 
  const { interviewType, jobDescriptionText } = interviewData
  const [jobDescriptionUrl, setJobDescriptionUrl] = useState("");
  const [useManualEntry, setUseManualEntry] = useState(false);

  const isFormValid = interviewType !== "" && jobDescriptionUrl !== "" || jobDescriptionText !== "";  

  

  const readResume = async (pdfFile: File | undefined) => {
 
    if (!pdfFile) return;
     const pdfjs = await import("pdfjs-dist");
    pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

    try {
      // convert pdf file to array buffer
    const arrayBuffer = await pdfFile.arrayBuffer();
    // create pdf extract instance
    const loadingPDF = pdfjs.getDocument(arrayBuffer)

    //  Wait for it to finish loading
    const pdf = await loadingPDF.promise;
    // get the first page
    const page = await pdf.getPage(1);
    // get the text content of the page
    const textContent = await page.getTextContent();
    // get the text from the text content
    const text = textContent.items.map((item: any) => item.str).join(' ');
    console.log('resume text', text)
    setInterviewData(prev => ({
      ...prev,
      resumeText: text
    }));
    } catch(error) {
      console.error('Error reading resume:', error);
    }
  }

   const scrapeJobDescription = async (url: string) => {
    const response = await fetch(`/api/scraper`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ url }),
    });
    const responseData = await response.json();
    console.log('jobDescriptionFromScraper', responseData.textContent)
    setInterviewData(data => ({
      ...data,
      jobDescriptionText: responseData.textContent
    }));
  }


   const handleResumeUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    console.log('Upload clicked'); // Add this
    if (!isFormValid) {
      alert("Please select an interview type first");
      return;
    }

    console.log('clicked on upload resume button')
    // get the file from the event
    const file = event.target.files?.[0];
  
    setIsLoading(true);

    try {
      // read the resume
      await readResume(file);

      // scrape the job description
      if(jobDescriptionUrl) {
        await scrapeJobDescription(jobDescriptionUrl);
      }

    } catch(error) {
      console.error('Error reading resume or scraping job description:', error);
    } finally {
      setIsLoading(false);
    }
  }

  const handleManualJobDescription = (event: React.ChangeEvent<HTMLTextAreaElement>) => {

    const text = event.target.value;
    setInterviewData((prev) => ({...prev, jobDescriptionText: text}))
  }

       return (
    <div className="flex flex-col gap-8 w-full">
   
      <div className="flex flex-col gap-4">
  {/* Toggle Switch */}
  <div className="flex items-center gap-4">
     {/* use url button */}
     <button
        type="button"
        className={`p-2 px-3 rounded-full font-semibold ${!useManualEntry ? 'text-orange-200 bg-orange-600/50' : 'bg-stone-500/30 text-orange-50'} hover:bg-stone-600/30  transition-all duration-300`}
        onClick={() => setUseManualEntry(false)}
      >
            Use URL
          </button>
          {/* paste job description btn */}
          <button
            type="button"
            className={`p-2 px-3 rounded-full font-semibold ${useManualEntry ? 'text-orange-200 bg-orange-600/50' : 'bg-stone-600/20 text-orange-50'} hover:bg-stone-600/30 transition-all duration-300`}
            onClick={() => setUseManualEntry(true)}
          >
            Paste Description
          </button>
  </div>

  {/* Conditional Render - URL or Textarea */}
  {useManualEntry ? (
    <textarea
      className="bg-[#FCF6EF] text-[#706153] text-sm block w-full rounded-lg p-2 h-40 placeholder:text-[#BEA58D] placeholder:text-sm focus:ring-2 focus:ring-stone-600/30 focus:outline-none"
      placeholder="Paste job description here"
      value={jobDescriptionText}
      onChange={handleManualJobDescription}
    />
  ) : (
    <input
      type="url"
      className="bg-[#FCF6EF] text-[#706153] block w-full rounded-lg p-2 placeholder:text-[#BEA58D] placeholder:text-sm focus:ring-2 focus:ring-stone-600/30 focus:outline-none"
      placeholder="Paste job URL here"
      value={jobDescriptionUrl}
      onChange={(e) => setJobDescriptionUrl(e.target.value)}
    />
  )}
</div>
      <div className="flex flex-col gap-1">
        <label htmlFor="interview-type" className="text-[#706153] font-semibold">Interview Type</label>
        <select 
          className="bg-[#FCF6EF] text-[#706153] block w-full rounded-lg p-2 text-sm focus:ring-2 focus:ring-stone-600/30  focus:outline-none"
          name="interview-type"
          value={interviewType} 
          onChange={(e) => setInterviewData(data => ({
          ...data,
          interviewType: e.target.value
        }))}>
          <option value="">Select Interview Type</option>
          <option value="behavioral">Behavioral</option>
          <option value="leetcode">Leetcode</option>
          <option value="project">Project</option>
        </select>
      </div>
    
      <div className={`bg-[rgba(0,0,0,0.1)] backdrop-blur-sm cursor-pointer p-3 text-stone-900/70 font-semibold text-center rounded-full mt-5 
        ${!isFormValid ? 'opacity-50 cursor-not-allowed' : 'hover:bg-[hsla(32,68%,96%,1)]'} transition-all duration-300`}>
        <input 
          type="file" 
          id="file-upload" 
          onChange={handleResumeUpload} 
          accept="application/pdf" 
          hidden 
          disabled={!isFormValid}
        />
        <label htmlFor="file-upload" className={`cursor-pointer w-full flex items-center justify-center gap-8 
          ${!isFormValid ? 'cursor-not-allowed' : ''}`}>
          {isLoading ? (
            <>
              Uploading resume...
              <LoadingSpinner />
            </>
          ) : (
            "Upload Resume"
          )}
        </label>
      </div>
    </div>
  );
};
      
    
export default RequestForm;

   








