"use client";

import React, { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Trash2, FileSearch } from "lucide-react";

interface TextInputProps {
  isLoading: boolean;
  value?: string;
  onTextChange?: (text: string) => void;
  onProcessComplete: (questions: string[]) => void;
  onError: (message: string) => void;
}

/**
 * Parse raw text thành danh sách câu hỏi, tự động tách đáp án bằng #.
 *
 * Hỗ trợ nhiều format:
 * - "33. Câu hỏi..."  (số + dấu chấm)
 * - "Câu 33: Câu hỏi..."  (Câu + số + dấu hai chấm)
 * - "Câu 33. Câu hỏi..."  (Câu + số + dấu chấm)
 *
 * Đáp án:
 * - "A. text", "A) text", "A: text", "A text", "A- text"
 */
function extractQuestionsFromRawText(text: string): string[] {
  const lines = text.split("\n");
  const questions: string[] = [];
  let currentQuestion: string[] = [];

  // Pattern nhận diện đầu câu hỏi mới
  // Matches: "33. ", "Câu 33: ", "Câu hỏi 33. ", "33) ", "33: "
  const questionStartPattern = /^(?:Câu\s*(?:hỏi)?\s+)?(\d+)\s*[\.\:\)]\s*/i;

  // Pattern nhận diện đáp án (đầu dòng)
  const answerPattern = /^([A-D])\s*[\.\)\:\-]\s*/;

  for (const line of lines) {
    const trimmedLine = line.trim();

    // Dòng trống - bỏ qua nhưng KHÔNG kết thúc câu hỏi
    // (câu hỏi kết thúc khi gặp câu hỏi mới)
    if (trimmedLine === "") continue;

    // Kiểm tra có phải đầu câu hỏi mới không
    const questionMatch = trimmedLine.match(questionStartPattern);

    if (questionMatch) {
      // Lưu câu hỏi trước đó (nếu có)
      if (currentQuestion.length > 0) {
        questions.push(buildQuestionString(currentQuestion));
      }

      // Bắt đầu câu hỏi mới - xóa prefix số
      const questionText = trimmedLine.replace(questionStartPattern, "").trim();
      currentQuestion = [questionText];
      continue;
    }

    // Kiểm tra có phải đáp án không
    const answerMatch = trimmedLine.match(answerPattern);

    if (answerMatch && currentQuestion.length > 0) {
      // Đây là đáp án → thêm vào câu hỏi hiện tại với marker
      currentQuestion.push("# " + trimmedLine);
      continue;
    }

    // Dòng thường - nối vào câu hỏi hiện tại
    if (currentQuestion.length > 0) {
      // Kiểm tra xem dòng cuối cùng có phải là đáp án không
      const lastLine = currentQuestion[currentQuestion.length - 1];
      if (lastLine.startsWith("# ")) {
        // Dòng tiếp theo của đáp án (đáp án dài nhiều dòng)
        currentQuestion[currentQuestion.length - 1] += " " + trimmedLine;
      } else {
        // Dòng tiếp theo của câu hỏi
        currentQuestion[currentQuestion.length - 1] += " " + trimmedLine;
      }
    }
  }

  // Flush câu hỏi cuối cùng
  if (currentQuestion.length > 0) {
    questions.push(buildQuestionString(currentQuestion));
  }

  return questions;
}

/**
 * Ghép các phần (câu hỏi + đáp án) thành 1 chuỗi với delimiter #
 */
function buildQuestionString(parts: string[]): string {
  // parts[0] = câu hỏi, phần còn lại đã có "# " prefix
  return parts.join(" ").trim();
}

const TextInput: React.FC<TextInputProps> = ({
  isLoading,
  value: controlledValue,
  onTextChange,
  onProcessComplete,
  onError,
}) => {
  const [localText, setLocalText] = useState("");
  const text = controlledValue !== undefined ? controlledValue : localText;
  const setText = (val: string) => {
    if (onTextChange) onTextChange(val);
    else setLocalText(val);
  };

  // Đếm thông tin realtime
  const stats = useMemo(() => {
    if (!text.trim()) {
      return { lines: 0, chars: 0, estimatedQuestions: 0 };
    }

    const lines = text.split("\n").filter((l) => l.trim()).length;
    const chars = text.length;

    // Đếm số câu hỏi dự kiến
    const questionPattern = /^(?:Câu\s*(?:hỏi)?\s+)?\d+\s*[\.\:\)]\s*/gim;
    const matches = text.match(questionPattern);
    const estimatedQuestions = matches ? matches.length : 0;

    return { lines, chars, estimatedQuestions };
  }, [text]);

  const handleProcess = () => {
    if (!text.trim()) {
      onError("Vui lòng nhập nội dung câu hỏi.");
      return;
    }

    const questions = extractQuestionsFromRawText(text);

    if (questions.length === 0) {
      onError(
        "Không tìm thấy câu hỏi nào. Vui lòng kiểm tra định dạng (ví dụ: 1. Câu hỏi...)",
      );
      return;
    }

    onProcessComplete(questions);
  };

  const handleClear = () => {
    setText("");
  };

  return (
    <div className="space-y-4">
      {/* Textarea */}
      <div className="relative">
        <textarea
          id="text-input-area"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={`Dán nội dung câu hỏi vào đây...

Ví dụ:
1. Một trong những đặc trưng của xã hội...
A. Có nhà nước xã hội chủ nghĩa...
B. Có nhà nước pháp quyền...
C. Có nhà nước pháp quyền...
D. Có nhà nước pháp quyền...

2. Trong các yếu tố cấu thành ý thức...
A. Ý chí
B. Nghị lực
C. Tri thức
D. Tình cảm`}
          className="w-full min-h-[300px] p-4 border-2 border-gray-300 rounded-lg 
            focus:border-blue-500 focus:ring-2 focus:ring-blue-200 
            transition-colors duration-200 resize-y font-mono text-sm 
            leading-relaxed placeholder:text-gray-400"
          disabled={isLoading}
        />

        {/* Nút xóa */}
        {text.length > 0 && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute top-3 right-3 p-1.5 text-gray-400 hover:text-red-500 
              hover:bg-red-50 rounded-md transition-colors"
            title="Xóa nội dung"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Stats bar */}
      <div className="flex items-center justify-between text-xs text-gray-500 px-1">
        <div className="flex gap-4">
          <span>{stats.chars.toLocaleString()} ký tự</span>
          <span>{stats.lines} dòng</span>
        </div>
        {stats.estimatedQuestions > 0 && (
          <span className="text-blue-600 font-medium">
            ~{stats.estimatedQuestions} câu hỏi phát hiện
          </span>
        )}
      </div>

      {/* Nút xử lý */}
      <div className="flex justify-center">
        <Button
          id="process-text-btn"
          variant="default"
          className="bg-blue-600 hover:bg-blue-700 px-6"
          disabled={!text.trim() || isLoading}
          onClick={handleProcess}
        >
          {isLoading ? (
            <span className="flex items-center gap-2">
              <svg
                className="animate-spin h-4 w-4 text-white"
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
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
              Đang xử lý...
            </span>
          ) : (
            <span className="flex items-center gap-2">
              <FileSearch className="h-4 w-4" />
              Xử lý Text ({stats.estimatedQuestions} câu)
            </span>
          )}
        </Button>
      </div>
    </div>
  );
};

export default TextInput;
