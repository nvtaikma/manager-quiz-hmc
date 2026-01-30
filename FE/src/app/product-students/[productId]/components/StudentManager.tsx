"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import {
  Search,
  Plus,
  Trash2,
  Edit,
  Users,
  BookOpen,
  SearchIcon,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

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
import { CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { API_BASE_URL } from "@/contants/api";

interface Student {
  _id: string;
  email: string;
  productId: string;
}

interface PaginationData {
  total: number;
  page: number;
  totalPages: number;
}

interface StudentSearchResponse {
  students: Student[];
  pagination: PaginationData;
}

const formSchema = z.object({
  email: z.string().email("Email không hợp lệ").min(1, "Email là bắt buộc"),
});

const ITEMS_PER_PAGE = 5; // Số items trên mỗi trang

const StudentManager = ({ productId }: { productId: string }) => {
  const router = useRouter();
  const [students, setStudents] = useState<Student[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [studentCount, setStudentCount] = useState<number | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalStudents, setTotalStudents] = useState(0); // Tổng số sinh viên
  const [pagination, setPagination] = useState<PaginationData>({
    total: 0,
    page: 1,
    totalPages: 1,
  });
  const { toast } = useToast();
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
    },
  });

  useEffect(() => {
    if (isSearching && searchTerm) {
      fetchSearchStudents(searchTerm, 1);
    } else {
      fetchStudents();
      fetchStudentCount();
    }
  }, [productId]);

  useEffect(() => {
    if (isSearching && searchTerm) {
      // Khi search, fetch search results với trang hiện tại
      fetchSearchStudents(searchTerm, currentPage);
    } else if (!isSearching && currentPage > 1) {
      // Khi normal mode và currentPage > 1, fetch students từ trang đó
      fetchStudents(currentPage);
    }
  }, [currentPage]);

  const fetchStudentCount = async () => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/students/count/${productId}`
      );
      if (!response.ok) throw new Error("Failed to fetch student count");
      const data = await response.json();
      setStudentCount(data?.data || 0);
    } catch (error) {
      console.error("Error fetching student count:", error);
    }
  };

  const fetchSearchStudents = async (keyword: string, page: number = 1) => {
    try {
      setIsLoading(true);
      const response = await fetch(
        `${API_BASE_URL}/students/search/${productId}?keyword=${encodeURIComponent(
          keyword
        )}&page=${page}`
      );
      if (!response.ok) throw new Error("Failed to search students");
      const data = await response.json();
      const responseData = data?.data as StudentSearchResponse;
      setStudents(responseData?.students || []);
      setPagination(
        responseData?.pagination || { total: 0, page: 1, totalPages: 1 }
      );
    } catch (error) {
      console.error("Error searching students:", error);
      toast({
        title: "Lỗi",
        description: "Không thể tìm kiếm sinh viên",
        variant: "destructive",
      });
      setStudents([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(1);

    if (value.trim()) {
      setIsSearching(true);
      fetchSearchStudents(value, 1);
    } else {
      setIsSearching(false);
      fetchStudents();
      fetchStudentCount();
    }
  };

  // const fetchStudents = async () => {
  //   try {
  //     const response = await fetch(
  //       `${process.env.NEXT_PUBLIC_API_URL}/students/${productId}`
  //     );
  //     if (!response.ok) throw new Error("Failed to fetch students");
  //     const data = await response.json();
  //     const studentsList = data?.data?.students || [];
  //     setStudents(studentsList);
  //     // setStudentCount(studentsList.length);
  //     console.log("Fetched students:", data);
  //   } catch (error) {
  //     console.error("Error fetching students:", error);
  //     toast({
  //       title: "Lỗi",
  //       description: "Không thể tải danh sách sinh viên",
  //       variant: "destructive",
  //     });
  //     setStudents([]);
  //   } finally {
  //     setIsLoading(false);
  //   }
  // };

  // const handleAddStudent = async (values: z.infer<typeof formSchema>) => {
  //   try {
  //     const response = await fetch(
  //       `${process.env.NEXT_PUBLIC_API_URL}/students`,
  //       {
  //         method: "POST",
  //         headers: {
  //           "Content-Type": "application/json",
  //         },
  //         body: JSON.stringify({
  //           ...values,
  //           productId,
  //         }),
  //       }
  //     );

  //     const data = await response.json();

  //     if (data?.data.message === "User already in the class") {
  //       toast({
  //         title: "Lỗi",
  //         description: "Sinh viên đã tồn tại. Vui lòng thử lại.",
  //         variant: "destructive",
  //       });
  //       return;
  //     }

  //     if (!response.ok) throw new Error("Failed to add student");

  //     // Đóng dialog và reset form trước khi cập nhật state
  //     setShowAddDialog(false);
  //     form.reset();

  //     // Cập nhật state sau khi đóng dialog
  //     const newStudent = {
  //       _id: data.data._id,
  //       email: values.email,
  //       productId: productId,
  //     };

  //     setStudents((prevStudents) => [...prevStudents, newStudent]);
  //     setStudentCount((prevCount) => (prevCount || 0) + 1);

  //     toast({
  //       title: "Thành công",
  //       description: "Thêm sinh viên thành công.",
  //     });
  //   } catch (error) {
  //     toast({
  //       title: "Lỗi",
  //       description: "Thêm sinh viên không thành công. Vui lòng thử lại.",
  //       variant: "destructive",
  //     });
  //   }
  // };

  // Trong hàm fetchStudents
  const fetchStudents = async (page: number = 1) => {
    try {
      setIsLoading(true);
      const url = `${API_BASE_URL}/students/${productId}?page=${page}&limit=${ITEMS_PER_PAGE}`;

      const response = await fetch(url);
      if (!response.ok) throw new Error("Failed to fetch students");
      const data = await response.json();

      // Handle API response structure
      const studentsList = data?.data?.students || data?.data || [];
      const paginationData = data?.data?.pagination || data?.pagination;

      setStudents(studentsList);

      // Cập nhật pagination từ API
      if (paginationData && paginationData.total) {
        setPagination({
          total: paginationData.total,
          page: paginationData.page || page,
          totalPages:
            paginationData.totalPages ||
            Math.ceil(paginationData.total / ITEMS_PER_PAGE),
        });
        setTotalStudents(paginationData.total);
      } else {
        // Fallback: Nếu API không trả về pagination, sử dụng studentCount từ API
        const total = data?.total || studentCount || 0;
        const calculatedPages = Math.ceil(total / ITEMS_PER_PAGE) || 1;

        setPagination({
          total: total,
          page: page,
          totalPages: calculatedPages,
        });
        setTotalStudents(total);
      }

      console.log("Fetched students:", {
        studentCount: studentsList.length,
        pagination: paginationData,
        total: paginationData?.total || studentCount,
      });
    } catch (error) {
      console.error("Error fetching students:", error);
      toast({
        title: "Lỗi",
        description: "Không thể tải danh sách sinh viên",
        variant: "destructive",
      });
      setStudents([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Trong hàm handleAddStudent
  const handleAddStudent = async (values: z.infer<typeof formSchema>) => {
    try {
      const response = await fetch(`${API_BASE_URL}/students`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...values,
          productId,
        }),
      });

      const data = await response.json();

      if (data?.data?.message === "User already in the class") {
        toast({
          title: "Lỗi",
          description: "Sinh viên đã tồn tại. Vui lòng thử lại.",
          variant: "destructive",
        });
        return;
      }

      if (!response.ok) {
        // Có thể thêm log lỗi chi tiết hơn từ `data` nếu API trả về
        console.error("Failed to add student:", data);
        throw new Error(data?.message || "Failed to add student");
      }

      setShowAddDialog(false);
      form.reset();

      toast({
        title: "Thành công",
        description: "Thêm sinh viên thành công.",
      });

      // Fetch lại dữ liệu thay vì cập nhật state thủ công
      if (isSearching && searchTerm) {
        fetchSearchStudents(searchTerm, 1);
      } else {
        fetchStudents();
        fetchStudentCount();
      }
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "Lỗi không xác định";
      console.error("Error adding student:", error);
      toast({
        title: "Lỗi",
        description:
          errorMessage || "Thêm sinh viên không thành công. Vui lòng thử lại.",
        variant: "destructive",
      });
    }
  };
  const handleDeleteStudent = async (studentId: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/students//${studentId}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("Failed to delete student");

      toast({
        title: "Thành công",
        description: "Xóa sinh viên thành công.",
      });
      if (isSearching && searchTerm) {
        fetchSearchStudents(searchTerm, currentPage);
      } else {
        fetchStudents(currentPage);
        fetchStudentCount();
      }
    } catch (error) {
      toast({
        title: "Lỗi",
        description: "Không thể xóa sinh viên. Vui lòng thử lại.",
        variant: "destructive",
      });
    }
  };

  // Khi sử dụng search API, không cần filter thêm vì API đã trả về kết quả đã lọc
  const filteredStudents = isSearching
    ? students
    : Array.isArray(students)
    ? students.filter(
        (student) =>
          student &&
          student._id && // <-- Thêm kiểm tra này
          student.email &&
          student.email.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : [];

  return (
    <div className="rounded-md">
      <CardHeader className="px-0 pt-0">
        <div className="flex items-center">
          {studentCount !== null && (
            <Badge variant="secondary" className="">
              {studentCount} sinh viên
            </Badge>
          )}
        </div>
      </CardHeader>

      <div className="flex justify-between mb-4 gap-4">
        <div className="relative max-w-sm">
          <SearchIcon className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Tìm kiếm sinh viên..."
            value={searchTerm}
            onChange={(e) => handleSearch(e.target.value)}
            className="pl-8"
          />
        </div>

        <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Thêm sinh viên
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Thêm sinh viên mới</DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(handleAddStudent)}
                className="space-y-4"
              >
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          type="email"
                          placeholder="Email của sinh viên"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" className="w-full">
                  Thêm sinh viên
                </Button>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Pagination Info & Controls */}
      {pagination.totalPages > 0 && (
        <div className="mb-4 flex items-center justify-between text-sm">
          <span className="text-muted-foreground">
            {isSearching ? "Kết quả tìm kiếm: " : "Hiển thị: "}
            <strong>{students.length}</strong> sinh viên | Trang{" "}
            <strong>{pagination.page}</strong> /{" "}
            <strong>{pagination.totalPages}</strong> | Tổng cộng:{" "}
            <strong>{pagination.total}</strong> sinh viên
          </span>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
              disabled={pagination.page === 1 || isLoading}
            >
              <ChevronLeft className="h-4 w-4" />
              Trước
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                setCurrentPage((prev) =>
                  Math.min(pagination.totalPages, prev + 1)
                )
              }
              disabled={pagination.page === pagination.totalPages || isLoading}
            >
              Tiếp
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Email sinh viên</TableHead>
              <TableHead className="text-right">Hành động</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={2} className="text-center">
                  Đang tải...
                </TableCell>
              </TableRow>
            ) : filteredStudents.length === 0 ? (
              <TableRow>
                <TableCell colSpan={2} className="text-center">
                  Không tìm thấy sinh viên nào
                </TableCell>
              </TableRow>
            ) : (
              filteredStudents.map((student) => (
                <TableRow key={student._id}>
                  <TableCell>{student.email}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-red-500 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Xác nhận xóa</AlertDialogTitle>
                            <AlertDialogDescription>
                              Bạn có chắc chắn muốn xóa sinh viên có email{" "}
                              <span className="font-semibold">
                                {student.email}
                              </span>
                              ? Hành động này không thể hoàn tác.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Hủy</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDeleteStudent(student._id)}
                              className="bg-red-500 hover:bg-red-700"
                            >
                              Xóa
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
    </div>
  );
};

export { StudentManager };
