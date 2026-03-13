# Phase 02: Tích hợp Text Parsing

Status: ⬜ Pending
Dependencies: Phase 01

## Objective

Kết nối Text parsing với flow hiện tại - text input đi thẳng vào `extractedQuestions` state.

## Implementation Steps

### Task 2.1: Thêm state `inputMethod` vào CheckExamClient

- [ ] State: `inputMethod: "pdf" | "text"` (default: "pdf")
- [ ] Khi đổi method → reset state hiện tại (pdfFiles, extractedQuestions)
- [ ] Cập nhật step name: "Tải lên PDF" → "Nhập câu hỏi" (dynamic)

**File:** `FE/src/app/check-exam/[productId]/CheckExamClient.tsx`

### Task 2.2: Render InputMethodSelector + conditional content

- [ ] Step 1 hiển thị InputMethodSelector ở trên
- [ ] Bên dưới: nếu "pdf" → FileUploader + QuestionExtractor (hiện tại)
- [ ] Bên dưới: nếu "text" → TextInput component
- [ ] Cả 2 đều gọi cùng callback `onProcessComplete(questions)`

**File:** `FE/src/app/check-exam/[productId]/CheckExamClient.tsx`

### Task 2.3: Auto-separate answers cho text input

- [ ] Text input đã biết rõ format (A. B. C. D.) → tự động tách đáp án ngay khi parse
- [ ] Chèn `#` trước mỗi A./B./C./D. trong quá trình parse
- [ ] Khi chuyển sang Step 2, đáp án đã được tách sẵn
- [ ] User vẫn có thể bấm "Tách đáp án" nếu cần tách lại

## Files to Modify

- `FE/src/app/check-exam/[productId]/CheckExamClient.tsx` - thêm inputMethod state, conditional render

## Test Criteria

- [ ] Chọn "PDF" → hiện FileUploader (flow cũ hoạt động bình thường)
- [ ] Chọn "Text" → hiện TextInput
- [ ] Paste text → xử lý → chuyển Step 2 với câu hỏi đã tách đáp án
- [ ] Chuyển đổi qua lại giữa PDF/Text không bị lỗi state
- [ ] StepNavigation & forward button hoạt động đúng với cả 2 mode

---

Next Phase: phase-03-polish.md
