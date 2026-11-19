# 🚀 HƯỚNG DẪN BUILD & DEPLOY DOCKER (MANAGER QUIZ HMC)

Tài liệu này tóm tắt cách sử dụng script tự động **[build-docker.ps1](./build-docker.ps1)** để build, đẩy (push) image lên Docker Hub và triển khai trên VPS.

---

## 1. Cơ chế tự động nhận diện Local vs Production

Hiện tại dự án đã được cấu hình **tự động chuyển đổi theo môi trường (`NODE_ENV`)**, bạn **KHÔNG CẦN** phải mở file ra comment/uncomment thủ công mỗi lần code hay build nữa:

| Thành phần | Khi chạy ở máy (`npm run dev`) | Khi Build Docker (`NODE_ENV=production`) |
| :--- | :--- | :--- |
| **Backend DB** (`BE/src/dbs/mongodb.ts`) | `mongodb://localhost:27017/google-auth` | `mongodb://hmcuser:hmcuser1a123@103.162.20.159:27017/admin` |
| **Frontend API** (`FE/src/contants/api.ts`) | `http://localhost:3000/api` | `https://manager-api.testhmc.site/api` |

---

## 2. Các lệnh Build & Push ở máy Local

Mở Terminal (PowerShell) tại thư mục gốc của dự án (`EDIT_1_8`) và chạy một trong các lệnh sau:

### 🔹 Trường hợp 1: Build & Push cả Backend và Frontend
```powershell
.\build-docker.ps1 -be v22 -fe v25
```
*(Mẹo: Bạn có thể truyền `-be 22 -fe 25` hoặc `-be v22 -fe v25` đều được. Nếu chỉ gõ `.\build-docker.ps1` không kèm tham số thì mặc định sẽ lấy bản lưu trong file là `v22` và `v25`).*

### 🔹 Trường hợp 2: Chỉ sửa giao diện -> Chỉ Build & Push mỗi Frontend (FE)
```powershell
.\build-docker.ps1 -fe v26 -onlyFE
```

### 🔹 Trường hợp 3: Chỉ sửa API/Database -> Chỉ Build & Push mỗi Backend (BE)
```powershell
.\build-docker.ps1 -be v23 -onlyBE
```

### 🔹 Trường hợp 4: Chỉ muốn Build thử ở máy, chưa Push lên Docker Hub
```powershell
.\build-docker.ps1 -be v22 -fe v25 -noPush
```

---

## 3. Các lệnh chạy trên VPS sau khi Push xong

Sau khi script chạy xong ở máy Local, màn hình Terminal sẽ in sẵn 2 câu lệnh `docker run` đúng với version bạn vừa build.

Trên VPS, thực hiện theo thứ tự:

### Bước 1: Dừng và xóa container bản cũ (nếu đang chạy)
```bash
# Xem danh sách container đang chạy để biết tên bản cũ
docker ps

# Dừng và xóa bản cũ (thay số version cũ tương ứng)
docker rm -f manager-BE-v21
docker rm -f manager-FE-v24
```

### Bước 2: Chạy container bản mới
```bash
# Chạy Backend (dùng --network host)
docker run -d --name manager-BE-v22 --restart always --network host nvtaikma/quizizz-app:manager-BE-v22

# Chạy Frontend (map cổng 127.0.0.1:3001:3001)
docker run -d --name manager-FE-v25 --restart always -p 127.0.0.1:3001:3001 nvtaikma/quizizz-app:manager-FE-v25
```

### Bước 3: Kiểm tra trạng thái & log trên VPS
```bash
docker ps
docker logs -f --tail 50 manager-BE-v22
docker logs -f --tail 50 manager-FE-v25
```

---

## 4. Ghi chú về nhánh Git hiện tại

- **`main`**: Nhánh chính dùng để phát hành bản Production hiện tại (không chứa tính năng Mã giới thiệu / Voucher).
- **`feat/referral-voucher`**: Nhánh đang cất giữ toàn bộ code tính năng **Mã giới thiệu & Quản lý Voucher**.
  - Khi nào muốn chuyển sang làm tiếp hoặc phát hành tính năng Mã giới thiệu:
    ```bash
    git checkout feat/referral-voucher
    ```
  - Hoặc gộp (`merge`) tính năng Mã giới thiệu vào nhánh `main`:
    ```bash
    git checkout main
    git merge feat/referral-voucher
    ```
