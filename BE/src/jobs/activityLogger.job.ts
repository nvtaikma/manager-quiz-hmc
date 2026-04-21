import cron from "node-cron";
import redis from "../dbs/redis";
import UserActivity from "../models/UserActivity";
import { normalizeToVietnamDay } from "../util/dateHelper";

// ─────────────────────────────────────────────────────────────
// Config
// ─────────────────────────────────────────────────────────────

/**
 * Số operations tối đa mỗi lần bulkWrite.
 * Tránh gửi payload quá lớn lên MongoDB khi có nhiều users online.
 */
const BULK_BATCH_SIZE = 500;

// ─────────────────────────────────────────────────────────────
// Redis SCAN Generator (Non-blocking)
// ─────────────────────────────────────────────────────────────

/**
 * Async generator quét Redis keys theo pattern bằng SCAN cursor.
 *
 * Tại sao SCAN thay vì KEYS?
 * - `KEYS pattern` là O(N) blocking → Redis không serve requests khác trong thời gian đó.
 * - `SCAN cursor COUNT 200` là non-blocking: Redis xử lý 200 keys rồi trả về ngay,
 *   các requests khác (auth, cache lookup) vẫn được phục vụ xen kẽ.
 *
 * @param pattern - Redis glob pattern, vd: "online:user:*"
 * @param count   - Số keys mỗi lần SCAN (hint cho Redis, không guaranteed)
 */
async function* scanRedisKeys(
  pattern: string,
  count = 200
): AsyncGenerator<string[]> {
  let cursor = "0";
  do {
    const [nextCursor, keys] = await redis.scan(
      cursor,
      "MATCH",
      pattern,
      "COUNT",
      count
    );
    cursor = nextCursor;
    if (keys.length > 0) yield keys;
  } while (cursor !== "0");
}

// ─────────────────────────────────────────────────────────────
// Batch Processor
// ─────────────────────────────────────────────────────────────

/**
 * Ghi log heartbeat cho danh sách userIds bằng MongoDB bulkWrite.
 *
 * Tại sao bulkWrite thay vì Promise.all(findOneAndUpdate)?
 * - Promise.all(N) → N MongoDB round-trips đồng thời → DB spike khi N lớn.
 * - bulkWrite(N ops) → 1 network round-trip duy nhất → MongoDB tự xử lý parallel phía server.
 * - ordered: false → MongoDB không dừng nếu 1 op lỗi; các ops khác vẫn tiếp tục.
 */
async function bulkLogHeartbeats(userIds: string[]): Promise<void> {
  if (userIds.length === 0) return;

  const now = new Date();
  const normalizedDate = normalizeToVietnamDay(now);

  // Build bulkWrite operations — 1 op/user
  const ops = userIds.map((userId) => ({
    updateOne: {
      filter: { userId, date: normalizedDate },
      update: {
        $push: { activities: now },
        $setOnInsert: { userId, date: normalizedDate },
      },
      upsert: true,
    },
  }));

  // Chia thành batches nếu quá nhiều ops (tránh payload quá lớn)
  for (let i = 0; i < ops.length; i += BULK_BATCH_SIZE) {
    const batch = ops.slice(i, i + BULK_BATCH_SIZE);
    await UserActivity.bulkWrite(batch, { ordered: false });
  }
}

// ─────────────────────────────────────────────────────────────
// Cron Job
// ─────────────────────────────────────────────────────────────

/**
 * Cron Job: Quét Redis mỗi 2 phút → ghi log hoạt động vào MongoDB.
 *
 * Flow:
 * 1. Dùng redis.scan() (non-blocking) để lấy tất cả keys "online:user:*"
 * 2. Extract userId từ mỗi key
 * 3. Gom tất cả vào 1 (hoặc vài) bulkWrite thay vì N findOneAndUpdate riêng lẻ
 *
 * Tại sao 2 phút (không phải 3)?
 * - Redis TTL của key = 3 phút, client MedExam set lại mỗi 3 phút
 * - Cron 2 phút → luôn bắt được khi user online, sai số tối đa 2 phút
 */
export const startActivityLoggerJob = (): void => {
  cron.schedule("*/2 * * * *", async () => {
    try {
      // Thu thập tất cả userIds qua SCAN (non-blocking)
      const userIds: string[] = [];
      for await (const keyBatch of scanRedisKeys("online:user:*")) {
        for (const key of keyBatch) {
          userIds.push(key.replace("online:user:", ""));
        }
      }

      if (userIds.length === 0) return; // Không có ai online → bỏ qua

      console.log(
        `🕐 [ActivityJob] ${userIds.length} user(s) online — bulk logging...`
      );

      // 1 (hoặc vài) bulkWrite thay vì N queries riêng lẻ
      await bulkLogHeartbeats(userIds);

      console.log(
        `✅ [ActivityJob] Done. Logged ${userIds.length} user(s) via bulkWrite.`
      );
    } catch (error) {
      console.error("❌ [ActivityJob] Cron job error:", error);
    }
  });

  console.log(
    "🚀 [ActivityJob] Activity logger started (interval: every 2 minutes, mode: bulkWrite + SCAN)."
  );
};
