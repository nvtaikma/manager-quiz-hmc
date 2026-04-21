# Phase 03: Frontend — Activity Modal UI (Admin Panel)
Status: ⬜ Pending
Dependencies: Phase 01, Phase 02

## Objective
Tạo `UserActivityModal` component trên trang Quản lý người dùng (Admin).
Khi Admin click nút "Xem hoạt động" trên user row → mở modal hiển thị:
1. **Bar Chart** — Số lần hoạt động/ngày trong 7 ngày qua
2. **Timeline** — Danh sách chi tiết thời gian hoạt động khi chọn 1 ngày

## UI Design

```
┌──────────────────────────────────────────────────┐
│ 📊 Lịch sử hoạt động — Nguyễn Văn A              │
├──────────────────────────────────────────────────┤
│                                                   │
│  ██                                               │
│  ██  ██                    ██                     │
│  ██  ██  ██           ██  ██  ██                 │
│  ██  ██  ██  ██  ██  ██  ██  ██                 │
│  15  16  17  18  19  20  21 (tháng 4)            │
│                                                   │
│  👆 Click vào cột để xem chi tiết                 │
├──────────────────────────────────────────────────┤
│ 📅 Ngày 21/04/2026 — 12 lần hoạt động            │
│                                                   │
│  08:02  •──                                       │
│  08:05  •──                                       │
│  08:08  •──                                       │
│  08:35  •──                                       │
│  09:02  •──                                       │
│  ...                                              │
└──────────────────────────────────────────────────┘
```

## Implementation Steps

### Step 1: Cài Recharts (nếu chưa có)

```bash
cd FE && npm install recharts
```

### Step 2: Tạo component `UserActivityModal`

**File:** `FE/src/app/manage-users/components/UserActivityModal.tsx`

```typescript
// Component chính:
// - Props: isOpen, onClose, userId, userName
// - Fetch GET /api/customers/:id/activities?days=7
// - Hiển thị BarChart (Recharts) + Timeline (ScrollArea)
// - Click vào bar → hiển thị chi tiết ngày đó

// UI Components sử dụng:
// - Dialog (shadcn) — modal container
// - ScrollArea (shadcn) — scroll timeline
// - Badge (shadcn) — hiển thị số lượng
// - BarChart, Bar, XAxis, YAxis, Tooltip (Recharts)
```

### Step 3: Tích hợp vào UserTable

**Sửa file:** `FE/src/app/manage-users/components/UserTable.tsx`

```diff
+ import UserActivityModal from "./UserActivityModal";
+ import { Activity } from "lucide-react";

  // Thêm state:
+ const [showActivityModal, setShowActivityModal] = useState(false);
+ const [selectedUserForActivity, setSelectedUserForActivity] = useState<User | null>(null);

  // Thêm nút trong action column:
+ <Button
+   variant="outline"
+   size="icon"
+   onClick={() => {
+     setSelectedUserForActivity(user);
+     setShowActivityModal(true);
+   }}
+   title="Xem lịch sử hoạt động"
+ >
+   <Activity className="h-4 w-4" />
+ </Button>

  // Thêm modal cuối component:
+ <UserActivityModal
+   isOpen={showActivityModal}
+   onClose={() => setShowActivityModal(false)}
+   userId={selectedUserForActivity?._id || null}
+   userName={selectedUserForActivity?.name || ""}
+ />
```

### Step 4: Xử lý dữ liệu cho chart

```typescript
// Transform API response → chart data:
// Input:  [{ date: "2026-04-21T17:00:00Z", activities: [Date, Date, ...] }]
// Output: [{ day: "21/04", count: 12, date: "2026-04-21" }]

const chartData = activities.map(item => ({
  day: format(new Date(item.date), "dd/MM"),
  count: item.activities.length,
  fullDate: item.date,
  activities: item.activities,
}));
```

## Files to Create/Modify
- `FE/package.json` — **Sửa** — Thêm `recharts`
- `FE/src/app/manage-users/components/UserActivityModal.tsx` — **Mới**
- `FE/src/app/manage-users/components/UserTable.tsx` — **Sửa** — Thêm nút + modal

## Test Criteria
- [ ] Click nút Activity trên user row → mở modal
- [ ] Bar Chart hiển thị đúng 7 ngày gần nhất
- [ ] Click vào 1 cột → timeline hiển thị chi tiết giờ:phút
- [ ] User không có activity → hiển thị "Không có dữ liệu"
- [ ] Responsive trên mobile

---
🎉 Feature Complete sau phase này!
