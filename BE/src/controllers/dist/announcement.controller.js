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
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
exports.__esModule = true;
var announcement_service_1 = require("../service/announcement.service");
var AnnouncementController = /** @class */ (function () {
    function AnnouncementController() {
    }
    /**
     * create announcement
     */
    AnnouncementController.prototype.createAnnouncement = function (req, res) {
        return __awaiter(this, void 0, void 0, function () {
            var announcementData, announcement;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        announcementData = req.body;
                        return [4 /*yield*/, announcement_service_1["default"].createAnnouncement(announcementData)];
                    case 1:
                        announcement = _a.sent();
                        return [2 /*return*/, res.status(200).json({
                                message: "Announcement created successfully",
                                data: announcement
                            })];
                }
            });
        });
    };
    /**
     * get announcement
     */
    AnnouncementController.prototype.getAnnouncement = function (req, res) {
        return __awaiter(this, void 0, void 0, function () {
            var id, announcement;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        id = req.params.id;
                        return [4 /*yield*/, announcement_service_1["default"].getAnnouncement(id)];
                    case 1:
                        announcement = _a.sent();
                        return [2 /*return*/, res.status(200).json({
                                message: "Announcement fetched successfully",
                                data: announcement
                            })];
                }
            });
        });
    };
    /**
     * update announcement
     */
    AnnouncementController.prototype.updateAnnouncement = function (req, res) {
        return __awaiter(this, void 0, void 0, function () {
            var id, announcementData, announcement;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        id = req.params.id;
                        announcementData = req.body;
                        return [4 /*yield*/, announcement_service_1["default"].updateAnnouncement(id, announcementData)];
                    case 1:
                        announcement = _a.sent();
                        return [2 /*return*/, res.status(200).json({
                                message: "Announcement updated successfully",
                                data: announcement
                            })];
                }
            });
        });
    };
    /**
     * delete announcement
     */
    AnnouncementController.prototype.deleteAnnouncement = function (req, res) {
        return __awaiter(this, void 0, void 0, function () {
            var id, announcement;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        id = req.params.id;
                        return [4 /*yield*/, announcement_service_1["default"].deleteAnnouncement(id)];
                    case 1:
                        announcement = _a.sent();
                        return [2 /*return*/, res.status(200).json({
                                message: "Announcement deleted successfully",
                                data: announcement
                            })];
                }
            });
        });
    };
    /**
     * get all announcements
     */
    AnnouncementController.prototype.getAllAnnouncements = function (req, res) {
        return __awaiter(this, void 0, void 0, function () {
            var _a, page, limit, pageNumber, limitNumber, announcements;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _a = req.query, page = _a.page, limit = _a.limit;
                        pageNumber = Number(page) || 1;
                        limitNumber = Number(limit) || 15;
                        return [4 /*yield*/, announcement_service_1["default"].getAllAnnouncements(pageNumber, limitNumber)];
                    case 1:
                        announcements = _b.sent();
                        return [2 /*return*/, res.status(200).json({
                                message: "Announcements fetched successfully",
                                data: announcements
                            })];
                }
            });
        });
    };
    /**
     * get all active announcements
     */
    AnnouncementController.prototype.getAllActiveAnnouncements = function (req, res) {
        return __awaiter(this, void 0, void 0, function () {
            var announcements;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, announcement_service_1["default"].getAllActiveAnnouncements()];
                    case 1:
                        announcements = _a.sent();
                        return [2 /*return*/, res.status(200).json({
                                message: "Active announcements fetched successfully",
                                data: announcements
                            })];
                }
            });
        });
    };
    /**
     * get all expired announcements
     */
    AnnouncementController.prototype.getAllExpiredAnnouncements = function (req, res) {
        return __awaiter(this, void 0, void 0, function () {
            var announcements;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, announcement_service_1["default"].getAllExpiredAnnouncements()];
                    case 1:
                        announcements = _a.sent();
                        return [2 /*return*/, res.status(200).json({
                                message: "Expired announcements fetched successfully",
                                data: announcements
                            })];
                }
            });
        });
    };
    return AnnouncementController;
}());
exports["default"] = new AnnouncementController();
