"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Package } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { API_URLS } from "@/contants/api";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      console.log("🔐 Attempting login...");
      console.log("📍 Current URL:", window.location.href);
      console.log("🎯 API URL:", API_URLS.AUTH_LOGIN);

      // Gọi API để kiểm tra đăng nhập
      const response = await fetch(API_URLS.AUTH_LOGIN, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username,
          password,
        }),
      });

      console.log("📡 Response status:", response.status);
      const data = await response.json();
      console.log("📄 Response data:", data);

      if (data.success) {
        console.log("✅ Login successful, redirecting...");

        // Kiểm tra cookie được set chưa
        const cookies = document.cookie;
        console.log("🍪 Current cookies:", cookies);

        // Hiển thị thông báo thành công
        toast({
          title: "Đăng nhập thành công",
          description: "Chào mừng bạn quay trở lại!",
        });

        // Chuyển hướng về trang chủ với window.location để force reload
        console.log("🔄 Redirecting to dashboard...");

        // Sử dụng router.replace để tránh back button issues
        router.replace("/");

        // Fallback: nếu router không hoạt động, dùng window.location
        setTimeout(() => {
          if (window.location.pathname === "/login") {
            console.log("🔄 Router redirect failed, using window.location...");
            window.location.href = "/";
          }
        }, 1000);
      } else {
        console.error("❌ Login failed:", data.message);
        setError(data.message || "Đăng nhập thất bại!");
      }
    } catch (error) {
      console.error("❌ Login error:", error);
      setError("Đã xảy ra lỗi trong quá trình đăng nhập. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-gray-100 sm:items-center sm:justify-center">
      <div className="bg-white p-6 sm:p-8 rounded-lg shadow-md w-full max-w-md mx-auto sm:mt-0 mt-10">
        <div className="flex flex-col items-center space-y-2 mb-6">
          <div className="flex size-12 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-md">
            <Package className="size-6" />
          </div>
          <div className="text-center">
            <h1 className="text-2xl font-bold">Đăng nhập</h1>
            <p className="text-sm text-muted-foreground">
              Đăng nhập để truy cập vào hệ thống quản trị
            </p>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-md text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="username">Tài khoản</Label>
            <Input
              id="username"
              placeholder="Nhập tài khoản của bạn"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="password">Mật khẩu</Label>
              <Button
                variant="link"
                className="p-0 h-auto text-xs"
                type="button"
              >
                Quên mật khẩu?
              </Button>
            </div>
            <Input
              id="password"
              type="password"
              placeholder="Nhập mật khẩu của bạn"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <Button className="w-full" type="submit" disabled={loading}>
            {loading ? "Đang đăng nhập..." : "Đăng nhập"}
          </Button>
        </form>
      </div>
    </div>
  );
}
