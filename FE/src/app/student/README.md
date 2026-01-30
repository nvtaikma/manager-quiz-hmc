# Trang Danh Sách Sinh Viên (Student Page)

## Mô tả
Trang này hiển thị danh sách sinh viên được phân loại theo trạng thái: Hoàn thành, Đang chờ, và Hết hạn.

## Cấu trúc tệp

```
src/app/student/
├── components/
│   ├── types.ts          # Định nghĩa các interface TypeScript
│   └── StudentTable.tsx  # Component bảng hiển thị sinh viên
├── page.tsx              # Trang chính
└── README.md            # Tài liệu này
```

## Thành phần chính

### 1. `page.tsx` (StudentPage)
- Trang chính sử dụng `Suspense` cho loading state
- Quản lý state: activeTab, students, loading, error, pagination
- Gọi API dựa trên tab và trang hiện tại
- Cập nhật URL khi chuyển tab hoặc trang

### 2. `StudentTable.tsx`
- Component hiển thị bảng sinh viên
- Các cột: Email, Tên khóa học, Trạng thái
- Responsive design cho mobile/desktop
- Hỗ trợ color coding theo trạng thái

### 3. `types.ts`
- Interface `Student`: Thông tin sinh viên
- Interface `Product`: Thông tin khóa học
- Interface `StudentPagination`: Thông tin phân trang
- Interface `StudentsResponse`: Response từ API

## Các tính năng

### 3 Tab lọc theo trạng thái
- **Hoàn thành** (completed): Màu xanh lá
- **Đang chờ** (pending): Màu vàng
- **Hết hạn** (expired): Màu đỏ

### Phân trang (Pagination)
- Hỗ trợ điều hướng giữa các trang
- Dữ liệu từ API: `pagination.totalPages`
- URL được cập nhật: `?status=completed&page=1`

### Responsive Design
- Desktop: Hiển thị toàn bộ thông tin
- Mobile: Ghi chú thông tin khóa học và trạng thái dưới email

### Xử lý trạng thái
- **Loading**: Hiển thị spinner khi đang tải dữ liệu
- **Error**: Hiển thị thông báo lỗi khi API gặp sự cố
- **Empty**: Hiển thị "Không có dữ liệu sinh viên" khi danh sách trống

## API Integration

**Endpoint:** `${API_BASE_URL}/students/status/:status`

**Method:** GET

**Query Parameters:**
- `status` (path): "completed", "pending", hoặc "expired"
- `page` (query): Số trang (mặc định: 1)

**Response Format:**
```json
{
  "message": "Success",
  "data": {
    "students": [
      {
        "_id": "...",
        "email": "...",
        "productId": "...",
        "status": "completed",
        "product": {
          "_id": "...",
          "name": "..."
        }
      }
    ],
    "pagination": {
      "total": 10,
      "page": 1,
      "limit": 15,
      "totalPages": 1
    }
  }
}
```

## Navigation

Trang được thêm vào sidebar với icon `GraduationCap` và link `/student`.

**Navigation Item:**
- **Title:** Sinh viên
- **URL:** `/student`
- **Icon:** GraduationCap (từ lucide-react)
- **Description:** Danh sách sinh viên theo trạng thái

## Styling

- Sử dụng Tailwind CSS
- Sử dụng Shadcn UI components
- Color-coded status badges
- Responsive table design

## Ví dụ sử dụng

```typescript
// Chuyển sang tab "pending"
handleTabChange("pending")

// Chuyển sang trang 2
handlePageChange(2)
```

## Lưu ý

- Dữ liệu được fetch từ API dựa trên `status` và `page`
- URL được cập nhật khi chuyển tab/trang để hỗ trợ bookmarking
- Component sử dụng `Suspense` cho loading state
- Error handling cho API failures

