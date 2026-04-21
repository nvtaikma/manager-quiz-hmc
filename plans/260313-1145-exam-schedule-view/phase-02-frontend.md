# Phase 02: Frontend UI
Status: ✅ Completed
Dependencies: Phase 01 (Backend API)

## Objective
Thêm nút "Lịch thi" vào trang Quản lý Lớp Học và hiển thị danh sách lịch thi trong modal/dialog.

## Requirements
### Functional
- [ ] Nút "Lịch thi" hiển thị trên header trang `/classes` (cạnh nút "Thêm lớp")
- [ ] Khi ấn → Mở Dialog/Modal hiển thị tất cả lịch thi
- [ ] Lịch thi sắp xếp theo ngày, nhóm theo ngày (group by date)
- [ ] Mỗi item hiển thị: Tên lớp, Môn, Giờ thi, Giảng viên, Địa điểm
- [ ] Phân biệt trực quan các buổi thi ĐÃ QUA vs SẮP TỚI (dựa vào ngày)
- [ ] Hiển thị badge đếm số lịch thi sắp tới trên nút

### Non-Functional
- [ ] UI nhất quán với design hiện tại (shadcn/ui)
- [ ] Responsive trên mobile
- [ ] Loading skeleton khi đang fetch

## Implementation Steps
1. [ ] **Tạo component ExamScheduleModal** (`FE/src/components/classes/ExamScheduleModal.tsx`)
   - Props: `isOpen`, `onClose`
   - Fetch data từ API `GET /classes/exam-schedules`
   - Group theo ngày (`ngay_hoc`)
   - Hiển thị dạng timeline/list
   - Phân biệt ngày đã qua (mờ) vs sắp tới (nổi bật)

2. [ ] **Cập nhật trang Classes** (`FE/src/app/classes/page.tsx`)
   - Import `ExamScheduleModal`
   - Thêm state `isExamScheduleOpen`
   - Thêm nút "Lịch thi" với icon `CalendarCheck` bên cạnh nút "Thêm lớp"
   - Mount `ExamScheduleModal` component

## Files to Create/Modify
- `FE/src/components/classes/ExamScheduleModal.tsx` - **MỚI** - Modal hiển thị lịch thi
- `FE/src/app/classes/page.tsx` - Thêm nút + mount modal

## Test Criteria
- [ ] Nút "Lịch thi" hiển thị đúng vị trí
- [ ] Modal mở khi ấn nút, đóng khi ấn X hoặc overlay
- [ ] Danh sách lịch thi hiển thị đúng, sắp xếp theo ngày
- [ ] Ngày đã qua hiển thị mờ, ngày sắp tới hiển thị nổi bật
- [ ] Loading state hiển thị đúng
- [ ] Responsive trên mobile

---
Previous Phase: phase-01-backend.md
