import { useState, useEffect, useCallback } from "react";
import { QuestionData } from "./useQuestions";

interface TextItem {
  str: string;
}

export const usePdfProcessor = () => {
  const [pdfFiles, setPdfFiles] = useState<FileList | null>(null);
  const [extractedQuestions, setExtractedQuestions] = useState<string[]>([]);
  const [pdfJsonData, setPdfJsonData] = useState<QuestionData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [pdfLoaded, setPdfLoaded] = useState(false);
  const [pdfLibraryError, setPdfLibraryError] = useState<string | null>(null);

  // Initialize PDF.js
  useEffect(() => {
    // Check if we're in browser environment
    if (typeof window !== "undefined") {
      // Kiểm tra ngay lập tức nếu thư viện đã tồn tại
      if (window.pdfjsLib) {
        window.pdfjsLib.GlobalWorkerOptions.workerSrc =
          "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.11.338/pdf.worker.min.js";
        setPdfLoaded(true);
        setPdfLibraryError(null);
        return;
      }

      const interval = setInterval(() => {
        if (window.pdfjsLib) {
          window.pdfjsLib.GlobalWorkerOptions.workerSrc =
            "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.11.338/pdf.worker.min.js";
          setPdfLoaded(true);
          setPdfLibraryError(null);
          clearInterval(interval);
        }
      }, 100);

      // Clear interval after 10 seconds to prevent memory leak
      setTimeout(() => {
        clearInterval(interval);
        if (!window.pdfjsLib) {
          setPdfLibraryError(
            "Không thể tải thư viện PDF.js sau 10 giây. Vui lòng làm mới trang và thử lại."
          );
        }
      }, 10000);

      return () => {
        clearInterval(interval);
      };
    }
  }, []);

  // Hàm xử lý file PDF
  const processPdfFiles = useCallback(async () => {
    if (!pdfFiles || pdfFiles.length === 0) return [];

    setIsLoading(true);

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
              const pdf = await window.pdfjsLib.getDocument(typedarray).promise;
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
        setExtractedQuestions(extractedQuestionsResult);
        return extractedQuestionsResult;
      } else {
        console.log("Không tìm thấy câu hỏi nào!");
        return [];
      }
    } catch (error) {
      console.error("Error processing PDF:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [pdfFiles, pdfLoaded]);

  // Trích xuất câu hỏi từ văn bản
  const extractQuestionsFromText = useCallback((text: string) => {
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
  }, []);

  // Generate JSON data from questions
  const generateJsonData = useCallback(() => {
    const jsonData = extractedQuestions.map((qText) => {
      const parts = qText
        .split("#")
        .map((p) => p.trim())
        .filter((p) => p);

      if (parts.length < 2) {
        return { question: qText, options: {}, correct_answer: null };
      }

      // Remove "câu hỏi X:" pattern from the question content
      let question = parts[0];
      // First remove any "câu hỏi X:" pattern (case insensitive)
      question = question.replace(/^câu\s*hỏi\s*\d+\s*[:\.]/i, "").trim();
      // Also remove any other numeric prefixes like "1. ", "1: ", etc.
      question = question.replace(/^\d+[\.:]\s*/i, "").trim();

      const answers = parts.slice(1);
      const options: Record<string, string> = {};
      let correct_answer = null;

      answers.forEach((ans) => {
        const isCorrect = ans.includes("►");
        const cleanAns = ans.replace("►", "").trim();
        const letter = cleanAns.charAt(0).toUpperCase();
        const text = cleanAns.substring(1).trim();
        options[letter] = text;
        if (isCorrect) correct_answer = letter;
      });

      return { question, options, correct_answer };
    });

    setPdfJsonData(jsonData);
    return jsonData;
  }, [extractedQuestions]);

  // Reset file processing state
  const resetPdfState = useCallback(() => {
    setExtractedQuestions([]);
    setPdfJsonData([]);
  }, []);

  return {
    pdfFiles,
    setPdfFiles,
    extractedQuestions,
    setExtractedQuestions,
    pdfJsonData,
    setPdfJsonData,
    isLoading,
    setIsLoading,
    pdfLoaded,
    pdfLibraryError,
    processPdfFiles,
    extractQuestionsFromText,
    generateJsonData,
    resetPdfState,
  };
};

export default usePdfProcessor;
