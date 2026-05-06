# Phase 03: Frontend Login Page & State
Status: ✅ Complete
Dependencies: phase-02-backend-auth.md

## Objective
Xây dựng trang Login và tích hợp state quản lý người dùng (Context hoặc Zustand/Redux).

## Requirements
### Functional
- [x] Tạo trang `/login` với form nhập email/password đẹp mắt (dùng shadcn/ui).
- [x] Lưu JWT vào LocalStorage hoặc Cookies khi đăng nhập thành công.
- [x] Tạo React Context (hoặc hook) để lưu thông tin user hiện tại (`user` object, `isAuthenticated`).

## Implementation Steps
1. [x] Tạo `FE/src/app/login/page.tsx` và thiết kế form đăng nhập.
2. [x] Viết hàm gọi API `/api/auth/login`.
3. [x] Tạo context/provider tại `FE/src/contexts/AuthContext.tsx` để bao bọc toàn bộ app.
4. [x] Khởi tạo state bằng cách check token trong `useEffect` (gọi `/api/auth/check`).

## Files to Create/Modify
- `FE/src/app/login/page.tsx`
- `FE/src/contexts/AuthContext.tsx`
- `FE/src/app/layout.tsx` (Thêm AuthProvider)

---
Next Phase: phase-04-frontend-integration.md
