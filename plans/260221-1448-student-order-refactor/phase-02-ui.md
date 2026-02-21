# Phase 02: Scanner Button & UI (Frontend)
Status: ⬜ Pending
Dependencies: Phase 01: phase-01-model.md

## Objective
Tích hợp một nút nhấn "Quét quá hạn" tại trang Dashboard danh sách `/student?status=completed...` để gọi logic Backend. Cập nhật Status tự động thành *expired* theo ngưỡng 90 ngày.

## Requirements
### Functional
- [ ] Thêm nút button vào FE trang `student/page.tsx` cho phép gọi API `/api/students/exprire`.
- [ ] Xử lý Loading state cho nút bấm để báo User đang update.
- [ ] Re-fetch lại danh sách học viên hiện tại (trả về Tab trước đó) sau khi quét thành công và báo Toast.

## Implementation Steps
1. [ ] Gọi API `PATCH ${API_BASE_URL}/students/exprire` từ button mới.
2. [ ] Thêm Button "Quét Hết Hạn" vào cạnh góc trên phải page `/student`.
3. [ ] Bắn `toast()` thông báo số lượng bản ghi đã được cập nhật thành công (dựa theo schema Backend trả về: `modifiedCount`).

## Files to Modify/Check
- `FE/src/app/student/page.tsx`
- Cài đặt `lucide-react` cho Icon, `useToast` để toast.

---
Next Phase: null
