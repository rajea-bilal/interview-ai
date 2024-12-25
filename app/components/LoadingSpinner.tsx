import React from "react";

interface LoadingSpinnerProps {
  className?: string;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ className }) => {
  return (
    <div className={`flex justify-center items-center ${className || ''}`}>
      <div
        className="w-8 h-8 border-4 border-solid border-[hsl(30,65%,60%)] border-4 border-t-[#FCF6EF] rounded-full animate-spin"
        role="status"
        aria-label="loading"
      ></div>
    </div>
  );
};

export default LoadingSpinner;
