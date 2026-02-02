
import Redis from "ioredis";
import dotenv from "dotenv";

dotenv.config();

const redis = new Redis({
  host: process.env.REDIS_HOST || "localhost",
  port: Number(process.env.REDIS_PORT) || 6379,
  password: process.env.REDIS_PASSWORD || undefined,
});

async function debugSession() {
  const userId = "681cb170be5e8e7a7f317658"; // The ID user found in Redis
  console.log(`\n🔍 CHECKING REDIS FOR USER: ${userId}`);

  // 1. Check user_active_token
  const tokenKey = `user_active_token:${userId}`;
  const token = await redis.get(tokenKey);
  
  if (!token) {
    console.log(`❌ Key '${tokenKey}' NOT FOUND.`);
    process.exit(0);
  }

  console.log(`✅ Key '${tokenKey}' FOUND.`);
  console.log(`   Token: ${token.substring(0, 20)}...`);

  // 2. Check session data
  const sessionKey = `session:${token}`;
  const sessionData = await redis.get(sessionKey);

  if (!sessionData) {
    console.log(`❌ Key '${sessionKey}' NOT FOUND.`);
    console.log(`   ⚠️ This explains why the modal is empty! The token exists but the session data is missing.`);
  } else {
    console.log(`✅ Key '${sessionKey}' FOUND.`);
    console.log(`   Data: ${sessionData}`);
  }

  process.exit(0);
}

debugSession().catch(console.error);
