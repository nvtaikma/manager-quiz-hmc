"use client";

import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

interface CreateAnnouncementButtonProps {
  onClick: () => void;
  className?: string;
}

export function CreateAnnouncementButton({
  onClick,
  className,
}: CreateAnnouncementButtonProps) {
  return (
    <Button
      onClick={onClick}
      className={className || "w-full sm:w-auto text-xs sm:text-sm px-2.5 sm:px-4 gap-1.5 sm:gap-2"}
    >
      <Plus className="h-4 w-4 shrink-0" />
      <span className="truncate">Tạo thông báo mới</span>
    </Button>
  );
}
