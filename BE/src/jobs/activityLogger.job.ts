import cron from "node-cron";
import redis from "../dbs/redis";
import userActivityService from "../service/userActivity.service";

/**
 * Cron Job: Quét Redis mỗi 2 phút → ghi log hoạt động vào MongoDB.
 *
 * Tại sao 2 phút (không phải 3)?
 * - Redis TTL của key `online:user:{userId}` = 3 phút
 * - Client MedExam set lại key mỗi 3 phút
 * - Nếu cron chạy đúng lúc key vừa expire → bỏ sót
 * - Cron 2 phút → luôn có ít nhất 1 lần bắt được khi user online
 * - Sai số tối đa: 2 phút (chấp nhận được cho activity tracking)
 *
 * Tối ưu hiệu năng:
 * - Promise.all → xử lý tất cả users song song, không tuần tự
 * - logHeartbeat dùng upsert → 1 MongoDB query/user, không đọc trước
 * - Fire-and-forget với try/catch riêng → 1 user lỗi không ảnh hưởng user khác
 */
export const startActivityLoggerJob = (): void => {
  // "*/2 * * * *" = mỗi 2 phút, mỗi giờ, mỗi ngày
  cron.schedule("*/2 * * * *", async () => {
    try {
      // Lấy tất cả Redis keys đang tồn tại theo pattern
      const keys = await redis.keys("online:user:*");

      if (keys.length === 0) return; // Không có ai online → bỏ qua

      console.log(`🕐 [ActivityJob] ${keys.length} user(s) online — logging...`);

      // Xử lý song song, bắt lỗi từng user riêng lẻ
      await Promise.all(
        keys.map(async (key) => {
          try {
            // Extract userId: "online:user:68220936ea335f4fcfbba671" → "68220936ea335f4fcfbba671"
            const userId = key.replace("online:user:", "");
            await userActivityService.logHeartbeat(userId);
          } catch (userErr) {
            // 1 user lỗi không dừng các user khác
            console.warn(`⚠️ [ActivityJob] Failed to log user from key "${key}":`, userErr);
          }
        })
      );

      console.log(`✅ [ActivityJob] Done. Logged ${keys.length} user(s).`);
    } catch (error) {
      // Lỗi Redis hoặc lỗi ngoài dự kiến
      console.error("❌ [ActivityJob] Cron job error:", error);
    }
  });

  console.log("🚀 [ActivityJob] Activity logger started (interval: every 2 minutes).");
};
