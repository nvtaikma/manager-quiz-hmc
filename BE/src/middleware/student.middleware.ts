import { Request, Response, NextFunction } from "express";
import Student from "../models/student";
import { responseError } from "../util/errorhandler";

// Mở rộng interface Request để thêm các thuộc tính cần thiết
declare global {
  namespace Express {
    interface Request {
      student?: any;
      studentCourses?: any[];
    }
  }
}

/**
 * Middleware xác thực sinh viên có tồn tại trong hệ thống
 */
export const validateStudent = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { studentId } = req.params;

    const student = await Student.findById(studentId);

    if (!student) {
      return responseError(res, "Sinh viên không tồn tại", 404);
    }

    // Lưu thông tin sinh viên vào request để sử dụng ở các middleware tiếp theo
    req.student = student;
    next();
  } catch (error: any) {
    return responseError(res, error.message, 400);
  }
};

/**
 * Middleware lấy danh sách khóa học mà sinh viên đã tham gia
 */
export const getStudentCourses = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { studentId } = req.params;

    // Tìm tất cả các khóa học (products) mà sinh viên đã tham gia
    const coursesData = await Student.find({ _id: studentId })
      .populate("productId", "name status")
      .lean();

    if (!coursesData || coursesData.length === 0) {
      return responseError(res, "Sinh viên chưa tham gia khóa học nào", 404);
    }

    // Lấy danh sách productId từ kết quả
    const courses = coursesData.map((data) => data.productId);

    // Lưu danh sách khóa học vào request để sử dụng ở các middleware tiếp theo
    req.studentCourses = courses;

    // Nếu được gọi như một API độc lập, trả về kết quả
    if (req.url.endsWith("/courses")) {
      return res.status(200).json({
        message: "Success",
        data: courses,
      });
    }

    // Nếu không thì chuyển đến middleware tiếp theo
    next();
  } catch (error: any) {
    return responseError(res, error.message, 400);
  }
};

/**
 * Middleware xác thực sinh viên có quyền truy cập khóa học
 */
export const validateStudentCourse = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { studentId, productId } = req.params;

    // Kiểm tra xem sinh viên có thuộc khóa học này hay không
    const enrollment = await Student.findOne({
      _id: studentId,
      productId,
    });

    if (!enrollment) {
      return responseError(
        res,
        "Sinh viên không có quyền truy cập khóa học này",
        403
      );
    }

    next();
  } catch (error: any) {
    return responseError(res, error.message, 400);
  }
};
