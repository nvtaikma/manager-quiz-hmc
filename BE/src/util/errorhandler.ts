import { Request, Response, NextFunction } from "express";

interface ErrorResponse {
  message: string;
  stack?: string;
  statusCode?: number;
}

interface SuccessResponse<T> {
  success: boolean;
  message: string;
  data?: T;
}

class ErrorHandler extends Error {
  statusCode: number;

  constructor(message: string, statusCode: number = 500) {
    super(message);
    this.statusCode = statusCode;
    Error.captureStackTrace(this, this.constructor);
  }
}

const responseSuccess = <T>(
  res: Response,
  message: string,
  data?: T,
  statusCode: number = 200
): void => {
  const response: SuccessResponse<T> = {
    success: true,
    message,
    data,
  };
  res.status(statusCode).json(response);
};

const responseError = (
  res: Response,
  message: string,
  statusCode: number = 500
): void => {
  const response: SuccessResponse<null> = {
    success: false,
    message,
  };
  res.status(statusCode).json(response);
};

const errorMiddleware = (
  err: ErrorHandler,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const error: ErrorResponse = {
    message: err.message || "Lỗi máy chủ nội bộ",
    statusCode: err.statusCode || 500,
  };

  // Thêm stack trace trong môi trường development
  if (process.env.NODE_ENV === "development") {
    error.stack = err.stack;
  }

  res.status(error.statusCode || 500).json({
    success: false,
    error: error,
  });
};

export { ErrorHandler, errorMiddleware, responseSuccess, responseError };
