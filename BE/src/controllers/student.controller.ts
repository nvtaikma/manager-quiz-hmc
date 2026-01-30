import { Request, Response } from "express";
import studentService from "../service/student.service";
import { responseError } from "../util/errorhandler";

class StudentController {
  /**
   * Lấy danh sách sinh viên theo khóa học
   */
  async getStudentsByCourse(req: Request, res: Response) {
    try {
      const { productId } = req.params;
      const { page } = req.query as unknown as { page: number };

      const result = await studentService.getListStudentByProductId(
        productId,
        page
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
   * Tạo sinh viên mới
   */
  async createStudent(req: Request, res: Response) {
    try {
      const studentData = req.body;
      const newStudent = await studentService.createStudent(studentData);

      return res.status(201).json({
        message: "Success",
        data: newStudent,
      });
    } catch (error: any) {
      return responseError(res, error.message, 400);
    }
  }

  /**
   * Xóa sinh viên
   */
  async deleteStudent(req: Request, res: Response) {
    try {
      const { studentId } = req.params;

      const result = await studentService.deleteStudent(studentId);

      return res.status(200).json({
        message: "Success",
        data: result,
      });
    } catch (error: any) {
      return responseError(res, error.message, 400);
    }
  }

  async deleteStudentByProductIdAndEmail(req: Request, res: Response) {
    try {
      const { productId, email } = req.params;

      const result = await studentService.deleteStudentByProductIdAndEmail(
        productId,
        email
      );

      return res.status(200).json({
        message: "Success",
        data: result,
      });
    } catch (error: any) {
      return responseError(res, error.message, 400);
    }
  }

  async getStudentByEmailAndProductId(req: Request, res: Response) {
    try {
      const { email } = req.params;
      const { productId } = req.params;
      console.log("email", email);
      console.log("productId", productId);
      const result = await studentService.getStudentByEmailAndProductId(
        email,
        productId
      );

      return res.status(200).json({
        message: "Success",
        data: result,
      });
    } catch (error: any) {
      return responseError(res, error.message, 400);
    }
  }

  async getAllStudent(req: Request, res: Response) {
    try {
      const { status } = req.params;
      const { page } = req.query as unknown as { page: number };

      const result = await studentService.getAllStudent({ status, page });

      return res.status(200).json({
        message: "Success",
        data: result,
      });
    } catch (error: any) {
      return responseError(res, error.message, 400);
    }
  }

  async updateStudentStatus(req: Request, res: Response) {
    try {
      const { studentId } = req.params;
      const { status } = req.body as { status: string };

      const result = await studentService.updateStudentStatus(
        studentId,
        status
      );

      return res.status(200).json({
        message: "Success",
        data: result,
      });
    } catch (error: any) {
      return responseError(res, error.message, 400);
    }
  }

  async exprireOldStudent(req: Request, res: Response) {
    try {
      const result = await studentService.exprireOldStudent();

      return res.status(200).json({
        message: "Success",
        data: result,
      });
    } catch (error: any) {
      return responseError(res, error.message, 400);
    }
  }

  async searchStudentByProductId(req: Request, res: Response) {
    try {
      const { productId } = req.params;
      const { keyword } = req.query as unknown as { keyword: string };
      const { page } = req.query as unknown as { page: number };
      console.log("productId", productId);
      const result = await studentService.searchStudentByProductId(
        keyword,
        productId,
        page
      );

      return res.status(200).json({
        message: "Success",
        data: result,
      });
    } catch (error: any) {
      return responseError(res, error.message, 400);
    }
  }

  async getCountStudentByProductId(req: Request, res: Response) {
    try {
      const { productId } = req.params;
      const result = await studentService.getCountStudentByProductId(productId);

      return res.status(200).json({
        message: "Success",
        data: result,
      });
    } catch (error: any) {
      return responseError(res, error.message, 400);
    }
  }

  /**
   * Lấy danh sách đề thi của sinh viên theo khóa học
   */
  async getStudentExams(req: Request, res: Response) {
    try {
      const { studentId, productId } = req.params;

      // Sử dụng middleware validateStudentCourse trước đó để đảm bảo sinh viên có quyền truy cập
      // Sau đó chuyển đến service để lấy danh sách đề thi
      const result = await studentService.getStudentExams(studentId, productId);

      return res.status(200).json({
        message: "Success",
        data: result,
      });
    } catch (error: any) {
      return responseError(res, error.message, 400);
    }
  }

  /**
   * Lấy danh sách bài kiểm tra của sinh viên theo khóa học
   */
  async getStudentTests(req: Request, res: Response) {
    try {
      const { studentId, productId } = req.params;

      // Sử dụng middleware validateStudentCourse trước đó để đảm bảo sinh viên có quyền truy cập
      // Sau đó chuyển đến service để lấy danh sách bài kiểm tra
      const result = await studentService.getStudentTests(studentId, productId);

      return res.status(200).json({
        message: "Success",
        data: result,
      });
    } catch (error: any) {
      return responseError(res, error.message, 400);
    }
  }
}

export default new StudentController();
