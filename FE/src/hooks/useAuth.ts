import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { API_URLS } from "@/contants/api";

interface User {
  username: string;
  email: string;
  role?: string;
}

interface UseAuthReturn {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (
    username: string,
    password: string
  ) => Promise<{ success: boolean; message?: string }>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
}

export function useAuth(): UseAuthReturn {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const router = useRouter();

  // Kiểm tra trạng thái đăng nhập
  const checkAuth = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await fetch(API_URLS.AUTH_CHECK);
      const data = await response.json();

      if (data.success && data.authenticated) {
        setUser(data.user);
        setIsAuthenticated(true);
      } else {
        setUser(null);
        setIsAuthenticated(false);
      }
    } catch (error) {
      console.error("Lỗi kiểm tra auth:", error);
      setUser(null);
      setIsAuthenticated(false);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Đăng nhập
  const login = useCallback(async (username: string, password: string) => {
    try {
      const response = await fetch(API_URLS.AUTH_LOGIN, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (data.success) {
        setUser(data.user);
        setIsAuthenticated(true);
        return { success: true };
      } else {
        return { success: false, message: data.message };
      }
    } catch (error) {
      console.error("Lỗi đăng nhập:", error);
      return {
        success: false,
        message: "Đã xảy ra lỗi trong quá trình đăng nhập",
      };
    }
  }, []);

  // Đăng xuất
  const logout = useCallback(async () => {
    try {
      await fetch(API_URLS.AUTH_LOGOUT, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });
    } catch (error) {
      console.error("Lỗi đăng xuất:", error);
    } finally {
      setUser(null);
      setIsAuthenticated(false);
      router.push("/login");
    }
  }, [router]);

  // Kiểm tra auth khi component mount
  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  return {
    user,
    isLoading,
    isAuthenticated,
    login,
    logout,
    checkAuth,
  };
}
