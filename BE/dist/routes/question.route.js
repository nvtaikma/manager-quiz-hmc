"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const question_controller_1 = __importDefault(require("../controllers/question.controller"));
const asynHandler_1 = __importDefault(require("../util/asynHandler"));
const router = express_1.default.Router();
// Lấy thông tin câu hỏi theo ID
router.get("/:questionId", (0, asynHandler_1.default)(question_controller_1.default.getQuestionById));
// Cập nhật câu hỏi
router.patch("/:questionId", (0, asynHandler_1.default)(question_controller_1.default.updateQuestion));
// Xóa câu hỏi
router.delete("/:questionId", (0, asynHandler_1.default)(question_controller_1.default.deleteQuestion));
exports.default = router;
