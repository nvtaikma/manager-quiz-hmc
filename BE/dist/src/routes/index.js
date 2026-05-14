"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const product_route_1 = __importDefault(require("./product.route"));
const order_route_1 = __importDefault(require("./order.route"));
const customer_route_1 = __importDefault(require("./customer.route"));
const exam_route_1 = __importDefault(require("./exam.route"));
const question_route_1 = __importDefault(require("./question.route"));
const student_route_1 = __importDefault(require("./student.route"));
const announcement_route_1 = __importDefault(require("./announcement.route"));
const ExamHistory_route_1 = __importDefault(require("./ExamHistory.route"));
const Session_route_1 = __importDefault(require("./Session.route"));
const User_route_1 = __importDefault(require("./User.route"));
const PracticeExamHistory_route_1 = __importDefault(require("./PracticeExamHistory.route"));
const class_route_1 = __importDefault(require("../modules/class/class.route"));
const auth_route_1 = __importDefault(require("../modules/admin/auth.route"));
const upload_route_1 = __importDefault(require("./upload.route"));
const extension_route_1 = __importDefault(require("./extension.route"));
const questionReport_route_1 = __importDefault(require("./questionReport.route"));
const authAdmin_1 = require("../middlewares/authAdmin");
const router = express_1.default.Router();
// Public routes
router.use("/auth", auth_route_1.default);
// Extension routes (API Key auth, no JWT required)
router.use(extension_route_1.default);
// Protected routes (yêu cầu JWT)
router.use(authAdmin_1.authAdmin);
router.use("/products", product_route_1.default);
router.use("/orders", order_route_1.default);
router.use("/customers", customer_route_1.default);
router.use("/exams", exam_route_1.default);
router.use("/questions", question_route_1.default);
router.use("/students", student_route_1.default);
router.use("/announcements", announcement_route_1.default);
router.use("/exam-histories", ExamHistory_route_1.default);
router.use("/sessions", Session_route_1.default);
router.use("/users", User_route_1.default);
router.use("/PracticeExamHistory", PracticeExamHistory_route_1.default);
router.use("/classes", class_route_1.default);
router.use("/upload", upload_route_1.default);
router.use("/reports", questionReport_route_1.default);
exports.default = router;
