"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const exam_controller_1 = __importDefault(require("../controllers/exam.controller"));
const question_controller_1 = __importDefault(require("../controllers/question.controller"));
const asynHandler_1 = __importDefault(require("../util/asynHandler"));
const router = express_1.default.Router();
// Lấy bài kiểm tra theo ID
router.get("/:examId", (0, asynHandler_1.default)(exam_controller_1.default.getExamById));
// Cập nhật bài kiểm tra
router.patch("/:examId", (0, asynHandler_1.default)(exam_controller_1.default.updateExam));
// Xóa bài kiểm tra
router.delete("/:examId", (0, asynHandler_1.default)(exam_controller_1.default.deleteExam));
// Lấy bài kiểm tra kèm tất cả câu hỏi
router.get("/:examId/full", (0, asynHandler_1.default)(exam_controller_1.default.getExamWithQuestions));
// Routes cho questions liên quan đến exam
router.get("/:examId/questions", (0, asynHandler_1.default)(question_controller_1.default.getQuestionsByExam));
router.post("/:examId/questions", (0, asynHandler_1.default)(question_controller_1.default.createQuestion));
// Route để tạo nhiều câu hỏi cùng lúc
router.post("/:examId/questions/batch", (0, asynHandler_1.default)(question_controller_1.default.createMultipleQuestions));
exports.default = router;
