"use client";

import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { API_BASE_URL } from "@/contants/api";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { Activity, CalendarDays } from "lucide-react";
import { SessionCard, type ActivitySession } from "./SessionCard";

// ─────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────

interface DailyActivitySummary {
  date: string;               // "2026-04-21"
  dateLabel: string;          // "Th 2, 21/04"
  sessions: ActivitySession[];
  totalActiveMinutes: number;
  sessionCount: number;
}

interface ChartDataPoint {
  day: string;
  minutes: number;
  sessionCount: number;
  docDate: string;
  sessions: ActivitySession[];
}

interface UserActivityModalProps {
  isOpen: boolean;
  onClose: () => void;
  customerId: string | null;  // Customer._id từ trang Manage Users
  userName: string;
}

// ─────────────────────────────────────────────
// Custom Tooltip
// ─────────────────────────────────────────────

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{ value: number; payload: ChartDataPoint }>;
  label?: string;
}

const CustomTooltip = ({ active, payload, label }: CustomTooltipProps) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-white border rounded-lg shadow-md p-3 text-sm min-w-[140px]">
        <p className="font-semibold text-gray-700 mb-1">{label}</p>
        <p className="text-blue-600">
          <span className="font-bold">{payload[0].value}</span> phút hoạt động
        </p>
        <p className="text-gray-500 text-xs mt-0.5">
          {data.sessionCount} phiên
        </p>
      </div>
    );
  }
  return null;
};

// ─────────────────────────────────────────────
// Main Component
// ─────────────────────────────────────────────

export default function UserActivityModal({
  isOpen,
  onClose,
  customerId,
  userName,
}: UserActivityModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [chartData, setChartData] = useState<ChartDataPoint[]>([]);
  const [selectedDay, setSelectedDay] = useState<ChartDataPoint | null>(null);

  // Fetch dữ liệu khi modal mở — gọi /sessions thay vì /activities
  useEffect(() => {
    if (!isOpen || !customerId) return;

    const fetchSessions = async () => {
      try {
        setLoading(true);
        setError(null);
        setSelectedDay(null);

        // BE tự map customerId → authUserId, FE không cần biết
        const res = await fetch(
          `${API_BASE_URL}/customers/${customerId}/sessions?days=7`
        );

        if (!res.ok) throw new Error("Không thể tải dữ liệu hoạt động");

        const json = await res.json();
        const summaries: DailyActivitySummary[] = json.data ?? [];

        // Chuyển API response → ChartDataPoint[]
        // docs trả về DESC (mới nhất trước) → reverse để chart hiển thị cũ→mới
        const points: ChartDataPoint[] = summaries
          .slice()
          .reverse()
          .map((summary) => ({
            day: summary.dateLabel,
            minutes: summary.totalActiveMinutes,
            sessionCount: summary.sessionCount,
            docDate: summary.date,
            sessions: summary.sessions,
          }));

        setChartData(points);

        // Mặc định chọn ngày mới nhất (cuối mảng sau reverse)
        if (points.length > 0) {
          setSelectedDay(points[points.length - 1]);
        }
      } catch {
        setError("Không thể tải lịch sử hoạt động. Vui lòng thử lại.");
      } finally {
        setLoading(false);
      }
    };

    fetchSessions();
  }, [isOpen, customerId]);

  // Reset khi đóng modal
  useEffect(() => {
    if (!isOpen) {
      setChartData([]);
      setSelectedDay(null);
      setError(null);
    }
  }, [isOpen]);

  const hasOnlineSession = selectedDay?.sessions.some(
    (s) => s.status === "online"
  );

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-base">
            <Activity className="h-5 w-5 text-blue-500" />
            Lịch sử hoạt động — {userName}
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-hidden">
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" />
            </div>
          ) : error ? (
            <div className="py-8 text-center text-muted-foreground text-sm">
              {error}
            </div>
          ) : chartData.length === 0 ? (
            <div className="py-10 text-center space-y-2">
              <Activity className="h-10 w-10 text-muted-foreground mx-auto opacity-40" />
              <p className="text-muted-foreground text-sm">
                Không có dữ liệu hoạt động trong 7 ngày qua
              </p>
            </div>
          ) : (
            <div className="space-y-5 h-full">
              {/* ── Bar Chart (metric: phút hoạt động) ── */}
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">
                  Thời gian hoạt động 7 ngày qua (phút)
                </p>
                <p className="text-xs text-muted-foreground">
                  👆 Click vào cột để xem chi tiết theo phiên
                </p>
                <div className="h-44 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={chartData}
                      margin={{ top: 4, right: 4, bottom: 0, left: -20 }}
                      onClick={(data) => {
                        if (data?.activePayload?.[0]) {
                          setSelectedDay(
                            data.activePayload[0].payload as ChartDataPoint
                          );
                        }
                      }}
                    >
                      <XAxis
                        dataKey="day"
                        tick={{ fontSize: 10 }}
                        axisLine={false}
                        tickLine={false}
                      />
                      <YAxis
                        allowDecimals={false}
                        tick={{ fontSize: 10 }}
                        axisLine={false}
                        tickLine={false}
                        unit="p"
                      />
                      <Tooltip content={<CustomTooltip />} cursor={false} />
                      <Bar dataKey="minutes" radius={[4, 4, 0, 0]}>
                        {chartData.map((entry, index) => (
                          <Cell
                            key={index}
                            fill={
                              selectedDay?.docDate === entry.docDate
                                ? "#3b82f6"  // blue-500 — cột đang chọn
                                : "#93c5fd"  // blue-300 — cột mặc định
                            }
                            style={{ cursor: "pointer" }}
                          />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* ── Session Timeline ── */}
              {selectedDay && (
                <div className="space-y-2">
                  {/* Day summary header */}
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <div className="flex items-center gap-2">
                      <CalendarDays className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm font-medium">
                        {selectedDay.day}
                      </span>
                      {hasOnlineSession && (
                        <span className="inline-flex items-center gap-1 text-xs text-green-600 font-medium">
                          <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                          Đang online
                        </span>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <Badge variant="outline" className="text-xs">
                        {selectedDay.sessionCount} phiên
                      </Badge>
                      <Badge variant="secondary" className="text-xs">
                        {selectedDay.minutes} phút
                      </Badge>
                    </div>
                  </div>

                  {/* Sessions list */}
                  <ScrollArea className="max-h-64">
                    <div className="space-y-2 pr-1">
                      {selectedDay.sessions.length === 0 ? (
                        <p className="text-xs text-muted-foreground text-center py-4">
                          Không có dữ liệu chi tiết
                        </p>
                      ) : (
                        selectedDay.sessions.map((session, idx) => (
                          <SessionCard
                            key={idx}
                            session={session}
                            index={idx}
                          />
                        ))
                      )}
                    </div>
                  </ScrollArea>
                </div>
              )}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
