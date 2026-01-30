import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  EditIcon,
  ShoppingCart,
  Monitor,
  FileText,
  Clock,
  Calendar,
  BookOpen,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { API_BASE_URL } from "@/contants/api";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";

interface User {
  _id: string;
  name: string;
  email: string;
  avatar: string;
  status: string;
}

interface SessionData {
  userId: string;
  deviceInfo: {
    userAgent: string;
    ip: string;
    deviceName: string;
    browser: string;
    os: string;
  };
  createdAt: string;
}

interface ExamHistoryData {
  examId: string;
  examName: string;
  userId: string;
  score: number;
  totalQuestions: number;
  duration: number;
  examType: string;
  createdAt: string;
}

interface PracticeExamHistoryData {
  courseId: string;
  courseName: string;
  userId: string;
  score: number;
  totalQuestions: number;
  correctAnswers: number;
  duration: number;
  practiceType: string;
  status: string;
  startedAt: string;
  createdAt: string;
  lastSyncAt: string;
}

interface UserTableProps {
  users: User[];
  loading: boolean;
  updateUserStatus: (userId: string, newStatus: string) => Promise<void>;
  updateUserInfo: (
    userId: string,
    name: string,
    email: string
  ) => Promise<void>;
}

export function UserTable({
  users,
  loading,
  updateUserStatus,
  updateUserInfo,
}: UserTableProps) {
  const [editingUser, setEditingUser] = React.useState<User | null>(null);
  const [editName, setEditName] = React.useState("");
  const [editEmail, setEditEmail] = React.useState("");
  const router = useRouter();
  const { toast } = useToast();

  // Sessions state
  const [showSessionsModal, setShowSessionsModal] = React.useState(false);
  const [sessionsData, setSessionsData] = React.useState<SessionData[]>([]);
  const [sessionsLoading, setSessionsLoading] = React.useState(false);
  const [selectedUserForSessions, setSelectedUserForSessions] =
    React.useState<User | null>(null);

  // Exam history state
  const [showExamHistoryModal, setShowExamHistoryModal] = React.useState(false);
  const [examHistoryData, setExamHistoryData] = React.useState<
    ExamHistoryData[]
  >([]);
  const [examHistoryLoading, setExamHistoryLoading] = React.useState(false);
  const [selectedUserForHistory, setSelectedUserForHistory] =
    React.useState<User | null>(null);

  // Practice exam history state
  const [showPracticeHistoryModal, setShowPracticeHistoryModal] =
    React.useState(false);
  const [practiceHistoryData, setPracticeHistoryData] = React.useState<
    PracticeExamHistoryData[]
  >([]);
  const [practiceHistoryLoading, setPracticeHistoryLoading] =
    React.useState(false);
  const [selectedUserForPracticeHistory, setSelectedUserForPracticeHistory] =
    React.useState<User | null>(null);

  // Helper function to format date
  const formatDate = (dateString: string | null | undefined) => {
    // Validate input
    if (!dateString || typeof dateString !== "string") {
      return "N/A";
    }

    const date = new Date(dateString);

    // Check if date is valid
    if (isNaN(date.getTime())) {
      return "N/A";
    }

    return new Intl.DateTimeFormat("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    }).format(date);
  };

  // Helper function to format duration from seconds to minutes:seconds
  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
  };

  // Fetch sessions data
  const fetchSessions = async (email: string) => {
    try {
      setSessionsLoading(true);
      const responseUser = await fetch(`${API_BASE_URL}/users/${email}`);
      if (!responseUser.ok) {
        throw new Error("Không thể tải dữ liệu người dùng");
      }
      const dataUser = await responseUser.json();

      const userId = dataUser?.data?._id;

      const response = await fetch(`${API_BASE_URL}/sessions/${userId}`);
      if (!response.ok) {
        throw new Error("Không thể tải dữ liệu phiên đăng nhập");
      }
      const data = await response.json();
      setSessionsData(data.data || []);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Lỗi không xác định";
      console.error("Lỗi khi tải sessions:", errorMessage);
      toast({
        title: "Lỗi",
        description: "Không thể tải dữ liệu phiên đăng nhập. Vui lòng thử lại.",
        variant: "destructive",
      });
    } finally {
      setSessionsLoading(false);
    }
  };

  // Fetch exam history data
  const fetchExamHistory = async (email: string) => {
    try {
      setExamHistoryLoading(true);
      // lấy user _id từ email

      const responseUser = await fetch(`${API_BASE_URL}/users/${email}`);
      if (!responseUser.ok) {
        throw new Error("Không thể tải dữ liệu người dùng");
      }
      const dataUser = await responseUser.json();

      const userId = dataUser?.data?._id;

      const response = await fetch(`${API_BASE_URL}/exam-histories/${userId}`);
      if (!response.ok) {
        throw new Error("Không thể tải dữ liệu lịch sử thi");
      }
      const data = await response.json();
      setExamHistoryData(data.data || []);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Lỗi không xác định";
      console.error("Lỗi khi tải exam history:", errorMessage);
      toast({
        title: "Lỗi",
        description: "Không thể tải dữ liệu lịch sử thi. Vui lòng thử lại.",
        variant: "destructive",
      });
    } finally {
      setExamHistoryLoading(false);
    }
  };

  // Fetch practice history data (cũ - không dùng)
  const fetchPracticeHistory = async (email: string) => {
    try {
      // lấy user _id từ email
      const responseUser = await fetch(`${API_BASE_URL}/users/${email}`);
      if (!responseUser.ok) {
        throw new Error("Không thể tải dữ liệu người dùng");
      }
      const dataUser = await responseUser.json();
      const userId = dataUser?.data?._id;
      const response = await fetch(
        `${API_BASE_URL}/practice-histories/${userId}`
      );
      if (!response.ok) {
        throw new Error("Không thể tải dữ liệu lịch sử luyện tập");
      }
      const data = await response.json();
      return data.data || [];
    } catch (error) {
      console.error("Lỗi khi tải practice history:", error);
      return [];
    }
  };

  // Fetch practice exam history data
  const fetchPracticeExamHistory = async (email: string) => {
    try {
      setPracticeHistoryLoading(true);
      // lấy user _id từ email
      const responseUser = await fetch(`${API_BASE_URL}/users/${email}`);
      if (!responseUser.ok) {
        throw new Error("Không thể tải dữ liệu người dùng");
      }
      const dataUser = await responseUser.json();

      const userId = dataUser?.data?._id;

      const response = await fetch(
        `${API_BASE_URL}/PracticeExamHistory/${userId}`
      );
      if (!response.ok) {
        throw new Error("Không thể tải dữ liệu lịch sử thi thử");
      }
      const data = await response.json();
      setPracticeHistoryData(data.data || []);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Lỗi không xác định";
      console.error("Lỗi khi tải practice exam history:", errorMessage);
      toast({
        title: "Lỗi",
        description: "Không thể tải dữ liệu lịch sử thi thử. Vui lòng thử lại.",
        variant: "destructive",
      });
    } finally {
      setPracticeHistoryLoading(false);
    }
  };

  // Handle view sessions
  const handleViewSessions = (user: User) => {
    setSelectedUserForSessions(user);
    setShowSessionsModal(true);
    fetchSessions(user.email);
  };

  // Handle view exam history
  const handleViewExamHistory = (user: User) => {
    setSelectedUserForHistory(user);
    setShowExamHistoryModal(true);
    fetchExamHistory(user.email);
  };

  // Handle view practice exam history
  const handleViewPracticeHistory = (user: User) => {
    setSelectedUserForPracticeHistory(user);
    setShowPracticeHistoryModal(true);
    fetchPracticeExamHistory(user.email);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[100px]">Ảnh đại diện</TableHead>
            <TableHead>Tên</TableHead>
            <TableHead className="hidden md:table-cell">Email</TableHead>
            <TableHead>Trạng thái</TableHead>
            <TableHead>Hành động</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.map((user) => (
            <TableRow
              key={user._id}
              className={
                user.status === "active"
                  ? "bg-green-50"
                  : user.status === "inactive"
                  ? "bg-red-50"
                  : ""
              }
            >
              <TableCell>
                <Avatar>
                  <AvatarImage src={user.avatar} alt={user.name} />
                  <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                </Avatar>
              </TableCell>
              <TableCell className="font-medium">
                <div>{user.name}</div>
                <div className="text-sm text-muted-foreground md:hidden">
                  {user.email}
                </div>
              </TableCell>
              <TableCell className="hidden md:table-cell">
                {user.email}
              </TableCell>
              <TableCell>
                <div className="flex space-x-2">
                  <Select
                    value={user.status}
                    onValueChange={(value) => updateUserStatus(user._id, value)}
                  >
                    <SelectTrigger className="w-[37px] md:w-[120px]">
                      <SelectValue placeholder="Trạng thái" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Hoạt động</SelectItem>
                      <SelectItem value="inactive">Không hoạt động</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </TableCell>
              <TableCell>
                <div className="flex space-x-1 md:space-x-2">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() =>
                      router.push(`/list-orders?userId=${user._id}`)
                    }
                    title="Xem đơn hàng"
                  >
                    <ShoppingCart className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => handleViewSessions(user)}
                    title="Xem phiên đăng nhập"
                  >
                    <Monitor className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => handleViewExamHistory(user)}
                    title="Xem lịch sử thi"
                  >
                    <FileText className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => handleViewPracticeHistory(user)}
                    title="Xem lịch sử thi thử"
                  >
                    <BookOpen className="h-4 w-4" />
                  </Button>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button
                        variant="outline"
                        onClick={() => {
                          setEditingUser(user);
                          setEditName(user.name);
                          setEditEmail(user.email);
                        }}
                      >
                        <EditIcon className="w-4 h-4" />
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>
                          Chỉnh sửa thông tin người dùng
                        </DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4">
                        <Input
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                          placeholder="Tên"
                        />
                        <Input
                          value={editEmail}
                          onChange={(e) => setEditEmail(e.target.value)}
                          placeholder="Email"
                        />
                        <Button
                          onClick={() => {
                            updateUserInfo(user._id, editName, editEmail);
                            setEditingUser(null);
                          }}
                        >
                          Lưu thay đổi
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {/* Sessions Modal */}
      <Dialog open={showSessionsModal} onOpenChange={setShowSessionsModal}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Monitor className="h-5 w-5" />
              Phiên đăng nhập - {selectedUserForSessions?.name}
            </DialogTitle>
          </DialogHeader>
          <ScrollArea className="max-h-[500px]">
            {sessionsLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
              </div>
            ) : sessionsData.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                Không có phiên đăng nhập nào
              </div>
            ) : (
              <div className="space-y-4 pr-4">
                {sessionsData.map((session, index) => (
                  <div key={index} className="border rounded-lg p-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <Monitor className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium">Thiết bị:</span>
                          <Badge variant="outline">
                            {session.deviceInfo.deviceName}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="font-medium">Trình duyệt:</span>
                          <span className="text-sm">
                            {session.deviceInfo.browser}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="font-medium">Hệ điều hành:</span>
                          <span className="text-sm">
                            {session.deviceInfo.os}
                          </span>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">IP:</span>
                          <Badge variant="secondary">
                            {session.deviceInfo.ip}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium">Thời gian:</span>
                          <span className="text-sm">
                            {formatDate(session.createdAt)}
                          </span>
                        </div>
                      </div>
                    </div>
                    <Separator className="my-3" />
                    <div className="text-xs text-muted-foreground">
                      <strong>User Agent:</strong>{" "}
                      {session.deviceInfo.userAgent}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
        </DialogContent>
      </Dialog>

      {/* Exam History Modal */}
      <Dialog
        open={showExamHistoryModal}
        onOpenChange={setShowExamHistoryModal}
      >
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Lịch sử thi - {selectedUserForHistory?.name}
            </DialogTitle>
          </DialogHeader>
          <ScrollArea className="max-h-[500px]">
            {examHistoryLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
              </div>
            ) : examHistoryData.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                Không có lịch sử thi nào
              </div>
            ) : (
              <div className="space-y-4 pr-4">
                {examHistoryData.map((exam, index) => (
                  <div key={index} className="border rounded-lg p-4">
                    <div className="space-y-3">
                      <div className="flex items-start justify-between">
                        <h4 className="font-medium text-lg leading-tight">
                          {exam.examName.trim()}
                        </h4>
                        <Badge
                          variant={
                            exam.examType === "quizizz"
                              ? "default"
                              : "secondary"
                          }
                          className="ml-2"
                        >
                          {exam.examType}
                        </Badge>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="text-center p-3 bg-green-50 rounded-lg">
                          <div className="text-2xl font-bold text-green-600">
                            {exam.score}
                          </div>
                          <div className="text-xs text-green-600 font-medium">
                            Điểm số
                          </div>
                        </div>

                        <div className="text-center p-3 bg-blue-50 rounded-lg">
                          <div className="text-2xl font-bold text-blue-600">
                            {exam.totalQuestions}
                          </div>
                          <div className="text-xs text-blue-600 font-medium">
                            Tổng câu hỏi
                          </div>
                        </div>

                        <div className="text-center p-3 bg-orange-50 rounded-lg">
                          <div className="text-2xl font-bold text-orange-600 flex items-center justify-center gap-1">
                            <Clock className="h-4 w-4" />
                            {formatDuration(exam.duration)}
                          </div>
                          <div className="text-xs text-orange-600 font-medium">
                            Thời gian
                          </div>
                        </div>

                        <div className="text-center p-3 bg-purple-50 rounded-lg">
                          <div className="text-sm font-bold text-purple-600 flex items-center justify-center gap-1">
                            <Calendar className="h-4 w-4" />
                            {formatDate(exam.createdAt).split(" ")[0]}
                          </div>
                          <div className="text-xs text-purple-600 font-medium">
                            Ngày thi
                          </div>
                        </div>
                      </div>

                      <div className="text-xs text-muted-foreground">
                        <strong>Thời gian hoàn thành:</strong>{" "}
                        {formatDate(exam.createdAt)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
        </DialogContent>
      </Dialog>

      {/* Practice Exam History Modal */}
      <Dialog
        open={showPracticeHistoryModal}
        onOpenChange={setShowPracticeHistoryModal}
      >
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              Lịch sử thi thử - {selectedUserForPracticeHistory?.name}
            </DialogTitle>
          </DialogHeader>
          <ScrollArea className="max-h-[500px]">
            {practiceHistoryLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
              </div>
            ) : practiceHistoryData.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                Không có lịch sử thi thử nào
              </div>
            ) : (
              <div className="space-y-4 pr-4">
                {practiceHistoryData.map((practice, index) => (
                  <div key={index} className="border rounded-lg p-4">
                    <div className="space-y-3">
                      <div className="flex items-start justify-between">
                        <h4 className="font-medium text-lg leading-tight">
                          {practice.courseName.trim()}
                        </h4>
                        <div className="flex gap-2">
                          <Badge variant="outline">
                            {practice.practiceType}
                          </Badge>
                          <Badge
                            variant={
                              practice.status === "completed"
                                ? "default"
                                : "secondary"
                            }
                          >
                            {practice.status === "completed"
                              ? "Hoàn thành"
                              : practice.status}
                          </Badge>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="text-center p-3 bg-green-50 rounded-lg">
                          <div className="text-2xl font-bold text-green-600">
                            {practice.score}
                          </div>
                          <div className="text-xs text-green-600 font-medium">
                            Điểm số
                          </div>
                        </div>

                        <div className="text-center p-3 bg-blue-50 rounded-lg">
                          <div className="text-2xl font-bold text-blue-600">
                            {practice.correctAnswers}/{practice.totalQuestions}
                          </div>
                          <div className="text-xs text-blue-600 font-medium">
                            Câu trả lời đúng
                          </div>
                        </div>

                        <div className="text-center p-3 bg-orange-50 rounded-lg">
                          <div className="text-2xl font-bold text-orange-600 flex items-center justify-center gap-1">
                            <Clock className="h-4 w-4" />
                            {formatDuration(practice.duration)}
                          </div>
                          <div className="text-xs text-orange-600 font-medium">
                            Thời gian
                          </div>
                        </div>

                        <div className="text-center p-3 bg-purple-50 rounded-lg">
                          <div className="text-sm font-bold text-purple-600 flex items-center justify-center gap-1">
                            <Calendar className="h-4 w-4" />
                            {formatDate(practice.startedAt).split(" ")[0]}
                          </div>
                          <div className="text-xs text-purple-600 font-medium">
                            Ngày thi
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs text-muted-foreground">
                        <div>
                          <strong>Bắt đầu:</strong>{" "}
                          {formatDate(practice.startedAt)}
                        </div>
                        <div>
                          <strong>Đồng bộ lần cuối:</strong>{" "}
                          {formatDate(practice.lastSyncAt)}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </div>
  );
}
