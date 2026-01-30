"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const product_controller_1 = __importDefault(require("../controllers/product.controller"));
const exam_controller_1 = __importDefault(require("../controllers/exam.controller"));
const asynHandler_1 = __importDefault(require("../util/asynHandler"));
const router = express_1.default.Router();
const productController = new product_controller_1.default();
router.post("/", (0, asynHandler_1.default)(productController.createProduct));
router.get("/:id", (0, asynHandler_1.default)(productController.getProductById));
router.get("/all/full", (0, asynHandler_1.default)(productController.getListProducts));
router.patch("/:id", (0, asynHandler_1.default)(productController.updateProduct));
router.delete("/:id", (0, asynHandler_1.default)(productController.deleteProduct));
router.put("/:id/sync-question-counts", (0, asynHandler_1.default)(productController.syncQuestionCounts));
// Exam routes related to products
router.get("/:productId/exams", (0, asynHandler_1.default)(exam_controller_1.default.getExamsByProduct));
router.post("/:productId/exams", (0, asynHandler_1.default)(exam_controller_1.default.createExam));
// get product where use buy
exports.default = router;
