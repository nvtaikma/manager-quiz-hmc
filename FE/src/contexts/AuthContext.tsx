"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { API_URLS, getApiUrl } from "../contants/api";

type User = {
  id?: string;
  email: string;
  role?: string;
};

type AuthContextType = {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setUser(null);
        setIsLoading(false);
        return;
      }

      const response = await fetch(getApiUrl(API_URLS.AUTH_CHECK), {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      const data = await response.json();

      if (response.ok && data.user) {
        setUser(data.user);
        document.cookie = "user=true; path=/; max-age=86400";
      } else {
        localStorage.removeItem("token");
        document.cookie = "user=; path=/; max-age=0";
        setUser(null);
      }
    } catch (error) {
      console.error("Lỗi kiểm tra auth status:", error);
      localStorage.removeItem("token");
      document.cookie = "user=; path=/; max-age=0";
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  // Hàm đăng nhập
  const login = async (
    email: string,
    password: string
  ): Promise<boolean> => {
    setIsLoading(true);

    try {
      // Gọi API Backend Express để đăng nhập
      const response = await fetch(getApiUrl(API_URLS.AUTH_LOGIN), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok && data.token && data.user) {
        localStorage.setItem("token", data.token);
        document.cookie = "user=true; path=/; max-age=86400";
        document.cookie = `token=${data.token}; path=/; max-age=86400`;
        setUser(data.user);
        setIsLoading(false);
        return true;
      } else {
        setIsLoading(false);
        throw new Error(data.message || "Đăng nhập thất bại");
      }
    } catch (error) {
      console.error("Lỗi đăng nhập:", error);
      setIsLoading(false);
      throw error;
    }
  };

  // Hàm đăng xuất
  const logout = () => {
    localStorage.removeItem("token");
    document.cookie = "user=; path=/; max-age=0";
    setUser(null);
    router.push("/login");
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

// Custom hook để sử dụng AuthContext
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
