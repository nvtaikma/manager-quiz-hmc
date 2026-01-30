"use client";

import React from "react";
import { AlertTriangle } from "lucide-react";

interface QuizPreviewProps {
  questionText: string;
  index: number;
}

const QuizPreview: React.FC<QuizPreviewProps> = ({ questionText, index }) => {
  // Chuẩn hóa câu hỏi trước khi phân tích
  let normalizedText = questionText.replace(/#{2,}/g, "#");
  normalizedText = normalizedText.replace(/(\S)#(\S)/g, "$1 # $2");
  normalizedText = normalizedText.replace(/(\S)#(\s)/g, "$1 # $2");
  normalizedText = normalizedText.replace(/(\s)#(\S)/g, "$1 # $2");

  const parts = normalizedText
    .split("#")
    .map((p) => p.trim())
    .filter((p) => p);

  if (parts.length < 2) {
    return (
      <div
        className="p-4 border border-gray-300 rounded-lg bg-white min-h-[150px]"
        data-preview-for={index}
      >
        {normalizedText}
      </div>
    );
  }

  const [questionContent, ...answers] = parts;

  // Kiểm tra số đáp án
  const answerCount = answers.length;
  const isInvalidAnswerCount = answerCount !== 4;

  // Determine border color and background based on answer count
  const containerClasses = isInvalidAnswerCount
    ? "p-4 border-2 border-red-500 rounded-lg bg-red-50 min-h-[150px]"
    : "p-4 border border-gray-300 rounded-lg bg-white min-h-[150px]";

  return (
    <div className={containerClasses} data-preview-for={index}>
      {/* Hiển thị cảnh báo nếu số đáp án không hợp lệ */}
      {isInvalidAnswerCount && (
        <div className="mb-3 p-3 bg-red-100 border border-red-300 rounded-md">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-red-600" />
            <div>
              <p className="text-red-800 font-semibold text-sm">
                Định dạng không hợp lệ
              </p>
              <p className="text-red-700 text-sm">
                Câu hỏi trắc nghiệm phải có đúng 4 đáp án. Hiện có {answerCount}{" "}
                đáp án.
              </p>
              <p className="text-red-600 text-xs mt-1">
                Vui lòng điều chỉnh ở cột &quot;Câu hỏi gốc&quot; bên trái.
              </p>
            </div>
          </div>
        </div>
      )}

      <p className="font-semibold mb-3">{questionContent}</p>
      <div className="space-y-2">
        {answers.map((answerText, idx) => {
          const isCorrect = answerText.includes("►");
          const cleanAnswer = answerText.replace("►", "").trim();
          const letter = cleanAnswer.charAt(0);
          const answerContent = cleanAnswer.substring(1).trim();

          return (
            <div
              key={idx}
              className={`ml-4 py-1 px-2 rounded ${
                isCorrect ? "bg-green-50 border border-green-300" : ""
              }`}
            >
              <span className={isCorrect ? "font-bold text-green-700" : ""}>
                {letter}.
              </span>{" "}
              <span className={isCorrect ? "font-semibold text-green-700" : ""}>
                {answerContent}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default QuizPreview;
