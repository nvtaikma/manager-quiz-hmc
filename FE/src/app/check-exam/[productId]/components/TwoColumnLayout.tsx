"use client";

import React, { useEffect, useRef } from "react";
import QuestionEditor from "./QuestionEditor";
import QuizPreview from "./QuizPreview";

interface TwoColumnLayoutProps {
  questions: string[];
  onQuestionsChange: (questions: string[]) => void;
}

const TwoColumnLayout: React.FC<TwoColumnLayoutProps> = ({
  questions,
  onQuestionsChange,
}) => {
  // Xử lý khi người dùng thay đổi câu hỏi
  const handleQuestionChange = (index: number, newValue: string) => {
    const updatedQuestions = [...questions];
    updatedQuestions[index] = newValue;
    onQuestionsChange(updatedQuestions);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between px-1 py-2 bg-gray-100 rounded">
        <h3 className="text-lg font-semibold w-1/2 text-center">
          Câu hỏi gốc (có thể chỉnh sửa)
        </h3>
        <h3 className="text-lg font-semibold w-1/2 text-center">
          Dạng trắc nghiệm
        </h3>
      </div>

      {questions.map((question, index) => (
        <div key={index} className="flex gap-6 border-b pb-6">
          <div className="w-1/2">
            <QuestionEditor
              question={question}
              index={index}
              onQuestionChange={handleQuestionChange}
            />
          </div>
          <div className="w-1/2">
            <QuizPreview questionText={question} index={index} />
          </div>
        </div>
      ))}
    </div>
  );
};

export default TwoColumnLayout;
