"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const asynHandler_1 = __importDefault(require("../util/asynHandler"));
const announcement_controller_1 = __importDefault(require("../controllers/announcement.controller"));
const router = express_1.default.Router();
// create announcement
router.post("/", (0, asynHandler_1.default)(announcement_controller_1.default.createAnnouncement));
// get announcement
router.get("/:id", (0, asynHandler_1.default)(announcement_controller_1.default.getAnnouncement));
// update announcement
router.patch("/:id", (0, asynHandler_1.default)(announcement_controller_1.default.updateAnnouncement));
// delete announcement
router.delete("/:id", (0, asynHandler_1.default)(announcement_controller_1.default.deleteAnnouncement));
// get all announcements
router.get("/", (0, asynHandler_1.default)(announcement_controller_1.default.getAllAnnouncements));
// get all active announcements
router.get("/active", (0, asynHandler_1.default)(announcement_controller_1.default.getAllActiveAnnouncements));
// get all expired announcements
router.get("/expired", (0, asynHandler_1.default)(announcement_controller_1.default.getAllExpiredAnnouncements));
exports.default = router;
