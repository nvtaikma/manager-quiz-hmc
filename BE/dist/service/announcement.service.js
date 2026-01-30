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
const Announcement_1 = __importDefault(require("../models/Announcement"));
class AnnouncementService {
    // create announcement
    createAnnouncement(announcementData) {
        return __awaiter(this, void 0, void 0, function* () {
            const announcement = yield Announcement_1.default.create(announcementData);
            const result = {
                id: announcement._id,
                location: announcement.location,
                message: announcement.message,
                isActive: announcement.isActive,
                expiresAt: announcement.expiresAt,
                priority: announcement.priority,
            };
            return result;
        });
    }
    // get announcement
    getAnnouncement(id) {
        return __awaiter(this, void 0, void 0, function* () {
            const announcement = yield Announcement_1.default.findById(id);
            if (!announcement) {
                throw new Error("Announcement not found");
            }
            const result = {
                id: announcement._id,
                location: announcement.location,
                message: announcement.message,
                isActive: announcement.isActive,
                expiresAt: announcement.expiresAt,
                priority: announcement.priority,
            };
            return result;
        });
    }
    // update announcement
    updateAnnouncement(id, announcementData) {
        return __awaiter(this, void 0, void 0, function* () {
            const announcement = yield Announcement_1.default.findOneAndUpdate({ _id: id }, announcementData, { new: true });
            if (!announcement) {
                throw new Error("Announcement not found");
            }
            const result = {
                id: announcement._id,
                location: announcement.location,
                message: announcement.message,
                isActive: announcement.isActive,
                expiresAt: announcement.expiresAt,
                priority: announcement.priority,
            };
            return result;
        });
    }
    // delete announcement
    deleteAnnouncement(id) {
        return __awaiter(this, void 0, void 0, function* () {
            const announcement = yield Announcement_1.default.findByIdAndDelete(id);
            if (!announcement) {
                throw new Error("Announcement not found");
            }
            return announcement;
        });
    }
    // get all announcements
    getAllAnnouncements() {
        return __awaiter(this, arguments, void 0, function* (page = 1, limit = 15) {
            const announcements = yield Announcement_1.default.find()
                .skip((page - 1) * limit)
                .limit(limit);
            const total = yield Announcement_1.default.countDocuments();
            return {
                announcements,
                pagination: {
                    total,
                    page,
                    totalPages: Math.ceil(total / limit),
                },
            };
        });
    }
    // get all active announcements
    getAllActiveAnnouncements() {
        return __awaiter(this, void 0, void 0, function* () {
            const announcements = yield Announcement_1.default.find({ isActive: true });
            return announcements;
        });
    }
    // get all expired announcements
    getAllExpiredAnnouncements() {
        return __awaiter(this, void 0, void 0, function* () {
            const announcements = yield Announcement_1.default.find({
                expiresAt: { $lt: new Date() },
            });
            return announcements;
        });
    }
}
exports.default = new AnnouncementService();
