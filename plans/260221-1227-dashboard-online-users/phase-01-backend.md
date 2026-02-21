# Phase 01: Backend API
Status: ✅ Complete
Dependencies: None

## Objective
Tạo/Cập nhật API endpoint để trả về tổng số lượng user đang có trạng thái online lưu trong Redis.

## Requirements
### Functional
- [x] Connect tới Redis để lấy count các keys có pattern `online:user:*` hoặc lấy danh sách users và filter theo active (tùy thuộc vào current logic implementation).
- [x] Tạo endpoint GET (`/api/customers/count/online` hoặc extend endpoint hiện có) để trả về con số này cho Frontend.
- [x] Xử lý errors (VD: Redis không kết nối được trả về 0 hoặc lỗi có kiểm soát).

## Implementation Steps
1. [x] Check existing Redis integration (`BE/src/dbs/redis.ts`, `BE/src/service/customers.service.ts` or similar).
2. [x] Tạo logic lấy keys `keys online:user:*` và đếm hoặc dùng phương pháp phù hợp (set cardinality nếu đang dùng Redis Sets). Thêm hàm tại `CustomersService`.
3. [x] Cập nhật Controller và Route tương ứng (VD: `CustomerController`, `CustomerRoute`).
4. [x] Test nhanh bằng script/Postman. (Đã test curl port 3000 cho ra kết quả count thành công)

## Files to Modify/Check
- `BE/src/service/customers.service.ts` (Services)
- `BE/src/modules/customer/customer.controller.ts` (Controller)
- `BE/src/modules/customer/customer.route.ts` (Route)

## Notes
Nên dùng SCAN hoặc KEYS (tùy quy mô) hoặc quản lý Set `online_users` cho performance. Hiện tại User bảo lấy dừ liệu theo key `online:user:{userID}` thì sẽ dùng pattern matching. Đã thực hiện thành công.

---
Next Phase: phase-02-frontend.md
