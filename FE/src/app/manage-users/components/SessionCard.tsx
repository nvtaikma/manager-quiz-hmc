"use client";

import React, { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Clock, ChevronDown, ChevronUp, Wifi, WifiOff } from "lucide-react";

// ─────────────────────────────────────────────
// Types (mirror từ BE/src/types/activity.types.ts)
// ─────────────────────────────────────────────

export interface ActivitySession {
  startTime: string;       // ISO string
  endTime: string | null;  // null = đang online
  durationMs: number;
  durationMinutes: number;
  status: "online" | "offline";
  rawActivities: string[];
}

// ─────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────

const toVNTime = (isoStr: string): string =>
  new Intl.DateTimeFormat("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Asia/Ho_Chi_Minh",
  }).format(new Date(isoStr));

const formatDuration = (minutes: number): string => {
  if (minutes < 60) return `${minutes} phút`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m > 0 ? `${h} giờ ${m} phút` : `${h} giờ`;
};

// ─────────────────────────────────────────────
// SessionCard Component
// ─────────────────────────────────────────────

interface SessionCardProps {
  session: ActivitySession;
  index: number;
}

export function SessionCard({ session, index }: SessionCardProps) {
  const [expanded, setExpanded] = useState(false);
  const isOnline = session.status === "online";

  return (
    <div className={`rounded-lg border bg-white transition-all ${isOnline ? "border-green-200 bg-green-50/30" : "border-gray-200"}`}>
      {/* Header */}
      <div className="flex items-center gap-3 p-3">
        {/* Timeline dot + line */}
        <div className="flex flex-col items-center flex-shrink-0">
          <div
            className={`w-3 h-3 rounded-full flex-shrink-0 ${
              isOnline ? "bg-green-500 ring-2 ring-green-200 animate-pulse" : "bg-gray-400"
            }`}
          />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            {/* Online/Offline Badge */}
            <Badge
              variant={isOnline ? "default" : "secondary"}
              className={`text-xs px-2 py-0 ${
                isOnline
                  ? "bg-green-500 hover:bg-green-500 text-white"
                  : "bg-gray-100 text-gray-600"
              }`}
            >
              {isOnline ? (
                <><Wifi className="w-3 h-3 mr-1" />Đang online</>
              ) : (
                <><WifiOff className="w-3 h-3 mr-1" />Offline</>
              )}
            </Badge>

            {/* Session number */}
            <span className="text-xs text-muted-foreground">Phiên {index + 1}</span>
          </div>

          {/* Time range */}
          <div className="flex items-center gap-1 mt-1">
            <Clock className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
            <span className="text-sm font-mono">
              {toVNTime(session.startTime)}
            </span>
            <span className="text-muted-foreground text-sm">→</span>
            <span className="text-sm font-mono">
              {session.endTime ? toVNTime(session.endTime) : "Đang hoạt động..."}
            </span>
            <span className="text-xs text-muted-foreground ml-1">
              ({formatDuration(session.durationMinutes)})
            </span>
          </div>
        </div>

        {/* Expand button */}
        {session.rawActivities.length > 0 && (
          <button
            onClick={() => setExpanded(!expanded)}
            className="text-muted-foreground hover:text-foreground transition-colors flex-shrink-0 p-1 rounded"
            title={expanded ? "Thu gọn" : "Xem chi tiết"}
          >
            {expanded ? (
              <ChevronUp className="w-4 h-4" />
            ) : (
              <ChevronDown className="w-4 h-4" />
            )}
          </button>
        )}
      </div>

      {/* Expanded: raw activities timeline */}
      {expanded && (
        <div className="border-t border-dashed border-gray-200 px-3 pb-3 pt-2">
          <p className="text-xs text-muted-foreground mb-2">
            {session.rawActivities.length} lần ghi nhận:
          </p>
          <div className="flex flex-wrap gap-1.5">
            {session.rawActivities.map((ts, i) => (
              <span
                key={i}
                className="inline-flex items-center gap-1 text-xs font-mono bg-gray-100 rounded px-2 py-0.5"
              >
                <div className="w-1.5 h-1.5 rounded-full bg-blue-400" />
                {toVNTime(ts)}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
