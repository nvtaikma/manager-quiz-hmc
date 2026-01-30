import { useState, useCallback } from "react";
import { QuestionData } from "./useQuestions";
import { ComparisonResults } from "./useComparison";

export interface DuplicateGroup {
  originalIndex: number;
  originalQuestion: QuestionData;
  duplicates: Array<{
    index: number;
    question: QuestionData;
    similarityScore: number;
  }>;
}

export interface DeduplicationState {
  originalUnmatchedCount: number;
  duplicatesCount: number;
  finalCount: number;
  deduplicated: QuestionData[];
  isProcessing: boolean;
  duplicateGroups: DuplicateGroup[];
}

export const useDeduplication = (
  calculateOptimizedSimilarity: (str1: string, str2: string) => number
) => {
  const [deduplicationState, setDeduplicationState] =
    useState<DeduplicationState>({
      originalUnmatchedCount: 0,
      duplicatesCount: 0,
      finalCount: 0,
      deduplicated: [],
      isProcessing: false,
      duplicateGroups: [],
    });

  // Thêm trạng thái hiển thị trùng lặp
  const [expandedGroups, setExpandedGroups] = useState<Record<number, boolean>>(
    {}
  );
  const [showAllDetails, setShowAllDetails] = useState(false);

  // Hàm xử lý toggle hiển thị nhóm trùng lặp
  const toggleGroupExpand = useCallback((groupIndex: number) => {
    setExpandedGroups((prev) => ({
      ...prev,
      [groupIndex]: !prev[groupIndex],
    }));
  }, []);

  // Hàm xử lý toggle hiển thị tất cả nhóm
  const toggleAllGroups = useCallback(() => {
    const newValue = !showAllDetails;
    setShowAllDetails(newValue);

    // Nếu hiển thị tất cả, mở rộng tất cả các nhóm
    // Nếu thu gọn tất cả, đóng tất cả các nhóm
    const newExpandedGroups: Record<number, boolean> = {};
    deduplicationState.duplicateGroups.forEach((_, idx) => {
      newExpandedGroups[idx] = newValue;
    });
    setExpandedGroups(newExpandedGroups);
  }, [showAllDetails, deduplicationState.duplicateGroups]);

  // Xử lý phát hiện và loại bỏ trùng lặp trong các câu hỏi chưa khớp
  const deduplicateUnmatchedQuestions = useCallback(
    (comparisonResults: ComparisonResults, pdfJsonData: QuestionData[]) => {
      console.time("deduplicateUnmatchedQuestions");
      setDeduplicationState((prev) => ({ ...prev, isProcessing: true }));

      try {
        const unmatchedQuestions = comparisonResults.unmatchedPdfIndices.map(
          (index) => pdfJsonData[index]
        );

        const originalCount = unmatchedQuestions.length;
        if (originalCount === 0) {
          setDeduplicationState({
            originalUnmatchedCount: 0,
            duplicatesCount: 0,
            finalCount: 0,
            deduplicated: [],
            isProcessing: false,
            duplicateGroups: [],
          });
          return { deduplicated: [], duplicatesCount: 0 };
        }

        console.log(
          `Bắt đầu phát hiện trùng lặp trên ${originalCount} câu hỏi chưa khớp`
        );

        // Ngưỡng tương đồng cho trùng lặp (cao hơn ngưỡng so sánh thông thường)
        const duplicateThreshold = 90; // 90% similarity threshold for duplicates

        // Theo dõi các câu hỏi đã được kiểm tra
        const processed = new Set<number>();
        const unique: QuestionData[] = [];
        const duplicateGroups: DuplicateGroup[] = [];

        // Thuật toán phát hiện trùng lặp
        for (let i = 0; i < unmatchedQuestions.length; i++) {
          if (processed.has(i)) continue;

          processed.add(i);
          unique.push(unmatchedQuestions[i]);

          // Tạo nhóm câu hỏi trùng lặp mới
          const duplicateGroup: DuplicateGroup = {
            originalIndex: i,
            originalQuestion: unmatchedQuestions[i],
            duplicates: [],
          };

          // So sánh với tất cả các câu hỏi còn lại
          for (let j = i + 1; j < unmatchedQuestions.length; j++) {
            if (processed.has(j)) continue;

            const similarity = calculateOptimizedSimilarity(
              unmatchedQuestions[i].question,
              unmatchedQuestions[j].question
            );

            if (similarity >= duplicateThreshold) {
              processed.add(j);

              // Lưu thông tin về câu hỏi trùng lặp
              duplicateGroup.duplicates.push({
                index: j,
                question: unmatchedQuestions[j],
                similarityScore: parseFloat(similarity.toFixed(2)),
              });

              console.log(
                `Phát hiện trùng lặp: Câu hỏi ${i} và ${j} (${similarity.toFixed(
                  2
                )}%)`
              );
            }
          }

          // Nếu có câu hỏi trùng lặp, thêm nhóm này vào danh sách các nhóm
          if (duplicateGroup.duplicates.length > 0) {
            duplicateGroups.push(duplicateGroup);
          }
        }

        const duplicatesCount = duplicateGroups.reduce(
          (sum, group) => sum + group.duplicates.length,
          0
        );

        console.log(
          `Đã tìm thấy ${duplicatesCount} câu hỏi trùng lặp trong ${duplicateGroups.length} nhóm`
        );
        console.log(
          `Còn lại ${unique.length} câu hỏi sau khi loại bỏ trùng lặp`
        );

        // Cập nhật state
        const newDeduplicationState = {
          originalUnmatchedCount: originalCount,
          duplicatesCount,
          finalCount: unique.length,
          deduplicated: unique,
          isProcessing: false,
          duplicateGroups,
        };

        setDeduplicationState(newDeduplicationState);
        console.timeEnd("deduplicateUnmatchedQuestions");

        return {
          deduplicated: unique,
          duplicatesCount,
          deduplicationState: newDeduplicationState,
        };
      } catch (error) {
        console.error("Lỗi khi loại bỏ trùng lặp:", error);
        setDeduplicationState((prev) => ({ ...prev, isProcessing: false }));
        return {
          deduplicated: [],
          duplicatesCount: 0,
          deduplicationState: null,
        };
      }
    },
    [calculateOptimizedSimilarity]
  );

  return {
    deduplicationState,
    setDeduplicationState,
    expandedGroups,
    showAllDetails,
    toggleGroupExpand,
    toggleAllGroups,
    deduplicateUnmatchedQuestions,
  };
};

export default useDeduplication;
