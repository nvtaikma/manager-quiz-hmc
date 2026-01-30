import { useState, useCallback } from "react";
import { API_BASE_URL } from "@/contants/api";

export interface Question {
  _id: string;
  text: string;
  answers: Array<{
    text: string;
    isCorrect: boolean;
  }>;
  examName?: string;
}

export interface QuestionData {
  question: string;
  options: Record<string, string>;
  correct_answer: string | null;
}

export const useQuestions = (productId: string) => {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [apiJsonData, setApiJsonData] = useState<QuestionData[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Hàm lấy tất cả câu hỏi từ các đề thi
  const fetchAllQuestions = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(
        `${API_BASE_URL}/products/${productId}/exams`
      );

      if (!response.ok) {
        throw new Error(
          `Không thể tải danh sách đề thi. Mã lỗi: ${response.status}`
        );
      }

      const examData = await response.json();
      const examList = examData.data.data || [];

      if (examList.length === 0) {
        setQuestions([]);
        setApiJsonData([]);
        return;
      }

      // Lấy tất cả câu hỏi từ các đề thi
      const allQuestions: Question[] = [];
      for (const exam of examList) {
        try {
          const questionResponse = await fetch(
            `${API_BASE_URL}/exams/${exam._id}/questions`
          );
          if (questionResponse.ok) {
            const questionData = await questionResponse.json();
            const examQuestions = (questionData.data.data || []).map(
              (q: Omit<Question, "examName">) => ({
                ...q,
                examName: exam.name,
              })
            );
            allQuestions.push(...examQuestions);
          }
        } catch (error) {
          console.error(`Lỗi khi tải câu hỏi cho đề thi ${exam.name}:`, error);
        }
      }

      setQuestions(allQuestions);

      // Chuyển đổi định dạng câu hỏi để sử dụng trong so sánh
      const apiData = allQuestions.map((item) => ({
        question: item.text.replace(/^\d+\.\s*/, "").trim(),
        options: item.answers.reduce((acc: Record<string, string>, ans) => {
          const letter = ans.text.charAt(0);
          acc[letter] = ans.text.substring(1).trim();
          return acc;
        }, {}),
        correct_answer:
          item.answers.find((a) => a.isCorrect)?.text.charAt(0) || null,
      }));

      setApiJsonData(apiData);
    } catch (error) {
      console.error("Lỗi khi tải câu hỏi:", error);
      setError(
        error instanceof Error ? error.message : "Có lỗi xảy ra khi tải câu hỏi"
      );
    } finally {
      setLoading(false);
    }
  }, [productId]);

  return {
    questions,
    apiJsonData,
    loading,
    error,
    fetchAllQuestions,
  };
};

export default useQuestions;
