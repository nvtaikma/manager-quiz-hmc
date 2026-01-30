"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const ExamHistory_controller_1 = __importDefault(require("../controllers/ExamHistory.controller"));
const asynHandler_1 = __importDefault(require("../util/asynHandler"));
const router = express_1.default.Router();
router.get("/:userId", (0, asynHandler_1.default)(ExamHistory_controller_1.default.getExamByUserId));
exports.default = router;
