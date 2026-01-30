"use client";

import { useState, useEffect, useCallback } from "react";
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
import { Pencil, Trash2, Plus, ArrowLeft, BookOpen, RefreshCw } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useRouter } from "next/navigation";
import { Textarea } from "@/components/ui/textarea";
import { API_BASE_URL } from "@/contants/api";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Exam {
  _id: string;
  productId: string;
  name: string;
  description?: string;
  duration: number;
  status: "active" | "inactive" | "draft";
  createdAt: string;
  updatedAt: string;
}

interface Product {
  _id: string;
  name: string;
}

const examSchema = z.object({
  name: z.string().min(2, { message: "Tên đề thi phải có ít nhất 2 ký tự" }),
  description: z.string().optional(),
  duration: z.coerce.number().min(1, { message: "Thời gian phải lớn hơn 0" }),
  status: z.enum(["active", "inactive", "draft"], {
    message: "Trạng thái không hợp lệ",
  }),
});

// Component quản lý đề thi (Client Component)
export function ExamManager({ productId }: { productId: string }) {
  const [exams, setExams] = useState<Exam[]>([]);
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [editingExam, setEditingExam] = useState<Exam | null>(null);
  const { toast } = useToast();
  const router = useRouter();

  const form = useForm<z.infer<typeof examSchema>>({
    resolver: zodResolver(examSchema),
    defaultValues: {
      name: "",
      description: "",
      duration: 45,
      status: "active",
    },
  });

  // Hàm lấy thông tin sản phẩm
  const fetchProduct = useCallback(async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/products/${productId}`);
      if (!response.ok) {
        throw new Error("Không thể tải thông tin sản phẩm");
      }
      const data = await response.json();
      setProduct(data.data);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Lỗi không xác định";
      console.error("Lỗi khi tải thông tin sản phẩm:", errorMessage);
      toast({
        title: "Lỗi",
        description: "Không thể tải thông tin sản phẩm. Vui lòng thử lại.",
        variant: "destructive",
      });
    }
  }, [productId, toast]);

  // Hàm lấy danh sách đề thi
  const fetchExams = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `${API_BASE_URL}/products/${productId}/exams`
      );
      if (!response.ok) {
        throw new Error("Không thể tải danh sách đề thi");
      }
      const data = await response.json();
      setExams(data.data.data || []);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Lỗi không xác định";
      console.error("Lỗi khi tải danh sách đề thi:", errorMessage);
      toast({
        title: "Lỗi",
        description: "Không thể tải danh sách đề thi. Vui lòng thử lại.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [productId, toast]);

  // Load dữ liệu khi component mount
  useEffect(() => {
    fetchProduct();
    fetchExams();
  }, [fetchProduct, fetchExams]);

  // Cập nhật form khi có exam được chọn để sửa
  useEffect(() => {
    if (editingExam) {
      form.setValue("name", editingExam.name);
      form.setValue("description", editingExam.description || "");
      form.setValue("duration", editingExam.duration);
      form.setValue("status", editingExam.status);
    } else {
      form.reset({
        name: "",
        description: "",
        duration: 45,
        status: "active",
      });
    }
  }, [editingExam, form]);

  // Thêm đề thi mới
  const onSubmit = async (values: z.infer<typeof examSchema>) => {
    try {
      setActionLoading(true);
      const response = await fetch(
        `${API_BASE_URL}/products/${productId}/exams`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(values),
        }
      );

      if (!response.ok) {
        throw new Error("Không thể tạo đề thi");
      }

      await fetchExams();
      form.reset();
      toast({
        title: "Thành công",
        description: "Đã tạo đề thi thành công.",
      });
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Lỗi không xác định";
      console.error("Lỗi khi tạo đề thi:", errorMessage);
      toast({
        title: "Lỗi",
        description: "Không thể tạo đề thi. Vui lòng thử lại.",
        variant: "destructive",
      });
    } finally {
      setActionLoading(false);
    }
  };

  // Cập nhật đề thi
  const updateExam = async (
    examId: string,
    values: z.infer<typeof examSchema>
  ) => {
    try {
      setActionLoading(true);
      const response = await fetch(`${API_BASE_URL}/exams/${examId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(values),
      });

      if (!response.ok) {
        throw new Error("Không thể cập nhật đề thi");
      }

      await fetchExams();
      setEditingExam(null);
      toast({
        title: "Thành công",
        description: "Đã cập nhật đề thi thành công.",
      });
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Lỗi không xác định";
      console.error("Lỗi khi cập nhật đề thi:", errorMessage);
      toast({
        title: "Lỗi",
        description: "Không thể cập nhật đề thi. Vui lòng thử lại.",
        variant: "destructive",
      });
    } finally {
      setActionLoading(false);
    }
  };

  // Xóa đề thi
  const deleteExam = async (examId: string) => {
    try {
      setActionLoading(true);
      const response = await fetch(`${API_BASE_URL}/exams/${examId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Không thể xóa đề thi");
      }

      await fetchExams();
      toast({
        title: "Thành công",
        description: "Đã xóa đề thi thành công.",
      });
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Lỗi không xác định";
      console.error("Lỗi khi xóa đề thi:", errorMessage);
      toast({
        title: "Lỗi",
        description: "Không thể xóa đề thi. Vui lòng thử lại.",
        variant: "destructive",
      });
    } finally {
      setActionLoading(false);
    }
  };

  // Đồng bộ số lượng câu hỏi
  const handleSyncCounts = async () => {
    try {
      setActionLoading(true);
      const response = await fetch(
        `${API_BASE_URL}/products/${productId}/sync-question-counts`,
        {
          method: "PUT",
        }
      );

      if (!response.ok) {
        throw new Error("Không thể đồng bộ số lượng câu hỏi");
      }

      // Reload data to reflect changes
      await Promise.all([fetchExams(), fetchProduct()]);
      
      toast({
        title: "Thành công",
        description: "Đã cập nhật số lượng câu hỏi thành công.",
      });
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Lỗi không xác định";
      console.error("Lỗi khi đồng bộ:", errorMessage);
      toast({
        title: "Lỗi",
        description: "Không thể cập nhật số lượng câu hỏi. Vui lòng thử lại.",
        variant: "destructive",
      });
    } finally {
      setActionLoading(false);
    }
  };

  // Chuyển đổi trạng thái đề thi sang text hiển thị
  const getStatusText = (status: string) => {
    switch (status) {
      case "active":
        return "Hoạt động";
      case "inactive":
        return "Ngừng hoạt động";
      case "draft":
        return "Bản nháp";
      default:
        return status;
    }
  };

  // Format thời gian tạo
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
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
      <CardHeader className="flex flex-row items-center justify-between">
        <div className="flex flex-col space-y-1.5">
          <CardTitle className="text-3xl font-bold">
            {product?.name ? `Đề thi - ${product.name}` : "Đề thi"}
          </CardTitle>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => router.push("/list-product")}
        >
          <ArrowLeft className="mr-2 h-4 w-4" /> Quay lại
        </Button>
      </CardHeader>
      <CardContent>
        <div className="flex justify-end gap-2 mb-6">
          <Button
            variant="outline"
            onClick={() => router.push(`/product-syllabus/${productId}`)}
          >
            <BookOpen className="mr-2 h-4 w-4" /> Xem toàn bộ câu hỏi
          </Button>
          <Button
            variant="outline"
            onClick={handleSyncCounts}
            disabled={actionLoading}
          >
            <RefreshCw className={`mr-2 h-4 w-4 ${actionLoading ? "animate-spin" : ""}`} /> 
            Cập nhật số câu
          </Button>
          <Button
            variant="outline"
            onClick={() => router.push(`/check-exam/${productId}`)}
          >
            <Pencil className="mr-2 h-4 w-4" /> Check đề thi
          </Button>
          <Dialog>
            <DialogTrigger asChild>
              <Button onClick={() => setEditingExam(null)}>
                <Plus className="mr-2 h-4 w-4" /> Thêm đề thi
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  {editingExam ? "Cập nhật đề thi" : "Thêm đề thi mới"}
                </DialogTitle>
              </DialogHeader>
              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(
                    editingExam
                      ? (values) => updateExam(editingExam._id, values)
                      : onSubmit
                  )}
                  className="space-y-6"
                >
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Tên đề thi</FormLabel>
                        <FormControl>
                          <Input placeholder="Nhập tên đề thi" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Mô tả (không bắt buộc)</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Nhập mô tả cho đề thi"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="duration"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Thời gian làm bài (phút)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            placeholder="Nhập thời gian làm bài"
                            min={1}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="status"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Trạng thái</FormLabel>
                        <Select
                          defaultValue={field.value}
                          onValueChange={field.onChange}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Chọn trạng thái" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="active">Hoạt động</SelectItem>
                            <SelectItem value="inactive">
                              Ngừng hoạt động
                            </SelectItem>
                            <SelectItem value="draft">Bản nháp</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button type="submit" disabled={actionLoading}>
                    {actionLoading ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></div>
                    ) : editingExam ? (
                      "Cập nhật đề thi"
                    ) : (
                      "Tạo đề thi"
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
                <TableHead>Tên đề thi</TableHead>
                <TableHead>Thời gian (phút)</TableHead>
                <TableHead>Trạng thái</TableHead>
                <TableHead>Ngày tạo</TableHead>
                <TableHead className="text-right">Hành động</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {exams.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-4">
                    Chưa có đề thi nào. Hãy tạo đề thi mới!
                  </TableCell>
                </TableRow>
              ) : (
                exams.map((exam) => (
                  <TableRow key={exam._id}>
                    <TableCell className="font-medium">{exam.name}</TableCell>
                    <TableCell>{exam.duration}</TableCell>
                    <TableCell>
                      <span
                        className={`px-2 py-1 rounded-full text-xs ${
                          exam.status === "active"
                            ? "bg-green-100 text-green-800"
                            : exam.status === "inactive"
                            ? "bg-red-100 text-red-800"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {getStatusText(exam.status)}
                      </span>
                    </TableCell>
                    <TableCell>{formatDate(exam.createdAt)}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            router.push(`/exam-questions/${exam._id}`)
                          }
                        >
                          <BookOpen className="w-4 h-4 mr-1" />
                          Quản lý câu hỏi
                        </Button>

                        <Dialog
                          open={editingExam?._id === exam._id}
                          onOpenChange={(open) =>
                            setEditingExam(open ? exam : null)
                          }
                        >
                          <DialogTrigger asChild>
                            <Button variant="outline" size="icon">
                              <Pencil className="h-4 w-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Cập nhật đề thi</DialogTitle>
                            </DialogHeader>
                            <Form {...form}>
                              <form
                                onSubmit={form.handleSubmit((values) =>
                                  updateExam(exam._id, values)
                                )}
                                className="space-y-6"
                              >
                                <FormField
                                  control={form.control}
                                  name="name"
                                  render={({ field }) => (
                                    <FormItem>
                                      <FormLabel>Tên đề thi</FormLabel>
                                      <FormControl>
                                        <Input
                                          placeholder="Nhập tên đề thi"
                                          {...field}
                                        />
                                      </FormControl>
                                      <FormMessage />
                                    </FormItem>
                                  )}
                                />

                                <FormField
                                  control={form.control}
                                  name="description"
                                  render={({ field }) => (
                                    <FormItem>
                                      <FormLabel>
                                        Mô tả (không bắt buộc)
                                      </FormLabel>
                                      <FormControl>
                                        <Textarea
                                          placeholder="Nhập mô tả cho đề thi"
                                          {...field}
                                        />
                                      </FormControl>
                                      <FormMessage />
                                    </FormItem>
                                  )}
                                />

                                <FormField
                                  control={form.control}
                                  name="duration"
                                  render={({ field }) => (
                                    <FormItem>
                                      <FormLabel>
                                        Thời gian làm bài (phút)
                                      </FormLabel>
                                      <FormControl>
                                        <Input
                                          type="number"
                                          placeholder="Nhập thời gian làm bài"
                                          min={1}
                                          {...field}
                                        />
                                      </FormControl>
                                      <FormMessage />
                                    </FormItem>
                                  )}
                                />

                                <FormField
                                  control={form.control}
                                  name="status"
                                  render={({ field }) => (
                                    <FormItem>
                                      <FormLabel>Trạng thái</FormLabel>
                                      <Select
                                        defaultValue={field.value}
                                        onValueChange={field.onChange}
                                      >
                                        <FormControl>
                                          <SelectTrigger>
                                            <SelectValue placeholder="Chọn trạng thái" />
                                          </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                          <SelectItem value="active">
                                            Hoạt động
                                          </SelectItem>
                                          <SelectItem value="inactive">
                                            Ngừng hoạt động
                                          </SelectItem>
                                          <SelectItem value="draft">
                                            Bản nháp
                                          </SelectItem>
                                        </SelectContent>
                                      </Select>
                                      <FormMessage />
                                    </FormItem>
                                  )}
                                />

                                <Button type="submit" disabled={actionLoading}>
                                  {actionLoading ? (
                                    <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></div>
                                  ) : (
                                    "Cập nhật đề thi"
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
                                Hành động này không thể hoàn tác. Điều này sẽ
                                xóa vĩnh viễn đề thi.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Hủy</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => deleteExam(exam._id)}
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
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
