/**
 * Chuẩn hóa một Date về 00:00:00 theo múi giờ Việt Nam (GMT+7).
 *
 * Mục đích: Gom tất cả hoạt động trong cùng 1 ngày Việt Nam vào 1 MongoDB document.
 *
 * Ví dụ:
 *   Input:  2026-04-21T18:30:00Z  (= 01:30 sáng ngày 22/04 VN)
 *   Output: 2026-04-21T17:00:00Z  (= 00:00 ngày 22/04 VN, lưu dạng UTC)
 *
 *   Input:  2026-04-21T10:00:00Z  (= 17:00 ngày 21/04 VN)
 *   Output: 2026-04-20T17:00:00Z  (= 00:00 ngày 21/04 VN, lưu dạng UTC)
 */
export const normalizeToVietnamDay = (input?: Date): Date => {
  const now = input ?? new Date();
  const VN_OFFSET_MS = 7 * 60 * 60 * 1000; // GMT+7 tính bằng milliseconds

  // Bước 1: Chuyển UTC → giờ VN (dạng UTC object, nhưng giá trị là giờ VN)
  const vnTime = new Date(now.getTime() + VN_OFFSET_MS);

  // Bước 2: Reset về đầu ngày theo VN (setUTCHours thay vì setHours để tránh DST)
  vnTime.setUTCHours(0, 0, 0, 0);

  // Bước 3: Chuyển ngược về UTC để lưu vào MongoDB
  return new Date(vnTime.getTime() - VN_OFFSET_MS);
};
