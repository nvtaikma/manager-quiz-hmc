"use client";

import { useState, useEffect, useCallback, Suspense, ReactNode } from "react";
import { Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DateRange } from "react-day-picker";
import { Order, Product, SortConfig } from "@/app/list-orders/components/types";
import { OrderFilters } from "./components/OrderFilters";
import { OrderTable } from "./components/OrderTable";
import { Pagination } from "@/components/ui/pagination";
import { useRouter, useSearchParams } from "next/navigation";
import { API_BASE_URL } from "@/contants/api";
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
  const [productName, setProductName] = useState<string>("");
  const [userName, setUserName] = useState<string>("");

  const [orders, setOrders] = useState<Order[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortConfig, setSortConfig] = useState<SortConfig | null>(null);
  const [dateRange, setDateRange] = useState<DateRange | undefined>();
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(parseInt(page || "1"));
  const [totalPages, setTotalPages] = useState(1);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [pendingOrderId, setPendingOrderId] = useState<string | null>(null);
  const [shouldDeleteStudent, setShouldDeleteStudent] = useState(false);

  // Sử dụng useMemo để cache kết quả filter và sort
  const filterAndSortOrders = useCallback(() => {
    let result = orders;

    // Thực hiện filter và sort trong một lần lặp duy nhất
    result = result.filter((order) => {
      const matchesSearch =
        !searchTerm ||
        order._id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.customer.email.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus =
        statusFilter === "all" || order.status === statusFilter;

      const matchesDate =
        !dateRange?.from ||
        !dateRange?.to ||
        (new Date(order.orderDate) >= dateRange.from &&
          new Date(order.orderDate) <= dateRange.to);

      return matchesSearch && matchesStatus && matchesDate;
    });

    // Sort nếu cần
    if (sortConfig) {
      result.sort((a, b) => {
        const compareResult = a[sortConfig.key] < b[sortConfig.key] ? -1 : 1;
        return sortConfig.direction === "ascending"
          ? compareResult
          : -compareResult;
      });
    }

    setFilteredOrders(result);
  }, [orders, searchTerm, statusFilter, sortConfig, dateRange]);

  useEffect(() => {
    const pageFromUrl = parseInt(page || "1");
    setCurrentPage(pageFromUrl);
  }, [page]);

  useEffect(() => {
    const abortController = new AbortController();
    const fetchData = async () => {
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
        const response = await fetch(url.toString(), {
          signal: abortController.signal,
        });
        if (!response.ok) throw new Error("Không thể tải danh sách đơn hàng");

        const data = await response.json();
        setOrders(data.data.orders || []);
        setTotalPages(data.data.pagination.totalPages);
      } catch (error: unknown) {
        if (error instanceof Error && error.name === "AbortError") return;
        console.error("Lỗi khi tải danh sách đơn hàng:", error);
        setError("Không thể tải danh sách đơn hàng. Vui lòng thử lại sau.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    return () => abortController.abort();
  }, [currentPage, productId, userId]);

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
      const response = await fetch(`${API_BASE_URL}/products/id/${productId}`);
      if (!response.ok) throw new Error("Không thể tải thông tin sản phẩm");
      const data = await response.json();
      setProductName(data.data.name);
    } catch (error) {
      console.error("Lỗi khi tải thông tin sản phẩm:", error);
    }
  };

  const fetchUserName = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/customers/id/${userId}`);
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
      // lấy thông tin đơn hàng từ api
      const orderResponse = await fetch(`${API_BASE_URL}/orders/id/${orderId}`);
      if (!orderResponse.ok)
        throw new Error("Không thể tải thông tin đơn hàng");
      const orderData = await orderResponse.json();
      const order = orderData.data[0];
      console.log(order);
      const EmailCustomer = order.customer.email;
      const product = order.products;

      // Nếu status là cancelled và người dùng chọn xóa học sinh
      if (newStatus === "cancelled" && deleteStudent) {
        product.forEach(async (product: Product) => {
          const deleteStudentResponse = await fetch(
            `${API_BASE_URL}/students/delete/${product._id}/${EmailCustomer}`,
            {
              method: "DELETE",
            }
          );
          if (!deleteStudentResponse.ok)
            throw new Error("Không thể xóa học sinh khỏi sản phẩm");
        });
      }

      // SỬA ĐỔI PHẦN XỬ LÝ newStatus === "completed" HOẶC "pending"
      else if (newStatus === "completed" || newStatus === "pending") {
        // Xác định trạng thái student cần cập nhật/thêm mới
        const studentStatus =
          newStatus === "completed" ? "completed" : "pending";

        // Sử dụng Promise.all để xử lý song song nhiều sản phẩm
        const studentPromises = product.map(async (product: Product) => {
          // 1. Kiểm tra sự tồn tại của sinh viên
          const checkUrl = `${API_BASE_URL}/students/check/${product._id}/${EmailCustomer}`;
          const checkStudentResponse = await fetch(checkUrl);
          const checkStudentData = await checkStudentResponse.json();

          // 2. Nếu sinh viên đã tồn tại (checkStudentData.data có dữ liệu)
          if (checkStudentData.data) {
            // Lấy ID của Student record (giả sử API check trả về ID hoặc đối tượng student)
            const studentId = checkStudentData.data._id;

            // THỰC HIỆN CẬP NHẬT TRẠNG THÁI SANG studentStatus
            const updateStudentResponse = await fetch(
              `${API_BASE_URL}/students/${studentId}/status`,
              {
                method: "PATCH", // Hoặc PUT, tùy thuộc vào API endpoint của bạn
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ status: studentStatus }),
              }
            );

            if (!updateStudentResponse.ok) {
              throw new Error(
                `[Student] Cập nhật học sinh thất bại cho sản phẩm ${product._id}`
              );
            }
          }
          // 3. Nếu sinh viên CHƯA tồn tại (checkStudentData.data là null/false)
          else {
            // THỰC HIỆN THÊM MỚI
            const addStudentResponse = await fetch(
              `${API_BASE_URL}/students/`,
              {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  email: EmailCustomer,
                  productId: product._id,
                  status: studentStatus, // Thêm với status là 'pending'
                }),
              }
            );
            if (!addStudentResponse.ok) {
              throw new Error(
                `[Student] Thêm học sinh thất bại cho sản phẩm ${product._id}`
              );
            }
          }
        });

        await Promise.all(studentPromises);
      }
      // cập nhật trạng thái đơn hàng
      const response = await fetch(`${API_BASE_URL}/orders/${orderId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok)
        throw new Error("Không thể cập nhật trạng thái đơn hàng");

      // Cập nhật state một cách tối ưu
      setOrders((prevOrders) =>
        prevOrders.map((order) =>
          order._id === orderId ? { ...order, status: newStatus } : order
        )
      );

      setSelectedOrder((prev) =>
        prev?._id === orderId ? { ...prev, status: newStatus } : prev
      );
    } catch (error) {
      console.error("Lỗi khi cập nhật trạng thái đơn hàng:", error);
      setError("Không thể cập nhật trạng thái đơn hàng. Vui lòng thử lại.");
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
      const response = await fetch(`${API_BASE_URL}/orders/id/${orderId}`);

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

  const clearFilters = useCallback(() => {
    setSearchTerm("");
    setStatusFilter("all");
    setDateRange(undefined);
  }, []);

  const handlePageChange = useCallback(
    (page: number) => {
      const params = new URLSearchParams(searchParams);
      params.set("page", page.toString());
      if (productId) {
        params.set("productId", productId);
      }
      if (userId) {
        params.set("userId", userId);
      }
      router.push(`?${params.toString()}`);
    },
    [router, searchParams, productId, userId]
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
      const userResponse = await fetch(
        `${API_BASE_URL}/customers/id/${userId}`
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
      const params = new URLSearchParams(searchParams);
      params.delete("userId");
      params.delete("productId");
      params.set("page", "1");
      router.push(`?${params.toString()}`, { scroll: false });
      setUserName("");
      setProductName("");
      setCurrentPage(1);
    } catch (error) {
      console.error("Lỗi khi tải danh sách đơn hàng:", error);
      setError("Không thể tải danh sách đơn hàng. Vui lòng thử lại sau.");
    } finally {
      setLoading(false);
    }
  };

  // Thêm useEffect để xử lý filter và sort
  useEffect(() => {
    filterAndSortOrders();
  }, [filterAndSortOrders]);

  if (loading) return <LoadingSpinner />;
  if (error) return <div className="p-6 text-red-500">{error}</div>;

  return (
    <div className="p-0 md:p-6 space-y-6">
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
          <h2 className="text-3xl font-bold tracking-tight">
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
        <div className="flex gap-2">
          {(productId || userId) && (
            <Button variant="outline" onClick={handleViewAllOrders}>
              Xem tất cả đơn hàng
            </Button>
          )}
          <Button
            onClick={() => setIsFilterOpen(!isFilterOpen)}
            variant="outline"
          >
            <Filter className="mr-2 h-4 w-4" />
            {isFilterOpen ? "Ẩn bộ lọc" : "Hiện bộ lọc"}
          </Button>
        </div>
      </div>

      {isFilterOpen && (
        <OrderFilters
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          statusFilter={statusFilter}
          setStatusFilter={setStatusFilter}
          dateRange={dateRange}
          setDateRange={setDateRange}
          clearFilters={clearFilters}
          onClose={() => setIsFilterOpen(false)}
        />
      )}

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
