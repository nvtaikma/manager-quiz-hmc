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
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
exports.__esModule = true;
var student_1 = require("../models/student");
var StudentsService = /** @class */ (function () {
    function StudentsService() {
    }
    StudentsService.prototype.createStudent = function (_a) {
        var email = _a.email, productId = _a.productId;
        return __awaiter(this, void 0, void 0, function () {
            var normalizedEmail, student, error_1;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        normalizedEmail = email.toLowerCase();
                        _b.label = 1;
                    case 1:
                        _b.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, student_1["default"].findOneAndUpdate({ email: normalizedEmail, productId: productId }, { email: normalizedEmail, productId: productId }, { "new": true, upsert: true }).lean()];
                    case 2:
                        student = _b.sent();
                        console.log("student", student);
                        if (student &&
                            student.createdAt.getTime() !== student.updatedAt.getTime()) {
                            return [2 /*return*/, {
                                    message: "User already in the class"
                                }];
                        }
                        return [2 /*return*/, {
                                student: student
                            }];
                    case 3:
                        error_1 = _b.sent();
                        console.error("Error creating/finding student:", error_1);
                        throw error_1;
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    StudentsService.prototype.getListStudentByProductId = function (productId, page) {
        if (page === void 0) { page = 1; }
        return __awaiter(this, void 0, void 0, function () {
            var limit, skip, _a, students, total;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        limit = 15;
                        skip = (page - 1) * limit;
                        return [4 /*yield*/, Promise.all([
                                student_1["default"].find({ productId: productId })
                                    .sort({ createdAt: -1 })
                                    .select("-__v -createdAt -updatedAt")
                                    .skip(skip)
                                    .limit(limit)
                                    .lean(),
                                student_1["default"].countDocuments({ productId: productId }),
                            ])];
                    case 1:
                        _a = _b.sent(), students = _a[0], total = _a[1];
                        console.log("students", students);
                        console.log("total", total);
                        return [2 /*return*/, {
                                students: students,
                                pagination: {
                                    total: total,
                                    page: page,
                                    totalPages: Math.ceil(total / limit)
                                }
                            }];
                }
            });
        });
    };
    StudentsService.prototype.deleteStudent = function (studentId) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, student_1["default"].findByIdAndDelete(studentId)];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    StudentsService.prototype.searchStudentByProductId = function (keyword, productId, page) {
        if (page === void 0) { page = 1; }
        return __awaiter(this, void 0, void 0, function () {
            var limit, skip, _a, students, total;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        limit = 15;
                        skip = (page - 1) * limit;
                        return [4 /*yield*/, Promise.all([
                                student_1["default"].find({
                                    $or: [{ email: { $regex: keyword, $options: "i" } }],
                                    productId: productId
                                })
                                    .select("-__v -createdAt -updatedAt")
                                    .skip(skip)
                                    .limit(limit)
                                    .lean(),
                                student_1["default"].countDocuments({
                                    $or: [{ email: { $regex: keyword, $options: "i" } }],
                                    productId: productId
                                }),
                            ])];
                    case 1:
                        _a = _b.sent(), students = _a[0], total = _a[1];
                        return [2 /*return*/, {
                                students: students,
                                pagination: {
                                    total: total,
                                    page: page,
                                    totalPages: Math.ceil(total / limit)
                                }
                            }];
                }
            });
        });
    };
    StudentsService.prototype.getCountStudentByProductId = function (productId) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, student_1["default"].countDocuments({ productId: productId })];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    /**
     * Lấy danh sách đề thi của sinh viên theo khóa học
     * @param studentId ID của sinh viên
     * @param productId ID của khóa học
     * @returns Danh sách đề thi
     */
    StudentsService.prototype.getStudentExams = function (studentId, productId) {
        return __awaiter(this, void 0, void 0, function () {
            var student, error_2;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, student_1["default"].findOne({ _id: studentId, productId: productId })];
                    case 1:
                        student = _a.sent();
                        if (!student) {
                            throw new Error("Sinh viên không có quyền truy cập khóa học này");
                        }
                        // Giả định rằng có một model Exam với cấu trúc phù hợp
                        // Bạn cần thay thế đoạn này bằng truy vấn thực tế đến model Exam của bạn
                        // Ví dụ:
                        // const exams = await Exam.find({ productId }).lean();
                        // Hiện tại trả về dữ liệu mẫu
                        return [2 /*return*/, {
                                exams: [],
                                message: "Cần triển khai kết nối với model Exam thực tế"
                            }];
                    case 2:
                        error_2 = _a.sent();
                        console.error("Error fetching student exams:", error_2);
                        throw error_2;
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Lấy danh sách bài kiểm tra của sinh viên theo khóa học
     * @param studentId ID của sinh viên
     * @param productId ID của khóa học
     * @returns Danh sách bài kiểm tra
     */
    StudentsService.prototype.getStudentTests = function (studentId, productId) {
        return __awaiter(this, void 0, void 0, function () {
            var student, error_3;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, student_1["default"].findOne({ _id: studentId, productId: productId })];
                    case 1:
                        student = _a.sent();
                        if (!student) {
                            throw new Error("Sinh viên không có quyền truy cập khóa học này");
                        }
                        // Giả định rằng có một model Test với cấu trúc phù hợp
                        // Bạn cần thay thế đoạn này bằng truy vấn thực tế đến model Test của bạn
                        // Ví dụ:
                        // const tests = await Test.find({ productId }).lean();
                        // Hiện tại trả về dữ liệu mẫu
                        return [2 /*return*/, {
                                tests: [],
                                message: "Cần triển khai kết nối với model Test thực tế"
                            }];
                    case 2:
                        error_3 = _a.sent();
                        console.error("Error fetching student tests:", error_3);
                        throw error_3;
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    return StudentsService;
}());
exports["default"] = new StudentsService();
