# Plan: Sao chép câu hỏi & Xóa hàng loạt
Created: 2026-04-21 16:16
Status: ✅ Completed

## Overview
Hai tính năng bổ trợ cho hệ thống quản lý câu hỏi:
1. **Copy Question (Clipboard)**: Thêm nút "Sao chép" tại `/product-syllabus/[productId]` — copy nội dung câu hỏi vào clipboard (giống Ctrl-C). Lógic này **đã tồn tại** trong `QuestionManager.tsx`, chỉ cần port sang `SyllabusManager.tsx`. **Không cần API backend.**
2. **Bulk Delete**: Xóa nhiều câu hỏi cùng lúc tại `/exam-questions/[examId]` — thêm checkbox, "Chọn tất cả", và confirm modal trước khi xóa.

## Tech Stack
- Frontend: Next.js (React) + TailwindCSS + shadcn/ui
- Backend: Express.js + TypeScript + MongoDB (Mongoose)

| Kết quả phân tích code hiện tại

| Item | Trạng thái |
|------|------------|
| `QuestionManager.tsx` — hàm `copyQuestionToClipboard` | **Đã có** — copy text câu hỏi vào clipboard |
| `SyllabusManager.tsx` — nút copy | **Chưa có** — cần port lồi hàm clipboard |
| `question.controller.ts` | Cần thêm `bulkDeleteQuestions` |
| `question.service.ts` | Cần thêm `bulkDeleteQuestions` |
| `question.route.ts` | Cần thêm route `DELETE /bulk` |

## Phases

| Phase | Name | Status | Progress |
|-------|------|--------|-----------|
| 01 | Backend — Bulk Delete API | ✅ Completed | 100% |
| 02 | Frontend — Copy Question to Clipboard (Syllabus) | ✅ Completed | 100% |
| 03 | Frontend — Bulk Delete (ExamQuestions) | ✅ Completed | 100% |

## Quick Commands
- Start Phase 1: `/code phase-01`
- Check progress: `/next`
- Save context: `/save-brain`
