import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { API_BASE_URL, API_ENDPOINTS } from "@/contants/api";
import { useToast } from "@/hooks/use-toast";

interface ImportTimetableModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  classNameStr?: string; // Optional context if we want to confirm
}

export default function ImportTimetableModal({ isOpen, onClose, onSuccess, classNameStr }: ImportTimetableModalProps) {
  const [jsonStr, setJsonStr] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleImport = async () => {
    try {
      setLoading(true);
      const data = JSON.parse(jsonStr);

      if (!Array.isArray(data)) {
        throw new Error("Dữ liệu phải là mảng JSON.");
      }
      
      // Basic validation
      if (data.length > 0 && !data[0].ten_lop) {
         throw new Error("Dữ liệu thiếu trường 'ten_lop'.");
      }

      // Check if data matches current class context
      if (classNameStr) {
        const mismatch = data.some((item: any) => item.ten_lop?.trim() !== classNameStr.trim());
        if (mismatch) {
           throw new Error(`Dữ liệu JSON chứa lớp không khớp với lớp hiện tại (${classNameStr}). Vui lòng kiểm tra lại.`);
        }
      }

      const endpoint = classNameStr 
  ? `${API_BASE_URL}${API_ENDPOINTS.CLASSES}/${encodeURIComponent(classNameStr)}/timetable/import`
  : `${API_BASE_URL}${API_ENDPOINTS.CLASSES}/timetable/import`;

      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
          const errData = await res.json();
          throw new Error(errData.message || "Failed to import");
      }

      toast({
        title: "Thành công",
        description: "Đã nhập thời khóa biểu mới.",
      });
      onSuccess();
      onClose();
      setJsonStr("");
    } catch (error: any) {
      console.error(error);
      toast({
        variant: "destructive",
        title: "Lỗi",
        description: error.message || "Lỗi định dạng JSON hoặc server error.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Nhập thời khóa biểu (JSON)</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
            <p className="text-sm text-gray-500">
                Lưu ý: Hành động này sẽ <b>XÓA</b> toàn bộ lịch cũ của các lớp có trong JSON này và thay thế bằng dữ liệu mới.
            </p>
          <div className="space-y-2">
            <Label>Nội dung JSON</Label>
            <Textarea
              placeholder='[{"ten_lop": "...", "ngay_hoc": "...", ...}]'
              value={jsonStr}
              onChange={(e) => setJsonStr(e.target.value)}
              rows={15}
              className="font-mono text-xs"
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={loading}>
            Hủy
          </Button>
          <Button onClick={handleImport} disabled={loading}>
            {loading ? "Đang xử lý..." : "Nhập dữ liệu"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
