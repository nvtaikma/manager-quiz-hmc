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
import { useState } from "react";

interface OrderInfoProps {
  order: Order;
  updateOrderStatus: (orderId: string, newStatus: string) => Promise<void>;
}

export function OrderInfo({ order, updateOrderStatus }: OrderInfoProps) {
  const { toast } = useToast();

  const generateOrderDetails = () => {
    return `
Mã đơn hàng: ${order._id}
Khách hàng: ${order.customer?.name || "N/A"}
Email: ${order.customer?.email || "N/A"}
Ngày đặt hàng: ${format(new Date(order.orderDate), "dd/MM/yyyy HH:mm")}
Tổng tiền: ${order.totalAmount.toLocaleString("vi-VN", {
      style: "currency",
      currency: "VND",
    })}
Trạng thái: ${order.status}
Môn học:
${order.products
  ?.map(
    (product) =>
      `- ${product.name} - ${product.amount.toLocaleString("vi-VN", {
        style: "currency",
        currency: "VND",
      })} ${
        product.type === "1"
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
          duration: 3000,
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
              duration: 3000,
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
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-2xl font-bold">Thông tin đơn hàng</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Customer Info */}
        <div className="flex items-center space-x-4 bg-gray-100 p-4 rounded-lg">
          <Avatar className="h-16 w-16">
            <AvatarImage
              src={order.customer?.avatar}
              alt={order.customer?.name}
            />
            <AvatarFallback className="text-lg">
              {order.customer?.name?.charAt(0) || "?"}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="font-semibold text-lg">
              {order.customer?.name || "N/A"}
            </p>
            <p className="text-sm text-gray-500">
              {order.customer?.email || "N/A"}
            </p>
          </div>
        </div>

        {/* Order Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-500">Mã đơn hàng</p>
            <p className="font-medium break-all">{order._id}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Ngày đặt hàng</p>
            <p className="font-medium">
              {format(new Date(order.orderDate), "dd/MM/yyyy HH:mm")}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Tổng tiền</p>
            <p className="font-medium text-green-600">
              {order.totalAmount.toLocaleString("vi-VN", {
                style: "currency",
                currency: "VND",
              })}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Trạng thái</p>
            <Select
              value={order.status}
              onValueChange={(value) => updateOrderStatus(order._id, value)}
            >
              <SelectTrigger className="w-full mt-1">
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
          <p className="font-semibold mb-2">Sản phẩm:</p>
          <div className="max-h-[120px] overflow-y-auto">
            <ul className="space-y-2">
              {order.products?.map((product) => (
                <li
                  key={product._id}
                  className="flex justify-between items-center bg-gray-50 p-2 rounded"
                >
                  <span className="text-sm">{product.name}</span>
                  <div>
                    <span className="font-medium mr-2 text-sm">
                      {product.amount.toLocaleString("vi-VN", {
                        style: "currency",
                        currency: "VND",
                      })}
                    </span>
                    <Badge variant="outline" className="text-xs">
                      {product.type === "1"
                        ? "Quizizz"
                        : product.type === "2"
                        ? "File"
                        : "Azota"}
                    </Badge>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Copy Button */}
        <Button onClick={handleCopyClick} className="w-full">
          Xuất thông tin chi tiết
        </Button>
      </CardContent>
    </Card>
  );
}
