"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { API_URLS } from "@/contants/api";
import { Eye, EyeOff, Bug } from "lucide-react";

const changePasswordSchema = z
  .object({
    currentPassword: z
      .string()
      .min(1, { message: "Vui lòng nhập mật khẩu hiện tại" }),
    newPassword: z
      .string()
      .min(6, { message: "Mật khẩu mới phải có ít nhất 6 ký tự" }),
    confirmPassword: z
      .string()
      .min(1, { message: "Vui lòng xác nhận mật khẩu mới" }),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Mật khẩu xác nhận không khớp",
    path: ["confirmPassword"],
  });

type ChangePasswordFormData = z.infer<typeof changePasswordSchema>;

interface ChangePasswordDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ChangePasswordDialog({
  open,
  onOpenChange,
}: ChangePasswordDialogProps) {
  const [loading, setLoading] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [debugMode, setDebugMode] = useState(false);
  const [apiErrors, setApiErrors] = useState<Record<string, string>>({});
  const { toast } = useToast();

  const form = useForm<ChangePasswordFormData>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  // Clear API errors when user starts typing
  useEffect(() => {
    const subscription = form.watch((value, { name }) => {
      if (name && apiErrors[name]) {
        setApiErrors((prev) => {
          const newErrors = { ...prev };
          delete newErrors[name];
          return newErrors;
        });
      }
    });
    return () => subscription.unsubscribe();
  }, [form, apiErrors]);

  const onSubmit = async (values: ChangePasswordFormData) => {
    try {
      setLoading(true);
      // Clear previous API errors
      setApiErrors({});
      console.log("🔄 Submitting password change request...");

      const response = await fetch(API_URLS.AUTH_CHANGE_PASSWORD, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          currentPassword: values.currentPassword,
          newPassword: values.newPassword,
        }),
      });

      console.log("📡 Response status:", response.status);

      const data = await response.json();
      console.log("📄 Response data:", data);

      if (data.success) {
        console.log("✅ Password change successful");
        toast({
          title: "Thành công",
          description: data.message || "Đổi mật khẩu thành công",
        });

        // Reset form và đóng dialog
        form.reset();
        setApiErrors({});
        onOpenChange(false);
      } else {
        console.error("❌ Password change failed:", data);

        // Xử lý lỗi dựa trên errorCode
        if (data.errorCode) {
          switch (data.errorCode) {
            case "WRONG_CURRENT_PASSWORD":
              // Hiển thị lỗi trực tiếp trên field mật khẩu hiện tại
              setApiErrors({
                currentPassword: "Mật khẩu hiện tại không đúng",
              });
              form.setFocus("currentPassword");
              form.setValue("currentPassword", "");
              return; // Không hiển thị toast cho trường hợp này

            case "SAME_PASSWORD":
              // Hiển thị lỗi trên field mật khẩu mới
              setApiErrors({
                newPassword: "Mật khẩu mới phải khác mật khẩu hiện tại",
              });
              form.setFocus("newPassword");
              return;

            case "PASSWORD_TOO_SHORT":
              // Hiển thị lỗi trên field mật khẩu mới
              setApiErrors({
                newPassword: "Mật khẩu mới phải có ít nhất 6 ký tự",
              });
              form.setFocus("newPassword");
              return;

            case "NO_AUTH_COOKIE":
            case "INVALID_COOKIE":
              toast({
                title: "Phiên đăng nhập hết hạn",
                description: "Vui lòng đăng nhập lại",
                variant: "destructive",
              });
              break;

            case "MISSING_FIELDS":
              toast({
                title: "Thông tin không đầy đủ",
                description: "Vui lòng nhập đầy đủ thông tin",
                variant: "destructive",
              });
              break;

            case "ACCOUNT_NOT_FOUND":
              toast({
                title: "Lỗi tài khoản",
                description: "Không tìm thấy tài khoản",
                variant: "destructive",
              });
              break;

            case "FILE_READ_ERROR":
            case "UPDATE_FAILED":
              toast({
                title: "Lỗi hệ thống",
                description: "Lỗi hệ thống. Vui lòng thử lại sau",
                variant: "destructive",
              });
              break;

            default:
              toast({
                title: "Lỗi đổi mật khẩu",
                description: data.message || "Đổi mật khẩu thất bại",
                variant: "destructive",
              });
          }
        } else {
          toast({
            title: "Lỗi đổi mật khẩu",
            description: data.message || "Đổi mật khẩu thất bại",
            variant: "destructive",
          });
        }
      }
    } catch (error) {
      console.error("❌ Network/Parse error:", error);

      let errorMessage = "Đã xảy ra lỗi kết nối";

      if (error instanceof TypeError && error.message.includes("fetch")) {
        errorMessage =
          "Không thể kết nối đến server. Vui lòng kiểm tra kết nối mạng";
      } else if (error instanceof SyntaxError) {
        errorMessage = "Lỗi xử lý dữ liệu từ server";
      }

      toast({
        title: "Lỗi kết nối",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    form.reset();
    setApiErrors({});
    onOpenChange(false);
  };

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      // Clear errors when closing dialog
      setApiErrors({});
      form.reset();
    }
    onOpenChange(open);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>Đổi mật khẩu</span>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setDebugMode(!debugMode)}
              className="h-8 w-8 p-0"
            >
              <Bug className="h-4 w-4" />
            </Button>
          </DialogTitle>
          <DialogDescription>
            Nhập mật khẩu hiện tại và mật khẩu mới để thay đổi mật khẩu của bạn.
          </DialogDescription>
        </DialogHeader>

        {debugMode && (
          <div className="rounded-md border border-yellow-200 bg-yellow-50 p-3 text-xs">
            <div className="font-semibold text-yellow-800">Debug Info:</div>
            <div className="mt-1 space-y-1 text-yellow-700">
              <div>API URL: {API_URLS.AUTH_CHANGE_PASSWORD}</div>
              <div>Loading: {loading ? "Yes" : "No"}</div>
              <div>Form Valid: {form.formState.isValid ? "Yes" : "No"}</div>
              <div>
                Errors:{" "}
                {Object.keys(form.formState.errors).join(", ") || "None"}
              </div>
              <div>
                User Cookie:{" "}
                {document.cookie.includes("user") ? "Present" : "Missing"}
              </div>
            </div>
          </div>
        )}

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {/* Mật khẩu hiện tại */}
            <FormField
              control={form.control}
              name="currentPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Mật khẩu hiện tại</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input
                        type={showCurrentPassword ? "text" : "password"}
                        placeholder="Nhập mật khẩu hiện tại"
                        className={
                          apiErrors.currentPassword ? "border-red-500" : ""
                        }
                        {...field}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                        onClick={() =>
                          setShowCurrentPassword(!showCurrentPassword)
                        }
                      >
                        {showCurrentPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </FormControl>
                  <FormMessage />
                  {apiErrors.currentPassword && (
                    <p className="text-sm text-red-600 mt-1">
                      {apiErrors.currentPassword}
                    </p>
                  )}
                </FormItem>
              )}
            />

            {/* Mật khẩu mới */}
            <FormField
              control={form.control}
              name="newPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Mật khẩu mới</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input
                        type={showNewPassword ? "text" : "password"}
                        placeholder="Nhập mật khẩu mới (ít nhất 6 ký tự)"
                        className={
                          apiErrors.newPassword ? "border-red-500" : ""
                        }
                        {...field}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                      >
                        {showNewPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </FormControl>
                  <FormMessage />
                  {apiErrors.newPassword && (
                    <p className="text-sm text-red-600 mt-1">
                      {apiErrors.newPassword}
                    </p>
                  )}
                </FormItem>
              )}
            />

            {/* Xác nhận mật khẩu mới */}
            <FormField
              control={form.control}
              name="confirmPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Xác nhận mật khẩu mới</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input
                        type={showConfirmPassword ? "text" : "password"}
                        placeholder="Nhập lại mật khẩu mới"
                        {...field}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                        onClick={() =>
                          setShowConfirmPassword(!showConfirmPassword)
                        }
                      >
                        {showConfirmPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter className="gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={handleCancel}
                disabled={loading}
              >
                Hủy
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? "Đang xử lý..." : "Đổi mật khẩu"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
