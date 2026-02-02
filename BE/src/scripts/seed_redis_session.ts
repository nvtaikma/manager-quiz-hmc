
import Redis from "ioredis";
import dotenv from "dotenv";

dotenv.config();

const redis = new Redis({
  host: process.env.REDIS_HOST || "localhost",
  port: Number(process.env.REDIS_PORT) || 6379,
  password: process.env.REDIS_PASSWORD || undefined,
});

async function seedSession() {
  const userId = "68f24e471ea633c825b2f112"; // Example ID from prompt
  const token = "dummy_jwt_token_for_testing";

  // 1. Set Active Token
  await redis.set(`user_active_token:${userId}`, token);

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

  await redis.set(`session:${token}`, JSON.stringify(sessionData));

  console.log("✅ Seeded Redis with dummy session for user:", userId);
  console.log("Redis Key 1:", `user_active_token:${userId}`);
  console.log("Redis Key 2:", `session:${token}`);
  
  process.exit(0);
}

seedSession().catch(console.error);
