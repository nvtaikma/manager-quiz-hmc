"use client";

import React from "react";
import { Button } from "@/components/ui/button";

interface AnswerSeparatorProps {
  questions: string[];
  isLoading: boolean;
  onSeparateComplete: (processedQuestions: string[]) => void;
}

const AnswerSeparator: React.FC<AnswerSeparatorProps> = ({
  questions,
  isLoading,
  onSeparateComplete,
}) => {
  // Tách đáp án từ câu hỏi
  const separateAnswers = () => {
    if (questions.length === 0) return;

    console.log("Bắt đầu tách đáp án...");
    console.log("Câu hỏi trước khi tách:", questions[0]);

    // Cải thiện regex để bắt nhiều định dạng đáp án khác nhau
    const processedQuestions = questions.map((q) => {
      // Thử nhiều mẫu regex khác nhau để tách đáp án
      let processed = q;

      // Mẫu 1: Dựa trên index_2.html - cách chính xác
      processed = processed.replace(/([\s:])(►?\s*[A-D])(\s)/g, "$1 # $2$3");

      // Mẫu 2: Đáp án có dấu chấm sau chữ cái
      processed = processed.replace(/(\n|\s+|:)([A-D]\.\s)/g, "$1 # $2");

      // Mẫu 3: Đáp án có dấu ngoặc đơn sau chữ cái
      processed = processed.replace(/(\n|\s+|:)([A-D]\)\s)/g, "$1 # $2");

      // Mẫu 4: Đáp án có dấu hai chấm sau chữ cái
      processed = processed.replace(/(\n|\s+)([A-D]:\s)/g, "$1 # $2");

      // Mẫu 5: Đáp án có ký hiệu đặc biệt ►
      processed = processed.replace(/(\n|\s+|:)(►\s*[A-D][\.\s])/g, "$1 # $2");

      // Mẫu 6: Đáp án dạng A B C D không có dấu chấm
      processed = processed.replace(/(\n|\s+)([A-D])(\s+[^A-D])/g, "$1 # $2$3");

      // Mẫu 7: Đáp án dạng A- B- C- D-
      processed = processed.replace(/(\n|\s+)([A-D]\-\s)/g, "$1 # $2");

      // Chuẩn hóa khoảng trắng xung quanh dấu #
      processed = processed.replace(/\s+#\s+/g, " # ");

      return processed;
    });

    console.log("Câu hỏi sau khi tách:", processedQuestions[0]);

    // Kiểm tra xem có đáp án nào được tách không
    const hasMarkers = processedQuestions.some((q) => q.includes(" # "));

    if (!hasMarkers) {
      console.log(
        "Không tìm thấy đáp án để tách bằng regex thông thường, thử phương pháp khác..."
      );

      // Thử phương pháp khác: Tách theo dòng và tìm các dòng bắt đầu bằng A, B, C, D
      const newProcessedQuestions = questions.map((q) => {
        const lines = q.split("\n");
        const processedLines = lines.map((line) => {
          const trimmedLine = line.trim();
          // Kiểm tra nếu dòng bắt đầu bằng A, B, C, D và theo sau là dấu chấm, dấu hai chấm, dấu gạch ngang hoặc dấu ngoặc
          if (
            /^[A-D][\.\:\)\-]/.test(trimmedLine) ||
            /^[A-D]\s/.test(trimmedLine) ||
            /^►\s*[A-D]/.test(trimmedLine)
          ) {
            return " # " + trimmedLine;
          }
          return line;
        });
        return processedLines.join("\n");
      });

      console.log("Sau khi thử phương pháp khác:", newProcessedQuestions[0]);

      // Kiểm tra lại xem có đáp án nào được tách không
      const hasNewMarkers = newProcessedQuestions.some((q) =>
        q.includes(" # ")
      );

      if (hasNewMarkers) {
        // Nếu phương pháp mới hoạt động tốt hơn, sử dụng kết quả mới
        onSeparateComplete(normalizeHashMarkers(newProcessedQuestions));
      } else {
        // Nếu không, vẫn sử dụng kết quả cũ
        onSeparateComplete(normalizeHashMarkers(processedQuestions));
      }
    } else {
      // Sử dụng kết quả đã tách thành công
      onSeparateComplete(normalizeHashMarkers(processedQuestions));
    }
  };

  // Chuẩn hóa các dấu ## thành # trên các câu hỏi
  const normalizeHashMarkers = (questions: string[]): string[] => {
    return questions.map((q) => {
      // Chuẩn hóa tất cả các dấu ## thành #
      let normalized = q.replace(/#{2,}/g, "#");
      // Đảm bảo có khoảng trắng xung quanh dấu #
      normalized = normalized.replace(/(\S)#(\S)/g, "$1 # $2");
      normalized = normalized.replace(/(\S)#(\s)/g, "$1 # $2");
      normalized = normalized.replace(/(\s)#(\S)/g, "$1 # $2");
      return normalized;
    });
  };

  return (
    <Button
      id="replace-btn"
      variant="default"
      className="bg-purple-600"
      disabled={questions.length === 0 || isLoading}
      onClick={separateAnswers}
    >
      {isLoading ? (
        <span className="flex items-center">
          <svg
            className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
          Đang tách...
        </span>
      ) : (
        "Tách đáp án (#)"
      )}
    </Button>
  );
};

export default AnswerSeparator;
