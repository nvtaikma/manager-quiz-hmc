/* eslint-disable @next/next/no-img-element */
"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { fetchApi } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import {
  Loader2,
  ArrowLeft,
  Clock,
  Eye,
  CheckCircle,
  XCircle,
  User,
  FileText,
  MessageSquare,
  Image as ImageIcon,
  AlertTriangle,
  Copy,
  Mail,
  Phone,
  Calendar,
  Pencil,
  Save,
  X,
  Check,
  Upload as UploadIcon,
  ExternalLink,
} from "lucide-react";
import { handleImageUpload } from "@/lib/upload";

// Types
interface Answer {
  _id: string;
  text: string;
  isCorrect: boolean;
  order?: number;
}

interface QuestionDetail {
  _id: string;
  text: string;
  answers: Answer[];
  image?: string;
  difficulty?: string;
  orderNumber?: number;
}

interface ReportDetail {
  _id: string;
  userId: { _id: string; name: string; email: string } | null;
  questionId: QuestionDetail | string;
  examId: { _id: string; name: string } | null;
  productId: string;
  reportType: "content_error" | "wrong_answer";
  description?: string;
  correctAnswer?: string;
  reason?: string;
  imageUrl?: string;
  contactMethod: "zalo" | "facebook";
  contactValue: string;
  questionText?: string;
  status: "pending" | "reviewed" | "resolved" | "rejected";
  adminNote?: string;
  resolvedBy?: { _id: string; email: string } | null;
  resolvedAt?: string;
  createdAt: string;
}

interface RelatedReport {
  _id: string;
  userId: { _id: string; name: string; email: string } | null;
  reportType: string;
  description?: string;
  status: string;
  createdAt: string;
}

const statusConfig: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline"; color: string }> = {
  pending: { label: "Chờ xử lý", variant: "default", color: "text-yellow-600" },
  reviewed: { label: "Đang xem", variant: "secondary", color: "text-purple-600" },
  resolved: { label: "Đã xử lý", variant: "outline", color: "text-green-600" },
  rejected: { label: "Từ chối", variant: "destructive", color: "text-red-600" },
};

const typeLabels: Record<string, string> = {
  content_error: "Lỗi nội dung",
  wrong_answer: "Sai đáp án",
};

export default function ReportDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const reportId = params.id as string;

  const [report, setReport] = useState<ReportDetail | null>(null);
  const [relatedReports, setRelatedReports] = useState<RelatedReport[]>([]);
  const [relatedCount, setRelatedCount] = useState(0);
  const [loading, setLoading] = useState(true);

  // Form state
  const [newStatus, setNewStatus] = useState<string>("");
  const [adminNote, setAdminNote] = useState("");
  const [bulkResolve, setBulkResolve] = useState(false);
  const [updating, setUpdating] = useState(false);

  // Image preview
  const [showImagePreview, setShowImagePreview] = useState(false);

  // Question editing state
  const [isEditingQuestion, setIsEditingQuestion] = useState(false);
  const [editQuestionText, setEditQuestionText] = useState("");
  const [editQuestionImage, setEditQuestionImage] = useState("");
  const [editQuestionDifficulty, setEditQuestionDifficulty] = useState("medium");
  const [editQuestionOrderNumber, setEditQuestionOrderNumber] = useState<number | undefined>(undefined);
  const [editAnswers, setEditAnswers] = useState<{text: string; isCorrect: boolean; order: number; _id?: string}[]>([]);
  const [savingQuestion, setSavingQuestion] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const imageFileInputRef = useRef<HTMLInputElement>(null);

  const fetchReport = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetchApi(`/reports/${reportId}`);
      if (!response.ok) throw new Error("Không thể tải chi tiết báo cáo");

      const data = await response.json();
      const result = data.data;

      setReport(result.report);
      setRelatedReports(result.relatedReports || []);
      setRelatedCount(result.relatedCount || 0);

      // Pre-fill form
      setNewStatus(result.report.status);
      setAdminNote(result.report.adminNote || "");
    } catch (error) {
      console.error("Error fetching report:", error);
      toast({
        title: "Lỗi",
        description: "Không thể tải chi tiết báo cáo",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [reportId, toast]);

  useEffect(() => {
    if (reportId) fetchReport();
  }, [reportId, fetchReport]);

  const handleUpdateStatus = async () => {
    if (!newStatus) {
      toast({ title: "Lỗi", description: "Vui lòng chọn trạng thái", variant: "destructive" });
      return;
    }

    if ((newStatus === "resolved" || newStatus === "rejected") && !adminNote.trim()) {
      toast({ title: "Lỗi", description: "Vui lòng nhập ghi chú khi xử lý hoặc từ chối", variant: "destructive" });
      return;
    }

    setUpdating(true);
    try {
      const response = await fetchApi(`/reports/${reportId}/status`, {
        method: "PATCH",
        body: JSON.stringify({
          status: newStatus,
          adminNote: adminNote.trim(),
          bulkResolve,
        }),
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.message || "Cập nhật thất bại");
      }

      const data = await response.json();
      toast({
        title: "Thành công",
        description: data.message || "Cập nhật trạng thái thành công",
      });

      // Reload
      fetchReport();
    } catch (error: any) {
      toast({
        title: "Lỗi",
        description: error.message || "Không thể cập nhật",
        variant: "destructive",
      });
    } finally {
      setUpdating(false);
    }
  };

  // Start editing question - populate form
  const startEditQuestion = () => {
    const q = typeof report?.questionId === "object" ? report.questionId as QuestionDetail : null;
    if (!q) return;
    setEditQuestionText(q.text);
    setEditQuestionImage(q.image || "");
    setEditQuestionDifficulty(q.difficulty || "medium");
    setEditQuestionOrderNumber(q.orderNumber);
    setEditAnswers(q.answers.map((a, i) => ({ text: a.text, isCorrect: a.isCorrect, order: a.order ?? i + 1, _id: a._id })));
    setIsEditingQuestion(true);
  };

  const cancelEditQuestion = () => {
    setIsEditingQuestion(false);
  };

  const handleEditAnswerCorrect = (idx: number) => {
    setEditAnswers(prev => prev.map((a, i) => ({ ...a, isCorrect: i === idx })));
  };

  const handleSaveQuestion = async () => {
    const q = typeof report?.questionId === "object" ? report.questionId as QuestionDetail : null;
    if (!q) return;
    const correctCount = editAnswers.filter(a => a.isCorrect).length;
    if (correctCount !== 1) {
      toast({ title: "Lỗi", description: "Phải có đúng 1 đáp án đúng", variant: "destructive" });
      return;
    }
    if (!editQuestionText.trim()) {
      toast({ title: "Lỗi", description: "Nội dung câu hỏi không được trống", variant: "destructive" });
      return;
    }
    setSavingQuestion(true);
    try {
      const body: any = {
        text: editQuestionText.trim(),
        image: editQuestionImage.trim() || undefined,
        answers: editAnswers,
        difficulty: editQuestionDifficulty,
      };
      if (editQuestionOrderNumber !== undefined) body.orderNumber = editQuestionOrderNumber;
      const res = await fetchApi(`/questions/${q._id}`, { method: "PATCH", body: JSON.stringify(body) });
      if (!res.ok) throw new Error("Cập nhật thất bại");
      toast({ title: "Thành công", description: "Đã cập nhật câu hỏi" });
      setIsEditingQuestion(false);
      fetchReport();
    } catch (err: any) {
      toast({ title: "Lỗi", description: err.message || "Không thể cập nhật", variant: "destructive" });
    } finally {
      setSavingQuestion(false);
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <Loader2 className="h-10 w-10 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!report) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-muted-foreground">
        <AlertTriangle className="h-12 w-12 mb-3" />
        <p className="text-lg font-medium">Không tìm thấy báo cáo</p>
        <Button variant="outline" className="mt-4" onClick={() => router.push("/reports")}>
          <ArrowLeft className="h-4 w-4 mr-2" /> Quay lại
        </Button>
      </div>
    );
  }

  const question = typeof report.questionId === "object" ? report.questionId as QuestionDetail : null;
  const statusCfg = statusConfig[report.status];

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Back Button + Title */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={() => router.push("/reports")}>
          <ArrowLeft className="h-4 w-4 mr-2" /> Quay lại
        </Button>
        <div className="flex-1">
          <h1 className="text-xl font-bold">Chi tiết Báo cáo</h1>
          <p className="text-sm text-muted-foreground">ID: {report._id}</p>
        </div>
        <Badge variant={statusCfg?.variant || "default"} className="text-sm px-3 py-1">
          {statusCfg?.label || report.status}
        </Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* LEFT: Báo cáo của User */}
        <div className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <MessageSquare className="h-4 w-4" />
                Nội dung báo cáo
              </CardTitle>
              <CardDescription>
                Thông tin báo cáo từ sinh viên
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Report Type */}
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Loại báo cáo</span>
                <Badge variant="outline" className={
                  report.reportType === "content_error"
                    ? "text-orange-600 border-orange-300 bg-orange-50"
                    : "text-red-600 border-red-300 bg-red-50"
                }>
                  {typeLabels[report.reportType] || report.reportType}
                </Badge>
              </div>

              <Separator />

              {/* Mô tả */}
              {report.description && (
                <div>
                  <p className="text-sm font-medium mb-1">Mô tả lỗi</p>
                  <p className="text-sm bg-muted/50 p-3 rounded-md whitespace-pre-wrap">{report.description}</p>
                </div>
              )}

              {/* Lý do */}
              {report.reason && (
                <div>
                  <p className="text-sm font-medium mb-1">Lý do</p>
                  <p className="text-sm bg-muted/50 p-3 rounded-md whitespace-pre-wrap">{report.reason}</p>
                </div>
              )}

              {/* Đáp án đúng đề xuất */}
              {report.correctAnswer && (
                <div>
                  <p className="text-sm font-medium mb-1">Đáp án đúng (đề xuất)</p>
                  <p className="text-sm bg-green-50 text-green-800 p-3 rounded-md border border-green-200">
                    {report.correctAnswer}
                  </p>
                </div>
              )}


              {/* Ảnh minh chứng */}
              {report.imageUrl && (
                <div>
                  <p className="text-sm font-medium mb-2 flex items-center gap-1">
                    <ImageIcon className="h-4 w-4" />
                    Ảnh minh chứng
                  </p>
                  <div
                    className="cursor-pointer border rounded-lg overflow-hidden hover:ring-2 hover:ring-primary transition-all"
                    onClick={() => setShowImagePreview(!showImagePreview)}
                  >
                    <img
                      src={report.imageUrl}
                      alt="Ảnh minh chứng"
                      className="w-full max-h-80 object-contain bg-muted/30"
                    />
                  </div>
                </div>
              )}

              <Separator />

              {/* User info */}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">{report.userId?.name || "N/A"}</span>
                  <span className="text-xs text-muted-foreground">{report.userId?.email}</span>
                </div>
                <div className="flex items-center gap-2">
                  {report.contactMethod === "zalo" ? (
                    <Phone className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <Mail className="h-4 w-4 text-muted-foreground" />
                  )}
                  <span className="text-sm">
                    {report.contactMethod === "zalo" ? "Zalo" : "Facebook"}: {report.contactValue}
                  </span>
                  <a
                    href={report.contactMethod === "zalo" ? `https://zalo.me/${report.contactValue}` : report.contactValue}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Button variant="outline" size="sm" className="h-6 px-2 text-xs ml-2">
                      <ExternalLink className="h-3 w-3 mr-1" /> Mở liên kết
                    </Button>
                  </a>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">
                    Ngày gửi: {formatDate(report.createdAt)}
                  </span>
                </div>
                {report.examId && (
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">Bài thi: {report.examId.name}</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Related Reports */}
          {relatedCount > 0 && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Copy className="h-4 w-4" />
                  Báo cáo trùng lặp ({relatedCount})
                </CardTitle>
                <CardDescription>
                  Các báo cáo khác cùng câu hỏi này
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {relatedReports.map((related) => (
                    <div
                      key={related._id}
                      className="flex items-center justify-between p-3 bg-muted/30 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer"
                      onClick={() => router.push(`/reports/${related._id}`)}
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium">{related.userId?.name || "N/A"}</span>
                          <Badge variant={statusConfig[related.status]?.variant || "default"} className="text-xs">
                            {statusConfig[related.status]?.label || related.status}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5 truncate">
                          {related.description || typeLabels[related.reportType] || related.reportType}
                        </p>
                      </div>
                      <span className="text-xs text-muted-foreground ml-3 whitespace-nowrap">
                        {formatDate(related.createdAt)}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* RIGHT: Câu hỏi gốc + Form xử lý */}
        <div className="space-y-4">
          {/* Original Question */}
          {question && (
            <Card className={isEditingQuestion ? "border-2 border-blue-400" : ""}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-base flex items-center gap-2">
                      <FileText className="h-4 w-4" />
                      {isEditingQuestion ? "Chỉnh sửa câu hỏi" : "Câu hỏi gốc"}
                    </CardTitle>
                    <CardDescription>
                      {isEditingQuestion
                        ? "Sửa trực tiếp nội dung và đáp án câu hỏi"
                        : <>Nội dung câu hỏi trong hệ thống{question.orderNumber !== undefined && ` • Câu ${question.orderNumber}`}{question.difficulty && ` • ${question.difficulty}`}</>}
                    </CardDescription>
                  </div>
                  {!isEditingQuestion ? (
                    <Button variant="outline" size="sm" onClick={startEditQuestion}>
                      <Pencil className="h-3.5 w-3.5 mr-1.5" /> Sửa câu hỏi
                    </Button>
                  ) : (
                    <Button variant="ghost" size="sm" onClick={cancelEditQuestion}>
                      <X className="h-4 w-4 mr-1" /> Hủy
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {!isEditingQuestion ? (
                  <>
                    {/* READ-ONLY VIEW */}
                    <div className="bg-blue-50 dark:bg-blue-950/30 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
                      <p className="text-sm font-medium whitespace-pre-wrap">{question.text}</p>
                    </div>
                    {question.image && (
                      <div className="border rounded-lg overflow-hidden">
                        <img src={question.image} alt="Ảnh câu hỏi" className="w-full max-h-60 object-contain bg-muted/30" />
                      </div>
                    )}
                    {question.answers && question.answers.length > 0 && (
                      <div className="space-y-2">
                        <p className="text-sm font-medium">Đáp án:</p>
                        {question.answers.map((answer, idx) => (
                          <div key={answer._id || idx} className={`flex items-start gap-2 p-2.5 rounded-md text-sm border ${answer.isCorrect ? "bg-green-50 border-green-300 dark:bg-green-950/30 dark:border-green-700" : "bg-muted/20 border-transparent"}`}>
                            <span className={`font-bold min-w-[20px] ${answer.isCorrect ? "text-green-700 dark:text-green-400" : "text-muted-foreground"}`}>{String.fromCharCode(65 + idx)}.</span>
                            <span className={answer.isCorrect ? "text-green-800 dark:text-green-300 font-medium" : ""}>{answer.text}</span>
                            {answer.isCorrect && <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400 ml-auto flex-shrink-0 mt-0.5" />}
                          </div>
                        ))}
                      </div>
                    )}
                  </>
                ) : (
                  <>
                    {/* EDIT MODE */}
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Nội dung câu hỏi</label>
                      <Textarea placeholder="Nhập nội dung câu hỏi" className="min-h-[100px]" value={editQuestionText} onChange={(e) => setEditQuestionText(e.target.value)} />
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium">Hình ảnh (URL)</label>
                      <div className="flex gap-2">
                        <div className="flex-1 relative">
                          <Input placeholder="Nhập URL hình ảnh" value={editQuestionImage} onChange={(e) => setEditQuestionImage(e.target.value)} />
                          {editQuestionImage && (
                            <Button type="button" variant="ghost" size="icon" className="absolute right-0 top-0 h-full" onClick={() => setEditQuestionImage("")}>
                              <X className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                        <div className="relative">
                          <input type="file" accept="image/png,image/jpeg,image/gif,image/webp" className="hidden" ref={imageFileInputRef}
                            onChange={(e) => handleImageUpload(e, (url) => setEditQuestionImage(`${url}=rw`), (u) => setUploadingImage(u))} />
                          <Button type="button" variant="outline" size="icon" onClick={() => imageFileInputRef.current?.click()} disabled={uploadingImage} title="Tải lên ảnh mới">
                            {uploadingImage ? <Loader2 className="h-4 w-4 animate-spin" /> : <UploadIcon className="h-4 w-4" />}
                          </Button>
                        </div>
                      </div>
                      {editQuestionImage && (
                        <div className="border rounded-lg overflow-hidden mt-2">
                          <img src={editQuestionImage} alt="Preview" className="w-full max-h-40 object-contain bg-muted/30" />
                        </div>
                      )}
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium">Câu trả lời</label>
                      <div className="space-y-3">
                        {editAnswers.map((answer, idx) => (
                          <div key={idx} className="flex items-center gap-2">
                            <span className="text-sm font-bold text-muted-foreground min-w-[20px]">{String.fromCharCode(65 + idx)}.</span>
                            <Input className="flex-1" placeholder={`Câu trả lời ${idx + 1}`} value={answer.text}
                              onChange={(e) => setEditAnswers(prev => prev.map((a, i) => i === idx ? { ...a, text: e.target.value } : a))} />
                            <Button type="button" variant={answer.isCorrect ? "default" : "outline"} size="icon" onClick={() => handleEditAnswerCorrect(idx)}
                              className={answer.isCorrect ? "bg-green-600 hover:bg-green-700" : "hover:bg-green-100"} title={answer.isCorrect ? "Đáp án đúng" : "Chọn làm đáp án đúng"}>
                              <Check className={`h-4 w-4 ${answer.isCorrect ? "text-white" : "text-muted-foreground"}`} />
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Độ khó</label>
                        <Select value={editQuestionDifficulty} onValueChange={setEditQuestionDifficulty}>
                          <SelectTrigger><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="easy">Dễ</SelectItem>
                            <SelectItem value="medium">Trung bình</SelectItem>
                            <SelectItem value="hard">Khó</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Số thứ tự</label>
                        <Input type="number" placeholder="STT" value={editQuestionOrderNumber ?? ""} onChange={(e) => setEditQuestionOrderNumber(e.target.value ? parseInt(e.target.value) : undefined)} />
                      </div>
                    </div>

                    <Separator />

                    <div className="flex gap-2">
                      <Button className="flex-1" onClick={handleSaveQuestion} disabled={savingQuestion}>
                        {savingQuestion ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
                        Lưu câu hỏi
                      </Button>
                      <Button variant="outline" onClick={cancelEditQuestion} disabled={savingQuestion}>
                        Hủy
                      </Button>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          )}

          {/* Admin Action Form */}
          <Card className="border-2 border-primary/20">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <AlertTriangle className="h-4 w-4" />
                Xử lý báo cáo
              </CardTitle>
              <CardDescription>
                Cập nhật trạng thái và phản hồi cho sinh viên
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Trạng thái hiện tại */}
              {report.resolvedBy && (
                <div className="text-sm bg-muted/50 p-3 rounded-md space-y-1">
                  <p><span className="font-medium">Xử lý bởi:</span> {typeof report.resolvedBy === 'object' ? report.resolvedBy.email : report.resolvedBy}</p>
                  {report.resolvedAt && (
                    <p><span className="font-medium">Ngày xử lý:</span> {formatDate(report.resolvedAt)}</p>
                  )}
                  {report.adminNote && (
                    <p><span className="font-medium">Ghi chú:</span> {report.adminNote}</p>
                  )}
                </div>
              )}

              {/* Status select */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Trạng thái mới</label>
                <Select value={newStatus} onValueChange={setNewStatus}>
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn trạng thái" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">⏳ Chờ xử lý</SelectItem>
                    <SelectItem value="reviewed">👁️ Đang xem</SelectItem>
                    <SelectItem value="resolved">✅ Đã xử lý</SelectItem>
                    <SelectItem value="rejected">❌ Từ chối</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Admin Note */}
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  Ghi chú Admin
                  {(newStatus === "resolved" || newStatus === "rejected") && (
                    <span className="text-red-500 ml-1">*</span>
                  )}
                </label>
                <Textarea
                  placeholder="Nhập ghi chú phản hồi cho sinh viên..."
                  value={adminNote}
                  onChange={(e) => setAdminNote(e.target.value)}
                  rows={4}
                  className="resize-none"
                  maxLength={1000}
                />
                <p className="text-xs text-muted-foreground text-right">
                  {adminNote.length} / 1000
                </p>
              </div>

              {/* Bulk Resolve Checkbox */}
              {relatedCount > 0 && (newStatus === "resolved" || newStatus === "rejected") && (
                <div className="flex items-start space-x-3 p-3 bg-orange-50 dark:bg-orange-950/20 rounded-lg border border-orange-200 dark:border-orange-800">
                  <Checkbox
                    id="bulkResolve"
                    checked={bulkResolve}
                    onCheckedChange={(checked) => setBulkResolve(checked === true)}
                  />
                  <div className="space-y-0.5">
                    <label htmlFor="bulkResolve" className="text-sm font-medium cursor-pointer">
                      Áp dụng cho tất cả báo cáo trùng câu hỏi này
                    </label>
                    <p className="text-xs text-muted-foreground">
                      Sẽ cập nhật {relatedCount} báo cáo liên quan đang ở trạng thái &quot;Chờ xử lý&quot; hoặc &quot;Đang xem&quot;
                    </p>
                  </div>
                </div>
              )}

              {/* Submit */}
              <Button
                className="w-full"
                onClick={handleUpdateStatus}
                disabled={updating || !newStatus || newStatus === report.status}
              >
                {updating && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                Cập nhật trạng thái
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Full-screen image preview */}
      {showImagePreview && report.imageUrl && (
        <div
          className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 cursor-pointer"
          onClick={() => setShowImagePreview(false)}
        >
          <img
            src={report.imageUrl}
            alt="Preview"
            className="max-w-full max-h-full object-contain rounded-lg"
          />
        </div>
      )}
    </div>
  );
}
