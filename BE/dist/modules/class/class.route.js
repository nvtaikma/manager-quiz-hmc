"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const class_controller_1 = __importDefault(require("./class.controller"));
const router = express_1.default.Router();
router.get("/", class_controller_1.default.getClasses);
router.post("/bulk", class_controller_1.default.bulkCreateClasses);
router.get("/:className/timetable", class_controller_1.default.getTimetable);
router.post("/timetable/import", class_controller_1.default.importTimetable);
router.post("/:className/timetable/import", class_controller_1.default.importTimetableForClass);
exports.default = router;
