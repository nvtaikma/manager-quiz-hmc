# Phase 04: Frontend Integration & Route Guard
Status: ✅ Complete
Dependencies: phase-03-frontend-login.md

## Objective
Tích hợp Token vào mọi request và ngăn chặn truy cập nếu chưa đăng nhập.

## Requirements
### Functional
- [x] Cấu hình API Interceptor (Axios hoặc fetch wrapper) để tự động thêm header `Authorization: Bearer <token>` vào request.
- [x] Xử lý logic tự động logout/clear storage nếu response trả về `401 Unauthorized`.
- [x] Tạo Route Guard cho các Component để redirect về `/login` nếu người dùng chưa có auth state hợp lệ.

## Implementation Steps
1. [x] Cập nhật hoặc tạo file config API call (`FE/src/lib/axios.ts` hoặc tương đương).
2. [x] Áp dụng Route Guard: có thể viết component bọc ngoài `<ProtectedRoute>` hoặc dùng middleware.ts của Next.js để chặn ở mức server-side / client-side (tùy vào kiến trúc hiện tại).
3. [ ] Cập nhật UI Navbar/Sidebar để thêm nút Logout.

## Files to Create/Modify
- `FE/src/lib/api.ts` (hoặc nơi cấu hình fetch/axios)
- `FE/src/components/ProtectedRoute.tsx` (hoặc `middleware.ts`)
- `FE/src/components/layout/Header.tsx` (Thêm nút Logout)

---
Next Phase: Hoàn thành!
