# Phase 01: Backend — Bulk Delete API
Status: ⬜ Pending
Dependencies: None

## Objective
Thêm endpoint xóa nhiều câu hỏi cùng lúc:
- `DELETE /api/questions/bulk` — nhận `{ questionIds: string[] }`, xóa bằng `deleteMany`

> ⚠️ **Copy Question là clipboard (Ctrl-C) — KHÔNG cần backend.** Logic đã có trong `QuestionManager.tsx`, chỉ cần port sang FE ở Phase 02.

## Requirements

### Functional
- [ ] Bulk delete: nhận `{ questionIds: string[] }`, validate không rỗng, xóa bằng `deleteMany`
- [ ] Trả về `{ deletedCount, requestedCount }` để FE hiển thị kết quả

### Non-Functional
- [ ] Route `/bulk` phải đặt TRƯỚC `/:questionId` để tránh match sai
- [ ] Sử dụng `asyncHandler` wrapper theo pattern hiện tại

## Implementation Steps

### 1. `BE/src/service/question.service.ts`

```typescript
interface BulkDeleteResult {
  deletedCount: number;
  requestedCount: number;
}

async bulkDeleteQuestions(questionIds: string[]): Promise<BulkDeleteResult> {
  if (!questionIds || questionIds.length === 0) {
    throw new Error("Danh sách ID câu hỏi không được rỗng");
  }
  const result = await Question.deleteMany({ _id: { $in: questionIds } });
  return {
    deletedCount: result.deletedCount,
    requestedCount: questionIds.length,
  };
}
```

### 2. `BE/src/controllers/question.controller.ts`

```typescript
async bulkDeleteQuestions(req: Request, res: Response) {
  try {
    const { questionIds } = req.body as { questionIds: string[] };
    if (!Array.isArray(questionIds) || questionIds.length === 0) {
      return responseError(res, "questionIds phải là mảng không rỗng", 400);
    }
    const result = await questionService.bulkDeleteQuestions(questionIds);
    return res.status(200).json({ message: "Đã xóa câu hỏi", data: result });
  } catch (error: any) {
    return responseError(res, error.message, 400);
  }
}
```

### 3. `BE/src/routes/question.route.ts`

```typescript
// ⚠️ /bulk phải đặt TRƯỚC /:questionId
router.delete("/bulk", asyncHandler(questionController.bulkDeleteQuestions));

// Các route cũ giữ nguyên
router.get("/:questionId", ...);
router.patch("/:questionId", ...);
router.delete("/:questionId", ...);
```

## Files to Modify
- `BE/src/service/question.service.ts`
- `BE/src/controllers/question.controller.ts`
- `BE/src/routes/question.route.ts`

## Test Criteria
- [ ] `DELETE /api/questions/bulk` với `{ questionIds: ["id1","id2"] }` → 200, `deletedCount: 2`
- [ ] `DELETE /api/questions/bulk` với body rỗng → 400 error

---
Next Phase: phase-02-frontend-copy.md
