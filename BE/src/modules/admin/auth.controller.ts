import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import Admin from "./admin.model";

const JWT_SECRET = process.env.JWT_SECRET || "fallback_secret_key_123";

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({ message: "Vui lòng nhập email và mật khẩu" });
      return;
    }

    // Find admin by email
    const admin = await Admin.findOne({ email });
    if (!admin) {
      res.status(401).json({ message: "Email hoặc mật khẩu không chính xác" });
      return;
    }

    // Check password
    const isMatch = await admin.comparePassword(password);
    if (!isMatch) {
      res.status(401).json({ message: "Email hoặc mật khẩu không chính xác" });
      return;
    }

    // Generate JWT token
    const token = jwt.sign(
      { id: admin._id, email: admin.email, role: admin.role },
      JWT_SECRET,
      { expiresIn: "1d" } // Token expires in 1 day
    );

    res.status(200).json({
      message: "Đăng nhập thành công",
      token,
      user: {
        id: admin._id,
        email: admin.email,
        role: admin.role,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Lỗi server trong quá trình đăng nhập" });
  }
};

export const checkAuth = async (req: Request, res: Response) => {
  try {
    // Thông tin admin được gán từ middleware authAdmin
    const admin = (req as any).admin;
    if (!admin) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }
    
    res.status(200).json({
      message: "Token hợp lệ",
      user: admin
    });
  } catch (error) {
    console.error("Check auth error:", error);
    res.status(500).json({ message: "Lỗi server trong quá trình kiểm tra xác thực" });
  }
};

export const changePassword = async (req: Request, res: Response) => {
  try {
    const adminAuth = (req as any).admin;
    if (!adminAuth || !adminAuth.id) {
      res.status(401).json({ success: false, message: "Unauthorized", errorCode: "UNAUTHORIZED" });
      return;
    }

    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      res.status(400).json({
        success: false,
        message: "Vui lòng nhập đầy đủ mật khẩu hiện tại và mật khẩu mới",
        errorCode: "MISSING_FIELDS",
      });
      return;
    }

    if (typeof newPassword !== "string" || newPassword.length < 6) {
      res.status(400).json({
        success: false,
        message: "Mật khẩu mới phải có ít nhất 6 ký tự",
        errorCode: "PASSWORD_TOO_SHORT",
      });
      return;
    }

    if (currentPassword === newPassword) {
      res.status(400).json({
        success: false,
        message: "Mật khẩu mới phải khác mật khẩu hiện tại",
        errorCode: "SAME_PASSWORD",
      });
      return;
    }

    const admin = await Admin.findById(adminAuth.id);
    if (!admin) {
      res.status(404).json({
        success: false,
        message: "Không tìm thấy tài khoản quản trị viên",
        errorCode: "ACCOUNT_NOT_FOUND",
      });
      return;
    }

    const isMatch = await admin.comparePassword(currentPassword);
    if (!isMatch) {
      res.status(400).json({
        success: false,
        message: "Mật khẩu hiện tại không chính xác",
        errorCode: "WRONG_CURRENT_PASSWORD",
      });
      return;
    }

    // Cập nhật mật khẩu mới (hook pre('save') trên Admin model sẽ tự động hash mật khẩu với bcrypt)
    admin.password = newPassword;
    await admin.save();

    res.status(200).json({
      success: true,
      message: "Đổi mật khẩu thành công. Vui lòng đăng nhập lại với mật khẩu mới.",
    });
  } catch (error) {
    console.error("Change password error:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi server trong quá trình đổi mật khẩu",
      errorCode: "SERVER_ERROR",
    });
  }
};

