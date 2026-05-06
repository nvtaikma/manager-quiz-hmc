"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useToast } from "@/components/ui/use-toast";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { Package } from "lucide-react";

const loginSchema = z.object({
  email: z
    .string()
    .email({ message: "Email không hợp lệ" })
    .refine((val) => val.endsWith("@gmail.com") || val.endsWith("@icloud.com"), {
      message: "Email phải có đuôi @gmail.com hoặc @icloud.com",
    }),
  password: z.string().min(6, { message: "Mật khẩu phải có ít nhất 6 ký tự" }),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { login } = useAuth();
  const { toast } = useToast();

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data: LoginFormValues) => {
    try {
      setIsLoading(true);
      await login(data.email, data.password);
      toast({
        title: "Đăng nhập thành công",
        description: "Chào mừng bạn quay lại hệ thống.",
      });
      router.push("/");
    } catch (error) {
      toast({
        title: "Đăng nhập thất bại",
        description: error instanceof Error ? error.message : "Đã có lỗi xảy ra",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
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

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input placeholder="admin@hmc.com" {...field} disabled={isLoading} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <div className="flex items-center justify-between">
                    <FormLabel>Mật khẩu</FormLabel>
                    <Button variant="link" className="p-0 h-auto text-xs" type="button">
                      Quên mật khẩu?
                    </Button>
                  </div>
                  <FormControl>
                    <Input type="password" placeholder="Nhập mật khẩu của bạn" {...field} disabled={isLoading} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Đang xử lý..." : "Đăng nhập"}
            </Button>
          </form>
        </Form>
      </div>
    </div>
  );
}
