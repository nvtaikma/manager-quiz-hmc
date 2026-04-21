# Plan: Cache Invalidation cho Question Mutations
Created: 2026-04-21 16:44
Status: ✅ Completed

## Overview
Khi Admin thêm/sửa/xóa câu hỏi, hệ thống cần xóa cache Redis tương ứng (`q:exam:{examId}`)
để đảm bảo người dùng luôn nhận được dữ liệu mới nhất.

## Tech Stack
- Backend: Express + TypeScript
- Cache: ioredis (đã có `BE/src/dbs/redis.ts`)
- Pattern: Service Layer invalidation (không dùng Mongoose hook)

## Phân tích kiến trúc

### Tại sao chọn Service Layer thay vì Mongoose Middleware?

| Tiêu chí | Mongoose Post Hook | Service Layer ✅ |
|---|---|---|
| Truy cập `examId` | Phức tạp (cần populate) | Sẵn có trong service |
| Kiểm soát luồng | Khó debug | Rõ ràng, dễ trace |
| Fire-and-forget safe | Rủi ro | Dễ implement |
| Test | Khó mock | Dễ mock |

**Kết luận:** Gọi thẳng trong Service layer — đơn giản, an toàn, dễ maintain.

### Điểm thay đổi (Touch Points)

| Hành động | Service Method | Cache Key cần xóa |
|---|---|---|
| Tạo câu hỏi | `createQuestion` | `q:exam:{examId}` |
| Cập nhật câu hỏi | `updateQuestion` | `q:exam:{question.examId}` |
| Xóa câu hỏi | `deleteQuestion` | `q:exam:{question.examId}` |
| Xóa nhiều | `bulkDeleteQuestions` | Cần lấy examId từ DB trước |
| Tạo nhiều | `createMultipleQuestions` | `q:exam:{examId}` |

## Phases

| Phase | Name | Status | Progress |
|-------|------|--------|----|
| 01 | Utility: `invalidateExamCache` | ✅ Complete | 100% |
| 02 | Tích hợp vào QuestionService | ✅ Complete | 100% |

## Quick Commands
- Code phase 01: `/code phase-01`
- Code phase 02: `/code phase-02`
