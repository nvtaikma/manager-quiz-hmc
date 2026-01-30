"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const question_service_1 = __importDefault(require("../service/question.service"));
const errorhandler_1 = require("../util/errorhandler");
class QuestionController {
    /**
     * Lấy danh sách câu hỏi theo bài kiểm tra
     */
    getQuestionsByExam(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { examId } = req.params;
                const result = yield question_service_1.default.getQuestionsByExam(examId);
                return res.status(200).json({
                    message: "Success",
                    data: result,
                });
            }
            catch (error) {
                return (0, errorhandler_1.responseError)(res, error.message, 400);
            }
        });
    }
    /**
     * Lấy thông tin câu hỏi theo ID
     */
    getQuestionById(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { questionId } = req.params;
                const question = yield question_service_1.default.getQuestionById(questionId);
                return res.status(200).json({
                    message: "Success",
                    data: question,
                });
            }
            catch (error) {
                return (0, errorhandler_1.responseError)(res, error.message, 400);
            }
        });
    }
    /**
     * Tạo câu hỏi mới
     */
    createQuestion(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { examId } = req.params;
                const questionData = req.body;
                const newQuestion = yield question_service_1.default.createQuestion(examId, questionData);
                return res.status(201).json({
                    message: "Success",
                    data: newQuestion,
                });
            }
            catch (error) {
                return (0, errorhandler_1.responseError)(res, error.message, 400);
            }
        });
    }
    /**
     * Cập nhật câu hỏi
     */
    updateQuestion(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { questionId } = req.params;
                const questionData = req.body;
                const updatedQuestion = yield question_service_1.default.updateQuestion(questionId, questionData);
                return res.status(200).json({
                    message: "Success",
                    data: updatedQuestion,
                });
            }
            catch (error) {
                return (0, errorhandler_1.responseError)(res, error.message, 400);
            }
        });
    }
    /**
     * Xóa câu hỏi
     */
    deleteQuestion(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { questionId } = req.params;
                const result = yield question_service_1.default.deleteQuestion(questionId);
                return res.status(200).json({
                    message: "Success",
                    data: result,
                });
            }
            catch (error) {
                return (0, errorhandler_1.responseError)(res, error.message, 400);
            }
        });
    }
    /**
     * Tạo nhiều câu hỏi cùng lúc
     */
    createMultipleQuestions(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { examId } = req.params;
                const { questions } = req.body;
                if (!questions || !Array.isArray(questions) || questions.length === 0) {
                    return (0, errorhandler_1.responseError)(res, "Danh sách câu hỏi không hợp lệ", 400);
                }
                const newQuestions = yield question_service_1.default.createMultipleQuestions(examId, questions);
                return res.status(201).json({
                    message: "Tạo nhiều câu hỏi thành công",
                    data: {
                        count: newQuestions.length,
                        questions: newQuestions,
                    },
                });
            }
            catch (error) {
                return (0, errorhandler_1.responseError)(res, error.message, 400);
            }
        });
    }
}
exports.default = new QuestionController();
