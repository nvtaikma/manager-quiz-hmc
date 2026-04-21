# Phase 01: Backend API
Status: ✅ Completed
Dependencies: None

## Objective
Tạo API endpoint mới để lấy **tất cả lịch thi** từ mọi lớp, sắp xếp theo ngày.

## Requirements
### Functional
- [ ] API trả về danh sách các buổi thi (Timetable có `loai_gio` === `"Thi hết môn"`)
- [ ] Sắp xếp theo `ngay_hoc` tăng dần (gần nhất trước)
- [ ] Trả về đầy đủ thông tin: tên lớp, ngày, giờ thi, môn học, giảng viên, địa điểm

### Non-Functional
- [ ] Sử dụng `.lean()` cho performance
- [ ] Chỉ select các field cần thiết

## Implementation Steps
1. [ ] **ClassService** (`BE/src/modules/class/class.service.ts`)
   - Thêm method `getExamSchedules()`:
     - Query: `Timetable.find({ loai_gio: "Thi hết môn" })`
     - Sort: `{ ngay_hoc: 1, buoi: 1 }`
     - Select fields: `ten_lop ngay_hoc buoi gio_thi mon_hoc giang_vien dia_diem giang_duong ghi_chu noi_dung loai_gio`
     - Return `.lean()`

2. [ ] **ClassController** (`BE/src/modules/class/class.controller.ts`)
   - Thêm method `getExamSchedules(req, res)`:
     - Gọi `classService.getExamSchedules()`
     - Return `{ data: results }`

3. [ ] **ClassRoute** (`BE/src/modules/class/class.route.ts`)
   - Thêm route: `GET /exam-schedules`
   - → `ClassController.getExamSchedules`
   - **Lưu ý:** Route này phải đặt TRƯỚC `/:className/timetable` để không bị match sai

## Files to Create/Modify
- `BE/src/modules/class/class.service.ts` - Thêm method getExamSchedules
- `BE/src/modules/class/class.controller.ts` - Thêm handler getExamSchedules
- `BE/src/modules/class/class.route.ts` - Thêm route GET /exam-schedules

## Test Criteria
- [ ] GET `/api/classes/exam-schedules` trả về 200 + danh sách lịch thi
- [ ] Chỉ chứa các buổi có `loai_gio === "Thi hết môn"`
- [ ] Sắp xếp theo ngày tăng dần

---
Next Phase: phase-02-frontend.md
