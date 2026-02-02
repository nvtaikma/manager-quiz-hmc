"use client";

import { useEffect, useState, use } from "react";
import { ArrowLeft, Upload, Calendar as CalendarIcon, MapPin, User, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { API_BASE_URL, API_ENDPOINTS } from "@/contants/api";
import ImportTimetableModal from "@/components/classes/ImportTimetableModal";
import Link from "next/link";
import { format } from "date-fns";
import { vi } from "date-fns/locale";

interface TimetableItem {
  _id: string;
  buoi: string;
  ngay_hoc: string; // ISO date string
  giang_duong: string;
  dia_diem: string;
  doi_tuong: string;
  ten_lop: string;
  mon_hoc: string;
  loai_gio: string;
  so_tiet: string;
  giang_vien: string;
  sdt_gv: string;
  noi_dung: string;
  gio_thi: string;
  ghi_chu: string;
}

export default function ClassDetailPage({ params }: { params: Promise<{ id: string }> }) {
  // Unwrapping params Promise (Next.js 15+ requirement or safe practice)
  const resolvedParams = use(params);
  const className = decodeURIComponent(resolvedParams.id);
  
  const [timetable, setTimetable] = useState<TimetableItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);

  const fetchTimetable = async () => {
    try {
      setLoading(true);
      const res = await fetch(
        `${API_BASE_URL}${API_ENDPOINTS.CLASSES}/${encodeURIComponent(className)}/timetable`
      );
      const data = await res.json();
      if (data.data) {
        setTimetable(data.data);
      }
    } catch (error) {
      console.error("Failed to fetch timetable", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTimetable();
  }, [className]);

  // Group by date or just list? Let's list chronologically.
  // Assuming BE sorts by date.

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/classes">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{className}</h1>
          <p className="text-muted-foreground">Chi tiết thời khóa biểu</p>
        </div>
        <div className="ml-auto">
          <Button onClick={() => setIsImportModalOpen(true)}>
            <Upload className="mr-2 h-4 w-4" /> Import TimeTable
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="space-y-4">
           {[1,2,3].map(i => <div key={i} className="h-24 bg-gray-100 rounded animate-pulse" />)}
        </div>
      ) : (
        <div className="grid gap-6">
          {timetable.length === 0 ? (
            <div className="text-center py-10 border rounded-lg bg-gray-50 text-muted-foreground">
              Chưa có lịch học nào.
            </div>
          ) : (
            timetable.map((item) => (
              <Card key={item._id} className="overflow-hidden">
                <div className="flex flex-col md:flex-row border-l-4 border-primary">
                  {/* Left: Date/Time */}
                  <div className="p-4 md:w-48 bg-gray-50 flex flex-col justify-center items-center text-center border-b md:border-b-0 md:border-r">
                    <span className="text-sm font-medium text-muted-foreground">
                      {item.buoi}
                    </span>
                    <span className="text-2xl font-bold text-primary">
                      {format(new Date(item.ngay_hoc), "dd/MM", { locale: vi })}
                    </span>
                    <span className="text-sm text-gray-500">
                      {format(new Date(item.ngay_hoc), "yyyy", { locale: vi })}
                    </span>
                     {item.gio_thi && (
                        <Badge variant="destructive" className="mt-2">Thi: {item.gio_thi}</Badge>
                     )}
                  </div>

                  {/* Right: Details */}
                  <div className="flex-1 p-4 space-y-3">
                    <div className="flex flex-wrap justify-between items-start gap-2">
                      <h3 className="font-semibold text-lg">{item.mon_hoc || "Chưa có môn"}</h3>
                      <Badge variant="outline">{item.loai_gio}</Badge>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-gray-600">
                      <div className="flex items-center gap-2">
                         <MapPin className="h-4 w-4 text-gray-400" />
                         <span>{item.dia_diem} - {item.giang_duong}</span>
                      </div>
                      <div className="flex items-center gap-2">
                         <User className="h-4 w-4 text-gray-400" />
                         <span>{item.giang_vien} {item.sdt_gv ? `(${item.sdt_gv})` : ""}</span>
                      </div>
                      <div className="flex items-center gap-2 col-span-full">
                         <Info className="h-4 w-4 text-gray-400" />
                         <span>Nội dung: {item.noi_dung}</span>
                      </div>
                    </div>
                    
                    {item.ghi_chu && (
                         <div className="mt-2 text-xs text-red-500 bg-red-50 p-2 rounded">
                            Ghi chú: {item.ghi_chu}
                         </div>
                    )}
                  </div>
                </div>
              </Card>
            ))
          )}
        </div>
      )}

      <ImportTimetableModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        onSuccess={fetchTimetable}
        classNameStr={className}
      />
    </div>
  );
}
