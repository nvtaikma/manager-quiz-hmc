import { Schema } from "mongoose";
import Question from "../models/question";
import Exam from "../models/exam";
import { invalidateExamCache } from "../util/cacheHelper";

interface AnswerData {
  text: string;
  isCorrect: boolean;
  order?: number;
}

interface QuestionData {
  text: string;
  image?: string;
  answers: AnswerData[];
  difficulty?: string;
}

interface BulkDeleteResult {
  deletedCount: number;
  requestedCount: number;
}


class QuestionService {
  /**
   * Lấy danh sách câu hỏi theo bài kiểm tra
   */
  async getQuestionsByExam(examId: Schema.Types.ObjectId | string) {
    try {
      // Kiểm tra bài kiểm tra tồn tại
      const exam = await Exam.findById(examId);
      if (!exam) {
        throw new Error("Không tìm thấy bài kiểm tra");
      }

      const questions = await Question.find({ examId })
        .sort({ orderNumber: 1 })
        .lean();

      const total = await Question.countDocuments({ examId });

      return {
        data: questions,
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Lấy thông tin câu hỏi theo ID
   */
  async getQuestionById(questionId: Schema.Types.ObjectId | string) {
    try {
      const question = await Question.findById(questionId);
      if (!question) {
        throw new Error("Không tìm thấy câu hỏi");
      }
      return question;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Tạo câu hỏi mới
   */
  async createQuestion(
    examId: Schema.Types.ObjectId | string,
    questionData: QuestionData,
  ) {
    try {
      // Kiểm tra bài kiểm tra tồn tại
      const exam = await Exam.findById(examId);
      if (!exam) {
        throw new Error("Không tìm thấy bài kiểm tra");
      }

      // Xác thực dữ liệu câu trả lời
      if (!questionData.answers || questionData.answers.length < 2) {
        throw new Error("Câu hỏi phải có ít nhất 2 câu trả lời");
      }

      const hasCorrectAnswer = questionData.answers.some(
        (answer) => answer.isCorrect,
      );
      if (!hasCorrectAnswer) {
        throw new Error("Phải có ít nhất 1 câu trả lời đúng");
      }

      const newQuestion = await Question.create({
        ...questionData,
        examId,
      });

      // Invalidate cache: câu hỏi mới → dữ liệu exam thay đổi
      void invalidateExamCache(String(examId));

      return newQuestion;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Cập nhật câu hỏi
   */
  async updateQuestion(
    questionId: Schema.Types.ObjectId | string,
    questionData: Partial<QuestionData>,
  ) {
    try {
      const question = await Question.findById(questionId);
      if (!question) {
        throw new Error("Không tìm thấy câu hỏi");
      }

      // Xác thực dữ liệu câu trả lời nếu được cung cấp
      if (questionData.answers) {
        if (questionData.answers.length < 2) {
          throw new Error("Câu hỏi phải có ít nhất 2 câu trả lời");
        }

        const hasCorrectAnswer = questionData.answers.some(
          (answer) => answer.isCorrect,
        );
        if (!hasCorrectAnswer) {
          throw new Error("Phải có ít nhất 1 câu trả lời đúng");
        }
      }

      const updatedQuestion = await Question.findByIdAndUpdate(
        questionId,
        questionData,
        { new: true },
      );

      // Invalidate cache: question.examId lấy từ findById phía trên
      void invalidateExamCache(String(question.examId));

      return updatedQuestion;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Xóa câu hỏi
   */
  async deleteQuestion(questionId: Schema.Types.ObjectId | string) {
    try {
      const question = await Question.findById(questionId);
      if (!question) {
        throw new Error("Không tìm thấy câu hỏi");
      }

      await Question.findByIdAndDelete(questionId);

      // Invalidate cache: question.examId lấy từ findById phía trên
      void invalidateExamCache(String(question.examId));

      return { message: "Xóa câu hỏi thành công" };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Tạo nhiều câu hỏi cùng lúc
   */
  async createMultipleQuestions(
    examId: Schema.Types.ObjectId | string,
    questionsData: QuestionData[],
  ) {
    try {
      // Kiểm tra bài kiểm tra tồn tại
      const exam = await Exam.findById(examId);
      if (!exam) {
        throw new Error("Không tìm thấy bài kiểm tra");
      }

      if (
        !questionsData ||
        !Array.isArray(questionsData) ||
        questionsData.length === 0
      ) {
        throw new Error("Danh sách câu hỏi không hợp lệ");
      }

      // Kiểm tra tính hợp lệ của từng câu hỏi
      for (const questionData of questionsData) {
        // Xác thực dữ liệu câu trả lời
        if (!questionData.answers || questionData.answers.length < 2) {
          throw new Error("Mỗi câu hỏi phải có ít nhất 2 câu trả lời");
        }

        const hasCorrectAnswer = questionData.answers.some(
          (answer) => answer.isCorrect,
        );
        if (!hasCorrectAnswer) {
          throw new Error("Mỗi câu hỏi phải có ít nhất 1 câu trả lời đúng");
        }
      }

      // Thêm examId vào mỗi câu hỏi
      const questionsWithExamId = questionsData.map((question) => ({
        ...question,
        examId,
      }));

      // Tạo nhiều câu hỏi cùng lúc
      const newQuestions = await Question.insertMany(questionsWithExamId);

      // Invalidate cache: nhiều câu hỏi mới → dữ liệu exam thay đổi
      void invalidateExamCache(String(examId));

      return newQuestions;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Xóa nhiều câu hỏi cùng lúc
   */
  async bulkDeleteQuestions(questionIds: string[]): Promise<BulkDeleteResult> {
    try {
      if (!questionIds || questionIds.length === 0) {
        throw new Error("Danh sách ID câu hỏi không được rỗng");
      }

      // Lấy examId từ câu hỏi đầu tiên trước khi xóa
      // (giả định tất cả questionIds thuộc cùng 1 exam)
      const sampleQuestion = await Question.findOne(
        { _id: { $in: questionIds } },
      ).select("examId").lean();

      const result = await Question.deleteMany({ _id: { $in: questionIds } });

      // Invalidate cache nếu biết examId
      if (sampleQuestion) {
        void invalidateExamCache(String((sampleQuestion as any).examId));
      }

      return {
        deletedCount: result.deletedCount,
        requestedCount: questionIds.length,
      };
    } catch (error) {
      throw error;
    }
  }
}

export default new QuestionService();
