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
const exam_1 = __importDefault(require("../models/exam"));
const question_1 = __importDefault(require("../models/question"));
const products_1 = __importDefault(require("../models/products"));
class ExamService {
    /**
     * Lấy danh sách bài kiểm tra theo sản phẩm
     */
    getExamsByProduct(productId_1) {
        return __awaiter(this, arguments, void 0, function* (productId, page = 1, limit = 15) {
            try {
                // Kiểm tra sản phẩm tồn tại
                const product = yield products_1.default.findById(productId);
                if (!product) {
                    throw new Error("Không tìm thấy sản phẩm");
                }
                const skip = (page - 1) * limit;
                const exams = yield exam_1.default.find({ productId })
                    .skip(skip)
                    .limit(limit)
                    .sort({ createdAt: -1 });
                const total = yield exam_1.default.countDocuments({ productId });
                return {
                    data: exams,
                    pagination: {
                        total,
                        page,
                        limit,
                        totalPages: Math.ceil(total / limit),
                    },
                };
            }
            catch (error) {
                throw error;
            }
        });
    }
    /**
     * Lấy thông tin bài kiểm tra theo ID
     */
    getExamById(examId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const exam = yield exam_1.default.findById(examId);
                if (!exam) {
                    throw new Error("Không tìm thấy bài kiểm tra");
                }
                return exam;
            }
            catch (error) {
                throw error;
            }
        });
    }
    /**
     * Tạo bài kiểm tra mới
     */
    createExam(productId, examData) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                // Kiểm tra sản phẩm tồn tại
                const product = yield products_1.default.findById(productId);
                if (!product) {
                    throw new Error("Không tìm thấy sản phẩm");
                }
                const newExam = yield exam_1.default.create(Object.assign(Object.assign({}, examData), { productId }));
                return newExam;
            }
            catch (error) {
                throw error;
            }
        });
    }
    /**
     * Cập nhật bài kiểm tra
     */
    updateExam(examId, examData) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const exam = yield exam_1.default.findById(examId);
                if (!exam) {
                    throw new Error("Không tìm thấy bài kiểm tra");
                }
                const updatedExam = yield exam_1.default.findByIdAndUpdate(examId, examData, {
                    new: true,
                });
                return updatedExam;
            }
            catch (error) {
                throw error;
            }
        });
    }
    /**
     * Xóa bài kiểm tra
     */
    deleteExam(examId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const exam = yield exam_1.default.findById(examId);
                if (!exam) {
                    throw new Error("Không tìm thấy bài kiểm tra");
                }
                // Xóa tất cả câu hỏi liên quan
                yield question_1.default.deleteMany({ examId });
                // Xóa bài kiểm tra
                yield exam_1.default.findByIdAndDelete(examId);
                return { message: "Xóa bài kiểm tra thành công" };
            }
            catch (error) {
                throw error;
            }
        });
    }
    /**
     * Lấy bài kiểm tra kèm tất cả câu hỏi
     */
    getExamWithQuestions(examId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const exam = yield exam_1.default.findById(examId);
                if (!exam) {
                    throw new Error("Không tìm thấy bài kiểm tra");
                }
                const questions = yield question_1.default.find({ examId });
                return Object.assign(Object.assign({}, exam.toObject()), { questions });
            }
            catch (error) {
                throw error;
            }
        });
    }
}
exports.default = new ExamService();
