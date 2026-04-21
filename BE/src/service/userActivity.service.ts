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

  // Nếu online → tính duration đến thời điểm hiện tại
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
 * - Nếu gap giữa 2 timestamps liên tiếp <= SESSION_THRESHOLD_MS (3 phút) → cùng phiên
 * - Nếu gap > 3 phút → đóng phiên hiện tại, bắt đầu phiên mới
 * - Phiên cuối: kiểm tra Redis để xác định online/offline
 *
 * Ví dụ:
 *   Input:  [10:36, 10:38, 10:40, 10:44, 10:46, 11:10] (giờ VN)
 *   Gap:     2min   2min   4min!  2min   24min!
 *   Output: Session1 (10:36→10:42) | Session2 (10:44→10:48) | Session3 (11:10→?)
 */
function groupIntoSessions(
  activities: Date[],
  isCurrentlyOnline: boolean
): ActivitySession[] {
  if (activities.length === 0) return [];

  // Đảm bảo sort tăng dần (đề phòng $push MongoDB không theo thứ tự)
  const sorted = [...activities].sort((a, b) => a.getTime() - b.getTime());
  const sessions: ActivitySession[] = [];
  let currentRaw: Date[] = [sorted[0]];

  for (let i = 1; i < sorted.length; i++) {
    const gap = sorted[i].getTime() - sorted[i - 1].getTime();

    if (gap <= SESSION_THRESHOLD_MS) {
      // Cùng phiên → tiếp tục append
      currentRaw.push(sorted[i]);
    } else {
      // Gap quá lớn → đóng phiên hiện tại, bắt đầu phiên mới
      sessions.push(buildSession(currentRaw, "offline"));
      currentRaw = [sorted[i]];
    }
  }

  // Xử lý session cuối cùng: kiểm tra xem user còn online không
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
   * Ghi 1 heartbeat cho userId vào MongoDB.
   *
   * Pattern: findOneAndUpdate + upsert + $push
   * → Chỉ 1 query duy nhất, không cần read-before-write.
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
   * Lấy raw documents — mỗi doc = 1 ngày, chứa mảng activities thô.
   * Dùng nội bộ bởi getSessionsByUserId.
   */
  async getActivitiesByUserId(
    userId: string,
    days: number = 7
  ) {
    const safeDays = Math.min(Math.max(days, 1), 30);
    const startDate = normalizeToVietnamDay(
      new Date(Date.now() - safeDays * 24 * 60 * 60 * 1000)
    );

    return UserActivity.find({
      userId,
      date: { $gte: startDate },
    })
      .sort({ date: -1 }) // Mới nhất trước — index=0 là ngày hôm nay
      .lean();
  }

  /**
   * Lấy lịch sử hoạt động đã gom nhóm theo phiên (Session Grouping).
   *
   * Trả về mảng DailyActivitySummary, mỗi phần tử = 1 ngày,
   * bên trong là các sessions đã xác định startTime, endTime, duration.
   *
   * @param userId  Auth User ID (khớp với Redis key online:user:{userId})
   * @param days    Số ngày muốn lấy (mặc định 7, tối đa 30)
   */
  async getSessionsByUserId(
    userId: string,
    days: number = 7
  ): Promise<DailyActivitySummary[]> {
    const docs = await this.getActivitiesByUserId(userId, days);

    if (docs.length === 0) return [];

    // Kiểm tra user có đang online không (từ Redis)
    const isOnline = (await redis.exists(`online:user:${userId}`)) === 1;

    return docs.map((doc, index) => {
      // Chỉ doc đầu tiên (ngày mới nhất) mới có thể đang online
      const isLatestDoc = index === 0;
      const sessions = groupIntoSessions(
        doc.activities,
        isLatestDoc && isOnline
      );

      const totalActiveMinutes = sessions.reduce(
        (sum, s) => sum + s.durationMinutes,
        0
      );

      // Tạo date string theo giờ VN
      const vnDate = new Date(doc.date.getTime() + 7 * 60 * 60 * 1000);
      const dateLabel = new Intl.DateTimeFormat("vi-VN", {
        weekday: "short",
        day: "2-digit",
        month: "2-digit",
        timeZone: "Asia/Ho_Chi_Minh",
      }).format(doc.date);

      return {
        date: vnDate.toISOString().slice(0, 10), // "2026-04-21"
        dateLabel,                                 // "Th 2, 21/04"
        sessions,
        totalActiveMinutes,
        sessionCount: sessions.length,
      };
    });
  }
}

export default new UserActivityService();
