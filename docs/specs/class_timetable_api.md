# Tài liệu API Quản lý Lớp học & Thời khóa biểu

Dưới đây là tài liệu chi tiết về các API để thêm lớp học và nhập thời khóa biểu.

## 1. Thêm danh sách lớp học (Bulk Create Classes)

API này dùng để thêm nhiều lớp cùng lúc. Hệ thống sẽ tự động bỏ qua các tên lớp trùng lặp đã tồn tại trong hệ thống.

- **URL:** `/api/classes/bulk`
- **Method:** `POST`
- **Headers:**
  - `Content-Type`: `application/json`

### Request Body (Ví dụ)

```json
{
  "classes": [
    "CSSĐ 3A01",
    "CSSĐ 3A03",
    "CSSĐ 3A04",
    "CSSĐ 3A05",
    "CSSĐ 3A07",
    "CSSĐ 3A08",
    "CSSĐ 3A09",
    "CSSĐ 3A10",
    "CSSĐ 3A11",
    "Dược 15A08"
  ]
}
```

### Response

**Thành công (200 OK):**

```json
{
  "message": "Bulk create classes success",
  "data": {
    "insertedCount": 3,
    "insertedClasses": [
      { "_id": "...", "name": "..." },
      ...
    ]
  }
}
```

Nếu tất cả các lớp đã tồn tại:

```json
{
  "message": "Bulk create classes success",
  "data": {
    "insertedCount": 0,
    "message": "No new classes to add. All classes already exist."
  }
}
```

---

## 2. Nhập Thời khóa biểu (Import Timetable)

API này dùng để nhập lịch học cho một hoặc nhiều lớp.
**LƯU Ý QUAN TRỌNG:** API sẽ **XÓA** toàn bộ lịch cũ của các lớp có trong danh sách import và thay thế bằng lịch mới.

### Cách 1: Import chung (Nhiều lớp)

- **URL:** `/api/classes/timetable/import`
- **Method:** `POST`

### Cách 2: Import cho 1 lớp cụ thể (Validation chặt chẽ)

Dùng cách này để đảm bảo chỉ import lịch cho đúng lớp đang chọn. Nếu dữ liệu chứa lớp khác, API sẽ báo lỗi.

- **URL:** `/api/classes/:className/timetable/import`
- **Method:** `POST`
- **URL Params:**
  - `className`: Tên lớp (Ví dụ: `Dược 15A08`)

### Request Body (JSON Array)

```json
[
  {
    "buoi": "Chiều",
    "ngay_hoc": "23/1/2026",
    "giang_duong": "PTH Tin 3",
    "dia_diem": "35 Đoàn Thị Điểm",
    "doi_tuong": "02. DS15",
    "ten_lop": "Dược 15A08",
    "mon_hoc": "Cấu tạo và chức năng của cơ thể",
    "loai_gio": "Thi hết môn",
    "so_tiet": "T",
    "giang_vien": "",
    "sdt_gv": "",
    "noi_dung": "",
    "gio_thi": "13h30",
    "ghi_chu": ""
  },
  {
    "buoi": "Chiều",
    "ngay_hoc": "24/1/2026",
    "giang_duong": "PTH 05",
    "dia_diem": "35 Đoàn Thị Điểm",
    "doi_tuong": "08. YS3",
    "ten_lop": "Y sỹ đa khoa 3A05",
    "mon_hoc": "Cấu tạo và chức năng của cơ thể",
    "loai_gio": "2.Thực hành",
    "so_tiet": "5",
    "giang_vien": "Vũ Thị Ngọc",
    "sdt_gv": "836852319",
    "noi_dung": "Bài 4: TH cấu tạo GP chi dưới",
    "gio_thi": "",
    "ghi_chu": ""
  }
]
```

### Response

**Thành công (200 OK):**

```json
{
  "message": "Import timetable success",
  "data": [
    {
      "buoi": "Chiều",
      "ngay_hoc": "2026-01-23T00:00:00.000Z",
      "ten_lop": "Dược 15A08",
      ...
    },
    ...
  ]
}
```

**Lỗi (500 Internal Server Error):**

- Nếu lớp chưa tồn tại trong hệ thống:
  ```json
  { "message": "Các lớp sau chưa tồn tại trong hệ thống: Lớp Z. Vui lòng thêm lớp trước khi import lịch." }
  ```
- Nếu tên lớp trong JSON không khớp với URL (khi dùng Cách 2):
  ```json
  { "message": "Dữ liệu chứa lớp 'Lớp B' không khớp với lớp đang chọn 'Lớp A'." }
  ```
