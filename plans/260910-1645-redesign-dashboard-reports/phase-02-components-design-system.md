# Phase 02: Design System Components

## Mục tiêu:
Xây dựng các thành phần giao diện nhỏ lẻ (Atomic / Molecule components) theo tiêu chuẩn **ui-ux-pro-max** Data-Dense style, đảm bảo tuân thủ Purple Ban, dùng icon Lucide nhất quán và có micro-interactions mượt mà.

## Tasks:
- [ ] Xây dựng `FE/src/app/components/dashboard/StatCard.tsx`:
  - Hỗ trợ variant màu: `default` (slate/blue), `warning` (amber), `danger` (red), `success` (emerald).
  - Hỗ trợ trend indicator: % tăng/giảm so với kỳ trước với icon `TrendingUp` / `TrendingDown`.
  - Hỗ trợ pulse indicator cho các việc khẩn cấp (như có báo lỗi pending).
  - Tối ưu hover lift effect và border glow nhẹ.
- [ ] Xây dựng skeleton loading chuyên biệt cho từng loại widget (StatCard Skeleton, Chart Skeleton, Feed Skeleton).
- [ ] Chuẩn hóa hàm format tiền tệ (VND) và format thời gian tương đối (vd: "5 phút trước").
