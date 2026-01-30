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
const question_1 = __importDefault(require("../models/question"));
const exam_1 = __importDefault(require("../models/exam"));
class QuestionService {
    /**
     * Lấy danh sách câu hỏi theo bài kiểm tra
     */
    getQuestionsByExam(examId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                // Kiểm tra bài kiểm tra tồn tại
                const exam = yield exam_1.default.findById(examId);
                if (!exam) {
                    throw new Error("Không tìm thấy bài kiểm tra");
                }
                const questions = yield question_1.default.find({ examId })
                    .sort({ orderNumber: 1 })
                    .lean();
                const total = yield question_1.default.countDocuments({ examId });
                return {
                    data: questions,
                };
            }
            catch (error) {
                throw error;
            }
        });
    }
    /**
     * Lấy thông tin câu hỏi theo ID
     */
    getQuestionById(questionId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const question = yield question_1.default.findById(questionId);
                if (!question) {
                    throw new Error("Không tìm thấy câu hỏi");
                }
                return question;
            }
            catch (error) {
                throw error;
            }
        });
    }
    /**
     * Tạo câu hỏi mới
     */
    createQuestion(examId, questionData) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                // Kiểm tra bài kiểm tra tồn tại
                const exam = yield exam_1.default.findById(examId);
                if (!exam) {
                    throw new Error("Không tìm thấy bài kiểm tra");
                }
                // Xác thực dữ liệu câu trả lời
                if (!questionData.answers || questionData.answers.length < 2) {
                    throw new Error("Câu hỏi phải có ít nhất 2 câu trả lời");
                }
                const hasCorrectAnswer = questionData.answers.some((answer) => answer.isCorrect);
                if (!hasCorrectAnswer) {
                    throw new Error("Phải có ít nhất 1 câu trả lời đúng");
                }
                const newQuestion = yield question_1.default.create(Object.assign(Object.assign({}, questionData), { examId }));
                return newQuestion;
            }
            catch (error) {
                throw error;
            }
        });
    }
    /**
     * Cập nhật câu hỏi
     */
    updateQuestion(questionId, questionData) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const question = yield question_1.default.findById(questionId);
                if (!question) {
                    throw new Error("Không tìm thấy câu hỏi");
                }
                // Xác thực dữ liệu câu trả lời nếu được cung cấp
                if (questionData.answers) {
                    if (questionData.answers.length < 2) {
                        throw new Error("Câu hỏi phải có ít nhất 2 câu trả lời");
                    }
                    const hasCorrectAnswer = questionData.answers.some((answer) => answer.isCorrect);
                    if (!hasCorrectAnswer) {
                        throw new Error("Phải có ít nhất 1 câu trả lời đúng");
                    }
                }
                const updatedQuestion = yield question_1.default.findByIdAndUpdate(questionId, questionData, { new: true });
                return updatedQuestion;
            }
            catch (error) {
                throw error;
            }
        });
    }
    /**
     * Xóa câu hỏi
     */
    deleteQuestion(questionId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const question = yield question_1.default.findById(questionId);
                if (!question) {
                    throw new Error("Không tìm thấy câu hỏi");
                }
                yield question_1.default.findByIdAndDelete(questionId);
                return { message: "Xóa câu hỏi thành công" };
            }
            catch (error) {
                throw error;
            }
        });
    }
    /**
     * Tạo nhiều câu hỏi cùng lúc
     */
    createMultipleQuestions(examId, questionsData) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                // Kiểm tra bài kiểm tra tồn tại
                const exam = yield exam_1.default.findById(examId);
                if (!exam) {
                    throw new Error("Không tìm thấy bài kiểm tra");
                }
                if (!questionsData ||
                    !Array.isArray(questionsData) ||
                    questionsData.length === 0) {
                    throw new Error("Danh sách câu hỏi không hợp lệ");
                }
                // Kiểm tra tính hợp lệ của từng câu hỏi
                for (const questionData of questionsData) {
                    // Xác thực dữ liệu câu trả lời
                    if (!questionData.answers || questionData.answers.length < 2) {
                        throw new Error("Mỗi câu hỏi phải có ít nhất 2 câu trả lời");
                    }
                    const hasCorrectAnswer = questionData.answers.some((answer) => answer.isCorrect);
                    if (!hasCorrectAnswer) {
                        throw new Error("Mỗi câu hỏi phải có ít nhất 1 câu trả lời đúng");
                    }
                }
                // Thêm examId vào mỗi câu hỏi
                const questionsWithExamId = questionsData.map((question) => (Object.assign(Object.assign({}, question), { examId })));
                // Tạo nhiều câu hỏi cùng lúc
                const newQuestions = yield question_1.default.insertMany(questionsWithExamId);
                return newQuestions;
            }
            catch (error) {
                throw error;
            }
        });
    }
}
exports.default = new QuestionService();
