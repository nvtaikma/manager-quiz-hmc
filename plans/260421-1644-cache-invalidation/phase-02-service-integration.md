# Phase 02: Tích hợp Cache Invalidation vào QuestionService
Status: ⬜ Pending
Dependencies: Phase 01 (cacheHelper.ts phải tồn tại)

## Objective
Gọi `invalidateExamCache(examId)` trong các method của `QuestionService`
sau khi thao tác DB thành công. Sử dụng pattern **fire-and-forget** (không await)
để không làm chậm response time.

## Phương án: Fire-and-Forget vs Await

```
// ❌ Tránh: await làm chậm response thêm ~5-20ms không cần thiết
await invalidateExamCache(examId);

// ✅ Dùng: fire-and-forget — cache xóa async, không block
void invalidateExamCache(examId);
```

> **Lý do:** Cache invalidation là side-effect, không ảnh hưởng tính đúng đắn
> của response. Nếu fail, chỉ là cache "stale" thêm vài giây — chấp nhận được.

## Requirements

### createQuestion — examId có sẵn trong params
```typescript
// Sau Question.create(...)
void invalidateExamCache(String(examId));
```

### updateQuestion — phải lấy examId từ document trước khi update
```typescript
// question đã được findById phía trên → question.examId sẵn có
// Sau findByIdAndUpdate(...)
void invalidateExamCache(String(question.examId));
```

### deleteQuestion — tương tự, examId lấy từ document trước khi xóa
```typescript
// question đã được findById → question.examId sẵn có
// Sau findByIdAndDelete(...)
void invalidateExamCache(String(question.examId));
```

### createMultipleQuestions — examId có sẵn trong params
```typescript
// Sau Question.insertMany(...)
void invalidateExamCache(String(examId));
```

### bulkDeleteQuestions — KHÔNG có examId trong params ⚠️
```typescript
// Vấn đề: chỉ có questionIds[], không biết examId
// Giải pháp: lấy câu hỏi đầu tiên để lấy examId trước khi xóa
const firstQuestion = await Question.findOne({ _id: { $in: questionIds } }).select("examId").lean();
// Sau deleteMany(...)
if (firstQuestion) {
  void invalidateExamCache(String(firstQuestion.examId));
}
// Lưu ý: giả định tất cả questionIds thuộc cùng 1 examId (đúng với use case hiện tại)
```

## Files to Modify

### `BE/src/service/question.service.ts`

**Import thêm ở đầu file:**
```typescript
import { invalidateExamCache } from "../util/cacheHelper";
```

**Full diff từng method:**

```diff
// createQuestion
  const newQuestion = await Question.create({ ...questionData, examId });
+ void invalidateExamCache(String(examId));
  return newQuestion;

// updateQuestion
  const updatedQuestion = await Question.findByIdAndUpdate(questionId, questionData, { new: true });
+ void invalidateExamCache(String(question.examId));
  return updatedQuestion;

// deleteQuestion
  await Question.findByIdAndDelete(questionId);
+ void invalidateExamCache(String(question.examId));
  return { message: "Xóa câu hỏi thành công" };

// createMultipleQuestions
  const newQuestions = await Question.insertMany(questionsWithExamId);
+ void invalidateExamCache(String(examId));
  return newQuestions;

// bulkDeleteQuestions — thêm bước lấy examId trước
+ const firstQuestion = await Question.findOne({ _id: { $in: questionIds } }).select("examId").lean();
  const result = await Question.deleteMany({ _id: { $in: questionIds } });
+ if (firstQuestion) {
+   void invalidateExamCache(String((firstQuestion as any).examId));
+ }
  return { deletedCount: result.deletedCount, requestedCount: questionIds.length };
```

## Luồng hoàn chỉnh

```
Admin PATCH /questions/:id
     ↓
QuestionController.updateQuestion()
     ↓
QuestionService.updateQuestion()
     ├── Question.findById()        ← lấy examId
     ├── Question.findByIdAndUpdate()  ← cập nhật DB ✅
     └── void invalidateExamCache(examId)  ← xóa cache async 🔥
              ↓
         redis.del("q:exam:67f24e6eb80f47790e44f84b")
              ├── Success → log "🗑️ Cache invalidated"
              └── Error   → log "⚠️ warn" — KHÔNG crash
```

## Test Criteria
- [ ] Sau updateQuestion: key `q:exam:{examId}` bị xóa khỏi Redis
- [ ] Sau deleteQuestion: key `q:exam:{examId}` bị xóa khỏi Redis
- [ ] Sau bulkDeleteQuestions: key tương ứng bị xóa
- [ ] Khi Redis down: updateQuestion/deleteQuestion vẫn trả về 200 thành công
- [ ] Log warning xuất hiện trong console khi Redis fail

## Notes
- `void` keyword dùng để mark intentional fire-and-forget, tránh ESLint warning
- `String(examId)` để đảm bảo convert ObjectId → string đúng
- Nếu sau này cần multi-exam bulk delete, cần refactor để lấy unique examIds và invalidate tất cả

---
Next Phase: Không có — feature hoàn chỉnh sau Phase 02.
