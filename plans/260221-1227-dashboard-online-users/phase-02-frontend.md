# Phase 02: Frontend UI
Status: ✅ Complete
Dependencies: Phase 01: phase-01-backend.md

## Objective
Hiển thị tổng số lượng Online Users có được từ Backend API trên Dashboard (trang `FE/src/app/page.tsx`).

## Requirements
### Functional
- [x] Gọi API đếm số user online ở Dashboard (ex: `/api/customers/count/online`).
- [x] Thêm Card UI/cập nhật thông tin vào phần "Trạng Thái Người Dùng" trong File `page.tsx`.

## Implementation Steps
1. [x] Thêm field `onlineUsers: number` vào interface `DashboardData`.
2. [x] Fetch data từ `/api/customers/count/online` cùng với các dữ liệu Dashboard khác.
3. [x] Cập nhật Card "Trạng Thái Người Dùng" để show the số liệu Đang Online (realtime snapshot).
4. [x] Refresh data nếu cần (VD: 30s-60s hoặc chỉ refresh dựa trên state load). Đã tích hợp dựa trên initial route state

## Files to Modify/Check
- `FE/src/app/page.tsx`
- Cập nhật state/interface và component con. Khai vào mảng dependencies gọi fetch Promise.

## Notes
Dashboard đang ở `/app/page.tsx`. Chỉnh sửa UI vào phần Card Users. Hoàn tất việc hiển thị giao diện UI cho số lượng user "Đang Online" với icon ping nhấp nháy.

---
Next Phase: null
