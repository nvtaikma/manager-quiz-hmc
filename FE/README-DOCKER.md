# Hướng dẫn Docker cho FE-manager

Tài liệu này cung cấp hướng dẫn về cách build, push và deploy ứng dụng FE-manager sử dụng Docker.

## Cấu trúc thư mục

```
.
├── Dockerfile            # File cấu hình Docker đa giai đoạn
├── .dockerignore         # Danh sách file bỏ qua khi build Docker
├── build-push.sh         # Script build và push image lên Docker Hub
├── deploy.sh             # Script deploy ứng dụng trên VPS Ubuntu
├── deploy-windows.ps1    # Script PowerShell để deploy từ Windows
├── build-run-local.sh    # Script build và chạy ứng dụng cục bộ
├── docker-compose.yml    # Cấu hình Docker Compose
└── ecosystem.config.js   # Cấu hình PM2 cho ứng dụng
```

## Yêu cầu

- Docker
- Node.js (để phát triển cục bộ)
- VPS Ubuntu (để triển khai)
- Tài khoản Docker Hub

## Chuẩn bị môi trường

1. Tạo file `.env` trong thư mục gốc của dự án:

```bash
NEXT_PUBLIC_API_URL=http://[your-api-endpoint]/api
```

## Build và Push lên Docker Hub

### Cách 1: Sử dụng script tự động

1. Cấp quyền thực thi cho script:

   ```bash
   chmod +x build-push.sh
   ```

2. Chạy script với API URL tùy chọn:
   ```bash
   ./build-push.sh "https://api-url.com" "version"
   ```
   - Đối số đầu tiên: URL API (mặc định: "https://api.example.com")
   - Đối số thứ hai: Phiên bản tag (mặc định: "latest")

### Cách 2: Build và chạy cục bộ

1. Cấp quyền thực thi cho script:

   ```bash
   chmod +x build-run-local.sh
   ```

2. Chạy script để build và chạy ứng dụng cục bộ:
   ```bash
   ./build-run-local.sh "http://your-api-url.com/api" "version"
   ```

### Cách 3: Sử dụng Docker Compose

1. Cấu hình biến môi trường trong file `.env`

2. Build và chạy với Docker Compose:

   ```bash
   docker-compose up -d --build
   ```

3. Dừng container:
   ```bash
   docker-compose down
   ```

## Triển khai trên VPS Ubuntu

### Cách 1: Triển khai từ Linux/Mac

1. Sao chép file `deploy.sh` lên VPS:

   ```bash
   scp deploy.sh user@your-vps-ip:~/
   ```

2. Kết nối đến VPS và cấp quyền thực thi:

   ```bash
   ssh user@your-vps-ip
   chmod +x deploy.sh
   ```

3. Chạy script:

   ```bash
   ./deploy.sh "tag-version" "port-number"
   ```

   - Đối số 1: Phiên bản tag muốn triển khai (mặc định: "latest")
   - Đối số 2: Cổng muốn mở (mặc định: 3001)

4. Script sẽ tự động cấu hình tường lửa và hiển thị URL để truy cập ứng dụng.

### Cách 2: Triển khai từ Windows

1. Sử dụng script PowerShell:

   ```powershell
   .\deploy-windows.ps1
   ```

   Hoặc chạy với tham số:

   ```powershell
   .\deploy-windows.ps1 -sshUser "ubuntu" -sshHost "192.168.1.10" -sshPort "22" -tagVersion "latest" -sshKeyPath "C:\path\to\key.pem"
   ```

2. Script sẽ tự động:
   - Sao chép file deploy.sh lên VPS
   - Triển khai ứng dụng trên VPS
   - Hiển thị URL để truy cập ứng dụng

### Cách 3: Sử dụng Docker Compose trên VPS

1. Sao chép file `docker-compose.yml` và `.env` lên VPS:

   ```bash
   scp docker-compose.yml .env user@your-vps-ip:~/
   ```

2. Kết nối đến VPS và chạy docker-compose:

   ```bash
   ssh user@your-vps-ip
   docker-compose up -d
   ```

## Cấu trúc Docker

- **Multi-stage build**: Giảm kích thước image bằng cách tách giai đoạn build và runtime.
- **Non-root user**: Chạy container với người dùng không có quyền root để tăng bảo mật.
- **PM2 process manager**: Tối ưu hiệu suất và tự động khởi động lại ứng dụng.
- **HEALTHCHECK**: Tự động kiểm tra tình trạng ứng dụng và khởi động lại nếu cần.
- **Volumes**: Lưu trữ dữ liệu bền vững giữa các lần triển khai.

## Bảo mật

Các biện pháp bảo mật đã được áp dụng:

1. **Người dùng không có quyền root**: Container chạy dưới quyền người dùng hạn chế.
2. **Tệp .env riêng biệt**: Biến môi trường được lưu trong tệp riêng.
3. **Image tối thiểu**: Chỉ những file cần thiết được bao gồm trong image.
4. **Các phụ thuộc cố định**: Phiên bản cụ thể của Node.js và các phụ thuộc được sử dụng.
5. **Kiểm tra sức khỏe**: Tự động theo dõi tình trạng ứng dụng.

## Kiểm tra hoạt động

Sau khi triển khai, bạn có thể kiểm tra ứng dụng theo các cách sau:

1. **Truy cập ứng dụng trong trình duyệt**:

   ```
   http://YOUR_SERVER_IP:3001
   ```

2. **Kiểm tra logs container**:

   ```bash
   docker logs fe-manager
   ```

3. **Kiểm tra trạng thái container**:

   ```bash
   docker ps -a | grep fe-manager
   ```

4. **Kiểm tra sức khỏe container**:
   ```bash
   docker inspect --format "{{json .State.Health }}" fe-manager | jq
   ```

## Khắc phục sự cố

1. **Lỗi khi build Docker**:

   - Kiểm tra logs build: `docker build -t fe-manager . --progress=plain`
   - Đảm bảo Node.js có phiên bản phù hợp và tất cả dependencies đã được cài đặt.

2. **Lỗi khi chạy container**:

   - Kiểm tra logs: `docker logs fe-manager`
   - Kiểm tra kết nối: `curl http://localhost:3001`
   - Kiểm tra cổng: `netstat -tulpn | grep 3001`

3. **Không thể truy cập từ bên ngoài**:

   - Kiểm tra tường lửa: `sudo ufw status`
   - Kiểm tra kết nối mạng: `ping YOUR_SERVER_IP`
   - Kiểm tra cấu hình mạng của VPS: `ip addr show`

4. **Lỗi với file .env**:

   - Đảm bảo file .env có định dạng đúng và quyền truy cập phù hợp
   - Kiểm tra biến môi trường trong container: `docker exec fe-manager env`

5. **Lỗi hết bộ nhớ**:
   - Tăng giới hạn bộ nhớ trong docker-compose.yml hoặc lệnh docker run
   - Kiểm tra sử dụng bộ nhớ: `docker stats fe-manager`
