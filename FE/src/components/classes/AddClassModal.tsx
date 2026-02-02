import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea"; // Assuming you have this or use stock input
import { Label } from "@/components/ui/label";
import { API_BASE_URL, API_ENDPOINTS } from "@/contants/api";
import { useToast } from "@/hooks/use-toast"; // Adjust path if needed

interface AddClassModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function AddClassModal({ isOpen, onClose, onSuccess }: AddClassModalProps) {
  const [inputStr, setInputStr] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleSave = async () => {
    try {
      setLoading(true);
      let classes: string[] = [];

      try {
        // Try parsing as JSON first
        classes = JSON.parse(inputStr);
      } catch (e) {
        // If not JSON, assume comma-separated or newline-separated
        classes = inputStr.split(/[\n,]+/).map((s) => s.trim()).filter(Boolean);
      }

      if (!Array.isArray(classes) || classes.length === 0) {
        toast({
            variant: "destructive",
            title: "Lỗi",
            description: "Vui lòng nhập danh sách lớp đúng định dạng.",
          });
        return;
      }

      const res = await fetch(`${API_BASE_URL}${API_ENDPOINTS.CLASSES}/bulk`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ classes }),
      });

      if (!res.ok) throw new Error("Failed to add classes");

      toast({
        title: "Thành công",
        description: `Đã thêm ${classes.length} lớp.`,
      });
      onSuccess();
      onClose();
      setInputStr("");
    } catch (error) {
      console.error(error);
      toast({
        variant: "destructive",
        title: "Lỗi",
        description: "Có lỗi xảy ra khi thêm lớp.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Thêm lớp học</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>Danh sách lớp (JSON mảng tên hoặc mỗi dòng 1 tên)</Label>
            <Textarea
              placeholder='["Lớp A", "Lớp B"] hoặc
Lớp A
Lớp B'
              value={inputStr}
              onChange={(e) => setInputStr(e.target.value)}
              rows={10}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={loading}>
            Hủy
          </Button>
          <Button onClick={handleSave} disabled={loading}>
            {loading ? "Đang xử lý..." : "Lưu"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
