# Plan: Update Question Counts Feature
Created: 2026-01-30
Status: 🟡 In Progress

## Overview
Tính năng này cho phép cập nhật tự động số lượng câu hỏi (`count`) cho từng đề thi (`Exam`) và tổng số câu hỏi (`countQuestion`) cho sản phẩm (`Product`). Tính năng được kích hoạt thông qua nút bấm trên giao diện quản lý đề thi.

## Tech Stack
- **Frontend:** Next.js, Shadcn UI (Button, Toast), Fetch API.
- **Backend:** Express, Mongoose (Aggregate queries).
- **Database:** MongoDB (Exams, Products, Questions collections).

## Phases

| Phase | Name | Status | Progress |
|-------|------|--------|----------|
| 01 | Backend API Implementation | ✅ Complete | 100% |
| 02 | Frontend UI Integration | ✅ Complete | 100% |
| 03 | Testing & Verification | ⬜ Pending | 0% |

## Quick Commands
- Start Phase 1: `/code phase-01`
- Start Phase 2: `/code phase-02`
- Check progress: `/next`
