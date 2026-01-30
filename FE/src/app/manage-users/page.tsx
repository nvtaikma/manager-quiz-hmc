"use client";

import React from "react";
import { useState, useEffect, useCallback, Suspense } from "react";
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
import { EditIcon, Search } from "lucide-react";
import { Pagination } from "@/components/ui/pagination";
import { useRouter, useSearchParams } from "next/navigation";
import { UserTable } from "./components/UserTable";
import { useDebounce } from "@/hooks/useDebounce";
import { API_BASE_URL } from "@/contants/api";

interface User {
  _id: string;
  name: string;
  email: string;
  avatar: string;
  status: string;
}

interface PaginationData {
  total: number;
  page: number;
  totalPages: number;
}

// Wrapper component để sử dụng useSearchParams
function ManageUsersContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const page = searchParams.get("page");
  const keyword = searchParams.get("keyword") || "";

  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [tableLoading, setTableLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState("all");
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [editName, setEditName] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [currentPage, setCurrentPage] = useState(parseInt(page || "1"));
  const [searchTerm, setSearchTerm] = useState(keyword);
  const [pagination, setPagination] = useState<PaginationData>({
    total: 0,
    page: 1,
    totalPages: 1,
  });

  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  useEffect(() => {
    const pageFromUrl = parseInt(page || "1");
    setCurrentPage(pageFromUrl);
  }, [page]);

  useEffect(() => {
    if (debouncedSearchTerm) {
      searchUsers();
    } else {
      fetchUsers();
    }
  }, [currentPage, debouncedSearchTerm]);

  useEffect(() => {
    filterUsers();
  }, [users, statusFilter]);

  const handlePageChange = (page: number) => {
    const params = new URLSearchParams(searchParams);
    params.set("page", page.toString());
    if (searchTerm) params.set("keyword", searchTerm);
    router.push(`?${params.toString()}`);
  };

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(1);
    const params = new URLSearchParams(searchParams);
    params.set("page", "1");
    if (value) params.set("keyword", value);
    else params.delete("keyword");
    router.push(`?${params.toString()}`);
  };

  const fetchUsers = async () => {
    try {
      setTableLoading(true);
      const response = await fetch(
        `${API_BASE_URL}/customers/list?page=${currentPage}`
      );
      if (!response.ok) {
        throw new Error("Không thể tải danh sách người dùng");
      }
      const result = await response.json();
      setUsers(result.data.customers);
      setPagination(result.data.pagination);
    } catch (error) {
      console.error("Lỗi khi tải danh sách người dùng:", error);
      setError("Không thể tải danh sách người dùng. Vui lòng thử lại sau.");
    } finally {
      setTableLoading(false);
      setLoading(false);
    }
  };

  const filterUsers = () => {
    if (statusFilter === "all") {
      setFilteredUsers(users);
    } else {
      setFilteredUsers(users.filter((user) => user.status === statusFilter));
    }
  };

  const updateUserStatus = async (userId: string, newStatus: string) => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/customers/${userId}/status?status=${newStatus}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      if (!response.ok) {
        throw new Error("Không thể cập nhật trạng thái người dùng");
      }
      setUsers((prevUsers) =>
        prevUsers.map((user) =>
          user._id === userId ? { ...user, status: newStatus } : user
        )
      );
    } catch (error) {
      console.error("Lỗi khi cập nhật trạng thái người dùng:", error);
      setError("Không thể cập nhật trạng thái người dùng. Vui lòng thử lại.");
    }
  };

  const updateUserInfo = async (
    userId: string,
    name: string,
    email: string
  ) => {
    try {
      const response = await fetch(`${API_BASE_URL}/customers/${userId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name, email }),
      });
      if (!response.ok) {
        throw new Error("Không thể cập nhật thông tin người dùng");
      }
      setUsers((prevUsers) =>
        prevUsers.map((user) =>
          user._id === userId ? { ...user, name, email } : user
        )
      );
      setEditingUser(null);
    } catch (error) {
      console.error("Lỗi khi cập nhật thông tin người dùng:", error);
      setError("Không thể cập nhật thông tin người dùng. Vui lòng thử lại.");
    }
  };

  const searchUsers = async () => {
    try {
      setTableLoading(true);
      const response = await fetch(
        `${API_BASE_URL}/customers/search?keyword=${debouncedSearchTerm}&page=${currentPage}`
      );
      if (!response.ok) {
        throw new Error("Không thể tìm kiếm người dùng");
      }
      const result = await response.json();
      setUsers(result.data.customers);
      setPagination(result.data.pagination);
    } catch (error) {
      console.error("Lỗi khi tìm kiếm người dùng:", error);
      setError("Không thể tìm kiếm người dùng. Vui lòng thử lại sau.");
    } finally {
      setTableLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (error) {
    return <div className="p-6 text-red-500">{error}</div>;
  }

  return (
    <div className="p-2 md:p-6 space-y-4">
      <h1 className="text-2xl md:text-3xl font-semibold">Quản lý người dùng</h1>
      <div className="flex flex-col md:flex-row gap-4 justify-between items-center">
        <div className="w-full md:w-1/3 relative">
          <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-500 h-4 w-4" />
          <Input
            placeholder="Tìm kiếm theo tên hoặc email..."
            value={searchTerm}
            onChange={(e) => handleSearch(e.target.value)}
            className="pl-8"
          />
        </div>
        <div className="flex gap-4 items-center w-full md:w-auto">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Lọc theo trạng thái" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả</SelectItem>
              <SelectItem value="active">Đang hoạt động</SelectItem>
              <SelectItem value="inactive">Không hoạt động</SelectItem>
              <SelectItem value="banned">Bị cấm</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {tableLoading ? (
        <div className="flex items-center justify-center p-10">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-gray-900"></div>
        </div>
      ) : (
        <UserTable
          users={filteredUsers}
          loading={tableLoading}
          updateUserStatus={updateUserStatus}
          updateUserInfo={async (userId, name, email) => {
            await updateUserInfo(userId, name, email);
          }}
        />
      )}

      {pagination.totalPages > 1 && (
        <Pagination
          currentPage={currentPage}
          totalPages={pagination.totalPages}
          onPageChange={handlePageChange}
        />
      )}
    </div>
  );
}

// Wrapper component với Suspense
export default function ManageUsers() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center h-screen">
          <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-gray-900"></div>
        </div>
      }
    >
      <ManageUsersContent />
    </Suspense>
  );
}
