import { useEffect, useState } from "react";
import { format, isPast, isToday, startOfDay } from "date-fns";
import { vi } from "date-fns/locale";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { API_BASE_URL, API_ENDPOINTS } from "@/contants/api";
import { CalendarClock, MapPin, User, Clock, AlertCircle } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface ExamScheduleModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface ExamItem {
  _id: string;
  buoi: string;
  ngay_hoc: string;
  giang_duong: string;
  dia_diem: string;
  ten_lop: string;
  mon_hoc: string;
  loai_gio: string;
  giang_vien: string;
  gio_thi: string;
  ghi_chu: string;
}

// Helper to group by date
const groupByDate = (items: ExamItem[]) => {
  return items.reduce((groups, item) => {
    // Extract date part only for grouping key
    const dateKey = startOfDay(new Date(item.ngay_hoc)).toISOString();
    if (!groups[dateKey]) {
      groups[dateKey] = [];
    }
    groups[dateKey].push(item);
    return groups;
  }, {} as Record<string, ExamItem[]>);
};

export default function ExamScheduleModal({ isOpen, onClose }: ExamScheduleModalProps) {
  const [data, setData] = useState<ExamItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      fetchSchedules();
    } else {
      // Clear state when closed if needed
    }
  }, [isOpen]);

  const fetchSchedules = async () => {
    try {
      setLoading(true);
      setError(null);
      // Construct endpoint URL. Assuming backend routes to /api/classes/exam-schedules
      const res = await fetch(`${API_BASE_URL}${API_ENDPOINTS.CLASSES}/exam-schedules`);
      if (!res.ok) {
        throw new Error(`Failed to fetch: ${res.statusText}`);
      }
      const result = await res.json();
      if (result.data) {
        setData(result.data);
      }
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Đã có lỗi xảy ra khi tải lịch thi.");
      }
    } finally {
      setLoading(false);
    }
  };

  const groupedData = groupByDate(data);
  const sortedDates = Object.keys(groupedData).sort((a, b) => new Date(a).getTime() - new Date(b).getTime());

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl h-[85vh] flex flex-col p-0">
        <DialogHeader className="p-6 pb-2">
          <DialogTitle className="text-2xl flex items-center gap-2">
            <CalendarClock className="h-6 w-6 text-primary" />
            Lịch Thi Tổng Hợp
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-hidden">
          {loading ? (
            <div className="p-6 space-y-4">
              <Skeleton className="h-10 w-48 mb-4" />
              {[1, 2, 3].map((i) => (
                <div key={i} className="space-y-3">
                  <Skeleton className="h-8 w-32" />
                  <Skeleton className="h-24 w-full" />
                </div>
              ))}
            </div>
          ) : error ? (
            <div className="p-6">
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            </div>
          ) : data.length === 0 ? (
            <div className="p-6 text-center text-muted-foreground flex flex-col items-center justify-center h-full">
              <CalendarClock className="h-16 w-16 mb-4 text-gray-300" />
              <p>Hiện không có lịch thi nào được xếp.</p>
            </div>
          ) : (
            <ScrollArea className="h-full p-6 pt-0">
              <div className="space-y-8 pr-4">
                {sortedDates.map((dateStr) => {
                  const dateObj = new Date(dateStr);
                  // Consider "past" if the day is strictly before today (ignoring hours)
                  const isPastDate = isPast(dateObj) && !isToday(dateObj);
                  const isTodayDate = isToday(dateObj);

                  return (
                    <div key={dateStr} className={`relative ${isPastDate ? 'opacity-60' : ''}`}>
                      {/* Date Header sticky */}
                      <div className="sticky top-0 bg-background/95 backdrop-blur z-10 py-3 mb-2 flex items-center gap-3">
                        <h3 className={`text-xl font-bold ${isPastDate ? 'text-gray-500' : isTodayDate ? 'text-blue-600' : 'text-primary'}`}>
                          {format(dateObj, "EEEE, dd/MM/yyyy", { locale: vi })}
                        </h3>
                        {isTodayDate && <Badge className="bg-blue-600 hover:bg-blue-700">Hôm nay</Badge>}
                        {isPastDate && <Badge variant="outline" className="text-gray-500 border-gray-300">Đã qua</Badge>}
                      </div>

                      <div className="grid gap-4 md:grid-cols-2">
                        {groupedData[dateStr].map((item) => (
                          <div 
                            key={item._id} 
                            className={`p-4 rounded-xl border-l-4 shadow-sm border ${
                              isPastDate 
                                ? 'bg-gray-50/50 border-gray-200 border-l-gray-400' 
                                : 'bg-white border-gray-100 hover:shadow-md transition-shadow border-l-primary'
                            }`}
                          >
                            <div className="flex justify-between items-start mb-2">
                              <div>
                                <h4 className="font-bold text-lg">{item.mon_hoc || "Chưa cập nhật môn"}</h4>
                                <div className="text-sm font-medium text-blue-600">
                                  Lớp: {item.ten_lop}
                                </div>
                              </div>
                              <Badge variant={isPastDate ? "secondary" : "default"} className="font-mono text-base px-2 py-1">
                                <Clock className="w-3 h-3 mr-1 inline" />
                                {item.gio_thi || item.buoi}
                              </Badge>
                            </div>

                            <div className="space-y-2 mt-4 text-sm text-gray-600">
                              <div className="flex items-center gap-2">
                                <MapPin className="h-4 w-4 text-gray-400 shrink-0" />
                                <span className="truncate" title={`${item.dia_diem} - ${item.giang_duong}`}>
                                  {item.giang_duong ? `${item.dia_diem} - ${item.giang_duong}` : item.dia_diem || "Chưa có địa điểm"}
                                </span>
                              </div>
                              <div className="flex items-center gap-2">
                                <User className="h-4 w-4 text-gray-400 shrink-0" />
                                <span>{item.giang_vien || "Chưa có giảng viên"}</span>
                              </div>
                              {item.ghi_chu && (
                                <div className="mt-2 p-2 bg-yellow-50 text-yellow-800 rounded text-xs border border-yellow-100">
                                  <strong>Ghi chú:</strong> {item.ghi_chu}
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </ScrollArea>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
