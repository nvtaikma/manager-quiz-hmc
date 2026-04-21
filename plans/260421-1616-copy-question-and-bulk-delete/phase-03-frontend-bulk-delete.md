# Phase 03: Frontend — Bulk Delete tại ExamQuestions
Status: ⬜ Pending
Dependencies: Phase 01 (Backend API bulk delete endpoint)

## Objective
Cho phép người dùng chọn nhiều câu hỏi và xóa cùng lúc tại trang `/exam-questions/[examId]`.  
Component target: `QuestionManager.tsx`.

## Requirements

### Functional
- [ ] Thêm cột checkbox đầu tiên trong bảng
- [ ] Checkbox "Chọn tất cả" ở `<TableHead>` — toggle chọn/bỏ tất cả *câu hỏi hiển thị hiện tại* (`questions` đã filter)
- [ ] Nút "Xóa X câu hỏi đã chọn" — chỉ hiển thị khi `selectedIds.size > 0`
- [ ] Confirm modal (`AlertDialog`) với số lượng câu hỏi sẽ bị xóa trước khi thực hiện
- [ ] Sau khi xóa thành công: clear selection + refresh danh sách + toast
- [ ] Trạng thái checkbox đồng bộ khi search filter thay đổi (không giữ các ID bị ẩn trong selection)

### Non-Functional
- [ ] Dùng `Set<string>` cho `selectedIds` — hiệu năng tốt hơn array khi toggle
- [ ] Nút xóa hàng loạt có màu `variant="destructive"` với icon `Trash2`
- [ ] Không xung đột với nút xóa đơn lẻ đã có

## State Management

```tsx
// Thêm vào component QuestionManager
const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
const [showBulkDeleteDialog, setShowBulkDeleteDialog] = useState(false);
const [bulkDeleteLoading, setBulkDeleteLoading] = useState(false);

// Helper
const isAllSelected = questions.length > 0 && questions.every(q => selectedIds.has(q._id));
const isIndeterminate = questions.some(q => selectedIds.has(q._id)) && !isAllSelected;

const toggleSelectAll = () => {
  if (isAllSelected) {
    setSelectedIds(new Set());
  } else {
    setSelectedIds(new Set(questions.map(q => q._id)));
  }
};

const toggleSelect = (id: string) => {
  setSelectedIds(prev => {
    const next = new Set(prev);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    return next;
  });
};

// Xóa selection khi filter thay đổi (tránh giữ ID ẩn)
useEffect(() => {
  setSelectedIds(new Set());
}, [debouncedSearchTerm]);
```

## API Call — bulkDelete

```tsx
const handleBulkDelete = async () => {
  try {
    setBulkDeleteLoading(true);
    const response = await fetch(`${API_BASE_URL}/questions/bulk`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ questionIds: Array.from(selectedIds) }),
    });
    if (!response.ok) throw new Error("Không thể xóa câu hỏi");
    const data = await response.json();
    await fetchQuestions();
    setSelectedIds(new Set());
    setShowBulkDeleteDialog(false);
    toast({
      title: "Thành công",
      description: `Đã xóa ${data.data.deletedCount} câu hỏi.`,
    });
  } catch (error) {
    toast({
      title: "Lỗi",
      description: "Không thể xóa câu hỏi. Vui lòng thử lại.",
      variant: "destructive",
    });
  } finally {
    setBulkDeleteLoading(false);
  }
};
```

## UI Changes

### 1. Nút "Xóa đã chọn" — thêm vào header Card (cạnh ô search)

```tsx
{selectedIds.size > 0 && (
  <Button
    variant="destructive"
    size="sm"
    onClick={() => setShowBulkDeleteDialog(true)}
  >
    <Trash2 className="mr-2 h-4 w-4" />
    Xóa {selectedIds.size} câu hỏi
  </Button>
)}
```

### 2. Cột Checkbox trong `<TableHeader>`

```tsx
<TableHead className="w-10">
  <input
    type="checkbox"
    className="rounded border-gray-300"
    checked={isAllSelected}
    ref={el => { if (el) el.indeterminate = isIndeterminate; }}
    onChange={toggleSelectAll}
  />
</TableHead>
```

### 3. Checkbox trong mỗi `<TableRow>`

```tsx
<TableCell className="w-10">
  <input
    type="checkbox"
    className="rounded border-gray-300"
    checked={selectedIds.has(question._id)}
    onChange={() => toggleSelect(question._id)}
  />
</TableCell>
```

### 4. Confirm Modal (AlertDialog)

```tsx
<AlertDialog open={showBulkDeleteDialog} onOpenChange={setShowBulkDeleteDialog}>
  <AlertDialogContent>
    <AlertDialogHeader>
      <AlertDialogTitle>Xác nhận xóa câu hỏi</AlertDialogTitle>
      <AlertDialogDescription>
        Bạn có chắc chắn muốn xóa <strong>{selectedIds.size} câu hỏi</strong> đã chọn không?
        Hành động này <strong>không thể hoàn tác</strong>.
      </AlertDialogDescription>
    </AlertDialogHeader>
    <AlertDialogFooter>
      <AlertDialogCancel disabled={bulkDeleteLoading}>Hủy</AlertDialogCancel>
      <AlertDialogAction
        onClick={handleBulkDelete}
        disabled={bulkDeleteLoading}
        className="bg-destructive hover:bg-destructive/90"
      >
        {bulkDeleteLoading ? "Đang xóa..." : `Xóa ${selectedIds.size} câu hỏi`}
      </AlertDialogAction>
    </AlertDialogFooter>
  </AlertDialogContent>
</AlertDialog>
```

## Files to Modify
- `FE/src/app/exam-questions/[examId]/components/QuestionManager.tsx`
  - Thêm states: `selectedIds`, `showBulkDeleteDialog`, `bulkDeleteLoading`
  - Thêm helpers: `isAllSelected`, `isIndeterminate`, `toggleSelectAll`, `toggleSelect`
  - Thêm hàm `handleBulkDelete`
  - Thêm `useEffect` để clear selection khi search thay đổi
  - Sửa `<TableHeader>`: thêm cột checkbox
  - Sửa mỗi `<TableRow>`: thêm cell checkbox
  - Thêm nút "Xóa đã chọn" vào header
  - Thêm `AlertDialog` confirm modal

## Test Criteria
- [ ] Checkbox "Chọn tất cả" → chọn/bỏ chọn tất cả câu hỏi đang hiện
- [ ] Checkbox trạng thái "indeterminate" khi chọn một phần
- [ ] Nút "Xóa X câu hỏi" chỉ hiện khi có ít nhất 1 item được chọn
- [ ] Confirm modal hiển thị đúng số lượng
- [ ] Sau xóa: danh sách refresh, selection cleared, toast thành công
- [ ] Khi search thay đổi: selection bị reset

---
Previous Phase: phase-02-frontend-copy.md
