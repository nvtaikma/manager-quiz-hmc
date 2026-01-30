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
const exam_service_1 = __importDefault(require("../service/exam.service"));
const errorhandler_1 = require("../util/errorhandler");
class ExamController {
    /**
     * Lấy danh sách bài kiểm tra theo sản phẩm
     */
    getExamsByProduct(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { productId } = req.params;
                const { page = 1, limit = 15 } = req.query;
                const result = yield exam_service_1.default.getExamsByProduct(productId, Number(page), Number(limit));
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
     * Lấy thông tin bài kiểm tra theo ID
     */
    getExamById(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { examId } = req.params;
                const exam = yield exam_service_1.default.getExamById(examId);
                return res.status(200).json({
                    message: "Success",
                    data: exam,
                });
            }
            catch (error) {
                return (0, errorhandler_1.responseError)(res, error.message, 400);
            }
        });
    }
    /**
     * Tạo bài kiểm tra mới
     */
    createExam(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { productId } = req.params;
                const examData = req.body;
                const newExam = yield exam_service_1.default.createExam(productId, examData);
                return res.status(201).json({
                    message: "Success",
                    data: newExam,
                });
            }
            catch (error) {
                return (0, errorhandler_1.responseError)(res, error.message, 400);
            }
        });
    }
    /**
     * Cập nhật bài kiểm tra
     */
    updateExam(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { examId } = req.params;
                const examData = req.body;
                const updatedExam = yield exam_service_1.default.updateExam(examId, examData);
                return res.status(200).json({
                    message: "Success",
                    data: updatedExam,
                });
            }
            catch (error) {
                return (0, errorhandler_1.responseError)(res, error.message, 400);
            }
        });
    }
    /**
     * Xóa bài kiểm tra
     */
    deleteExam(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { examId } = req.params;
                const result = yield exam_service_1.default.deleteExam(examId);
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
     * Lấy bài kiểm tra kèm tất cả câu hỏi
     */
    getExamWithQuestions(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { examId } = req.params;
                const result = yield exam_service_1.default.getExamWithQuestions(examId);
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
}
exports.default = new ExamController();
