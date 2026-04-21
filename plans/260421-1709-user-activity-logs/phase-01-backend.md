# Phase 01: Backend — Model + Cron Job + API
Status: ⬜ Pending
Dependencies: None

## Objective
1. Tạo Mongoose model `UserActivity` với TTL index 7 ngày
2. Tạo Cron Job chạy mỗi 2 phút: quét Redis → ghi log MongoDB
3. Tạo API endpoint để Admin đọc lịch sử hoạt động

## Implementation Steps

### Step 1: Tạo Mongoose Model `UserActivity`

**File:** `BE/src/models/UserActivity.ts`

```typescript
import mongoose, { Schema, Document } from "mongoose";

export interface IUserActivity extends Document {
  userId: string;          // Auth User ID (từ key Redis: online:user:{userId})
  date: Date;              // Chuẩn hóa về 00:00:00 GMT+7
  activities: Date[];      // Mảng timestamps mỗi lần cron bắt được user online
}

const userActivitySchema = new Schema<IUserActivity>(
  {
    userId: {
      type: String,
      required: true,
      index: true,
    },
    date: {
      type: Date,
      required: true,
    },
    activities: [{ type: Date }],
  },
  { timestamps: true }
);

// Compound index: tìm nhanh theo userId + date (dùng cho upsert)
userActivitySchema.index({ userId: 1, date: 1 }, { unique: true });

// TTL index: MongoDB tự xóa document sau 7 ngày kể từ trường `date`
userActivitySchema.index({ date: 1 }, { expireAfterSeconds: 604800 });

export default mongoose.model<IUserActivity>("UserActivity", userActivitySchema);
```

**Lưu ý:** `userId` dùng `String` (không phải ObjectId) vì Redis key lưu dạng chuỗi
`online:user:{userId}` — không cần populate quan hệ.

### Step 2: Hàm chuẩn hóa ngày GMT+7

**File:** `BE/src/util/dateHelper.ts`

```typescript
/**
 * Chuẩn hóa Date về 00:00:00 theo múi giờ Việt Nam (GMT+7).
 * Mục đích: gom tất cả hoạt động trong cùng 1 ngày VN vào 1 document.
 *
 * Ví dụ:
 *   Input:  2026-04-21T18:30:00Z  (= 01:30 sáng ngày 22/04 VN)
 *   Output: 2026-04-21T17:00:00Z  (= 00:00 ngày 22/04 VN)
 */
export const normalizeToVietnamDay = (input?: Date): Date => {
  const now = input ?? new Date();
  const VN_OFFSET_MS = 7 * 60 * 60 * 1000; // 7 tiếng tính bằng ms

  // Chuyển sang giờ VN
  const vnTime = new Date(now.getTime() + VN_OFFSET_MS);

  // Reset về đầu ngày (theo VN)
  vnTime.setUTCHours(0, 0, 0, 0);

  // Chuyển ngược về UTC để lưu MongoDB
  return new Date(vnTime.getTime() - VN_OFFSET_MS);
};
```

### Step 3: Service ghi/đọc activity

**File:** `BE/src/service/userActivity.service.ts`

```typescript
import UserActivity from "../models/UserActivity";
import { normalizeToVietnamDay } from "../util/dateHelper";

class UserActivityService {
  /**
   * Ghi 1 heartbeat cho userId.
   * Dùng upsert + $push → 1 query duy nhất, không cần read-before-write.
   */
  async logHeartbeat(userId: string): Promise<void> {
    const now = new Date();
    const normalizedDate = normalizeToVietnamDay(now);

    await UserActivity.findOneAndUpdate(
      { userId, date: normalizedDate },
      {
        $push: { activities: now },
        $setOnInsert: { userId, date: normalizedDate },
      },
      { upsert: true }
    );
  }

  /**
   * Lấy lịch sử hoạt động của 1 user trong N ngày gần nhất.
   */
  async getActivitiesByUserId(userId: string, days: number = 7) {
    const startDate = normalizeToVietnamDay(
      new Date(Date.now() - days * 24 * 60 * 60 * 1000)
    );

    return UserActivity.find({
      userId,
      date: { $gte: startDate },
    })
      .sort({ date: -1 })
      .lean();
  }
}

export default new UserActivityService();
```

### Step 4: Cron Job — Trái tim của tính năng

**File:** `BE/src/jobs/activityLogger.job.ts`

```typescript
import cron from "node-cron";
import redis from "../dbs/redis";
import userActivityService from "../service/userActivity.service";

/**
 * Cron Job chạy mỗi 2 phút.
 * Quét tất cả Redis keys "online:user:*" → ghi log vào MongoDB.
 *
 * Tại sao 2 phút?
 * - Redis TTL = 3 phút → key luôn còn sống ít nhất 1 phút sau lần set cuối
 * - Cron 2 phút → chắc chắn bắt được user đang online
 * - Sai số tối đa: 2 phút (chấp nhận được cho activity tracking)
 */
export const startActivityLoggerJob = () => {
  cron.schedule("*/2 * * * *", async () => {
    try {
      // Lấy tất cả users đang online
      const keys = await redis.keys("online:user:*");

      if (keys.length === 0) return;

      console.log(`🕐 [ActivityJob] Processing ${keys.length} online users...`);

      // Ghi log cho từng user song song (Promise.all)
      await Promise.all(
        keys.map(async (key) => {
          // Extract userId từ key "online:user:{userId}"
          const userId = key.replace("online:user:", "");
          await userActivityService.logHeartbeat(userId);
        })
      );

      console.log(`✅ [ActivityJob] Logged ${keys.length} users.`);
    } catch (error) {
      console.error("❌ [ActivityJob] Error:", error);
    }
  });

  console.log("🚀 [ActivityJob] Activity logger started (every 2 minutes).");
};
```

### Step 5: Đăng ký Cron Job vào app khởi động

**Sửa file:** `BE/src/app.ts` (hoặc `index.ts` — file entry point)

```typescript
import { startActivityLoggerJob } from "./jobs/activityLogger.job";

// Sau khi connect MongoDB và Redis thành công:
startActivityLoggerJob();
```

### Step 6: Controller + Route

**File:** `BE/src/controllers/userActivity.controller.ts`

```typescript
import { Request, Response } from "express";
import userActivityService from "../service/userActivity.service";

class UserActivityController {
  /**
   * GET /api/customers/:id/activities?days=7
   * userId ở đây là Auth User ID (cùng ID trong Redis key)
   */
  async getActivities(req: Request, res: Response) {
    const { id } = req.params;
    const days = Math.min(parseInt(req.query.days as string) || 7, 30);

    const activities = await userActivityService.getActivitiesByUserId(id, days);

    return res.status(200).json({
      message: "Success",
      data: activities,
    });
  }
}

export default new UserActivityController();
```

**Sửa file:** `BE/src/routes/customer.route.ts`

```diff
+ import UserActivityController from "../controllers/userActivity.controller";

  // Thêm route:
+ router.get("/:id/activities", asyncHandler(UserActivityController.getActivities));
```

### Step 7: Cài thêm package

```bash
cd BE && npm install node-cron && npm install -D @types/node-cron
```

## Files to Create/Modify

| File | Hành động | Mô tả |
|---|---|---|
| `BE/src/models/UserActivity.ts` | **Mới** | Schema + TTL index |
| `BE/src/util/dateHelper.ts` | **Mới** | Chuẩn hóa ngày GMT+7 |
| `BE/src/service/userActivity.service.ts` | **Mới** | Logic ghi/đọc |
| `BE/src/jobs/activityLogger.job.ts` | **Mới** | Cron job 2 phút |
| `BE/src/controllers/userActivity.controller.ts` | **Mới** | Request handler |
| `BE/src/routes/customer.route.ts` | **Sửa** | Thêm route GET activities |
| `BE/src/app.ts` hoặc `index.ts` | **Sửa** | Khởi động cron job |

## Test Criteria
- [ ] Server khởi động → log `🚀 [ActivityJob] Activity logger started`
- [ ] Có user online Redis → sau 2 phút MongoDB có document mới
- [ ] Gọi cron 3 lần cùng ngày → 1 document, `activities.length = 3`
- [ ] Cron chạy ngày khác → document riêng
- [ ] GET `/api/customers/:userId/activities?days=7` → trả về đúng dữ liệu
- [ ] TTL index tồn tại: `db.useractivities.getIndexes()`

## Lưu ý quan trọng

> ⚠️ **Mapping userId:** Redis key dùng Auth User ID (`online:user:{userId}`).
> Admin panel hiển thị Customer (khác collection). Cần đảm bảo khi Admin
> xem lịch sử của 1 customer, hệ thống map đúng sang Auth User ID.
> 
> **Xem lại** `CustomersService.getCustomerSession()` — đã có pattern:
> `Customer → email → User._id` để lấy userId đúng.

---
Next Phase: [phase-02-frontend-activity-modal.md](./phase-02-frontend-activity-modal.md)
