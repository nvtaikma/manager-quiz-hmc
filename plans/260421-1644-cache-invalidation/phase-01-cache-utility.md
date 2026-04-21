# Phase 01: Utility — `invalidateExamCache`
Status: ✅ Complete
Dependencies: None

## Objective
Tạo hàm tiện ích an toàn để xóa cache Redis cho một `examId` cụ thể.
Hàm phải **không bao giờ throw lỗi** — nếu Redis mất kết nối, nghiệp vụ DB vẫn tiếp tục.

## Requirements

### Functional
- [x] Nhận `examId: string` → xóa key `q:exam:{examId}` trên Redis
- [x] Trả về `boolean` (true = đã xóa, false = không có key / Redis lỗi)
- [x] Log cảnh báo nếu Redis lỗi, KHÔNG throw lỗi ra ngoài

### Non-Functional
- [x] Pattern: fire-and-forget an toàn với try/catch đầy đủ
- [x] Tái sử dụng instance `redis` từ `BE/src/dbs/redis.ts` (không tạo connection mới)

## Files to Create

### `BE/src/util/cacheHelper.ts`

```typescript
import redis from "../dbs/redis";

/**
 * Xây dựng Redis key theo chuẩn cho question cache của exam
 * Format: q:exam:{examId}
 */
export const buildExamCacheKey = (examId: string): string =>
  `q:exam:${examId}`;

/**
 * Xóa cache câu hỏi của một đề thi khỏi Redis.
 * Hàm này KHÔNG throw lỗi — Redis failure không ảnh hưởng luồng chính.
 *
 * @param examId - ID của đề thi cần invalidate cache
 * @returns true nếu key tồn tại và đã xóa, false nếu không có key hoặc lỗi
 */
export const invalidateExamCache = async (examId: string): Promise<boolean> => {
  try {
    const key = buildExamCacheKey(examId);
    const deleted = await redis.del(key);
    if (deleted > 0) {
      console.log(`🗑️ Cache invalidated: ${key}`);
      return true;
    }
    // Key không tồn tại (cache miss) — không phải lỗi
    return false;
  } catch (error) {
    // Redis lỗi: log cảnh báo nhưng không làm gián đoạn nghiệp vụ
    console.warn(`⚠️ Cache invalidation failed for exam ${examId}:`, error);
    return false;
  }
};
```

## Test Criteria
- [ ] Gọi hàm với examId hợp lệ → key bị xóa, trả về `true`
- [ ] Gọi hàm với examId không có cache → trả về `false`, không lỗi
- [ ] Giả lập Redis mất kết nối → hàm vẫn trả về `false`, KHÔNG crash

---
Next Phase: [phase-02-service-integration.md](./phase-02-service-integration.md)
