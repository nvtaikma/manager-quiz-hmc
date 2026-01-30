"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { API_BASE_URL } from "@/contants/api";
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Bar,
  BarChart,
  ResponsiveContainer,
} from "recharts";
import { TabsContent, Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ArrowDownIcon,
  ArrowUpIcon,
  DollarSignIcon,
  PackageIcon,
  UsersIcon,
} from "lucide-react";

interface DashboardData {
  activeUsers: number;
  inactiveUsers: number;
  totalOrders: number;
  completedOrders: number;
  pendingOrders: number;
  cancelledOrders: number;
  totalIncome: number;
  todayIncome: number;
  yesterdayIncome: number;
  last7DaysIncome: { totalAmount: number; date: string }[];
  last12MonthsIncome: { totalAmount: number; date: string }[];
}

interface IncomeData {
  date: string;
  totalAmount: number;
}

// Sử dụng API_BASE_URL từ constants
// const API_URL = process.env.NEXT_PUBLIC_API_URL;

export default function Dashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchDashboardData = useCallback(async () => {
    try {
      const endpoints = [
        "customers/count/active",
        "customers/count/inactive",
        "orders/count",
        "orders/count/status?status=completed",
        "orders/count/status?status=pending",
        "orders/count/status?status=cancelled",
        "orders/total/amount",
        "orders/total/amount/date",
        "orders/total/amount/yesterday",
        "orders/total/amount/last7days",
        "orders/total/amount/last12months",
      ];

      const responses = await Promise.all(
        endpoints.map((endpoint) =>
          fetch(`${API_BASE_URL}/${endpoint}`)
            .then((res) => res.json())
            .catch((err) => {
              console.error(`Error fetching ${endpoint}:`, err);
              return null;
            })
        )
      );

      const [
        activeUsers,
        inactiveUsers,
        totalOrders,
        completedOrders,
        pendingOrders,
        cancelledOrders,
        totalIncome,
        todayIncome,
        yesterdayIncome,
        last7DaysIncome,
        last12MonthsIncome,
      ] = responses;

      if (responses.some((res) => !res)) {
        throw new Error("Một số yêu cầu không thành công");
      }

      const formattedLast7DaysIncome = last7DaysIncome.data.map(
        (item: IncomeData) => ({
          ...item,
          date: new Date(item.date).toLocaleDateString("vi-VN", {
            day: "numeric",
            month: "numeric",
          }),
        })
      );

      setData({
        activeUsers: activeUsers.data.count,
        inactiveUsers: inactiveUsers.data.count,
        totalOrders: totalOrders.data.count,
        completedOrders: completedOrders.data.count,
        pendingOrders: pendingOrders.data.count,
        cancelledOrders: cancelledOrders.data.count,
        totalIncome: totalIncome.data.totalAmount,
        todayIncome: todayIncome.data.totalAmount,
        yesterdayIncome: yesterdayIncome.data.totalAmount,
        last7DaysIncome: formattedLast7DaysIncome,
        last12MonthsIncome: last12MonthsIncome.data,
      });
    } catch (error) {
      console.error("Lỗi khi tải dữ liệu bảng điều khiển:", error);
      toast({
        title: "Lỗi",
        description: "Không thể tải dữ liệu bảng điều khiển. Vui lòng thử lại.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  const orderStatusData = useMemo(() => {
    if (!data) return [];
    return [
      { name: "Hoàn thành", value: data.completedOrders, color: "#4CAF50" },
      { name: "Đang xử lý", value: data.pendingOrders, color: "#FFC107" },
      { name: "Đã hủy", value: data.cancelledOrders, color: "#F44336" },
    ];
  }, [data]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-xl font-semibold text-gray-600">Không có dữ liệu</p>
      </div>
    );
  }

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <h1 className="text-4xl font-bold mb-8 text-gray-800">Bảng Điều Khiển</h1>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tổng Thu Nhập</CardTitle>
            <DollarSignIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {data.totalIncome.toLocaleString("vi-VN", {
                style: "currency",
                currency: "VND",
              })}
            </div>
            <p className="text-xs text-muted-foreground">
              +20.1% so với tháng trước
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Đơn Hàng</CardTitle>
            <PackageIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.totalOrders}</div>
            <p className="text-xs text-muted-foreground">
              +180.1% so với tháng trước
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Người Dùng</CardTitle>
            <UsersIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {data.activeUsers + data.inactiveUsers}
            </div>
            <p className="text-xs text-muted-foreground">
              +19% so với tháng trước
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Thu Nhập Hôm Nay
            </CardTitle>
            <DollarSignIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {data.todayIncome.toLocaleString("vi-VN", {
                style: "currency",
                currency: "VND",
              })}
            </div>
            <p className="text-xs text-muted-foreground">
              {data.todayIncome > data.yesterdayIncome ? (
                <span className="text-green-600 flex items-center">
                  <ArrowUpIcon className="mr-1 h-4 w-4" />
                  {(
                    ((data.todayIncome - data.yesterdayIncome) /
                      data.yesterdayIncome) *
                    100
                  ).toFixed(2)}
                  % so với hôm qua
                </span>
              ) : (
                <span className="text-red-600 flex items-center">
                  <ArrowDownIcon className="mr-1 h-4 w-4" />
                  {(
                    ((data.yesterdayIncome - data.todayIncome) /
                      data.yesterdayIncome) *
                    100
                  ).toFixed(2)}
                  % so với hôm qua
                </span>
              )}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7 mt-6">
        <Card className="col-span-full lg:col-span-4">
          <CardHeader>
            <CardTitle>Tổng Quan</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="7days">
              <TabsList>
                <TabsTrigger value="7days">7 ngày</TabsTrigger>
                <TabsTrigger value="12months">12 tháng</TabsTrigger>
              </TabsList>
              <TabsContent value="7days">
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={data.last7DaysIncome}>
                    <XAxis dataKey="date" />
                    <YAxis />
                    <CartesianGrid strokeDasharray="3 3" />
                    <Tooltip
                      formatter={(value) =>
                        value.toLocaleString("vi-VN", {
                          style: "currency",
                          currency: "VND",
                        })
                      }
                    />
                    <Bar dataKey="totalAmount" fill="#3b82f6" />
                  </BarChart>
                </ResponsiveContainer>
              </TabsContent>
              <TabsContent value="12months">
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={data.last12MonthsIncome}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip
                      formatter={(value) =>
                        value.toLocaleString("vi-VN", {
                          style: "currency",
                          currency: "VND",
                        })
                      }
                    />
                    <Bar dataKey="totalAmount" fill="#3b82f6" />
                  </BarChart>
                </ResponsiveContainer>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
        <Card className="col-span-full lg:col-span-3">
          <CardHeader>
            <CardTitle>Thống Kê Đơn Hàng</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {orderStatusData.map((status, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div
                      className="w-4 h-4 rounded-full mr-2"
                      style={{ backgroundColor: status.color }}
                    ></div>
                    <span>{status.name}:</span>
                  </div>
                  <span className="font-medium" style={{ color: status.color }}>
                    {status.value}
                  </span>
                </div>
              ))}
              <div className="flex items-center justify-between pt-2 border-t">
                <span className="font-semibold">Tổng đơn hàng:</span>
                <span className="font-semibold">{data.totalOrders}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-2 mt-6">
        <Card className="col-span-12">
          <CardHeader>
            <CardTitle>Trạng Thái Người Dùng</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span>Đang hoạt động:</span>
                <span className="font-medium text-blue-600">
                  {data.activeUsers}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span>Không hoạt động:</span>
                <span className="font-medium text-gray-600">
                  {data.inactiveUsers}
                </span>
              </div>
              <div className="flex items-center justify-between pt-2 border-t">
                <span className="font-semibold">Tổng người dùng:</span>
                <span className="font-semibold">
                  {data.activeUsers + data.inactiveUsers}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
