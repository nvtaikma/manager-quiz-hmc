# Phase 02: Backend Auth & Middleware
Status: ✅ Complete
Dependencies: phase-01-database.md

## Objective
Xây dựng logic đăng nhập, sinh token và middleware bảo vệ các route.

## Requirements
### Functional
- [x] API `POST /api/auth/login`: So khớp password với bcrypt, trả về JWT.
- [x] API `GET /api/auth/check`: Xác thực token và trả về thông tin user.
- [x] Middleware `authAdmin`: Lấy token từ header, xác thực JWT, kiểm tra role (admin/teacher).
- [x] Gắn middleware `authAdmin` vào các route cần bảo vệ (products, exams, questions, students, classes).

## Implementation Steps
1. [x] Tạo file `BE/src/modules/auth/auth.controller.ts` & `auth.route.ts`.
2. [x] Tạo file `BE/src/middlewares/auth.middleware.ts`.
3. [x] Cập nhật `BE/src/routes/index.ts` để áp dụng middleware cho các private routes, nhưng để auth routes là public.

## Files to Create/Modify
- `BE/src/modules/auth/auth.controller.ts`
- `BE/src/modules/auth/auth.route.ts`
- `BE/src/middlewares/auth.middleware.ts`
- `BE/src/routes/index.ts`

---
Next Phase: phase-03-frontend-login.md
