"use client";

import React from "react";

interface Step {
  id: number;
  name: string;
}

interface StepsIndicatorProps {
  steps: Step[];
  currentStep: number;
}

const StepsIndicator: React.FC<StepsIndicatorProps> = ({
  steps,
  currentStep,
}) => {
  return (
    <div className="flex justify-center items-center mb-6">
      <ol className="flex items-center w-full">
        {steps.map((step) => (
          <li
            key={step.id}
            className={`flex items-center ${
              step.id !== steps.length ? "w-full" : ""
            }`}
          >
            <div
              className={`flex items-center justify-center w-10 h-10 rounded-full 
              ${
                currentStep === step.id
                  ? "bg-blue-600 text-white step-active"
                  : currentStep > step.id
                  ? "bg-green-500 text-white"
                  : "bg-gray-200 text-gray-600"
              }`}
            >
              {currentStep > step.id ? (
                <svg
                  className="w-5 h-5"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
              ) : (
                step.id
              )}
            </div>
            <span
              className={`ml-2 text-sm font-medium ${
                currentStep === step.id
                  ? "text-blue-600"
                  : currentStep > step.id
                  ? "text-green-500"
                  : "text-gray-500"
              }`}
            >
              {step.name}
            </span>
            {step.id !== steps.length && (
              <div
                className={`flex-1 h-0.5 mx-4 ${
                  currentStep > step.id ? "bg-green-500" : "bg-gray-200"
                }`}
              ></div>
            )}
          </li>
        ))}
      </ol>
    </div>
  );
};

export default StepsIndicator;
