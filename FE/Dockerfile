# Giai đoạn build
FROM node:20-alpine AS builder

WORKDIR /app

# Sao chép package.json và package-lock.json
COPY package*.json ./

# Cài đặt dependencies trong môi trường development để có devDependencies
ENV NODE_ENV=development
RUN npm install --legacy-peer-deps

# Sao chép toàn bộ mã nguồn
COPY . .

# Thiết lập biến môi trường API URL từ build arg
ARG NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL}

# Chuyển sang môi trường production trước khi build
ENV NODE_ENV=production

# Build ứng dụng
RUN npm run build

# Giai đoạn production
FROM node:20-alpine AS runner

WORKDIR /app

# Thiết lập môi trường
ENV NODE_ENV=production
ENV PORT=3001
ENV NEXT_TELEMETRY_DISABLED=1

# Sao chép file cần thiết từ giai đoạn build
COPY --from=builder /app/package.json ./
COPY --from=builder /app/package-lock.json ./
COPY --from=builder /app/next.config.ts ./
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules

# Sao chép file accounts.json để authentication hoạt động
COPY --from=builder /app/src/data/accounts.json ./src/data/accounts.json

# Sao chép file .env từ máy host (nếu có)
COPY .env .env

# Fallback: Nếu không có file .env từ máy host, tạo file .env mặc định
RUN if [ ! -f .env ]; then \
    echo "# File .env mặc định được tạo tự động trong container" > .env && \
    echo "http://160.30.160.161:3000/api=http://160.30.160.161:3000/api" >> .env; \
  fi

# Mở cổng cho ứng dụng
EXPOSE 3001

# Khởi động Next.js
CMD ["npm", "start", "--", "-p", "3001"] 