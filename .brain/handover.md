# 🔄 Session Handover

**Last session:** 2026-04-21 | 117 minutes
**Summary:** Implemented the complete User Activity Tracking system with session-based grouping and engagement visualization.

## Đang làm:
- Tính năng Activity Logs đã hoàn thành 100% logic và giao diện cơ bản.
- Trạng thái: **Completed**

## Cần tiếp tục:
1. **Dọn dẹp log cũ:** Hiện tại log được lưu vô hạn trong MongoDB. Cần thêm TTL index (ví dụ 30 ngày) cho collection `UserActivity`.
2. **Tối ưu Redis:** Nếu lượng user lớn, cân nhắc chuyển `sadd` trực tiếp sang pipeline hoặc buffer.
3. **UI nâng cao:** Thêm bộ lọc ngày tháng cho biểu đồ (hiện cố định 7 ngày).

## Decisions gần đây:
- **Grouping Threshold (3m):** Gom nhóm các heartbeat nếu cách nhau < 3p.
- **Offline Delay (2m):** Dự đoán user offline sau heartbeat cuối cùng 2p.

## Lưu ý:
- Cron job chạy mỗi 2 phút (`*/2 * * * *`).
- API sử dụng `Customer ID` từ frontend nhưng xử lý theo `Auth User ID` ở backend.

## Files quan trọng:
- `BE/src/service/userActivity.service.ts` (Core logic)
- `BE/src/jobs/activityLogger.job.ts` (Cron)
- `FE/src/app/manage-users/components/UserActivityModal.tsx` (UI)

---
*Updated: 2026-04-21T17:58:00Z*
*Resumed: false*
