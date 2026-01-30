"use client";

import { useState, useEffect, useCallback } from "react";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import {
  Dialog,
  DialogContent,
  DialogTrigger,
  DialogTitle,
} from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ChevronUp, ChevronDown, Search, Calendar, Filter } from "lucide-react";
import { DateRange } from "react-day-picker";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { Card, CardContent } from "@/components/ui/card";
import { API_BASE_URL } from "@/contants/api";

interface Product {
  _id: string;
  name: string;
  type: string;
  amount: number;
}

interface Customer {
  name: string;
  email: string;
  avatar: string;
}

interface Order {
  _id: string;
  status: string;
  orderDate: string;
  totalAmount: number;
  customer: Customer;
  products: Product[];
}

export default function ListOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortConfig, setSortConfig] = useState<{
    key: keyof Order;
    direction: "ascending" | "descending";
  } | null>(null);
  const [dateRange, setDateRange] = useState<DateRange | undefined>();
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  useEffect(() => {
    fetchOrders();
  }, []);

  const filterAndSortOrders = useCallback(() => {
    let result = orders;

    // Filter by search term
    if (searchTerm) {
      result = result.filter(
        (order) =>
          order._id.toLowerCase().includes(searchTerm.toLowerCase()) ||
          order.customer.name
            .toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          order.customer.email.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by status
    if (statusFilter !== "all") {
      result = result.filter((order) => order.status === statusFilter);
    }

    // Filter by date range
    if (dateRange?.from && dateRange?.to) {
      result = result.filter((order) => {
        const orderDate = new Date(order.orderDate);
        const from = dateRange.from!;
        const to = dateRange.to!;
        return orderDate >= from && orderDate <= to;
      });
    }

    // Sort
    if (sortConfig !== null) {
      result.sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) {
          return sortConfig.direction === "ascending" ? -1 : 1;
        }
        if (a[sortConfig.key] > b[sortConfig.key]) {
          return sortConfig.direction === "ascending" ? 1 : -1;
        }
        return 0;
      });
    }

    setFilteredOrders(result);
  }, [orders, searchTerm, statusFilter, sortConfig, dateRange]);

  useEffect(() => {
    filterAndSortOrders();
  }, [filterAndSortOrders]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/orders/list`);
      if (!response.ok) {
        throw new Error("Không thể tải danh sách đơn hàng");
      }
      const data = await response.json();
      setOrders(data.data || []);
    } catch (error) {
      console.error("Lỗi khi tải danh sách đơn hàng:", error);
      setError("Không thể tải danh sách đơn hàng. Vui lòng thử lại sau.");
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/orders/${orderId}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: newStatus }),
      });
      if (!response.ok) {
        throw new Error("Không thể cập nhật trạng thái đơn hàng");
      }
      setOrders((prevOrders) =>
        prevOrders.map((order) =>
          order._id === orderId ? { ...order, status: newStatus } : order
        )
      );
      if (selectedOrder && selectedOrder._id === orderId) {
        setSelectedOrder({ ...selectedOrder, status: newStatus });
      }
    } catch (error) {
      console.error("Lỗi khi cập nhật trạng thái đơn hàng:", error);
      setError("Không thể cập nhật trạng thái đơn hàng. Vui lòng thử lại.");
    }
  };

  const fetchOrderDetails = async (orderId: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/orders/id/${orderId}`);
      if (!response.ok) {
        throw new Error("Không thể tải thông tin đơn hàng");
      }
      const data = await response.json();
      setSelectedOrder(data.data[0]);
    } catch (error) {
      console.error("Lỗi khi tải thông tin đơn hàng:", error);
      setError("Không thể tải thông tin đơn hàng. Vui lòng thử lại.");
    }
  };

  const handleSort = (key: keyof Order) => {
    let direction: "ascending" | "descending" = "ascending";
    if (
      sortConfig &&
      sortConfig.key === key &&
      sortConfig.direction === "ascending"
    ) {
      direction = "descending";
    }
    setSortConfig({ key, direction });
  };

  const clearFilters = () => {
    setSearchTerm("");
    setStatusFilter("all");
    setDateRange(undefined);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (error) {
    return <div className="p-6 text-red-500">{error}</div>;
  }

  return (
    <div className="p-4 md:p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl md:text-3xl font-semibold">
          Danh sách đơn hàng
        </h1>
        <Button
          onClick={() => setIsFilterOpen(!isFilterOpen)}
          variant="outline"
        >
          <Filter className="mr-2 h-4 w-4" />
          {isFilterOpen ? "Ẩn bộ lọc" : "Hiện bộ lọc"}
        </Button>
      </div>

      {isFilterOpen && (
        <Card>
          <CardContent className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="search">Tìm kiếm</Label>
                <div className="relative">
                  <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <Input
                    id="search"
                    placeholder="Mã đơn hàng, tên hoặc email"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-8"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="status-filter">Trạng thái</Label>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger id="status-filter">
                    <SelectValue placeholder="Chọn trạng thái" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tất cả</SelectItem>
                    <SelectItem value="pending">Đang chờ</SelectItem>
                    <SelectItem value="completed">Hoàn thành</SelectItem>
                    <SelectItem value="cancelled">Đã hủy</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Khoảng thời gian</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      id="date"
                      variant={"outline"}
                      className={`w-full justify-start text-left font-normal ${
                        !dateRange && "text-muted-foreground"
                      }`}
                    >
                      <Calendar className="mr-2 h-4 w-4" />
                      {dateRange?.from ? (
                        dateRange.to ? (
                          <>
                            {format(dateRange.from, "dd/MM/yyyy")} -{" "}
                            {format(dateRange.to, "dd/MM/yyyy")}
                          </>
                        ) : (
                          format(dateRange.from, "dd/MM/yyyy")
                        )
                      ) : (
                        <span>Chọn khoảng thời gian</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <CalendarComponent
                      initialFocus
                      mode="range"
                      defaultMonth={dateRange?.from}
                      selected={dateRange}
                      onSelect={setDateRange}
                      numberOfMonths={2}
                      locale={vi}
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
            <div className="mt-4 flex justify-end">
              <Button onClick={clearFilters} variant="outline" className="mr-2">
                Xóa bộ lọc
              </Button>
              <Button onClick={() => setIsFilterOpen(false)}>Áp dụng</Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="rounded-md border">
        <ScrollArea className="whitespace-nowrap">
          <Table className="w-full">
            <TableHeader>
              <TableRow>
                <TableHead
                  className="w-[100px] hidden md:table-cell cursor-pointer"
                  onClick={() => handleSort("_id")}
                >
                  Mã đơn hàng{" "}
                  {sortConfig?.key === "_id" &&
                    (sortConfig.direction === "ascending" ? (
                      <ChevronUp className="inline" />
                    ) : (
                      <ChevronDown className="inline" />
                    ))}
                </TableHead>
                <TableHead
                  className="cursor-pointer"
                  onClick={() => handleSort("customer")}
                >
                  Khách hàng{" "}
                  {sortConfig?.key === "customer" &&
                    (sortConfig.direction === "ascending" ? (
                      <ChevronUp className="inline" />
                    ) : (
                      <ChevronDown className="inline" />
                    ))}
                </TableHead>
                <TableHead
                  className="hidden md:table-cell cursor-pointer"
                  onClick={() => handleSort("orderDate")}
                >
                  Ngày đặt hàng{" "}
                  {sortConfig?.key === "orderDate" &&
                    (sortConfig.direction === "ascending" ? (
                      <ChevronUp className="inline" />
                    ) : (
                      <ChevronDown className="inline" />
                    ))}
                </TableHead>
                <TableHead
                  className="hidden md:table-cell cursor-pointer"
                  onClick={() => handleSort("status")}
                >
                  Trạng thái{" "}
                  {sortConfig?.key === "status" &&
                    (sortConfig.direction === "ascending" ? (
                      <ChevronUp className="inline" />
                    ) : (
                      <ChevronDown className="inline" />
                    ))}
                </TableHead>
                <TableHead
                  className="hidden md:table-cell cursor-pointer"
                  onClick={() => handleSort("totalAmount")}
                >
                  Tổng tiền{" "}
                  {sortConfig?.key === "totalAmount" &&
                    (sortConfig.direction === "ascending" ? (
                      <ChevronUp className="inline" />
                    ) : (
                      <ChevronDown className="inline" />
                    ))}
                </TableHead>
                <TableHead className="md:hidden">Ngày & Tổng tiền</TableHead>
                <TableHead className="text-right">Thao tác</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredOrders.map((order) => (
                <TableRow
                  key={order._id}
                  className={`${
                    order.status === "completed"
                      ? "bg-green-100"
                      : order.status === "cancelled"
                      ? "bg-red-100"
                      : ""
                  }`}
                >
                  <TableCell className="font-medium hidden md:table-cell">
                    {order._id}
                  </TableCell>
                  <TableCell>{order.customer?.name || "N/A"}</TableCell>
                  <TableCell className="hidden md:table-cell">
                    {format(new Date(order.orderDate), "dd/MM/yyyy HH:mm")}
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    <Select
                      value={order.status}
                      onValueChange={(value) =>
                        updateOrderStatus(order._id, value)
                      }
                    >
                      <SelectTrigger className="w-[50px] md:w-[120px]">
                        <SelectValue placeholder="Trạng thái" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pending">Đang chờ</SelectItem>
                        <SelectItem value="completed">Hoàn thành</SelectItem>
                        <SelectItem value="cancelled">Đã hủy</SelectItem>
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    {order.totalAmount.toLocaleString("vi-VN", {
                      style: "currency",
                      currency: "VND",
                    })}
                  </TableCell>
                  <TableCell className="md:hidden">
                    {format(new Date(order.orderDate), "dd/MM/yyyy HH:mm")}
                    <br />
                    {order.totalAmount.toLocaleString("vi-VN", {
                      style: "currency",
                      currency: "VND",
                    })}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end items-center space-x-2">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => fetchOrderDetails(order._id)}
                          >
                            Chi tiết
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[425px]">
                          <DialogTitle>Thông tin đơn hàng</DialogTitle>
                          <div className="text-sm text-muted-foreground">
                            {selectedOrder && (
                              <OrderInfo
                                order={selectedOrder}
                                updateOrderStatus={updateOrderStatus}
                              />
                            )}
                          </div>
                        </DialogContent>
                      </Dialog>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
      </div>
      <Button onClick={fetchOrders}>Làm mới danh sách đơn hàng</Button>
    </div>
  );
}

function OrderInfo({
  order,
  updateOrderStatus,
}: {
  order: Order;
  updateOrderStatus: (orderId: string, newStatus: string) => Promise<void>;
}) {
  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-4">
        <Avatar>
          <AvatarImage
            src={order.customer?.avatar}
            alt={order.customer?.name}
          />
          <AvatarFallback>
            {order.customer?.name?.charAt(0) || "?"}
          </AvatarFallback>
        </Avatar>
        <div>
          <p className="font-semibold">{order.customer?.name || "N/A"}</p>
          <p className="text-sm text-gray-500">
            {order.customer?.email || "N/A"}
          </p>
        </div>
      </div>
      <div>
        <p>
          <span className="font-semibold">Mã đơn hàng:</span> {order._id}
        </p>
        <p>
          <span className="font-semibold">Ngày đt hàng:</span>{" "}
          {format(new Date(order.orderDate), "dd/MM/yyyy HH:mm")}
        </p>
        <p>
          <span className="font-semibold">Tổng tiền:</span>{" "}
          {order.totalAmount.toLocaleString("vi-VN", {
            style: "currency",
            currency: "VND",
          })}
        </p>
        <p>
          <span className="font-semibold">Email:</span>{" "}
          {order.customer?.email || "N/A"}
        </p>
      </div>
      <div>
        <p className="font-semibold">Sản phẩm:</p>
        <ul className="list-disc list-inside">
          {order.products &&
            order.products.map((product) => (
              <li key={product._id}>
                {product.name} -{" "}
                {product.amount.toLocaleString("vi-VN", {
                  style: "currency",
                  currency: "VND",
                })}
                {product.type === "1" ? " (Quizizz)" : " (File)"}
              </li>
            ))}
        </ul>
      </div>
      <div>
        <p className="font-semibold">Trạng thái:</p>
        <Select
          value={order.status}
          onValueChange={(value) => updateOrderStatus(order._id, value)}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Trạng thái" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="pending">Đang chờ</SelectItem>
            <SelectItem value="completed">Hoàn thành</SelectItem>
            <SelectItem value="cancelled">Đã hủy</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
