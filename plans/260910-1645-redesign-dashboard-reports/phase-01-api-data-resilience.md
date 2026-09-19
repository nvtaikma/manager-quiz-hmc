# Phase 01: API & Data Resilience

## Mục tiêu:
Xây dựng mô hình dữ liệu tổng hợp cho Dashboard bao gồm cả thống kê kinh doanh (đơn hàng, doanh thu, user) và thống kê vận hành (báo cáo lỗi câu hỏi chờ xử lý). Đảm bảo cơ chế tải dữ liệu chống chịu lỗi (Resilient loading).

## Tasks:
- [ ] Khảo sát lại các endpoints backend:
  - Reports: `GET /api/reports/dashboard` & `GET /api/reports?status=pending&limit=5`
  - Orders & Income: `GET /api/orders/...`
  - Users: `GET /api/customers/count/...`
- [ ] Định nghĩa TypeScript interfaces đầy đủ cho Dashboard Data và Report Item trong component.
- [ ] Thay thế `Promise.all` dễ vỡ bằng `Promise.allSettled` để nếu 1 endpoint gặp trục trặc thì các card khác vẫn hiển thị bình thường.
- [ ] Bổ sung trạng thái refresh và thời gian cập nhật lần cuối (`lastRefreshedAt`).
