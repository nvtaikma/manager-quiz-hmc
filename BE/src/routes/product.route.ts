import express from "express";
import ProductController from "../controllers/product.controller";
import examController from "../controllers/exam.controller";
import asyncHandler from "../util/asynHandler";

const router = express.Router();
const productController = new ProductController();

router.post("/", asyncHandler(productController.createProduct));
router.get("/:id", asyncHandler(productController.getProductById));
router.get("/all/full", asyncHandler(productController.getListProducts));
router.patch("/:id", asyncHandler(productController.updateProduct));
router.delete("/:id", asyncHandler(productController.deleteProduct));

// Exam routes related to products
router.get("/:productId/exams", asyncHandler(examController.getExamsByProduct));
router.post("/:productId/exams", asyncHandler(examController.createExam));

// get product where use buy

export default router;
