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
const student_service_1 = __importDefault(require("../service/student.service"));
const errorhandler_1 = require("../util/errorhandler");
class StudentController {
    /**
     * Lấy danh sách sinh viên theo khóa học
     */
    getStudentsByCourse(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { productId } = req.params;
                const { page } = req.query;
                const result = yield student_service_1.default.getListStudentByProductId(productId, page);
                return res.status(200).json({
                    message: "Success",
                    data: result,
                });
            }
            catch (error) {
                return (0, errorhandler_1.responseError)(res, error.message, 400);
            }
        });
    }
    /**
     * Tạo sinh viên mới
     */
    createStudent(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const studentData = req.body;
                const newStudent = yield student_service_1.default.createStudent(studentData);
                return res.status(201).json({
                    message: "Success",
                    data: newStudent,
                });
            }
            catch (error) {
                return (0, errorhandler_1.responseError)(res, error.message, 400);
            }
        });
    }
    /**
     * Xóa sinh viên
     */
    deleteStudent(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { studentId } = req.params;
                const result = yield student_service_1.default.deleteStudent(studentId);
                return res.status(200).json({
                    message: "Success",
                    data: result,
                });
            }
            catch (error) {
                return (0, errorhandler_1.responseError)(res, error.message, 400);
            }
        });
    }
    deleteStudentByProductIdAndEmail(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { productId, email } = req.params;
                const result = yield student_service_1.default.deleteStudentByProductIdAndEmail(productId, email);
                return res.status(200).json({
                    message: "Success",
                    data: result,
                });
            }
            catch (error) {
                return (0, errorhandler_1.responseError)(res, error.message, 400);
            }
        });
    }
    getStudentByEmailAndProductId(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { email } = req.params;
                const { productId } = req.params;
                console.log("email", email);
                console.log("productId", productId);
                const result = yield student_service_1.default.getStudentByEmailAndProductId(email, productId);
                return res.status(200).json({
                    message: "Success",
                    data: result,
                });
            }
            catch (error) {
                return (0, errorhandler_1.responseError)(res, error.message, 400);
            }
        });
    }
    getAllStudent(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { status } = req.params;
                const { page } = req.query;
                const result = yield student_service_1.default.getAllStudent({ status, page });
                return res.status(200).json({
                    message: "Success",
                    data: result,
                });
            }
            catch (error) {
                return (0, errorhandler_1.responseError)(res, error.message, 400);
            }
        });
    }
    updateStudentStatus(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { studentId } = req.params;
                const { status } = req.body;
                const result = yield student_service_1.default.updateStudentStatus(studentId, status);
                return res.status(200).json({
                    message: "Success",
                    data: result,
                });
            }
            catch (error) {
                return (0, errorhandler_1.responseError)(res, error.message, 400);
            }
        });
    }
    exprireOldStudent(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const result = yield student_service_1.default.exprireOldStudent();
                return res.status(200).json({
                    message: "Success",
                    data: result,
                });
            }
            catch (error) {
                return (0, errorhandler_1.responseError)(res, error.message, 400);
            }
        });
    }
    searchStudentByProductId(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { productId } = req.params;
                const { keyword } = req.query;
                const { page } = req.query;
                console.log("productId", productId);
                const result = yield student_service_1.default.searchStudentByProductId(keyword, productId, page);
                return res.status(200).json({
                    message: "Success",
                    data: result,
                });
            }
            catch (error) {
                return (0, errorhandler_1.responseError)(res, error.message, 400);
            }
        });
    }
    getCountStudentByProductId(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { productId } = req.params;
                const result = yield student_service_1.default.getCountStudentByProductId(productId);
                return res.status(200).json({
                    message: "Success",
                    data: result,
                });
            }
            catch (error) {
                return (0, errorhandler_1.responseError)(res, error.message, 400);
            }
        });
    }
    /**
     * Lấy danh sách đề thi của sinh viên theo khóa học
     */
    getStudentExams(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { studentId, productId } = req.params;
                // Sử dụng middleware validateStudentCourse trước đó để đảm bảo sinh viên có quyền truy cập
                // Sau đó chuyển đến service để lấy danh sách đề thi
                const result = yield student_service_1.default.getStudentExams(studentId, productId);
                return res.status(200).json({
                    message: "Success",
                    data: result,
                });
            }
            catch (error) {
                return (0, errorhandler_1.responseError)(res, error.message, 400);
            }
        });
    }
    /**
     * Lấy danh sách bài kiểm tra của sinh viên theo khóa học
     */
    getStudentTests(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { studentId, productId } = req.params;
                // Sử dụng middleware validateStudentCourse trước đó để đảm bảo sinh viên có quyền truy cập
                // Sau đó chuyển đến service để lấy danh sách bài kiểm tra
                const result = yield student_service_1.default.getStudentTests(studentId, productId);
                return res.status(200).json({
                    message: "Success",
                    data: result,
                });
            }
            catch (error) {
                return (0, errorhandler_1.responseError)(res, error.message, 400);
            }
        });
    }
}
exports.default = new StudentController();
