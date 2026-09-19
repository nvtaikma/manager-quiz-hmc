# Phase 03: Pending Reports Widget

## Mục tiêu:
Tạo widget chuyên dụng để theo dõi và quản lý nhanh các báo cáo lỗi câu hỏi đang ở trạng thái chờ xử lý (`pending`) hoặc đang xem xét (`reviewed`).

## Tasks:
- [ ] Xây dựng `FE/src/app/components/dashboard/PendingReportsWidget.tsx`:
  - Header với badge số lượng báo lỗi đang chờ + nút "Xem tất cả" trỏ về `/reports`.
  - Danh sách 5 báo cáo lỗi mới nhất chưa xử lý:
    - Avatar/Tên người báo + email.
    - Trích đoạn câu hỏi bị báo lỗi kèm icon cảnh báo.
    - Badge phân loại rõ ràng: "Sai đáp án" (Đỏ) hoặc "Lỗi nội dung" (Cam).
    - Thời gian gửi báo cáo.
    - Nút thao tác nhanh "Xem chi tiết" dẫn thẳng tới `/reports/[id]`.
  - Trạng thái rỗng (Empty state) sạch đẹp khi không có báo lỗi nào tồn đọng: Hiển thị icon CheckCircle xanh lá + thông điệp "Tuyệt vời! Không có báo lỗi nào cần xử lý".
