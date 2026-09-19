"use client";

import React from "react";
import Link from "next/link";
import { Package, CheckCircle2, Clock, XCircle, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface OrderStatusWidgetProps {
  totalOrders: number;
  completedOrders: number;
  pendingOrders: number;
  cancelledOrders: number;
}

export default function OrderStatusWidget({
  totalOrders,
  completedOrders,
  pendingOrders,
  cancelledOrders,
}: OrderStatusWidgetProps) {
  const completedPct = totalOrders > 0 ? Math.round((completedOrders / totalOrders) * 100) : 0;
  const pendingPct = totalOrders > 0 ? Math.round((pendingOrders / totalOrders) * 100) : 0;
  const cancelledPct = totalOrders > 0 ? Math.round((cancelledOrders / totalOrders) * 100) : 0;

  const items = [
    {
      name: "Hoàn thành",
      count: completedOrders,
      pct: completedPct,
      colorBg: "bg-emerald-500",
      colorText: "text-emerald-600 dark:text-emerald-400",
      icon: CheckCircle2,
      lightBg: "bg-emerald-50 dark:bg-emerald-950/30",
    },
    {
      name: "Đang xử lý",
      count: pendingOrders,
      pct: pendingPct,
      colorBg: "bg-amber-500",
      colorText: "text-amber-600 dark:text-amber-400",
      icon: Clock,
      lightBg: "bg-amber-50 dark:bg-amber-950/30",
    },
    {
      name: "Đã hủy",
      count: cancelledOrders,
      pct: cancelledPct,
      colorBg: "bg-rose-500",
      colorText: "text-rose-600 dark:text-rose-400",
      icon: XCircle,
      lightBg: "bg-rose-50 dark:bg-rose-950/30",
    },
  ];

  return (
    <div className="flex h-full flex-col justify-between rounded-xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm">
      <div>
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400">
              <Package className="h-4 w-4" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-900 dark:text-slate-100 text-sm">
                Tình Trạng Đơn Hàng
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Tổng cộng {totalOrders} đơn hàng
              </p>
            </div>
          </div>
        </div>

        {/* Multi-segment Progress Bar */}
        <div className="my-4">
          <div className="h-2.5 w-full rounded-full bg-slate-100 dark:bg-slate-800 flex overflow-hidden">
            <div
              style={{ width: `${completedPct}%` }}
              className="h-full bg-emerald-500 transition-all duration-500"
            />
            <div
              style={{ width: `${pendingPct}%` }}
              className="h-full bg-amber-500 transition-all duration-500"
            />
            <div
              style={{ width: `${cancelledPct}%` }}
              className="h-full bg-rose-500 transition-all duration-500"
            />
          </div>
        </div>

        {/* Status Breakdown List */}
        <div className="space-y-3">
          {items.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div
                key={idx}
                className="flex items-center justify-between rounded-lg p-2.5 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
              >
                <div className="flex items-center gap-2.5">
                  <div
                    className={`flex h-7 w-7 items-center justify-center rounded-md ${item.lightBg} ${item.colorText}`}
                  >
                    <Icon className="h-3.5 w-3.5" />
                  </div>
                  <span className="text-xs font-medium text-slate-700 dark:text-slate-300">
                    {item.name}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs text-slate-400 font-medium">
                    {item.pct}%
                  </span>
                  <span
                    className={`text-sm font-bold min-w-[28px] text-right ${item.colorText}`}
                  >
                    {item.count}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Footer link */}
      <div className="pt-3 mt-3 border-t border-slate-100 dark:border-slate-800">
        <Link href="/list-orders" className="w-full block">
          <Button
            variant="ghost"
            size="sm"
            className="w-full text-xs font-semibold text-blue-600 hover:text-blue-700 dark:text-blue-400 flex items-center justify-center gap-1"
          >
            <span>Quản lý đơn hàng</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Button>
        </Link>
      </div>
    </div>
  );
}
