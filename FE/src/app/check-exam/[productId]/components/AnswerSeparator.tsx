"use client";

import React from "react";
import { Button } from "@/components/ui/button";

interface AnswerSeparatorProps {
  questions: string[];
  isLoading: boolean;
  onSeparateComplete: (processedQuestions: string[]) => void;
}

/**
 * Kiểm tra xem một vị trí có phải là answer marker hợp lệ không.
 * Answer marker hợp lệ khi:
 * 1. Đứng đầu dòng (cho phép whitespace trước)
 * 2. Hoặc đứng SAU dấu : hoặc ? (phần tách câu hỏi và đáp án)
 * 3. KHÔNG phải giữa một từ/cụm từ (ví dụ "Vitamin C", "Người bệnh B")
 */
function findAnswerPositions(
  text: string,
): { letter: string; index: number }[] {
  const positions: { letter: string; index: number }[] = [];

  // Strategy 1: Tìm đáp án đầu dòng với các format phổ biến
  // Patterns: "A. text", "A) text", "A: text", "A text", "A- text", "►A text"
  // Cho phép đáp án bắt đầu bằng số (ví dụ: "A 7 ngày")
  const lineStartPattern =
    /^[ \t]*(►?\s*[A-D])(?:\s*[\.\)\:\-]\s*|\s+)(?=\S)/gm;

  let match;
  while ((match = lineStartPattern.exec(text)) !== null) {
    const letter = match[1].replace("►", "").trim();
    positions.push({ letter, index: match.index });
  }

  return positions;
}

/**
 * Kiểm tra tính hợp lệ của bộ đáp án:
 * - Phải có ít nhất 3 đáp án
 * - Phải theo thứ tự A → B → C → D
 * - Phải xuất hiện SAU phần câu hỏi
 */
function validateAnswerSet(
  positions: { letter: string; index: number }[],
  questionText: string,
): { letter: string; index: number }[] {
  if (positions.length < 3) return [];

  // Tìm vị trí kết thúc câu hỏi (sau dấu : hoặc ?)
  let questionEndIndex = 0;

  // Ưu tiên 1: Tìm dấu : hoặc ? cuối cùng trước đáp án đầu tiên
  const firstPos = positions[0]?.index ?? questionText.length;
  const beforeFirst = questionText.substring(0, firstPos);
  const lastColon = Math.max(
    beforeFirst.lastIndexOf(":"),
    beforeFirst.lastIndexOf("?"),
  );
  if (lastColon >= 0) {
    questionEndIndex = lastColon;
  } else {
    // Ưu tiên 2: Nếu không có : hay ?, dùng vị trí đáp án đầu tiên
    // (Câu hỏi kết thúc ngay trước đáp án A)
    questionEndIndex = 0; // Cho phép tất cả positions
  }

  // Chỉ lấy các đáp án XUẤT HIỆN SAU phần câu hỏi
  const validPositions = positions.filter((p) => p.index >= questionEndIndex);

  // Kiểm tra thứ tự A → B → C → D
  const expectedOrder = ["A", "B", "C", "D"];
  const orderedPositions: { letter: string; index: number }[] = [];
  let lastIdx = -1;
  let nextExpected = 0;

  for (const pos of validPositions) {
    const orderIdx = expectedOrder.indexOf(pos.letter);
    if (orderIdx >= nextExpected && pos.index > lastIdx) {
      orderedPositions.push(pos);
      lastIdx = pos.index;
      nextExpected = orderIdx + 1;
    }
  }

  // Phải có ít nhất 3 đáp án đúng thứ tự
  if (orderedPositions.length >= 3) {
    return orderedPositions;
  }

  return [];
}

/**
 * Tách đáp án thông minh - Context-aware Answer Detection
 * Thay vì regex tham lam bắt mọi A/B/C/D,
 * chỉ tách khi phát hiện BỘ ĐÁP ÁN HOÀN CHỈNH (≥3 đáp án, đúng thứ tự, đúng vị trí)
 */
function smartSeparateAnswers(questionText: string): string {
  // Bước 1: Tìm các vị trí đáp án tiềm năng
  const positions = findAnswerPositions(questionText);

  // Bước 2: Validate - chỉ giữ bộ đáp án hợp lệ
  const validAnswers = validateAnswerSet(positions, questionText);

  if (validAnswers.length === 0) {
    // Không tìm thấy bộ đáp án hợp lệ → trả về nguyên bản
    return questionText;
  }

  // Bước 3: Chèn dấu # trước mỗi đáp án đã validate
  // Sắp xếp theo index giảm dần để chèn từ cuối lên đầu (tránh lệch index)
  const sortedAnswers = [...validAnswers].sort((a, b) => b.index - a.index);

  let result = questionText;
  for (const answer of sortedAnswers) {
    // Tìm vị trí chính xác của ký tự A/B/C/D trong text
    // Chèn " # " trước nó
    const before = result.substring(0, answer.index).trimEnd();
    const after = result.substring(answer.index);
    result = before + " # " + after;
  }

  return result;
}

const AnswerSeparator: React.FC<AnswerSeparatorProps> = ({
  questions,
  isLoading,
  onSeparateComplete,
}) => {
  // Tách đáp án từ câu hỏi - sử dụng Context-aware Detection
  const separateAnswers = () => {
    if (questions.length === 0) return;

    const processedQuestions = questions.map((q) => {
      return smartSeparateAnswers(q);
    });

    // Kiểm tra xem có đáp án nào được tách không
    const hasMarkers = processedQuestions.some((q) => q.includes(" # "));

    if (!hasMarkers) {
      // Fallback: thử tách theo dòng (dòng bắt đầu bằng A/B/C/D)
      const fallbackProcessed = questions.map((q) => {
        const lines = q.split("\n");
        const answerLines: number[] = [];

        // Tìm các dòng bắt đầu bằng A, B, C, D
        lines.forEach((line, idx) => {
          const trimmed = line.trim();
          if (
            /^[A-D][\.\:\)\-]\s/.test(trimmed) ||
            /^►\s*[A-D]/.test(trimmed)
          ) {
            answerLines.push(idx);
          }
        });

        // Chỉ tách nếu tìm được >= 3 dòng đáp án
        if (answerLines.length >= 3) {
          const processedLines = lines.map((line, idx) => {
            if (answerLines.includes(idx)) {
              return " # " + line.trim();
            }
            return line;
          });
          return processedLines.join("\n");
        }

        // Fallback cuối: tìm pattern "A text B text C text D text" inline
        return inlineFallbackSeparation(q);
      });

      onSeparateComplete(normalizeHashMarkers(fallbackProcessed));
    } else {
      onSeparateComplete(normalizeHashMarkers(processedQuestions));
    }
  };

  /**
   * Fallback cuối cùng: tách đáp án inline khi chúng nằm trên 1 dòng
   * Chỉ tách khi tìm được ĐỦ BỘ 4 đáp án A, B, C, D theo thứ tự
   */
  const inlineFallbackSeparation = (text: string): string => {
    // Tìm vị trí dấu : hoặc ? cuối cùng (kết thúc phần câu hỏi)
    const questionEndPatterns = [
      /:\s*(?=[A-D]\s)/, // : theo sau bởi A-D
      /\?\s*(?=[A-D]\s)/, // ? theo sau bởi A-D
    ];

    let questionEndIndex = -1;
    for (const pattern of questionEndPatterns) {
      const match = text.match(pattern);
      if (match && match.index !== undefined) {
        questionEndIndex = Math.max(
          questionEndIndex,
          match.index + match[0].length,
        );
      }
    }

    if (questionEndIndex === -1) {
      // Thử tìm : hoặc ? cuối cùng
      const lastSep = Math.max(text.lastIndexOf(":"), text.lastIndexOf("?"));
      if (lastSep > text.length * 0.3) {
        // Chỉ dùng nếu nằm sau 30% đầu text (tránh nhầm : trong câu hỏi)
        questionEndIndex = lastSep + 1;
      }
    }

    if (questionEndIndex === -1) return text;

    const questionPart = text.substring(0, questionEndIndex);
    const answerPart = text.substring(questionEndIndex);

    // Tìm 4 đáp án A, B, C, D trong phần answer theo thứ tự
    const answerPattern = /(?:^|\s)(►?\s*[A-D])(?:\s*[\.\)\:\-]\s*|\s+)/g;
    const answers: {
      letter: string;
      index: number;
      fullMatchLength: number;
    }[] = [];

    let m;
    while ((m = answerPattern.exec(answerPart)) !== null) {
      const letter = m[1].replace("►", "").trim();
      answers.push({
        letter,
        index: m.index,
        fullMatchLength: m[0].length,
      });
    }

    // Validate: cần ít nhất 3 đáp án đúng thứ tự
    const expectedOrder = ["A", "B", "C", "D"];
    const validAnswers: typeof answers = [];
    let nextExpected = 0;

    for (const ans of answers) {
      const orderIdx = expectedOrder.indexOf(ans.letter);
      if (orderIdx >= nextExpected) {
        validAnswers.push(ans);
        nextExpected = orderIdx + 1;
      }
    }

    if (validAnswers.length < 3) return text;

    // Chèn # trước mỗi đáp án (từ cuối lên đầu)
    let processedAnswerPart = answerPart;
    for (let i = validAnswers.length - 1; i >= 0; i--) {
      const ans = validAnswers[i];
      const before = processedAnswerPart.substring(0, ans.index).trimEnd();
      const after = processedAnswerPart.substring(ans.index);
      processedAnswerPart = before + " # " + after.trimStart();
    }

    return questionPart + processedAnswerPart;
  };

  // Chuẩn hóa các dấu ## thành # trên các câu hỏi
  const normalizeHashMarkers = (questions: string[]): string[] => {
    return questions.map((q) => {
      // Chuẩn hóa tất cả các dấu ## thành #
      let normalized = q.replace(/#{2,}/g, "#");
      // Đảm bảo có khoảng trắng xung quanh dấu #
      normalized = normalized.replace(/(\S)#(\S)/g, "$1 # $2");
      normalized = normalized.replace(/(\S)#(\s)/g, "$1 #$2");
      normalized = normalized.replace(/(\s)#(\S)/g, "$1# $2");
      // Chuẩn hóa " #" hoặc "# " thành " # "
      normalized = normalized.replace(/\s*#\s*/g, " # ");
      // Xóa # ở đầu chuỗi nếu có
      normalized = normalized.replace(/^\s*#\s*/, "");
      return normalized.trim();
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
