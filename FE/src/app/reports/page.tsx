"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { fetchApi } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import {
  Loader2,
  Search,
  Eye,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Clock,
  FileWarning,
  TrendingUp,
  Copy,
  Lightbulb,
  Image as ImageIcon,
  MessageCircle,
} from "lucide-react";

// Types
interface Report {
  _id: string;
  userId: { _id: string; name: string; email: string } | null;
  questionId?: string;
  examId: { _id: string; name: string } | null;
  productId?: { _id: string; name: string } | string;
  reportType: "content_error" | "wrong_answer" | "feedback";
  feedbackCategory?: "new_feature" | "study_mode" | "ui_ux" | "bug_other";
  description?: string;
  correctAnswer?: string;
  reason?: string;
  imageUrl?: string;
  contactMethod?: "zalo" | "facebook";
  contactValue?: string;
  questionText?: string;
  status: "pending" | "reviewed" | "resolved" | "rejected";
  adminNote?: string;
  createdAt: string;
  duplicateCount: number;
}

interface Stats {
  total: number;
  pending: number;
  reviewed: number;
  resolved: number;
  rejected: number;
}

interface QuickAction {
  reportId: string;
  action: "resolved" | "rejected";
}

const statusConfig: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline"; icon: typeof Clock }> = {
  pending: { label: "Chờ xử lý", variant: "default", icon: Clock },
  reviewed: { label: "Đang xem", variant: "secondary", icon: Eye },
  resolved: { label: "Đã xử lý", variant: "outline", icon: CheckCircle },
  rejected: { label: "Từ chối", variant: "destructive", icon: XCircle },
};

const typeConfig: Record<string, { label: string; color: string }> = {
  content_error: { label: "Lỗi nội dung", color: "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400" },
  wrong_answer: { label: "Sai đáp án", color: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400" },
  feedback: { label: "Góp ý phát triển", color: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400" },
};

const feedbackCategoryConfig: Record<string, { label: string; color: string }> = {
  new_feature: { label: "Tính năng mới", color: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400" },
  study_mode: { label: "Chế độ học tập", color: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400" },
  ui_ux: { label: "Giao diện UI/UX", color: "bg-pink-100 text-pink-800 dark:bg-pink-900/30 dark:text-pink-400" },
  bug_other: { label: "Lỗi khác / Góp ý", color: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400" },
};

export default function ReportsPage() {
  const router = useRouter();
  const { toast } = useToast();

  const [reports, setReports] = useState<Report[]>([]);
  const [stats, setStats] = useState<Stats>({ total: 0, pending: 0, reviewed: 0, resolved: 0, rejected: 0 });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [reportTypeFilter, setReportTypeFilter] = useState("all");
  const [feedbackCategoryFilter, setFeedbackCategoryFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const itemsPerPage = 20;

  // Quick action dialog state
  const [quickAction, setQuickAction] = useState<QuickAction | null>(null);
  const [adminNote, setAdminNote] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  const fetchReports = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: itemsPerPage.toString(),
      });

      if (activeTab !== "all") {
        params.set("status", activeTab);
      }
      if (reportTypeFilter !== "all") {
        params.set("reportType", reportTypeFilter);
      }
      if (feedbackCategoryFilter !== "all") {
        params.set("feedbackCategory", feedbackCategoryFilter);
      }
      if (searchTerm.trim()) {
        params.set("search", searchTerm.trim());
      }

      const response = await fetchApi(`/reports?${params.toString()}`);
      if (!response.ok) throw new Error("Không thể tải danh sách báo cáo");

      const data = await response.json();
      const result = data.data;

      setReports(result.reports || []);
      setStats(result.stats || { total: 0, pending: 0, reviewed: 0, resolved: 0, rejected: 0 });
      setTotalCount(result.pagination?.total || 0);
      setTotalPages(result.pagination?.totalPages || 1);
    } catch (error) {
      console.error("Error fetching reports:", error);
      toast({
        title: "Lỗi",
        description: "Không thể tải danh sách báo cáo",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [currentPage, activeTab, reportTypeFilter, feedbackCategoryFilter, searchTerm, toast]);

  useEffect(() => {
    fetchReports();
  }, [fetchReports]);

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [activeTab, reportTypeFilter, feedbackCategoryFilter, searchTerm]);

  const handleQuickAction = async () => {
    if (!quickAction || !adminNote.trim()) {
      toast({ title: "Lỗi", description: "Vui lòng nhập ghi chú", variant: "destructive" });
      return;
    }

    setActionLoading(true);
    try {
      const response = await fetchApi(`/reports/${quickAction.reportId}/status`, {
        method: "PATCH",
        body: JSON.stringify({
          status: quickAction.action,
          adminNote: adminNote.trim(),
        }),
      });

      if (!response.ok) throw new Error("Cập nhật thất bại");

      const data = await response.json();
      toast({
        title: "Thành công",
        description: data.message || "Cập nhật trạng thái thành công",
      });

      setQuickAction(null);
      setAdminNote("");
      fetchReports();
    } catch (error: any) {
      toast({
        title: "Lỗi",
        description: error.message || "Không thể cập nhật trạng thái",
        variant: "destructive",
      });
    } finally {
      setActionLoading(false);
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

  const truncateText = (text: string, maxLen: number = 80) => {
    if (!text) return "—";
    return text.length > maxLen ? text.slice(0, maxLen) + "..." : text;
  };

  return (
    <div className="container mx-auto py-3 sm:py-6 space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight">Quản lý Báo cáo & Góp ý</h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            Theo dõi và xử lý các báo cáo lỗi câu hỏi & góp ý phát triển phần mềm từ học viên
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-2.5 sm:gap-4">
        <Card className="border-l-4 border-l-blue-500">
          <CardContent className="p-3 sm:p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground font-medium">Tổng cộng</p>
                <p className="text-xl sm:text-2xl font-bold">{stats.total}</p>
              </div>
              <FileWarning className="h-6 w-6 sm:h-8 sm:w-8 text-blue-500 opacity-80" />
            </div>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-yellow-500">
          <CardContent className="p-3 sm:p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground font-medium">Chờ xử lý</p>
                <p className="text-xl sm:text-2xl font-bold">{stats.pending}</p>
              </div>
              <Clock className="h-6 w-6 sm:h-8 sm:w-8 text-yellow-500 opacity-80" />
            </div>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-amber-500">
          <CardContent className="p-3 sm:p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground font-medium">Đang xem</p>
                <p className="text-xl sm:text-2xl font-bold">{stats.reviewed}</p>
              </div>
              <Eye className="h-6 w-6 sm:h-8 sm:w-8 text-amber-500 opacity-80" />
            </div>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-green-500">
          <CardContent className="p-3 sm:p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground font-medium">Đã xử lý</p>
                <p className="text-xl sm:text-2xl font-bold">{stats.resolved}</p>
              </div>
              <CheckCircle className="h-6 w-6 sm:h-8 sm:w-8 text-green-500 opacity-80" />
            </div>
          </CardContent>
        </Card>
        <Card className="col-span-2 md:col-span-1 border-l-4 border-l-red-500">
          <CardContent className="p-3 sm:p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground font-medium">Từ chối</p>
                <p className="text-xl sm:text-2xl font-bold">{stats.rejected}</p>
              </div>
              <XCircle className="h-6 w-6 sm:h-8 sm:w-8 text-red-500 opacity-80" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-2.5 sm:gap-3 items-stretch sm:items-center">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Tìm theo nội dung, câu hỏi, liên hệ..."
            className="pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Select
          value={reportTypeFilter}
          onValueChange={(val) => {
            setReportTypeFilter(val);
            if (val !== "feedback") {
              setFeedbackCategoryFilter("all");
            }
          }}
        >
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="Loại báo cáo" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tất cả loại</SelectItem>
            <SelectItem value="content_error">Lỗi nội dung</SelectItem>
            <SelectItem value="wrong_answer">Sai đáp án</SelectItem>
            <SelectItem value="feedback">💡 Góp ý phát triển</SelectItem>
          </SelectContent>
        </Select>

        {(reportTypeFilter === "all" || reportTypeFilter === "feedback") && (
          <Select value={feedbackCategoryFilter} onValueChange={setFeedbackCategoryFilter}>
            <SelectTrigger className="w-full sm:w-52">
              <SelectValue placeholder="Danh mục góp ý" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả danh mục góp ý</SelectItem>
              <SelectItem value="new_feature">✨ Tính năng mới</SelectItem>
              <SelectItem value="study_mode">📚 Chế độ học tập</SelectItem>
              <SelectItem value="ui_ux">🎨 Giao diện UI/UX</SelectItem>
              <SelectItem value="bug_other">🛠️ Lỗi khác / Góp ý</SelectItem>
            </SelectContent>
          </Select>
        )}
      </div>

      {/* Tabs + Table */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="flex w-full overflow-x-auto sm:grid sm:grid-cols-5 h-auto p-1 gap-1 justify-start">
          <TabsTrigger value="all" className="text-xs sm:text-sm shrink-0 flex-1 px-2.5 py-1.5">
            Tất cả <Badge variant="secondary" className="ml-1 text-[11px] px-1.5">{stats.total}</Badge>
          </TabsTrigger>
          <TabsTrigger value="pending" className="text-xs sm:text-sm shrink-0 flex-1 px-2.5 py-1.5">
            Chờ xử lý <Badge variant="secondary" className="ml-1 text-[11px] px-1.5">{stats.pending}</Badge>
          </TabsTrigger>
          <TabsTrigger value="reviewed" className="text-xs sm:text-sm shrink-0 flex-1 px-2.5 py-1.5">
            Đang xem <Badge variant="secondary" className="ml-1 text-[11px] px-1.5">{stats.reviewed}</Badge>
          </TabsTrigger>
          <TabsTrigger value="resolved" className="text-xs sm:text-sm shrink-0 flex-1 px-2.5 py-1.5">
            Đã xử lý <Badge variant="secondary" className="ml-1 text-[11px] px-1.5">{stats.resolved}</Badge>
          </TabsTrigger>
          <TabsTrigger value="rejected" className="text-xs sm:text-sm shrink-0 flex-1 px-2.5 py-1.5">
            Từ chối <Badge variant="secondary" className="ml-1 text-[11px] px-1.5">{stats.rejected}</Badge>
          </TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="mt-4">
          <Card>
            <CardContent className="p-0">
              {loading ? (
                <div className="flex justify-center items-center py-20">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              ) : reports.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
                  <FileWarning className="h-12 w-12 mb-3 opacity-50" />
                  <p className="text-lg font-medium">Không có báo cáo nào</p>
                  <p className="text-sm">Thay đổi bộ lọc để xem thêm kết quả</p>
                </div>
              ) : (
                <>
                  {/* Giao diện Mobile (< md): Danh sách thẻ báo cáo & góp ý */}
                  <div className="divide-y md:hidden">
                    {reports.map((report, index) => {
                      const statusCfg = statusConfig[report.status];
                      const typeCfg = typeConfig[report.reportType];
                      const StatusIcon = statusCfg?.icon || Clock;
                      const contextName =
                        report.examId?.name ||
                        (typeof report.productId === "object" && report.productId?.name
                          ? report.productId.name
                          : null);

                      return (
                        <div
                          key={report._id}
                          className="p-3.5 space-y-2.5 hover:bg-muted/30 transition-colors cursor-pointer"
                          onClick={() => router.push(`/reports/${report._id}`)}
                        >
                          {/* Hàng 1: STT + Loại & Phân loại + Trạng thái */}
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex flex-wrap items-center gap-1.5">
                              <span className="text-xs font-mono text-muted-foreground">
                                #{(currentPage - 1) * itemsPerPage + index + 1}
                              </span>
                              <span
                                className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium ${
                                  typeCfg?.color || ""
                                }`}
                              >
                                {typeCfg?.label || report.reportType}
                              </span>
                              {report.feedbackCategory &&
                                feedbackCategoryConfig[report.feedbackCategory] && (
                                  <span
                                    className={`inline-flex items-center px-1.5 py-0.5 rounded text-[11px] font-normal ${
                                      feedbackCategoryConfig[report.feedbackCategory].color
                                    }`}
                                  >
                                    {feedbackCategoryConfig[report.feedbackCategory].label}
                                  </span>
                                )}
                            </div>
                            <Badge variant={statusCfg?.variant || "default"} className="gap-1 shrink-0 text-xs">
                              <StatusIcon className="h-3 w-3" />
                              {statusCfg?.label || report.status}
                            </Badge>
                          </div>

                          {/* Hàng 2: Nội dung báo cáo / góp ý */}
                          <div className="space-y-1">
                            {report.reportType === "feedback" ? (
                              <>
                                <div className="flex items-start gap-1.5 text-blue-700 dark:text-blue-400 font-medium text-sm">
                                  <Lightbulb className="h-4 w-4 shrink-0 text-amber-500 mt-0.5" />
                                  <p className="line-clamp-2 break-words">
                                    {report.description || report.reason || "Góp ý phát triển phần mềm"}
                                  </p>
                                </div>
                                {report.description && report.reason && (
                                  <p className="text-xs text-muted-foreground line-clamp-1">
                                    Lý do: {report.reason}
                                  </p>
                                )}
                              </>
                            ) : (
                              <>
                                <p className="text-sm font-medium line-clamp-2 break-words">
                                  {report.questionText || "Báo cáo câu hỏi"}
                                </p>
                                {report.description && (
                                  <p className="text-xs text-muted-foreground line-clamp-2">
                                    {report.description}
                                  </p>
                                )}
                              </>
                            )}
                            {contextName && (
                              <p className="text-xs text-muted-foreground">
                                Môn / Đề: <span className="font-medium text-foreground">{contextName}</span>
                              </p>
                            )}
                          </div>

                          {/* Hàng 3: Người gửi, Liên hệ & Ngày gửi */}
                          <div className="flex flex-wrap items-center justify-between gap-2 pt-1 text-xs text-muted-foreground">
                            <div className="flex flex-wrap items-center gap-1.5 min-w-0">
                              {(report.userId?.name || report.userId?.email) && (
                                <span className="truncate max-w-[180px]">
                                  {report.userId?.name || report.userId?.email}
                                </span>
                              )}
                              {report.contactValue && (
                                <Badge
                                  variant="outline"
                                  className="text-[11px] px-1.5 py-0 font-normal border-blue-200 bg-blue-50 text-blue-700"
                                >
                                  <MessageCircle className="h-2.5 w-2.5 mr-1" />
                                  {report.contactMethod === "zalo" ? "Zalo" : "FB"}: {report.contactValue}
                                </Badge>
                              )}
                            </div>
                            <span className="whitespace-nowrap">{formatDate(report.createdAt)}</span>
                          </div>

                          {/* Hàng 4: Nút thao tác nhanh trên mobile */}
                          {report.status === "pending" && (
                            <div
                              className="flex items-center justify-end gap-2 pt-2 border-t"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <Button
                                variant="outline"
                                size="sm"
                                className="h-8 text-xs text-green-600 border-green-200 hover:bg-green-50"
                                onClick={() => {
                                  setQuickAction({ reportId: report._id, action: "resolved" });
                                  setAdminNote("");
                                }}
                              >
                                <CheckCircle className="h-3.5 w-3.5 mr-1" />
                                Duyệt
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                className="h-8 text-xs text-red-600 border-red-200 hover:bg-red-50"
                                onClick={() => {
                                  setQuickAction({ reportId: report._id, action: "rejected" });
                                  setAdminNote("");
                                }}
                              >
                                <XCircle className="h-3.5 w-3.5 mr-1" />
                                Từ chối
                              </Button>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {/* Giao diện Tablet & Desktop (>= md): Bảng báo cáo */}
                  <div className="hidden md:block overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-12">#</TableHead>
                        <TableHead>Nội dung / Câu hỏi</TableHead>
                        <TableHead>Loại & Phân loại</TableHead>
                        <TableHead>Người gửi & Liên hệ</TableHead>
                        <TableHead>Bài thi / Khóa học</TableHead>
                        <TableHead>Trạng thái</TableHead>
                        <TableHead>Trùng</TableHead>
                        <TableHead>Ngày tạo</TableHead>
                        <TableHead className="text-right">Thao tác</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {reports.map((report, index) => {
                        const statusCfg = statusConfig[report.status];
                        const typeCfg = typeConfig[report.reportType];
                        const StatusIcon = statusCfg?.icon || Clock;

                        return (
                          <TableRow
                            key={report._id}
                            className="cursor-pointer hover:bg-muted/50 transition-colors"
                            onClick={() => router.push(`/reports/${report._id}`)}
                          >
                            <TableCell className="text-muted-foreground text-sm">
                              {(currentPage - 1) * itemsPerPage + index + 1}
                            </TableCell>
                            <TableCell className="max-w-[300px]">
                              {report.reportType === "feedback" ? (
                                <div className="space-y-1">
                                  <div className="flex items-center gap-1.5 text-blue-700 dark:text-blue-400 font-medium text-sm">
                                    <Lightbulb className="h-4 w-4 flex-shrink-0 text-amber-500" />
                                    <span className="truncate">
                                      {truncateText(report.description || report.reason || "Góp ý phát triển phần mềm", 60)}
                                    </span>
                                  </div>
                                  {report.description && report.reason && (
                                    <p className="text-xs text-muted-foreground truncate">
                                      Lý do: {truncateText(report.reason, 50)}
                                    </p>
                                  )}
                                  {report.imageUrl && (
                                    <div className="flex items-center gap-1 text-[11px] text-muted-foreground">
                                      <ImageIcon className="h-3 w-3 text-blue-500" />
                                      <span>Có ảnh đính kèm</span>
                                    </div>
                                  )}
                                </div>
                              ) : (
                                <div>
                                  <p className="text-sm font-medium truncate">
                                    {truncateText(report.questionText || "", 60)}
                                  </p>
                                  {report.description && (
                                    <p className="text-xs text-muted-foreground truncate mt-0.5">
                                      {truncateText(report.description, 50)}
                                    </p>
                                  )}
                                </div>
                              )}
                            </TableCell>
                            <TableCell>
                              <div className="flex flex-col gap-1 items-start">
                                <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium ${typeCfg?.color || ""}`}>
                                  {typeCfg?.label || report.reportType}
                                </span>
                                {report.feedbackCategory && feedbackCategoryConfig[report.feedbackCategory] && (
                                  <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[11px] font-normal ${feedbackCategoryConfig[report.feedbackCategory].color}`}>
                                    {feedbackCategoryConfig[report.feedbackCategory].label}
                                  </span>
                                )}
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="text-sm">
                                {report.userId?.name && (
                                  <p className="font-medium">{report.userId.name}</p>
                                )}
                                {report.userId?.email && (
                                  <p className="text-xs text-muted-foreground">{report.userId.email}</p>
                                )}
                                {report.contactValue && (
                                  <div className="mt-1 flex items-center gap-1">
                                    <Badge variant="outline" className="text-[11px] px-1.5 py-0 font-normal border-blue-200 bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300">
                                      <MessageCircle className="h-2.5 w-2.5 mr-1" />
                                      {report.contactMethod === "zalo" ? "Zalo" : "FB"}: {report.contactValue}
                                    </Badge>
                                  </div>
                                )}
                              </div>
                            </TableCell>
                            <TableCell>
                              <span className="text-sm">
                                {report.examId?.name || (typeof report.productId === "object" && report.productId?.name ? report.productId.name : "—")}
                              </span>
                            </TableCell>
                            <TableCell>
                              <Badge variant={statusCfg?.variant || "default"} className="gap-1">
                                <StatusIcon className="h-3 w-3" />
                                {statusCfg?.label || report.status}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              {report.questionId ? (
                                report.duplicateCount > 1 ? (
                                  <Badge variant="outline" className="gap-1 text-orange-600 border-orange-300">
                                    <Copy className="h-3 w-3" />
                                    {report.duplicateCount}
                                  </Badge>
                                ) : (
                                  <span className="text-sm text-muted-foreground">1</span>
                                )
                              ) : (
                                <span className="text-sm text-muted-foreground">—</span>
                              )}
                            </TableCell>
                            <TableCell>
                              <span className="text-sm text-muted-foreground whitespace-nowrap">
                                {formatDate(report.createdAt)}
                              </span>
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex items-center justify-end gap-1" onClick={(e) => e.stopPropagation()}>
                                {report.status === "pending" && (
                                  <>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className="h-8 text-green-600 hover:text-green-700 hover:bg-green-50"
                                      onClick={() => {
                                        setQuickAction({ reportId: report._id, action: "resolved" });
                                        setAdminNote("");
                                      }}
                                    >
                                      <CheckCircle className="h-4 w-4 mr-1" />
                                      Duyệt
                                    </Button>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className="h-8 text-red-600 hover:text-red-700 hover:bg-red-50"
                                      onClick={() => {
                                        setQuickAction({ reportId: report._id, action: "rejected" });
                                        setAdminNote("");
                                      }}
                                    >
                                      <XCircle className="h-4 w-4 mr-1" />
                                      Từ chối
                                    </Button>
                                  </>
                                )}
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-8"
                                  onClick={() => router.push(`/reports/${report._id}`)}
                                >
                                  <Eye className="h-4 w-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                  </div>

                  {/* Pagination */}
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-2 px-4 py-3 border-t">
                    <p className="text-xs sm:text-sm text-muted-foreground text-center sm:text-left">
                      Hiển thị {reports.length} / {totalCount} báo cáo • Trang {currentPage} / {totalPages}
                    </p>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={currentPage <= 1}
                        onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                      >
                        Trước
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={currentPage >= totalPages}
                        onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                      >
                        Sau
                      </Button>
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Quick Action Dialog */}
      <Dialog open={!!quickAction} onOpenChange={(open) => { if (!open) { setQuickAction(null); setAdminNote(""); } }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {quickAction?.action === "resolved" ? "✅ Duyệt báo cáo" : "❌ Từ chối báo cáo"}
            </DialogTitle>
            <DialogDescription>
              Nhập ghi chú phản hồi cho sinh viên. Ghi chú này sẽ hiển thị cho người báo cáo.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <Textarea
              placeholder="Nhập ghi chú admin..."
              value={adminNote}
              onChange={(e) => setAdminNote(e.target.value)}
              rows={4}
              className="resize-none"
            />
            <p className="text-xs text-muted-foreground">
              * Ghi chú là bắt buộc khi xử lý hoặc từ chối báo cáo
            </p>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => { setQuickAction(null); setAdminNote(""); }}>
              Hủy
            </Button>
            <Button
              onClick={handleQuickAction}
              disabled={actionLoading || !adminNote.trim()}
              variant={quickAction?.action === "resolved" ? "default" : "destructive"}
            >
              {actionLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              {quickAction?.action === "resolved" ? "Xác nhận duyệt" : "Xác nhận từ chối"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
