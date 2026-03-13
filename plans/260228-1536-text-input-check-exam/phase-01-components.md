# Phase 01: Tạo Components UI

Status: ✅ Complete
Dependencies: None

## Objective

Tạo UI cho người dùng chọn phương thức nhập (PDF hoặc Text) và textarea nhập text.

## Implementation Steps

### Task 1.1: Tạo InputMethodSelector component

- [x] Component hiển thị 2 tab/card để chọn phương thức:
  - 📄 **Upload PDF** - Icon file + mô tả
  - 📝 **Paste Text** - Icon clipboard + mô tả
- [x] State: `inputMethod: "pdf" | "text"`
- [x] UI: 2 card ngang hàng, card được chọn highlight xanh

**File:** `FE/src/app/check-exam/[productId]/components/InputMethodSelector.tsx`

### Task 1.2: Tạo TextInput component

- [x] Textarea lớn để paste text (min-height: 300px)
- [x] Placeholder hướng dẫn format
- [x] Hiển thị đếm ký tự / dòng
- [x] Nút "Xử lý Text" (tương tự nút "Tiếp tục: Xử lý PDF")
- [x] Props: `onProcessComplete(questions: string[])`, `onError(msg: string)`, `isLoading`

**File:** `FE/src/app/check-exam/[productId]/components/TextInput.tsx`

### Task 1.3: Text parsing logic

- [x] Hàm `extractQuestionsFromRawText(text: string): string[]`
- [x] Parse format: `\d+[.:\)] text` → tách câu hỏi
- [x] Mỗi câu hỏi bao gồm cả đáp án A/B/C/D
- [x] Xóa prefix số (giống logic hiện tại trong QuestionExtractor)
- [x] Đặt trong TextInput component

## Files Created

- `FE/src/app/check-exam/[productId]/components/InputMethodSelector.tsx` ✅
- `FE/src/app/check-exam/[productId]/components/TextInput.tsx` ✅

## Test Criteria

- [x] 2 card chọn phương thức hiển thị đẹp
- [x] Click chuyển đổi giữa PDF upload và Text input
- [x] Textarea nhận paste text, hiển thị đúng
- [x] Parse text mẫu ra đúng số câu hỏi (2 câu, mỗi câu 4 đáp án)

---

Next Phase: phase-02-integration.md (ĐÃ GỘP VÀO PHASE 01)
