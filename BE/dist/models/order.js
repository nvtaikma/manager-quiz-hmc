"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const orderItemSchema = new mongoose_1.Schema({
    productId: { type: mongoose_1.Schema.Types.ObjectId, ref: "Product", required: true },
    type: {
        type: String,
        required: true,
        enum: ["1", "2", "3"],
        default: "1",
    },
    amount: {
        type: Number,
        required: true,
        default: function () {
            return this.type === "1" || this.type === "3" ? 30000 : 15000;
        },
    },
});
const orderSchema = new mongoose_1.Schema({
    customerId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "Customer",
        required: true,
    },
    items: [orderItemSchema],
    totalAmount: {
        type: Number,
        required: true,
        default: function () {
            return this.items.reduce((acc, item) => acc + item.amount, 0);
        },
    },
    orderDate: { type: Date, required: true },
    status: {
        type: String,
        required: true,
        enum: ["pending", "completed", "cancelled"],
    },
}, {
    timestamps: true,
});
const Order = (0, mongoose_1.model)("Order", orderSchema);
exports.default = Order;
