"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

// Import các hooks tùy chỉnh
import useProduct from "./hooks/useProduct";
import useQuestions from "./hooks/useQuestions";
import usePdfProcessor from "./hooks/usePdfProcessor";
import useExportFunctions from "./hooks/useExportFunctions";
import useComparison from "./hooks/useComparison";
import useDeduplication from "./hooks/useDeduplication";
// import { ComparisonResults } from "./hooks/useComparison";

// Import các components
import FileUploader from "./components/FileUploader";
import QuestionExtractor from "./components/QuestionExtractor";
import AnswerSeparator from "./components/AnswerSeparator";
import TwoColumnLayout from "./components/TwoColumnLayout";
import ComparisonView from "./components/ComparisonView";
import ComparisonResults from "./components/ComparisonResults";
import DeduplicationResults from "./components/DeduplicationResults";
import ExportControls from "./components/ExportControls";
import StepNavigation from "./components/StepNavigation";

// Client Component nhận productId trực tiếp từ props
export function CheckExamClient({ productId }: { productId: string }) {
  const router = useRouter();

  // Sử dụng các hooks tùy chỉnh
  const { product, loading: productLoading } = useProduct(productId);
  const {
    apiJsonData,
    loading: questionsLoading,
    fetchAllQuestions,
  } = useQuestions(productId);

  const {
    pdfFiles,
    setPdfFiles,
    extractedQuestions,
    setExtractedQuestions,
    pdfJsonData,
    isLoading,
    setIsLoading,
    pdfLoaded,
    pdfLibraryError,
    processPdfFiles,
    generateJsonData,
    resetPdfState,
  } = usePdfProcessor();

  const {
    exportToJson,
    exportToWord,
    exportUnmatchedToWord,
    exportDetailedReport,
  } = useExportFunctions();

  const {
    similarityThreshold,
    setSimilarityThreshold,
    comparisonResults,
    setComparisonResults,
    calculateOptimizedSimilarity,
    compareResults,
  } = useComparison();

  const {
    deduplicationState,
    expandedGroups,
    showAllDetails,
    toggleGroupExpand,
    toggleAllGroups,
    deduplicateUnmatchedQuestions,
  } = useDeduplication(calculateOptimizedSimilarity);

  // State quản lý bước hiện tại và chế độ xem
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [viewMode, setViewMode] = useState<"main" | "comparison">("main");

  // Các bước trong quy trình
  const steps = [
    { id: 1, name: "Tải lên PDF" },
    { id: 2, name: "Xem & chỉnh sửa" },
    { id: 3, name: "So sánh với đề cương" },
    { id: 4, name: "Loại bỏ trùng lặp" },
  ];

  // Fetch dữ liệu API khi component mount
  useEffect(() => {
    fetchAllQuestions();
  }, [fetchAllQuestions]);

  // Show comparison view - chuyển sang bước 3
  const showComparisonView = useCallback(async () => {
    setIsLoading(true);

    try {
      // Luôn chuyển đổi dữ liệu PDF sang JSON mới nhất cho việc so sánh
      console.log("Chuyển đổi dữ liệu PDF sang JSON cho việc so sánh");
      const jsonData = generateJsonData();
      console.log(`Đã chuyển đổi ${jsonData.length} câu hỏi sang dạng JSON`);

      // Chuyển sang chế độ so sánh
      setViewMode("comparison");
      setCurrentStep(3); // Đảm bảo step indicator hiển thị đúng

      // Không cần fetch lại dữ liệu từ API vì đã tải khi component mount
      if (apiJsonData.length === 0) {
        console.log("Đang tải dữ liệu câu hỏi từ API...");
        await fetchAllQuestions();
        console.log("Đã tải xong dữ liệu API:", apiJsonData.length, "câu hỏi");
      } else {
        console.log(
          "Sử dụng dữ liệu API đã có sẵn:",
          apiJsonData.length,
          "câu hỏi"
        );
      }

      const messageArea = document.getElementById("message-area");
      if (messageArea) {
        messageArea.textContent = `Đã chuyển đổi ${jsonData.length} câu hỏi sang dạng JSON và sẵn sàng để so sánh.`;
        messageArea.className = "mt-6 text-center font-medium text-green-600";
      }
    } catch (error) {
      console.error("Lỗi khi chuẩn bị dữ liệu để so sánh:", error);
      const messageArea = document.getElementById("message-area");
      if (messageArea) {
        messageArea.textContent = `Lỗi: ${
          error instanceof Error ? error.message : "Unknown error"
        }`;
        messageArea.className = "mt-6 text-center font-medium text-red-600";
      }
    } finally {
      setIsLoading(false);
    }
  }, [generateJsonData, fetchAllQuestions, apiJsonData.length, setIsLoading]);

  // Xử lý so sánh kết quả
  const handleCompare = useCallback(() => {
    if (pdfJsonData.length === 0 || apiJsonData.length === 0) {
      return;
    }
    // Make sure comparison results are set in the parent component state
    const results = compareResults(pdfJsonData, apiJsonData);
    console.log("Comparison completed, results:", results);
  }, [pdfJsonData, apiJsonData, compareResults]);

  // Callback để nhận kết quả so sánh từ ComparisonView
  const handleComparisonComplete = useCallback(
    (results: {
      matches: Map<number, number>;
      unmatchedPdfIndices: number[];
      matchedCount: number;
      unmatchedPdfCount: number;
      percentage: number;
      usedApiIndices: Set<number>;
    }) => {
      console.log("Received comparison results from ComparisonView:", results);

      // Cập nhật state trong component cha
      setComparisonResults(results);

      // Kiểm tra tính hợp lệ của kết quả
      if (
        !results ||
        !results.unmatchedPdfIndices ||
        results.unmatchedPdfIndices.length === 0
      ) {
        console.log("No unmatched questions to process for deduplication");
      } else {
        console.log(
          `Found ${results.unmatchedPdfIndices.length} unmatched questions ready for deduplication`
        );
      }
    },
    [setComparisonResults]
  );

  // Xử lý chuyển sang bước loại bỏ trùng lặp
  const handleProceedToDeduplication = useCallback(() => {
    console.log("Proceeding to deduplication step", comparisonResults);

    // Kiểm tra tính hợp lệ của dữ liệu
    if (!comparisonResults) {
      console.error(
        "Cannot proceed to deduplication: comparison results are null"
      );
      // Hiển thị thông báo lỗi cho người dùng
      const messageArea = document.getElementById("message-area");
      if (messageArea) {
        messageArea.textContent =
          "Lỗi: Không có kết quả so sánh để xử lý. Vui lòng thực hiện so sánh lại.";
        messageArea.className = "mt-6 text-center font-medium text-red-600";
      }
      return;
    }

    if (comparisonResults.unmatchedPdfIndices.length === 0) {
      console.log("No unmatched questions to deduplicate");
      // Hiển thị thông báo cho người dùng
      const messageArea = document.getElementById("message-area");
      if (messageArea) {
        messageArea.textContent =
          "Không có câu hỏi chưa khớp để xử lý trùng lặp.";
        messageArea.className = "mt-6 text-center font-medium text-yellow-600";
      }
      return;
    }

    try {
      // Tiến hành loại bỏ trùng lặp và chuyển sang bước 4
      deduplicateUnmatchedQuestions(comparisonResults, pdfJsonData);
      setCurrentStep(4);
    } catch (error) {
      console.error("Error during deduplication:", error);
      // Hiển thị thông báo lỗi cho người dùng
      const messageArea = document.getElementById("message-area");
      if (messageArea) {
        messageArea.textContent = `Lỗi khi xử lý trùng lặp: ${
          error instanceof Error ? error.message : "Unknown error"
        }`;
        messageArea.className = "mt-6 text-center font-medium text-red-600";
      }
    }
  }, [
    comparisonResults,
    pdfJsonData,
    deduplicateUnmatchedQuestions,
    setCurrentStep,
  ]);

  // Xử lý các chức năng xuất dữ liệu
  const handleExportJson = useCallback(() => {
    const jsonData = generateJsonData();
    exportToJson(jsonData);
  }, [generateJsonData, exportToJson]);

  const handleExportWord = useCallback(() => {
    exportToWord(extractedQuestions);
  }, [extractedQuestions, exportToWord]);

  const handleExportUnmatchedToWord = useCallback(() => {
    if (!comparisonResults) return;

    // Nếu đang ở bước 4, sử dụng danh sách câu hỏi sau khi loại bỏ trùng lặp
    if (currentStep === 4) {
      exportUnmatchedToWord(deduplicationState.deduplicated);
    } else {
      // Nếu đang ở bước 3, sử dụng danh sách câu hỏi chưa khớp
      const questionsToExport = comparisonResults.unmatchedPdfIndices.map(
        (index) => pdfJsonData[index]
      );
      exportUnmatchedToWord(questionsToExport);
    }
  }, [
    comparisonResults,
    currentStep,
    deduplicationState.deduplicated,
    pdfJsonData,
    exportUnmatchedToWord,
  ]);

  const handleExportDetailedReport = useCallback(() => {
    exportDetailedReport(deduplicationState);
  }, [deduplicationState, exportDetailedReport]);

  // Điều hướng giữa các bước
  const handleGoBack = useCallback(() => {
    if (currentStep === 2) {
      setCurrentStep(1);
    } else if (currentStep === 3) {
      setViewMode("main");
      setCurrentStep(2);
    } else if (currentStep === 4) {
      setCurrentStep(3);
    }
  }, [currentStep]);

  const handleGoForward = useCallback(() => {
    if (currentStep === 1 && pdfFiles) {
      processPdfFiles().then((questions) => {
        if (questions && questions.length > 0) {
          setCurrentStep(2);
        }
      });
    } else if (currentStep === 2) {
      showComparisonView();
    } else if (currentStep === 3 && comparisonResults) {
      handleProceedToDeduplication();
    }
  }, [
    currentStep,
    pdfFiles,
    processPdfFiles,
    showComparisonView,
    comparisonResults,
    handleProceedToDeduplication,
  ]);

  // Reset UI state
  const resetUI = useCallback(() => {
    resetPdfState();
    setCurrentStep(1);
    setViewMode("main");
  }, [resetPdfState]);

  // Loading state
  if (productLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="loader ease-linear rounded-full border-8 border-t-8 border-gray-200 h-16 w-16 mx-auto"></div>
        <p className="ml-4">Đang tải...</p>
      </div>
    );
  }

  return (
    <div className="bg-gray-100 text-gray-800 min-h-screen p-4">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={() => router.push(`/product-exams/${productId}`)}
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Quay lại
          </Button>
          <h1 className="text-3xl font-bold">Check đề thi: {product?.name}</h1>
        </div>
      </div>

      <style jsx global>{`
        .loader {
          border-top-color: #3498db;
          -webkit-animation: spinner 1.5s linear infinite;
          animation: spinner 1.5s linear infinite;
        }

        @-webkit-keyframes spinner {
          0% {
            -webkit-transform: rotate(0deg);
          }
          100% {
            -webkit-transform: rotate(360deg);
          }
        }

        @keyframes spinner {
          0% {
            transform: rotate(0deg);
          }
          100% {
            transform: rotate(360deg);
          }
        }

        .step-active {
          animation: pulse 2s infinite;
        }

        @keyframes pulse {
          0% {
            box-shadow: 0 0 0 0 rgba(59, 130, 246, 0.5);
          }
          70% {
            box-shadow: 0 0 0 10px rgba(59, 130, 246, 0);
          }
          100% {
            box-shadow: 0 0 0 0 rgba(59, 130, 246, 0);
          }
        }
      `}</style>

      {viewMode === "main" ? (
        <div className="w-full max-w-4xl mx-auto bg-white rounded-2xl shadow-lg p-6 md:p-8">
          <header className="text-center mb-6">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
              Trình Trích Xuất Câu Hỏi từ PDF
            </h1>

            {/* Step Navigation */}
            <StepNavigation
              steps={steps}
              currentStep={currentStep}
              canGoBack={currentStep > 1}
              canGoForward={
                (currentStep === 1 && pdfFiles !== null) ||
                (currentStep === 2 && extractedQuestions.length > 0)
              }
              onGoBack={handleGoBack}
              onGoForward={handleGoForward}
            />

            {pdfLibraryError && (
              <p className="mt-2 text-red-600 font-medium">{pdfLibraryError}</p>
            )}
            {!pdfLoaded && !pdfLibraryError && (
              <p className="mt-2 text-yellow-600">
                Đang tải thư viện PDF.js... Vui lòng đợi.
              </p>
            )}
          </header>

          {/* Step 1 - Upload PDF */}
          {currentStep === 1 && (
            <>
              <FileUploader onFileChange={setPdfFiles} />

              <div className="mt-6 flex justify-center">
                <QuestionExtractor
                  pdfFiles={pdfFiles}
                  pdfLoaded={pdfLoaded}
                  isLoading={isLoading}
                  onProcessStart={() => {
                    setIsLoading(true);
                    resetUI();
                  }}
                  onProcessComplete={(extractedQuestionsResult) => {
                    setIsLoading(false);
                    setExtractedQuestions(extractedQuestionsResult);

                    // Thông báo thành công
                    const messageArea = document.getElementById("message-area");
                    if (messageArea) {
                      messageArea.textContent = `Đã tìm thấy ${extractedQuestionsResult.length} câu hỏi. Bạn có thể chỉnh sửa chúng.`;
                      messageArea.className =
                        "mt-6 text-center font-medium text-green-600";
                    }

                    // Tự động chuyển sang bước 2
                    setCurrentStep(2);
                  }}
                  onError={(errorMessage) => {
                    setIsLoading(false);
                    const messageArea = document.getElementById("message-area");
                    if (messageArea) {
                      messageArea.textContent = `Lỗi: ${errorMessage}`;
                      messageArea.className =
                        "mt-6 text-center font-medium text-red-600";
                    }
                  }}
                />
              </div>
            </>
          )}

          {/* Step 2 - Extract Answers - GỘP CẢ BƯỚC 3 */}
          {currentStep === 2 && (
            <>
              <div className="mt-6 flex justify-center">
                <AnswerSeparator
                  questions={extractedQuestions}
                  isLoading={isLoading}
                  onSeparateComplete={(processedQuestions) => {
                    setExtractedQuestions(processedQuestions);
                    generateJsonData();

                    const messageArea = document.getElementById("message-area");
                    if (messageArea) {
                      messageArea.textContent =
                        "Đã tách các đáp án bằng dấu #. Bạn có thể chỉnh sửa ở cột bên trái và xem kết quả bên phải.";
                      messageArea.className =
                        "mt-6 text-center font-medium text-blue-600";
                    }
                  }}
                />

                {/* <ExportControls
                  currentStep={currentStep}
                  hasExtractedQuestions={extractedQuestions.length > 0}
                  hasComparisonResults={false}
                  hasDeduplicationResults={false}
                  duplicateGroupsCount={0}
                  onExportWord={handleExportWord}
                  onExportJson={handleExportJson}
                  onExportUnmatchedWord={() => {}}
                  onExportDetailedReport={() => {}}
                />

                <Button
                  variant="default"
                  className="bg-indigo-600"
                  onClick={showComparisonView}
                >
                  Chuyển sang JSON và so sánh câu hỏi
                </Button> */}
              </div>
              <div id="preview-section" className="mt-4">
                <h2 className="text-2xl font-bold text-gray-800 border-b pb-2 mb-4">
                  Xem trước & Chỉnh sửa các câu hỏi
                </h2>
                <p className="text-sm text-gray-500 mb-4">
                  Chỉnh sửa câu hỏi ở cột trái (sử dụng dấu # để tách câu hỏi và
                  đáp án), kết quả dạng trắc nghiệm sẽ hiển thị ở cột phải.
                </p>

                <TwoColumnLayout
                  questions={extractedQuestions}
                  onQuestionsChange={setExtractedQuestions}
                />
              </div>
            </>
          )}

          {isLoading && (
            <div id="loader" className="mt-6 text-center">
              <div className="loader ease-linear rounded-full border-8 border-t-8 border-gray-200 h-16 w-16 mx-auto"></div>
              <p className="mt-4 text-gray-600 font-medium">Đang xử lý...</p>
            </div>
          )}
          <div id="message-area" className="mt-6 text-center font-medium"></div>
        </div>
      ) : (
        <div className="w-full max-w-7xl mx-auto bg-white rounded-2xl shadow-lg p-6 md:p-8">
          <header className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-6">
              So sánh Đề thi và Đề cương
            </h1>

            {/* Step Navigation */}
            <StepNavigation
              steps={steps}
              currentStep={currentStep}
              canGoBack={true}
              canGoForward={
                currentStep === 3 &&
                !!comparisonResults &&
                (comparisonResults.unmatchedPdfCount ?? 0) > 0
              }
              onGoBack={handleGoBack}
              onGoForward={handleProceedToDeduplication}
              nextStepLabel={
                currentStep === 3
                  ? "Tiếp tục bước 4: Loại bỏ trùng lặp"
                  : undefined
              }
            />
          </header>

          {/* Step 3 - So sánh với đề cương */}
          {currentStep === 3 && (
            <>
              <ComparisonView
                pdfJsonData={pdfJsonData}
                apiJsonData={apiJsonData}
                calculateOptimizedSimilarity={calculateOptimizedSimilarity}
                isLoading={isLoading}
                onGoBack={handleGoBack}
                onProceedToDeduplication={handleProceedToDeduplication}
                onComparisonComplete={handleComparisonComplete}
              />

              {/* Nếu đã có kết quả so sánh, hiển thị ComparisonResults */}
              {comparisonResults && (
                <ComparisonResults
                  results={comparisonResults}
                  pdfJsonData={pdfJsonData}
                  apiJsonData={apiJsonData}
                  onProceedToDeduplication={handleProceedToDeduplication}
                />
              )}

              {/* Export Controls */}
              <ExportControls
                currentStep={currentStep}
                hasExtractedQuestions={extractedQuestions.length > 0}
                hasComparisonResults={comparisonResults !== null}
                hasDeduplicationResults={false}
                duplicateGroupsCount={0}
                onExportWord={handleExportWord}
                onExportJson={handleExportJson}
                onExportUnmatchedWord={handleExportUnmatchedToWord}
                onExportDetailedReport={() => {}}
              />
            </>
          )}

          {/* Step 4 - Loại bỏ trùng lặp */}
          {currentStep === 4 && (
            <>
              {/* Export Controls */}
              <ExportControls
                currentStep={currentStep}
                hasExtractedQuestions={extractedQuestions.length > 0}
                hasComparisonResults={comparisonResults !== null}
                hasDeduplicationResults={
                  deduplicationState.deduplicated.length > 0
                }
                duplicateGroupsCount={deduplicationState.duplicateGroups.length}
                onExportWord={handleExportWord}
                onExportJson={handleExportJson}
                onExportUnmatchedWord={handleExportUnmatchedToWord}
                onExportDetailedReport={handleExportDetailedReport}
              />

              {/* Hiển thị kết quả loại bỏ trùng lặp */}
              <DeduplicationResults
                deduplicationState={deduplicationState}
                expandedGroups={expandedGroups}
                showAllDetails={showAllDetails}
                toggleGroupExpand={toggleGroupExpand}
                toggleAllGroups={toggleAllGroups}
                onExportDeduplicated={handleExportUnmatchedToWord}
                onExportDetailedReport={handleExportDetailedReport}
              />
            </>
          )}
        </div>
      )}
    </div>
  );
}
