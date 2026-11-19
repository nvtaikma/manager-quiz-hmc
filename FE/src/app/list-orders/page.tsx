"use client";

import { useState, useEffect, useCallback, Suspense, ReactNode } from "react";
import { Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Order, SortConfig } from "@/app/list-orders/components/types";
import { OrderTable } from "./components/OrderTable";
import { Pagination } from "@/components/ui/pagination";
import { useRouter, useSearchParams } from "next/navigation";
import { API_BASE_URL } from "@/contants/api";
import { fetchApi } from "@/lib/api";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

// Loading component
const LoadingSpinner = () => (
  <div className="flex items-center justify-center h-screen">
    <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-gray-900"></div>
  </div>
);

export default function ListOrders() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <OrdersContent />
    </Suspense>
  );
}

function OrdersContent(): ReactNode {
  const router = useRouter();
  const searchParams = useSearchParams();
  const page = searchParams.get("page");
  const productId = searchParams.get("productId");
  const userId = searchParams.get("userId");
  const statusFromUrl = searchParams.get("status") || "all";
  const searchFromUrl = searchParams.get("search") || "";

  const [productName, setProductName] = useState<string>("");
  const [userName, setUserName] = useState<string>("");

  const [orders, setOrders] = useState<Order[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  // Filter states
  const [searchTerm, setSearchTerm] = useState(searchFromUrl);
  const [appliedSearch, setAppliedSearch] = useState(searchFromUrl);
  const [statusFilter, setStatusFilter] = useState(statusFromUrl);

  const [sortConfig, setSortConfig] = useState<SortConfig | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(parseInt(page || "1"));
  const [totalPages, setTotalPages] = useState(1);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [pendingOrderId, setPendingOrderId] = useState<string | null>(null);
  const [shouldDeleteStudent, setShouldDeleteStudent] = useState(false);

  useEffect(() => {
    const pageFromUrl = parseInt(page || "1");
    setCurrentPage(pageFromUrl);
  }, [page]);

  useEffect(() => {
    const sFromUrl = searchParams.get("status") || "all";
    setStatusFilter(sFromUrl);
    const qFromUrl = searchParams.get("search") || "";
    setSearchTerm(qFromUrl);
    setAppliedSearch(qFromUrl);
  }, [searchParams]);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const url = new URL(`${API_BASE_URL}/orders/list`);
      url.searchParams.append("page", currentPage.toString());
      if (productId) {
        url.searchParams.append("productId", productId);
      }
      if (userId) {
        url.searchParams.append("userId", userId);
      }
      if (statusFilter && statusFilter !== "all") {
        url.searchParams.append("status", statusFilter);
      }
      if (appliedSearch.trim()) {
        url.searchParams.append("search", appliedSearch.trim());
      }

      // Extract the endpoint path from the url object
      const endpoint = url.pathname.replace("/api", "") + url.search;
      const response = await fetchApi(endpoint);

      if (!response.ok) throw new Error("Không thể tải danh sách đơn hàng");

      const data = await response.json();
      const rawOrders = data.data.orders || [];
      setOrders(rawOrders);
      setTotalPages(data.data.pagination?.totalPages || 1);
    } catch (error: unknown) {
      console.error("Lỗi khi tải danh sách đơn hàng:", error);
      setError("Không thể tải danh sách đơn hàng. Vui lòng thử lại sau.");
    } finally {
      setLoading(false);
    }
  }, [currentPage, productId, userId, statusFilter, appliedSearch]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Client sort on current page orders
  useEffect(() => {
    if (!sortConfig) {
      setFilteredOrders(orders);
      return;
    }
    const sorted = [...orders].sort((a, b) => {
      let valA: any = a[sortConfig.key] ?? "";
      let valB: any = b[sortConfig.key] ?? "";
      if (sortConfig.key === "customer") {
        valA = a.customer?.name ?? "";
        valB = b.customer?.name ?? "";
      }
      const compareResult = valA < valB ? -1 : valA > valB ? 1 : 0;
      return sortConfig.direction === "ascending"
        ? compareResult
        : -compareResult;
    });
    setFilteredOrders(sorted);
  }, [orders, sortConfig]);

  useEffect(() => {
    if (productId) {
      fetchProductName();
    }
    if (userId) {
      fetchUserName();
    }
  }, [productId, userId]);

  const fetchProductName = async () => {
    try {
      const response = await fetchApi(`/products/${productId}`);
      if (!response.ok) throw new Error("Không thể tải thông tin sản phẩm");
      const data = await response.json();
      setProductName(data.data.name);
    } catch (error) {
      console.error("Lỗi khi tải thông tin sản phẩm:", error);
    }
  };

  const fetchUserName = async () => {
    try {
      const response = await fetchApi(`/customers/${userId}`);
      if (!response.ok) throw new Error("Không thể tải thông tin người dùng");
      const data = await response.json();
      setUserName(data.data.name);
    } catch (error) {
      console.error("Lỗi khi tải thông tin người dùng:", error);
    }
  };

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    // Nếu status là "cancelled", hiển thị dialog xác nhận
    if (newStatus === "cancelled") {
      setPendingOrderId(orderId);
      setShowCancelConfirm(true);
      return;
    }

    // Đối với các status khác, thực hiện cập nhật ngay
    await performOrderStatusUpdate(orderId, newStatus, false);
  };

  const performOrderStatusUpdate = async (
    orderId: string,
    newStatus: string,
    deleteStudent: boolean
  ) => {
    try {
      // Vì logic Backend tự động xử lý Thêm/Xóa/Sửa trạng thái Sinh viên từ order.service
      // (Bao hàm cả deleteStudent mặc định thông qua cancel order)
      // client chỉ việc cập nhật trạng thái Order:
      const response = await fetchApi(`/orders/${orderId}/status`, {
        method: "PATCH",
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Không thể cập nhật trạng thái đơn hàng");
      }

      // Cập nhật state UI một cách tối ưu
      setOrders((prevOrders) =>
        prevOrders.map((order) =>
          order._id === orderId ? { ...order, status: newStatus } : order
        )
      );

      setSelectedOrder((prev) =>
        prev?._id === orderId ? { ...prev, status: newStatus } : prev
      );
    } catch (error: any) {
      console.error("Lỗi khi cập nhật trạng thái đơn hàng:", error);
      alert(error.message || "Không thể cập nhật trạng thái đơn hàng. Vui lòng thử lại.");
    }
  };

  const handleCancelConfirm = async (deleteStudent: boolean) => {
    setShowCancelConfirm(false);
    if (pendingOrderId) {
      await performOrderStatusUpdate(
        pendingOrderId,
        "cancelled",
        deleteStudent
      );
      setPendingOrderId(null);
    }
  };

  const fetchOrderDetails = async (orderId: string) => {
    try {
      setDetailLoading(true);
      const response = await fetchApi(`/orders/id/${orderId}`);

      if (!response.ok) throw new Error("Không thể tải thông tin đơn hàng");

      const data = await response.json();
      setSelectedOrder(data.data[0]);
    } catch (error) {
      console.error("Lỗi khi tải thông tin đơn hàng:", error);
      setError("Không thể tải thông tin đơn hàng. Vui lòng thử lại.");
    } finally {
      setDetailLoading(false);
    }
  };

  const handleSort = (key: keyof Order) => {
    setSortConfig((prev) => ({
      key,
      direction:
        prev?.key === key && prev.direction === "ascending"
          ? "descending"
          : "ascending",
    }));
  };

  const handleStatusChange = (newStatus: string) => {
    setStatusFilter(newStatus);
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", "1");
    if (newStatus !== "all") {
      params.set("status", newStatus);
    } else {
      params.delete("status");
    }
    router.push(`?${params.toString()}`, { scroll: false });
    setCurrentPage(1);
  };

  const handleApplySearch = (keyword?: string) => {
    const clean = (keyword !== undefined ? keyword : searchTerm).trim();
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", "1");
    if (clean) {
      params.set("search", clean);
    } else {
      params.delete("search");
    }
    router.push(`?${params.toString()}`, { scroll: false });
    setCurrentPage(1);
    setAppliedSearch(clean);
  };

  const handlePageChange = useCallback(
    (newPage: number) => {
      const params = new URLSearchParams(searchParams.toString());
      params.set("page", newPage.toString());
      if (productId) {
        params.set("productId", productId);
      }
      if (userId) {
        params.set("userId", userId);
      }
      if (statusFilter && statusFilter !== "all") {
        params.set("status", statusFilter);
      } else {
        params.delete("status");
      }
      if (appliedSearch.trim()) {
        params.set("search", appliedSearch.trim());
      } else {
        params.delete("search");
      }
      router.push(`?${params.toString()}`);
    },
    [router, searchParams, productId, userId, statusFilter, appliedSearch]
  );

  const filterOrdersByUser = async (userId: string) => {
    try {
      setLoading(true);
      const params = new URLSearchParams(searchParams);
      params.set("userId", userId);
      params.delete("productId"); // Xóa productId nếu có
      params.set("page", "1");
      router.push(`?${params.toString()}`, { scroll: false });
      setCurrentPage(1);

      // Lấy tên người dùng
      const userResponse = await fetchApi(
        `/customers/id/${userId}`
      );
      if (userResponse.ok) {
        const userData = await userResponse.json();
        setUserName(userData.data.name);
      }
    } catch (error) {
      console.error("Lỗi khi lọc đơn hàng theo người dùng:", error);
      setError("Không thể lọc đơn hàng theo người dùng. Vui lòng thử lại sau.");
    } finally {
      setLoading(false);
    }
  };

  const handleViewAllOrders = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      params.set("page", "1");
      router.push(`?${params.toString()}`, { scroll: false });
      setUserName("");
      setProductName("");
      setSearchTerm("");
      setAppliedSearch("");
      setStatusFilter("all");
      setCurrentPage(1);
    } catch (error) {
      console.error("Lỗi khi tải danh sách đơn hàng:", error);
      setError("Không thể tải danh sách đơn hàng. Vui lòng thử lại sau.");
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <LoadingSpinner />;
  if (error) return <div className="p-6 text-red-500">{error}</div>;

  const statusTabs = [
    { value: "all", label: "Tất cả" },
    { value: "pending", label: "Đang chờ" },
    { value: "completed", label: "Hoàn thành" },
    { value: "cancelled", label: "Đã hủy" },
  ];

  return (
    <div className="p-0 md:p-6 space-y-5">
      <AlertDialog open={showCancelConfirm} onOpenChange={setShowCancelConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xác nhận hủy đơn hàng</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có muốn xóa học sinh khỏi hệ thống không?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => handleCancelConfirm(false)}>
              Không
            </AlertDialogCancel>
            <AlertDialogAction onClick={() => handleCancelConfirm(true)}>
              Có
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight">
            Danh sách đơn hàng
          </h2>
          {userName && (
            <div className="mt-2 flex items-center gap-2">
              <p className="text-sm text-muted-foreground">
                Đang xem đơn hàng của người dùng:{" "}
                <span className="font-medium">{userName}</span>
              </p>
              <Button variant="outline" size="sm" onClick={handleViewAllOrders}>
                Xem tất cả đơn hàng
              </Button>
            </div>
          )}
          {productName && (
            <div className="mt-2 flex items-center gap-2">
              <p className="text-sm text-muted-foreground">
                Đang xem đơn hàng cho sản phẩm:{" "}
                <span className="font-medium">{productName}</span>
              </p>
              <Button variant="outline" size="sm" onClick={handleViewAllOrders}>
                Xem tất cả đơn hàng
              </Button>
            </div>
          )}
        </div>
        {(productId || userId) && (
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleViewAllOrders}>
              Xem tất cả đơn hàng
            </Button>
          </div>
        )}
      </div>

      {/* Thanh Tabs trạng thái & Ô tìm kiếm trực tiếp qua API */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="grid grid-cols-4 sm:inline-flex items-center gap-1 rounded-lg bg-muted p-1 w-full sm:w-auto">
          {statusTabs.map((tab) => {
            const isActive = statusFilter === tab.value;
            return (
              <button
                key={tab.value}
                type="button"
                onClick={() => handleStatusChange(tab.value)}
                className={`px-2 sm:px-3.5 py-1.5 rounded-md text-xs sm:text-sm font-medium whitespace-nowrap text-center transition-all ${
                  isActive
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Tìm mã đơn, tên hoặc email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleApplySearch();
                }
              }}
              className="pl-9 pr-8"
            />
            {(searchTerm || appliedSearch) && (
              <button
                type="button"
                onClick={() => {
                  setSearchTerm("");
                  handleApplySearch("");
                }}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                title="Xóa tìm kiếm"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
          <Button
            type="button"
            variant="secondary"
            onClick={() => handleApplySearch()}
          >
            Tìm
          </Button>
        </div>
      </div>

      <Suspense fallback={<LoadingSpinner />}>
        <OrderTable
          filteredOrders={filteredOrders}
          sortConfig={sortConfig}
          handleSort={handleSort}
          updateOrderStatus={updateOrderStatus}
          fetchOrderDetails={fetchOrderDetails}
          selectedOrder={selectedOrder}
          detailLoading={detailLoading}
          onUserClick={filterOrdersByUser}
        />
      </Suspense>

      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={handlePageChange}
      />

      <Button
        onClick={() => {
          const params = new URLSearchParams(searchParams);
          params.set("page", currentPage.toString());
          router.push(`?${params.toString()}`, { scroll: false });
        }}
      >
        Làm mới danh sách đơn hàng
      </Button>
    </div>
  );
}
