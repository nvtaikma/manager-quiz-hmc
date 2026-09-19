# 📋 Plan: Thiết Kế Lại Dashboard & Tích Hợp Theo Dõi Báo Lỗi Chờ Xử Lý

> Created: 2026-09-10 | Status: Completed | Framework: /plan v3.2 + /ui-ux-pro-max

## 1. Overview
Nâng cấp toàn diện giao diện trang chủ Dashboard (Bảng điều khiển) cho hệ thống Manager Quiz HMC:
- Ứng dụng phong cách **Data-Dense Operations Bento Grid** chuẩn UI/UX 2025.
- Tích hợp cụm thông số và widget theo dõi **Báo lỗi câu hỏi đang chờ xử lý** (Pending Question Reports) từ học viên.
- Tối ưu hóa cơ chế tải dữ liệu mạng (chống sập trang với `safeFetch` / `Promise.allSettled` và Skeleton loading).

## 2. Tech Stack & Design Tokens
- **Framework:** Next.js (App Router), React 19, TailwindCSS, Lucide Icons, Recharts.
- **Design Rules:** ui-ux-pro-max Data-Dense Dashboard, Purple Ban compliant, no emoji icons.
- **Color Tokens:** Primary Blue (`#2563EB`), Amber Pending (`#D97706`), Red Alert (`#DC2626`), Emerald Done (`#059669`).

## 3. Progress Tracker

| Phase | Tên Phase | Mô tả | Trạng thái | Tiến độ |
|---|---|---|---|---|
| 01 | API & Data Resilience | Định nghĩa data contract, tích hợp API `/api/reports`, xử lý gọi an toàn | ✅ Completed | 100% |
| 02 | Design System Components | Tạo các component nguyên tử (`StatCard`, badges, skeleton) | ✅ Completed | 100% |
| 03 | Pending Reports Widget | Xây dựng widget hiển thị và theo dõi báo lỗi chờ xử lý | ✅ Completed | 100% |
| 04 | Full Page Bento Integration | Ráp layout hoàn chỉnh tại `FE/src/app/page.tsx`, kiểm thử responsive | ✅ Completed | 100% |

## 4. Features Checklist
- [x] Thẻ KPI hiển thị số lượng câu hỏi báo lỗi chờ xử lý (`pending`) có hiệu ứng cảnh báo
- [x] Thẻ KPI tỷ lệ giải quyết lỗi (`Resolution Rate`)
- [x] Widget danh sách 5 báo cáo lỗi mới nhất cần xử lý nhanh + nút chuyển sang `/reports/[id]`
- [x] Nâng cấp thẻ doanh thu, đơn hàng, học viên online thành phong cách Bento Grid hiện đại
- [x] Nâng cấp biểu đồ doanh thu sang AreaChart mượt mà với gradient & tooltip chuẩn VND
- [x] Nút Refresh dữ liệu tức thì và trạng thái cập nhật thời gian thực
- [x] Skeleton loading states theo từng phần thay vì spinner toàn trang
