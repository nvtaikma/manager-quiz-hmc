"use client";

import React from "react";
import Link from "next/link";
import { Users, UserCheck, Radio, UserX, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface UserStatusWidgetProps {
  activeUsers: number;
  inactiveUsers: number;
  onlineUsers: number;
}

export default function UserStatusWidget({
  activeUsers,
  inactiveUsers,
  onlineUsers,
}: UserStatusWidgetProps) {
  const totalUsers = activeUsers + inactiveUsers;
  const activePct = totalUsers > 0 ? Math.round((activeUsers / totalUsers) * 100) : 0;
  const onlinePct = totalUsers > 0 ? Math.round((onlineUsers / totalUsers) * 100) : 0;

  return (
    <div className="flex h-full flex-col justify-between rounded-xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm">
      <div>
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400">
              <Users className="h-4 w-4" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-900 dark:text-slate-100 text-sm">
                Trạng Thái Học Viên
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Tổng cộng {totalUsers} tài khoản
              </p>
            </div>
          </div>
        </div>

        {/* Highlight Online Banner */}
        <div className="my-3.5 flex items-center justify-between rounded-lg bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200/60 dark:border-emerald-900/60 p-3">
          <div className="flex items-center gap-2.5">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
            </span>
            <div>
              <span className="text-xs font-semibold text-emerald-800 dark:text-emerald-300 block">
                Đang trực tuyến (Online)
              </span>
              <span className="text-[11px] text-emerald-600/90 dark:text-emerald-400">
                {onlinePct}% tổng học viên
              </span>
            </div>
          </div>
          <span className="text-xl font-extrabold text-emerald-700 dark:text-emerald-300">
            {onlineUsers}
          </span>
        </div>

        {/* User metrics breakdown */}
        <div className="space-y-2.5">
          <div className="flex items-center justify-between rounded-lg p-2.5 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
            <div className="flex items-center gap-2.5">
              <div className="flex h-7 w-7 items-center justify-center rounded-md bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400">
                <UserCheck className="h-3.5 w-3.5" />
              </div>
              <span className="text-xs font-medium text-slate-700 dark:text-slate-300">
                Đang hoạt động (Active)
              </span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xs text-slate-400 font-medium">
                {activePct}%
              </span>
              <span className="text-sm font-bold text-blue-600 dark:text-blue-400">
                {activeUsers}
              </span>
            </div>
          </div>

          <div className="flex items-center justify-between rounded-lg p-2.5 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
            <div className="flex items-center gap-2.5">
              <div className="flex h-7 w-7 items-center justify-center rounded-md bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400">
                <UserX className="h-3.5 w-3.5" />
              </div>
              <span className="text-xs font-medium text-slate-700 dark:text-slate-300">
                Không hoạt động (Inactive)
              </span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xs text-slate-400 font-medium">
                {100 - activePct}%
              </span>
              <span className="text-sm font-bold text-slate-600 dark:text-slate-400">
                {inactiveUsers}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Footer link */}
      <div className="pt-3 mt-3 border-t border-slate-100 dark:border-slate-800">
        <Link href="/manage-users" className="w-full block">
          <Button
            variant="ghost"
            size="sm"
            className="w-full text-xs font-semibold text-blue-600 hover:text-blue-700 dark:text-blue-400 flex items-center justify-center gap-1"
          >
            <span>Quản lý học viên</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Button>
        </Link>
      </div>
    </div>
  );
}
