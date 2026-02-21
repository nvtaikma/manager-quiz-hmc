# Phase 01: Refactor Model Student & Order Logic
Status: ✅ Complete
Dependencies: None

## Objective
Sửa cấu trúc Mongoose Schema của `Student` để gắn thêm thuộc tính `orderId`. Nhờ vậy, ta có thể phân biệt một sinh viên mua 1 môn nhiều lần (sau mỗi lần hết hạn). Xử lý việc "Thêm thủ công" vẫn hoạt động bằng cách không bắt buộc có `orderId`.

## Requirements
### Functional
- [x] Mở rộng bảng `Student` (thêm `orderId?: string` optional để hỗ trợ thêm bằng tay).
- [x] Trong `BE/src/service/order.service.ts`, lúc làm `createOrder`, gọi hàm thêm `Student` bằng cách truyền cả `orderId: newOrder._id`. 
- [x] Đổi logic lúc hàm sinh viên `createStudent` ở `student.service`: Nếu thêm bằng tay (ko có orderId), bỏ qua insert đè luôn. Nếu có `orderId`, coi như là vé học mới, tạo record `Student` DỰA TRÊN `orderId` mới nhất. Hoặc đơn giản là luôn Create (Cho phép Duplicate). Tốt nhất là THÊM MỚI nếu có order id để giữ lại Record báo "Expired".
- [x] Trong logic Update hoặc Delete Order `cancelOrder`/`updateStatusOrder`: Cần tìm ra đúng `Student` mang cái `orderId` bị báo hủy đó và set status là `cancelled` hoặc `expired` Tùy nghiệp vụ (xóa record đó đi hoặc set expired). Vì theo database cũ nó đang tìm bằng Email và Khóa để Update.

## Implementation Steps
### 1. `BE/src/models/student.ts`
- Thêm `orderId: { type: Schema.Types.ObjectId, ref: "Order" }`.

### 2. `BE/src/service/student.service.ts`
- Sửa hàm `createStudent({ email, productId, orderId })` -> Không dùng `findOneAndUpdate` nữa nếu muốn lưu lịch sử. Nếu có `orderId`, bắt buộc tạo mới record với trạng thái 'pending' để nó tồn tại // Hoặc vẫn `upsert` nhưng query là lấy `email`, `productId` VÀ `orderId` để tạo document mới nếu là đơn mới. Còn nếu tạo thủ công (`orderId` = null) thì tìm theo email/productId.
- Thêm 1 hàm delete hoặc khoá học sinh theo `orderId`. Ví dụ `deleteStudentByOrderId(orderId)`.

### 3. `BE/src/service/order.service.ts`
- Sửa hàm `createOrder` -> Chuyển dòng `StudentService.createStudent` truyền nốt `orderId: newOrder._id`.
- Kiểm tra các hàm xóa đơn/hủy đơn. Hiện tại có `updateStatusOrder`. Nếu order chuyển thành `cancelled`, gọi `StudentService` xoá ngay cái `Student` mang cái `orderId` đó là an toàn nhất (Không xoá các record cũ của môn đó).

## Files to Create/Modify
- `BE/src/models/student.ts`
- `BE/src/service/student.service.ts`
- `BE/src/service/order.service.ts`

---
Next Phase: phase-02-ui.md
