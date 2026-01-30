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
var student_service_1 = require("../service/student.service");
var errorhandler_1 = require("../util/errorhandler");
var StudentController = /** @class */ (function () {
    function StudentController() {
    }
    /**
     * Lấy danh sách sinh viên theo khóa học
     */
    StudentController.prototype.getStudentsByCourse = function (req, res) {
        return __awaiter(this, void 0, void 0, function () {
            var productId, page, result, error_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        productId = req.params.productId;
                        page = req.query.page;
                        return [4 /*yield*/, student_service_1["default"].getListStudentByProductId(productId, page)];
                    case 1:
                        result = _a.sent();
                        return [2 /*return*/, res.status(200).json({
                                message: "Success",
                                data: result
                            })];
                    case 2:
                        error_1 = _a.sent();
                        return [2 /*return*/, errorhandler_1.responseError(res, error_1.message, 400)];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Tạo sinh viên mới
     */
    StudentController.prototype.createStudent = function (req, res) {
        return __awaiter(this, void 0, void 0, function () {
            var studentData, newStudent, error_2;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        studentData = req.body;
                        return [4 /*yield*/, student_service_1["default"].createStudent(studentData)];
                    case 1:
                        newStudent = _a.sent();
                        return [2 /*return*/, res.status(201).json({
                                message: "Success",
                                data: newStudent
                            })];
                    case 2:
                        error_2 = _a.sent();
                        return [2 /*return*/, errorhandler_1.responseError(res, error_2.message, 400)];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Xóa sinh viên
     */
    StudentController.prototype.deleteStudent = function (req, res) {
        return __awaiter(this, void 0, void 0, function () {
            var studentId, result, error_3;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        studentId = req.params.studentId;
                        return [4 /*yield*/, student_service_1["default"].deleteStudent(studentId)];
                    case 1:
                        result = _a.sent();
                        return [2 /*return*/, res.status(200).json({
                                message: "Success",
                                data: result
                            })];
                    case 2:
                        error_3 = _a.sent();
                        return [2 /*return*/, errorhandler_1.responseError(res, error_3.message, 400)];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    StudentController.prototype.searchStudentByProductId = function (req, res) {
        return __awaiter(this, void 0, void 0, function () {
            var productId, keyword, page, result, error_4;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        productId = req.params.productId;
                        keyword = req.query.keyword;
                        page = req.query.page;
                        console.log("productId", productId);
                        return [4 /*yield*/, student_service_1["default"].searchStudentByProductId(keyword, productId, page)];
                    case 1:
                        result = _a.sent();
                        return [2 /*return*/, res.status(200).json({
                                message: "Success",
                                data: result
                            })];
                    case 2:
                        error_4 = _a.sent();
                        return [2 /*return*/, errorhandler_1.responseError(res, error_4.message, 400)];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    StudentController.prototype.getCountStudentByProductId = function (req, res) {
        return __awaiter(this, void 0, void 0, function () {
            var productId, result, error_5;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        productId = req.params.productId;
                        return [4 /*yield*/, student_service_1["default"].getCountStudentByProductId(productId)];
                    case 1:
                        result = _a.sent();
                        return [2 /*return*/, res.status(200).json({
                                message: "Success",
                                data: result
                            })];
                    case 2:
                        error_5 = _a.sent();
                        return [2 /*return*/, errorhandler_1.responseError(res, error_5.message, 400)];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Lấy danh sách đề thi của sinh viên theo khóa học
     */
    StudentController.prototype.getStudentExams = function (req, res) {
        return __awaiter(this, void 0, void 0, function () {
            var _a, studentId, productId, result, error_6;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 2, , 3]);
                        _a = req.params, studentId = _a.studentId, productId = _a.productId;
                        return [4 /*yield*/, student_service_1["default"].getStudentExams(studentId, productId)];
                    case 1:
                        result = _b.sent();
                        return [2 /*return*/, res.status(200).json({
                                message: "Success",
                                data: result
                            })];
                    case 2:
                        error_6 = _b.sent();
                        return [2 /*return*/, errorhandler_1.responseError(res, error_6.message, 400)];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Lấy danh sách bài kiểm tra của sinh viên theo khóa học
     */
    StudentController.prototype.getStudentTests = function (req, res) {
        return __awaiter(this, void 0, void 0, function () {
            var _a, studentId, productId, result, error_7;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 2, , 3]);
                        _a = req.params, studentId = _a.studentId, productId = _a.productId;
                        return [4 /*yield*/, student_service_1["default"].getStudentTests(studentId, productId)];
                    case 1:
                        result = _b.sent();
                        return [2 /*return*/, res.status(200).json({
                                message: "Success",
                                data: result
                            })];
                    case 2:
                        error_7 = _b.sent();
                        return [2 /*return*/, errorhandler_1.responseError(res, error_7.message, 400)];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    return StudentController;
}());
exports["default"] = new StudentController();
