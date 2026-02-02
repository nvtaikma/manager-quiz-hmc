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
const ioredis_1 = __importDefault(require("ioredis"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const redis = new ioredis_1.default({
    host: process.env.REDIS_HOST || "localhost",
    port: Number(process.env.REDIS_PORT) || 6379,
    password: process.env.REDIS_PASSWORD || undefined,
});
function seedSession() {
    return __awaiter(this, void 0, void 0, function* () {
        const userId = "68f24e471ea633c825b2f112"; // Example ID from prompt
        const token = "dummy_jwt_token_for_testing";
        // 1. Set Active Token
        yield redis.set(`user_active_token:${userId}`, token);
        // 2. Set Session Data
        const sessionData = {
            _id: "test-session-id",
            userId: userId,
            token: token,
            clientId: "device_test_123",
            deviceInfo: {
                userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
                ip: "127.0.0.1",
                browser: "Chrome",
                os: "Windows 10",
                deviceName: "PC",
            },
            isActive: true,
            isCurrentDevice: true,
            lastActive: new Date().toISOString(),
            expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24h from now
            createdAt: new Date().toISOString(),
        };
        yield redis.set(`session:${token}`, JSON.stringify(sessionData));
        console.log("✅ Seeded Redis with dummy session for user:", userId);
        console.log("Redis Key 1:", `user_active_token:${userId}`);
        console.log("Redis Key 2:", `session:${token}`);
        process.exit(0);
    });
}
seedSession().catch(console.error);
