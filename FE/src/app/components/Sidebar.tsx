"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import {
  Home,
  Users,
  ShoppingCart,
  PlusCircle,
  Package,
  BookOpen,
  Bell,
  Settings,
  LogOut,
  Menu,
  ChevronRight,
  GraduationCap,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarRail,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { usePathname, useRouter } from "next/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { API_URLS } from "@/contants/api";
import { ChangePasswordDialog } from "./ChangePasswordDialog";

const navItems = [
  {
    href: "/",
    icon: Home,
    label: "Dashboard",
    title: "Bảng điều khiển",
    description: "Tổng quan về hệ thống",
  },
  {
    href: "/manage-users",
    icon: Users,
    label: "Manage Users",
    title: "Quản lý người dùng",
    description: "Danh sách và thông tin người dùng",
  },
  {
    href: "/list-orders",
    icon: ShoppingCart,
    label: "List Orders",
    title: "Đơn hàng",
    description: "Quản lý đơn hàng của người dùng",
  },
  {
    href: "/create-order",
    icon: PlusCircle,
    label: "Create Order",
    title: "Tạo đơn hàng",
    description: "Thêm mới đơn hàng cho người dùng",
  },
  {
    href: "/list-product",
    icon: Package,
    label: "List Product",
    title: "Sản phẩm",
    description: "Quản lý danh sách sản phẩm",
  },
  {
    href: "/announcements",
    icon: Bell,
    label: "Announcements",
    title: "Thông báo",
    description: "Quản lý thông báo của hệ thống",
  },
  {
    href: "/student",
    icon: GraduationCap,
    label: "Students",
    title: "Sinh viên",
    description: "Danh sách sinh viên theo trạng thái",
  },
];

export default function Sidebars({ content }: { content: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { toast } = useToast();
  const [changePasswordOpen, setChangePasswordOpen] = React.useState(false);
  const [userInfo, setUserInfo] = React.useState({
    username: "Admin",
    email: "admin@example.com",
  });

  // Đọc thông tin user từ cookie khi component được mount
  React.useEffect(() => {
    const cookies = document.cookie.split(";");
    const userCookie = cookies.find((cookie) =>
      cookie.trim().startsWith("user=")
    );

    if (userCookie) {
      try {
        const userValue = userCookie.split("=")[1].trim();
        const user = JSON.parse(decodeURIComponent(userValue));
        setUserInfo({
          username: user.username || "Admin",
          email: user.email || "admin@example.com",
        });
      } catch (error) {
        console.error("Không thể parse cookie user:", error);
      }
    }
  }, []);

  const handleLogout = async () => {
    try {
      // Gọi API để đăng xuất
      const response = await fetch(API_URLS.AUTH_LOGOUT, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();

      if (data.success) {
        // Hiển thị thông báo thành công
        toast({
          title: "Đăng xuất thành công",
          description: "Hẹn gặp lại!",
        });

        // Chuyển hướng về trang đăng nhập
        router.push("/login");
      } else {
        throw new Error(data.message || "Đăng xuất thất bại");
      }
    } catch (error) {
      console.error("Lỗi đăng xuất:", error);

      // Fallback: xóa cookie trực tiếp nếu API thất bại
      document.cookie = "user=; path=/; max-age=0";

      toast({
        title: "Đăng xuất thành công",
        description: "Hẹn gặp lại!",
      });

      router.push("/login");
    }
  };

  return (
    <SidebarProvider>
      <Sidebar className="border-r border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <SidebarHeader className="px-4 py-6">
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton size="lg" asChild>
                <Link
                  href="/"
                  className="flex items-center hover:opacity-90 transition-opacity"
                >
                  <div className="flex size-10 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-md mr-2">
                    <Package className="size-5" />
                  </div>
                  <div className="flex flex-col gap-0.5 leading-none">
                    <span className="text-xl font-bold tracking-tight">
                      Admin Panel
                    </span>
                    <span className="text-xs text-muted-foreground">
                      Hệ thống quản lý
                    </span>
                  </div>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarHeader>

        <SidebarContent className="pt-3">
          <div className="px-4 pb-4">
            <div className="relative w-full">
              <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                <Menu className="h-4 w-4 text-muted-foreground" />
              </div>
              <Button
                variant="outline"
                className="w-full justify-start pl-10 text-muted-foreground font-normal h-9"
              >
                Menu
              </Button>
            </div>
          </div>

          <SidebarGroup>
            <div className="px-3 py-2">
              <h3 className="mb-1 px-2 text-xs font-medium text-muted-foreground">
                MENU CHÍNH
              </h3>
              <SidebarMenu>
                {navItems.map((item) => {
                  const isActive =
                    pathname === item.href ||
                    pathname.startsWith(item.href + "/");
                  return (
                    <SidebarMenuItem key={item.href}>
                      <SidebarMenuButton asChild className="group">
                        <Link
                          href={item.href}
                          className={cn(
                            "relative flex items-center mx-1 p-2 gap-4 rounded-lg text-sm transition-all duration-150 group-hover:bg-accent",
                            isActive
                              ? "text-foreground font-medium bg-accent"
                              : "text-muted-foreground font-normal"
                          )}
                        >
                          <div
                            className={cn(
                              "flex size-7 items-center justify-center rounded-md transition-colors",
                              isActive
                                ? "bg-primary text-primary-foreground"
                                : "bg-muted text-muted-foreground group-hover:text-foreground group-hover:bg-muted/80"
                            )}
                          >
                            <item.icon className="size-4" />
                          </div>
                          <div className="flex flex-col gap-px">
                            <span>{item.title}</span>
                          </div>
                          {isActive && (
                            <div className="absolute right-2 top-1/2 -translate-y-1/2">
                              <ChevronRight className="h-4 w-4 text-muted-foreground" />
                            </div>
                          )}
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </div>
          </SidebarGroup>

          <div className="mt-auto px-3 py-4">
            <SidebarMenuItem>
              <SidebarMenuButton asChild>
                <div className="flex items-center gap-3 px-2 py-3 rounded-lg hover:bg-accent cursor-pointer">
                  <Avatar className="h-9 w-9 border border-border">
                    <AvatarFallback>
                      {userInfo.username.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col truncate">
                    <span className="text-sm font-medium">
                      {userInfo.username}
                    </span>
                    <span className="text-xs text-muted-foreground truncate">
                      {userInfo.email}
                    </span>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="ml-auto h-8 w-8"
                      >
                        <Settings className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        onClick={() => setChangePasswordOpen(true)}
                      >
                        <Settings className="mr-2 h-4 w-4" /> Đổi mật khẩu
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        className="text-destructive"
                        onClick={handleLogout}
                      >
                        <LogOut className="mr-2 h-4 w-4" /> Đăng xuất
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </div>
        </SidebarContent>
        <SidebarRail />
      </Sidebar>
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="flex flex-1 items-center gap-2 px-4">
            <SidebarTrigger className="h-8 w-8 rounded-md border hover:bg-accent flex items-center justify-center text-muted-foreground" />
            <Separator orientation="vertical" className="mx-2 h-6" />
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbLink asChild>
                    <Link
                      href="/"
                      className="text-muted-foreground hover:text-foreground"
                    >
                      Admin Panel
                    </Link>
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbPage>
                    {navItems.find(
                      (item) =>
                        item.href === pathname ||
                        pathname.startsWith(item.href + "/")
                    )?.title || "Trang không xác định"}
                  </BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </header>
        <main className="flex-1 p-4 md:p-6">{content}</main>
      </SidebarInset>

      {/* Dialog đổi mật khẩu */}
      <ChangePasswordDialog
        open={changePasswordOpen}
        onOpenChange={setChangePasswordOpen}
      />
    </SidebarProvider>
  );
}
