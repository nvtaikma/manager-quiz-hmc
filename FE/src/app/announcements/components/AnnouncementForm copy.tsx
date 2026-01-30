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
import { useEffect, useState, useRef, useCallback } from "react";
import { Loader2 } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { API_BASE_URL } from "@/contants/api";
import { Editor, IAllProps } from "@tinymce/tinymce-react";
import { Editor as TinyMCEEditor } from "tinymce";

// Định nghĩa location type
type LocationType = "homepage_guest" | "homepage_authenticated" | "course";

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
  const [hasExpiration, setHasExpiration] = useState(
    defaultValues?.expiresAt ? true : false
  );
  const [locationType, setLocationType] =
    useState<LocationType>("homepage_guest");
  const [selectedProductId, setSelectedProductId] = useState<string>("");
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoadingProducts, setIsLoadingProducts] = useState<boolean>(false);
  const [editorKey, setEditorKey] = useState<number>(0);
  const editorRef = useRef<TinyMCEEditor | null>(null);
  const [editorContent, setEditorContent] = useState<string>(
    defaultValues?.message || ""
  );

  // Debug logs to help identify issue
  console.log("AnnouncementForm - isEditing:", isEditing);
  console.log("AnnouncementForm - defaultValues:", defaultValues);
  console.log(
    "AnnouncementForm - defaultValues?.message:",
    defaultValues?.message
  );
  console.log("AnnouncementForm - editorContent:", editorContent);

  // Format expiresAt date for form if it exists
  let formattedExpiresAt = "";
  if (defaultValues?.expiresAt) {
    const date = new Date(defaultValues.expiresAt);
    formattedExpiresAt = date.toISOString().split("T")[0];
  }

  // Cập nhật editorContent khi defaultValues.message thay đổi
  useEffect(() => {
    if (defaultValues?.message) {
      console.log(
        "Updating editor content from defaultValues:",
        defaultValues.message
      );
      setEditorContent(defaultValues.message);

      // Nếu editor đã được khởi tạo, cập nhật nội dung ngay lập tức
      if (editorRef.current) {
        editorRef.current.setContent(defaultValues.message);
      }
    }
  }, [defaultValues?.message]);

  // Fetch danh sách products
  const fetchProducts = async () => {
    console.log("Fetching products...");
    setIsLoadingProducts(true);
    try {
      const response = await fetch(`${API_BASE_URL}/products/all/full`);
      if (response.ok) {
        const data = await response.json();
        console.log("Products fetched:", data.data?.length || 0, "items");
        setProducts(data.data || []);

        // Nếu đang chỉnh sửa và có productId, tìm tên sản phẩm ngay sau khi tải
        if (defaultValues?.location?.startsWith("course/") && form) {
          const productId = defaultValues.location.replace("course/", "");
          if (!defaultValues.subjectName && productId) {
            const selectedProduct = data.data?.find(
              (p: Product) => p._id === productId
            );
            if (selectedProduct) {
              console.log("Found product:", selectedProduct);
              // Chỉ cập nhật form khi form đã được khởi tạo
              if (typeof form.setValue === "function") {
                form.setValue("subjectName", selectedProduct.name);
              }
            }
          }
        }
      } else {
        console.error("Không thể tải danh sách sản phẩm");
      }
    } catch (error) {
      console.error("Lỗi khi tải danh sách sản phẩm:", error);
    } finally {
      setIsLoadingProducts(false);
    }
  };

  // Parse location từ defaultValues nếu có - không phụ thuộc vào products
  useEffect(() => {
    if (defaultValues?.location) {
      console.log("Parsing location:", defaultValues.location);
      if (defaultValues.location.startsWith("course/")) {
        setLocationType("course");
        const productId = defaultValues.location.replace("course/", "");
        setSelectedProductId(productId);
      } else if (defaultValues.location === "homepage_guest") {
        setLocationType("homepage_guest");
      } else if (defaultValues.location === "homepage_authenticated") {
        setLocationType("homepage_authenticated");
      }
    }
  }, [defaultValues?.location]);

  // Dùng useRef để theo dõi việc đã tải products hay chưa mà không gây re-render
  const hasLoadedProducts = useRef(false);

  // Tải danh sách sản phẩm chỉ khi cần thiết: khi component được mount và locationType là exam
  useEffect(() => {
    if (locationType === "course" && !hasLoadedProducts.current) {
      console.log(
        "Loading products because locationType is exam and not loaded yet"
      );
      fetchProducts();
      hasLoadedProducts.current = true;
    }
  }, [locationType]);

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

  // Cập nhật giá trị location trong form khi locationType hoặc selectedProductId thay đổi
  useEffect(() => {
    if (
      locationType === "homepage_guest" ||
      locationType === "homepage_authenticated"
    ) {
      form.setValue("location", locationType);
    } else if (locationType === "course" && selectedProductId) {
      form.setValue("location", `course/${selectedProductId}`);
    }
  }, [locationType, selectedProductId, form]);

  // Reset editor key khi defaultValues thay đổi để đảm bảo editor được khởi tạo lại đúng
  useEffect(() => {
    if (defaultValues) {
      setEditorKey((prev) => prev + 1);
    }
  }, [defaultValues]);

  // Xử lý khi thay đổi location type
  const handleLocationTypeChange = (value: string) => {
    setLocationType(value as LocationType);

    // Cập nhật giá trị location dựa trên loại đã chọn
    if (value === "homepage_guest" || value === "homepage_authenticated") {
      form.setValue("location", value);
      setSelectedProductId("");
    }
  };

  // Xử lý khi thay đổi product
  const handleProductChange = (productId: string) => {
    setSelectedProductId(productId);
    form.setValue("location", `course/${productId}`);

    // Lưu tên môn học
    const selectedProduct = products.find((p) => p._id === productId);
    if (selectedProduct) {
      form.setValue("subjectName", selectedProduct.name);
    }
  };

  const handleSubmit = async (values: AnnouncementFormValues) => {
    // Lấy nội dung hiện tại từ editor trước khi submit
    if (editorRef.current) {
      const currentContent = editorRef.current.getContent();
      values.message = currentContent;
    }

    // Nếu không có hạn chế về thời gian, gán expiresAt thành null
    if (!hasExpiration) {
      values.expiresAt = undefined;
    }

    // Format location
    if (locationType === "course" && selectedProductId) {
      values.location = `course/${selectedProductId}`;
    } else {
      values.location = locationType;
    }

    await onSubmit(values);

    if (!isEditing) {
      form.reset({
        location: "",
        message: "",
        isActive: true,
        expiresAt: "",
        priority: 0,
        subjectName: "",
      });
      setHasExpiration(false);
      setLocationType("homepage_guest");
      setSelectedProductId("");
      setEditorContent(""); // Reset editor content
      setEditorKey((prev) => prev + 1); // Reset editor content
    }
  };

  // Định dạng hiển thị vị trí
  const getLocationDisplayName = (location: string) => {
    if (location === "homepage_guest") return "Trang chủ (khách)";
    if (location === "homepage_authenticated")
      return "Trang chủ (đã đăng nhập)";
    if (location.startsWith("course/")) return "Trang thi";
    return location;
  };

  // Cập nhật giá trị form từ editor mà không làm mất vị trí con trỏ
  const handleEditorChange = (content: string) => {
    setEditorContent(content); // Update state
    form.setValue("message", content, { shouldValidate: true });
  };

  // Khởi tạo editor
  const handleEditorInit = useCallback(
    (evt: unknown, editor: TinyMCEEditor) => {
      editorRef.current = editor;

      // Nếu có nội dung ban đầu, thiết lập nội dung cho editor
      if (editorContent) {
        editor.setContent(editorContent);
      }
    },
    [editorContent] // Add editorContent to dependency array
  );

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        {/* Chọn vị trí hiển thị */}
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
              <SelectItem value="course">Trang thi</SelectItem>
            </SelectContent>
          </Select>

          {/* Hiển thị select chọn môn học nếu locationType là "exam" */}
          {locationType === "course" && (
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

        <FormField
          control={form.control}
          name="message"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nội dung thông báo</FormLabel>
              <FormControl>
                <Editor
                  key={editorKey} // Để reset editor content
                  onInit={handleEditorInit}
                  initialValue={defaultValues?.message || ""}
                  apiKey="g0mguoz9gze63nffhixyqey2u5lv0488n09o3rmrbct4eoev"
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
                  onEditorChange={handleEditorChange}
                  disabled={isLoading}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

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
