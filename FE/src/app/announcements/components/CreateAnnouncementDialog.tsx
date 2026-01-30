"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Plus } from "lucide-react";
import AnnouncementForm, { AnnouncementFormValues } from "./AnnouncementForm";

interface CreateAnnouncementDialogProps {
  onCreateAnnouncement: (data: AnnouncementFormValues) => Promise<void>;
  isLoading: boolean;
}

export function CreateAnnouncementDialog({
  onCreateAnnouncement,
  isLoading,
}: CreateAnnouncementDialogProps) {
  const [open, setOpen] = useState(false);

  const handleSubmit = async (data: AnnouncementFormValues) => {
    await onCreateAnnouncement(data);
    setOpen(false);
  };

  const handleClose = () => {
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="w-full">
          <Plus className="h-4 w-4 mr-2" />
          Tạo thông báo mới
        </Button>
      </DialogTrigger>
      <DialogContent
        className="max-w-6xl max-h-[80vh] overflow-y-auto"
        onPointerDownOutside={(e) => {
          // Lấy phần tử được click
          const target = e.target as HTMLElement;
          // Kiểm tra xem nó có nằm trong UI của TinyMCE không
          // .tox-tinymce-aux là class chung cho các dialog phụ của TinyMCE
          if (target.closest(".tox-tinymce-aux")) {
            // Nếu có, ngăn hành vi mặc định của Dialog (là đóng modal)
            e.preventDefault();
          }
        }}
      >
        <DialogHeader>
          <DialogTitle>Tạo thông báo mới</DialogTitle>
        </DialogHeader>
        <AnnouncementForm
          onSubmit={handleSubmit}
          isLoading={isLoading}
          onClose={handleClose}
        />
      </DialogContent>
    </Dialog>
  );
}
