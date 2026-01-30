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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Pencil,
  Trash2,
  ArrowLeft,
  Search,
  X,
  Check,
  Eye,
  Upload as UploadIcon,
  ImageIcon,
  ChevronUp,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useRouter } from "next/navigation";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useDebounce } from "@/hooks/useDebounce";
import { useRef } from "react";
import { API_BASE_URL } from "@/contants/api";
import { handleImageUpload } from "@/lib/upload";

interface Answer {
  _id: string;
  text: string;
  isCorrect: boolean;
  order: number;
}

interface Question {
  _id: string;
  examId: string;
  examName: string;
  text: string;
  image?: string;
  answers: Answer[];
  difficulty: "easy" | "medium" | "hard";
  createdAt: string;
  updatedAt: string;
}

interface Exam {
  _id: string;
  name: string;
  productId: string;
}

interface Product {
  _id: string;
  name: string;
}

const answerSchema = z.object({
  text: z
    .string()
    .min(1, { message: "Nội dung câu trả lời không được để trống" }),
  isCorrect: z.boolean(),
  order: z.number(),
  _id: z.string().optional(),
});

const questionSchema = z.object({
  text: z
    .string()
    .min(3, { message: "Nội dung câu hỏi phải có ít nhất 3 ký tự" }),
  image: z.string().optional(),
  answers: z
    .array(answerSchema)
    .min(2, { message: "Phải có ít nhất 2 câu trả lời" }),
  difficulty: z.enum(["easy", "medium", "hard"], {
    message: "Độ khó phải là một trong các giá trị: dễ, trung bình, khó",
  }),
});

// Component quản lý đề cương
export function SyllabusManager({ productId }: { productId: string }) {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [filteredQuestions, setFilteredQuestions] = useState<Question[]>([]);
  const [exams, setExams] = useState<Exam[]>([]);
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedExamFilter, setSelectedExamFilter] = useState<string>("all");
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string>("");
  const [showImagePreview, setShowImagePreview] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const { toast } = useToast();
  const router = useRouter();
  const imageFileInputRef = useRef<HTMLInputElement>(null);

  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  const form = useForm<z.infer<typeof questionSchema>>({
    resolver: zodResolver(questionSchema),
    defaultValues: {
      text: "",
      image: "",
      answers: [
        { text: "", isCorrect: false, order: 1 },
        { text: "", isCorrect: false, order: 2 },
        { text: "", isCorrect: false, order: 3 },
        { text: "", isCorrect: false, order: 4 },
      ],
      difficulty: "medium",
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
    }
  }, [productId, toast]);

  // Hàm lấy tất cả câu hỏi từ các đề thi
  const fetchAllQuestions = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `${API_BASE_URL}/products/${productId}/exams`
      );
      if (!response.ok) {
        throw new Error("Không thể tải danh sách đề thi");
      }
      const examData = await response.json();
      const examList = examData.data.data || [];

      if (examList.length === 0) {
        setQuestions([]);
        setFilteredQuestions([]);
        return;
      }

      // Lấy tất cả câu hỏi từ các đề thi
      const allQuestions: Question[] = [];
      for (const exam of examList) {
        try {
          const questionResponse = await fetch(
            `${API_BASE_URL}/exams/${exam._id}/questions`
          );
          if (questionResponse.ok) {
            const questionData = await questionResponse.json();
            const examQuestions = (questionData.data.data || []).map(
              (q: Omit<Question, "examName">) => ({
                ...q,
                examName: exam.name,
              })
            );
            allQuestions.push(...examQuestions);
          }
        } catch (error) {
          console.error(`Lỗi khi tải câu hỏi cho đề thi ${exam.name}:`, error);
        }
      }

      setQuestions(allQuestions);
      setFilteredQuestions(allQuestions);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Lỗi không xác định";
      console.error("Lỗi khi tải câu hỏi:", errorMessage);
      toast({
        title: "Lỗi",
        description: "Không thể tải danh sách câu hỏi. Vui lòng thử lại.",
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
    fetchAllQuestions();
  }, [fetchProduct, fetchExams, fetchAllQuestions]);

  // Handle scroll to show/hide scroll to top button
  useEffect(() => {
    const handleScroll = () => {
      const scrollTop =
        window.pageYOffset || document.documentElement.scrollTop;
      setShowScrollTop(scrollTop > 300);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Filter câu hỏi theo search term và exam filter
  useEffect(() => {
    let filtered = questions;

    // Filter theo exam
    if (selectedExamFilter !== "all") {
      filtered = filtered.filter((q) => q.examId === selectedExamFilter);
    }

    // Filter theo search term
    if (debouncedSearchTerm) {
      const searchLower = debouncedSearchTerm.toLowerCase();
      filtered = filtered.filter(
        (q) =>
          q.text.toLowerCase().includes(searchLower) ||
          q.examName.toLowerCase().includes(searchLower) ||
          q.answers.some((a) => a.text.toLowerCase().includes(searchLower))
      );
    }

    setFilteredQuestions(filtered);
  }, [questions, debouncedSearchTerm, selectedExamFilter]);

  // Cập nhật form khi có question được chọn để sửa
  useEffect(() => {
    if (editingQuestion) {
      form.setValue("text", editingQuestion.text);
      form.setValue("image", editingQuestion.image || "");
      form.setValue("answers", editingQuestion.answers);
      form.setValue("difficulty", editingQuestion.difficulty);
    } else {
      form.reset({
        text: "",
        image: "",
        answers: [
          { text: "", isCorrect: false, order: 1 },
          { text: "", isCorrect: false, order: 2 },
          { text: "", isCorrect: false, order: 3 },
          { text: "", isCorrect: false, order: 4 },
        ],
        difficulty: "medium",
      });
    }
  }, [editingQuestion, form]);

  // Cập nhật câu hỏi
  const updateQuestion = async (
    questionId: string,
    values: z.infer<typeof questionSchema>
  ) => {
    try {
      setActionLoading(true);
      const response = await fetch(`${API_BASE_URL}/questions/${questionId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(values),
      });

      if (!response.ok) {
        throw new Error("Không thể cập nhật câu hỏi");
      }

      await fetchAllQuestions();
      setEditingQuestion(null);
      toast({
        title: "Thành công",
        description: "Đã cập nhật câu hỏi thành công.",
      });
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Lỗi không xác định";
      console.error("Lỗi khi cập nhật câu hỏi:", errorMessage);
      toast({
        title: "Lỗi",
        description: "Không thể cập nhật câu hỏi. Vui lòng thử lại.",
        variant: "destructive",
      });
    } finally {
      setActionLoading(false);
    }
  };

  // Xóa câu hỏi
  const deleteQuestion = async (questionId: string) => {
    try {
      setActionLoading(true);
      const response = await fetch(`${API_BASE_URL}/questions/${questionId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Không thể xóa câu hỏi");
      }

      await fetchAllQuestions();
      toast({
        title: "Thành công",
        description: "Đã xóa câu hỏi thành công.",
      });
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Lỗi không xác định";
      console.error("Lỗi khi xóa câu hỏi:", errorMessage);
      toast({
        title: "Lỗi",
        description: "Không thể xóa câu hỏi. Vui lòng thử lại.",
        variant: "destructive",
      });
    } finally {
      setActionLoading(false);
    }
  };

  // Chuyển đổi độ khó sang text hiển thị
  const getDifficultyText = (difficulty: string) => {
    switch (difficulty) {
      case "easy":
        return "Dễ";
      case "medium":
        return "Trung bình";
      case "hard":
        return "Khó";
      default:
        return difficulty;
    }
  };

  // Clear search
  const clearSearch = () => {
    setSearchTerm("");
  };

  // Xử lý thay đổi câu trả lời đúng
  const handleAnswerCorrectChange = (index: number) => {
    const currentAnswers = form.getValues("answers");
    const updatedAnswers = currentAnswers.map((answer, i) => ({
      ...answer,
      isCorrect: i === index,
    }));
    form.setValue("answers", updatedAnswers, { shouldDirty: true });
    form.trigger("answers");
  };

  // Hàm xem trước ảnh
  const handlePreviewImage = () => {
    const imageUrl = form.getValues("image");
    if (imageUrl && imageUrl.trim() !== "") {
      setImagePreviewUrl(imageUrl);
      setShowImagePreview(true);
    } else {
      toast({
        title: "Thông báo",
        description: "Vui lòng nhập URL hình ảnh trước khi xem trước",
      });
    }
  };

  // Hàm scroll to top
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <Card className="w-full mx-auto">
      <CardHeader className="flex flex-row items-center justify-between">
        <div className="flex flex-col space-y-1.5">
          <CardTitle className="text-3xl font-bold">
            {product?.name ? `Đề cương - ${product.name}` : "Đề cương"}
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Tổng số câu hỏi: {filteredQuestions.length} / {questions.length}
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => router.push(`/product-exams/${productId}`)}
        >
          <ArrowLeft className="mr-2 h-4 w-4" /> Quay lại đề thi
        </Button>
      </CardHeader>
      <CardContent>
        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Tìm kiếm câu hỏi..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8 pr-8"
            />
            {searchTerm && (
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-1 top-1 h-6 w-6"
                onClick={clearSearch}
              >
                <X className="h-3 w-3" />
              </Button>
            )}
          </div>

          {/* Exam Filter */}
          <div className="w-full md:w-64">
            <Select
              value={selectedExamFilter}
              onValueChange={setSelectedExamFilter}
            >
              <SelectTrigger>
                <SelectValue placeholder="Chọn đề thi" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả đề thi</SelectItem>
                {exams.map((exam) => (
                  <SelectItem key={exam._id} value={exam._id}>
                    {exam.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Questions Table */}
        <div className="border rounded-md">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[75%] md:w-auto">Câu hỏi</TableHead>
                <TableHead className="hidden md:table-cell">Đề thi</TableHead>
                <TableHead className="hidden md:table-cell">Độ khó</TableHead>
                <TableHead className="hidden md:table-cell">
                  Số câu trả lời
                </TableHead>
                <TableHead className="text-right w-[25%] md:w-auto">
                  Hành động
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredQuestions.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={2} className="text-center py-8 md:hidden">
                    {questions.length === 0
                      ? "Chưa có câu hỏi nào. Hãy thêm câu hỏi vào các đề thi!"
                      : "Không tìm thấy câu hỏi nào phù hợp với bộ lọc."}
                  </TableCell>
                  <TableCell
                    colSpan={5}
                    className="text-center py-8 hidden md:table-cell"
                  >
                    {questions.length === 0
                      ? "Chưa có câu hỏi nào. Hãy thêm câu hỏi vào các đề thi!"
                      : "Không tìm thấy câu hỏi nào phù hợp với bộ lọc."}
                  </TableCell>
                </TableRow>
              ) : (
                filteredQuestions.map((question) => (
                  <TableRow key={question._id}>
                    <TableCell className="font-medium">
                      <div className="max-w-none md:max-w-md">
                        <p className="line-clamp-3 md:line-clamp-2">
                          {question.text}
                        </p>
                        {question.image && (
                          <span className="text-xs text-muted-foreground">
                            (Có hình ảnh)
                          </span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      <Badge variant="outline">{question.examName}</Badge>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      <span
                        className={`px-2 py-1 rounded-full text-xs ${
                          question.difficulty === "easy"
                            ? "bg-green-100 text-green-800"
                            : question.difficulty === "hard"
                            ? "bg-red-100 text-red-800"
                            : "bg-yellow-100 text-yellow-800"
                        }`}
                      >
                        {getDifficultyText(question.difficulty)}
                      </span>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      {question.answers.length} câu trả lời
                      <br />
                      <span className="text-xs text-muted-foreground">
                        ({question.answers.filter((a) => a.isCorrect).length}{" "}
                        đúng)
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end space-x-2">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button
                              variant="outline"
                              size="icon"
                              onClick={() => setEditingQuestion(question)}
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                            <DialogHeader>
                              <DialogTitle>Cập nhật câu hỏi</DialogTitle>
                            </DialogHeader>
                            <Form {...form}>
                              <form
                                onSubmit={form.handleSubmit((values) =>
                                  updateQuestion(question._id, values)
                                )}
                                className="space-y-6"
                              >
                                <FormField
                                  control={form.control}
                                  name="text"
                                  render={({ field }) => (
                                    <FormItem>
                                      <FormLabel>Nội dung câu hỏi</FormLabel>
                                      <FormControl>
                                        <Textarea
                                          placeholder="Nhập nội dung câu hỏi"
                                          className="min-h-[100px]"
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
                                        Hình ảnh (URL, không bắt buộc)
                                      </FormLabel>
                                      <div className="flex gap-2">
                                        <div className="flex-1 relative">
                                          <FormControl>
                                            <Input
                                              placeholder="Nhập URL hình ảnh"
                                              {...field}
                                            />
                                          </FormControl>
                                          {field.value && (
                                            <Button
                                              type="button"
                                              variant="ghost"
                                              size="icon"
                                              className="absolute right-0 top-0"
                                              onClick={() => {
                                                form.setValue("image", "", {
                                                  shouldDirty: true,
                                                });
                                              }}
                                            >
                                              <X className="h-4 w-4" />
                                            </Button>
                                          )}
                                        </div>
                                        <div className="flex gap-1">
                                          <Button
                                            type="button"
                                            variant="outline"
                                            size="icon"
                                            onClick={handlePreviewImage}
                                            title="Xem trước ảnh"
                                            disabled={!field.value}
                                          >
                                            <Eye className="h-4 w-4" />
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
                                              size="icon"
                                              onClick={() =>
                                                imageFileInputRef.current?.click()
                                              }
                                              disabled={uploadingImage}
                                              title="Tải lên ảnh mới"
                                            >
                                              {uploadingImage ? (
                                                <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-primary"></div>
                                              ) : (
                                                <UploadIcon className="h-4 w-4" />
                                              )}
                                            </Button>
                                          </div>
                                        </div>
                                      </div>
                                      <FormMessage />
                                      {field.value && (
                                        <p className="text-xs text-muted-foreground mt-1 truncate">
                                          <ImageIcon className="h-3 w-3 inline-block mr-1" />
                                          {field.value}
                                        </p>
                                      )}
                                    </FormItem>
                                  )}
                                />

                                <FormField
                                  control={form.control}
                                  name="difficulty"
                                  render={({ field }) => (
                                    <FormItem>
                                      <FormLabel>Độ khó</FormLabel>
                                      <Select
                                        onValueChange={field.onChange}
                                        defaultValue={field.value}
                                      >
                                        <FormControl>
                                          <SelectTrigger>
                                            <SelectValue placeholder="Chọn độ khó" />
                                          </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                          <SelectItem value="easy">
                                            Dễ
                                          </SelectItem>
                                          <SelectItem value="medium">
                                            Trung bình
                                          </SelectItem>
                                          <SelectItem value="hard">
                                            Khó
                                          </SelectItem>
                                        </SelectContent>
                                      </Select>
                                      <FormMessage />
                                    </FormItem>
                                  )}
                                />

                                <div>
                                  <FormLabel>Câu trả lời</FormLabel>
                                  <div className="space-y-4 mt-2">
                                    {form
                                      .watch("answers")
                                      .map((answer, index) => (
                                        <div
                                          key={index}
                                          className="flex items-center gap-3"
                                        >
                                          <FormField
                                            control={form.control}
                                            name={`answers.${index}.text`}
                                            render={({ field }) => (
                                              <FormItem className="flex-1">
                                                <FormControl>
                                                  <Input
                                                    placeholder={`Câu trả lời ${
                                                      index + 1
                                                    }`}
                                                    {...field}
                                                  />
                                                </FormControl>
                                                <FormMessage />
                                              </FormItem>
                                            )}
                                          />
                                          <Button
                                            type="button"
                                            variant={
                                              answer.isCorrect
                                                ? "default"
                                                : "outline"
                                            }
                                            size="icon"
                                            onClick={() =>
                                              handleAnswerCorrectChange(index)
                                            }
                                            className={`transition-all duration-200 ease-in-out ${
                                              answer.isCorrect
                                                ? "bg-primary hover:bg-primary/90"
                                                : "hover:bg-primary/10"
                                            }`}
                                            title={
                                              answer.isCorrect
                                                ? "Đáp án đúng"
                                                : "Chọn làm đáp án đúng"
                                            }
                                          >
                                            <Check
                                              className={`h-4 w-4 ${
                                                answer.isCorrect
                                                  ? "text-white scale-125 transition-all"
                                                  : "text-muted-foreground"
                                              }`}
                                            />
                                          </Button>
                                        </div>
                                      ))}
                                  </div>
                                  {form.formState.errors.answers && (
                                    <p className="text-sm font-medium text-destructive mt-2">
                                      {form.formState.errors.answers.message}
                                    </p>
                                  )}
                                </div>

                                <Button
                                  type="submit"
                                  disabled={actionLoading}
                                  className="w-full"
                                >
                                  {actionLoading ? (
                                    <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></div>
                                  ) : (
                                    "Cập nhật câu hỏi"
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
                                xóa vĩnh viễn câu hỏi khỏi đề thi.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Hủy</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => deleteQuestion(question._id)}
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

        {/* Image Preview Dialog */}
        <Dialog open={showImagePreview} onOpenChange={setShowImagePreview}>
          <DialogContent className="max-w-2xl">
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
                    description: "Không thể tải hình ảnh",
                    variant: "destructive",
                  });
                  setShowImagePreview(false);
                }}
              />
            </div>
          </DialogContent>
        </Dialog>

        {/* Scroll to Top Button */}
        {showScrollTop && (
          <Button
            onClick={scrollToTop}
            className="fixed bottom-6 right-6 z-50 rounded-full shadow-lg hover:shadow-xl transition-all duration-300"
            size="icon"
            aria-label="Cuộn lên đầu trang"
          >
            <ChevronUp className="h-4 w-4" />
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
