"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const ioredis_1 = __importDefault(require("ioredis"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
// dùng redis url thay vì host, port, password
const redis = new ioredis_1.default({
    host: process.env.REDIS_HOST || "157.10.199.146",
    port: Number(process.env.REDIS_PORT) || 6379,
    password: process.env.REDIS_PASSWORD || "nvtaikma02022001a",
    // Retry strategy
    retryStrategy(times) {
        const delay = Math.min(times * 50, 2000);
        return delay;
    },
});
redis.on("connect", () => {
    console.log("ip", process.env.REDIS_HOST);
    console.log("✅ Đã kết nối Redis thành công");
});
redis.on("error", (err) => {
    console.error("❌ Redis connection error:", err);
});
exports.default = redis;
