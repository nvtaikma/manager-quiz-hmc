import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

export interface AdminAuthRequest extends Request {
  admin?: {
    id: string;
    role: string;
    email: string;
  };
}

const JWT_SECRET = process.env.JWT_SECRET || "fallback_secret_key_123";

export const authAdmin = (req: AdminAuthRequest, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.header("Authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Không tìm thấy token xác thực" });
    }

    const token = authHeader.replace("Bearer ", "");
    
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    
    // Only allow admin or teacher roles
    if (decoded.role !== "admin" && decoded.role !== "teacher") {
      return res.status(403).json({ message: "Không có quyền truy cập" });
    }

    req.admin = {
      id: decoded.id,
      role: decoded.role,
      email: decoded.email
    };
    
    next();
  } catch (error) {
    res.status(401).json({ message: "Token không hợp lệ hoặc đã hết hạn" });
  }
};
