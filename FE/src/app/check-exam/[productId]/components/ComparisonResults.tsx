"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { ComparisonResults as ComparisonResultsType } from "../hooks/useComparison";
import { QuestionData } from "../hooks/useQuestions";
import { Button } from "@/components/ui/button";

interface ComparisonResultsProps {
  results: ComparisonResultsType | null;
  pdfJsonData: QuestionData[];
  apiJsonData: QuestionData[];
  onProceedToDeduplication: () => void;
}

const ComparisonResults: React.FC<ComparisonResultsProps> = ({
  results,
  pdfJsonData,
  apiJsonData,
  onProceedToDeduplication,
}) => {
  // Constants for infinite scroll configuration
  const INITIAL_BATCH_SIZE = 50; // Initial number of items to display
  const BATCH_INCREMENT = 30; // Number of items to load per batch

  // State for tracked displayed items in each table
  const [visibleMatchedCount, setVisibleMatchedCount] =
    useState(INITIAL_BATCH_SIZE);
  const [visibleUnmatchedCount, setVisibleUnmatchedCount] =
    useState(INITIAL_BATCH_SIZE);
  const [isLoadingMore, setIsLoadingMore] = useState<{
    matched: boolean;
    unmatched: boolean;
  }>({
    matched: false,
    unmatched: false,
  });

  // References for intersection observers
  const matchedEndRef = useRef<HTMLDivElement>(null);
  const unmatchedEndRef = useRef<HTMLDivElement>(null);

  // Create safe variables that don't depend on results being non-null
  const matchEntries = results ? Array.from(results.matches.entries()) : [];
  const unmatchedIndices = results ? results.unmatchedPdfIndices : [];

  // Memoized slices of data for rendering
  const matchesToShow = matchEntries.slice(0, visibleMatchedCount);
  const unmatchedToShow = unmatchedIndices.slice(0, visibleUnmatchedCount);

  // Handler to manually load more items
  const handleLoadMore = useCallback(
    (type: "matched" | "unmatched") => {
      if (type === "matched") {
        setVisibleMatchedCount((prev) =>
          Math.min(prev + BATCH_INCREMENT * 2, matchEntries.length)
        );
      } else {
        setVisibleUnmatchedCount((prev) =>
          Math.min(prev + BATCH_INCREMENT * 2, unmatchedIndices.length)
        );
      }
    },
    [matchEntries.length, unmatchedIndices.length]
  );

  // Set up intersection observers for infinite scrolling
  useEffect(() => {
    if (!results) return; // Early return if no results

    const matchedObserver = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (
          entry.isIntersecting &&
          visibleMatchedCount < matchEntries.length &&
          !isLoadingMore.matched
        ) {
          setIsLoadingMore((prev) => ({ ...prev, matched: true }));
          // Use setTimeout to avoid blocking the main thread during rendering
          setTimeout(() => {
            setVisibleMatchedCount((prev) =>
              Math.min(prev + BATCH_INCREMENT, matchEntries.length)
            );
            setIsLoadingMore((prev) => ({ ...prev, matched: false }));
          }, 10);
        }
      },
      { threshold: 0.1 }
    );

    const unmatchedObserver = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (
          entry.isIntersecting &&
          visibleUnmatchedCount < unmatchedIndices.length &&
          !isLoadingMore.unmatched
        ) {
          setIsLoadingMore((prev) => ({ ...prev, unmatched: true }));
          setTimeout(() => {
            setVisibleUnmatchedCount((prev) =>
              Math.min(prev + BATCH_INCREMENT, unmatchedIndices.length)
            );
            setIsLoadingMore((prev) => ({ ...prev, unmatched: false }));
          }, 10);
        }
      },
      { threshold: 0.1 }
    );

    // Connect observers to refs if they exist
    if (matchedEndRef.current && visibleMatchedCount < matchEntries.length) {
      matchedObserver.observe(matchedEndRef.current);
    }

    if (
      unmatchedEndRef.current &&
      visibleUnmatchedCount < unmatchedIndices.length
    ) {
      unmatchedObserver.observe(unmatchedEndRef.current);
    }

    return () => {
      matchedObserver.disconnect();
      unmatchedObserver.disconnect();
    };
  }, [
    visibleMatchedCount,
    visibleUnmatchedCount,
    matchEntries.length,
    unmatchedIndices.length,
    isLoadingMore,
    results,
  ]);

  // Early return if no results after all hooks have been declared
  if (!results) return null;

  return (
    <div className="mt-8">
      <div className="mb-6">
        {/* Hiển thị câu hỏi có trong đề cương */}
        <h2 className="text-2xl font-bold text-gray-800 border-b pb-2 mb-4">
          Câu hỏi có trong đề cương ({visibleMatchedCount}/{matchEntries.length}
          )
        </h2>

        {matchEntries.length > 0 ? (
          <>
            <div
              className="overflow-auto max-h-[60vh]"
              role="region"
              aria-label="Câu hỏi có trong đề cương"
            >
              <table className="w-full text-sm text-left text-gray-500 border-collapse border border-gray-200">
                <thead className="text-xs text-gray-700 uppercase bg-gray-50 sticky top-0 z-10">
                  <tr>
                    <th className="w-1/2 px-6 py-3 border border-gray-200">
                      Câu hỏi trong PDF
                    </th>
                    <th className="w-1/2 px-6 py-3 border border-gray-200">
                      Câu hỏi trong Đề cương API
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {matchesToShow.map(([pdfIndex, apiIndex]) => (
                    <tr key={`match-${pdfIndex}`}>
                      <td className="px-4 py-2 border border-gray-200">
                        {pdfJsonData[pdfIndex].question}
                      </td>
                      <td className="px-4 py-2 border border-gray-200">
                        {apiJsonData[apiIndex].question}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Hiển thị trạng thái loading và nút tải thêm */}
              <div ref={matchedEndRef} className="py-4 text-center">
                {visibleMatchedCount < matchEntries.length && (
                  <>
                    {isLoadingMore.matched ? (
                      <div className="flex justify-center items-center py-4">
                        <div className="loader ease-linear rounded-full border-2 border-t-2 border-gray-200 h-6 w-6 mr-2"></div>
                        <span>Đang tải thêm...</span>
                      </div>
                    ) : (
                      <Button
                        variant="outline"
                        onClick={() => handleLoadMore("matched")}
                        className="mx-auto"
                      >
                        Tải thêm (
                        {Math.min(
                          BATCH_INCREMENT * 2,
                          matchEntries.length - visibleMatchedCount
                        )}{" "}
                        câu)
                      </Button>
                    )}
                  </>
                )}
                {visibleMatchedCount === matchEntries.length && (
                  <p className="text-gray-500">
                    Đã hiển thị tất cả {matchEntries.length} kết quả
                  </p>
                )}
              </div>
            </div>
          </>
        ) : (
          <p className="text-center p-4 bg-gray-50 border border-gray-200 rounded-md">
            Không tìm thấy câu hỏi nào khớp với đề cương.
          </p>
        )}
      </div>

      {/* Hiển thị câu hỏi không có trong đề cương */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800 border-b pb-2 mb-4">
          Câu hỏi không có trong đề cương ({visibleUnmatchedCount}/
          {unmatchedIndices.length})
        </h2>

        {unmatchedIndices.length > 0 ? (
          <>
            <div
              className="overflow-auto max-h-[60vh]"
              role="region"
              aria-label="Câu hỏi không có trong đề cương"
            >
              <table className="w-full text-sm text-left text-gray-500 border-collapse border border-gray-200">
                <thead className="text-xs text-gray-700 uppercase bg-gray-50 sticky top-0 z-10">
                  <tr>
                    <th className="w-1/2 px-6 py-3 border border-gray-200">
                      Câu hỏi trong PDF
                    </th>
                    <th className="w-1/2 px-6 py-3 border border-gray-200">
                      Trạng thái
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {unmatchedToShow.map((pdfIndex) => (
                    <tr key={`unmatched-${pdfIndex}`}>
                      <td className="px-4 py-2 border border-gray-200">
                        {pdfJsonData[pdfIndex].question}
                      </td>
                      <td className="px-4 py-2 border border-gray-200 bg-gray-100 text-gray-400 italic">
                        Không tìm thấy trong đề cương
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Hiển thị trạng thái loading và nút tải thêm */}
              <div ref={unmatchedEndRef} className="py-4 text-center">
                {visibleUnmatchedCount < unmatchedIndices.length && (
                  <>
                    {isLoadingMore.unmatched ? (
                      <div className="flex justify-center items-center py-4">
                        <div className="loader ease-linear rounded-full border-2 border-t-2 border-gray-200 h-6 w-6 mr-2"></div>
                        <span>Đang tải thêm...</span>
                      </div>
                    ) : (
                      <Button
                        variant="outline"
                        onClick={() => handleLoadMore("unmatched")}
                        className="mx-auto"
                      >
                        Tải thêm (
                        {Math.min(
                          BATCH_INCREMENT * 2,
                          unmatchedIndices.length - visibleUnmatchedCount
                        )}{" "}
                        câu)
                      </Button>
                    )}
                  </>
                )}
                {visibleUnmatchedCount === unmatchedIndices.length && (
                  <p className="text-gray-500">
                    Đã hiển thị tất cả {unmatchedIndices.length} kết quả
                  </p>
                )}
              </div>
            </div>

            {/* Nút chuyển sang bước loại bỏ trùng lặp */}
            {/* <div className="flex justify-center my-6">
              <Button
                id="proceed-to-step4-btn"
                variant="default"
                className="mt-4 mx-auto block bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700"
                onClick={onProceedToDeduplication}
              >
                Tiếp tục bước 4: Loại bỏ trùng lặp ({unmatchedIndices.length}{" "}
                câu)
              </Button>
            </div> */}
          </>
        ) : (
          <p className="text-center p-4 bg-gray-50 border border-gray-200 rounded-md">
            Tất cả các câu hỏi đều đã khớp với đề cương.
          </p>
        )}
      </div>

      {/* CSS cho animation loading */}
      <style jsx global>{`
        @keyframes spinner {
          0% {
            transform: rotate(0deg);
          }
          100% {
            transform: rotate(360deg);
          }
        }
        .loader {
          animation: spinner 1s linear infinite;
          border-top-color: #3498db;
        }
      `}</style>
    </div>
  );
};

export default ComparisonResults;
