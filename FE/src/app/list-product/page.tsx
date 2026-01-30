"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
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
import {
  Pencil,
  Trash2,
  Plus,
  Search,
  ArrowUpDown,
  ShoppingCart,
  BookOpen,
  Users,
  Upload as UploadIcon,
  Eye,
  ImageIcon,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useRouter } from "next/navigation";
import ProductTable from "@/app/list-product/components/ProductTable";
import { API_BASE_URL } from "@/contants/api";
import { handleImageUpload } from "@/lib/upload";

interface Product {
  _id: string;
  name: string;
  status?: string;
  image?: string;
  countQuestion?: number;
  documentId?: string;
}

const productSchema = z.object({
  name: z.string().min(2, { message: "Tên sản phẩm phải có ít nhất 2 ký tự." }),
  documentId: z.string().optional(),
  image: z.string().optional(),
});

export default function ListProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [filter, setFilter] = useState("");
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const [actionLoading, setActionLoading] = useState(false);
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [uploadingImage, setUploadingImage] = useState(false);
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string>("");
  const [showImagePreview, setShowImagePreview] = useState(false);
  const imageFileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const form = useForm<z.infer<typeof productSchema>>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: "",
      documentId: "",
      image: "",
    },
  });

  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/products/all/full`);
      if (!response.ok) {
        throw new Error("Không thể tải danh sách sản phẩm");
      }
      const data = await response.json();
      setProducts(data.data);
    } catch (error) {
      console.error("Lỗi khi tải danh sách sản phẩm:", error);
      toast({
        title: "Lỗi",
        description: "Không thể tải danh sách sản phẩm. Vui lòng thử lại.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  useEffect(() => {
    const lowercasedFilter = filter.toLowerCase();
    const filtered = products.filter((product) =>
      product.name.toLowerCase().includes(lowercasedFilter)
    );
    const sorted = [...filtered].sort((a, b) => {
      if (sortOrder === "asc") {
        return a.name.localeCompare(b.name);
      } else {
        return b.name.localeCompare(a.name);
      }
    });
    setFilteredProducts(sorted);
  }, [filter, products, sortOrder]);

  useEffect(() => {
    if (editingProduct) {
      form.setValue("name", editingProduct.name);
      form.setValue("documentId", editingProduct.documentId || "");
      form.setValue("image", editingProduct.image || "");
    }
  }, [editingProduct, form]);

  const onSubmit = async (values: z.infer<typeof productSchema>) => {
    try {
      setActionLoading(true);
      const response = await fetch(`${API_BASE_URL}/products`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(values),
      });

      if (!response.ok) {
        throw new Error("Không thể tạo sản phẩm");
      }

      await fetchProducts();
      form.reset();
      toast({
        title: "Thành công",
        description: "Đã tạo sản phẩm thành công.",
      });
    } catch (error) {
      console.error("Lỗi khi tạo sản phẩm:", error);
      toast({
        title: "Lỗi",
        description: "Không thể tạo sản phẩm. Vui lòng thử lại.",
        variant: "destructive",
      });
    } finally {
      setActionLoading(false);
    }
  };

  const updateProduct = async (
    id: string,
    values: z.infer<typeof productSchema>
  ) => {
    try {
      setActionLoading(true);
      const response = await fetch(`${API_BASE_URL}/products/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(values),
      });

      if (!response.ok) {
        throw new Error("Không thể cập nhật sản phẩm");
      }

      await fetchProducts();
      setEditingProduct(null);
      toast({
        title: "Thành công",
        description: "Đã cập nhật sản phẩm thành công.",
      });
    } catch (error) {
      console.error("Lỗi khi cập nhật sản phẩm:", error);
      toast({
        title: "Lỗi",
        description: "Không thể cập nhật sản phẩm. Vui lòng thử lại.",
        variant: "destructive",
      });
    } finally {
      setActionLoading(false);
    }
  };

  const deleteProduct = async (id: string) => {
    try {
      setActionLoading(true);
      const response = await fetch(`${API_BASE_URL}/products/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Không thể xóa sản phẩm");
      }

      await fetchProducts();
      toast({
        title: "Thành công",
        description: "Đã xóa sản phẩm thành công.",
      });
    } catch (error) {
      console.error("Lỗi khi xóa sản phẩm:", error);
      toast({
        title: "Lỗi",
        description: "Không thể xóa sản phẩm. Vui lòng thử lại.",
        variant: "destructive",
      });
    } finally {
      setActionLoading(false);
    }
  };

  const toggleSortOrder = () => {
    setSortOrder(sortOrder === "asc" ? "desc" : "asc");
  };

  const handlePreviewImage = () => {
    const imageUrl = form.getValues("image");
    if (imageUrl) {
      setImagePreviewUrl(imageUrl);
      setShowImagePreview(true);
    } else {
      toast({
        title: "Thông báo",
        description: "Chưa có hình ảnh để xem trước",
        variant: "default",
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    // <Card className="w-full max-w-4xl mx-auto">
    <Card className="w-full mx-auto">
      <CardHeader>
        <CardTitle className="text-3xl font-bold">Danh sách sản phẩm</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex justify-between items-center mb-6">
          <div className="relative w-full md:w-64 mr-4">
            <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <Input
              placeholder="Lọc sản phẩm..."
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="pl-8"
            />
          </div>
          <Dialog>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" /> Thêm sản phẩm
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Thêm sản phẩm mới</DialogTitle>
              </DialogHeader>
              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(onSubmit)}
                  className="space-y-6"
                >
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Tên sản phẩm</FormLabel>
                        <FormControl>
                          <Input placeholder="Nhập tên sản phẩm" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="documentId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Google Docs Document ID</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Nhập ID tài liệu Google Docs"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="image"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          Hình ảnh sản phẩm
                          <span className="text-sm text-muted-foreground ml-2">
                            (Tùy chọn)
                          </span>
                        </FormLabel>
                        <FormControl>
                          <div className="space-y-2">
                            <Input
                              placeholder="URL hình ảnh hoặc tải lên từ máy tính"
                              {...field}
                            />
                            <div className="flex gap-2">
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={handlePreviewImage}
                                title="Xem trước ảnh"
                                disabled={!field.value}
                              >
                                <Eye className="h-4 w-4 mr-1" />
                                Xem trước
                              </Button>
                              <div className="relative">
                                <Input
                                  type="file"
                                  accept="image/png, image/jpeg, image/gif, image/webp"
                                  onChange={(e) =>
                                    handleImageUpload(
                                      e,
                                      (url) => {
                                        form.setValue("image", `${url}=rw`, {
                                          shouldDirty: true,
                                        });
                                        form.trigger("image");
                                      },
                                      (uploading) => {
                                        setUploadingImage(uploading);
                                      }
                                    )
                                  }
                                  className="hidden"
                                  ref={imageFileInputRef}
                                  disabled={uploadingImage}
                                />
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="sm"
                                  onClick={() =>
                                    imageFileInputRef.current?.click()
                                  }
                                  disabled={uploadingImage}
                                  title="Tải lên ảnh mới"
                                >
                                  {uploadingImage ? (
                                    <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-primary"></div>
                                  ) : (
                                    <>
                                      <UploadIcon className="h-4 w-4 mr-1" />
                                      Tải lên
                                    </>
                                  )}
                                </Button>
                              </div>
                            </div>
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button
                    type="submit"
                    disabled={actionLoading || uploadingImage}
                    className="w-full"
                  >
                    {actionLoading ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></div>
                    ) : (
                      "Tạo sản phẩm"
                    )}
                  </Button>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>

        <div className="border rounded-md">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[80%]">
                  <Button variant="ghost" onClick={toggleSortOrder}>
                    Tên sản phẩm
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                  </Button>
                </TableHead>
                <TableHead className="text-right">Hành động</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredProducts.map((product) => (
                <TableRow key={product._id}>
                  <TableCell className="font-medium">{product.name}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end space-x-2">
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() =>
                          router.push(`/product-students/${product._id}`)
                        }
                      >
                        <Users className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() =>
                          router.push(`/list-orders?productId=${product._id}`)
                        }
                      >
                        <ShoppingCart className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() =>
                          router.push(`/product-exams/${product._id}`)
                        }
                        title="Xem đề thi"
                      >
                        <BookOpen className="h-4 w-4" />
                      </Button>
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => setEditingProduct(product)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-md">
                          <DialogHeader>
                            <DialogTitle>Sửa sản phẩm</DialogTitle>
                          </DialogHeader>
                          <Form {...form}>
                            <form
                              onSubmit={form.handleSubmit((values) =>
                                updateProduct(product._id, values)
                              )}
                              className="space-y-6"
                            >
                              <FormField
                                control={form.control}
                                name="name"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Tên sản phẩm</FormLabel>
                                    <FormControl>
                                      <Input
                                        placeholder="Nhập tên sản phẩm"
                                        {...field}
                                      />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />

                              <FormField
                                control={form.control}
                                name="documentId"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>
                                      Google Docs Document ID
                                    </FormLabel>
                                    <FormControl>
                                      <Input
                                        placeholder="Nhập ID tài liệu Google Docs"
                                        {...field}
                                      />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />

                              <FormField
                                control={form.control}
                                name="image"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>
                                      Hình ảnh sản phẩm
                                      <span className="text-sm text-muted-foreground ml-2">
                                        (Tùy chọn)
                                      </span>
                                    </FormLabel>
                                    <FormControl>
                                      <div className="space-y-2">
                                        <Input
                                          placeholder="URL hình ảnh hoặc tải lên từ máy tính"
                                          {...field}
                                        />
                                        <div className="flex gap-2">
                                          <Button
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            onClick={handlePreviewImage}
                                            title="Xem trước ảnh"
                                            disabled={!field.value}
                                          >
                                            <Eye className="h-4 w-4 mr-1" />
                                            Xem trước
                                          </Button>
                                          <div className="relative">
                                            <Input
                                              type="file"
                                              accept="image/png, image/jpeg, image/gif, image/webp"
                                              onChange={(e) =>
                                                handleImageUpload(
                                                  e,
                                                  (url) => {
                                                    form.setValue(
                                                      "image",
                                                      `${url}=rw`,
                                                      {
                                                        shouldDirty: true,
                                                      }
                                                    );
                                                    form.trigger("image");
                                                  },
                                                  (uploading) => {
                                                    setUploadingImage(
                                                      uploading
                                                    );
                                                  }
                                                )
                                              }
                                              className="hidden"
                                              ref={imageFileInputRef}
                                              disabled={uploadingImage}
                                            />
                                            <Button
                                              type="button"
                                              variant="outline"
                                              size="sm"
                                              onClick={() =>
                                                imageFileInputRef.current?.click()
                                              }
                                              disabled={uploadingImage}
                                              title="Tải lên ảnh mới"
                                            >
                                              {uploadingImage ? (
                                                <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-primary"></div>
                                              ) : (
                                                <>
                                                  <UploadIcon className="h-4 w-4 mr-1" />
                                                  Tải lên
                                                </>
                                              )}
                                            </Button>
                                          </div>
                                        </div>
                                      </div>
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />

                              <Button
                                type="submit"
                                disabled={actionLoading || uploadingImage}
                                className="w-full"
                              >
                                {actionLoading ? (
                                  <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></div>
                                ) : (
                                  "Cập nhật sản phẩm"
                                )}
                              </Button>
                            </form>
                          </Form>
                        </DialogContent>
                      </Dialog>

                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="destructive" size="icon">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>
                              Bạn có chắc chắn?
                            </AlertDialogTitle>
                            <AlertDialogDescription>
                              Hành động này không thể hoàn tác. Điều này sẽ xóa
                              vĩnh viễn sản phẩm.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Hủy</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => deleteProduct(product._id)}
                              disabled={actionLoading}
                            >
                              {actionLoading ? (
                                <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></div>
                              ) : (
                                "Xóa"
                              )}
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>

      {/* Image Preview Dialog */}
      <Dialog open={showImagePreview} onOpenChange={setShowImagePreview}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Xem trước hình ảnh</DialogTitle>
          </DialogHeader>
          <div className="flex justify-center">
            <img
              src={imagePreviewUrl}
              alt="Preview"
              className="max-w-full max-h-96 object-contain"
              onError={() => {
                toast({
                  title: "Lỗi",
                  description: "Không thể tải hình ảnh. Vui lòng kiểm tra URL.",
                  variant: "destructive",
                });
                setShowImagePreview(false);
              }}
            />
          </div>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
