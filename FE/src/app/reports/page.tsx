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
} from "lucide-react";

// Types
interface Report {
  _id: string;
  userId: { _id: string; name: string; email: string } | null;
  questionId: string;
  examId: { _id: string; name: string } | null;
  reportType: "content_error" | "wrong_answer";
  description?: string;
  correctAnswer?: string;
  reason?: string;
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
  }, [currentPage, activeTab, reportTypeFilter, searchTerm, toast]);

  useEffect(() => {
    fetchReports();
  }, [fetchReports]);

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [activeTab, reportTypeFilter, searchTerm]);

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
    <div className="container mx-auto py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Quản lý Báo cáo lỗi</h1>
          <p className="text-muted-foreground mt-1">
            Theo dõi và xử lý các báo cáo lỗi câu hỏi từ sinh viên
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card className="border-l-4 border-l-blue-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground font-medium">Tổng cộng</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
              <FileWarning className="h-8 w-8 text-blue-500 opacity-80" />
            </div>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-yellow-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground font-medium">Chờ xử lý</p>
                <p className="text-2xl font-bold">{stats.pending}</p>
              </div>
              <Clock className="h-8 w-8 text-yellow-500 opacity-80" />
            </div>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-purple-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground font-medium">Đang xem</p>
                <p className="text-2xl font-bold">{stats.reviewed}</p>
              </div>
              <Eye className="h-8 w-8 text-purple-500 opacity-80" />
            </div>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-green-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground font-medium">Đã xử lý</p>
                <p className="text-2xl font-bold">{stats.resolved}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-500 opacity-80" />
            </div>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-red-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground font-medium">Từ chối</p>
                <p className="text-2xl font-bold">{stats.rejected}</p>
              </div>
              <XCircle className="h-8 w-8 text-red-500 opacity-80" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Tìm kiếm theo nội dung câu hỏi..."
            className="pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Select value={reportTypeFilter} onValueChange={setReportTypeFilter}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="Loại báo cáo" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tất cả loại</SelectItem>
            <SelectItem value="content_error">Lỗi nội dung</SelectItem>
            <SelectItem value="wrong_answer">Sai đáp án</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Tabs + Table */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="all" className="text-xs sm:text-sm">
            Tất cả <Badge variant="secondary" className="ml-1.5 text-xs">{stats.total}</Badge>
          </TabsTrigger>
          <TabsTrigger value="pending" className="text-xs sm:text-sm">
            Chờ xử lý <Badge variant="secondary" className="ml-1.5 text-xs">{stats.pending}</Badge>
          </TabsTrigger>
          <TabsTrigger value="reviewed" className="text-xs sm:text-sm">
            Đang xem <Badge variant="secondary" className="ml-1.5 text-xs">{stats.reviewed}</Badge>
          </TabsTrigger>
          <TabsTrigger value="resolved" className="text-xs sm:text-sm">
            Đã xử lý <Badge variant="secondary" className="ml-1.5 text-xs">{stats.resolved}</Badge>
          </TabsTrigger>
          <TabsTrigger value="rejected" className="text-xs sm:text-sm">
            Từ chối <Badge variant="secondary" className="ml-1.5 text-xs">{stats.rejected}</Badge>
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
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-12">#</TableHead>
                        <TableHead>Nội dung câu hỏi</TableHead>
                        <TableHead>Loại</TableHead>
                        <TableHead>Người báo cáo</TableHead>
                        <TableHead>Bài thi</TableHead>
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
                            <TableCell className="max-w-[280px]">
                              <p className="text-sm font-medium truncate">
                                {truncateText(report.questionText || "", 60)}
                              </p>
                              {report.description && (
                                <p className="text-xs text-muted-foreground truncate mt-0.5">
                                  {truncateText(report.description, 50)}
                                </p>
                              )}
                            </TableCell>
                            <TableCell>
                              <span className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-medium ${typeCfg?.color || ""}`}>
                                {typeCfg?.label || report.reportType}
                              </span>
                            </TableCell>
                            <TableCell>
                              <div className="text-sm">
                                <p className="font-medium">{report.userId?.name || "N/A"}</p>
                                <p className="text-xs text-muted-foreground">{report.userId?.email || ""}</p>
                              </div>
                            </TableCell>
                            <TableCell>
                              <span className="text-sm">{report.examId?.name || "—"}</span>
                            </TableCell>
                            <TableCell>
                              <Badge variant={statusCfg?.variant || "default"} className="gap-1">
                                <StatusIcon className="h-3 w-3" />
                                {statusCfg?.label || report.status}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              {report.duplicateCount > 1 ? (
                                <Badge variant="outline" className="gap-1 text-orange-600 border-orange-300">
                                  <Copy className="h-3 w-3" />
                                  {report.duplicateCount}
                                </Badge>
                              ) : (
                                <span className="text-sm text-muted-foreground">1</span>
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

                  {/* Pagination */}
                  <div className="flex items-center justify-between px-4 py-3 border-t">
                    <p className="text-sm text-muted-foreground">
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
