# Plan: Student Order Refactor & Expire Scanner
Created: 2026-02-21T14:48:00+07:00
Status: 🟡 In Progress

## Overview
Cải tiến mô hình quản lý sinh viên - đơn hàng để tránh việc hủy đơn hàng làm mất toàn bộ lịch sử học tập của sinh viên. Đồng thời tích hợp tính năng quét và xử lý sinh viên quá hạn 3 tháng.

### Vấn đề hiện tại
1. `Student` model chỉ lưu `email` và `productId`, dẫn đến việc 1 sinh viên mua lại 1 khóa học thì sẽ ghi đè record cũ. Nếu hủy đơn mới, query delete bằng `email` + `productId` sẽ xóa sạch dữ liệu truy cập khóa học đó của sinh viên.
2. Cần thêm một nút "Quét dữ liệu quá hạn" ở Frontend để có thể gọi api đổi trạng thái thành "Expired" đối với những khóa mua quá 3 tháng.

## Tech Stack
- Frontend: Next.js (React), Tailwind CSS
- Backend: Express, MongoDB
- Database: Mongoose

## Phases

| Phase | Name | Status | Progress |
|-------|------|--------|----------|
| 01 | Cập nhật Model & Logic Thêm/Hủy Student gắn với OrderId | ⬜ Pending | 0% |
| 02 | Nút Quét & Cập nhật UI Quản lý | ⬜ Pending | 0% |

## Quick Commands
- Start Phase 1: `/code plans/260221-1448-student-order-refactor/phase-01-model.md`
- Check progress: `/next`
- Save context: `/save-brain`
