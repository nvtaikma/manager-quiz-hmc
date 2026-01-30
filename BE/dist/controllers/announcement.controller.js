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
const announcement_service_1 = __importDefault(require("../service/announcement.service"));
class AnnouncementController {
    /**
     * create announcement
     */
    createAnnouncement(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const announcementData = req.body;
            const announcement = yield announcement_service_1.default.createAnnouncement(announcementData);
            return res.status(200).json({
                message: "Announcement created successfully",
                data: announcement,
            });
        });
    }
    /**
     * get announcement
     */
    getAnnouncement(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { id } = req.params;
            const announcement = yield announcement_service_1.default.getAnnouncement(id);
            return res.status(200).json({
                message: "Announcement fetched successfully",
                data: announcement,
            });
        });
    }
    /**
     * update announcement
     */
    updateAnnouncement(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { id } = req.params;
            const announcementData = req.body;
            const announcement = yield announcement_service_1.default.updateAnnouncement(id, announcementData);
            return res.status(200).json({
                message: "Announcement updated successfully",
                data: announcement,
            });
        });
    }
    /**
     * delete announcement
     */
    deleteAnnouncement(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { id } = req.params;
            const announcement = yield announcement_service_1.default.deleteAnnouncement(id);
            return res.status(200).json({
                message: "Announcement deleted successfully",
                data: announcement,
            });
        });
    }
    /**
     * get all announcements
     */
    getAllAnnouncements(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { page, limit } = req.query;
            const pageNumber = Number(page) || 1;
            const limitNumber = Number(limit) || 15;
            const announcements = yield announcement_service_1.default.getAllAnnouncements(pageNumber, limitNumber);
            return res.status(200).json({
                message: "Announcements fetched successfully",
                data: announcements,
            });
        });
    }
    /**
     * get all active announcements
     */
    getAllActiveAnnouncements(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const announcements = yield announcement_service_1.default.getAllActiveAnnouncements();
            return res.status(200).json({
                message: "Active announcements fetched successfully",
                data: announcements,
            });
        });
    }
    /**
     * get all expired announcements
     */
    getAllExpiredAnnouncements(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const announcements = yield announcement_service_1.default.getAllExpiredAnnouncements();
            return res.status(200).json({
                message: "Expired announcements fetched successfully",
                data: announcements,
            });
        });
    }
}
exports.default = new AnnouncementController();
