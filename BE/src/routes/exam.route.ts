import express from "express";
import examController from "../controllers/exam.controller";
import questionController from "../controllers/question.controller";
import asyncHandler from "../util/asynHandler";

const router = express.Router();

// Lấy bài kiểm tra theo ID
router.get("/:examId", asyncHandler(examController.getExamById));

// Cập nhật bài kiểm tra
router.patch("/:examId", asyncHandler(examController.updateExam));

// Xóa bài kiểm tra
router.delete("/:examId", asyncHandler(examController.deleteExam));

// Lấy bài kiểm tra kèm tất cả câu hỏi
router.get("/:examId/full", asyncHandler(examController.getExamWithQuestions));

// Routes cho questions liên quan đến exam
router.get(
  "/:examId/questions",
  asyncHandler(questionController.getQuestionsByExam)
);
router.post(
  "/:examId/questions",
  asyncHandler(questionController.createQuestion)
);

// Route để tạo nhiều câu hỏi cùng lúc
router.post(
  "/:examId/questions/batch",
  asyncHandler(questionController.createMultipleQuestions)
);

export default router;
