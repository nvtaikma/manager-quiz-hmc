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
import AnswerValidation from "./components/AnswerValidation";
import InputMethodSelector, {
  type InputMethod,
} from "./components/InputMethodSelector";
import TextInput from "./components/TextInput";

// Status message type
type StatusType = "success" | "error" | "info" | "warning" | null;

// Client Component nhận productId trực tiếp từ props
export function CheckExamClient({ productId }: { productId: string }) {
  const router = useRouter();

  // Sử dụng các hooks tùy chỉnh
  const { product, loading: productLoading } = useProduct(productId);
  const { apiJsonData, fetchAllQuestions } = useQuestions(productId);

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

  // State cho status message (thay thế DOM manipulation)
  const [statusMessage, setStatusMessage] = useState<string>("");
  const [statusType, setStatusType] = useState<StatusType>(null);

  // State cho phương thức nhập
  const [inputMethod, setInputMethod] = useState<InputMethod>("pdf");
  const [rawTextInput, setRawTextInput] = useState("");

  // Các bước trong quy trình (tên step 1 thay đổi theo inputMethod)
  const steps = [
    { id: 1, name: inputMethod === "pdf" ? "Tải lên PDF" : "Nhập Text" },
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
    // === VALIDATION: Kiểm tra tất cả câu hỏi đã tách đáp án đúng chưa ===
    const invalidQuestions: { index: number; answerCount: number }[] = [];

    extractedQuestions.forEach((q, idx) => {
      const parts = q
        .replace(/#{2,}/g, "#")
        .split("#")
        .map((p) => p.trim())
        .filter((p) => p);

      // parts[0] = câu hỏi, parts[1..4] = đáp án A B C D
      const answerCount = parts.length - 1; // trừ phần câu hỏi
      if (answerCount !== 4) {
        invalidQuestions.push({ index: idx + 1, answerCount });
      }
    });

    if (invalidQuestions.length > 0) {
      const notSeparated = invalidQuestions.filter((q) => q.answerCount === 0);
      const wrongCount = invalidQuestions.filter((q) => q.answerCount > 0);

      let errorMsg = `⚠️ Không thể chuyển sang bước 3. Có ${invalidQuestions.length} câu hỏi chưa hợp lệ:\n`;

      if (notSeparated.length > 0) {
        errorMsg += `\n• ${notSeparated.length} câu chưa tách đáp án (câu ${notSeparated.map((q) => q.index).join(", ")})`;
      }
      if (wrongCount.length > 0) {
        errorMsg += `\n• ${wrongCount.length} câu có số đáp án sai (${wrongCount.map((q) => `câu ${q.index}: ${q.answerCount} đáp án`).join(", ")})`;
      }
      errorMsg += `\n\nVui lòng kiểm tra và sửa lại trước khi tiếp tục.`;

      setStatusMessage(errorMsg);
      setStatusType("error");
      return;
    }
    // === END VALIDATION ===

    setIsLoading(true);

    try {
      const jsonData = generateJsonData();

      setViewMode("comparison");
      setCurrentStep(3);

      if (apiJsonData.length === 0) {
        await fetchAllQuestions();
      }

      setStatusMessage(
        `Đã chuyển đổi ${jsonData.length} câu hỏi sang dạng JSON và sẵn sàng để so sánh.`,
      );
      setStatusType("success");
    } catch (error) {
      setStatusMessage(
        `Lỗi: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
      setStatusType("error");
    } finally {
      setIsLoading(false);
    }
  }, [
    generateJsonData,
    fetchAllQuestions,
    apiJsonData.length,
    setIsLoading,
    extractedQuestions,
  ]);

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
      setComparisonResults(results);
    },
    [setComparisonResults],
  );

  // Xử lý chuyển sang bước loại bỏ trùng lặp
  const handleProceedToDeduplication = useCallback(() => {
    if (!comparisonResults) {
      setStatusMessage(
        "Lỗi: Không có kết quả so sánh để xử lý. Vui lòng thực hiện so sánh lại.",
      );
      setStatusType("error");
      return;
    }

    if (comparisonResults.unmatchedPdfIndices.length === 0) {
      setStatusMessage("Không có câu hỏi chưa khớp để xử lý trùng lặp.");
      setStatusType("warning");
      return;
    }

    try {
      deduplicateUnmatchedQuestions(comparisonResults, pdfJsonData);
      setCurrentStep(4);
      setStatusMessage("");
      setStatusType(null);
    } catch (error) {
      setStatusMessage(
        `Lỗi khi xử lý trùng lặp: ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
      );
      setStatusType("error");
    }
  }, [comparisonResults, pdfJsonData, deduplicateUnmatchedQuestions]);

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

    if (currentStep === 4) {
      exportUnmatchedToWord(deduplicationState.deduplicated);
    } else {
      const questionsToExport = comparisonResults.unmatchedPdfIndices.map(
        (index) => pdfJsonData[index],
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
    setStatusMessage("");
    setStatusType(null);

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
    if (currentStep === 1 && inputMethod === "pdf" && pdfFiles) {
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
    setStatusMessage("");
    setStatusType(null);
  }, [resetPdfState]);

  // Helper: status message color class
  const getStatusColorClass = (type: StatusType) => {
    switch (type) {
      case "success":
        return "text-green-600";
      case "error":
        return "text-red-600";
      case "info":
        return "text-blue-600";
      case "warning":
        return "text-yellow-600";
      default:
        return "";
    }
  };

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

      {viewMode === "main" ? (
        <div className="w-full max-w-4xl mx-auto bg-white rounded-2xl shadow-lg p-6 md:p-8">
          <header className="text-center mb-6">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
              Trình Trích Xuất Câu Hỏi từ PDF
            </h1>

            <StepNavigation
              steps={steps}
              currentStep={currentStep}
              canGoBack={currentStep > 1}
              canGoForward={
                (currentStep === 1 &&
                  inputMethod === "pdf" &&
                  pdfFiles !== null) ||
                (currentStep === 2 && extractedQuestions.length > 0)
              }
              onGoBack={handleGoBack}
              onGoForward={handleGoForward}
            />

            {inputMethod === "pdf" && pdfLibraryError && (
              <p className="mt-2 text-red-600 font-medium">{pdfLibraryError}</p>
            )}
            {inputMethod === "pdf" && !pdfLoaded && !pdfLibraryError && (
              <p className="mt-2 text-yellow-600">
                Đang tải thư viện PDF.js... Vui lòng đợi.
              </p>
            )}
          </header>

          {/* Step 1 - Nhập câu hỏi (PDF hoặc Text) */}
          {currentStep === 1 && (
            <>
              <InputMethodSelector
                value={inputMethod}
                onChange={(method) => {
                  setInputMethod(method);
                  setStatusMessage("");
                  setStatusType(null);
                }}
                disabled={isLoading}
              />

              {/* Mode PDF */}
              {inputMethod === "pdf" && (
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
                        setStatusMessage(
                          `Đã tìm thấy ${extractedQuestionsResult.length} câu hỏi. Bạn có thể chỉnh sửa chúng.`,
                        );
                        setStatusType("success");
                        setCurrentStep(2);
                      }}
                      onError={(errorMessage) => {
                        setIsLoading(false);
                        setStatusMessage(`Lỗi: ${errorMessage}`);
                        setStatusType("error");
                      }}
                    />
                  </div>
                </>
              )}

              {/* Mode Text */}
              {inputMethod === "text" && (
                <TextInput
                  isLoading={isLoading}
                  value={rawTextInput}
                  onTextChange={setRawTextInput}
                  onProcessComplete={(questions) => {
                    setExtractedQuestions(questions);
                    setStatusMessage(
                      `Đã phân tích ${questions.length} câu hỏi từ text. Đáp án đã được tách tự động.`,
                    );
                    setStatusType("success");
                    setCurrentStep(2);
                  }}
                  onError={(errorMessage) => {
                    setStatusMessage(`Lỗi: ${errorMessage}`);
                    setStatusType("error");
                  }}
                />
              )}
            </>
          )}

          {/* Step 2 - Extract Answers */}
          {currentStep === 2 && (
            <>
              <div className="mt-6 flex justify-center">
                <AnswerSeparator
                  questions={extractedQuestions}
                  isLoading={isLoading}
                  onSeparateComplete={(processedQuestions) => {
                    setExtractedQuestions(processedQuestions);
                    generateJsonData();
                    setStatusMessage(
                      "Đã tách các đáp án bằng dấu #. Bạn có thể chỉnh sửa ở cột bên trái và xem kết quả bên phải.",
                    );
                    setStatusType("info");
                  }}
                />
              </div>

              {/* Validation Panel - hiển thị câu hỏi lỗi ngay sau khi tách */}
              <AnswerValidation questions={extractedQuestions} />

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
            <div className="mt-6 text-center">
              <div className="loader ease-linear rounded-full border-8 border-t-8 border-gray-200 h-16 w-16 mx-auto"></div>
              <p className="mt-4 text-gray-600 font-medium">Đang xử lý...</p>
            </div>
          )}

          {/* Status Message */}
          {statusMessage && statusType && (
            <div
              className={`mt-6 text-center font-medium whitespace-pre-line ${getStatusColorClass(
                statusType,
              )}`}
            >
              {statusMessage}
            </div>
          )}
        </div>
      ) : (
        <div className="w-full max-w-7xl mx-auto bg-white rounded-2xl shadow-lg p-6 md:p-8">
          <header className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-6">
              So sánh Đề thi và Đề cương
            </h1>

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

              {comparisonResults && (
                <ComparisonResults
                  results={comparisonResults}
                  pdfJsonData={pdfJsonData}
                  apiJsonData={apiJsonData}
                  onProceedToDeduplication={handleProceedToDeduplication}
                />
              )}

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

          {/* Status Message in comparison mode */}
          {statusMessage && statusType && (
            <div
              className={`mt-6 text-center font-medium whitespace-pre-line ${getStatusColorClass(
                statusType,
              )}`}
            >
              {statusMessage}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
