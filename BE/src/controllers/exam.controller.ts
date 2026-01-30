import { Request, Response } from "express";
import examService from "../service/exam.service";
import { responseError } from "../util/errorhandler";

class ExamController {
  /**
   * Lấy danh sách bài kiểm tra theo sản phẩm
   */
  async getExamsByProduct(req: Request, res: Response) {
    try {
      const { productId } = req.params;
      const { page = 1, limit = 15 } = req.query;

      const result = await examService.getExamsByProduct(
        productId,
        Number(page),
        Number(limit)
      );

      return res.status(200).json({
        message: "Success",
        data: result,
      });
    } catch (error: any) {
      return responseError(res, error.message, 400);
    }
  }

  /**
   * Lấy thông tin bài kiểm tra theo ID
   */
  async getExamById(req: Request, res: Response) {
    try {
      const { examId } = req.params;
      const exam = await examService.getExamById(examId);

      return res.status(200).json({
        message: "Success",
        data: exam,
      });
    } catch (error: any) {
      return responseError(res, error.message, 400);
    }
  }

  /**
   * Tạo bài kiểm tra mới
   */
  async createExam(req: Request, res: Response) {
    try {
      const { productId } = req.params;
      const examData = req.body;

      const newExam = await examService.createExam(productId, examData);

      return res.status(201).json({
        message: "Success",
        data: newExam,
      });
    } catch (error: any) {
      return responseError(res, error.message, 400);
    }
  }

  /**
   * Cập nhật bài kiểm tra
   */
  async updateExam(req: Request, res: Response) {
    try {
      const { examId } = req.params;
      const examData = req.body;

      const updatedExam = await examService.updateExam(examId, examData);

      return res.status(200).json({
        message: "Success",
        data: updatedExam,
      });
    } catch (error: any) {
      return responseError(res, error.message, 400);
    }
  }

  /**
   * Xóa bài kiểm tra
   */
  async deleteExam(req: Request, res: Response) {
    try {
      const { examId } = req.params;

      const result = await examService.deleteExam(examId);

      return res.status(200).json({
        message: "Success",
        data: result,
      });
    } catch (error: any) {
      return responseError(res, error.message, 400);
    }
  }

  /**
   * Lấy bài kiểm tra kèm tất cả câu hỏi
   */
  async getExamWithQuestions(req: Request, res: Response) {
    try {
      const { examId } = req.params;

      const result = await examService.getExamWithQuestions(examId);

      return res.status(200).json({
        message: "Success",
        data: result,
      });
    } catch (error: any) {
      return responseError(res, error.message, 400);
    }
  }
}

export default new ExamController();
