"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useToast } from "@/hooks/use-toast";
import { useDebounce } from "@/hooks/useDebounce";
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
  DialogFooter,
  DialogDescription,
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
  ArrowLeft,
  Check,
  FileSpreadsheet,
  Upload as UploadIcon,
  X,
  FileUp,
  CheckCircle2,
  Eye,
  ImageIcon,
  Search,
  Copy,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { useRouter } from "next/navigation";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import * as XLSX from "xlsx";
import { API_BASE_URL } from "@/contants/api";
import { handleImageUpload } from "@/lib/upload";

interface Answer {
  text: string;
  isCorrect: boolean;
  order: number;
  _id?: string;
}

interface Question {
  _id: string;
  examId: string;
  text: string;
  image?: string;
  answers: Answer[];
  difficulty: "easy" | "medium" | "hard";
  orderNumber?: number;
  createdAt: string;
  updatedAt: string;
}

interface Exam {
  _id: string;
  name: string;
  duration: number;
}

interface ExcelQuestion {
  text: string;
  image: string;
  answer_text_1: string;
  answer_text_2: string;
  answer_text_3: string;
  answer_text_4: string;
  isCorrect: string | number;
  difficulty: string;
  [key: string]: string | number;
}

interface FormattedQuestion {
  text: string;
  image: string;
  answers: {
    text: string;
    isCorrect: boolean;
    order: number;
  }[];
  difficulty: "easy" | "medium" | "hard";
  orderNumber: number;
}

// Schema cho form câu hỏi
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
  orderNumber: z
    .number()
    .int()
    .positive({ message: "Số thứ tự phải là số nguyên dương" })
    .optional(),
});

// Component quản lý danh sách câu hỏi
export function QuestionManager({ examId }: { examId: string }) {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [allQuestions, setAllQuestions] = useState<Question[]>([]);
  const [exam, setExam] = useState<Exam | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [fetchingQuestion, setFetchingQuestion] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);
  const [showExcelDialog, setShowExcelDialog] = useState(false);
  const [excelData, setExcelData] = useState<FormattedQuestion[]>([]);
  const [excelFile, setExcelFile] = useState<File | null>(null);
  const [excelLoading, setExcelLoading] = useState(false);
  const [importErrors, setImportErrors] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const router = useRouter();
  const [isDragging, setIsDragging] = useState(false);
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string>("");
  const [showImagePreview, setShowImagePreview] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const imageFileInputRef = useRef<HTMLInputElement>(null);

  // Search functionality
  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  // Text parser functionality
  const [textInput, setTextInput] = useState("");
  const [showTextParser, setShowTextParser] = useState(false);

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
      orderNumber: undefined,
    },
  });

  // Lấy thông tin đề thi
  const fetchExam = useCallback(async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/exams/${examId}`);
      if (!response.ok) {
        throw new Error("Không thể tải thông tin đề thi");
      }
      const data = await response.json();
      setExam(data.data);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Lỗi không xác định";
      console.error("Lỗi khi tải thông tin đề thi:", errorMessage);
      toast({
        title: "Lỗi",
        description: "Không thể tải thông tin đề thi. Vui lòng thử lại.",
        variant: "destructive",
      });
    }
  }, [examId, toast]);

  // Lấy danh sách câu hỏi
  const fetchQuestions = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/exams/${examId}/questions`);
      if (!response.ok) {
        throw new Error("Không thể tải danh sách câu hỏi");
      }
      const data = await response.json();
      const questionsData = data.data.data || [];
      setQuestions(questionsData);
      setAllQuestions(questionsData);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Lỗi không xác định";
      console.error("Lỗi khi tải danh sách câu hỏi:", errorMessage);
      toast({
        title: "Lỗi",
        description: "Không thể tải danh sách câu hỏi. Vui lòng thử lại.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [examId, toast]);

  // Load dữ liệu khi component mount
  useEffect(() => {
    fetchExam();
    fetchQuestions();
  }, [fetchExam, fetchQuestions]);

  // Filter questions based on search term
  useEffect(() => {
    if (!debouncedSearchTerm.trim()) {
      setQuestions(allQuestions);
    } else {
      const filtered = allQuestions.filter((question) => {
        const searchLower = debouncedSearchTerm.toLowerCase();
        return (
          question.text.toLowerCase().includes(searchLower) ||
          question.answers.some((answer) =>
            answer.text.toLowerCase().includes(searchLower)
          )
        );
      });
      setQuestions(filtered);
    }
  }, [debouncedSearchTerm, allQuestions]);

  // Cập nhật form khi có câu hỏi được chọn để sửa
  useEffect(() => {
    if (editingQuestion) {
      form.setValue("text", editingQuestion.text);
      form.setValue("image", editingQuestion.image || "");
      form.setValue("answers", [...editingQuestion.answers]);
      form.setValue("difficulty", editingQuestion.difficulty);
      form.setValue("orderNumber", editingQuestion.orderNumber);
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
        orderNumber: undefined,
      });
    }
    // Reset text parser khi chuyển đổi giữa edit và create
    setTextInput("");
    setShowTextParser(false);
  }, [editingQuestion, form]);

  // Thêm câu hỏi mới
  const onSubmit = async (values: z.infer<typeof questionSchema>) => {
    // Kiểm tra xem có đúng 1 câu trả lời đúng không
    const correctAnswers = values.answers.filter((answer) => answer.isCorrect);
    if (correctAnswers.length !== 1) {
      toast({
        title: "Lỗi",
        description: "Phải có đúng 1 câu trả lời đúng.",
        variant: "destructive",
      });
      return;
    }

    try {
      setActionLoading(true);
      const response = await fetch(
        `${API_BASE_URL}/exams/${examId}/questions`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(values),
        }
      );

      if (!response.ok) {
        throw new Error("Không thể tạo câu hỏi");
      }

      await fetchQuestions();
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
        orderNumber: undefined,
      });
      toast({
        title: "Thành công",
        description: "Đã tạo câu hỏi thành công.",
      });
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Lỗi không xác định";
      console.error("Lỗi khi tạo câu hỏi:", errorMessage);
      toast({
        title: "Lỗi",
        description: "Không thể tạo câu hỏi. Vui lòng thử lại.",
        variant: "destructive",
      });
    } finally {
      setActionLoading(false);
    }
  };

  // Cập nhật câu hỏi
  const updateQuestion = async (
    questionId: string,
    values: z.infer<typeof questionSchema>
  ) => {
    // Kiểm tra xem có đúng 1 câu trả lời đúng không
    const correctAnswers = values.answers.filter((answer) => answer.isCorrect);
    if (correctAnswers.length !== 1) {
      toast({
        title: "Lỗi",
        description: "Phải có đúng 1 câu trả lời đúng.",
        variant: "destructive",
      });
      return;
    }

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

      await fetchQuestions();
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

      await fetchQuestions();
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

  // Hiển thị độ khó dưới dạng text
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

  // Lấy thông tin chi tiết của một câu hỏi
  const fetchQuestionDetail = async (questionId: string) => {
    try {
      setFetchingQuestion(true);
      const response = await fetch(`${API_BASE_URL}/questions/${questionId}`);
      if (!response.ok) {
        throw new Error("Không thể tải thông tin câu hỏi");
      }
      const data = await response.json();
      setEditingQuestion(data.data);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Lỗi không xác định";
      console.error("Lỗi khi tải thông tin câu hỏi:", errorMessage);
      toast({
        title: "Lỗi",
        description: "Không thể tải thông tin câu hỏi. Vui lòng thử lại.",
        variant: "destructive",
      });
    } finally {
      setFetchingQuestion(false);
    }
  };

  // Xử lý thay đổi trạng thái đúng/sai của câu trả lời
  const handleAnswerCorrectChange = (index: number) => {
    const currentAnswers = form.getValues("answers");
    const updatedAnswers = currentAnswers.map((answer, i) => ({
      ...answer,
      isCorrect: i === index,
    }));
    form.setValue("answers", updatedAnswers, { shouldDirty: true });
    form.trigger("answers");
  };

  // Hàm xử lý upload ảnh

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

  // Hàm parse text thành câu hỏi trắc nghiệm
  const parseTextToQuestion = () => {
    if (!textInput.trim()) {
      toast({
        title: "Lỗi",
        description: "Vui lòng nhập nội dung câu hỏi để parse",
        variant: "destructive",
      });
      return;
    }

    try {
      // Regex để tách các đáp án A., B., C., D.
      const answerRegex = /^([A-D])\.\s*(.+)$/gm;
      const matches = [...textInput.matchAll(answerRegex)];

      if (matches.length === 0) {
        toast({
          title: "Lỗi",
          description: "Không tìm thấy đáp án A., B., C., D. trong text",
          variant: "destructive",
        });
        return;
      }

      // Tách phần câu hỏi (từ đầu đến trước đáp án đầu tiên)
      const firstAnswerIndex = textInput.indexOf(matches[0][0]);
      const questionText = textInput.substring(0, firstAnswerIndex).trim();

      if (!questionText) {
        toast({
          title: "Lỗi",
          description: "Không tìm thấy nội dung câu hỏi",
          variant: "destructive",
        });
        return;
      }

      // Tạo mảng answers với 4 phần tử mặc định
      const newAnswers = [
        { text: "", isCorrect: false, order: 1 },
        { text: "", isCorrect: false, order: 2 },
        { text: "", isCorrect: false, order: 3 },
        { text: "", isCorrect: false, order: 4 },
      ];

      // Điền dữ liệu từ matches vào newAnswers
      matches.forEach((match) => {
        const answerLetter = match[1];
        const answerText = match[2].trim();
        const answerIndex = answerLetter.charCodeAt(0) - 65; // A=0, B=1, C=2, D=3

        if (answerIndex >= 0 && answerIndex < 4) {
          newAnswers[answerIndex].text = answerText;
        }
      });

      // Cập nhật form
      form.setValue("text", questionText);
      form.setValue("answers", newAnswers);

      // Reset text input và ẩn parser
      setTextInput("");
      setShowTextParser(false);

      toast({
        title: "Thành công",
        description:
          "Đã parse câu hỏi thành công. Vui lòng chọn đáp án đúng và độ khó.",
      });
    } catch (error) {
      console.error("Error parsing text:", error);
      toast({
        title: "Lỗi",
        description:
          "Có lỗi xảy ra khi parse text. Vui lòng kiểm tra định dạng.",
        variant: "destructive",
      });
    }
  };

  // Hàm copy câu hỏi vào clipboard
  const copyQuestionToClipboard = async (question: Question) => {
    try {
      // Format câu hỏi thành text trắc nghiệm
      let questionText = question.text.trim();

      // Thêm xuống dòng nếu câu hỏi không kết thúc bằng dấu chấm hỏi hoặc dấu hai chấm
      if (!questionText.endsWith("?") && !questionText.endsWith(":")) {
        questionText += ":";
      }

      let formattedText = questionText + "\n";

      // Thêm các đáp án với định dạng A., B., C., D.
      const answerLabels = ["A", "B", "C", "D"];
      question.answers
        .sort((a, b) => a.order - b.order)
        .forEach((answer, index) => {
          if (answer.text.trim()) {
            const label = answerLabels[index] || `${index + 1}`;
            formattedText += `${label}. ${answer.text.trim()}\n`;
          }
        });

      // Copy vào clipboard
      await navigator.clipboard.writeText(formattedText.trim());

      toast({
        title: "Thành công",
        description: "Đã sao chép câu hỏi vào clipboard",
      });
    } catch (error) {
      console.error("Error copying to clipboard:", error);
      toast({
        title: "Lỗi",
        description: "Không thể sao chép câu hỏi. Vui lòng thử lại.",
        variant: "destructive",
      });
    }
  };

  // Tạo form câu hỏi
  const renderQuestionForm = (
    onSubmitHandler: (values: z.infer<typeof questionSchema>) => Promise<void>
  ) => (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmitHandler)} className="space-y-6">
        {/* Text Parser Section */}
        <div className="border rounded-lg p-4 bg-muted/30">
          <div className="flex items-center justify-between mb-3">
            <Label className="text-sm font-medium">Nhập câu hỏi từ text</Label>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setShowTextParser(!showTextParser)}
            >
              {showTextParser ? "Ẩn" : "Hiển thị"}
            </Button>
          </div>

          {showTextParser && (
            <div className="space-y-3">
              <Textarea
                placeholder="Dán nội dung câu hỏi trắc nghiệm ở đây...&#10;&#10;Ví dụ:&#10;Môn học nghiên cứu cơ sở lý luận và kỹ thuật thực hành về pha chế?&#10;A. Môn bào chế&#10;B. Môn dược lý&#10;C. Môn thực vật&#10;D. Môn dược liệu"
                value={textInput}
                onChange={(e) => setTextInput(e.target.value)}
                className="min-h-[120px] resize-none"
              />
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={parseTextToQuestion}
                  disabled={!textInput.trim()}
                >
                  Parse câu hỏi
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setTextInput("");
                    setShowTextParser(false);
                  }}
                >
                  Hủy
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                <strong>Định dạng:</strong> Nhập câu hỏi, sau đó xuống dòng và
                nhập các đáp án A., B., C., D.
              </p>
            </div>
          )}
        </div>
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
              <FormLabel>Hình ảnh (URL, không bắt buộc)</FormLabel>
              <div className="flex gap-2">
                <div className="flex-1 relative">
                  <FormControl>
                    <Input placeholder="Nhập URL hình ảnh" {...field} />
                  </FormControl>
                  {field.value && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute right-0 top-0"
                      onClick={() => {
                        form.setValue("image", "", { shouldDirty: true });
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
                      size="icon"
                      onClick={() => imageFileInputRef.current?.click()}
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

        <div>
          <FormLabel>Câu trả lời</FormLabel>
          <div className="space-y-4 mt-2">
            {form.watch("answers").map((answer, index) => (
              <div key={index} className="flex items-center gap-3">
                <FormField
                  control={form.control}
                  name={`answers.${index}.text`}
                  render={({ field }) => (
                    <FormItem className="flex-1">
                      <FormControl>
                        <Input
                          placeholder={`Câu trả lời ${index + 1}`}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button
                  type="button"
                  variant={answer.isCorrect ? "default" : "outline"}
                  size="icon"
                  onClick={() => handleAnswerCorrectChange(index)}
                  className={`transition-all duration-200 ease-in-out ${
                    answer.isCorrect
                      ? "bg-primary hover:bg-primary/90"
                      : "hover:bg-primary/10"
                  }`}
                  title={
                    answer.isCorrect ? "Đáp án đúng" : "Chọn làm đáp án đúng"
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

        <FormField
          control={form.control}
          name="difficulty"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Độ khó</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn độ khó" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="easy">Dễ</SelectItem>
                  <SelectItem value="medium">Trung bình</SelectItem>
                  <SelectItem value="hard">Khó</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="orderNumber"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Số thứ tự (không bắt buộc)</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  placeholder="Nhập số thứ tự câu hỏi"
                  {...field}
                  value={field.value || ""}
                  onChange={(e) => {
                    const value = e.target.value;
                    field.onChange(value === "" ? undefined : parseInt(value));
                  }}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" disabled={actionLoading}>
          {actionLoading ? (
            <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></div>
          ) : editingQuestion ? (
            "Cập nhật câu hỏi"
          ) : (
            "Tạo câu hỏi"
          )}
        </Button>
      </form>
    </Form>
  );

  // Xử lý chọn file Excel
  const handleExcelFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setImportErrors([]);
    const files = e.target.files;
    if (files && files.length > 0) {
      // Kiểm tra định dạng file
      const file = files[0];
      const fileExtension = file.name.split(".").pop()?.toLowerCase();
      if (fileExtension === "xlsx" || fileExtension === "xls") {
        setExcelFile(file);
        readExcelFile(file);
      } else {
        setImportErrors(["Chỉ hỗ trợ file định dạng Excel (.xlsx, .xls)"]);
      }
    }
  };

  // Xử lý kéo thả file
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      // Kiểm tra định dạng file
      const file = files[0];
      const fileExtension = file.name.split(".").pop()?.toLowerCase();
      if (fileExtension === "xlsx" || fileExtension === "xls") {
        setExcelFile(file);
        readExcelFile(file);
      } else {
        setImportErrors(["Chỉ hỗ trợ file định dạng Excel (.xlsx, .xls)"]);
      }
    }
  };

  // Đọc file Excel
  const readExcelFile = (file: File) => {
    setExcelLoading(true);
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = e.target?.result;
        const workbook = XLSX.read(data, { type: "binary" });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

        // Kiểm tra dữ liệu có đúng định dạng hay không
        if (jsonData.length < 2) {
          setImportErrors(["File không có dữ liệu hoặc không đúng định dạng"]);
          setExcelData([]);
          setExcelLoading(false);
          return;
        }

        // Lấy header và kiểm tra các cột cần thiết
        const headers = jsonData[0] as string[];
        const requiredColumns = [
          "text",
          "image",
          "answer_text_1",
          "answer_text_2",
          "answer_text_3",
          "answer_text_4",
          "isCorrect",
          "difficulty",
          "orderNumber",
        ];
        const missingColumns = requiredColumns.filter(
          (col) => !headers.includes(col)
        );

        if (missingColumns.length > 0) {
          setImportErrors([`Thiếu các cột: ${missingColumns.join(", ")}`]);
          setExcelData([]);
          setExcelLoading(false);
          return;
        }

        // Chuyển đổi dữ liệu thành mảng đối tượng
        const formattedData: ExcelQuestion[] = [];
        for (let i = 1; i < jsonData.length; i++) {
          const row = jsonData[i] as string[];
          if (row.length === 0 || !row[0]) continue; // Bỏ qua hàng trống

          const rowData: ExcelQuestion = {
            text: "",
            image: "",
            answer_text_1: "",
            answer_text_2: "",
            answer_text_3: "",
            answer_text_4: "",
            isCorrect: "",
            difficulty: "",
            orderNumber: "",
          };

          for (let j = 0; j < headers.length; j++) {
            if (headers[j]) {
              rowData[headers[j]] = row[j] || "";
            }
          }
          formattedData.push(rowData);
        }

        // Validate dữ liệu
        validateExcelData(formattedData);
      } catch (error) {
        console.error("Error reading Excel file:", error);
        setImportErrors([
          "Lỗi khi đọc file Excel. Vui lòng kiểm tra định dạng file.",
        ]);
        setExcelData([]);
      } finally {
        setExcelLoading(false);
      }
    };

    reader.onerror = () => {
      setImportErrors(["Lỗi khi đọc file. Vui lòng thử lại."]);
      setExcelLoading(false);
    };

    reader.readAsBinaryString(file);
  };

  // Validate dữ liệu từ Excel
  const validateExcelData = (data: ExcelQuestion[]) => {
    const errors: string[] = [];
    const validatedData: FormattedQuestion[] = [];

    data.forEach((item, index) => {
      const rowNumber = index + 2; // +2 vì dòng đầu tiên là header và index bắt đầu từ 0
      const rowErrors: string[] = [];

      // Kiểm tra text
      if (!item.text || item.text.length < 3) {
        rowErrors.push(`Nội dung câu hỏi phải có ít nhất 3 ký tự`);
      }

      // Kiểm tra câu trả lời
      const hasAnswers =
        item.answer_text_1 ||
        item.answer_text_2 ||
        item.answer_text_3 ||
        item.answer_text_4;
      if (!hasAnswers) {
        rowErrors.push(`Phải có ít nhất 2 câu trả lời`);
      }

      // Kiểm tra isCorrect
      const correctIndex = parseInt(String(item.isCorrect));
      if (isNaN(correctIndex) || correctIndex < 1 || correctIndex > 4) {
        rowErrors.push(`isCorrect phải là một số từ 1-4`);
      }

      // Kiểm tra difficulty
      if (!["easy", "medium", "hard"].includes(item.difficulty)) {
        rowErrors.push(
          `Độ khó phải là một trong các giá trị: easy, medium, hard`
        );
      }

      // Kiểm tra orderNumber
      if (item.orderNumber && isNaN(parseInt(String(item.orderNumber)))) {
        rowErrors.push(`orderNumber phải là một số`);
      }

      if (rowErrors.length > 0) {
        errors.push(`Dòng ${rowNumber}: ${rowErrors.join(", ")}`);
      } else {
        // Định dạng dữ liệu cho API
        const formattedItem: FormattedQuestion = {
          text: item.text,
          image: item.image || "",
          answers: [
            {
              text: item.answer_text_1 || "",
              isCorrect: correctIndex === 1,
              order: 1,
            },
            {
              text: item.answer_text_2 || "",
              isCorrect: correctIndex === 2,
              order: 2,
            },
            {
              text: item.answer_text_3 || "",
              isCorrect: correctIndex === 3,
              order: 3,
            },
            {
              text: item.answer_text_4 || "",
              isCorrect: correctIndex === 4,
              order: 4,
            },
          ].filter((answer) => answer.text !== ""), // Lọc bỏ câu trả lời trống
          difficulty: item.difficulty as "easy" | "medium" | "hard",
          orderNumber: parseInt(String(item.orderNumber)),
        };

        validatedData.push(formattedItem);
      }
    });

    setImportErrors(errors);
    if (errors.length === 0) {
      setExcelData(validatedData);
    } else {
      setExcelData([]);
    }
  };

  // Gửi dữ liệu lên API để tạo nhiều câu hỏi
  const importQuestionsFromExcel = async () => {
    if (excelData.length === 0) {
      toast({
        title: "Lỗi",
        description: "Không có dữ liệu hợp lệ để nhập.",
        variant: "destructive",
      });
      return;
    }

    try {
      setActionLoading(true);
      const response = await fetch(
        `${API_BASE_URL}/exams/${examId}/questions/batch`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ questions: excelData }),
        }
      );

      if (!response.ok) {
        throw new Error("Không thể nhập câu hỏi từ Excel");
      }

      await fetchQuestions();
      setShowExcelDialog(false);
      setExcelFile(null);
      setExcelData([]);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }

      toast({
        title: "Thành công",
        description: `Đã nhập ${excelData.length} câu hỏi từ Excel.`,
      });
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Lỗi không xác định";
      console.error("Lỗi khi nhập câu hỏi từ Excel:", errorMessage);
      toast({
        title: "Lỗi",
        description: "Không thể nhập câu hỏi từ Excel. Vui lòng thử lại.",
        variant: "destructive",
      });
    } finally {
      setActionLoading(false);
    }
  };

  // Mở dialog chọn file Excel
  const openExcelDialog = () => {
    setShowExcelDialog(true);
    setExcelFile(null);
    setExcelData([]);
    setImportErrors([]);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // Format tên file hiển thị
  const formatFileName = (fileName: string, maxLength: number = 20) => {
    if (fileName.length <= maxLength) return fileName;

    const extension = fileName.split(".").pop() || "";
    const name = fileName.substring(0, fileName.length - extension.length - 1);

    if (name.length <= maxLength - 3 - extension.length) {
      return fileName;
    }

    const truncatedName = name.substring(0, maxLength - 3 - extension.length);
    return `${truncatedName}...${extension}`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <>
      {/* <Card className="w-full max-w-4xl mx-auto"> */}
      <Card className="w-full mx-auto">
        <CardHeader className="flex flex-row items-center justify-between">
          <div className="flex flex-col space-y-1.5">
            <CardTitle className="text-3xl font-bold">
              {exam?.name ? `Câu hỏi - ${exam.name}` : "Câu hỏi"}
            </CardTitle>
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="text-sm">
                Tổng: {allQuestions.length} câu hỏi
              </Badge>
              {debouncedSearchTerm.trim() &&
                questions.length !== allQuestions.length && (
                  <Badge variant="outline" className="text-sm">
                    Hiển thị: {questions.length} câu hỏi
                  </Badge>
                )}
            </div>
          </div>
          <Button variant="outline" size="sm" onClick={() => router.back()}>
            <ArrowLeft className="mr-2 h-4 w-4" /> Quay lại
          </Button>
        </CardHeader>
        <CardContent>
          {/* Search and Actions */}
          <div className="mb-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              {/* Search input */}
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Tìm kiếm câu hỏi..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>

              {/* Action buttons */}
              <div className="flex flex-col sm:flex-row gap-2 md:flex-shrink-0">
                <Button
                  variant="outline"
                  onClick={openExcelDialog}
                  className="w-full sm:w-auto"
                >
                  <FileSpreadsheet className="mr-2 h-4 w-4" />
                  <span className="hidden sm:inline">Nhập từ Excel</span>
                  <span className="sm:hidden">Excel</span>
                </Button>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button
                      onClick={() => setEditingQuestion(null)}
                      className="w-full sm:w-auto"
                    >
                      <Plus className="mr-2 h-4 w-4" />
                      <span className="hidden sm:inline">Thêm câu hỏi</span>
                      <span className="sm:hidden">Thêm</span>
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-3xl">
                    <DialogHeader>
                      <DialogTitle>
                        {editingQuestion
                          ? "Cập nhật câu hỏi"
                          : "Thêm câu hỏi mới"}
                      </DialogTitle>
                    </DialogHeader>
                    <ScrollArea className="max-h-[600px] pr-4">
                      {renderQuestionForm(onSubmit)}
                    </ScrollArea>
                  </DialogContent>
                </Dialog>
              </div>
            </div>
          </div>

          <Dialog open={showExcelDialog} onOpenChange={setShowExcelDialog}>
            <DialogContent className="max-w-3xl">
              <DialogHeader>
                <DialogTitle className="text-xl font-bold">
                  Nhập câu hỏi từ Excel
                </DialogTitle>
                <DialogDescription>
                  Tải lên file Excel chứa danh sách các câu hỏi để nhập hàng
                  loạt
                </DialogDescription>
              </DialogHeader>

              <Tabs defaultValue="upload" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="upload">Tải lên file</TabsTrigger>
                  <TabsTrigger
                    value="preview"
                    disabled={excelData.length === 0}
                  >
                    Xem trước dữ liệu
                    {excelData.length > 0 && (
                      <Badge variant="secondary" className="ml-2">
                        {excelData.length}
                      </Badge>
                    )}
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="upload" className="space-y-4 py-4">
                  <div
                    className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                      isDragging
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-primary/50 hover:bg-muted/50"
                    }`}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                  >
                    <div className="flex flex-col items-center gap-2">
                      <div
                        className={`p-4 rounded-full bg-muted transition-colors ${
                          isDragging ? "bg-primary/10" : ""
                        }`}
                      >
                        <FileUp
                          className={`w-6 h-6 ${
                            isDragging
                              ? "text-primary"
                              : "text-muted-foreground"
                          }`}
                        />
                      </div>
                      <h3 className="text-lg font-medium">
                        {isDragging
                          ? "Thả tệp để tải lên"
                          : "Kéo và thả file Excel vào đây"}
                      </h3>
                      <p className="text-sm text-muted-foreground mb-2">hoặc</p>
                      <div className="flex items-center gap-2">
                        <Input
                          id="excel-file"
                          type="file"
                          accept=".xlsx, .xls"
                          onChange={handleExcelFileChange}
                          ref={fileInputRef}
                          disabled={excelLoading}
                          className="hidden"
                        />
                        <Button
                          variant="outline"
                          onClick={() => fileInputRef.current?.click()}
                          disabled={excelLoading}
                        >
                          <FileSpreadsheet className="mr-2 h-4 w-4" />
                          Chọn file Excel
                        </Button>
                      </div>
                      <p className="text-xs text-muted-foreground mt-2">
                        Hỗ trợ định dạng: .xlsx, .xls
                      </p>
                    </div>
                  </div>

                  {excelFile && (
                    <div className="bg-muted/50 p-4 rounded-lg flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <FileSpreadsheet className="h-5 w-5 text-primary" />
                        <div>
                          <p className="font-medium">
                            {formatFileName(excelFile.name)}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {(excelFile.size / 1024).toFixed(2)} KB
                          </p>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          setExcelFile(null);
                          setExcelData([]);
                          if (fileInputRef.current) {
                            fileInputRef.current.value = "";
                          }
                        }}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  )}

                  {excelLoading && (
                    <div className="space-y-2 py-4">
                      <div className="flex justify-between mb-1">
                        <p className="text-sm font-medium">
                          Đang xử lý file...
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Vui lòng chờ
                        </p>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2.5">
                        <div className="bg-primary h-2.5 rounded-full animate-pulse w-full"></div>
                      </div>
                    </div>
                  )}

                  {importErrors.length > 0 && (
                    <div className="bg-destructive/10 p-4 rounded-lg border border-destructive/30">
                      <div className="flex items-center gap-2 mb-2">
                        <X className="h-5 w-5 text-destructive" />
                        <h3 className="text-destructive font-medium">
                          Lỗi trong file Excel
                        </h3>
                      </div>
                      <ul className="list-disc ml-6 space-y-1 text-destructive text-sm">
                        {importErrors.map((error, index) => (
                          <li key={index}>{error}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {excelData.length > 0 && (
                    <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                      <div className="flex items-center gap-2 mb-1">
                        <CheckCircle2 className="h-5 w-5 text-green-600" />
                        <h3 className="text-green-800 font-medium">
                          Đã đọc thành công
                        </h3>
                      </div>
                      <p className="text-green-700 text-sm ml-7">
                        Đã tìm thấy {excelData.length} câu hỏi hợp lệ trong file
                        Excel
                      </p>
                    </div>
                  )}

                  <p className="text-sm text-muted-foreground">
                    Tải{" "}
                    <a
                      href="/templates/questions_template.xlsx"
                      download
                      className="text-primary underline font-medium"
                    >
                      mẫu Excel
                    </a>{" "}
                    để xem định dạng yêu cầu
                  </p>
                </TabsContent>

                <TabsContent value="preview" className="py-4">
                  {excelData.length > 0 && (
                    <div className="space-y-6">
                      <div className="flex items-center justify-between">
                        <h3 className="text-lg font-medium flex items-center gap-2">
                          <span>Xem trước dữ liệu</span>
                          <Badge variant="outline">
                            {excelData.length} câu hỏi
                          </Badge>
                        </h3>
                      </div>

                      <ScrollArea className="h-[350px] rounded-md border">
                        <div className="p-4 space-y-6">
                          {excelData.map((item, index) => (
                            <div
                              key={index}
                              className="border rounded-lg overflow-hidden"
                            >
                              <div className="bg-muted px-4 py-2 flex justify-between items-center">
                                <div className="font-medium">
                                  Câu hỏi {index + 1}
                                </div>
                                <Badge
                                  variant={
                                    item.difficulty === "easy"
                                      ? "outline"
                                      : item.difficulty === "medium"
                                      ? "secondary"
                                      : "destructive"
                                  }
                                >
                                  {getDifficultyText(item.difficulty)}
                                </Badge>
                              </div>
                              <div className="p-4 space-y-3">
                                <div>
                                  <h4 className="text-sm font-medium text-muted-foreground mb-1">
                                    Nội dung câu hỏi:
                                  </h4>
                                  <p className="text-sm">{item.text}</p>
                                </div>

                                {item.image && (
                                  <div>
                                    <h4 className="text-sm font-medium text-muted-foreground mb-1">
                                      Hình ảnh:
                                    </h4>
                                    <p className="text-xs text-muted-foreground truncate">
                                      {item.image}
                                    </p>
                                  </div>
                                )}

                                <div>
                                  <h4 className="text-sm font-medium text-muted-foreground mb-2">
                                    Các câu trả lời:
                                  </h4>
                                  <div className="space-y-2">
                                    {item.answers.map((answer, ansIdx) => (
                                      <div
                                        key={ansIdx}
                                        className={`flex items-center gap-2 p-2 rounded-md text-sm ${
                                          answer.isCorrect
                                            ? "bg-green-50 border border-green-200"
                                            : "bg-muted/30"
                                        }`}
                                      >
                                        <div className="flex-grow">
                                          <span className="text-muted-foreground mr-2">
                                            {ansIdx + 1}.
                                          </span>
                                          {answer.text}
                                        </div>
                                        {answer.isCorrect && (
                                          <Badge
                                            variant="secondary"
                                            className="h-5 font-normal"
                                          >
                                            <Check className="h-3 w-3 mr-1" />{" "}
                                            Đáp án đúng
                                          </Badge>
                                        )}
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </ScrollArea>
                    </div>
                  )}
                </TabsContent>
              </Tabs>

              <Separator className="my-2" />

              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setShowExcelDialog(false)}
                >
                  Hủy
                </Button>
                <Button
                  onClick={importQuestionsFromExcel}
                  disabled={
                    excelLoading || actionLoading || excelData.length === 0
                  }
                >
                  {actionLoading ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
                  ) : (
                    <UploadIcon className="mr-2 h-4 w-4" />
                  )}
                  Nhập{" "}
                  {excelData.length > 0
                    ? `${excelData.length} câu hỏi`
                    : "câu hỏi"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <div className="border rounded-md">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[calc(100%-80px)] md:w-auto">
                    Nội dung câu hỏi
                  </TableHead>
                  <TableHead className="hidden md:table-cell min-w-[100px]">
                    Độ khó
                  </TableHead>
                  <TableHead className="hidden md:table-cell">
                    Số câu trả lời
                  </TableHead>
                  <TableHead className="hidden md:table-cell">
                    Ngày tạo
                  </TableHead>
                  <TableHead className="text-right w-20 md:w-auto">
                    Hành động
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {questions.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={2}
                      className="text-center py-4 md:hidden"
                    >
                      {debouncedSearchTerm.trim()
                        ? "Không tìm thấy câu hỏi nào phù hợp"
                        : "Chưa có câu hỏi nào. Hãy thêm câu hỏi mới!"}
                    </TableCell>
                    <TableCell
                      colSpan={5}
                      className="text-center py-4 hidden md:table-cell"
                    >
                      {debouncedSearchTerm.trim()
                        ? "Không tìm thấy câu hỏi nào phù hợp"
                        : "Chưa có câu hỏi nào. Hãy thêm câu hỏi mới!"}
                    </TableCell>
                  </TableRow>
                ) : (
                  questions.map((question) => (
                    <TableRow key={question._id}>
                      <TableCell className="font-medium pr-2">
                        <div className="max-w-none">
                          <div className="line-clamp-3 md:line-clamp-2">
                            {question.text}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        <div className="flex justify-center">
                          <span
                            className={`inline-block px-2 py-1 rounded-full text-xs whitespace-nowrap ${
                              question.difficulty === "easy"
                                ? "bg-green-100 text-green-800"
                                : question.difficulty === "medium"
                                ? "bg-yellow-100 text-yellow-800"
                                : "bg-red-100 text-red-800"
                            }`}
                          >
                            {getDifficultyText(question.difficulty)}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        {question.answers.length}
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        {formatDate(question.createdAt)}
                      </TableCell>
                      <TableCell className="text-right pl-2">
                        <div className="flex justify-end space-x-1 md:space-x-2">
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => copyQuestionToClipboard(question)}
                            title="Sao chép câu hỏi"
                          >
                            <Copy className="h-4 w-4" />
                          </Button>
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button
                                variant="outline"
                                size="icon"
                                onClick={() => {
                                  fetchQuestionDetail(question._id);
                                }}
                                disabled={fetchingQuestion}
                              >
                                {fetchingQuestion ? (
                                  <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-primary"></div>
                                ) : (
                                  <Pencil className="h-4 w-4" />
                                )}
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-3xl">
                              <DialogHeader>
                                <DialogTitle>Cập nhật câu hỏi</DialogTitle>
                              </DialogHeader>
                              <ScrollArea className="max-h-[600px] pr-4">
                                {fetchingQuestion ? (
                                  <div className="flex items-center justify-center py-8">
                                    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
                                  </div>
                                ) : (
                                  renderQuestionForm((values) =>
                                    updateQuestion(question._id, values)
                                  )
                                )}
                              </ScrollArea>
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
                                  xóa vĩnh viễn câu hỏi.
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
        </CardContent>
      </Card>

      {/* Dialog để xem trước ảnh */}
      <Dialog open={showImagePreview} onOpenChange={setShowImagePreview}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Xem trước hình ảnh</DialogTitle>
          </DialogHeader>
          <div className="overflow-auto max-h-[70vh]">
            {imagePreviewUrl ? (
              <div className="flex flex-col items-center gap-4">
                <div className="relative w-full">
                  <img
                    src={imagePreviewUrl}
                    alt="Xem trước"
                    className="max-w-full h-auto mx-auto rounded-md"
                    onError={() => {
                      toast({
                        title: "Lỗi",
                        description:
                          "Không thể tải ảnh. URL có thể không hợp lệ.",
                        variant: "destructive",
                      });
                      setShowImagePreview(false);
                    }}
                  />
                </div>
                <p className="text-sm text-muted-foreground break-all">
                  {imagePreviewUrl}
                </p>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12">
                <ImageIcon className="h-16 w-16 text-muted-foreground opacity-20" />
                <p className="text-muted-foreground mt-4">
                  Không có ảnh để hiển thị
                </p>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
