"use client";

import React, { useCallback, useState } from "react";
import { Button } from "@/components/ui/button";
import { saveAs } from "file-saver";
import { ComparisonResults as ComparisonResultsType } from "../hooks/useComparison";

interface QuestionData {
  question: string;
  options: Record<string, string>;
  correct_answer: string | null;
}

interface ComparisonViewProps {
  pdfJsonData: QuestionData[];
  apiJsonData: QuestionData[];
  calculateOptimizedSimilarity: (str1: string, str2: string) => number;
  isLoading: boolean;
  onGoBack: () => void;
  onProceedToDeduplication: () => void;
  onComparisonComplete: (results: ComparisonResultsType) => void;
}

const ComparisonView: React.FC<ComparisonViewProps> = ({
  pdfJsonData,
  apiJsonData,
  calculateOptimizedSimilarity,
  isLoading,
  onGoBack,
  onProceedToDeduplication,
  onComparisonComplete,
}) => {
  const [similarityThreshold, setSimilarityThreshold] = useState<number>(80);
  const [comparisonResults, setComparisonResults] =
    useState<ComparisonResultsType | null>(null);
  const [comparisonCompleted, setComparisonCompleted] =
    useState<boolean>(false);

  // Render a column with data
  const renderColumn = useCallback((data: QuestionData[]) => {
    return data.map((q, index) => (
      <div
        key={index}
        className="p-3 mb-2 border rounded-md bg-white"
        data-index={index}
      >
        <p className="font-bold">{q.question}</p>
      </div>
    ));
  }, []);

  // Compare results and render comparison - tối ưu hóa thuật toán
  const compareResults = useCallback(() => {
    const threshold = similarityThreshold;
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

      for (let lengthKey = minLength; lengthKey <= maxLength; lengthKey += 10) {
        const candidates = apiQuestionsByLength[lengthKey] || [];

        candidates.forEach(({ index: apiIndex, normalized: normalizedApi }) => {
          // Tối ưu 4: Kiểm tra nhanh trước khi tính toán chi tiết
          if (usedApiIndices.has(apiIndex)) return;

          const similarity = calculateOptimizedSimilarity(
            normalizedPdf,
            normalizedApi
          );

          if (similarity >= threshold) {
            potentialMatches.push({ pdfIndex, apiIndex, similarity });
          }
        });
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
    setComparisonCompleted(true);

    // Gửi kết quả về component cha
    onComparisonComplete(results);

    return results;
  }, [
    pdfJsonData,
    apiJsonData,
    similarityThreshold,
    calculateOptimizedSimilarity,
    onComparisonComplete,
  ]);

  // Handle comparison button click - tối ưu hiệu suất
  const handleCompare = useCallback(() => {
    setComparisonCompleted(false);

    // Hiển thị thông báo đang xử lý
    const performanceInfo = document.getElementById("performance-info");
    if (performanceInfo) {
      performanceInfo.textContent = "Đang so sánh dữ liệu...";
      performanceInfo.className = "mt-2 text-blue-600 font-medium";
    }

    // Thực hiện so sánh và gửi kết quả lên component cha
    console.time("handleCompare");
    const startTime = performance.now();

    // Chạy so sánh và cập nhật state
    const results = compareResults();

    const executionTime = (performance.now() - startTime).toFixed(1);

    // Hiển thị thông tin tóm tắt kết quả
    const comparisonSummary = document.getElementById("comparison-summary");
    if (comparisonSummary) {
      // Tạo nội dung cho phần tóm tắt kết quả
      comparisonSummary.innerHTML = `
        <div class="grid grid-cols-1 md:grid-cols-4 gap-4 text-gray-700">
          <div class="bg-blue-50 p-4 rounded-lg">
            <div class="flex items-center">
              <svg class="h-8 w-8 text-blue-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
              </svg>
              <div>
                <p class="text-sm">Tổng câu hỏi đề thi</p>
                <p class="font-bold text-2xl">${pdfJsonData.length}</p>
              </div>
            </div>
          </div>
          <div class="bg-green-50 p-4 rounded-lg">
            <div class="flex items-center">
              <svg class="h-8 w-8 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
              </svg>
              <div>
                <p class="text-sm">Có trong đề cương</p>
                <p class="font-bold text-2xl">${results.matchedCount}</p>
              </div>
            </div>
          </div>
          <div class="bg-red-50 p-4 rounded-lg">
            <div class="flex items-center">
              <svg class="h-8 w-8 text-red-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
              <div>
                <p class="text-sm">Không có trong đề cương</p>
                <p class="font-bold text-2xl">${results.unmatchedPdfCount}</p>
              </div>
            </div>
          </div>
          <div class="bg-emerald-50 p-4 rounded-lg">
            <div class="flex items-center">
              <svg class="h-8 w-8 text-emerald-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 ai-2 2h-2a2 2 0 01-2-2z"></path>
              </svg>
              <div>
                <p class="text-sm">Tỉ lệ khớp</p>
                <p class="font-bold text-2xl">${results.percentage.toFixed(
                  1
                )}%</p>
              </div>
            </div>
          </div>
        </div>
        <div class="mt-4">
          <div class="bg-gray-200 h-4 w-full rounded-full overflow-hidden">
            <div class="bg-green-500 h-full" style="width: ${results.percentage.toFixed(
              1
            )}%"></div>
          </div>
          <div class="text-right mt-1 text-sm text-gray-600">${
            results.matchedCount
          }/${pdfJsonData.length}</div>
        </div>
      `;
      // Hiện thị phần kết quả tóm tắt
      comparisonSummary.classList.remove("hidden");
      // Thông báo hoàn tất
      if (performanceInfo) {
        performanceInfo.textContent = `So sánh hoàn tất trong ${executionTime}ms - Đã so sánh ${pdfJsonData.length} câu hỏi PDF với ${apiJsonData.length} câu hỏi API`;
        performanceInfo.className = "mt-2 text-green-600 font-medium";
      }
    }

    // Đánh dấu đã hoàn tất so sánh
    setComparisonCompleted(true);
    console.timeEnd("handleCompare");
  }, [compareResults, pdfJsonData, apiJsonData, onComparisonComplete]);

  // Export unmatched questions to Word
  const exportUnmatchedToWord = useCallback(() => {
    if (typeof window === "undefined" || !window.docx) {
      console.error("docx library not available");
      return;
    }

    try {
      if (!comparisonResults) {
        const messageArea = document.getElementById("performance-info");
        if (messageArea) {
          messageArea.textContent =
            "Vui lòng chạy so sánh trước khi xuất file.";
          messageArea.className = "mt-2 text-yellow-600 font-medium";
        }
        return;
      }

      // Get the unmatched questions
      const questionsToExport = comparisonResults.unmatchedPdfIndices.map(
        (index) => pdfJsonData[index]
      );

      if (questionsToExport.length === 0) {
        const messageArea = document.getElementById("performance-info");
        if (messageArea) {
          messageArea.textContent = "Không có câu hỏi để xuất.";
          messageArea.className = "mt-2 text-yellow-600 font-medium";
        }
        return;
      }

      const children = questionsToExport.flatMap((question, index) => {
        const questionParagraphs = [];

        // Tiêu đề cho mỗi câu hỏi
        questionParagraphs.push(
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          new (window as any).docx.Paragraph({
            children: [
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              new (window as any).docx.TextRun({
                text: `Câu hỏi ${index + 1}: ${question.question}`,
                bold: true,
              }),
            ],
            spacing: { after: 200 },
          })
        );

        // Add options if they exist
        const options = question.options;
        if (options) {
          Object.entries(options).forEach(([key, value]) => {
            const isCorrect = question.correct_answer === key;

            questionParagraphs.push(
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              (window as any).docx.Paragraph({
                children: [
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  (window as any).docx.TextRun({
                    text: `${key}. ${value}`,
                    bold: isCorrect,
                  }),
                ],
                indent: { left: 720 },
                spacing: { after: 100 },
              })
            );
          });
        }

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        questionParagraphs.push((window as any).docx.Paragraph(""));
        return questionParagraphs;
      });

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const doc = (window as any).docx.Document({
        sections: [
          {
            properties: {},
            children: [
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              (window as any).docx.Paragraph({
                children: [
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  (window as any).docx.TextRun({
                    text: `CÁC CÂU HỎI KHÔNG CÓ TRONG ĐỀ CƯƠNG (${questionsToExport.length} câu)`,
                    bold: true,
                    size: 28,
                  }),
                ],
                spacing: { after: 400 },
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                alignment: (window as any).docx.AlignmentType.CENTER,
              }),
              ...children,
            ],
          },
        ],
      });

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (window as any).docx.Packer.toBlob(doc).then((blob: Blob) =>
        saveAs(blob, "cau-hoi-khong-co-trong-de-cuong.docx")
      );

      const messageArea = document.getElementById("performance-info");
      if (messageArea) {
        messageArea.textContent = `Đã xuất ${questionsToExport.length} câu hỏi không khớp với đề cương ra file Word.`;
        messageArea.className = "mt-2 text-green-600 font-medium";
      }
    } catch (error) {
      console.error("Error exporting unmatched questions to Word:", error);
      const messageArea = document.getElementById("performance-info");
      if (messageArea) {
        messageArea.textContent = "Lỗi khi xuất file Word. Vui lòng thử lại.";
        messageArea.className = "mt-2 text-red-600 font-medium";
      }
    }
  }, [comparisonResults, pdfJsonData]);

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h2 className="text-xl font-bold mb-2">
            Cột 1: Dữ liệu từ PDF
            <span className="text-base font-normal text-gray-500 ml-2">
              ({pdfJsonData.length} câu hỏi)
            </span>
          </h2>
          <div className="h-[60vh] overflow-y-auto p-3 bg-gray-50 rounded-lg border">
            {isLoading ? (
              <div className="flex justify-center items-center h-full">
                <div className="loader ease-linear rounded-full border-4 border-t-4 border-gray-200 h-12 w-12"></div>
              </div>
            ) : (
              renderColumn(pdfJsonData)
            )}
          </div>
        </div>
        <div>
          <h2 className="text-xl font-bold mb-2">
            Cột 2: Dữ liệu từ Đề cương API
            <span className="text-base font-normal text-gray-500 ml-2">
              ({apiJsonData.length} câu hỏi)
            </span>
          </h2>
          <div className="h-[60vh] overflow-y-auto p-3 bg-gray-50 rounded-lg border">
            {isLoading ? (
              <div className="flex justify-center items-center h-full">
                <div className="loader ease-linear rounded-full border-4 border-t-4 border-gray-200 h-12 w-12"></div>
              </div>
            ) : (
              renderColumn(apiJsonData)
            )}
          </div>
        </div>
      </div>

      <div className="mt-6 flex flex-col items-center gap-4">
        {/* Ngưỡng khớp */}
        <div className="flex items-center gap-4 p-3 bg-gray-50 rounded-xl shadow-inner border border-gray-200 w-fit">
          <input
            id="similarity-range"
            type="range"
            min="50"
            max="100"
            value={similarityThreshold}
            onChange={(e) => setSimilarityThreshold(parseInt(e.target.value))}
            className="w-48 accent-blue-600"
          />
          <span className="font-bold text-blue-600 w-14 text-center text-sm bg-white rounded-md border border-blue-300 px-2 py-1">
            {similarityThreshold}%
          </span>
        </div>

        {/* 2 Button */}
        <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
          <Button
            variant="default"
            className="bg-blue-600"
            disabled={
              isLoading || pdfJsonData.length === 0 || apiJsonData.length === 0
            }
            onClick={handleCompare}
          >
            So sánh kết quả
          </Button>
          {/* <Button
            id="export-unmatched-btn"
            variant="default"
            className="bg-green-600"
            onClick={exportUnmatchedToWord}
            disabled={!comparisonResults}
          >
            Xuất câu hỏi chưa khớp (Word)
          </Button> */}
        </div>
      </div>

      {/* {comparisonCompleted &&
        comparisonResults &&
        comparisonResults.unmatchedPdfCount === 0 && (
          <div className="mt-4 text-center text-yellow-600 font-medium">
            Không có câu hỏi chưa khớp để phát hiện trùng lặp.
          </div>
        )} */}

      <div
        id="comparison-summary"
        className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg text-center hidden"
      ></div>

      <div id="performance-info" className="mt-2 text-center font-medium"></div>
    </>
  );
};

export default ComparisonView;
