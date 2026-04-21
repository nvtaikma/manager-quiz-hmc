export interface ActivitySession {
  startTime: Date;
  endTime: Date | null;       // null = đang online (chưa kết thúc)
  durationMs: number;
  durationMinutes: number;    // làm tròn phút để hiển thị
  status: "online" | "offline";
  rawActivities: Date[];      // Các timestamps thô bên trong phiên
}

export interface DailyActivitySummary {
  date: string;               // "2026-04-21" (VN local date string)
  dateLabel: string;          // "Th 2, 21/04"
  sessions: ActivitySession[];
  totalActiveMinutes: number; // Tổng phút active trong ngày
  sessionCount: number;
}
