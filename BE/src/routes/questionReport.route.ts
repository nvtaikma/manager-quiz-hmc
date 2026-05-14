import express from "express";
import questionReportController from "../controllers/questionReport.controller";

const router = express.Router();

// GET /api/reports/dashboard - Phải đặt trước /:id để tránh conflict
router.get("/dashboard", questionReportController.getDashboard);

// GET /api/reports - Danh sách báo cáo
router.get("/", questionReportController.getReports);

// GET /api/reports/:id - Chi tiết báo cáo
router.get("/:id", questionReportController.getReportById);

// PATCH /api/reports/:id/status - Cập nhật trạng thái
router.patch("/:id/status", questionReportController.updateReportStatus as any);

export default router;
