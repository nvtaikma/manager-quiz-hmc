"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateStudentCourse = exports.getStudentCourses = exports.validateStudent = void 0;
const student_1 = __importDefault(require("../models/student"));
const errorhandler_1 = require("../util/errorhandler");
/**
 * Middleware xác thực sinh viên có tồn tại trong hệ thống
 */
const validateStudent = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { studentId } = req.params;
        const student = yield student_1.default.findById(studentId);
        if (!student) {
            return (0, errorhandler_1.responseError)(res, "Sinh viên không tồn tại", 404);
        }
        // Lưu thông tin sinh viên vào request để sử dụng ở các middleware tiếp theo
        req.student = student;
        next();
    }
    catch (error) {
        return (0, errorhandler_1.responseError)(res, error.message, 400);
    }
});
exports.validateStudent = validateStudent;
/**
 * Middleware lấy danh sách khóa học mà sinh viên đã tham gia
 */
const getStudentCourses = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { studentId } = req.params;
        // Tìm tất cả các khóa học (products) mà sinh viên đã tham gia
        const coursesData = yield student_1.default.find({ _id: studentId })
            .populate("productId", "name status")
            .lean();
        if (!coursesData || coursesData.length === 0) {
            return (0, errorhandler_1.responseError)(res, "Sinh viên chưa tham gia khóa học nào", 404);
        }
        // Lấy danh sách productId từ kết quả
        const courses = coursesData.map((data) => data.productId);
        // Lưu danh sách khóa học vào request để sử dụng ở các middleware tiếp theo
        req.studentCourses = courses;
        // Nếu được gọi như một API độc lập, trả về kết quả
        if (req.url.endsWith("/courses")) {
            return res.status(200).json({
                message: "Success",
                data: courses,
            });
        }
        // Nếu không thì chuyển đến middleware tiếp theo
        next();
    }
    catch (error) {
        return (0, errorhandler_1.responseError)(res, error.message, 400);
    }
});
exports.getStudentCourses = getStudentCourses;
/**
 * Middleware xác thực sinh viên có quyền truy cập khóa học
 */
const validateStudentCourse = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { studentId, productId } = req.params;
        // Kiểm tra xem sinh viên có thuộc khóa học này hay không
        const enrollment = yield student_1.default.findOne({
            _id: studentId,
            productId,
        });
        if (!enrollment) {
            return (0, errorhandler_1.responseError)(res, "Sinh viên không có quyền truy cập khóa học này", 403);
        }
        next();
    }
    catch (error) {
        return (0, errorhandler_1.responseError)(res, error.message, 400);
    }
});
exports.validateStudentCourse = validateStudentCourse;
