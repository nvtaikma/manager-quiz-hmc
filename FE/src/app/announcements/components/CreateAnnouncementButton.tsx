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
    <Button onClick={onClick} className={className || "w-full"}>
      <Plus className="h-4 w-4 mr-2" />
      Tạo thông báo mới
    </Button>
  );
}
