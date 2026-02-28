"use client";

import React from "react";
import { Button } from "@/components/ui/button";

/**
 * Extended TextItem interface bao gồm position data từ PDF.js
 */
interface PdfTextItem {
  str: string;
  dir: string;
  width: number;
  height: number;
  transform: number[];
  fontName: string;
  hasEOL: boolean;
}

interface QuestionExtractorProps {
  pdfFiles: FileList | null;
  pdfLoaded: boolean;
  isLoading: boolean;
  onProcessStart: () => void;
  onProcessComplete: (extractedQuestions: string[]) => void;
  onError: (error: string) => void;
}

/**
 * Chuẩn hóa text tiếng Việt - sửa lỗi tách dấu (BẢO THỦ)
 * CHỈ merge khi phần trước là ký tự đơn lẻ (1-3 chars, không chứa nguyên âm)
 * KHÔNG merge khi phần trước là 1 âm tiết hoàn chỉnh (có nguyên âm rồi)
 */
function normalizeVietnameseText(text: string): string {
  const allVietnameseVowels =
    "aàáảãạăắằẳẵặâấầẩẫậeèéẻẽẹêếềểễệiìíỉĩịoòóỏõọôốồổỗộơớờởỡợuùúủũụưứừửữựyỳýỷỹỵ";
  const allVietnameseUpperVowels =
    "AÀÁẢÃẠĂẮẰẲẴẶÂẤẦẨẪẬEÈÉẺẼẸÊẾỀỂỄỆIÌÍỈĨỊOÒÓỎÕỌÔỐỒỔỖỘƠỚỜỞỠỢUÙÚỦŨỤƯỨỪỬỮỰYỲÝỶỸỴ";
  const vietnameseDiacriticVowels =
    "àáảãạăắằẳẵặâấầẩẫậèéẻẽẹêếềểễệìíỉĩịòóỏõọôốồổỗộơớờởỡợùúủũụưứừửữựỳýỷỹỵ";
  const vietnameseUpperDiacriticVowels =
    "ÀÁẢÃẠĂẮẰẲẴẶÂẤẦẨẪẬÈÉẺẼẸÊẾỀỂỄỆÌÍỈĨỊÒÓỎÕỌÔỐỒỔỖỘƠỚỜỞỠỢÙÚỦŨỤƯỨỪỬỮỰỲÝỶỸỴ";

  const containsVowel = (s: string): boolean => {
    for (const c of s) {
      if (
        allVietnameseVowels.includes(c) ||
        allVietnameseUpperVowels.includes(c)
      ) {
        return true;
      }
    }
    return false;
  };

  let result = text;

  // Pattern 1: (từ) + space + (nguyên âm có dấu + phần còn lại)
  // CHỈ nối nếu phần trước KHÔNG chứa nguyên âm VÀ ngắn (1-3 ký tự)
  const diacriticVowelChars = `${vietnameseDiacriticVowels}${vietnameseUpperDiacriticVowels}`;
  const allVowelChars = `${allVietnameseVowels}${allVietnameseUpperVowels}`;

  const splitWordPattern = new RegExp(
    `(\\S+) ([${diacriticVowelChars}][a-zA-Z${allVowelChars}đĐ]*)`,
    "g",
  );
  result = result.replace(splitWordPattern, (match, before, after) => {
    if (!containsVowel(before) && before.length <= 3) {
      return before + after;
    }
    return match;
  });

  // Pattern 2: Nguyên âm có dấu + space + phụ âm cuối đơn lẻ (1-2 ký tự, không chứa nguyên âm)
  const vowelEndPattern = new RegExp(
    `([${diacriticVowelChars}]) ([a-zA-ZđĐ]{1,2})(?=\\s|[^a-zA-Z${allVowelChars}đĐ]|$)`,
    "g",
  );
  result = result.replace(vowelEndPattern, (match, vowel, ending) => {
    if (!containsVowel(ending)) {
      return vowel + ending;
    }
    return match;
  });

  // Pattern 3: Ký tự đơn lẻ liên tiếp (đ ặ c → đặc)
  for (let i = 0; i < 5; i++) {
    const before = result;
    result = result.replace(
      /(?<=\s|^)([a-zA-ZđĐàáảãạăắằẳẵặâấầẩẫậèéẻẽẹêếềểễệìíỉĩịòóỏõọôốồổỗộơớờởỡợùúủũụưứừửữựỳýỷỹỵ]) ([a-zA-ZđĐàáảãạăắằẳẵặâấầẩẫậèéẻẽẹêếềểễệìíỉĩịòóỏõọôốồổỗộơớờởỡợùúủũụưứừửữựỳýỷỹỵ])(?=\s|[^a-zA-ZđĐàáảãạăắằẳẵặâấầẩẫậèéẻẽẹêếềểễệìíỉĩịòóỏõọôốồổỗộơớờởỡợùúủũụưứừửữựỳýỷỹỵ]|$)/g,
      "$1$2",
    );
    if (result === before) break;
  }

  result = result.replace(/ {2,}/g, " ");
  return result;
}

/**
 * Trích xuất text từ PDF page sử dụng vị trí tọa độ
 */
function extractTextFromPage(textContent: { items: PdfTextItem[] }): string {
  const items = textContent.items;
  if (items.length === 0) return "";

  const lines: string[] = [];
  let currentLine = "";
  let lastItem: PdfTextItem | null = null;

  for (let i = 0; i < items.length; i++) {
    const item = items[i];

    if (item.str === "") {
      if (item.hasEOL) {
        if (currentLine.trim()) lines.push(currentLine);
        currentLine = "";
        lastItem = null;
      }
      continue;
    }

    if (lastItem === null) {
      currentLine = item.str;
    } else {
      const lastY = lastItem.transform[5];
      const currentY = item.transform[5];
      const fontSize = Math.abs(item.transform[0]) || 12;

      if (Math.abs(lastY - currentY) > fontSize * 0.5) {
        if (currentLine.trim()) lines.push(currentLine);
        currentLine = item.str;
      } else {
        const lastEndX = lastItem.transform[4] + lastItem.width;
        const currentStartX = item.transform[4];
        const gap = currentStartX - lastEndX;
        // Giảm từ 0.3 xuống 0.15 để phát hiện khoảng trắng giữa từ tốt hơn
        const spaceThreshold = fontSize * 0.15;

        if (gap > spaceThreshold) {
          currentLine += " " + item.str;
        } else if (gap < -fontSize * 0.5) {
          if (currentLine.trim()) lines.push(currentLine);
          currentLine = item.str;
        } else {
          currentLine += item.str;
        }
      }
    }

    if (item.hasEOL) {
      if (currentLine.trim()) lines.push(currentLine);
      currentLine = "";
      lastItem = null;
    } else {
      lastItem = item;
    }
  }

  if (currentLine.trim()) lines.push(currentLine);
  return lines.join("\n");
}

const QuestionExtractor: React.FC<QuestionExtractorProps> = ({
  pdfFiles,
  pdfLoaded,
  isLoading,
  onProcessStart,
  onProcessComplete,
  onError,
}) => {
  // Xử lý PDF files - sử dụng position-aware extraction
  const processPdfFiles = async () => {
    if (!pdfFiles || pdfFiles.length === 0) return;

    onProcessStart();

    try {
      if (!pdfLoaded || !window.pdfjsLib) {
        throw new Error(
          "Thư viện PDF.js chưa được tải xong. Vui lòng đợi một chút và thử lại.",
        );
      }

      const fileProcessingPromises = Array.from(pdfFiles).map((file) => {
        return new Promise<string>((resolve, reject) => {
          const fileReader = new FileReader();
          fileReader.onload = async function () {
            try {
              const typedarray = new Uint8Array(this.result as ArrayBuffer);
              const pdf = await window.pdfjsLib.getDocument(typedarray.buffer)
                .promise;

              let fullText = "";
              for (let i = 1; i <= pdf.numPages; i++) {
                const page = await pdf.getPage(i);
                const textContent = await page.getTextContent();

                // Sử dụng position-aware extraction
                const pageText = extractTextFromPage(
                  textContent as { items: PdfTextItem[] },
                );

                // Post-process: chuẩn hóa tiếng Việt
                const normalizedPageText = normalizeVietnameseText(pageText);
                fullText += normalizedPageText + "\n\n";
              }
              resolve(fullText);
            } catch (e) {
              console.error(`Lỗi khi xử lý file ${file.name}:`, e);
              reject(e);
            }
          };
          fileReader.onerror = () => {
            reject(new Error(`Không thể đọc tệp ${file.name}`));
          };
          fileReader.readAsArrayBuffer(file);
        });
      });

      const combinedText = (await Promise.all(fileProcessingPromises)).join(
        "\n\n",
      );

      // Phân tích và tìm câu hỏi từ văn bản
      const extractedQuestionsResult = extractQuestionsFromText(combinedText);

      if (extractedQuestionsResult.length > 0) {
        onProcessComplete(extractedQuestionsResult);
      } else {
        onError("Không tìm thấy câu hỏi nào.");
      }
    } catch (error) {
      console.error("Error processing PDF:", error);
      onError(error instanceof Error ? error.message : "Unknown error");
    }
  };

  // Trích xuất câu hỏi từ văn bản
  const extractQuestionsFromText = (text: string) => {
    const normalizedText = text
      .replace(/(\r\n|\n|\r)/gm, "\n")
      .replace(/ +/g, " ");

    let matches: string[] = [];

    // Mẫu 1: Câu hỏi X: hoặc Câu X:
    const regex1 =
      /(Câu\s*(?:hỏi)?\s*\d+\s*[:.]\s*[\s\S]*?)(?=\n*Câu\s*(?:hỏi)?\s*\d+\s*[:.]|\s*$)/g;
    const matches1 = normalizedText.match(regex1);
    if (matches1 && matches1.length > 0) {
      matches = matches1;
    }

    // Nếu không tìm thấy, thử mẫu 2
    if (matches.length === 0) {
      const regex2 = /(\d+\s*[:.]\s*[\s\S]*?)(?=\n*\d+\s*[:.]\s*|\s*$)/g;
      const matches2 = normalizedText.match(regex2);
      if (matches2 && matches2.length > 0) {
        matches = matches2;
      }
    }

    // Nếu vẫn không tìm thấy, chia theo đoạn
    if (matches.length === 0) {
      const paragraphs = normalizedText
        .split(/\n\s*\n/)
        .filter((p) => p.trim().length > 0);
      if (paragraphs.length > 0) {
        matches = paragraphs;
      }
    }

    if (matches.length > 0) {
      const processedMatches = matches.map((match) => {
        let processedMatch = match.trim();
        processedMatch = processedMatch
          .replace(/^câu\s*hỏi\s*\d+\s*[:.]/i, "")
          .trim();
        processedMatch = processedMatch.replace(/^\d+[.:] */, "").trim();
        return processedMatch;
      });

      return processedMatches;
    } else {
      return [];
    }
  };

  return (
    <Button
      id="process-btn"
      variant="default"
      className="bg-blue-600 w-full sm:w-auto disabled:bg-gray-400"
      disabled={!pdfFiles || pdfFiles.length === 0 || !pdfLoaded || isLoading}
      onClick={processPdfFiles}
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
          Đang xử lý...
        </span>
      ) : (
        <>
          Tiếp tục: Xử lý PDF{!pdfLoaded && " (Đang đợi thư viện tải xong...)"}
        </>
      )}
    </Button>
  );
};

export default QuestionExtractor;
