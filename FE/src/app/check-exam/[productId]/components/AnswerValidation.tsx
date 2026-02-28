"use client";

import React, { useMemo } from "react";
import { AlertTriangle, CheckCircle, XCircle, ArrowRight } from "lucide-react";

interface AnswerValidationProps {
  questions: string[];
}

interface InvalidQuestion {
  index: number; // 0-based
  displayIndex: number; // 1-based (cho hiển thị)
  answerCount: number;
  type: "not_separated" | "wrong_count";
  preview: string; // 30 ký tự đầu của câu hỏi
}

/**
 * Component hiển thị kết quả kiểm tra đáp án ngay sau khi tách.
 * - Liệt kê câu hỏi lỗi (chưa tách hoặc sai số đáp án)
 * - Click vào sẽ scroll tới câu hỏi tương ứng
 */
const AnswerValidation: React.FC<AnswerValidationProps> = ({ questions }) => {
  const { invalidQuestions, validCount } = useMemo(() => {
    const invalid: InvalidQuestion[] = [];

    questions.forEach((q, idx) => {
      const parts = q
        .replace(/#{2,}/g, "#")
        .split("#")
        .map((p) => p.trim())
        .filter((p) => p);

      const answerCount = parts.length - 1;

      if (answerCount !== 4) {
        // Lấy 40 ký tự đầu làm preview
        const firstPart = parts[0] || q;
        const preview =
          firstPart.length > 40
            ? firstPart.substring(0, 40).trim() + "..."
            : firstPart.trim();

        invalid.push({
          index: idx,
          displayIndex: idx + 1,
          answerCount,
          type: answerCount === 0 ? "not_separated" : "wrong_count",
          preview,
        });
      }
    });

    return {
      invalidQuestions: invalid,
      validCount: questions.length - invalid.length,
    };
  }, [questions]);

  // Scroll tới câu hỏi khi click
  const scrollToQuestion = (index: number) => {
    const element = document.getElementById(`question-row-${index}`);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "center" });
      // Highlight tạm thời
      element.classList.add("ring-2", "ring-blue-500", "ring-offset-2");
      setTimeout(() => {
        element.classList.remove("ring-2", "ring-blue-500", "ring-offset-2");
      }, 2000);
    }
  };

  // Nếu chưa có câu hỏi nào, không hiển thị
  if (questions.length === 0) return null;

  // Kiểm tra xem đã tách chưa (ít nhất 1 câu có #)
  const hasSeparated = questions.some((q) => q.includes("#"));
  if (!hasSeparated) return null;

  // Tất cả OK
  if (invalidQuestions.length === 0) {
    return (
      <div className="mt-4 p-4 bg-green-50 border border-green-300 rounded-lg">
        <div className="flex items-center gap-2">
          <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0" />
          <p className="text-green-800 font-medium">
            ✅ Tất cả {questions.length} câu hỏi đều có đúng 4 đáp án. Sẵn sàng
            chuyển sang bước 3.
          </p>
        </div>
      </div>
    );
  }

  // Có lỗi
  const notSeparated = invalidQuestions.filter(
    (q) => q.type === "not_separated",
  );
  const wrongCount = invalidQuestions.filter((q) => q.type === "wrong_count");

  return (
    <div className="mt-4 p-4 bg-red-50 border border-red-300 rounded-lg">
      {/* Header */}
      <div className="flex items-center gap-2 mb-3">
        <AlertTriangle className="h-5 w-5 text-red-600 flex-shrink-0" />
        <div>
          <p className="text-red-800 font-semibold">
            Phát hiện {invalidQuestions.length} câu hỏi có vấn đề
          </p>
          <p className="text-red-600 text-sm">
            {validCount}/{questions.length} câu hợp lệ • Click vào câu để chuyển
            tới vị trí sửa
          </p>
        </div>
      </div>

      {/* Danh sách lỗi */}
      <div className="max-h-48 overflow-y-auto space-y-1">
        {/* Câu chưa tách */}
        {notSeparated.length > 0 && (
          <div className="mb-2">
            <p className="text-xs font-semibold text-red-700 uppercase mb-1">
              ⚠️ Chưa tách đáp án ({notSeparated.length} câu)
            </p>
            {notSeparated.map((q) => (
              <button
                key={q.index}
                onClick={() => scrollToQuestion(q.index)}
                className="w-full text-left px-3 py-1.5 text-sm rounded hover:bg-red-100 transition-colors flex items-center gap-2 group"
              >
                <XCircle className="h-4 w-4 text-yellow-600 flex-shrink-0" />
                <span className="font-medium text-red-800 min-w-[50px]">
                  Câu {q.displayIndex}
                </span>
                <span className="text-red-600 truncate flex-1">
                  {q.preview}
                </span>
                <ArrowRight className="h-3 w-3 text-red-400 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
              </button>
            ))}
          </div>
        )}

        {/* Câu sai số đáp án */}
        {wrongCount.length > 0 && (
          <div>
            <p className="text-xs font-semibold text-red-700 uppercase mb-1">
              ❌ Sai số đáp án ({wrongCount.length} câu)
            </p>
            {wrongCount.map((q) => (
              <button
                key={q.index}
                onClick={() => scrollToQuestion(q.index)}
                className="w-full text-left px-3 py-1.5 text-sm rounded hover:bg-red-100 transition-colors flex items-center gap-2 group"
              >
                <XCircle className="h-4 w-4 text-red-600 flex-shrink-0" />
                <span className="font-medium text-red-800 min-w-[50px]">
                  Câu {q.displayIndex}
                </span>
                <span className="text-red-500 text-xs min-w-[70px]">
                  ({q.answerCount} đáp án)
                </span>
                <span className="text-red-600 truncate flex-1">
                  {q.preview}
                </span>
                <ArrowRight className="h-3 w-3 text-red-400 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AnswerValidation;
