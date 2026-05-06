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
