"use client";

import { useState, useEffect, useCallback } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import AnnouncementTable from "./components/AnnouncementTable";
import AnnouncementForm, {
  AnnouncementFormValues,
} from "./components/AnnouncementForm";
import { API_BASE_URL } from "@/contants/api";
import { fetchApi } from "@/lib/api";
import { Loader2, Plus, AlertTriangle } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { CreateAnnouncementButton } from "./components/CreateAnnouncementButton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

// Định nghĩa interface Announcement
interface Announcement {
  _id: string;
  location: string;
  message: string;
  isActive: boolean;
  expiresAt: Date | null;
  priority: number;
  subjectName?: string;
  createdAt?: string;
  updatedAt?: string;
}

const filterSchema = z.object({
  search: z.string().optional(),
});

export default function AnnouncementsPage() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [filteredAnnouncements, setFilteredAnnouncements] = useState<
    Announcement[]
  >([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [showForm, setShowForm] = useState(false);
  const [editingAnnouncement, setEditingAnnouncement] =
    useState<Announcement | null>(null);
  const [itemsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");
  const [maintenanceOpen, setMaintenanceOpen] = useState(false);
  const [maintenanceMsg, setMaintenanceMsg] = useState(
    "⚠️ Hệ thống sẽ bảo trì sau 3 phút!"
  );
  const [maintenanceDuration, setMaintenanceDuration] = useState(3);
  const [maintenanceLoading, setMaintenanceLoading] = useState(false);
  const { toast } = useToast();

  const filterForm = useForm<z.infer<typeof filterSchema>>({
    resolver: zodResolver(filterSchema),
    defaultValues: {
      search: "",
    },
  });

  const fetchAnnouncements = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetchApi(`/announcements?page=${currentPage}&limit=${itemsPerPage}`
      );

      if (!response.ok) {
        throw new Error("Không thể tải danh sách thông báo");
      }

      const data = await response.json();

      // Handle API response - tách rõ ràng
      const announcementsData = Array.isArray(data.data)
        ? data.data
        : data.data?.announcements || [];

      // Get pagination data - API should return pagination object
      // Kiểm tra cả data.data.pagination và data.pagination
      const paginationInfo = data.data?.pagination || data.pagination || {};
      const totalItems = paginationInfo.total || announcementsData.length;
      const totalPagesFromAPI = paginationInfo.totalPages;
      const totalPagesCalculated = totalPagesFromAPI
        ? totalPagesFromAPI
        : Math.ceil(totalItems / itemsPerPage);

      setAnnouncements(announcementsData);
      setFilteredAnnouncements(announcementsData);
      setTotalCount(totalItems);
      setTotalPages(Math.max(1, totalPagesCalculated));

      console.log("✅ Fetched announcements:", {
        announcementCount: announcementsData.length,
        paginationFromAPI: paginationInfo,
        totalItems,
        totalPagesCalculated,
        currentPage,
      });
    } catch (error) {
      console.error("❌ Lỗi khi tải danh sách thông báo:", error);
      toast({
        title: "Lỗi",
        description: "Không thể tải danh sách thông báo. Vui lòng thử lại.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [currentPage, itemsPerPage, toast]);

  useEffect(() => {
    fetchAnnouncements();
  }, [fetchAnnouncements, refreshKey]);

  const handleFilter = (values: z.infer<typeof filterSchema>) => {
    const term = values.search?.toLowerCase() || "";
    setSearchTerm(term);
    setCurrentPage(1); // Reset to page 1 when filter changes

    if (!term) {
      setFilteredAnnouncements(announcements);
      return;
    }

    const filtered = announcements.filter(
      (announcement) =>
        announcement.location.toLowerCase().includes(term) ||
        announcement.message.toLowerCase().includes(term) ||
        (announcement.subjectName &&
          announcement.subjectName.toLowerCase().includes(term))
    );

    setFilteredAnnouncements(filtered);
  };

  // Update filtered announcements when announcements change (after new fetch)
  useEffect(() => {
    if (!searchTerm) {
      setFilteredAnnouncements(announcements);
      return;
    }

    const filtered = announcements.filter(
      (announcement) =>
        announcement.location.toLowerCase().includes(searchTerm) ||
        announcement.message.toLowerCase().includes(searchTerm) ||
        (announcement.subjectName &&
          announcement.subjectName.toLowerCase().includes(searchTerm))
    );

    setFilteredAnnouncements(filtered);
  }, [announcements, searchTerm]);

  const handlePageChange = (page: number) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
    // Scroll to top
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleCreateAnnouncement = async (data: AnnouncementFormValues) => {
    setActionLoading(true);
    try {
      const response = await fetchApi(`/announcements`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error("Không thể tạo thông báo");
      }

      toast({
        title: "Thành công",
        description: "Thông báo đã được tạo thành công",
      });

      // Refresh data - reset to page 1
      setCurrentPage(1);
      setRefreshKey((prev) => prev + 1);
      // Hide form after successful creation
      setShowForm(false);
    } catch (error) {
      console.error("Lỗi khi tạo thông báo:", error);
      toast({
        title: "Lỗi",
        description: "Không thể tạo thông báo. Vui lòng thử lại.",
        variant: "destructive",
      });
    } finally {
      setActionLoading(false);
    }
  };

  const handleUpdateAnnouncement = async (
    id: string,
    data: AnnouncementFormValues
  ) => {
    setActionLoading(true);
    try {
      const response = await fetchApi(`/announcements/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error("Không thể cập nhật thông báo");
      }

      toast({
        title: "Thành công",
        description: "Thông báo đã được cập nhật thành công",
      });

      // Refresh data
      setRefreshKey((prev) => prev + 1);
      // Reset editing state
      setEditingAnnouncement(null);
      setShowForm(false);
    } catch (error) {
      console.error("Lỗi khi cập nhật thông báo:", error);
      toast({
        title: "Lỗi",
        description: "Không thể cập nhật thông báo. Vui lòng thử lại.",
        variant: "destructive",
      });
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteAnnouncement = async (id: string) => {
    setActionLoading(true);
    try {
      const response = await fetchApi(`/announcements/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Không thể xóa thông báo");
      }

      toast({
        title: "Thành công",
        description: "Thông báo đã được xóa thành công",
      });

      // Refresh data
      setRefreshKey((prev) => prev + 1);
      // If we were editing the announcement that was deleted, reset the form
      if (editingAnnouncement && editingAnnouncement._id === id) {
        setEditingAnnouncement(null);
        setShowForm(false);
      }
    } catch (error) {
      console.error("Lỗi khi xóa thông báo:", error);
      toast({
        title: "Lỗi",
        description: "Không thể xóa thông báo. Vui lòng thử lại.",
        variant: "destructive",
      });
    } finally {
      setActionLoading(false);
    }
  };

  const toggleCreateForm = () => {
    // If we're editing, reset to create mode
    if (editingAnnouncement) {
      setEditingAnnouncement(null);
    }
    setShowForm(!showForm);
  };

  const handleEditAnnouncement = (announcement: Announcement) => {
    // Set the announcement to edit
    setEditingAnnouncement(announcement);
    // Show the form if it's not already visible
    setShowForm(true);
    // Scroll to the form
    window.scrollTo({ top: 0, behavior: "smooth" });
    // Debug log
    console.log("handleEditAnnouncement - announcement:", announcement);
  };

  const handleCancelEdit = () => {
    setEditingAnnouncement(null);
    setShowForm(false);
  };

  const getFormTitle = () => {
    if (editingAnnouncement) {
      return "Chỉnh sửa thông báo";
    }
    return "Tạo thông báo mới";
  };

  // Gửi thông báo bảo trì tức thì cho app client
  const handleBroadcastMaintenance = async () => {
    setMaintenanceLoading(true);
    try {
      const res = await fetch("http://localhost:5000/api/admin/broadcast-maintenance", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-admin-key": "adm_broadcast_k3y_2026",
        },
        body: JSON.stringify({
          message: maintenanceMsg,
          duration: maintenanceDuration,
        }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || "Gửi thông báo bảo trì thất bại");
      }

      toast({
        title: "✅ Đã gửi thông báo bảo trì",
        description: `Người dùng sẽ thấy cảnh báo bảo trì trong ${maintenanceDuration} phút.`,
      });
      setMaintenanceOpen(false);
    } catch (error: unknown) {
      console.error("Broadcast maintenance error:", error);
      toast({
        title: "Lỗi",
        description: error instanceof Error ? error.message : "Không thể gửi thông báo bảo trì.",
        variant: "destructive",
      });
    } finally {
      setMaintenanceLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-10 space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Quản lý thông báo</h1>
        <div className="flex gap-2">
          {/* Nút thông báo bảo trì */}
          <Dialog open={maintenanceOpen} onOpenChange={setMaintenanceOpen}>
            <DialogTrigger asChild>
              <Button variant="destructive" className="gap-2">
                <AlertTriangle className="h-4 w-4" />
                Thông báo bảo trì
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[480px]">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2 text-destructive">
                  <AlertTriangle className="h-5 w-5" />
                  Gửi thông báo bảo trì
                </DialogTitle>
                <DialogDescription>
                  Thông báo sẽ được gửi <strong>ngay lập tức</strong> tới tất cả
                  người dùng đang sử dụng app.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-2">
                <div className="space-y-2">
                  <Label htmlFor="maintenance-msg">Nội dung thông báo</Label>
                  <Textarea
                    id="maintenance-msg"
                    value={maintenanceMsg}
                    onChange={(e) => setMaintenanceMsg(e.target.value)}
                    rows={3}
                    placeholder="Nhập nội dung thông báo bảo trì..."
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="maintenance-duration">
                    Thời gian đếm ngược (phút)
                  </Label>
                  <Input
                    id="maintenance-duration"
                    type="number"
                    min={1}
                    max={60}
                    value={maintenanceDuration}
                    onChange={(e) =>
                      setMaintenanceDuration(Number(e.target.value) || 1)
                    }
                  />
                  <p className="text-xs text-muted-foreground">
                    Sau {maintenanceDuration} phút, hệ thống sẽ bắt đầu bảo trì.
                  </p>
                </div>
              </div>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setMaintenanceOpen(false)}
                  disabled={maintenanceLoading}
                >
                  Hủy
                </Button>
                <Button
                  variant="destructive"
                  onClick={handleBroadcastMaintenance}
                  disabled={maintenanceLoading || !maintenanceMsg.trim()}
                  className="gap-2"
                >
                  {maintenanceLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <AlertTriangle className="h-4 w-4" />
                  )}
                  Gửi ngay
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {editingAnnouncement ? (
            <Button
              onClick={handleCancelEdit}
              variant="outline"
            >
              Hủy chỉnh sửa
            </Button>
          ) : (
            <CreateAnnouncementButton onClick={toggleCreateForm} />
          )}
        </div>
      </div>

      {showForm && (
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>{getFormTitle()}</CardTitle>
          </CardHeader>
          <CardContent>
            <AnnouncementForm
              defaultValues={
                editingAnnouncement
                  ? {
                      ...editingAnnouncement,
                      id: editingAnnouncement._id,
                    }
                  : undefined
              }
              onSubmit={
                editingAnnouncement
                  ? (data) =>
                      handleUpdateAnnouncement(editingAnnouncement._id, data)
                  : handleCreateAnnouncement
              }
              isLoading={actionLoading}
              isEditing={!!editingAnnouncement}
              onClose={
                editingAnnouncement
                  ? handleCancelEdit
                  : () => setShowForm(false)
              }
            />
          </CardContent>
        </Card>
      )}

      <div className="w-full">
        <div className="flex items-center mb-4 space-x-2">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              filterForm.handleSubmit(handleFilter)();
            }}
            className="flex w-full max-w-sm items-center space-x-2"
          >
            <Input
              placeholder="Tìm kiếm theo vị trí, nội dung hoặc môn học..."
              {...filterForm.register("search")}
              onChange={(e) => {
                const value = e.target.value;
                filterForm.setValue("search", value);
                // Call filter handler immediately as user types
                handleFilter({ search: value });
              }}
            />
            <Button type="submit">Tìm kiếm</Button>
          </form>
        </div>

        {loading ? (
          <div className="w-full flex justify-center p-8">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        ) : (
          <>
            {/* Pagination Info */}
            {totalPages > 0 && (
              <div className="mb-4 text-sm text-muted-foreground">
                <span>
                  Hiển thị: <strong>{filteredAnnouncements.length}</strong>{" "}
                  thông báo | Trang <strong>{currentPage}</strong> /{" "}
                  <strong>{totalPages}</strong> | Tổng cộng:{" "}
                  <strong>{totalCount}</strong> thông báo
                </span>
              </div>
            )}

            <AnnouncementTable
              announcements={filteredAnnouncements}
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
              onUpdate={handleUpdateAnnouncement}
              onDelete={handleDeleteAnnouncement}
              isLoading={actionLoading}
              onEdit={handleEditAnnouncement}
            />
          </>
        )}
      </div>
    </div>
  );
}
