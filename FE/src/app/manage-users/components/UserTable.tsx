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
  BookMarked,
  Activity,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { API_BASE_URL } from "@/contants/api";
import { fetchApi } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import UserSessionModal from "./UserSessionModal";
import UserCoursesModal from "./UserCoursesModal";
import UserActivityModal from "./UserActivityModal";

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

  // User Courses state
  const [showCoursesModal, setShowCoursesModal] = React.useState(false);
  const [selectedUserForCourses, setSelectedUserForCourses] = React.useState<User | null>(null);

  // User Activity state
  const [showActivityModal, setShowActivityModal] = React.useState(false);
  const [selectedUserForActivity, setSelectedUserForActivity] = React.useState<User | null>(null);

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

  // Handle view sessions
  const handleViewSessions = (user: User) => {
    setSelectedUserForSessions(user);
    setShowSessionsModal(true);
  };

  // Fetch exam history data
  const fetchExamHistory = async (email: string) => {
    try {
      setExamHistoryLoading(true);
      // lấy user _id từ email

      const responseUser = await fetchApi(`/users/${email}`);
      if (!responseUser.ok) {
        throw new Error("Không thể tải dữ liệu người dùng");
      }
      const dataUser = await responseUser.json();

      const userId = dataUser?.data?._id;

      const response = await fetchApi(`/exam-histories/${userId}`);
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

  // Fetch practice exam history data
  const fetchPracticeExamHistory = async (email: string) => {
    try {
      setPracticeHistoryLoading(true);
      // lấy user _id từ email
      const responseUser = await fetchApi(`/users/${email}`);
      if (!responseUser.ok) {
        throw new Error("Không thể tải dữ liệu người dùng");
      }
      const dataUser = await responseUser.json();

      const userId = dataUser?.data?._id;

      const response = await fetchApi(`/PracticeExamHistory/${userId}`
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
    <div>
      {/* Giao diện Mobile (< md): Hiển thị dạng danh sách thẻ (Card List) chống tràn ngang */}
      <div className="grid grid-cols-1 gap-3 md:hidden">
        {users.map((user) => (
          <div
            key={user._id}
            className={`rounded-xl border p-3.5 shadow-sm transition-colors ${
              user.status === "active"
                ? "bg-green-50/60 border-green-200"
                : user.status === "inactive"
                ? "bg-red-50/60 border-red-200"
                : "bg-card"
            }`}
          >
            {/* Hàng trên: Avatar + Tên/Email + Chọn trạng thái */}
            <div className="flex items-start justify-between gap-2.5">
              <div className="flex items-center gap-2.5 min-w-0 flex-1">
                <Avatar className="h-10 w-10 shrink-0 border">
                  <AvatarImage src={user.avatar} alt={user.name} />
                  <AvatarFallback>{user.name?.charAt(0) || "U"}</AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-sm text-foreground truncate">
                    {user.name}
                  </p>
                  <p className="text-xs text-muted-foreground truncate">
                    {user.email}
                  </p>
                </div>
              </div>

              <div className="shrink-0">
                <Select
                  value={user.status}
                  onValueChange={(value) => updateUserStatus(user._id, value)}
                >
                  <SelectTrigger className="h-8 w-[126px] text-xs bg-white">
                    <SelectValue placeholder="Trạng thái" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Hoạt động</SelectItem>
                    <SelectItem value="inactive">Không hoạt động</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Hàng dưới: Thanh 7 nút công cụ chia đều vừa khung mobile */}
            <div className="grid grid-cols-7 gap-1.5 mt-3 pt-2.5 border-t border-black/5">
              <Button
                variant="outline"
                size="icon"
                className="h-9 w-full bg-white"
                onClick={() => router.push(`/list-orders?userId=${user._id}`)}
                title="Xem đơn hàng"
              >
                <ShoppingCart className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="h-9 w-full bg-white"
                onClick={() => handleViewSessions(user)}
                title="Xem phiên đăng nhập"
              >
                <Monitor className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="h-9 w-full bg-white"
                onClick={() => {
                  setSelectedUserForCourses(user);
                  setShowCoursesModal(true);
                }}
                title="Xem khóa học đã sở hữu"
              >
                <BookMarked className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="h-9 w-full bg-white"
                onClick={() => handleViewExamHistory(user)}
                title="Xem lịch sử thi"
              >
                <FileText className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="h-9 w-full bg-white"
                onClick={() => handleViewPracticeHistory(user)}
                title="Xem lịch sử thi thử"
              >
                <BookOpen className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="h-9 w-full bg-white"
                onClick={() => {
                  setSelectedUserForActivity(user);
                  setShowActivityModal(true);
                }}
                title="Xem lịch sử hoạt động"
              >
                <Activity className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="h-9 w-full bg-white"
                onClick={() => {
                  setEditingUser(user);
                  setEditName(user.name);
                  setEditEmail(user.email);
                }}
                title="Chỉnh sửa thông tin"
              >
                <EditIcon className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ))}
      </div>

      {/* Giao diện Tablet & Desktop (>= md): Hiển thị dạng Bảng */}
      <div className="hidden md:block rounded-md border overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[80px]">Ảnh đại diện</TableHead>
              <TableHead>Tên</TableHead>
              <TableHead>Email</TableHead>
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
                </TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>
                  <div className="flex space-x-2">
                    <Select
                      value={user.status}
                      onValueChange={(value) => updateUserStatus(user._id, value)}
                    >
                      <SelectTrigger className="w-[140px]">
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
                  <div className="flex space-x-1.5 lg:space-x-2">
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
                      onClick={() => {
                        setSelectedUserForCourses(user);
                        setShowCoursesModal(true);
                      }}
                      title="Xem khóa học đã sở hữu"
                    >
                      <BookMarked className="h-4 w-4" />
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
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => {
                        setSelectedUserForActivity(user);
                        setShowActivityModal(true);
                      }}
                      title="Xem lịch sử hoạt động"
                    >
                      <Activity className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => {
                        setEditingUser(user);
                        setEditName(user.name);
                        setEditEmail(user.email);
                      }}
                      title="Chỉnh sửa thông tin"
                    >
                      <EditIcon className="w-4 h-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Edit User Info Modal */}
      <Dialog
        open={!!editingUser}
        onOpenChange={(open) => !open && setEditingUser(null)}
      >
        <DialogContent className="w-[94vw] sm:max-w-md p-4 sm:p-6">
          <DialogHeader className="pr-6">
            <DialogTitle className="text-base sm:text-lg text-left">
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
              className="w-full sm:w-auto"
              onClick={() => {
                if (editingUser) {
                  updateUserInfo(editingUser._id, editName, editEmail);
                  setEditingUser(null);
                }
              }}
            >
              Lưu thay đổi
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <UserSessionModal 
        isOpen={showSessionsModal}
        onClose={() => setShowSessionsModal(false)}
        userId={selectedUserForSessions?._id || null}
        userName={selectedUserForSessions?.name || ""}
      />

      <UserCoursesModal
        isOpen={showCoursesModal}
        onClose={() => setShowCoursesModal(false)}
        userEmail={selectedUserForCourses?.email || null}
        userName={selectedUserForCourses?.name || ""}
      />

      <UserActivityModal
        isOpen={showActivityModal}
        onClose={() => setShowActivityModal(false)}
        customerId={selectedUserForActivity?._id || null}
        userName={selectedUserForActivity?.name || ""}
      />

      {/* Exam History Modal */}
      <Dialog
        open={showExamHistoryModal}
        onOpenChange={setShowExamHistoryModal}
      >
        <DialogContent className="w-[94vw] sm:max-w-4xl max-h-[88vh] flex flex-col p-4 sm:p-6">
          <DialogHeader className="pr-6">
            <DialogTitle className="flex items-center gap-2 text-base sm:text-lg text-left">
              <FileText className="h-5 w-5 shrink-0" />
              <span className="truncate">Lịch sử thi - {selectedUserForHistory?.name}</span>
            </DialogTitle>
          </DialogHeader>
          <ScrollArea className="max-h-[68vh] sm:max-h-[500px] w-full">
            {examHistoryLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
              </div>
            ) : examHistoryData.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground text-sm">
                Không có lịch sử thi nào
              </div>
            ) : (
              <div className="space-y-3 sm:space-y-4 pr-2 sm:pr-4">
                {examHistoryData.map((exam, index) => (
                  <div key={index} className="border rounded-lg p-3 sm:p-4">
                    <div className="space-y-3">
                      <div className="flex items-start justify-between gap-2">
                        <h4 className="font-medium text-sm sm:text-lg leading-tight flex-1 min-w-0 break-words">
                          {exam.examName.trim()}
                        </h4>
                        <Badge
                          variant={
                            exam.examType === "quizizz"
                              ? "default"
                              : "secondary"
                          }
                          className="shrink-0 text-xs"
                        >
                          {exam.examType}
                        </Badge>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-4">
                        <div className="text-center p-2.5 sm:p-3 bg-green-50 rounded-lg">
                          <div className="text-lg sm:text-2xl font-bold text-green-600">
                            {exam.score}
                          </div>
                          <div className="text-[11px] sm:text-xs text-green-600 font-medium">
                            Điểm số
                          </div>
                        </div>

                        <div className="text-center p-2.5 sm:p-3 bg-blue-50 rounded-lg">
                          <div className="text-lg sm:text-2xl font-bold text-blue-600">
                            {exam.totalQuestions}
                          </div>
                          <div className="text-[11px] sm:text-xs text-blue-600 font-medium">
                            Tổng câu hỏi
                          </div>
                        </div>

                        <div className="text-center p-2.5 sm:p-3 bg-orange-50 rounded-lg">
                          <div className="text-lg sm:text-2xl font-bold text-orange-600 flex items-center justify-center gap-1">
                            <Clock className="h-3.5 w-3.5 sm:h-4 sm:w-4 shrink-0" />
                            {formatDuration(exam.duration)}
                          </div>
                          <div className="text-[11px] sm:text-xs text-orange-600 font-medium">
                            Thời gian
                          </div>
                        </div>

                        <div className="text-center p-2.5 sm:p-3 bg-amber-50 rounded-lg">
                          <div className="text-xs sm:text-sm font-bold text-amber-700 flex items-center justify-center gap-1">
                            <Calendar className="h-3.5 w-3.5 sm:h-4 sm:w-4 shrink-0" />
                            {formatDate(exam.createdAt).split(" ")[0]}
                          </div>
                          <div className="text-[11px] sm:text-xs text-amber-700 font-medium">
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
        <DialogContent className="w-[94vw] sm:max-w-4xl max-h-[88vh] flex flex-col p-4 sm:p-6">
          <DialogHeader className="pr-6">
            <DialogTitle className="flex items-center gap-2 text-base sm:text-lg text-left">
              <BookOpen className="h-5 w-5 shrink-0" />
              <span className="truncate">Lịch sử thi thử - {selectedUserForPracticeHistory?.name}</span>
            </DialogTitle>
          </DialogHeader>
          <ScrollArea className="max-h-[68vh] sm:max-h-[500px] w-full">
            {practiceHistoryLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
              </div>
            ) : practiceHistoryData.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground text-sm">
                Không có lịch sử thi thử nào
              </div>
            ) : (
              <div className="space-y-3 sm:space-y-4 pr-2 sm:pr-4">
                {practiceHistoryData.map((practice, index) => (
                  <div key={index} className="border rounded-lg p-3 sm:p-4">
                    <div className="space-y-3">
                      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                        <h4 className="font-medium text-sm sm:text-lg leading-tight flex-1 min-w-0 break-words">
                          {practice.courseName.trim()}
                        </h4>
                        <div className="flex flex-wrap gap-1.5 sm:gap-2 shrink-0">
                          <Badge variant="outline" className="text-xs">
                            {practice.practiceType}
                          </Badge>
                          <Badge
                            variant={
                              practice.status === "completed"
                                ? "default"
                                : "secondary"
                            }
                            className="text-xs"
                          >
                            {practice.status === "completed"
                              ? "Hoàn thành"
                              : practice.status}
                          </Badge>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-4">
                        <div className="text-center p-2.5 sm:p-3 bg-green-50 rounded-lg">
                          <div className="text-lg sm:text-2xl font-bold text-green-600">
                            {practice.score}
                          </div>
                          <div className="text-[11px] sm:text-xs text-green-600 font-medium">
                            Điểm số
                          </div>
                        </div>

                        <div className="text-center p-2.5 sm:p-3 bg-blue-50 rounded-lg">
                          <div className="text-lg sm:text-2xl font-bold text-blue-600">
                            {practice.correctAnswers}/{practice.totalQuestions}
                          </div>
                          <div className="text-[11px] sm:text-xs text-blue-600 font-medium">
                            Câu trả lời đúng
                          </div>
                        </div>

                        <div className="text-center p-2.5 sm:p-3 bg-orange-50 rounded-lg">
                          <div className="text-lg sm:text-2xl font-bold text-orange-600 flex items-center justify-center gap-1">
                            <Clock className="h-3.5 w-3.5 sm:h-4 sm:w-4 shrink-0" />
                            {formatDuration(practice.duration)}
                          </div>
                          <div className="text-[11px] sm:text-xs text-orange-600 font-medium">
                            Thời gian
                          </div>
                        </div>

                        <div className="text-center p-2.5 sm:p-3 bg-amber-50 rounded-lg">
                          <div className="text-xs sm:text-sm font-bold text-amber-700 flex items-center justify-center gap-1">
                            <Calendar className="h-3.5 w-3.5 sm:h-4 sm:w-4 shrink-0" />
                            {formatDate(practice.startedAt).split(" ")[0]}
                          </div>
                          <div className="text-[11px] sm:text-xs text-amber-700 font-medium">
                            Ngày thi
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-1.5 sm:gap-2 text-xs text-muted-foreground">
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
