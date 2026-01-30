import { format } from "date-fns";
import { ChevronUp, ChevronDown } from "lucide-react";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogTrigger,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Order, SortConfig } from "./types";
import { OrderInfo } from "./OrderInfo";
import { useRouter } from "next/navigation";

interface OrderTableProps {
  filteredOrders: Order[];
  sortConfig: SortConfig | null;
  handleSort: (key: keyof Order) => void;
  updateOrderStatus: (orderId: string, newStatus: string) => Promise<void>;
  fetchOrderDetails: (orderId: string) => Promise<void>;
  selectedOrder: Order | null;
  detailLoading: boolean;
  onUserClick: (userId: string) => Promise<void>;
}

export function OrderTable({
  filteredOrders,
  sortConfig,
  handleSort,
  updateOrderStatus,
  fetchOrderDetails,
  selectedOrder,
  detailLoading,
  onUserClick,
}: OrderTableProps) {
  const router = useRouter();

  return (
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
                className="cursor-pointer w-[200px] md:w-auto"
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
              <TableHead className="md:hidden w-[120px]">Time</TableHead>
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
                <TableCell>
                  <Button
                    variant="link"
                    className="p-0 h-auto font-normal hover:no-underline"
                    onClick={() => onUserClick(order.customer._id)}
                  >
                    {order.customer?.name || "N/A"}
                  </Button>
                </TableCell>
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
                <TableCell className="md:hidden text-sm">
                  {format(new Date(order.orderDate), "dd/MM HH:mm")}
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
                      <DialogContent aria-describedby="order-details-description">
                        <DialogTitle>Chi tiết đơn hàng</DialogTitle>
                        <DialogDescription
                          id="order-details-description"
                          className="sr-only"
                        >
                          Thông tin chi tiết về đơn hàng
                        </DialogDescription>
                        <div className="text-sm text-muted-foreground">
                          {detailLoading ? (
                            <div className="flex items-center justify-center p-4">
                              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-gray-900"></div>
                            </div>
                          ) : (
                            selectedOrder && (
                              <OrderInfo
                                order={selectedOrder}
                                updateOrderStatus={updateOrderStatus}
                              />
                            )
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
  );
}
