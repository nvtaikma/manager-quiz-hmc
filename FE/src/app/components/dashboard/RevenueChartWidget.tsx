"use client";

import React, { useState, useMemo } from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DollarSign, TrendingUp, TrendingDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface IncomeItem {
  date: string;
  totalAmount: number;
}

interface RevenueChartWidgetProps {
  last7DaysIncome: IncomeItem[];
  last12MonthsIncome: IncomeItem[];
  todayIncome: number;
  yesterdayIncome: number;
  totalIncome: number;
}

function formatVND(value: number): string {
  return value.toLocaleString("vi-VN", {
    style: "currency",
    currency: "VND",
  });
}

// Format ngày theo chuẩn Việt Nam (GMT+7)
function formatAxisDate(dateStr: string, isMonth = false): string {
  if (!dateStr) return "";
  const parts = dateStr.split("-");
  if (!isMonth && parts.length === 3) {
    return `${parseInt(parts[2], 10)}/${parseInt(parts[1], 10)}`;
  }
  if (isMonth && parts.length === 2) {
    return `T${parseInt(parts[1], 10)}/${parts[0]}`;
  }
  return dateStr;
}

function CustomTooltip({ active, payload, label }: any) {
  if (active && payload && payload.length) {
    const data = payload[0];
    return (
      <div className="rounded-lg border border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 p-3 shadow-md">
        <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">
          {label} (Giờ VN - GMT+7)
        </p>
        <p className="text-sm font-bold text-blue-600 dark:text-blue-400">
          {formatVND(data.value)}
        </p>
      </div>
    );
  }
  return null;
}

export default function RevenueChartWidget({
  last7DaysIncome,
  last12MonthsIncome,
  todayIncome,
  yesterdayIncome,
  totalIncome,
}: RevenueChartWidgetProps) {
  const [timeframe, setTimeframe] = useState<"7days" | "12months">("7days");

  const formatted7Days = useMemo(() => {
    return (last7DaysIncome || []).map((item) => ({
      ...item,
      displayDate: formatAxisDate(item.date, false),
    }));
  }, [last7DaysIncome]);

  const formatted12Months = useMemo(() => {
    return (last12MonthsIncome || []).map((item) => ({
      ...item,
      displayDate: formatAxisDate(item.date, true),
    }));
  }, [last12MonthsIncome]);

  const activeData =
    timeframe === "7days" ? formatted7Days : formatted12Months;

  const diffPercent =
    yesterdayIncome > 0
      ? (((todayIncome - yesterdayIncome) / yesterdayIncome) * 100).toFixed(1)
      : null;

  return (
    <div className="flex h-full flex-col rounded-xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400">
            <DollarSign className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-slate-800 dark:text-slate-100 text-base">
                Biểu Đồ Doanh Thu
              </h3>
              <span className="text-[11px] text-slate-400 font-normal">
                (GMT+7)
              </span>
            </div>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-xs text-slate-500 dark:text-slate-400">
                Hôm nay: <strong className="text-slate-700 dark:text-slate-200">{formatVND(todayIncome)}</strong>
              </span>
              {diffPercent && (
                <span
                  className={cn(
                    "inline-flex items-center gap-0.5 text-xs font-medium px-1.5 py-0.5 rounded",
                    Number(diffPercent) >= 0
                      ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400"
                      : "bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-400"
                  )}
                >
                  {Number(diffPercent) >= 0 ? (
                    <TrendingUp className="h-3 w-3" />
                  ) : (
                    <TrendingDown className="h-3 w-3" />
                  )}
                  {Number(diffPercent) >= 0 ? `+${diffPercent}%` : `${diffPercent}%`}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Timeframe selector tabs */}
        <Tabs
          value={timeframe}
          onValueChange={(val) => setTimeframe(val as "7days" | "12months")}
          className="w-auto"
        >
          <TabsList className="h-8 bg-slate-100 dark:bg-slate-800 p-0.5">
            <TabsTrigger
              value="7days"
              className="text-xs px-3 py-1 data-[state=active]:bg-white dark:data-[state=active]:bg-slate-900 data-[state=active]:shadow-sm"
            >
              7 ngày qua
            </TabsTrigger>
            <TabsTrigger
              value="12months"
              className="text-xs px-3 py-1 data-[state=active]:bg-white dark:data-[state=active]:bg-slate-900 data-[state=active]:shadow-sm"
            >
              12 tháng
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* BarChart Canvas (Biểu đồ cột) */}
      <div className="mt-4 flex-1 min-h-[300px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={activeData}
            margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              vertical={false}
              stroke="#E2E8F0"
              className="dark:stroke-slate-800"
            />
            <XAxis
              dataKey="displayDate"
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 12, fill: "#64748B" }}
              dy={8}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 11, fill: "#64748B" }}
              tickFormatter={(val) =>
                val >= 1000000
                  ? `${(val / 1000000).toFixed(1)}M`
                  : val >= 1000
                  ? `${(val / 1000).toFixed(0)}k`
                  : `${val}`
              }
              width={45}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(59, 130, 246, 0.06)" }} />
            <Bar
              dataKey="totalAmount"
              fill="#3B82F6"
              radius={[4, 4, 0, 0]}
              maxBarSize={48}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
