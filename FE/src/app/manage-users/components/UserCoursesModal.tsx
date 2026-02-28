import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { BookMarked } from "lucide-react";
import { API_BASE_URL } from "@/contants/api";

interface CourseData {
  _id: string;
  email: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  productId: {
    _id: string;
    name: string;
  } | null;
}

interface UserCoursesModalProps {
  isOpen: boolean;
  onClose: () => void;
  userEmail: string | null;
  userName: string;
}

export default function UserCoursesModal({
  isOpen,
  onClose,
  userEmail,
  userName,
}: UserCoursesModalProps) {
  const [courses, setCourses] = useState<CourseData[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && userEmail) {
      setCourses([]); // Clear previous state when dialog opens
      fetchCourses();
    }
  }, [isOpen, userEmail]);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE_URL}/students/email/${userEmail}/courses`);
      if (!res.ok) throw new Error("Lỗi fetch");
      const data = await res.json();
      setCourses(data.data || []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return <Badge className="bg-green-500 hover:bg-green-600">Đang học</Badge>;
      case "pending":
        return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 hover:bg-yellow-200">Chờ duyệt</Badge>;
      case "expired":
        return <Badge variant="destructive">Hết hạn</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const formatDate = (dateString: string) => {
    return new Intl.DateTimeFormat("vi-VN", {
      day: "2-digit", month: "2-digit", year: "numeric",
      hour: "2-digit", minute: "2-digit",
    }).format(new Date(dateString));
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl border-b pb-4">
            <BookMarked className="h-6 w-6 text-primary" />
            Khóa học của: <span className="text-secondary-foreground">{userName}</span>
          </DialogTitle>
        </DialogHeader>
        
        <ScrollArea className="max-h-[500px] w-full mt-4">
          <div className="pr-4">
            {loading ? (
              <div className="flex flex-col items-center justify-center p-12 space-y-4">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                <p className="text-muted-foreground text-sm">Đang tải danh sách khóa học...</p>
              </div>
            ) : courses.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground border-2 border-dashed rounded-lg bg-muted/20">
                <BookMarked className="h-10 w-10 mx-auto text-muted-foreground/30 mb-3" />
                <p>Sinh viên này chưa sở hữu hoặc đăng ký khóa học nào.</p>
              </div>
            ) : (
              <div className="grid gap-4">
                {courses.map((course) => (
                  <div key={course._id} className="border rounded-xl p-5 hover:border-primary/50 transition-colors shadow-sm bg-card relative overflow-hidden group">
                    <div className="absolute top-0 left-0 w-1 h-full bg-primary/20 group-hover:bg-primary transition-colors"></div>
                    
                    <div className="flex justify-between items-start mb-4">
                      <h4 className="font-semibold text-lg flex-1 pr-4 line-clamp-2">
                        {course.productId?.name || <span className="italic text-muted-foreground">Khóa học đã bị xóa trên hệ thống</span>}
                      </h4>
                      <div className="flex-shrink-0 ml-2 mt-1">
                        {getStatusBadge(course.status)}
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-y-3 bg-muted/40 p-4 rounded-lg text-sm border">
                        <div className="flex flex-col gap-1">
                          <span className="text-muted-foreground text-xs uppercase font-medium">Mã học viên</span>
                          <span className="font-medium font-mono text-foreground">{course._id.slice(-6).toUpperCase()}</span>
                        </div>
                        <div className="flex flex-col gap-1">
                          <span className="text-muted-foreground text-xs uppercase font-medium">Trạng thái mua hàng</span>
                          <span className="font-medium text-foreground capitalize">{course.status === 'completed' ? 'Thành công' : course.status}</span>
                        </div>
                        <div className="flex flex-col gap-1 pt-2 border-t border-border/50">
                          <span className="text-muted-foreground text-xs uppercase font-medium">Ngày cấp phát</span>
                          <span className="text-foreground flex items-center gap-1">
                             <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-calendar-days text-muted-foreground"><rect width="18" height="18" x="3" y="4" rx="2" ry="2"/><line x1="16" x2="16" y1="2" y2="6"/><line x1="8" x2="8" y1="2" y2="6"/><line x1="3" x2="21" y1="10" y2="10"/><path d="M8 14h.01"/><path d="M12 14h.01"/><path d="M16 14h.01"/><path d="M8 18h.01"/><path d="M12 18h.01"/><path d="M16 18h.01"/></svg>
                             {formatDate(course.createdAt)}
                          </span>
                        </div>
                        <div className="flex flex-col gap-1 pt-2 border-t border-border/50">
                          <span className="text-muted-foreground text-xs uppercase font-medium">Cập nhật lần cuối</span>
                          <span className="text-foreground flex items-center gap-1">
                             <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-history text-muted-foreground"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/><path d="M12 7v5l4 2"/></svg>
                             {formatDate(course.updatedAt)}
                          </span>
                        </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
