"use client";

import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Pencil, ToggleRight, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";
import { Pagination } from "@/components/ui/pagination";

// Định nghĩa các kiểu dữ liệu giống với AnnouncementForm
type AnnouncementFormValues = {
  location: string;
  message: string;
  isActive: boolean;
  expiresAt?: string;
  priority: number;
  subjectName?: string;
};

interface Announcement {
  _id: string;
  location: string;
  message: string;
  isActive: boolean;
  expiresAt: Date | null;
  priority: number;
  createdAt?: string;
  updatedAt?: string;
  subjectName?: string;
}

interface AnnouncementTableProps {
  announcements: Announcement[];
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  onUpdate: (id: string, data: AnnouncementFormValues) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  onEdit: (announcement: Announcement) => void;
  isLoading: boolean;
}

export default function AnnouncementTable({
  announcements,
  currentPage,
  totalPages,
  onPageChange,
  onUpdate,
  onDelete,
  onEdit,
  isLoading,
}: AnnouncementTableProps) {
  // Hàm chuyển đổi location sang dạng hiển thị thân thiện
  const getLocationDisplayName = (announcement: Announcement) => {
    const { location, subjectName } = announcement;

    if (location === "homepage_guest") {
      return "Trang chủ (khách)";
    }
    if (location === "homepage_authenticated") {
      return "Trang chủ (đã đăng nhập)";
    }
    if (location.startsWith("course/")) {
      return subjectName ? `Trang thi - ${subjectName}` : location;
    }

    return location;
  };

  return (
    <div className="space-y-4">
      <div className="border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[30%]">Vị trí</TableHead>
              <TableHead className="w-[30%] hidden md:table-cell">
                Nội dung
              </TableHead>
              <TableHead className="w-[15%] hidden md:table-cell">
                Trạng thái
              </TableHead>
              <TableHead className="w-[15%] hidden md:table-cell">
                Hết hạn
              </TableHead>
              <TableHead className="w-[10%]">Hành động</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {announcements.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="text-center py-8 text-gray-500"
                >
                  Không có thông báo nào
                </TableCell>
              </TableRow>
            ) : (
              announcements.map((announcement) => (
                <TableRow key={announcement._id}>
                  <TableCell className="font-medium">
                    {getLocationDisplayName(announcement)}
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    <div
                      style={{
                        display: "-webkit-box",
                        WebkitLineClamp: 3,
                        WebkitBoxOrient: "vertical",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        maxHeight: "4.5em", // khoảng 3 dòng với font-size mặc định
                      }}
                      dangerouslySetInnerHTML={{ __html: announcement.message }}
                    />
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    <Badge
                      variant={
                        announcement.isActive ? "success" : "destructive"
                      }
                    >
                      {announcement.isActive ? "Hoạt động" : "Không hoạt động"}
                    </Badge>
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    {announcement.expiresAt
                      ? formatDate(new Date(announcement.expiresAt))
                      : "Không có"}
                  </TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      {/* thay đổi trạng thái */}
                      <Button
                        variant={
                          announcement.isActive ? "outline" : "secondary"
                        }
                        size="icon"
                        title={
                          announcement.isActive
                            ? "Chuyển sang Không hoạt động"
                            : "Chuyển sang Hoạt động"
                        }
                        onClick={() => {
                          onUpdate(announcement._id, {
                            location: announcement.location,
                            message: announcement.message,
                            priority: announcement.priority,
                            isActive: !announcement.isActive,
                            expiresAt: announcement.expiresAt
                              ? typeof announcement.expiresAt === "string"
                                ? announcement.expiresAt
                                : announcement.expiresAt.toISOString()
                              : undefined,
                            subjectName: announcement.subjectName,
                          });
                        }}
                      >
                        {announcement.isActive ? (
                          <ToggleRight className="h-4 w-4 text-green-500" />
                        ) : (
                          <ToggleRight className="h-4 w-4 text-gray-400 rotate-180" />
                        )}
                      </Button>

                      {/* Nút chỉnh sửa */}
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => {
                          console.log("Editing announcement:", announcement);
                          onEdit(announcement);
                        }}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>

                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="outline" size="icon">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Xóa thông báo</AlertDialogTitle>
                            <AlertDialogDescription>
                              Bạn có chắc chắn muốn xóa thông báo này? Hành động
                              này không thể hoàn tác.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Hủy</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => onDelete(announcement._id)}
                              disabled={isLoading}
                            >
                              Xóa
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Always show pagination controls for consistency */}
      {totalPages > 0 && (
        <div className="space-y-4">
          <div className="flex justify-center">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={onPageChange}
            />
          </div>
        </div>
      )}
    </div>
  );
}
