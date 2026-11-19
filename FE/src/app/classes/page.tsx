"use client";

import { useEffect, useState } from "react";
import { Plus, Search, Calendar, CalendarCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { API_ENDPOINTS } from "@/contants/api";
import { fetchApi } from "@/lib/api";
import AddClassModal from "@/components/classes/AddClassModal";
import ExamScheduleModal from "@/components/classes/ExamScheduleModal";
import Link from "next/link";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import { Badge } from "@/components/ui/badge";

interface ClassItem {
  _id: string;
  name: string;
  lastTimetableUpdate?: string; // Date string
}

export default function ClassesPage() {
  const [classes, setClasses] = useState<ClassItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isExamScheduleOpen, setIsExamScheduleOpen] = useState(false);
  const [upcomingExamsCount, setUpcomingExamsCount] = useState(0);
  const [totalTimetables, setTotalTimetables] = useState<number | null>(null);

  const fetchTotalTimetables = async () => {
    try {
      const res = await fetchApi(`${API_ENDPOINTS.CLASSES}/timetable/count`);
      const data = await res.json();
      if (data.data !== undefined) {
        setTotalTimetables(data.data);
      }
    } catch (error) {
      console.error("Failed to fetch total timetables count", error);
    }
  };

  const fetchUpcomingExamsCount = async () => {
    try {
      const res = await fetchApi(`${API_ENDPOINTS.CLASSES}/exam-schedules`);
      const data = await res.json();
      if (data.data) {
        const now = new Date();
        now.setHours(0, 0, 0, 0);
        const count = data.data.filter((item: { ngay_hoc: string }) => new Date(item.ngay_hoc) >= now).length;
        setUpcomingExamsCount(count);
      }
    } catch (error) {
      console.error("Failed to fetch exam schedules count", error);
    }
  };

  const fetchClasses = async () => {
    try {
      setLoading(true);
      const res = await fetchApi(`${API_ENDPOINTS.CLASSES}`);
      const data = await res.json();
      if (data.data) {
        setClasses(data.data);
      }
    } catch (error) {
      console.error("Failed to fetch classes", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClasses();
    fetchUpcomingExamsCount();
    fetchTotalTimetables();
  }, []);

  const filteredClasses = classes.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight">Quản lý lớp học</h1>
          <p className="text-xs sm:text-sm text-muted-foreground flex flex-wrap items-center gap-2 mt-1">
            Danh sách các lớp và thời khóa biểu.
            {totalTimetables !== null ? (
              <Badge variant="secondary" className="font-normal text-xs px-2 py-0.5">
                Tổng: {totalTimetables.toLocaleString()} bản ghi thời khóa biểu
              </Badge>
            ) : (
              <span className="h-5 w-32 bg-muted animate-pulse rounded-full inline-block"></span>
            )}
          </p>
        </div>
        <div className="grid grid-cols-2 sm:flex items-center gap-2">
          <Button
            variant="outline"
            onClick={() => setIsExamScheduleOpen(true)}
            className="border-primary/20 hover:bg-primary/5 text-primary relative text-xs sm:text-sm px-2.5 sm:px-4"
          >
            <CalendarCheck className="mr-1.5 sm:mr-2 h-4 w-4 shrink-0" />
            <span className="truncate">Lịch thi tổng hợp</span>
            {upcomingExamsCount > 0 && (
              <Badge variant="destructive" className="absolute -top-2 -right-2 px-1.5 min-w-5 h-5 flex items-center justify-center text-[10px]">
                {upcomingExamsCount}
              </Badge>
            )}
          </Button>
          <Button
            onClick={() => setIsAddModalOpen(true)}
            className="text-xs sm:text-sm px-2.5 sm:px-4"
          >
            <Plus className="mr-1.5 sm:mr-2 h-4 w-4 shrink-0" />
            <span className="truncate">Thêm lớp</span>
          </Button>
        </div>
      </div>

      <div className="flex items-center space-x-2">
        <div className="relative flex-1 sm:max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Tìm kiếm lớp..."
            className="pl-8"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-28 sm:h-32 rounded-lg bg-gray-100 animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-4">
          {filteredClasses.length === 0 ? (
             <div className="col-span-full text-center py-10 text-muted-foreground">
                Chưa có lớp nào. Hãy thêm mới.
             </div>
          ) : (
            filteredClasses.map((cls) => (
              <Link href={`/classes/${encodeURIComponent(cls.name)}`} key={cls._id}>
                <Card className="hover:bg-accent/50 transition-colors cursor-pointer h-full">
                  <CardHeader className="p-3.5 sm:p-6 pb-1.5 sm:pb-2">
                    <CardTitle className="text-base sm:text-lg truncate" title={cls.name}>
                      {cls.name}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-3.5 sm:p-6 pt-0 sm:pt-0">
                    <div className="flex flex-col gap-1.5 sm:gap-2">
                      <div className="flex items-center text-xs sm:text-sm text-muted-foreground">
                        <Calendar className="mr-1.5 sm:mr-2 h-3.5 w-3.5 sm:h-4 sm:w-4 shrink-0" />
                        <span>Xem lịch học</span>
                      </div>
                       {cls.lastTimetableUpdate && (
                        <div className="text-[11px] sm:text-xs text-green-600 bg-green-50 px-2 py-1 rounded inline-block truncate">
                          Cập nhật: {format(new Date(cls.lastTimetableUpdate), "dd/MM HH:mm", { locale: vi })}
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))
          )}
        </div>
      )}

      <AddClassModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSuccess={fetchClasses}
      />

      <ExamScheduleModal
        isOpen={isExamScheduleOpen}
        onClose={() => setIsExamScheduleOpen(false)}
      />
    </div>
  );
}
