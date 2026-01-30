import { NextRequest, NextResponse } from "next/server";
import { getAccounts, addAccount, updateAccountStatus } from "@/lib/auth";

// GET - Lấy danh sách accounts (không có password)
export async function GET() {
  try {
    const accounts = getAccounts();

    // Loại bỏ password khỏi response
    const publicAccounts = accounts.map(({ password, ...account }) => account);

    return NextResponse.json({
      success: true,
      data: publicAccounts,
    });
  } catch (error) {
    console.error("Lỗi lấy danh sách accounts:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Không thể lấy danh sách tài khoản",
      },
      { status: 500 }
    );
  }
}

// POST - Thêm account mới
export async function POST(request: NextRequest) {
  try {
    const {
      username,
      password,
      email,
      role = "user",
      active = true,
    } = await request.json();

    if (!username || !password || !email) {
      return NextResponse.json(
        {
          success: false,
          message: "Vui lòng điền đầy đủ thông tin tài khoản",
        },
        { status: 400 }
      );
    }

    const success = addAccount({
      username,
      password,
      email,
      role,
      active,
    });

    if (success) {
      return NextResponse.json({
        success: true,
        message: "Tạo tài khoản thành công",
      });
    } else {
      return NextResponse.json(
        {
          success: false,
          message: "Tên tài khoản đã tồn tại",
        },
        { status: 409 }
      );
    }
  } catch (error) {
    console.error("Lỗi tạo account:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Không thể tạo tài khoản",
      },
      { status: 500 }
    );
  }
}

// PATCH - Cập nhật trạng thái account
export async function PATCH(request: NextRequest) {
  try {
    const { accountId, active } = await request.json();

    if (!accountId || typeof active !== "boolean") {
      return NextResponse.json(
        {
          success: false,
          message: "Thông tin cập nhật không hợp lệ",
        },
        { status: 400 }
      );
    }

    const success = updateAccountStatus(accountId, active);

    if (success) {
      return NextResponse.json({
        success: true,
        message: "Cập nhật trạng thái tài khoản thành công",
      });
    } else {
      return NextResponse.json(
        {
          success: false,
          message: "Không tìm thấy tài khoản",
        },
        { status: 404 }
      );
    }
  } catch (error) {
    console.error("Lỗi cập nhật account:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Không thể cập nhật tài khoản",
      },
      { status: 500 }
    );
  }
}
