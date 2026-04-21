# Plan: User Activity Logs — Theo dõi lịch sử hoạt động người dùng
Created: 2026-04-21 17:09
Status: 🟡 In Progress

## Overview
Ghi lại thời điểm người dùng hoạt động vào MongoDB, gom nhóm theo ngày (GMT+7).
Tự động xóa dữ liệu cũ hơn 7 ngày qua TTL index.
Hiển thị biểu đồ hoạt động + timeline chi tiết trên trang Quản lý người dùng.

## Tech Stack
- Backend: Express + TypeScript + Mongoose + ioredis + node-cron
- Frontend: Next.js + shadcn/ui + Recharts (bar chart)
- Database: MongoDB (TTL index 7 ngày)
- Cache: Redis (đọc `online:user:{userId}` do hệ thống MedExam push)

## Phân tích kiến trúc

### Ràng buộc quan trọng
- **Client (MedExam)** là hệ thống độc lập — chỉ push `SET online:user:{userId} EX 180` vào Redis
- Manager BE **không kiểm soát** được client → không thể gắn heartbeat API vào FE
- Manager BE **có quyền đọc** Redis → có thể quét `online:user:*`

### Giải pháp: Cron Job quét Redis

```
[Cron Job trên Manager BE — mỗi 2 phút]
         │
         ├── redis.keys("online:user:*")
         │        → ["online:user:abc", "online:user:def"]
         │
         └── forEach userId:
                  → findOneAndUpdate(upsert + $push activities)
                  → MongoDB lưu timestamp

[TTL Index MongoDB]
         → Tự xóa document sau 7 ngày (không cần cron dọn dẹp)

[Admin xem]
         → GET /api/customers/:id/activities
         → Đọc từ MongoDB (dữ liệu luôn có sẵn)
```

### Tại sao không dùng Redis Keyspace Notifications?
- Cần bật `notify-keyspace-events` trên Redis server (rủi ro production)
- Phức tạp hơn, khó debug
- Cron job 2 phút đủ chính xác cho bài toán tracking hoạt động (sai số ≤2 phút)

### Độ chính xác
- TTL Redis key: 3 phút
- Cron interval: 2 phút
- Xác suất bắt được user online: **~99%** (key còn sống ≥ 1 phút sau cron cuối)

## Phases

| Phase | Name | Status | Progress |
|-------|------|--------|----------|
| 01 | Backend: Model + Cron Job + API | ✅ Complete | 100% |
| 02 | Frontend: Activity Modal UI | ✅ Complete | 100% |

## Quick Commands
- Code phase 01: `/code phase-01`
- Code phase 02: `/code phase-02`

