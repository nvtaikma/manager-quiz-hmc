"use client";

import { useState, useEffect, Suspense, ReactNode } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Pagination } from "@/components/ui/pagination";
import { Student, StudentsResponse } from "./components/types";
import { StudentTable } from "./components/StudentTable";
import { API_BASE_URL } from "@/contants/api";
import { useSearchParams, useRouter } from "next/navigation";

// Loading component
const LoadingSpinner = () => (
  <div className="flex items-center justify-center h-screen">
    <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-gray-900"></div>
  </div>
);

export default function StudentPage() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <StudentContent />
    </Suspense>
  );
}

type StudentStatus = "completed" | "pending" | "expired";

function StudentContent(): ReactNode {
  const router = useRouter();
  const searchParams = useSearchParams();
  const statusFromUrl = (searchParams.get("status") ||
    "completed") as StudentStatus;
  const pageFromUrl = parseInt(searchParams.get("page") || "1");

  const [activeTab, setActiveTab] = useState<StudentStatus>(statusFromUrl);
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(pageFromUrl);
  const [totalPages, setTotalPages] = useState(1);

  const tabConfig: Record<
    StudentStatus,
    { label: string; value: StudentStatus }
  > = {
    completed: { label: "Hoàn thành", value: "completed" },
    pending: { label: "Đang chờ", value: "pending" },
    expired: { label: "Hết hạn", value: "expired" },
  };

  useEffect(() => {
    const statusFromUrl = (searchParams.get("status") ||
      "completed") as StudentStatus;
    const pageFromUrl = parseInt(searchParams.get("page") || "1");
    setActiveTab(statusFromUrl);
    setCurrentPage(pageFromUrl);
  }, [searchParams]);

  useEffect(() => {
    fetchStudents(activeTab, currentPage);
  }, [activeTab, currentPage]);

  const fetchStudents = async (status: StudentStatus, page: number) => {
    try {
      setLoading(true);
      setError(null);

      const url = new URL(`${API_BASE_URL}/students/status/${status}`);
      url.searchParams.append("page", page.toString());

      const response = await fetch(url.toString());

      if (!response.ok) {
        throw new Error("Không thể tải danh sách sinh viên");
      }

      const data: StudentsResponse = await response.json();
      setStudents(data.data.students || []);
      setTotalPages(data.data.pagination.totalPages);
    } catch (err) {
      console.error("Lỗi khi tải danh sách sinh viên:", err);
      setError("Không thể tải danh sách sinh viên. Vui lòng thử lại sau.");
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (status: StudentStatus) => {
    setActiveTab(status);
    setCurrentPage(1);

    const params = new URLSearchParams();
    params.set("status", status);
    params.set("page", "1");
    router.push(`/student?${params.toString()}`);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);

    const params = new URLSearchParams();
    params.set("status", activeTab);
    params.set("page", page.toString());
    router.push(`/student?${params.toString()}`);
  };

  if (error && !loading) {
    return (
      <div className="p-0 md:p-6">
        <div className="p-6 text-red-500 bg-red-50 rounded-md border border-red-200">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="p-0 md:p-6 space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Danh sách sinh viên</h2>
        <p className="text-sm text-muted-foreground mt-2">
          Quản lý và xem thông tin sinh viên theo trạng thái
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={(v) => handleTabChange(v as StudentStatus)}>
        <TabsList className="grid w-full max-w-md grid-cols-3">
          {(Object.entries(tabConfig) as [StudentStatus, { label: string; value: StudentStatus }][]).map(
            ([key, config]) => (
              <TabsTrigger key={key} value={config.value}>
                {config.label}
              </TabsTrigger>
            )
          )}
        </TabsList>

        {(Object.entries(tabConfig) as [StudentStatus, { label: string; value: StudentStatus }][]).map(
          ([key, config]) => (
            <TabsContent key={key} value={config.value} className="space-y-4">
              <StudentTable students={students} isLoading={loading} />

              {!loading && students.length > 0 && (
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={handlePageChange}
                />
              )}
            </TabsContent>
          )
        )}
      </Tabs>
    </div>
  );
}

