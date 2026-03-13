# Plan: Thêm Text Input cho Check Exam

Created: 2026-02-28T15:36:00+07:00
Status: 🟡 In Progress

## Overview

Thêm option nhập câu hỏi bằng **paste text** song song với upload PDF. Người dùng chọn 1 trong 2 cách:

- **📄 Upload PDF** (flow hiện tại)
- **📝 Paste Text** (flow mới)

Cả 2 flow đều dẫn đến cùng Step 2 (Xem & chỉnh sửa) → Step 3 (So sánh) → Step 4 (Loại bỏ trùng lặp)

## Phân tích Input Text Format

```
33. Một trong những đặc trưng...
A. Có nhà nước xã hội chủ nghĩa...
B. Có nhà nước pháp quyền...
C. Có nhà nước pháp quyền...
D. Có nhà nước pháp quyền...

34. Trong các yếu tố cấu thành...
A. Ý chí
B. Nghị lực
C. Tri thức
D. Tình cảm
```

**Đặc điểm:**

- Câu hỏi bắt đầu bằng số + dấu chấm: `33. text`
- Đáp án bắt đầu bằng A./B./C./D. đầu dòng
- Các câu cách nhau bằng dòng trống
- KHÔNG cần xử lý PDF → KHÔNG cần PDF.js
- Text đã sạch → KHÔNG cần normalizeVietnameseText

## Phases

| Phase | Name                                          | Status     | Tasks |
| ----- | --------------------------------------------- | ---------- | ----- |
| 01    | Tạo component TextInput + InputMethodSelector | ⬜ Pending | 3     |
| 02    | Tích hợp Text parsing vào flow                | ⬜ Pending | 3     |
| 03    | Cập nhật CheckExamClient                      | ⬜ Pending | 3     |

**Tổng:** 9 tasks | Ước tính: 1 session (~30 phút)

## Quick Commands

- Bắt đầu: `/code phase-01`
- Check progress: `/next`
