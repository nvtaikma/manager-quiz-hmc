import { NextResponse } from "next/server";

export async function POST() {
  try {
    // Tạo response
    const response = NextResponse.json({
      success: true,
      message: "Đăng xuất thành công",
    });

    // Xóa cookie bằng cách set max-age = 0
    response.cookies.set({
      name: "user",
      value: "",
      path: "/",
      maxAge: 0,
      httpOnly: false,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
    });

    return response;
  } catch (error) {
    console.error("Lỗi đăng xuất:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Đã xảy ra lỗi trong quá trình đăng xuất",
      },
      { status: 500 }
    );
  }
}
