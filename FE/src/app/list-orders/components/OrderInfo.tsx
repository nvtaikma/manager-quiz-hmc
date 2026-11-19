import { format } from "date-fns";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Order } from "./types";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useState, useEffect } from "react";
import { fetchApi } from "@/lib/api";

interface OrderInfoProps {
  order: Order;
  updateOrderStatus: (orderId: string, newStatus: string) => Promise<void>;
}

export function OrderInfo({ order, updateOrderStatus }: OrderInfoProps) {
  const { toast } = useToast();
  const [currentOrder, setCurrentOrder] = useState<Order>(order);
  const [updatingStudentId, setUpdatingStudentId] = useState<string | null>(null);
  const [isBulkUpdating, setIsBulkUpdating] = useState<boolean>(false);

  useEffect(() => {
    setCurrentOrder(order);
  }, [order]);

  const toggleStudentVip = async (
    studentId: string,
    currentStatus: string,
    productName: string
  ) => {
    const newStatus = currentStatus === "vip" ? "pending" : "vip";
    try {
      setUpdatingStudentId(studentId);
      const response = await fetchApi(`/students/${studentId}/status`, {
        method: "PATCH",
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) {
        throw new Error("Không thể cập nhật trạng thái học viên");
      }

      setCurrentOrder((prev) => ({
        ...prev,
        products: prev.products.map((p) =>
          p.student && p.student._id === studentId
            ? { ...p, student: { ...p.student, status: newStatus } }
            : p
        ),
        students: prev.students?.map((s) =>
          s._id === studentId ? { ...s, status: newStatus } : s
        ),
      }));

      toast({
        title: "Thành công",
        description:
          newStatus === "vip"
            ? `Đã cấp quyền VIP cho học viên môn "${productName}".`
            : `Đã chuyển học viên môn "${productName}" về trạng thái Đang chờ.`,
      });
    } catch (error: any) {
      console.error("Lỗi khi cập nhật trạng thái VIP của học viên:", error);
      toast({
        title: "Lỗi",
        description: error.message || "Không thể cập nhật trạng thái học viên.",
        variant: "destructive",
      });
    } finally {
      setUpdatingStudentId(null);
    }
  };

  const isAllVip =
    currentOrder.products &&
    currentOrder.products.length > 0 &&
    currentOrder.products.every(
      (p) => p.student && p.student.status === "vip"
    );

  const handleToggleAllVip = async () => {
    const newStatus = isAllVip ? "pending" : "vip";
    try {
      setIsBulkUpdating(true);
      const response = await fetchApi(`/orders/${order._id}/student-status`, {
        method: "PATCH",
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) {
        throw new Error("Không thể cập nhật trạng thái học viên đơn hàng");
      }

      setCurrentOrder((prev) => ({
        ...prev,
        products: prev.products.map((p) =>
          p.student
            ? { ...p, student: { ...p.student, status: newStatus } }
            : p
        ),
        students: prev.students?.map((s) => ({ ...s, status: newStatus })),
      }));

      toast({
        title: "Thành công",
        description:
          newStatus === "vip"
            ? "Đã cấp quyền VIP cho tất cả học viên trong đơn hàng!"
            : "Đã chuyển tất cả học viên trong đơn hàng về trạng thái Đang chờ.",
      });
    } catch (error: any) {
      console.error("Lỗi cập nhật học viên đơn hàng:", error);
      toast({
        title: "Lỗi",
        description: error.message || "Không thể cập nhật trạng thái học viên.",
        variant: "destructive",
      });
    } finally {
      setIsBulkUpdating(false);
    }
  };

  const handleOrderStatusChange = async (value: string) => {
    await updateOrderStatus(order._id, value);
    if (value === "completed") {
      setCurrentOrder((prev) => ({
        ...prev,
        status: value,
        products: prev.products.map((p) =>
          p.student ? { ...p, student: { ...p.student, status: "completed" } } : p
        ),
        students: prev.students?.map((s) => ({ ...s, status: "completed" })),
      }));
    } else {
      setCurrentOrder((prev) => ({
        ...prev,
        status: value,
      }));
    }
  };

  const generateOrderDetails = () => {
    return `
Mã đơn hàng: ${currentOrder._id}
Khách hàng: ${currentOrder.customer?.name || "N/A"}
Email: ${currentOrder.customer?.email || "N/A"}
Ngày đặt hàng: ${format(new Date(currentOrder.orderDate), "dd/MM/yyyy HH:mm")}
Tổng tiền: ${currentOrder.totalAmount.toLocaleString("vi-VN", {
      style: "currency",
      currency: "VND",
    })}
Trạng thái: ${currentOrder.status}
Môn học:
${currentOrder.products
        ?.map(
          (product) =>
            `- ${product.name} - ${product.amount.toLocaleString("vi-VN", {
              style: "currency",
              currency: "VND",
            })} ${product.type === "1"
              ? "(Quizizz)"
              : product.type === "2"
                ? "(File)"
                : "(Azota)"
            }`
        )
        .join("\n")}
    `.trim();
  };

  const handleCopyClick = async () => {
    try {
      const orderDetails = generateOrderDetails();

      // Sử dụng Clipboard API hiện đại
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(orderDetails);
        toast({
          title: "Thành công",
          description: "Đã sao chép thông tin đơn hàng vào clipboard!",
          duration: 500,
        });
      } else {
        // Fallback cho trình duyệt cũ
        const textArea = document.createElement("textarea");
        textArea.value = orderDetails;
        textArea.style.position = "absolute";
        textArea.style.left = "-999999px";
        document.body.prepend(textArea);
        textArea.select();

        try {
          const successful = document.execCommand("copy");
          if (successful) {
            toast({
              title: "Thành công",
              description: "Đã sao chép thông tin đơn hàng vào clipboard!",
              duration: 500,
            });
          } else {
            throw new Error("execCommand failed");
          }
        } finally {
          document.body.removeChild(textArea);
        }
      }
    } catch (err) {
      console.error("Lỗi khi sao chép:", err);
      toast({
        title: "Lỗi",
        description: "Không thể sao chép thông tin đơn hàng. Vui lòng thử lại.",
        variant: "destructive",
        duration: 3000,
      });
    }
  };

  return (
    <div className="w-full space-y-3 sm:space-y-4 text-foreground">
      {/* Customer Info */}
      <div className="flex items-center space-x-3 bg-gray-100 p-2.5 sm:p-3.5 rounded-lg">
        <Avatar className="h-10 w-10 sm:h-12 sm:w-12 shrink-0">
          <AvatarImage
            src={currentOrder.customer?.avatar}
            alt={currentOrder.customer?.name}
          />
          <AvatarFallback className="text-sm sm:text-base font-semibold">
            {currentOrder.customer?.name?.charAt(0) || "?"}
          </AvatarFallback>
        </Avatar>
        <div className="min-w-0 flex-1">
          <p className="font-semibold text-sm sm:text-base truncate">
            {currentOrder.customer?.name || "N/A"}
          </p>
          <p className="text-xs sm:text-sm text-gray-500 truncate">
            {currentOrder.customer?.email || "N/A"}
          </p>
        </div>
      </div>

      {/* Order Details */}
      <div className="grid grid-cols-2 gap-2.5 sm:gap-3.5 bg-gray-50/60 p-2.5 sm:p-3 rounded-lg border">
        <div className="min-w-0">
          <p className="text-[11px] sm:text-xs text-gray-500">Mã đơn hàng</p>
          <p className="font-medium text-xs sm:text-sm truncate" title={currentOrder._id}>
            {currentOrder._id}
          </p>
        </div>
        <div>
          <p className="text-[11px] sm:text-xs text-gray-500">Ngày đặt hàng</p>
          <p className="font-medium text-xs sm:text-sm">
            {format(new Date(currentOrder.orderDate), "dd/MM/yyyy HH:mm")}
          </p>
        </div>
        <div>
          <p className="text-[11px] sm:text-xs text-gray-500">Tổng tiền</p>
          <p className="font-semibold text-xs sm:text-sm text-green-600">
            {currentOrder.totalAmount.toLocaleString("vi-VN", {
              style: "currency",
              currency: "VND",
            })}
          </p>
        </div>
        <div>
          <p className="text-[11px] sm:text-xs text-gray-500">Trạng thái</p>
          <Select
            value={currentOrder.status}
            onValueChange={handleOrderStatusChange}
          >
            <SelectTrigger className="w-full h-8 sm:h-9 text-xs sm:text-sm mt-0.5 bg-white">
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

      {/* Products List */}
      <div>
        <div className="flex items-center justify-between gap-2 mb-1.5">
          <p className="font-semibold text-xs sm:text-sm">
            Sản phẩm ({currentOrder.products?.length || 0}):
          </p>
          {currentOrder.status !== "completed" &&
            currentOrder.products &&
            currentOrder.products.length > 0 &&
            currentOrder.products.some((p) => p.student) && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={isBulkUpdating}
                onClick={handleToggleAllVip}
                className="h-6 sm:h-7 px-2 text-[11px] sm:text-xs border-amber-300 text-amber-800 bg-amber-50/50 hover:bg-amber-100 shrink-0"
              >
                {isBulkUpdating ? (
                  <span className="animate-spin mr-1">⏳</span>
                ) : null}
                {isAllVip ? "Chuyển tất cả về Chờ" : "⭐ Đặt tất cả VIP"}
              </Button>
            )}
        </div>
        <div className="max-h-[34vh] sm:max-h-[240px] overflow-y-auto pr-1">
          <ul className="space-y-1.5 sm:space-y-2">
            {currentOrder.products?.map((product) => (
              <li
                key={product._id}
                className="flex items-center justify-between bg-gray-50 p-2 sm:p-2.5 rounded-lg border gap-2"
              >
                <div className="flex-1 min-w-0">
                  <span className="text-xs sm:text-sm font-medium block line-clamp-1">
                    {product.name}
                  </span>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className="font-semibold text-[11px] sm:text-xs text-green-700">
                      {product.amount.toLocaleString("vi-VN", {
                        style: "currency",
                        currency: "VND",
                      })}
                    </span>
                    <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-4">
                      {product.type === "1"
                        ? "Quizizz"
                        : product.type === "2"
                          ? "File"
                          : "Azota"}
                    </Badge>
                  </div>
                </div>

                {/* Trạng thái học viên & Thay đổi VIP */}
                <div className="flex items-center gap-1.5 shrink-0">
                  {product.student ? (
                    <div className="flex items-center gap-1 sm:gap-1.5">
                      {product.student.status === "vip" ? (
                        <span className="inline-flex items-center rounded-full bg-amber-100 px-1.5 sm:px-2 py-0.5 text-[11px] sm:text-xs font-bold text-amber-800 border border-amber-300">
                          ⭐ VIP
                        </span>
                      ) : product.student.status === "completed" ? (
                        <span className="inline-flex items-center rounded-full bg-emerald-100 px-1.5 sm:px-2 py-0.5 text-[11px] sm:text-xs font-medium text-emerald-800 border border-emerald-200">
                          Hoàn thành
                        </span>
                      ) : product.student.status === "expired" ? (
                        <span className="inline-flex items-center rounded-full bg-rose-100 px-1.5 sm:px-2 py-0.5 text-[11px] sm:text-xs font-medium text-rose-800 border border-rose-200">
                          Hết hạn
                        </span>
                      ) : (
                        <span className="inline-flex items-center rounded-full bg-yellow-50 px-1.5 sm:px-2 py-0.5 text-[11px] sm:text-xs font-medium text-yellow-800 border border-yellow-200">
                          Đang chờ
                        </span>
                      )}

                      {/* Nút bấm đổi VIP */}
                      <Button
                        type="button"
                        size="sm"
                        variant={
                          product.student.status === "vip"
                            ? "destructive"
                            : "outline"
                        }
                        disabled={updatingStudentId === product.student._id}
                        onClick={() =>
                          toggleStudentVip(
                            product.student!._id,
                            product.student!.status,
                            product.name
                          )
                        }
                        className="h-6 text-[11px] px-1.5 sm:px-2"
                      >
                        {updatingStudentId === product.student._id ? (
                          <span className="animate-spin inline-block mr-1">
                            ⏳
                          </span>
                        ) : null}
                        {product.student.status === "vip"
                          ? "Hủy VIP"
                          : "Đặt VIP"}
                      </Button>
                    </div>
                  ) : (
                    <span className="text-[11px] text-muted-foreground italic">
                      Chưa có vé
                    </span>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Copy Button */}
      <Button onClick={handleCopyClick} className="w-full h-9 sm:h-10 text-xs sm:text-sm">
        Xuất thông tin chi tiết
      </Button>
    </div>
  );
}
