[ignoring loop detection]
# Backend Files for Redis Session Integration

Dưới đây là nội dung các file Backend đã được cập nhật hoàn chỉnh. Bạn có thể copy vào dự án.

## 1. Cài đặt dependencies
Chạy lệnh sau để cài đặt thư viện Redis:
```bash
npm install ioredis
npm install -D @types/ioredis
```

## 2. File: `src/dbs/redis.ts` (Mới)
Tạo file này để quản lý kết nối Redis.

```typescript
import Redis from "ioredis";
import dotenv from "dotenv";

dotenv.config();

// using redis url instead of host, port, password
const redis = new Redis({
  host: process.env.REDIS_HOST || "localhost",
  port: Number(process.env.REDIS_PORT) || 6379,
  password: process.env.REDIS_PASSWORD || undefined,
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
```

## 3. File: `src/service/customers.service.ts` (Cập nhật)
Thêm import `redis` và method `getCustomerSession`.

```typescript
import Customer from "../models/customers";
import redis from "../dbs/redis";

class CustomersService {
  // ... (giữ nguyên các method cũ: createCustomer, getListCustomer...) ...

  // --- THÊM MỚI ---
  async getCustomerSession(userId: string) {
    if (!userId) return null;
    
    // 1. Get active token from key "user_active_token:{userId}"
    const token = await redis.get(`user_active_token:${userId}`);

    if (!token) return null;

    // 2. Get session details from key "session:{token}"
    const sessionData = await redis.get(`session:${token}`);
    
    return sessionData ? JSON.parse(sessionData) : null;
  }
}

export default new CustomersService();
```

## 4. File: `src/controllers/customer.controller.ts` (Cập nhật)
Thêm method `getCustomerSession`.

```typescript
import { Request, Response } from "express";
import CustomersService from "../service/customers.service";

class CustomerController {
  // ... (giữ nguyên các method cũ) ...

  // --- THÊM MỚI ---
  async getCustomerSession(req: Request, res: Response) {
    const { id } = req.params as { id: string };
    const session = await CustomersService.getCustomerSession(id);
    return res.json({
      message: "Customer session fetched successfully",
      data: session,
    });
  }
}

export default new CustomerController();
```

## 5. File: `src/routes/customer.route.ts` (Cập nhật)
Thêm route mới.

```typescript
import express from "express";
import CustomerController from "../controllers/customer.controller";
import { asyncHandler } from "../utils/asyncHandler";

const router = express.Router();

// ... (các routes cũ) ...

// --- THÊM MỚI ---
router.get("/:id/session", asyncHandler(CustomerController.getCustomerSession));

export default router;
```
