"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { useEffect, useState, useCallback } from "react";
import { Loader2 } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { API_BASE_URL } from "@/contants/api";
import { Editor } from "@tinymce/tinymce-react";

// Định nghĩa location type
type LocationType = "homepage_guest" | "homepage_authenticated" | "exam";

// Mở rộng schema để bao gồm subjectName
const announcementSchema = z.object({
  location: z.string().min(1, "Vị trí là bắt buộc"),
  message: z.string().min(1, "Nội dung thông báo là bắt buộc"),
  isActive: z.boolean().default(true),
  expiresAt: z.string().optional(),
  priority: z.coerce.number().int().min(0).default(0),
  subjectName: z.string().optional(),
});

export type AnnouncementFormValues = z.infer<typeof announcementSchema>;

interface Product {
  _id: string;
  name: string;
}

interface Announcement {
  id: string;
  location: string;
  message: string;
  isActive: boolean;
  expiresAt: Date | null;
  priority: number;
  subjectName?: string;
}

interface AnnouncementFormProps {
  defaultValues?: Announcement;
  onSubmit: (data: AnnouncementFormValues) => Promise<void>;
  isLoading: boolean;
  isEditing?: boolean;
  onClose?: () => void;
}

export default function AnnouncementForm({
  defaultValues,
  onSubmit,
  isLoading,
  isEditing = false,
  onClose,
}: AnnouncementFormProps) {
  const getInitialLocation = () => {
    if (defaultValues?.location?.startsWith("course/")) {
      return {
        type: "exam" as LocationType,
        id: defaultValues.location.replace("course/", ""),
      };
    }
    if (defaultValues?.location === "homepage_authenticated") {
      return { type: "homepage_authenticated" as LocationType, id: "" };
    }
    return { type: "homepage_guest" as LocationType, id: "" };
  };

  const initialLocation = getInitialLocation();

  const [hasExpiration, setHasExpiration] = useState(
    defaultValues?.expiresAt ? true : false
  );
  const [locationType, setLocationType] = useState<LocationType>(
    initialLocation.type
  );
  const [selectedProductId, setSelectedProductId] = useState<string>(
    initialLocation.id
  );

  const [products, setProducts] = useState<Product[]>([]);
  const [isLoadingProducts, setIsLoadingProducts] = useState<boolean>(false);

  // Format expiresAt date for form if it exists
  let formattedExpiresAt = "";
  if (defaultValues?.expiresAt) {
    const date = new Date(defaultValues.expiresAt);
    formattedExpiresAt = date.toISOString().split("T")[0];
  }

  const form = useForm<AnnouncementFormValues>({
    resolver: zodResolver(announcementSchema),
    defaultValues: {
      location: defaultValues?.location || "",
      message: defaultValues?.message || "",
      isActive:
        defaultValues?.isActive !== undefined ? defaultValues.isActive : true,
      expiresAt: formattedExpiresAt,
      priority: defaultValues?.priority || 0,
      subjectName: defaultValues?.subjectName || "",
    },
  });

  const fetchProducts = useCallback(async () => {
    setIsLoadingProducts(true);
    try {
      const response = await fetch(`${API_BASE_URL}/products/all/full`);
      if (response.ok) {
        const data = await response.json();
        setProducts(data.data || []);
      } else {
        console.error("Không thể tải danh sách sản phẩm");
      }
    } catch (error) {
      console.error("Lỗi khi tải danh sách sản phẩm:", error);
    } finally {
      setIsLoadingProducts(false);
    }
  }, []);

  useEffect(() => {
    if (locationType === "exam") {
      fetchProducts();
    }
  }, [locationType, fetchProducts]);

  const handleLocationTypeChange = (value: string) => {
    const newLocationType = value as LocationType;
    setLocationType(newLocationType);
    setSelectedProductId("");

    if (
      newLocationType === "homepage_guest" ||
      newLocationType === "homepage_authenticated"
    ) {
      form.setValue("location", newLocationType);
    }
  };

  const handleProductChange = (productId: string) => {
    setSelectedProductId(productId);
    form.setValue("location", `course/${productId}`);
    const selectedProduct = products.find((p) => p._id === productId);
    if (selectedProduct) {
      form.setValue("subjectName", selectedProduct.name);
    }
  };

  const handleSubmit = async (values: AnnouncementFormValues) => {
    if (!hasExpiration) {
      values.expiresAt = undefined;
    }
    await onSubmit(values);
    if (!isEditing && onClose) {
      onClose();
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        {/* Vị trí hiển thị */}
        <div className="space-y-4">
          <FormLabel>Vị trí hiển thị</FormLabel>
          <Select
            value={locationType}
            onValueChange={handleLocationTypeChange}
            disabled={isLoading}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Chọn vị trí hiển thị" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="homepage_guest">Trang chủ (khách)</SelectItem>
              <SelectItem value="homepage_authenticated">
                Trang chủ (đã đăng nhập)
              </SelectItem>
              <SelectItem value="exam">Trang thi</SelectItem>
            </SelectContent>
          </Select>
          {locationType === "exam" && (
            <div className="pt-2">
              <FormLabel>Chọn môn học</FormLabel>
              {isLoadingProducts ? (
                <div className="flex items-center space-x-2 mt-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Đang tải danh sách môn học...</span>
                </div>
              ) : (
                <Select
                  value={selectedProductId}
                  onValueChange={handleProductChange}
                  disabled={isLoading}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Chọn môn học" />
                  </SelectTrigger>
                  <SelectContent>
                    {products.map((product) => (
                      <SelectItem key={product._id} value={product._id}>
                        {product.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>
          )}
        </div>

        {/* --- BẮT ĐẦU PHẦN SỬA LỖI EDITOR --- */}
        <FormField
          control={form.control}
          name="message"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nội dung thông báo</FormLabel>
              <FormControl>
                <Editor
                  apiKey="g0mguoz9gze63nffhixyqey2u5lv0488n09o3rmrbct4eoev"
                  // Chỉ dùng `initialValue` để thiết lập giá trị ban đầu MỘT LẦN
                  // Giá trị này không nên thay đổi sau mỗi lần gõ phím
                  initialValue={defaultValues?.message || ""}
                  init={{
                    height: 300,
                    menubar: false,
                    plugins:
                      "anchor autolink charmap codesample emoticons image link lists media searchreplace table visualblocks wordcount",
                    toolbar:
                      "undo redo | blocks fontfamily fontsize | bold italic underline strikethrough | link image media table | align lineheight | numlist bullist indent outdent | emoticons charmap | removeformat",
                    content_style:
                      'body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif; font-size: 14px }',
                    placeholder: "Nhập nội dung thông báo",
                  }}
                  // Sử dụng `field.onChange` để cập nhật giá trị cho react-hook-form
                  // Cách này được tối ưu để không gây render lại không cần thiết
                  onEditorChange={(content) => {
                    field.onChange(content);
                  }}
                  disabled={isLoading}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        {/* --- KẾT THÚC PHẦN SỬA LỖI EDITOR --- */}

        {/* Các FormField khác */}
        <FormField
          control={form.control}
          name="isActive"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center gap-2 space-y-0">
              <FormControl>
                <Checkbox
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
              <FormLabel className="font-normal">
                Thông báo đang hoạt động
              </FormLabel>
            </FormItem>
          )}
        />
        <div className="flex flex-row items-center gap-2 space-y-0">
          <Checkbox
            id="hasExpiration"
            checked={hasExpiration}
            onCheckedChange={(checked) => {
              setHasExpiration(!!checked);
              if (!checked) {
                form.setValue("expiresAt", "");
              }
            }}
          />
          <label
            htmlFor="hasExpiration"
            className="text-sm font-medium leading-none cursor-pointer"
          >
            Thiết lập ngày hết hạn
          </label>
        </div>
        {hasExpiration && (
          <FormField
            control={form.control}
            name="expiresAt"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Ngày hết hạn</FormLabel>
                <FormControl>
                  <Input type="date" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}
        <FormField
          control={form.control}
          name="priority"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Mức độ ưu tiên</FormLabel>
              <FormControl>
                <Input type="number" min={0} placeholder="0" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Nút bấm */}
        <div className="flex space-x-2 justify-end">
          {onClose && (
            <Button type="button" variant="outline" onClick={onClose}>
              Hủy
            </Button>
          )}
          <Button type="submit" disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Đang xử lý...
              </>
            ) : isEditing ? (
              "Cập nhật"
            ) : (
              "Tạo thông báo"
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
}
