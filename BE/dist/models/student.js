"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const studentSchema = new mongoose_1.Schema({
    email: { type: String, required: true, lowercase: true },
    productId: { type: mongoose_1.Schema.Types.ObjectId, ref: "Product" },
    status: {
        type: String,
        enum: ["completed", "pending", "expired"],
        default: "pending",
    },
}, { timestamps: true });
const Student = (0, mongoose_1.model)("Student", studentSchema);
exports.default = Student;
