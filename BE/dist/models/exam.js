"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const examSchema = new mongoose_1.Schema({
    productId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "products",
        required: true,
    },
    name: {
        type: String,
        required: true,
    },
    description: {
        type: String,
    },
    duration: {
        type: Number,
        required: true,
        default: 45,
        min: 1,
    }, // thời gian tính bằng phút
    status: {
        type: String,
        enum: ["active", "inactive", "draft"],
        default: "active",
    },
}, {
    timestamps: true,
});
const Exam = (0, mongoose_1.model)("Exam", examSchema);
exports.default = Exam;
