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
function checkKeys() {
    return __awaiter(this, void 0, void 0, function* () {
        const userId = "681cb0423042bbd0117556ed"; // ID from debug log
        console.log(`Checking Redis keys for user: ${userId}`);
        // 1. Check active token key
        const activeTokenKey = `user_active_token:${userId}`;
        const token = yield redis.get(activeTokenKey);
        console.log(`[Redis] GET ${activeTokenKey} ->`, token ? "EXISTS" : "NULL");
        if (token) {
            // 2. Check session key
            const sessionKey = `session:${token}`;
            const session = yield redis.get(sessionKey);
            console.log(`[Redis] GET ${sessionKey} ->`, session ? "EXISTS" : "NULL");
            if (session) {
                console.log("Session Data:", session);
            }
        }
        // List all keys matching pattern to see if prefix is wrong
        const keys = yield redis.keys("user_active_token:*");
        console.log("All user_active_token keys:", keys);
        process.exit(0);
    });
}
checkKeys().catch(console.error);
