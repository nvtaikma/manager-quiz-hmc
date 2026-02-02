
import Redis from "ioredis";
import dotenv from "dotenv";

dotenv.config();

const redis = new Redis({
  host: process.env.REDIS_HOST || "localhost",
  port: Number(process.env.REDIS_PORT) || 6379,
  password: process.env.REDIS_PASSWORD || undefined,
});

async function checkKeys() {
  const userId = "681cb0423042bbd0117556ed"; // ID from debug log
  console.log(`Checking Redis keys for user: ${userId}`);

  // 1. Check active token key
  const activeTokenKey = `user_active_token:${userId}`;
  const token = await redis.get(activeTokenKey);
  console.log(`[Redis] GET ${activeTokenKey} ->`, token ? "EXISTS" : "NULL");

  if (token) {
     // 2. Check session key
     const sessionKey = `session:${token}`;
     const session = await redis.get(sessionKey);
     console.log(`[Redis] GET ${sessionKey} ->`, session ? "EXISTS" : "NULL");
     if (session) {
         console.log("Session Data:", session);
     }
  }

  // List all keys matching pattern to see if prefix is wrong
  const keys = await redis.keys("user_active_token:*");
  console.log("All user_active_token keys:", keys);
  
  process.exit(0);
}

checkKeys().catch(console.error);
