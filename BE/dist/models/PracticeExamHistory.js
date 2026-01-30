"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importStar(require("mongoose"));
// Schema cho PracticeExamHistory
const PracticeExamHistorySchema = new mongoose_1.Schema({
    courseId: { type: mongoose_1.Schema.Types.ObjectId, ref: "Product", required: true },
    courseName: { type: String, required: true },
    userId: { type: mongoose_1.Schema.Types.ObjectId, ref: "User", required: true },
    score: { type: Number, default: 0, min: 0, max: 100 }, // Điểm phần trăm
    totalQuestions: { type: Number, required: true, default: 100 },
    correctAnswers: { type: Number, default: 0, min: 0 },
    duration: { type: Number, default: 0 }, // Thời gian làm bài (giây)
    practiceType: {
        type: String,
        enum: ["course-review"],
        default: "course-review",
        required: true,
    },
    status: {
        type: String,
        enum: ["in_progress", "completed", "time_up", "abandoned"],
        default: "in_progress",
        required: true,
    },
    selectedQuestions: [
        {
            questionId: {
                type: mongoose_1.Schema.Types.ObjectId,
                ref: "Question",
                required: true,
            },
            answerOrder: [{ type: Number }], // Lưu thứ tự các câu trả lời [4,2,1,3]
        },
    ],
    userAnswers: [
        {
            questionId: {
                type: mongoose_1.Schema.Types.ObjectId,
                ref: "Question",
                required: true,
            },
            selectedAnswerId: { type: mongoose_1.Schema.Types.ObjectId, required: true }, // Chỉ lưu ID của câu trả lời
            isCorrect: { type: Boolean, required: true },
        },
    ],
    startedAt: { type: Date, default: Date.now, required: true },
    completedAt: { type: Date }, // Optional - chỉ set khi hoàn thành
    lastSyncAt: { type: Date }, // Optional - thời gian sync answers cuối cùng
}, { timestamps: true });
// Tạo index cho tìm kiếm nhanh
PracticeExamHistorySchema.index({ userId: 1, status: 1, createdAt: -1 });
PracticeExamHistorySchema.index({ courseId: 1, userId: 1, status: 1 });
PracticeExamHistorySchema.index({ userId: 1, completedAt: -1 });
PracticeExamHistorySchema.index({ courseId: 1, completedAt: -1 });
// Model cho PracticeExamHistory
exports.default = mongoose_1.default.model("PracticeExamHistory", PracticeExamHistorySchema);
