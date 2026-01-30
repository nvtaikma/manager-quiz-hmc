"use client";

import React from "react";
import { Button } from "@/components/ui/button";

interface TextItem {
  str: string;
}

interface QuestionExtractorProps {
  pdfFiles: FileList | null;
  pdfLoaded: boolean;
  isLoading: boolean;
  onProcessStart: () => void;
  onProcessComplete: (extractedQuestions: string[]) => void;
  onError: (error: string) => void;
}

const QuestionExtractor: React.FC<QuestionExtractorProps> = ({
  pdfFiles,
  pdfLoaded,
  isLoading,
  onProcessStart,
  onProcessComplete,
  onError,
}) => {
  // Xử lý PDF files
  const processPdfFiles = async () => {
    if (!pdfFiles || pdfFiles.length === 0) return;

    onProcessStart();

    try {
      if (!pdfLoaded || !window.pdfjsLib) {
        throw new Error(
          "Thư viện PDF.js chưa được tải xong. Vui lòng đợi một chút và thử lại."
        );
      }

      console.log("Bắt đầu xử lý PDF...");
      console.log("Số lượng file:", pdfFiles.length);

      const fileProcessingPromises = Array.from(pdfFiles).map((file) => {
        console.log("Xử lý file:", file.name);
        return new Promise<string>((resolve, reject) => {
          const fileReader = new FileReader();
          fileReader.onload = async function () {
            try {
              const typedarray = new Uint8Array(this.result as ArrayBuffer);
              const pdf = await window.pdfjsLib.getDocument(typedarray.buffer)
                .promise;
              console.log(`File ${file.name} có ${pdf.numPages} trang`);

              let fullText = "";
              for (let i = 1; i <= pdf.numPages; i++) {
                const page = await pdf.getPage(i);
                const textContent = await page.getTextContent();
                const pageText = textContent.items
                  .map((item: TextItem) => item.str)
                  .join(" ");
                fullText += pageText + "\n\n";
                console.log(
                  `Đã xử lý trang ${i}/${pdf.numPages} của file ${file.name}`
                );
              }
              resolve(fullText);
            } catch (e) {
              console.error(`Lỗi khi xử lý file ${file.name}:`, e);
              reject(e);
            }
          };
          fileReader.onerror = () => {
            console.error(`Không thể đọc tệp ${file.name}`);
            reject(new Error(`Không thể đọc tệp ${file.name}`));
          };
          fileReader.readAsArrayBuffer(file);
        });
      });

      const combinedText = (await Promise.all(fileProcessingPromises)).join(
        "\n\n"
      );
      console.log("Đã kết hợp văn bản từ tất cả các tệp PDF");
      console.log("Độ dài văn bản:", combinedText.length);

      // Phân tích và tìm câu hỏi từ văn bản
      const extractedQuestionsResult = extractQuestionsFromText(combinedText);

      if (extractedQuestionsResult.length > 0) {
        console.log(`Đã tìm thấy ${extractedQuestionsResult.length} câu hỏi`);
        console.log("Câu hỏi đầu tiên:", extractedQuestionsResult[0]);

        // Trả về kết quả
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
    console.log("Bắt đầu phân tích câu hỏi từ văn bản...");
    console.log("Độ dài văn bản:", text.length);
    console.log("Mẫu văn bản:", text.substring(0, 300) + "...");

    const normalizedText = text
      .replace(/(\r\n|\n|\r)/gm, "\n")
      .replace(/ +/g, " ");

    // Thử nhiều mẫu regex khác nhau
    let matches: string[] = [];

    // Mẫu 1: Câu hỏi X:
    const regex1 =
      /(Câu\s*(?:hỏi)?\s*\d+\s*[:.][\s\S]*?)(?=\n*Câu\s*(?:hỏi)?\s*\d+\s*[:.]|\s*$)/g;
    const matches1 = normalizedText.match(regex1);
    if (matches1 && matches1.length > 0) {
      matches = matches1;
      console.log(`Tìm thấy ${matches.length} câu hỏi với mẫu 1`);
    }

    // Nếu không tìm thấy, thử mẫu 2
    if (matches.length === 0) {
      console.log("Không tìm thấy câu hỏi với mẫu 1, thử mẫu 2...");
      const regex2 = /(\d+\s*[:.]\s*[\s\S]*?)(?=\n*\d+\s*[:.]\s*|\s*$)/g;
      const matches2 = normalizedText.match(regex2);
      if (matches2 && matches2.length > 0) {
        matches = matches2;
        console.log(`Tìm thấy ${matches.length} câu hỏi với mẫu 2`);
      }
    }

    // Nếu vẫn không tìm thấy, thử mẫu 3
    if (matches.length === 0) {
      console.log("Không tìm thấy câu hỏi với mẫu 2, thử mẫu 3...");
      // Chia văn bản thành các đoạn và coi mỗi đoạn là một câu hỏi
      const paragraphs = normalizedText
        .split(/\n\s*\n/)
        .filter((p) => p.trim().length > 0);
      if (paragraphs.length > 0) {
        matches = paragraphs;
        console.log(`Tìm thấy ${matches.length} đoạn văn với mẫu 3`);
      }
    }

    if (matches.length > 0) {
      console.log(`Tổng cộng đã tìm thấy ${matches.length} câu hỏi`);
      console.log("Câu hỏi đầu tiên:", matches[0]);

      // Xử lý mỗi câu hỏi để loại bỏ tiền tố "câu hỏi X:"
      const processedMatches = matches.map((match) => {
        let processedMatch = match.trim();
        // Loại bỏ tiền tố "câu hỏi X:" nếu có
        processedMatch = processedMatch
          .replace(/^câu\s*hỏi\s*\d+\s*[:\.]/i, "")
          .trim();
        // Cũng loại bỏ tiền tố số nếu có
        processedMatch = processedMatch.replace(/^\d+[\.:]\s*/i, "").trim();
        return processedMatch;
      });

      return processedMatches;
    } else {
      console.log("Không tìm thấy câu hỏi nào!");
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
