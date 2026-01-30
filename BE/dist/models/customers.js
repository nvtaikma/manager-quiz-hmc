"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const customerSchema = new mongoose_1.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    status: { type: String, enum: ["active", "inactive"], default: "active" },
    count: { type: Number, default: 0 },
    avatar: {
        type: String,
        default: function () {
            return `https://ui-avatars.com/api/?name=${this.email}&background=random`;
        },
    },
}, { timestamps: true });
const Customer = (0, mongoose_1.model)("Customer", customerSchema);
exports.default = Customer;
