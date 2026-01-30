# BE Manager API

Backend API cho hệ thống quản lý khóa học, đề thi và học sinh.

## Công nghệ sử dụng

- Node.js
- TypeScript
- Express
- MongoDB với Mongoose
- Docker

## Cấu trúc dự án

```
BE/
├── src/                # Mã nguồn
│   ├── contant/        # Các constants, types
│   ├── controllers/    # Controllers xử lý requests
│   ├── dbs/            # Kết nối database
│   ├── middleware/     # Middleware
│   ├── models/         # Models MongoDB
│   ├── routes/         # API Routes
│   ├── service/        # Business logic
│   ├── util/           # Các hàm tiện ích
│   └── index.ts        # Entry point
├── dist/               # Mã đã build
├── node_modules/       # Dependencies
├── .dockerignore       # Docker ignore
├── .env                # Biến môi trường
├── .gitignore          # Git ignore
├── docker-compose.yml  # Cấu hình Docker Compose
├── Dockerfile          # Cấu hình build Docker image
├── nodemon.json        # Cấu hình Nodemon
├── package.json        # Dependencies và scripts
├── package-lock.json   # Lock dependencies
├── README.md           # Hướng dẫn
└── tsconfig.json       # Cấu hình TypeScript
```

## Hướng dẫn phát triển

### Cài đặt

```bash
# Clone repository
git clone <repository-url>

# Cài đặt dependencies
npm install

# Tạo file .env từ .env.example
cp .env.example .env

# Chỉnh sửa file .env theo cấu hình của bạn
nano .env
```

### Chạy ứng dụng

```bash
# Cài đặt dependencies
npm install

# Chạy ứng dụng trong môi trường development
npm run dev

# Build TypeScript thành JavaScript
npm run build

# Chạy ứng dụng từ mã đã build (sau khi build)
node dist/index.js
```

## Docker

### Build Docker image

```bash
# Build Docker image sử dụng multi-stage
docker build -t nvtaikma/quizizz-app:BE-manager .
```

### Push lên Docker Hub

```bash
# Đăng nhập Docker Hub
docker login

# Push image
docker push nvtaikma/quizizz-app:BE-manager
```

## Triển khai trên VPS Ubuntu

### Yêu cầu tiên quyết

```bash
# Đảm bảo MongoDB đã được cài đặt trên hệ thống hoặc có thể truy cập
# Nếu chưa cài đặt MongoDB, bạn có thể cài đặt theo hướng dẫn chính thức:
# https://www.mongodb.com/docs/manual/tutorial/install-mongodb-on-ubuntu/

# Cài đặt Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Cài đặt Docker Compose
sudo apt-get update
sudo apt-get install docker-compose-plugin
```

### Pull và chạy ứng dụng

```bash
# Tạo thư mục dự án
mkdir -p ~/be-manager && cd ~/be-manager

# Tạo file docker-compose.yml
nano docker-compose.yml
# Paste nội dung từ file docker-compose.yml trong repository

# Sửa MONGODB_URI trong docker-compose.yml để trỏ đến MongoDB của bạn
# - Nếu MongoDB chạy trên cùng máy chủ: mongodb://host.docker.internal:27017/google-auth
# - Nếu MongoDB chạy trên máy chủ khác: mongodb://your_mongodb_server:27017/google-auth
# - Nếu MongoDB yêu cầu xác thực: mongodb://username:password@your_mongodb_server:27017/google-auth

# Pull image từ Docker Hub
docker pull nvtaikma/quizizz-app:BE-manager

# Chạy ứng dụng
docker run -d -p 3000:3000 --name quizizz-be-manager-container nvtaikma/quizizz-app:BE-manager

docker-compose up -d
```

### Kiểm tra logs

```bash
docker-compose logs -f api
```

### Dừng ứng dụng

```bash
docker-compose down
```

## API Endpoints

- `/api/products` - Quản lý sản phẩm
- `/api/orders` - Quản lý đơn hàng
- `/api/customers` - Quản lý khách hàng
- `/api/exams` - Quản lý đề thi
- `/api/questions` - Quản lý câu hỏi
- `/api/students` - Quản lý học sinh
