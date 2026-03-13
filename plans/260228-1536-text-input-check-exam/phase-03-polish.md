# Phase 03: Polish & Edge Cases

Status: ⬜ Pending
Dependencies: Phase 02

## Objective

Xử lý edge cases, đảm bảo UX mượt mà, và validation.

## Implementation Steps

### Task 3.1: Xử lý các format text khác nhau

- [ ] Format 1: `33. Câu hỏi` (số + dấu chấm)
- [ ] Format 2: `Câu 33: Câu hỏi` (Câu + số + dấu hai chấm)
- [ ] Format 3: `Câu hỏi 33: Câu hỏi` (Câu hỏi + số)
- [ ] Đáp án: `A.`, `A)`, `A `, `A:` → tất cả đều parse được
- [ ] Câu hỏi không có dòng trống giữa → vẫn tách được

### Task 3.2: Validation & UX

- [ ] Hiện preview số câu hỏi live khi paste text
- [ ] Warning nếu text trống hoặc không phát hiện câu hỏi
- [ ] Nút "Xóa" để clear textarea
- [ ] Giữ text trong state nếu user quay lại step 1 từ step 2

### Task 3.3: Build & Test

- [ ] Build thành công không lỗi
- [ ] Test flow PDF vẫn hoạt động đúng (regression)
- [ ] Test flow Text với dữ liệu mẫu
- [ ] Test chuyển đổi giữa 2 mode

## Files to Modify

- `FE/src/app/check-exam/[productId]/components/TextInput.tsx` - thêm format handling

## Test Criteria

- [ ] Paste text với nhiều format khác nhau → parse đúng
- [ ] Flow PDF không bị ảnh hưởng
- [ ] Build production thành công

---

✅ Feature Complete!
