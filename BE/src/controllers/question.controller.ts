import { Request, Response } from "express";
import questionService from "../service/question.service";
import { responseError } from "../util/errorhandler";

class QuestionController {
  /**
   * Lấy danh sách câu hỏi theo bài kiểm tra
   */
  async getQuestionsByExam(req: Request, res: Response) {
    try {
      const { examId } = req.params;

      const result = await questionService.getQuestionsByExam(examId);

      return res.status(200).json({
        message: "Success",
        data: result,
      });
    } catch (error: any) {
      return responseError(res, error.message, 400);
    }
  }

  /**
   * Lấy thông tin câu hỏi theo ID
   */
  async getQuestionById(req: Request, res: Response) {
    try {
      const { questionId } = req.params;
      const question = await questionService.getQuestionById(questionId);

      return res.status(200).json({
        message: "Success",
        data: question,
      });
    } catch (error: any) {
      return responseError(res, error.message, 400);
    }
  }

  /**
   * Tạo câu hỏi mới
   */
  async createQuestion(req: Request, res: Response) {
    try {
      const { examId } = req.params;
      const questionData = req.body;

      const newQuestion = await questionService.createQuestion(
        examId,
        questionData
      );

      return res.status(201).json({
        message: "Success",
        data: newQuestion,
      });
    } catch (error: any) {
      return responseError(res, error.message, 400);
    }
  }

  /**
   * Cập nhật câu hỏi
   */
  async updateQuestion(req: Request, res: Response) {
    try {
      const { questionId } = req.params;
      const questionData = req.body;

      const updatedQuestion = await questionService.updateQuestion(
        questionId,
        questionData
      );

      return res.status(200).json({
        message: "Success",
        data: updatedQuestion,
      });
    } catch (error: any) {
      return responseError(res, error.message, 400);
    }
  }

  /**
   * Xóa câu hỏi
   */
  async deleteQuestion(req: Request, res: Response) {
    try {
      const { questionId } = req.params;

      const result = await questionService.deleteQuestion(questionId);

      return res.status(200).json({
        message: "Success",
        data: result,
      });
    } catch (error: any) {
      return responseError(res, error.message, 400);
    }
  }

  /**
   * Tạo nhiều câu hỏi cùng lúc
   */
  async createMultipleQuestions(req: Request, res: Response) {
    try {
      const { examId } = req.params;
      const { questions } = req.body;

      if (!questions || !Array.isArray(questions) || questions.length === 0) {
        return responseError(res, "Danh sách câu hỏi không hợp lệ", 400);
      }

      const newQuestions = await questionService.createMultipleQuestions(
        examId,
        questions
      );

      return res.status(201).json({
        message: "Tạo nhiều câu hỏi thành công",
        data: {
          count: newQuestions.length,
          questions: newQuestions,
        },
      });
    } catch (error: any) {
      return responseError(res, error.message, 400);
    }
  }
}

export default new QuestionController();
