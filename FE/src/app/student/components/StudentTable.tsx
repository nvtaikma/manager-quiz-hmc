import { Student } from "./types";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";

interface StudentTableProps {
  students: Student[];
  isLoading: boolean;
}

export function StudentTable({ students, isLoading }: StudentTableProps) {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (students.length === 0) {
    return (
      <div className="rounded-md border p-8 text-center text-muted-foreground">
        Không có dữ liệu sinh viên
      </div>
    );
  }

  const renderStatusBadge = (status: string) => (
    <span
      className={`shrink-0 inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
        status === "completed"
          ? "bg-green-100 text-green-800"
          : status === "vip"
          ? "bg-amber-100 text-amber-800 font-bold border border-amber-300"
          : status === "pending"
          ? "bg-yellow-100 text-yellow-800"
          : "bg-red-100 text-red-800"
      }`}
    >
      {status === "completed"
        ? "Hoàn thành"
        : status === "vip"
        ? "⭐ VIP"
        : status === "pending"
        ? "Đang chờ"
        : "Hết hạn"}
    </span>
  );

  return (
    <div>
      {/* Giao diện Mobile (< md): Danh sách thẻ sinh viên (Card List) */}
      <div className="grid grid-cols-1 gap-2.5 md:hidden">
        {students.map((student) => (
          <div
            key={student._id}
            className={`rounded-xl border p-3.5 shadow-sm space-y-1.5 ${
              student.status === "completed"
                ? "bg-green-50/60 border-green-200"
                : student.status === "vip"
                ? "bg-amber-50/60 border-amber-200"
                : student.status === "expired"
                ? "bg-red-50/60 border-red-200"
                : "bg-card"
            }`}
          >
            <div className="flex items-center justify-between gap-2">
              <p className="font-semibold text-sm text-foreground truncate flex-1 min-w-0">
                {student.email}
              </p>
              {renderStatusBadge(student.status)}
            </div>
            <p className="text-xs text-muted-foreground leading-snug break-words">
              {student.product?.name || "N/A"}
            </p>
          </div>
        ))}
      </div>

      {/* Giao diện Tablet & Desktop (>= md): Bảng sinh viên */}
      <div className="hidden md:block rounded-md border">
        <ScrollArea className="whitespace-nowrap">
          <Table className="w-full">
            <TableHeader>
              <TableRow>
                <TableHead>Email</TableHead>
                <TableHead>Tên khóa học</TableHead>
                <TableHead>Trạng thái</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {students.map((student) => (
                <TableRow
                  key={student._id}
                  className={`${
                    student.status === "completed"
                      ? "bg-green-50/60"
                      : student.status === "vip"
                      ? "bg-amber-50/60"
                      : student.status === "expired"
                      ? "bg-red-50/60"
                      : ""
                  }`}
                >
                  <TableCell className="font-medium">{student.email}</TableCell>
                  <TableCell>{student.product?.name || "N/A"}</TableCell>
                  <TableCell>{renderStatusBadge(student.status)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
      </div>
    </div>
  );
}

