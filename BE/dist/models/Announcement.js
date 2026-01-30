"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const AnnouncementSchema = new mongoose_1.Schema({
    location: {
        type: String,
        required: true,
        trim: true,
        // location sẽ có định dạng: 'course/{examId}', 'homepage_guest', 'homepage_authenticated', etc.
    },
    message: {
        type: String,
        required: true,
    },
    isActive: {
        type: Boolean,
        default: true,
    },
    expiresAt: {
        type: Date,
        default: null, // Mặc định là null, có nghĩa là không hết hạn
    },
    priority: {
        type: Number,
        default: 0, // Mặc định là 0, số càng cao càng ưu tiên
    },
    subjectName: {
        type: String,
        default: null,
    },
}, {
    timestamps: true,
});
// Static method để kiểm tra xem một thông báo đã hết hạn hay chưa
AnnouncementSchema.methods.isExpired = function () {
    if (!this.expiresAt)
        return false;
    return new Date() > this.expiresAt;
};
// Middleware để tự động đánh dấu thông báo đã hết hạn là không hoạt động
AnnouncementSchema.pre("find", function (next) {
    this.where({
        $or: [{ expiresAt: null }, { expiresAt: { $gt: new Date() } }],
    });
    next();
});
AnnouncementSchema.pre("findOne", function (next) {
    this.where({
        $or: [{ expiresAt: null }, { expiresAt: { $gt: new Date() } }],
    });
    next();
});
const Announcement = (0, mongoose_1.model)("Announcement", AnnouncementSchema);
exports.default = Announcement;
