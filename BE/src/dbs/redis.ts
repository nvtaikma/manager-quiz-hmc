
import Redis from "ioredis";
import dotenv from "dotenv";

dotenv.config();

// dùng redis url thay vì host, port, password
const redis = new Redis({
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
  console.log("ip", process.env.REDIS_HOST)
  console.log("✅ Đã kết nối Redis thành công");
});

redis.on("error", (err) => {
  console.error("❌ Redis connection error:", err);
});

export default redis;
