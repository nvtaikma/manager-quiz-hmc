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

  return (
    <div className="rounded-md border">
      <ScrollArea className="whitespace-nowrap">
        <Table className="w-full">
          <TableHeader>
            <TableRow>
              <TableHead className="w-[200px] md:w-auto">Email</TableHead>
              <TableHead className="hidden md:table-cell">
                Tên khóa học
              </TableHead>
              <TableHead className="hidden md:table-cell">Trạng thái</TableHead>
              <TableHead className="md:hidden">Thông tin</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {students.map((student) => (
              <TableRow
                key={student._id}
                className={`${
                  student.status === "completed"
                    ? "bg-green-100"
                    : student.status === "expired"
                    ? "bg-red-100"
                    : ""
                }`}
              >
                <TableCell className="font-medium">{student.email}</TableCell>
                <TableCell className="hidden md:table-cell">
                  {student.product?.name || "N/A"}
                </TableCell>
                <TableCell className="hidden md:table-cell">
                  <span
                    className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                      student.status === "completed"
                        ? "bg-green-100 text-green-800"
                        : student.status === "pending"
                        ? "bg-yellow-100 text-yellow-800"
                        : "bg-red-100 text-red-800"
                    }`}
                  >
                    {student.status === "completed"
                      ? "Hoàn thành"
                      : student.status === "pending"
                      ? "Đang chờ"
                      : "Hết hạn"}
                  </span>
                </TableCell>
                <TableCell className="md:hidden text-sm">
                  <div>{student.product?.name || "N/A"}</div>
                  <div className="text-xs text-muted-foreground mt-1">
                    {student.status === "completed"
                      ? "Hoàn thành"
                      : student.status === "pending"
                      ? "Đang chờ"
                      : "Hết hạn"}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>
    </div>
  );
}

