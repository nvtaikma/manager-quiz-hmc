"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.responseError = exports.responseSuccess = exports.errorMiddleware = exports.ErrorHandler = void 0;
class ErrorHandler extends Error {
    constructor(message, statusCode = 500) {
        super(message);
        this.statusCode = statusCode;
        Error.captureStackTrace(this, this.constructor);
    }
}
exports.ErrorHandler = ErrorHandler;
const responseSuccess = (res, message, data, statusCode = 200) => {
    const response = {
        success: true,
        message,
        data,
    };
    res.status(statusCode).json(response);
};
exports.responseSuccess = responseSuccess;
const responseError = (res, message, statusCode = 500) => {
    const response = {
        success: false,
        message,
    };
    res.status(statusCode).json(response);
};
exports.responseError = responseError;
const errorMiddleware = (err, req, res, next) => {
    const error = {
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
exports.errorMiddleware = errorMiddleware;
