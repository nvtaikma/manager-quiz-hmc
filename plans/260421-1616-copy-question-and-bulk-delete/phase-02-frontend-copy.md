# Phase 02: Frontend — Copy Question to Clipboard (Syllabus)
Status: ⬜ Pending
Dependencies: Không cần backend (pure frontend)

## Objective
Thêm nút "Sao chép" vào mỗi hàng câu hỏi trong `SyllabusManager.tsx`.
Khi click → copy nội dung câu hỏi + đáp án vào clipboard (giống Ctrl-C).

> ✅ **Logic đã tồn tại** trong `QuestionManager.tsx` → hàm `copyQuestionToClipboard` (dòng 611).
> Chỉ cần port hàm đó sang `SyllabusManager.tsx`.

## Format text khi copy

```
Môn học nghiên cứu cơ sở lý luận và kỹ thuật thực hành về pha chế:
A. Môn bào chế
B. Môn dược lý
C. Môn thực vật
D. Môn dược liệu
```

## Implementation Steps

### Hàm copyQuestionToClipboard (port từ QuestionManager)

```tsx
const copyQuestionToClipboard = async (question: Question) => {
  try {
    let questionText = question.text.trim();
    if (!questionText.endsWith("?") && !questionText.endsWith(":")) {
      questionText += ":";
    }

    let formattedText = questionText + "\n";
    const answerLabels = ["A", "B", "C", "D"];
    question.answers
      .sort((a, b) => a.order - b.order)
      .forEach((answer, index) => {
        if (answer.text.trim()) {
          const label = answerLabels[index] || `${index + 1}`;
          formattedText += `${label}. ${answer.text.trim()}\n`;
        }
      });

    await navigator.clipboard.writeText(formattedText.trim());
    toast({ title: "Đã sao chép", description: "Câu hỏi đã được copy vào clipboard." });
  } catch {
    toast({ title: "Lỗi", description: "Không thể sao chép. Vui lòng thử lại.", variant: "destructive" });
  }
};
```

### UI — Thêm nút trong cột "Hành động"

```tsx
import { Copy } from "lucide-react";

// Thêm nút Copy cạnh nút Sửa/Xóa
<Button
  variant="outline"
  size="icon"
  title="Sao chép câu hỏi vào clipboard"
  onClick={() => copyQuestionToClipboard(question)}
>
  <Copy className="h-4 w-4" />
</Button>
```

## Files to Modify
- `FE/src/app/product-syllabus/[productId]/components/SyllabusManager.tsx`
  - Import thêm `Copy` từ `lucide-react`
  - Thêm hàm `copyQuestionToClipboard`
  - Thêm nút Copy trong bảng

## Test Criteria
- [ ] Nút Copy hiển thị trong cột Hành động
- [ ] Click → toast "Đã sao chép"
- [ ] Paste (Ctrl-V) ra ngoài → text đúng format A., B., C., D.

---
Previous: phase-01-backend.md
Next: phase-03-frontend-bulk-delete.md
