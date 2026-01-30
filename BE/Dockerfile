# Dockerfile
# Stage 1: Build stage
FROM node:18-alpine AS builder

WORKDIR /app

# Sao chép các file cấu hình
COPY package*.json ./
COPY tsconfig.json ./
COPY nodemon.json ./

# Cài đặt tất cả dependencies (bao gồm devDependencies)
RUN npm ci

# Sao chép source code
COPY src/ ./src/

# Build ứng dụng TypeScript
RUN npm run build

# Stage 2: Production stage
FROM node:18-alpine

WORKDIR /app

# Sao chép package.json và package-lock.json
COPY package*.json ./

# Chỉ cài đặt dependencies production
RUN npm ci --only=production

# Sao chép thư mục dist từ stage build
COPY --from=builder /app/dist ./dist

# Biến môi trường
ENV NODE_ENV=production
ENV PORT=3000

# Expose port
EXPOSE 3000

# Khởi chạy ứng dụng
CMD ["node", "dist/index.js"] 