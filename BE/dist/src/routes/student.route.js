"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const student_controller_1 = __importDefault(require("../controllers/student.controller"));
const asynHandler_1 = __importDefault(require("../util/asynHandler"));
const student_middleware_1 = require("../middleware/student.middleware");
const router = express_1.default.Router();
router.get("/:productId", (0, asynHandler_1.default)(student_controller_1.default.getStudentsByCourse));
router.post("/", (0, asynHandler_1.default)(student_controller_1.default.createStudent));
router.delete("/:studentId", (0, asynHandler_1.default)(student_controller_1.default.deleteStudent));
router.delete("/delete/:productId/:email", (0, asynHandler_1.default)(student_controller_1.default.deleteStudentByProductIdAndEmail));
router.get("/check/:productId/:email", (0, asynHandler_1.default)(student_controller_1.default.getStudentByEmailAndProductId));
router.get("/search/:productId", (0, asynHandler_1.default)(student_controller_1.default.searchStudentByProductId));
router.get("/count/:productId", (0, asynHandler_1.default)(student_controller_1.default.getCountStudentByProductId));
// Thêm route mới để lấy danh sách khóa học của sinh viên
router.get("/:studentId/courses", (0, asynHandler_1.default)(student_middleware_1.validateStudent), (0, asynHandler_1.default)(student_middleware_1.getStudentCourses));
// Thêm route mới để lấy danh sách đề thi của sinh viên theo khóa học
router.get("/:studentId/courses/:productId/exams", (0, asynHandler_1.default)(student_middleware_1.validateStudent), (0, asynHandler_1.default)(student_middleware_1.validateStudentCourse), (0, asynHandler_1.default)(student_controller_1.default.getStudentExams));
// Thêm route mới để lấy danh sách bài kiểm tra của sinh viên theo khóa học
router.get("/:studentId/courses/:productId/tests", (0, asynHandler_1.default)(student_middleware_1.validateStudent), (0, asynHandler_1.default)(student_middleware_1.validateStudentCourse), (0, asynHandler_1.default)(student_controller_1.default.getStudentTests));
// Thêm route mới để lấy danh sách sinh viên theo trạng thái
router.get("/status/:status", (0, asynHandler_1.default)(student_controller_1.default.getAllStudent));
// Thêm route mới để cập nhật trạng thái của sinh viên
router.patch("/:studentId/status", (0, asynHandler_1.default)(student_controller_1.default.updateStudentStatus));
// Thêm route mới để cập nhật trạng thái hết hạn của sinh viên
router.patch("/exprire", (0, asynHandler_1.default)(student_controller_1.default.exprireOldStudent));
exports.default = router;
