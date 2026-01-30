import express from "express";
import questionController from "../controllers/question.controller";
import asyncHandler from "../util/asynHandler";

const router = express.Router();

// Lấy thông tin câu hỏi theo ID
router.get("/:questionId", asyncHandler(questionController.getQuestionById));

// Cập nhật câu hỏi
router.patch("/:questionId", asyncHandler(questionController.updateQuestion));

// Xóa câu hỏi
router.delete("/:questionId", asyncHandler(questionController.deleteQuestion));

export default router;
