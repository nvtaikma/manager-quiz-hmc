"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { DeduplicationState, DuplicateGroup } from "../hooks/useDeduplication";

interface DeduplicationResultsProps {
  deduplicationState: DeduplicationState;
  expandedGroups: Record<number, boolean>;
  showAllDetails: boolean;
  toggleGroupExpand: (groupIndex: number) => void;
  toggleAllGroups: () => void;
  onExportDeduplicated: () => void;
  onExportDetailedReport: () => void;
}

const DeduplicationResults: React.FC<DeduplicationResultsProps> = ({
  deduplicationState,
  expandedGroups,
  showAllDetails,
  toggleGroupExpand,
  toggleAllGroups,
  onExportDeduplicated,
  onExportDetailedReport,
}) => {
  const {
    originalUnmatchedCount,
    duplicatesCount,
    finalCount,
    duplicateGroups,
  } = deduplicationState;

  return (
    <div className="mt-6">
      <div
        id="deduplication-summary"
        className="p-4 bg-purple-50 border border-purple-200 rounded-lg"
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-gray-700">
          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="flex items-center">
              <svg
                className="h-8 w-8 text-blue-500 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                ></path>
              </svg>
              <div>
                <p className="text-sm">Câu hỏi ban đầu</p>
                <p className="font-bold text-2xl">{originalUnmatchedCount}</p>
              </div>
            </div>
          </div>
          <div className="bg-red-50 p-4 rounded-lg">
            <div className="flex items-center">
              <svg
                className="h-8 w-8 text-red-500 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                ></path>
              </svg>
              <div>
                <p className="text-sm">Trùng lặp đã loại</p>
                <p className="font-bold text-2xl">{duplicatesCount}</p>
              </div>
            </div>
          </div>
          <div className="bg-green-50 p-4 rounded-lg">
            <div className="flex items-center">
              <svg
                className="h-8 w-8 text-green-500 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                ></path>
              </svg>
              <div>
                <p className="text-sm">Câu hỏi còn lại</p>
                <p className="font-bold text-2xl">{finalCount}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-4">
          <h3 className="font-bold text-gray-700 mb-2">
            Tiến trình loại bỏ trùng lặp
          </h3>
          <div className="bg-gray-200 h-4 w-full rounded-full overflow-hidden">
            <div
              className="bg-purple-500 h-full"
              style={{
                width: `${
                  originalUnmatchedCount > 0
                    ? ((originalUnmatchedCount - finalCount) /
                        originalUnmatchedCount) *
                      100
                    : 0
                }%`,
              }}
            ></div>
          </div>
          <div className="text-right mt-1 text-sm text-gray-600">
            Đã loại bỏ {duplicatesCount} câu hỏi trùng lặp (
            {originalUnmatchedCount > 0
              ? ((duplicatesCount / originalUnmatchedCount) * 100).toFixed(1)
              : 0}
            %)
          </div>
        </div>
      </div>

      <div className="mt-8">
        <h3 className="text-xl font-bold mb-4">
          Danh sách câu hỏi sau khi loại bỏ trùng lặp
        </h3>

        {duplicateGroups.length > 0 ? (
          <>
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center space-x-6 text-sm">
                <div className="flex items-center">
                  <div className="w-4 h-4 bg-green-100 border border-green-300 rounded mr-2"></div>
                  <span>Câu hỏi được giữ lại</span>
                </div>
                <div className="flex items-center">
                  <div className="w-4 h-4 bg-red-50 border border-red-200 rounded mr-2"></div>
                  <span>Câu hỏi trùng lặp đã loại bỏ</span>
                </div>
              </div>

              <button
                type="button"
                onClick={toggleAllGroups}
                className="text-sm flex items-center space-x-1 text-blue-600 hover:text-blue-800"
              >
                {showAllDetails ? (
                  <>
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                    <span>Thu gọn tất cả</span>
                  </>
                ) : (
                  <>
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                    <span>Mở rộng tất cả</span>
                  </>
                )}
              </button>
            </div>

            <div className="mb-2 p-3 bg-gray-50 border border-gray-200 rounded-lg">
              <p className="text-sm text-gray-600">
                Có{" "}
                <span className="font-bold text-blue-700">
                  {duplicateGroups.length}
                </span>{" "}
                nhóm trùng lặp với tổng cộng{" "}
                <span className="font-bold text-blue-700">
                  {duplicatesCount}
                </span>{" "}
                câu hỏi trùng lặp đã được loại bỏ.
              </p>
              <p className="text-sm text-gray-600 mt-1">
                Nhấn vào mỗi nhóm để xem các câu hỏi trùng lặp.
              </p>
            </div>

            <div className="max-h-[60vh] overflow-y-auto">
              <div className="grid grid-cols-1 gap-4">
                {duplicateGroups.map((group, groupIndex) => (
                  <DuplicateGroupItem
                    key={groupIndex}
                    group={group}
                    groupIndex={groupIndex}
                    isExpanded={!!expandedGroups[groupIndex]}
                    toggleExpand={() => toggleGroupExpand(groupIndex)}
                  />
                ))}
              </div>
            </div>
          </>
        ) : (
          <div className="text-center p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-yellow-700">
              Không tìm thấy câu hỏi trùng lặp nào.
            </p>
          </div>
        )}

        {/* Nút xuất dữ liệu */}
        <div className="mt-6 flex justify-center space-x-4">
          <Button
            id="export-deduplicated-btn"
            variant="default"
            className="bg-green-600"
            onClick={onExportDeduplicated}
          >
            Xuất câu hỏi đã loại bỏ trùng lặp (Word)
          </Button>

          <Button
            id="export-detailed-report-btn"
            variant="default"
            className="bg-purple-600"
            onClick={onExportDetailedReport}
            disabled={duplicateGroups.length === 0}
          >
            Xuất báo cáo chi tiết (Word)
          </Button>
        </div>
      </div>
    </div>
  );
};

// Sub-component để hiển thị từng nhóm trùng lặp
interface DuplicateGroupItemProps {
  group: DuplicateGroup;
  groupIndex: number;
  isExpanded: boolean;
  toggleExpand: () => void;
}

const DuplicateGroupItem: React.FC<DuplicateGroupItemProps> = ({
  group,
  groupIndex,
  isExpanded,
  toggleExpand,
}) => {
  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden">
      {/* Câu hỏi gốc với nút toggle */}
      <div
        className="bg-green-100 border-b border-green-200 p-4 cursor-pointer hover:bg-green-200"
        onClick={toggleExpand}
      >
        <div className="flex justify-between items-start">
          <div className="flex items-start space-x-2">
            <div className="mt-0.5">
              <svg
                className="h-5 w-5 text-green-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M5 13l4 4L19 7"
                ></path>
              </svg>
            </div>
            <div className="flex-grow">
              <h4 className="font-bold text-green-800">Câu hỏi được giữ lại</h4>
              <p className="text-green-800 mt-1">
                {group.originalQuestion.question}
              </p>

              {/* Hiển thị đáp án của câu hỏi gốc nếu có */}
              {Object.keys(group.originalQuestion.options || {}).length > 0 && (
                <div className="mt-2 grid grid-cols-2 gap-2">
                  {Object.entries(group.originalQuestion.options).map(
                    ([key, value]) => (
                      <div
                        key={key}
                        className={`text-sm ${
                          group.originalQuestion.correct_answer === key
                            ? "font-bold"
                            : ""
                        }`}
                      >
                        <span className="inline-block w-5">{key}.</span> {value}
                        {group.originalQuestion.correct_answer === key && (
                          <span className="ml-1 text-green-600">
                            (Đáp án đúng)
                          </span>
                        )}
                      </div>
                    )
                  )}
                </div>
              )}
            </div>
          </div>
          <div className="flex items-center">
            <span className="bg-green-200 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded-full mr-2">
              Nhóm {groupIndex + 1}
            </span>
            <span className="bg-red-200 text-red-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
              {group.duplicates.length} trùng lặp
            </span>
            <svg
              className={`ml-2 h-5 w-5 text-green-700 transition-transform ${
                isExpanded ? "transform rotate-180" : ""
              }`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M19 9l-7 7-7-7"
              ></path>
            </svg>
          </div>
        </div>
      </div>

      {/* Các câu hỏi trùng lặp - chỉ hiển thị khi mở rộng */}
      {isExpanded &&
        group.duplicates.map((duplicate, duplicateIndex) => (
          <div
            key={duplicateIndex}
            className="bg-red-50 border-t border-red-100 p-4"
          >
            <div className="flex justify-between items-start">
              <div className="flex items-start space-x-2">
                <div className="mt-0.5">
                  <svg
                    className="h-5 w-5 text-red-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M6 18L18 6M6 6l12 12"
                    ></path>
                  </svg>
                </div>
                <div className="flex-grow">
                  <h4 className="font-bold text-red-700">
                    Trùng lặp #{duplicateIndex + 1}
                  </h4>
                  <p className="text-red-700 mt-1">
                    {duplicate.question.question}
                  </p>

                  {/* Hiển thị đáp án của câu hỏi trùng lặp nếu có */}
                  {Object.keys(duplicate.question.options || {}).length > 0 && (
                    <div className="mt-2 grid grid-cols-2 gap-2">
                      {Object.entries(duplicate.question.options).map(
                        ([key, value]) => (
                          <div
                            key={key}
                            className={`text-sm ${
                              duplicate.question.correct_answer === key
                                ? "font-bold"
                                : ""
                            }`}
                          >
                            <span className="inline-block w-5">{key}.</span>{" "}
                            {value}
                            {duplicate.question.correct_answer === key && (
                              <span className="ml-1 text-red-600">
                                (Đáp án đúng)
                              </span>
                            )}
                          </div>
                        )
                      )}
                    </div>
                  )}
                </div>
              </div>
              <span className="bg-red-200 text-red-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                Độ tương đồng: {duplicate.similarityScore}%
              </span>
            </div>
          </div>
        ))}
    </div>
  );
};

export default DeduplicationResults;
