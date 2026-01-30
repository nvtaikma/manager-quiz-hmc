import express from "express";
import studentController from "../controllers/student.controller";
import asyncHandler from "../util/asynHandler";
import {
  getStudentCourses,
  validateStudent,
  validateStudentCourse,
} from "../middleware/student.middleware";

const router = express.Router();

router.get("/:productId", asyncHandler(studentController.getStudentsByCourse));
router.post("/", asyncHandler(studentController.createStudent));
router.delete("/:studentId", asyncHandler(studentController.deleteStudent));
router.delete(
  "/delete/:productId/:email",
  asyncHandler(studentController.deleteStudentByProductIdAndEmail)
);
router.get(
  "/check/:productId/:email",
  asyncHandler(studentController.getStudentByEmailAndProductId)
);
router.get(
  "/search/:productId",
  asyncHandler(studentController.searchStudentByProductId)
);
router.get(
  "/count/:productId",
  asyncHandler(studentController.getCountStudentByProductId)
);

// Thêm route mới để lấy danh sách khóa học của sinh viên
router.get(
  "/:studentId/courses",
  asyncHandler(validateStudent),
  asyncHandler(getStudentCourses)
);

// Thêm route mới để lấy danh sách đề thi của sinh viên theo khóa học
router.get(
  "/:studentId/courses/:productId/exams",
  asyncHandler(validateStudent),
  asyncHandler(validateStudentCourse),
  asyncHandler(studentController.getStudentExams)
);

// Thêm route mới để lấy danh sách bài kiểm tra của sinh viên theo khóa học
router.get(
  "/:studentId/courses/:productId/tests",
  asyncHandler(validateStudent),
  asyncHandler(validateStudentCourse),
  asyncHandler(studentController.getStudentTests)
);

// Thêm route mới để lấy danh sách sinh viên theo trạng thái
router.get("/status/:status", asyncHandler(studentController.getAllStudent));

// Thêm route mới để cập nhật trạng thái của sinh viên
router.patch(
  "/:studentId/status",
  asyncHandler(studentController.updateStudentStatus)
);

// Thêm route mới để cập nhật trạng thái hết hạn của sinh viên
router.patch("/exprire", asyncHandler(studentController.exprireOldStudent));
export default router;
