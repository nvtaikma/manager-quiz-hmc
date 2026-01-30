"use strict";
exports.__esModule = true;
var express_1 = require("express");
var student_controller_1 = require("../controllers/student.controller");
var asynHandler_1 = require("../util/asynHandler");
var student_middleware_1 = require("../middleware/student.middleware");
var router = express_1["default"].Router();
router.get("/:productId", asynHandler_1["default"](student_controller_1["default"].getStudentsByCourse));
router.post("/", asynHandler_1["default"](student_controller_1["default"].createStudent));
router["delete"]("/:studentId", asynHandler_1["default"](student_controller_1["default"].deleteStudent));
router.get("/search/:productId", asynHandler_1["default"](student_controller_1["default"].searchStudentByProductId));
router.get("/count/:productId", asynHandler_1["default"](student_controller_1["default"].getCountStudentByProductId));
// Thêm route mới để lấy danh sách khóa học của sinh viên
router.get("/:studentId/courses", asynHandler_1["default"](student_middleware_1.validateStudent), asynHandler_1["default"](student_middleware_1.getStudentCourses));
// Thêm route mới để lấy danh sách đề thi của sinh viên theo khóa học
router.get("/:studentId/courses/:productId/exams", asynHandler_1["default"](student_middleware_1.validateStudent), asynHandler_1["default"](student_middleware_1.validateStudentCourse), asynHandler_1["default"](student_controller_1["default"].getStudentExams));
// Thêm route mới để lấy danh sách bài kiểm tra của sinh viên theo khóa học
router.get("/:studentId/courses/:productId/tests", asynHandler_1["default"](student_middleware_1.validateStudent), asynHandler_1["default"](student_middleware_1.validateStudentCourse), asynHandler_1["default"](student_controller_1["default"].getStudentTests));
exports["default"] = router;
