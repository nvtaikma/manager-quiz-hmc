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
function debugSession() {
    return __awaiter(this, void 0, void 0, function* () {
        const userId = "681cb170be5e8e7a7f317658"; // The ID user found in Redis
        console.log(`\n🔍 CHECKING REDIS FOR USER: ${userId}`);
        // 1. Check user_active_token
        const tokenKey = `user_active_token:${userId}`;
        const token = yield redis.get(tokenKey);
        if (!token) {
            console.log(`❌ Key '${tokenKey}' NOT FOUND.`);
            process.exit(0);
        }
        console.log(`✅ Key '${tokenKey}' FOUND.`);
        console.log(`   Token: ${token.substring(0, 20)}...`);
        // 2. Check session data
        const sessionKey = `session:${token}`;
        const sessionData = yield redis.get(sessionKey);
        if (!sessionData) {
            console.log(`❌ Key '${sessionKey}' NOT FOUND.`);
            console.log(`   ⚠️ This explains why the modal is empty! The token exists but the session data is missing.`);
        }
        else {
            console.log(`✅ Key '${sessionKey}' FOUND.`);
            console.log(`   Data: ${sessionData}`);
        }
        process.exit(0);
    });
}
debugSession().catch(console.error);
