# Phase 02: Frontend — Heartbeat Integration
Status: ⬜ Pending
Dependencies: Phase 01

## Objective
Tích hợp gọi API heartbeat vào luồng client hiện có. Mỗi khi client gửi heartbeat 
(set `online:user:{userId}` vào Redis), đồng thời gọi thêm `POST /api/customers/:id/heartbeat` 
để ghi log vào MongoDB.

## Phân tích luồng hiện tại

Cần tìm nơi client đang set Redis key `online:user:{userId}` — có 2 khả năng:
1. **Nếu FE gọi trực tiếp Redis** (qua WebSocket/API) → thêm fetch call song song
2. **Nếu qua API proxy** → thêm logic vào endpoint đó

> ⚠️ Cần xác minh chính xác tại thời điểm code. Nếu không tìm thấy heartbeat trên FE,
> tạo mới hook `useHeartbeat` gọi cả 2: Redis status + MongoDB log.

## Implementation Steps

### Step 1: Tạo hook `useHeartbeat`

**File:** `FE/src/hooks/useHeartbeat.ts`

```typescript
import { useEffect, useRef } from "react";
import { API_BASE_URL } from "@/contants/api";

/**
 * Hook gửi heartbeat mỗi 3 phút.
 * - Gọi POST /api/customers/:id/heartbeat để ghi log MongoDB
 * - userId: ID của user đang đăng nhập (từ auth context)
 */
export function useHeartbeat(userId: string | null) {
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!userId) return;

    const sendHeartbeat = async () => {
      try {
        await fetch(`${API_BASE_URL}/customers/${userId}/heartbeat`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
        });
      } catch {
        // Silent fail — không ảnh hưởng UX
      }
    };

    // Gửi ngay lập tức khi mount
    sendHeartbeat();

    // Gửi lại mỗi 3 phút
    intervalRef.current = setInterval(sendHeartbeat, 3 * 60 * 1000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [userId]);
}
```

### Step 2: Gắn hook vào Layout hoặc Auth Provider

Tìm component gốc nơi user đã được xác thực, thêm:

```typescript
import { useHeartbeat } from "@/hooks/useHeartbeat";

// Trong component...
const userId = /* lấy từ auth context hoặc session */;
useHeartbeat(userId);
```

## Files to Create/Modify
- `FE/src/hooks/useHeartbeat.ts` — **Mới** — Hook gửi heartbeat
- `FE/src/app/layout.tsx` hoặc auth provider — **Sửa** — Gắn hook

## Test Criteria
- [ ] Đăng nhập → Network tab thấy POST heartbeat ngay lập tức
- [ ] Chờ 3 phút → thấy request heartbeat tiếp theo
- [ ] MongoDB: `db.useractivities.find()` có dữ liệu mới
- [ ] Đăng xuất hoặc đóng tab → interval bị clear, không gọi nữa

---
Next Phase: [phase-03-frontend-activity-modal.md](./phase-03-frontend-activity-modal.md)
