"use client";

import React from "react";
import Link from "next/link";
import {
  AlertTriangle,
  ArrowRight,
  Clock,
  CheckCircle2,
  ExternalLink,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export interface PendingReportItem {
  _id: string;
  userId?: {
    name?: string;
    email?: string;
  } | null;
  questionText?: string;
  reportType: "content_error" | "wrong_answer";
  status: "pending" | "reviewed" | "resolved" | "rejected";
  createdAt: string;
  description?: string;
}

interface PendingReportsWidgetProps {
  reports: PendingReportItem[];
  pendingCount: number;
  loading?: boolean;
}

const typeConfig: Record<
  string,
  { label: string; badgeClass: string }
> = {
  wrong_answer: {
    label: "Sai đáp án",
    badgeClass:
      "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-400 dark:border-rose-900",
  },
  content_error: {
    label: "Lỗi nội dung",
    badgeClass:
      "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-900",
  },
};

function formatRelativeTime(dateString: string): string {
  try {
    const diffInSeconds = Math.floor(
      (Date.now() - new Date(dateString).getTime()) / 1000
    );
    if (diffInSeconds < 60) return "Vừa xong";
    const diffInMinutes = Math.floor(diffInSeconds / 60);
    if (diffInMinutes < 60) return `${diffInMinutes} phút trước`;
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours} giờ trước`;
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 30) return `${diffInDays} ngày trước`;
    return new Date(dateString).toLocaleDateString("vi-VN");
  } catch {
    return dateString;
  }
}

export default function PendingReportsWidget({
  reports,
  pendingCount,
  loading = false,
}: PendingReportsWidgetProps) {
  // Lọc chỉ lấy các báo cáo đang ở trạng thái pending (chờ xử lý)
  const pendingList = reports.filter(
    (item) => item.status === "pending" || !item.status
  );

  return (
    <div className="flex h-full flex-col rounded-xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm">
      {/* Header: Chỉ tập trung vào mục Chờ Xử Lý */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400">
            <AlertTriangle className="h-4 w-4" />
          </div>
          <div>
            <h3 className="font-semibold text-slate-800 dark:text-slate-100 text-sm">
              Báo Lỗi Chờ Xử Lý
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Kiểm tra phản hồi mới từ học viên
            </p>
          </div>
        </div>

        <div>
          {pendingCount > 0 ? (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 dark:bg-amber-950/40 px-2.5 py-0.5 text-xs font-semibold text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500" />
              </span>
              {pendingCount} báo mới
            </span>
          ) : (
            <Badge
              variant="outline"
              className="border-emerald-300 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-300 font-normal text-xs px-2 py-0.5"
            >
              Không có mới
            </Badge>
          )}
        </div>
      </div>

      {/* Danh sách các câu hỏi đang chờ xử lý */}
      <div className="mt-3 flex-1 space-y-2.5 overflow-y-auto max-h-[330px] pr-1">
        {loading ? (
          <div className="space-y-3 py-4">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-16 rounded-lg bg-slate-100 dark:bg-slate-800 animate-pulse"
              />
            ))}
          </div>
        ) : pendingList.length === 0 && pendingCount === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 text-center text-slate-500 dark:text-slate-400">
            <div className="h-10 w-10 rounded-full bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-2.5">
              <CheckCircle2 className="h-5 w-5" />
            </div>
            <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
              Hiện không có báo lỗi nào cần xử lý
            </p>
            <p className="text-xs text-slate-400 mt-0.5">
              Tất cả câu hỏi đều hoạt động bình thường.
            </p>
          </div>
        ) : (
          pendingList.slice(0, 5).map((item) => {
            const type = typeConfig[item.reportType] || {
              label: item.reportType,
              badgeClass: "bg-slate-100 text-slate-700",
            };
            const questionSnippet =
              item.questionText ||
              item.description ||
              "Báo cáo sai sót câu hỏi thi";

            return (
              <div
                key={item._id}
                className="group relative flex flex-col justify-between rounded-lg border border-slate-200/70 dark:border-slate-800 p-3 hover:border-slate-300 dark:hover:border-slate-700 hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <span
                      className={cn(
                        "inline-flex items-center rounded border px-1.5 py-0.5 text-[11px] font-medium whitespace-nowrap",
                        type.badgeClass
                      )}
                    >
                      {type.label}
                    </span>
                    <span className="text-[11px] text-slate-500 dark:text-slate-400 truncate max-w-[130px]">
                      {item.userId?.name || item.userId?.email || "Học viên"}
                    </span>
                  </div>

                  <span className="inline-flex items-center gap-1 text-[11px] text-slate-400 dark:text-slate-500 whitespace-nowrap">
                    <Clock className="h-3 w-3" />
                    {formatRelativeTime(item.createdAt)}
                  </span>
                </div>

                <p className="mt-1.5 text-xs text-slate-700 dark:text-slate-300 line-clamp-2 leading-relaxed">
                  {questionSnippet}
                </p>

                <div className="mt-2 flex items-center justify-end">
                  <Link
                    href={`/reports/${item._id}`}
                    className="inline-flex items-center gap-1 text-xs font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
                  >
                    <span>Xem chi tiết</span>
                    <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
                  </Link>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Footer Link */}
      <div className="pt-3 mt-3 border-t border-slate-100 dark:border-slate-800">
        <Link href="/reports?status=pending" className="w-full block">
          <Button
            variant="outline"
            size="sm"
            className="w-full text-xs font-medium flex items-center justify-center gap-1.5 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <span>Quản lý danh sách báo lỗi ({pendingCount})</span>
            <ExternalLink className="h-3.5 w-3.5" />
          </Button>
        </Link>
      </div>
    </div>
  );
}
