import { useState, useEffect, useCallback } from "react";
import { QuestionData } from "./useQuestions";

/**
 * Extended TextItem interface bao gồm position data từ PDF.js
 * transform[4] = x position, transform[5] = y position
 * width = chiều rộng ước tính của text item
 */
interface PdfTextItem {
  str: string;
  dir: string;
  width: number;
  height: number;
  transform: number[]; // [scaleX, skewX, skewY, scaleY, translateX, translateY]
  fontName: string;
  hasEOL: boolean;
}

/**
 * Chuẩn hóa text tiếng Việt - sửa lỗi tách dấu (BẢO THỦ)
 * CHỈ merge khi phần trước là ký tự đơn lẻ (1-2 chars, không chứa nguyên âm)
 * = rõ ràng là bị tách từ cùng 1 âm tiết.
 * KHÔNG merge khi phần trước là 1 âm tiết hoàn chỉnh (có nguyên âm rồi)
 *
 * Ví dụ ĐÚNG:  "M ẫu" → "Mẫu", "l àm" → "làm", "đ ặ c" → "đặc"
 * Ví dụ SAI:   "chứng điển" PHẢI GIỮ NGUYÊN, "Chán ăn" PHẢI GIỮ NGUYÊN
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

  // Hàm kiểm tra xem 1 chuỗi có chứa nguyên âm tiếng Việt không
  // Nếu có → đây là âm tiết hoàn chỉnh → KHÔNG merge
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

  // Pattern 1: Phụ âm đơn lẻ (KHÔNG chứa nguyên âm) + space + nguyên âm có dấu
  // Ví dụ: "M ẫu" (M không có nguyên âm → merge), "l àm" (l không có nguyên âm → merge)
  // NHƯNG: "Chán ăn" (Chán CÓ nguyên âm á → KHÔNG merge)
  const diacriticVowelChars = `${vietnameseDiacriticVowels}${vietnameseUpperDiacriticVowels}`;
  const allVowelChars = `${allVietnameseVowels}${allVietnameseUpperVowels}`;

  // Tìm pattern: (từ) + space + (ký tự có dấu + phần còn lại)
  // Chỉ nối nếu phần trước KHÔNG chứa nguyên âm (= phụ âm đơn lẻ bị tách)
  const splitWordPattern = new RegExp(
    `(\\S+) ([${diacriticVowelChars}][a-zA-Z${allVowelChars}đĐ]*)`,
    "g",
  );
  result = result.replace(splitWordPattern, (match, before, after) => {
    // Chỉ merge nếu phần trước KHÔNG chứa nguyên âm VÀ ngắn (1-3 ký tự)
    // = rõ ràng là phụ âm đầu bị tách khỏi nguyên âm
    if (!containsVowel(before) && before.length <= 3) {
      return before + after;
    }
    return match; // Giữ nguyên space
  });

  // Pattern 2: Nguyên âm có dấu + space + phụ âm cuối đơn lẻ (1-2 ký tự)
  // Ví dụ: "phổ i" → "phổi", "nhiệ t" → "nhiệt"
  // NHƯNG: "tiểu ít" → GIỮ NGUYÊN (ít là từ riêng có nguyên âm)
  const vowelEndPattern = new RegExp(
    `([${diacriticVowelChars}]) ([a-zA-ZđĐ]{1,2})(?=\\s|[^a-zA-Z${allVowelChars}đĐ]|$)`,
    "g",
  );
  result = result.replace(vowelEndPattern, (match, vowel, ending) => {
    // Chỉ merge nếu phần sau KHÔNG chứa nguyên âm (= phụ âm cuối bị tách)
    if (!containsVowel(ending)) {
      return vowel + ending;
    }
    return match; // Giữ nguyên - ending chứa nguyên âm = từ riêng
  });

  // Pattern 3: Xử lý ký tự đơn lẻ liên tiếp bị tách (đ ặ c → đặc)
  // Chỉ áp dụng khi CẢ HAI bên đều là 1 ký tự đơn lẻ
  for (let i = 0; i < 5; i++) {
    const before = result;
    // Match: (ký tự đơn đứng đầu từ hoặc sau space) + space + (ký tự đơn)
    result = result.replace(
      /(?<=\s|^)([a-zA-ZđĐàáảãạăắằẳẵặâấầẩẫậèéẻẽẹêếềểễệìíỉĩịòóỏõọôốồổỗộơớờởỡợùúủũụưứừửữựỳýỷỹỵ]) ([a-zA-ZđĐàáảãạăắằẳẵặâấầẩẫậèéẻẽẹêếềểễệìíỉĩịòóỏõọôốồổỗộơớờởỡợùúủũụưứừửữựỳýỷỹỵ])(?=\s|[^a-zA-ZđĐàáảãạăắằẳẵặâấầẩẫậèéẻẽẹêếềểễệìíỉĩịòóỏõọôốồổỗộơớờởỡợùúủũụưứừửữựỳýỷỹỵ]|$)/g,
      "$1$2",
    );
    if (result === before) break;
  }

  // Chuẩn hóa nhiều space thành 1
  result = result.replace(/ {2,}/g, " ");

  return result;
}

/**
 * Trích xuất text từ PDF page sử dụng vị trí tọa độ để tránh tách chữ.
 * Thay vì join tất cả items bằng space, dùng transform position (x, y)
 * để xác định items nào nằm liền kề → nối trực tiếp.
 */
function extractTextFromPage(textContent: { items: PdfTextItem[] }): string {
  const items = textContent.items;
  if (items.length === 0) return "";

  const lines: string[] = [];
  let currentLine = "";
  let lastItem: PdfTextItem | null = null;

  for (let i = 0; i < items.length; i++) {
    const item = items[i];

    // Skip empty strings
    if (item.str === "") {
      if (item.hasEOL) {
        if (currentLine.trim()) {
          lines.push(currentLine);
        }
        currentLine = "";
        lastItem = null;
      }
      continue;
    }

    if (lastItem === null) {
      // Đây là item đầu tiên của dòng
      currentLine = item.str;
    } else {
      // Kiểm tra xem item này có cùng dòng với item trước không
      const lastY = lastItem.transform[5];
      const currentY = item.transform[5];
      const fontSize = Math.abs(item.transform[0]) || 12;

      // Nếu khác dòng (y thay đổi đáng kể so với font size)
      if (Math.abs(lastY - currentY) > fontSize * 0.5) {
        if (currentLine.trim()) {
          lines.push(currentLine);
        }
        currentLine = item.str;
      } else {
        // Cùng dòng - xác định có cần space không
        const lastEndX = lastItem.transform[4] + lastItem.width;
        const currentStartX = item.transform[4];
        const gap = currentStartX - lastEndX;

        // Ngưỡng gap: nếu khoảng cách > 15% font size → thêm space
        // Giảm từ 0.3 xuống 0.15 để phát hiện khoảng trắng giữa từ tốt hơn
        // Dấu bị tách thường có gap ≈ 0 hoặc âm, space giữa từ thường > 15%
        const spaceThreshold = fontSize * 0.15;

        if (gap > spaceThreshold) {
          currentLine += " " + item.str;
        } else if (gap < -fontSize * 0.5) {
          // Gap âm lớn = overlap = có thể là dòng mới
          if (currentLine.trim()) {
            lines.push(currentLine);
          }
          currentLine = item.str;
        } else {
          // Nối trực tiếp - không thêm space
          currentLine += item.str;
        }
      }
    }

    // Xử lý End Of Line
    if (item.hasEOL) {
      if (currentLine.trim()) {
        lines.push(currentLine);
      }
      currentLine = "";
      lastItem = null;
    } else {
      lastItem = item;
    }
  }

  // Flush dòng cuối
  if (currentLine.trim()) {
    lines.push(currentLine);
  }

  return lines.join("\n");
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
    if (typeof window !== "undefined") {
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

      const timeout = setTimeout(() => {
        clearInterval(interval);
        if (!window.pdfjsLib) {
          setPdfLibraryError(
            "Không thể tải thư viện PDF.js sau 10 giây. Vui lòng làm mới trang và thử lại.",
          );
        }
      }, 10000);

      return () => {
        clearInterval(interval);
        clearTimeout(timeout);
      };
    }
  }, []);

  // Hàm xử lý file PDF - sử dụng position-aware text extraction
  const processPdfFiles = useCallback(async () => {
    if (!pdfFiles || pdfFiles.length === 0) return [];

    setIsLoading(true);

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

                // Sử dụng position-aware extraction thay vì join(" ")
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
        setExtractedQuestions(extractedQuestionsResult);
        return extractedQuestionsResult;
      } else {
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

    // Nếu không tìm thấy, thử mẫu 2: số. hoặc số:
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
          .replace(/^câu\s*hỏi\s*\d+\s*[:\.]/i, "")
          .trim();
        processedMatch = processedMatch.replace(/^\d+[.:] */, "").trim();
        return processedMatch;
      });

      return processedMatches;
    } else {
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

      let question = parts[0];
      question = question.replace(/^câu\s*hỏi\s*\d+\s*[:\.]/i, "").trim();
      question = question.replace(/^\d+[.:] */, "").trim();

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
