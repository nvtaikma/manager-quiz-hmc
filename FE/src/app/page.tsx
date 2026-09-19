"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import { fetchApi } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import {
  DollarSign,
  Package,
  Users,
  AlertTriangle,
  RefreshCw,
  Activity,
  ArrowUp,
  ArrowDown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import StatCard from "@/app/components/dashboard/StatCard";
import PendingReportsWidget, {
  PendingReportItem,
} from "@/app/components/dashboard/PendingReportsWidget";
import RevenueChartWidget from "@/app/components/dashboard/RevenueChartWidget";
import OrderStatusWidget from "@/app/components/dashboard/OrderStatusWidget";
import UserStatusWidget from "@/app/components/dashboard/UserStatusWidget";
import DashboardSkeleton from "@/app/components/dashboard/DashboardSkeleton";

interface IncomeData {
  date: string;
  totalAmount: number;
}

interface DashboardReportsStats {
  total: number;
  pending: number;
  reviewed: number;
  resolved: number;
  rejected: number;
}

interface DashboardData {
  activeUsers: number;
  inactiveUsers: number;
  onlineUsers: number;
  totalOrders: number;
  completedOrders: number;
  pendingOrders: number;
  cancelledOrders: number;
  totalIncome: number;
  todayIncome: number;
  yesterdayIncome: number;
  last7DaysIncome: IncomeData[];
  last12MonthsIncome: IncomeData[];
  // Error reports
  reportsStats: DashboardReportsStats;
  pendingReportsList: PendingReportItem[];
}

async function safeFetch<T>(endpoint: string, fallback: T): Promise<T> {
  try {
    const formatted = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;
    const res = await fetchApi(formatted);
    if (!res.ok) return fallback;
    const json = await res.json();
    if (json && json.data !== undefined) {
      return json.data as T;
    }
    return (json as T) || fallback;
  } catch (err) {
    console.warn(`[Dashboard] safeFetch failed for ${endpoint}:`, err);
    return fallback;
  }
}

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Chào buổi sáng";
  if (hour < 18) return "Chào buổi chiều";
  return "Chào buổi tối";
}

export default function Dashboard() {
  const router = useRouter();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const { toast } = useToast();

  const fetchDashboardData = useCallback(
    async (isManualRefresh = false) => {
      if (isManualRefresh) setRefreshing(true);
      else setLoading(true);

      try {
        const [
          activeUsersRes,
          inactiveUsersRes,
          onlineUsersRes,
          totalOrdersRes,
          completedOrdersRes,
          pendingOrdersRes,
          cancelledOrdersRes,
          totalIncomeRes,
          todayIncomeRes,
          yesterdayIncomeRes,
          last7DaysIncomeRes,
          last12MonthsIncomeRes,
          reportsDashboardRes,
          pendingReportsRes,
        ] = await Promise.all([
          safeFetch<{ count: number }>("customers/count/active", { count: 0 }),
          safeFetch<{ count: number }>("customers/count/inactive", { count: 0 }),
          safeFetch<{ count: number }>("customers/count/online", { count: 0 }),
          safeFetch<{ count: number }>("orders/count", { count: 0 }),
          safeFetch<{ count: number }>("orders/count/status?status=completed", { count: 0 }),
          safeFetch<{ count: number }>("orders/count/status?status=pending", { count: 0 }),
          safeFetch<{ count: number }>("orders/count/status?status=cancelled", { count: 0 }),
          safeFetch<{ totalAmount: number }>("orders/total/amount", { totalAmount: 0 }),
          safeFetch<{ totalAmount: number }>("orders/total/amount/date", { totalAmount: 0 }),
          safeFetch<{ totalAmount: number }>("orders/total/amount/yesterday", { totalAmount: 0 }),
          safeFetch<IncomeData[]>("orders/total/amount/last7days", []),
          safeFetch<IncomeData[]>("orders/total/amount/last12months", []),
          safeFetch<{
            stats: DashboardReportsStats;
          }>("reports/dashboard", {
            stats: { total: 0, pending: 0, reviewed: 0, resolved: 0, rejected: 0 },
          }),
          safeFetch<{ reports: PendingReportItem[] }>("reports?status=pending&limit=5", {
            reports: [],
          }),
        ]);

        const reportsStats = reportsDashboardRes?.stats || {
          total: 0,
          pending: 0,
          reviewed: 0,
          resolved: 0,
          rejected: 0,
        };

        setData({
          activeUsers: activeUsersRes?.count || 0,
          inactiveUsers: inactiveUsersRes?.count || 0,
          onlineUsers: onlineUsersRes?.count || 0,
          totalOrders: totalOrdersRes?.count || 0,
          completedOrders: completedOrdersRes?.count || 0,
          pendingOrders: pendingOrdersRes?.count || 0,
          cancelledOrders: cancelledOrdersRes?.count || 0,
          totalIncome: totalIncomeRes?.totalAmount || 0,
          todayIncome: todayIncomeRes?.totalAmount || 0,
          yesterdayIncome: yesterdayIncomeRes?.totalAmount || 0,
          last7DaysIncome: Array.isArray(last7DaysIncomeRes)
            ? last7DaysIncomeRes
            : [],
          last12MonthsIncome: Array.isArray(last12MonthsIncomeRes)
            ? last12MonthsIncomeRes
            : [],
          reportsStats,
          pendingReportsList: pendingReportsRes?.reports || [],
        });

        setLastUpdated(new Date());

        if (isManualRefresh) {
          toast({
            title: "Đã cập nhật",
            description: "Dữ liệu bảng điều khiển đã được làm mới mới nhất.",
          });
        }
      } catch (error) {
        console.error("Lỗi khi tải dữ liệu bảng điều khiển:", error);
        toast({
          title: "Thông báo",
          description: "Không thể làm mới một số dữ liệu. Vui lòng kiểm tra lại kết nối.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [toast]
  );

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  const greeting = useMemo(() => getGreeting(), []);

  // Format currencies
  const formatCurrency = (amount: number) =>
    amount.toLocaleString("vi-VN", { style: "currency", currency: "VND" });

  if (loading) {
    return <DashboardSkeleton />;
  }

  if (!data) {
    return (
      <div className="flex h-[75vh] flex-col items-center justify-center text-center p-6">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-rose-50 dark:bg-rose-950/40 text-rose-600 mb-4">
          <AlertTriangle className="h-8 w-8" />
        </div>
        <h2 className="text-xl font-bold text-slate-800 dark:text-slate-200">
          Không thể kết nối đến máy chủ
        </h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-md">
          Hệ thống không thể tải dữ liệu bảng điều khiển. Vui lòng kiểm tra lại backend server hoặc kết nối mạng.
        </p>
        <Button
          onClick={() => fetchDashboardData(true)}
          className="mt-5 gap-2 bg-blue-600 hover:bg-blue-700"
        >
          <RefreshCw className="h-4 w-4" />
          <span>Thử lại</span>
        </Button>
      </div>
    );
  }

  const {
    totalIncome,
    todayIncome,
    yesterdayIncome,
    totalOrders,
    completedOrders,
    activeUsers,
    inactiveUsers,
    onlineUsers,
    last7DaysIncome,
    last12MonthsIncome,
    reportsStats,
    pendingReportsList,
  } = data;

  // Income comparison
  const incomeTrend =
    yesterdayIncome > 0
      ? Math.round(((todayIncome - yesterdayIncome) / yesterdayIncome) * 100)
      : undefined;

  return (
    <div className="min-h-screen bg-gray-50/70 dark:bg-slate-950 p-6 md:p-8 space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100">
              Bảng Điều Khiển
            </h1>
            <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 dark:bg-blue-950/50 px-2.5 py-0.5 text-xs font-semibold text-blue-700 dark:text-blue-300 border border-blue-200/60 dark:border-blue-800">
              <Activity className="h-3 w-3 text-blue-600 animate-pulse" />
              Trực tiếp
            </span>
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            {greeting}! Tổng quan hệ thống và các công việc cần theo dõi.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {lastUpdated && (
            <span className="hidden md:inline-block text-xs text-gray-400 dark:text-gray-500">
              Cập nhật: {lastUpdated.toLocaleTimeString("vi-VN")}
            </span>
          )}
          <Button
            onClick={() => fetchDashboardData(true)}
            variant="outline"
            size="sm"
            disabled={refreshing}
            className="h-9 gap-1.5 border-gray-200 dark:border-gray-800 hover:bg-gray-100 dark:hover:bg-gray-900 text-xs font-semibold"
          >
            <RefreshCw
              className={`h-3.5 w-3.5 text-gray-600 dark:text-gray-400 ${
                refreshing ? "animate-spin" : ""
              }`}
            />
            <span>{refreshing ? "Đang tải..." : "Làm mới"}</span>
          </Button>
        </div>
      </div>

      {/* Row 1: 5 KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Card 1: Tổng Thu Nhập */}
        <StatCard
          title="Tổng Thu Nhập"
          value={formatCurrency(totalIncome)}
          icon={DollarSign}
          color="blue"
          subtitle="+20.1% so với tháng trước"
        />

        {/* Card 2: Thu Nhập Hôm Nay */}
        <StatCard
          title="Thu Nhập Hôm Nay"
          value={formatCurrency(todayIncome)}
          icon={DollarSign}
          color="blue"
          trend={
            incomeTrend !== undefined
              ? { value: incomeTrend, label: "so với hôm qua" }
              : undefined
          }
          subtitle={`Hôm qua: ${formatCurrency(yesterdayIncome)}`}
        />

        {/* Card 3: Đơn Hàng */}
        <StatCard
          title="Tổng Đơn Hàng"
          value={totalOrders}
          icon={Package}
          color="emerald"
          subtitle={`${completedOrders} đơn hoàn tất`}
        />

        {/* Card 4: Người Dùng */}
        <StatCard
          title="Người Dùng"
          value={activeUsers + inactiveUsers}
          icon={Users}
          color="blue"
          badge={{ text: `${onlineUsers} online`, pulse: true }}
          subtitle={`${activeUsers} đang hoạt động`}
        />

        {/* Card 5: Báo lỗi chờ xử lý (Chỉ hiển thị mục chờ xử lý để biết có mới hay không) */}
        <StatCard
          title="Báo Lỗi Chờ Xử Lý"
          value={reportsStats.pending}
          icon={AlertTriangle}
          color="amber"
          badge={
            reportsStats.pending > 0
              ? { text: "Có mới", pulse: true, variant: "destructive" }
              : { text: "0 chờ duyệt", variant: "outline" }
          }
          subtitle={
            reportsStats.pending > 0
              ? `${reportsStats.pending} câu hỏi cần duyệt`
              : "Không có báo lỗi mới"
          }
          onClick={() => router.push("/reports?status=pending")}
        />
      </div>

      {/* Row 2: Biểu Đồ Cột Doanh Thu (8 cột) + Widget Báo Lỗi Chờ Xử Lý (4 cột) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        <div className="lg:col-span-8 flex flex-col">
          <RevenueChartWidget
            last7DaysIncome={last7DaysIncome}
            last12MonthsIncome={last12MonthsIncome}
            todayIncome={todayIncome}
            yesterdayIncome={yesterdayIncome}
            totalIncome={totalIncome}
          />
        </div>

        {/* Khối Báo Lỗi Chờ Xử Lý */}
        <div className="lg:col-span-4 flex flex-col">
          <PendingReportsWidget
            reports={pendingReportsList}
            pendingCount={reportsStats.pending}
            loading={refreshing}
          />
        </div>
      </div>

      {/* Row 3: Thống Kê Đơn Hàng & Người Dùng */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
        <OrderStatusWidget
          totalOrders={totalOrders}
          completedOrders={completedOrders}
          pendingOrders={data.pendingOrders}
          cancelledOrders={data.cancelledOrders}
        />

        <UserStatusWidget
          activeUsers={activeUsers}
          inactiveUsers={inactiveUsers}
          onlineUsers={onlineUsers}
        />
      </div>
    </div>
  );
}
