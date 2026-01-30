"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const answerSchema = new mongoose_1.Schema({
    text: {
        type: String,
        required: true,
    },
    isCorrect: {
        type: Boolean,
        required: true,
    },
    order: {
        type: Number,
    },
});
const questionSchema = new mongoose_1.Schema({
    examId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "Exam",
        required: true,
    },
    text: {
        type: String,
        required: true,
    },
    image: {
        type: String,
    },
    answers: [answerSchema],
    difficulty: {
        type: String,
        enum: ["easy", "medium", "hard"],
        default: "medium",
    },
    orderNumber: {
        type: Number,
        default: 0,
    },
}, {
    timestamps: true,
});
const Question = (0, mongoose_1.model)("Question", questionSchema);
exports.default = Question;
