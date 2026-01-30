import { NextRequest, NextResponse } from "next/server";
import { authenticateUser } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    const { username, password } = await request.json();

    // Kiểm tra thông tin đăng nhập
    if (!username || !password) {
      return NextResponse.json(
        {
          success: false,
          message: "Vui lòng nhập đầy đủ tài khoản và mật khẩu",
        },
        { status: 400 }
      );
    }

    // Xác thực tài khoản từ file JSON
    const authResult = authenticateUser(username, password);

    if (authResult.success && authResult.account) {
      const userData = {
        id: authResult.account.id,
        username: authResult.account.username,
        email: authResult.account.email,
        role: authResult.account.role,
      };

      // Tạo response với thông tin user
      const response = NextResponse.json({
        success: true,
        message: "Đăng nhập thành công",
        user: userData,
      });

      // Set cookie với thời gian 7 ngày
      const isProduction = process.env.NODE_ENV === "production";
      const cookieOptions = {
        name: "user",
        value: JSON.stringify(userData),
        path: "/",
        maxAge: 60 * 60 * 24 * 7, // 7 ngày
        httpOnly: false, // Cho phép client-side access
        secure: false, // Set to false for HTTP domains like manager.testhmc.site
        sameSite: "lax" as const,
      };

      // For production domain manager.testhmc.site (HTTP), ensure cookie works
      if (isProduction) {
        const origin =
          request.headers.get("origin") || request.headers.get("host");
        console.log("🍪 Setting cookie for production domain:", origin);

        // For HTTP domains, secure should be false
        if (origin?.includes("manager.testhmc.site")) {
          cookieOptions.secure = false;
        }
      }

      response.cookies.set(cookieOptions);

      console.log("🍪 Cookie set with options:", cookieOptions);

      return response;
    } else {
      return NextResponse.json(
        {
          success: false,
          message: authResult.message || "Đăng nhập thất bại!",
        },
        { status: 401 }
      );
    }
  } catch (error) {
    console.error("Lỗi đăng nhập:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Đã xảy ra lỗi trong quá trình đăng nhập",
      },
      { status: 500 }
    );
  }
}
