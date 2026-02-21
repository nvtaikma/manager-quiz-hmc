# Phase 02: Frontend UI Modal
Status: ✅ Complete
Dependencies: Phase 01: phase-01-api.md

## Objective
Thay đổi giao diện modal `UserSessionModal.tsx` để show ra danh sách lịch sử đăng nhập dưới dạng Timeline, Card List. Nếu đang Online thì gán cờ "Đang Online". Khớp với cấu trúc API trả về thay vì cấu trúc cũ.

## Requirements
### Functional
- [x] Ghi nhận format array/object từ Response mới của API `getCustomerSession()`.
- [x] Chỉnh sửa `SessionData` interface tại thư mục `/manage-users` (frontend) để ánh xạ thuộc tính mới có `logoutAt`, `logoutReason` từ `Session` database, và trạng thái `isOnline`...
- [x] Hiện giao diện chia là: Phần Trạng Thái Hiện Tại (đang online/không) và Danh sách Lịch Sử (lọc top 5 hoặc 10).

## Implementation Steps
1. [x] Đổi interface `SessionData` tại component `UserSessionModal` cho phù hợp với backend trả về (gồm `history: SessionData[]` thay vì null hoặc thẻ đơn).
2. [x] Sửa lại phần logic fetchSession trong modal này. Chờ backend API Phase 1 xong. Sửa fetch state từ `session` -> `userSession`.
3. [x] Cập nhật UI render một mảng phiên bao gồm Thiết Bị, Last Active, Browser. Hiển thị session nào đang Active. Render card và báo offline, badge.

## Files to Modify/Check
- `FE/src/app/manage-users/components/UserSessionModal.tsx`

## Test Criteria
- Icon Monitor -> Click -> Show "Đang online" (nếu có key trong redis) + Scrollable list các Sessions từ trước đến nay. Đã cập nhật xong.

---
Next Phase: null
