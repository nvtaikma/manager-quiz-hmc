# Phase 01: Backend API Implementation
Status: ✅ Complete
Dependencies: None

## Objective
Xây dựng API endpoint để đồng bộ số lượng câu hỏi cho Exams và Product.

## Requirements
### Functional
- [ ] API endpoint `PUT /api/products/:id/sync-question-counts`.
- [ ] Tính toán số lượng câu hỏi (`count`) cho từng Exam thuộc Product.
- [ ] Cập nhật field `count` trong collection `Exam`.
- [ ] Tính tổng số lượng câu hỏi của tất cả Exams thuộc Product.
- [ ] Cập nhật field `countQuestion` trong collection `Product`.
- [ ] Trả về kết quả thành công kèm data mới nhất.

## Implementation Steps
1. [x] **Update Controller (`product.controller.ts`)**:
    - Thêm method `syncQuestionCounts`.
    - Logic: Find Exams -> Aggregate/Count Questions -> Update Exam -> Sum -> Update Product.
2. [x] **Update Route (`product.route.ts`)** (hoặc file route tương ứng):
    - Thêm route `PUT /:id/sync-counts` trỏ đến controller method trên.

## Files to Modify
- `BE/src/controllers/product.controller.ts`
- `BE/src/routes/product.route.ts` (kiểm tra lại tên file chính xác)

## Test Criteria
- [ ] Gọi API với `productId` tồn tại -> HTTP 200 via Postman/cURL.
- [ ] Kiểm tra DB: Exam `count` khớp với số documents trong Question collection.
- [ ] Kiểm tra DB: Product `countQuestion` khớp với tổng.
