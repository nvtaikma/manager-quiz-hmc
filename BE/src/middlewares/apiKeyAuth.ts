import { Request, Response, NextFunction } from "express";

const VALID_API_KEY = "pi3ilrRmwv9LJ0J2u2PHRsW";

/**
 * Middleware xác thực API Key cho client extension.
 * Kiểm tra header `x-api-key` trong request.
 */
export const apiKeyAuth = (req: Request, res: Response, next: NextFunction) => {
  const apiKey = req.header("x-api-key");

  if (!apiKey) {
    return res.status(401).json({ message: "API key is required" });
  }

  if (apiKey !== VALID_API_KEY) {
    return res.status(403).json({ message: "Invalid API key" });
  }

  next();
};
