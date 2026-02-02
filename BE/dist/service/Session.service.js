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
const redis_1 = __importDefault(require("../dbs/redis"));
class SessionService {
    getSessionByUserId(_a) {
        return __awaiter(this, arguments, void 0, function* ({ userId }) {
            // src/service/customers.service.ts
            if (!userId)
                return null;
            // 1. Từ ID user -> Lấy Active Token
            const token = yield redis_1.default.get(`user_active_token:${userId}`);
            if (!token)
                return null;
            // 2. Từ Token -> Lấy thông tin Session (JWT detail)
            const sessionData = yield redis_1.default.get(`session:${token}`);
            // 3. Trả về thông tin cho giao diện
            return sessionData ? JSON.parse(sessionData) : null;
        });
    }
}
exports.default = new SessionService();
