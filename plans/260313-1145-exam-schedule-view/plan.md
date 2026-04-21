# Plan: Xem Lịch Thi Tổng Hợp (Exam Schedule View)
Created: 2026-03-13 11:45
Status: 🟢 Completed

## Overview
Thêm nút **"Lịch thi"** vào trang Quản lý Lớp Học (`/classes`). Khi ấn vào, hiển thị **tất cả lịch thi** từ mọi lớp, sắp xếp theo ngày (gần nhất lên trước).

**Dữ liệu đã có sẵn:** Trường `loai_gio` trong model `Timetable`. Lọc những buổi có `loai_gio === "Thi hết môn"`.

## Tech Stack
- Frontend: Next.js (React) + TailwindCSS
- Backend: Express.js + TypeScript + MongoDB (Mongoose)

## Phases

| Phase | Name | Status | Progress |
|-------|------|--------|----------|
| 01 | Backend API | ✅ Completed | 100% |
| 02 | Frontend UI | ✅ Completed | 100% |

## Quick Commands
- Start: `/code phase-01`
- Check progress: `/next`
