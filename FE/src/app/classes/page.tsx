"use client";

import { useEffect, useState } from "react";
import { Plus, Search, Calendar, CalendarCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { API_BASE_URL, API_ENDPOINTS } from "@/contants/api";
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

  const fetchUpcomingExamsCount = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}${API_ENDPOINTS.CLASSES}/exam-schedules`);
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
      const res = await fetch(`${API_BASE_URL}${API_ENDPOINTS.CLASSES}`);
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
  }, []);

  const filteredClasses = classes.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Quản lý lớp học</h1>
          <p className="text-muted-foreground">Danh sách các lớp và thời khóa biểu.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => setIsExamScheduleOpen(true)} className="border-primary/20 hover:bg-primary/5 text-primary relative">
            <CalendarCheck className="mr-2 h-4 w-4" /> Lịch thi tổng hợp
            {upcomingExamsCount > 0 && (
              <Badge variant="destructive" className="absolute -top-2 -right-2 px-1.5 min-w-5 h-5 flex items-center justify-center text-[10px]">
                {upcomingExamsCount}
              </Badge>
            )}
          </Button>
          <Button onClick={() => setIsAddModalOpen(true)}>
            <Plus className="mr-2 h-4 w-4" /> Thêm lớp
          </Button>
        </div>
      </div>

      <div className="flex items-center space-x-2">
        <div className="relative flex-1 max-w-sm">
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
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-32 rounded-lg bg-gray-100 animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {filteredClasses.length === 0 ? (
             <div className="col-span-full text-center py-10 text-muted-foreground">
                Chưa có lớp nào. Hãy thêm mới.
             </div>
          ) : (
            filteredClasses.map((cls) => (
              <Link href={`/classes/${encodeURIComponent(cls.name)}`} key={cls._id}>
                <Card className="hover:bg-accent/50 transition-colors cursor-pointer h-full">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">{cls.name}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-col gap-2">
                      <div className="flex items-center text-sm text-muted-foreground">
                        <Calendar className="mr-2 h-4 w-4" />
                        Xem lịch học
                      </div>
                       {cls.lastTimetableUpdate && (
                        <div className="text-xs text-green-600 bg-green-50 px-2 py-1 rounded inline-block">
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
