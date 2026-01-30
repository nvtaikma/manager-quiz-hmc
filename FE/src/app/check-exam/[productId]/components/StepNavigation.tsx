"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight } from "lucide-react";
import StepsIndicator from "./StepsIndicator";

interface Step {
  id: number;
  name: string;
}

interface StepNavigationProps {
  steps: Step[];
  currentStep: number;
  canGoBack: boolean;
  canGoForward: boolean;
  onGoBack: () => void;
  onGoForward: () => void;
  nextStepLabel?: string;
  backStepLabel?: string;
}

const StepNavigation: React.FC<StepNavigationProps> = ({
  steps,
  currentStep,
  canGoBack,
  canGoForward,
  onGoBack,
  onGoForward,
  nextStepLabel = "Tiếp theo",
  backStepLabel = "Quay lại",
}) => {
  const nextStep = steps.find((step) => step.id === currentStep + 1);

  return (
    <div className="mb-8">
      {/* Step Indicator */}
      <StepsIndicator steps={steps} currentStep={currentStep} />

      {/* Navigation Buttons */}
      <div className="mt-6 flex justify-between">
        <Button
          variant="outline"
          onClick={onGoBack}
          disabled={!canGoBack}
          className="flex items-center gap-1"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>{backStepLabel}</span>
        </Button>

        {canGoForward && nextStep && (
          <Button
            variant="default"
            onClick={onGoForward}
            className="flex items-center gap-1 bg-blue-600"
          >
            <span>
              {nextStepLabel || `Đến bước ${nextStep.id}: ${nextStep.name}`}
            </span>
            <ArrowRight className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  );
};

export default StepNavigation;
