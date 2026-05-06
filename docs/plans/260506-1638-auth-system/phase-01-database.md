# Phase 01: Database Schema & Initial Setup
Status: ⬜ Pending
Dependencies: None

## Objective
Tạo cấu trúc database cho Admin model và cài đặt các thư viện mã hóa.

## Requirements
### Functional
- [ ] Định nghĩa `Admin` schema với email (unique), password, role (admin/teacher).
- [ ] Thêm dependencies cần thiết (`bcryptjs`, `jsonwebtoken`, `@types/bcryptjs`, `@types/jsonwebtoken`).
- [ ] Tạo file `.env` config JWT_SECRET (nếu chưa có).

## Implementation Steps
1. [ ] Install `bcryptjs`, `jsonwebtoken` (và types tương ứng).
2. [ ] Tạo file `BE/src/modules/admin/admin.model.ts` với cấu trúc schema.
3. [ ] Tạo script hoặc file seeder để tạo Admin tài khoản mặc định (để có data test).

## Files to Create/Modify
- `BE/package.json`
- `BE/src/modules/admin/admin.model.ts`
- `BE/src/scripts/seedAdmin.ts`

---
Next Phase: phase-02-backend-auth.md
