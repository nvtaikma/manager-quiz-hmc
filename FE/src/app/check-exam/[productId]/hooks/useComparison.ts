import { useState, useCallback } from "react";
import { QuestionData } from "./useQuestions";

export interface ComparisonResults {
  matches: Map<number, number>;
  unmatchedPdfIndices: number[];
  matchedCount: number;
  unmatchedPdfCount: number;
  percentage: number;
  usedApiIndices: Set<number>;
}

export const useComparison = () => {
  const [similarityThreshold, setSimilarityThreshold] = useState<number>(80);
  const [comparisonResults, setComparisonResults] =
    useState<ComparisonResults | null>(null);

  // Tối ưu hóa tính toán độ tương đồng
  const calculateOptimizedSimilarity = useCallback(
    (str1: string, str2: string) => {
      // Chuẩn hóa chuỗi và loại bỏ các tiền tố câu hỏi
      const normalizeForComparison = (text: string) => {
        return (
          text
            .toLowerCase()
            // Remove "câu hỏi X:" pattern (case insensitive)
            .replace(/^câu\s*hỏi\s*\d+\s*[:\.]/i, "")
            // Remove any numeric prefixes like "1. ", "1: ", etc.
            .replace(/^\d+[\.:]\s*/i, "")
            .trim()
        );
      };

      const normalizedStr1 = normalizeForComparison(str1);
      const normalizedStr2 = normalizeForComparison(str2);

      // Nếu chuỗi giống hệt nhau sau khi chuẩn hóa
      if (normalizedStr1 === normalizedStr2) return 100;

      // Nếu một chuỗi rỗng
      if (normalizedStr1.length === 0 || normalizedStr2.length === 0) {
        return 0;
      }

      // Tối ưu 1: Kiểm tra nhanh độ dài chuỗi
      const lengthDiff = Math.abs(
        normalizedStr1.length - normalizedStr2.length
      );
      const maxLength = Math.max(normalizedStr1.length, normalizedStr2.length);

      // Nếu chênh lệch độ dài quá lớn, không cần so sánh chi tiết
      if (lengthDiff / maxLength > 0.5) {
        return 0;
      }

      // Tối ưu 2: So sánh bằng tokenization (tách từ)
      const tokens1 = new Set(
        normalizedStr1.split(/\s+/).filter((t) => t.length > 2)
      );
      const tokens2 = new Set(
        normalizedStr2.split(/\s+/).filter((t) => t.length > 2)
      );

      // Đếm số từ chung
      let commonTokens = 0;
      for (const token of tokens1) {
        if (tokens2.has(token)) {
          commonTokens++;
        }
      }

      // Tính độ tương đồng dựa trên Jaccard similarity
      const totalUniqueTokens = tokens1.size + tokens2.size - commonTokens;
      if (totalUniqueTokens === 0) return 100;

      const jaccardSimilarity = (commonTokens / totalUniqueTokens) * 100;

      // Tối ưu 3: Kết hợp với kiểm tra ngắn gọn về độ dài
      const lengthSimilarity = (1 - lengthDiff / maxLength) * 100;

      // Trọng số: 70% cho Jaccard, 30% cho độ dài
      return 0.7 * jaccardSimilarity + 0.3 * lengthSimilarity;
    },
    []
  );

  // Compare results and render comparison - tối ưu hóa thuật toán
  const compareResults = useCallback(
    (
      pdfJsonData: QuestionData[],
      apiJsonData: QuestionData[],
      threshold?: number
    ): ComparisonResults => {
      const compareThreshold = threshold || similarityThreshold;
      console.time("compareResults");

      const normalize = (str: string) =>
        str
          .trim()
          .toLowerCase()
          // Remove "câu hỏi X:" pattern (case insensitive)
          .replace(/^câu\s*hỏi\s*\d+\s*[:\.]/i, "")
          // Remove any numeric prefixes like "1. ", "1: ", etc.
          .replace(/^\d+[\.:]\s*/i, "")
          // Remove punctuation and special characters
          .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()?]/g, "")
          // Normalize whitespace
          .replace(/\s+/g, " ")
          .trim();

      const finalMatches = new Map<number, number>();
      const usedApiIndices = new Set<number>();

      // Tối ưu 1: Phân loại câu hỏi theo độ dài để giảm số lần so sánh
      const apiQuestionsByLength: Record<
        string,
        { index: number; normalized: string }[]
      > = {};

      // Tối ưu 2: Chuẩn bị dữ liệu trước để tránh tính toán lặp lại
      apiJsonData.forEach((apiQ, apiIndex) => {
        const normalized = normalize(apiQ.question);
        // Phân loại theo độ dài (làm tròn đến 10 ký tự gần nhất)
        const lengthKey = Math.floor(normalized.length / 10) * 10;

        if (!apiQuestionsByLength[lengthKey]) {
          apiQuestionsByLength[lengthKey] = [];
        }
        apiQuestionsByLength[lengthKey].push({
          index: apiIndex,
          normalized,
        });
      });

      // Danh sách các khớp tiềm năng
      const potentialMatches: Array<{
        pdfIndex: number;
        apiIndex: number;
        similarity: number;
      }> = [];

      // Tối ưu 3: Chỉ so sánh với các câu hỏi có độ dài tương tự
      pdfJsonData.forEach((pdfQ, pdfIndex) => {
        const normalizedPdf = normalize(pdfQ.question);
        const pdfLength = normalizedPdf.length;

        // Tìm các nhóm câu hỏi có độ dài tương tự (±20%)
        const minLength = Math.floor((pdfLength * 0.8) / 10) * 10;
        const maxLength = Math.ceil((pdfLength * 1.2) / 10) * 10;

        for (
          let lengthKey = minLength;
          lengthKey <= maxLength;
          lengthKey += 10
        ) {
          const candidates = apiQuestionsByLength[lengthKey] || [];

          candidates.forEach(
            ({ index: apiIndex, normalized: normalizedApi }) => {
              // Tối ưu 4: Kiểm tra nhanh trước khi tính toán chi tiết
              if (usedApiIndices.has(apiIndex)) return;

              const similarity = calculateOptimizedSimilarity(
                normalizedPdf,
                normalizedApi
              );

              if (similarity >= compareThreshold) {
                potentialMatches.push({ pdfIndex, apiIndex, similarity });
              }
            }
          );
        }
      });

      // Sắp xếp theo độ tương đồng giảm dần
      potentialMatches.sort((a, b) => b.similarity - a.similarity);

      // Tối ưu 5: Thuật toán greedy matching để tìm các cặp khớp tốt nhất
      potentialMatches.forEach((match) => {
        if (
          !finalMatches.has(match.pdfIndex) &&
          !usedApiIndices.has(match.apiIndex)
        ) {
          finalMatches.set(match.pdfIndex, match.apiIndex);
          usedApiIndices.add(match.apiIndex);
        }
      });

      // Identify unmatched PDF questions (those not found in the reference material)
      const unmatchedPdfIndices = Array.from(
        { length: pdfJsonData.length },
        (_, i) => i
      ).filter((i) => !finalMatches.has(i));

      const matchedCount = finalMatches.size;
      const totalPdf = pdfJsonData.length;
      const unmatchedPdfCount = unmatchedPdfIndices.length;
      const percentage = totalPdf > 0 ? (matchedCount / totalPdf) * 100 : 0;

      console.timeEnd("compareResults");
      console.log(
        `Đã so sánh ${totalPdf} câu hỏi PDF với ${apiJsonData.length} câu hỏi API, tìm thấy ${matchedCount} cặp khớp`
      );

      const results = {
        matches: finalMatches,
        unmatchedPdfIndices,
        matchedCount,
        unmatchedPdfCount,
        percentage,
        usedApiIndices,
      };

      setComparisonResults(results);
      return results;
    },
    [calculateOptimizedSimilarity, similarityThreshold]
  );

  return {
    similarityThreshold,
    setSimilarityThreshold,
    comparisonResults,
    setComparisonResults,
    calculateOptimizedSimilarity,
    compareResults,
  };
};

export default useComparison;
