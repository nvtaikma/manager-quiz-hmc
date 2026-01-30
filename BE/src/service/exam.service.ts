import { Schema } from "mongoose";
import Exam from "../models/exam";
import Question from "../models/question";
import Product from "../models/products";

interface ExamData {
  name: string;
  description?: string;
  duration: number;
  status?: string;
}

class ExamService {
  /**
   * Lấy danh sách bài kiểm tra theo sản phẩm
   */
  async getExamsByProduct(
    productId: Schema.Types.ObjectId | string,
    page: number = 1,
    limit: number = 15
  ) {
    try {
      // Kiểm tra sản phẩm tồn tại
      const product = await Product.findById(productId);
      if (!product) {
        throw new Error("Không tìm thấy sản phẩm");
      }

      const skip = (page - 1) * limit;
      const exams = await Exam.find({ productId })
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: -1 });

      const total = await Exam.countDocuments({ productId });

      return {
        data: exams,
        pagination: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
        },
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Lấy thông tin bài kiểm tra theo ID
   */
  async getExamById(examId: Schema.Types.ObjectId | string) {
    try {
      const exam = await Exam.findById(examId);
      if (!exam) {
        throw new Error("Không tìm thấy bài kiểm tra");
      }
      return exam;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Tạo bài kiểm tra mới
   */
  async createExam(
    productId: Schema.Types.ObjectId | string,
    examData: ExamData
  ) {
    try {
      // Kiểm tra sản phẩm tồn tại
      const product = await Product.findById(productId);
      if (!product) {
        throw new Error("Không tìm thấy sản phẩm");
      }

      const newExam = await Exam.create({
        ...examData,
        productId,
      });

      return newExam;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Cập nhật bài kiểm tra
   */
  async updateExam(
    examId: Schema.Types.ObjectId | string,
    examData: Partial<ExamData>
  ) {
    try {
      const exam = await Exam.findById(examId);
      if (!exam) {
        throw new Error("Không tìm thấy bài kiểm tra");
      }

      const updatedExam = await Exam.findByIdAndUpdate(examId, examData, {
        new: true,
      });

      return updatedExam;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Xóa bài kiểm tra
   */
  async deleteExam(examId: Schema.Types.ObjectId | string) {
    try {
      const exam = await Exam.findById(examId);
      if (!exam) {
        throw new Error("Không tìm thấy bài kiểm tra");
      }

      // Xóa tất cả câu hỏi liên quan
      await Question.deleteMany({ examId });

      // Xóa bài kiểm tra
      await Exam.findByIdAndDelete(examId);

      return { message: "Xóa bài kiểm tra thành công" };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Lấy bài kiểm tra kèm tất cả câu hỏi
   */
  async getExamWithQuestions(examId: Schema.Types.ObjectId | string) {
    try {
      const exam = await Exam.findById(examId);
      if (!exam) {
        throw new Error("Không tìm thấy bài kiểm tra");
      }

      const questions = await Question.find({ examId });

      return {
        ...exam.toObject(),
        questions,
      };
    } catch (error) {
      throw error;
    }
  }
}

export default new ExamService();
