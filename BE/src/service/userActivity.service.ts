import UserActivity from "../models/UserActivity";
import { normalizeToVietnamDay } from "../util/dateHelper";
import redis from "../dbs/redis";
import type { ActivitySession, DailyActivitySummary } from "../types/activity.types";

// ─────────────────────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────────────────────

/** Khoảng cách tối đa giữa 2 heartbeat để coi là cùng 1 phiên */
const SESSION_THRESHOLD_MS = 3 * 60 * 1000; // 3 phút

/** Cộng thêm vào timestamp cuối để tính thời điểm offline */
const OFFLINE_DELAY_MS = 2 * 60 * 1000; // 2 phút

// ─────────────────────────────────────────────────────────────
// Helpers (private — không export)
// ─────────────────────────────────────────────────────────────

/**
 * Đóng gói 1 nhóm raw timestamps thành 1 ActivitySession.
 * - status = "online"  → endTime = null (phiên chưa kết thúc)
 * - status = "offline" → endTime = lastTimestamp + OFFLINE_DELAY_MS
 */
function buildSession(
  rawActivities: Date[],
  status: "online" | "offline"
): ActivitySession {
  const startTime = rawActivities[0];
  const lastTimestamp = rawActivities[rawActivities.length - 1];
  const endTime =
    status === "online"
      ? null
      : new Date(lastTimestamp.getTime() + OFFLINE_DELAY_MS);

  const durationMs = (endTime ?? new Date()).getTime() - startTime.getTime();

  return {
    startTime,
    endTime,
    durationMs,
    durationMinutes: Math.round(durationMs / 60000),
    status,
    rawActivities,
  };
}

/**
 * Thuật toán gom nhóm phiên hoạt động (Session Grouping).
 *
 * Logic:
 * - Sort timestamps tăng dần
 * - Gap <= 3 phút → cùng phiên
 * - Gap > 3 phút → đóng phiên cũ, bắt đầu phiên mới
 * - Phiên cuối: kiểm tra Redis xác định online/offline
 */
function groupIntoSessions(
  activities: Date[],
  isCurrentlyOnline: boolean
): ActivitySession[] {
  if (activities.length === 0) return [];

  const sorted = [...activities].sort((a, b) => a.getTime() - b.getTime());
  const sessions: ActivitySession[] = [];
  let currentRaw: Date[] = [sorted[0]];

  for (let i = 1; i < sorted.length; i++) {
    const gap = sorted[i].getTime() - sorted[i - 1].getTime();

    if (gap <= SESSION_THRESHOLD_MS) {
      currentRaw.push(sorted[i]);
    } else {
      sessions.push(buildSession(currentRaw, "offline"));
      currentRaw = [sorted[i]];
    }
  }

  // Session cuối: online nếu user vẫn đang online VÀ heartbeat cuối còn gần
  const lastTs = currentRaw[currentRaw.length - 1];
  const timeSinceLast = Date.now() - lastTs.getTime();
  const isStillActive =
    isCurrentlyOnline && timeSinceLast <= SESSION_THRESHOLD_MS;

  sessions.push(buildSession(currentRaw, isStillActive ? "online" : "offline"));

  return sessions;
}

// ─────────────────────────────────────────────────────────────
// Service Class
// ─────────────────────────────────────────────────────────────

class UserActivityService {
  /**
   * Ghi 1 heartbeat cho userId vào MongoDB (dùng cho API endpoint lẻ).
   * Cron job dùng bulkWrite trực tiếp trong activityLogger.job.ts.
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
   * Query raw activity documents thẳng từ MongoDB (không cache).
   */
  private async getRawActivities(userId: string, days: number) {
    const safeDays = Math.min(Math.max(days, 1), 30);
    const startDate = normalizeToVietnamDay(
      new Date(Date.now() - safeDays * 24 * 60 * 60 * 1000)
    );

    return UserActivity.find({ userId, date: { $gte: startDate } })
      .select("userId date activities -_id")
      .sort({ date: -1 })
      .lean();
  }

  /**
   * Lấy lịch sử hoạt động đã gom nhóm theo phiên (Session Grouping).
   * Query trực tiếp MongoDB mỗi lần — không cache.
   *
   * @param userId  Auth User ID
   * @param days    Số ngày (mặc định 7, tối đa 30)
   */
  async getSessionsByUserId(
    userId: string,
    days: number = 7
  ): Promise<DailyActivitySummary[]> {
    const docs = await this.getRawActivities(userId, days);
    if (docs.length === 0) return [];

    // Kiểm tra user có đang online không (từ Redis)
    const isOnline = (await redis.exists(`online:user:${userId}`)) === 1;

    return docs.map((doc, index) => {
      const isLatestDoc = index === 0;
      const sessions = groupIntoSessions(
        doc.activities,
        isLatestDoc && isOnline
      );

      const totalActiveMinutes = sessions.reduce(
        (sum, s) => sum + s.durationMinutes,
        0
      );

      const vnDate = new Date(doc.date.getTime() + 7 * 60 * 60 * 1000);
      const dateLabel = new Intl.DateTimeFormat("vi-VN", {
        weekday: "short",
        day: "2-digit",
        month: "2-digit",
        timeZone: "Asia/Ho_Chi_Minh",
      }).format(doc.date);

      return {
        date: vnDate.toISOString().slice(0, 10),
        dateLabel,
        sessions,
        totalActiveMinutes,
        sessionCount: sessions.length,
      };
    });
  }

  /**
   * @deprecated Prefer getSessionsByUserId.
   */
  async getActivitiesByUserId(userId: string, days: number = 7) {
    return this.getRawActivities(userId, days);
  }
}

export default new UserActivityService();
