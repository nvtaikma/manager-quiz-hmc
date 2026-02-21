# Phase 01: API Backend (Status + History)
Status: ✅ Complete
Dependencies: None

## Objective
Viết lại logic cho endpoint lấy thông tin phiên đăng nhập (`/customers/:id/session`) để nó không chỉ trả về session hiện tại từ Redis hoặc một session từ DB mà sẽ trả về đầy đủ:
- Trạng thái online hiện tại.
- Danh sách tất cả lịch sử các phiên đăng nhập (từ MongoDB `Session` collection).

## Requirements
### Functional
- [x] Chỉnh sửa logic `getCustomerSession` trong `CustomersService` hoặc tạo endpoint mới phù hợp hơn (VD: `/customers/:id/sessions`). Cần tìm User bằng id Customer -> Lấy được `userId`.
- [x] Check xem User hiện tại có online không (dựa vào redis key `online:user:{userId}`).
- [x] Lấy danh sách sessions của `userId` từ DB MongoDB `Session` mô hình (sort theo thời gian cập nhật/chỉnh sửa). Dữ liệu này bao gồm `logoutAt` và `logoutReason` như user vừa chỉnh sửa trong Model `Session.ts`.

## Implementation Steps
1. [x] Cập nhật lại logic trong `BE/src/service/customers.service.ts` - hàm `getCustomerSession` (hoặc tạo một hàm mới, vd: `getCustomerSessionHistory`). Sẽ lấy danh sách sessions lịch sử thay vì chỉ 1 session active.
2. [x] Trong hàm đó, gọi Redis kiểm tra trạng thái Online qua key `online:user:{userId}`.
3. [x] Query `Session` model lấy hết danh sách session (giới hạn một số lượng hợp lý nếu cần, ví dụ 50 phiên gần nhất).
4. [x] Return data tổng hợp dưới dạng `{ isOnline: boolean, activeSessionRedis: object, sessionHistory: [] }`. Đã done.

## Files to Create/Modify
- `BE/src/service/customers.service.ts`
- `BE/src/controllers/customer.controller.ts` (có thể cần nếu thay đổi format trả về)

## Test Criteria
- Trả về danh sách array của type `Session`.
- Trả đúng cờ `isOnline`.

---
Next Phase: phase-02-frontend.md
