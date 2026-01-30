import { NextRequest, NextResponse } from "next/server";
import { getAccounts, updateAccountPassword } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    // Kiểm tra cookie để xác thực user
    const userCookie = request.cookies.get("user");

    if (!userCookie || !userCookie.value) {
      console.error("❌ Change password failed: No user cookie found");
      return NextResponse.json(
        {
          success: false,
          message: "Bạn cần đăng nhập để thực hiện thao tác này",
          errorCode: "NO_AUTH_COOKIE",
        },
        { status: 401 }
      );
    }

    let currentUser;
    try {
      currentUser = JSON.parse(userCookie.value);
      console.log("✅ User authenticated:", currentUser.username);
    } catch (parseError) {
      console.error(
        "❌ Change password failed: Invalid cookie format",
        parseError
      );
      return NextResponse.json(
        {
          success: false,
          message: "Thông tin đăng nhập không hợp lệ",
          errorCode: "INVALID_COOKIE",
        },
        { status: 401 }
      );
    }

    // Parse request body với error handling
    let requestData;
    try {
      requestData = await request.json();
    } catch (jsonError) {
      console.error("❌ Change password failed: Invalid JSON body", jsonError);
      return NextResponse.json(
        {
          success: false,
          message: "Dữ liệu gửi lên không hợp lệ",
          errorCode: "INVALID_JSON",
        },
        { status: 400 }
      );
    }

    const { currentPassword, newPassword } = requestData;

    // Validate input
    if (!currentPassword || !newPassword) {
      console.error("❌ Change password failed: Missing required fields");
      return NextResponse.json(
        {
          success: false,
          message: "Vui lòng nhập đầy đủ mật khẩu hiện tại và mật khẩu mới",
          errorCode: "MISSING_FIELDS",
        },
        { status: 400 }
      );
    }

    if (
      typeof currentPassword !== "string" ||
      typeof newPassword !== "string"
    ) {
      console.error("❌ Change password failed: Invalid field types");
      return NextResponse.json(
        {
          success: false,
          message: "Mật khẩu phải là chuỗi ký tự",
          errorCode: "INVALID_FIELD_TYPE",
        },
        { status: 400 }
      );
    }

    if (newPassword.length < 6) {
      console.error("❌ Change password failed: Password too short");
      return NextResponse.json(
        {
          success: false,
          message: "Mật khẩu mới phải có ít nhất 6 ký tự",
          errorCode: "PASSWORD_TOO_SHORT",
        },
        { status: 400 }
      );
    }

    if (newPassword === currentPassword) {
      console.error("❌ Change password failed: Same password");
      return NextResponse.json(
        {
          success: false,
          message: "Mật khẩu mới phải khác mật khẩu hiện tại",
          errorCode: "SAME_PASSWORD",
        },
        { status: 400 }
      );
    }

    // Lấy danh sách accounts và tìm user hiện tại
    let accounts;
    try {
      accounts = getAccounts();
    } catch (fileError) {
      console.error(
        "❌ Change password failed: Cannot read accounts file",
        fileError
      );
      return NextResponse.json(
        {
          success: false,
          message: "Lỗi hệ thống: không thể đọc dữ liệu tài khoản",
          errorCode: "FILE_READ_ERROR",
        },
        { status: 500 }
      );
    }

    const account = accounts.find(
      (acc) => acc.username === currentUser.username
    );

    if (!account) {
      console.error(
        "❌ Change password failed: Account not found for user:",
        currentUser.username
      );
      return NextResponse.json(
        {
          success: false,
          message: "Không tìm thấy tài khoản",
          errorCode: "ACCOUNT_NOT_FOUND",
        },
        { status: 404 }
      );
    }

    // Kiểm tra mật khẩu hiện tại
    if (account.password !== currentPassword) {
      console.error(
        "❌ Change password failed: Wrong current password for user:",
        currentUser.username
      );
      return NextResponse.json(
        {
          success: false,
          message: "Mật khẩu hiện tại không đúng",
          errorCode: "WRONG_CURRENT_PASSWORD",
        },
        { status: 400 }
      );
    }

    // Cập nhật mật khẩu mới
    console.log(
      "🔄 Attempting to update password for user:",
      currentUser.username
    );
    const success = updateAccountPassword(account.id, newPassword);

    if (success) {
      console.log(
        "✅ Password updated successfully for user:",
        currentUser.username
      );
      return NextResponse.json({
        success: true,
        message: "Đổi mật khẩu thành công",
      });
    } else {
      console.error(
        "❌ Change password failed: Update function returned false"
      );
      return NextResponse.json(
        {
          success: false,
          message: "Không thể cập nhật mật khẩu. Vui lòng thử lại",
          errorCode: "UPDATE_FAILED",
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("❌ Unexpected error during password change:", error);

    // Log detailed error information
    if (error instanceof Error) {
      console.error("Error name:", error.name);
      console.error("Error message:", error.message);
      console.error("Error stack:", error.stack);
    }

    return NextResponse.json(
      {
        success: false,
        message: "Đã xảy ra lỗi không mong muốn. Vui lòng thử lại sau",
        errorCode: "UNEXPECTED_ERROR",
        ...(process.env.NODE_ENV === "development" && {
          errorDetails: error instanceof Error ? error.message : String(error),
        }),
      },
      { status: 500 }
    );
  }
}
