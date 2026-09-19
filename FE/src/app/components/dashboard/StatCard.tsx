"use client";

import React from "react";
import { LucideIcon, TrendingUp, TrendingDown, Minus } from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

export type StatCardColor = "blue" | "amber" | "emerald" | "rose" | "slate";

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  color?: StatCardColor;
  trend?: {
    value: number;
    label?: string;
    isPositive?: boolean;
  };
  subtitle?: string;
  badge?: {
    text: string;
    pulse?: boolean;
    variant?: "default" | "secondary" | "destructive" | "outline";
  };
  onClick?: () => void;
  className?: string;
}

const colorStyles: Record<
  StatCardColor,
  {
    iconBg: string;
    iconColor: string;
    borderHover: string;
    accentGlow: string;
  }
> = {
  blue: {
    iconBg: "bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400",
    iconColor: "text-blue-600 dark:text-blue-400",
    borderHover: "hover:border-blue-300 dark:hover:border-blue-700",
    accentGlow: "bg-blue-500",
  },
  amber: {
    iconBg: "bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400",
    iconColor: "text-amber-600 dark:text-amber-400",
    borderHover: "hover:border-amber-300 dark:hover:border-amber-700",
    accentGlow: "bg-amber-500",
  },
  emerald: {
    iconBg: "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400",
    iconColor: "text-emerald-600 dark:text-emerald-400",
    borderHover: "hover:border-emerald-300 dark:hover:border-emerald-700",
    accentGlow: "bg-emerald-500",
  },
  rose: {
    iconBg: "bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400",
    iconColor: "text-rose-600 dark:text-rose-400",
    borderHover: "hover:border-rose-300 dark:hover:border-rose-700",
    accentGlow: "bg-rose-500",
  },
  slate: {
    iconBg: "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300",
    iconColor: "text-slate-700 dark:text-slate-300",
    borderHover: "hover:border-slate-300 dark:hover:border-slate-600",
    accentGlow: "bg-slate-500",
  },
};

export default function StatCard({
  title,
  value,
  icon: Icon,
  color = "blue",
  trend,
  subtitle,
  badge,
  onClick,
  className,
}: StatCardProps) {
  const styles = colorStyles[color];

  return (
    <div
      onClick={onClick}
      className={cn(
        "group relative overflow-hidden rounded-xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm transition-all duration-200 hover:shadow-md",
        styles.borderHover,
        onClick && "cursor-pointer active:scale-[0.99]",
        className
      )}
    >
      {/* Top row: Icon & Badge/Action */}
      <div className="flex items-center justify-between">
        <div
          className={cn(
            "flex h-11 w-11 items-center justify-center rounded-lg transition-transform duration-200 group-hover:scale-105",
            styles.iconBg
          )}
        >
          <Icon className="h-5 w-5" />
        </div>

        {badge && (
          <div className="flex items-center gap-1.5">
            {badge.pulse && (
              <span className="relative flex h-2 w-2">
                <span
                  className={cn(
                    "absolute inline-flex h-full w-full animate-ping rounded-full opacity-75",
                    styles.accentGlow
                  )}
                />
                <span
                  className={cn(
                    "relative inline-flex h-2 w-2 rounded-full",
                    styles.accentGlow
                  )}
                />
              </span>
            )}
            <Badge
              variant={badge.variant || "secondary"}
              className="text-xs font-semibold px-2 py-0.5"
            >
              {badge.text}
            </Badge>
          </div>
        )}
      </div>

      {/* Value & Title */}
      <div className="mt-3">
        <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
          {title}
        </p>
        <div className="mt-1 flex items-baseline gap-2">
          <h3 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
            {value}
          </h3>
        </div>
      </div>

      {/* Footer: Trend or Subtitle */}
      {(trend || subtitle) && (
        <div className="mt-3 flex items-center gap-2 text-xs">
          {trend && (
            <span
              className={cn(
                "inline-flex items-center gap-0.5 font-semibold",
                trend.value > 0
                  ? "text-emerald-600 dark:text-emerald-400"
                  : trend.value < 0
                  ? "text-rose-600 dark:text-rose-400"
                  : "text-slate-500"
              )}
            >
              {trend.value > 0 ? (
                <TrendingUp className="h-3.5 w-3.5" />
              ) : trend.value < 0 ? (
                <TrendingDown className="h-3.5 w-3.5" />
              ) : (
                <Minus className="h-3.5 w-3.5" />
              )}
              {trend.value > 0 ? `+${trend.value}%` : `${trend.value}%`}
            </span>
          )}
          {subtitle && (
            <span className="text-slate-500 dark:text-slate-400">
              {subtitle}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
