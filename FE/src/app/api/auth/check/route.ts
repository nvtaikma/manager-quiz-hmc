import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const userCookie = request.cookies.get("user");

    if (!userCookie || !userCookie.value) {
      return NextResponse.json(
        {
          success: false,
          authenticated: false,
          message: "Không tìm thấy thông tin đăng nhập",
        },
        { status: 401 }
      );
    }

    try {
      const userData = JSON.parse(userCookie.value);

      // Kiểm tra xem cookie có hợp lệ không
      if (userData.username && userData.email) {
        return NextResponse.json({
          success: true,
          authenticated: true,
          user: userData,
        });
      } else {
        return NextResponse.json(
          {
            success: false,
            authenticated: false,
            message: "Thông tin đăng nhập không hợp lệ",
          },
          { status: 401 }
        );
      }
    } catch (parseError) {
      return NextResponse.json(
        {
          success: false,
          authenticated: false,
          message: "Cookie không hợp lệ",
        },
        { status: 401 }
      );
    }
  } catch (error) {
    console.error("Lỗi kiểm tra authentication:", error);
    return NextResponse.json(
      {
        success: false,
        authenticated: false,
        message: "Đã xảy ra lỗi trong quá trình kiểm tra đăng nhập",
      },
      { status: 500 }
    );
  }
}
