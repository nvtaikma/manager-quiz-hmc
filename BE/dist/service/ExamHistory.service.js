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
const mongoose_1 = __importDefault(require("mongoose"));
const ExamHistory_1 = __importDefault(require("../models/ExamHistory"));
class ExamHistoryService {
    getExamByUserId(_a) {
        return __awaiter(this, arguments, void 0, function* ({ userId }) {
            const userIdObjectId = new mongoose_1.default.Types.ObjectId(userId);
            const examHistory = yield ExamHistory_1.default.find({ userId: userIdObjectId })
                .sort({
                createdAt: -1,
            })
                .select("-__v -updatedAt -_id -completedAt")
                .lean();
            return examHistory;
        });
    }
}
exports.default = new ExamHistoryService();
