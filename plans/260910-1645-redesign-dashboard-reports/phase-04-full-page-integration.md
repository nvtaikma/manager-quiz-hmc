# Phase 04: Full Page Bento Integration

## Mục tiêu:
Tích hợp toàn bộ các widget vào layout Bento Grid hiện đại tại `FE/src/app/page.tsx`, tối ưu hóa trải nghiệm người dùng, responsive từ desktop đến mobile, và kiểm thử tính toàn vẹn.

## Tasks:
- [ ] Thiết kế Header Dashboard:
  - Lời chào theo thời gian trong ngày ("Chào buổi sáng / Buổi chiều") + Tiêu đề Bảng điều khiển.
  - Badge trạng thái kết nối máy chủ / Thời gian cập nhật lần cuối.
  - Nút Refresh dữ liệu với animation xoay khi đang tải.
- [ ] Hàng KPI Cards (5 thẻ):
  - Doanh thu tổng & hôm nay.
  - Đơn hàng mới.
  - Học viên online (với pulse green indicator).
  - Báo lỗi câu hỏi chờ xử lý (với pulse amber indicator nếu > 0).
  - Tỷ lệ giải quyết lỗi.
- [ ] Hàng trung tâm (Bento Grid):
  - 8 cột: Biểu đồ doanh thu AreaChart mượt mà (7 ngày / 12 tháng).
  - 4 cột: Widget Báo lỗi câu hỏi chờ xử lý (Pending Reports Widget).
- [ ] Hàng bổ trợ:
  - Phân tích cơ cấu trạng thái đơn hàng (Hoàn thành, Chờ xử lý, Đã hủy).
  - Phân tích trạng thái người dùng (Đang hoạt động, Online, Không hoạt động).
- [ ] Kiểm thử responsive trên các kích thước màn hình (Mobile 375px, Tablet 768px, Desktop 1024px, Full HD 1440px).
- [ ] Đảm bảo không có lỗi TypeScript / console warnings.
