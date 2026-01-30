# Phase 02: Frontend UI Integration
Status: ✅ Complete
Dependencies: Phase 01

## Objective
Thêm nút "Cập nhật số lượng câu hỏi" trên giao diện quản lý đề thi và kết nối với Backend API.

## Requirements
### Functional
- [ ] Thêm nút Sync (icon Refresh) trên header của `ExamManager.tsx`.
- [ ] Hiển thị trạng thái Loading khi đang request.
- [ ] Show Toast notification khi thành công hoặc thất bại.
- [ ] (Optional) Reload lại data Product sau khi sync thành công để hiển thị số mới (nếu UI có hiện).

## Implementation Steps
1. [x] **Modify `ExamManager.tsx`**:
    - Thêm function `handleSyncCounts`.
    - Thêm Button vào thanh công cụ (cạnh nút "Thêm đề thi").
    - Xử lý UI feedback (loading, toast).

## Files to Modify
- `FE/src/app/product-exams/[productId]/components/ExamManager.tsx`

## Test Criteria
- [ ] Click nút Sync -> API request gửi đi.
- [ ] UI hiện loading.
- [ ] API trả về 200 -> Toast success hiện ra.
