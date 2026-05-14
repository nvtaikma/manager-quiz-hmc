import { Request, Response } from "express";
import questionReportService from "../service/questionReport.service";
import { responseError, responseSuccess } from "../util/errorhandler";
import { AdminAuthRequest } from "../middlewares/authAdmin";

class QuestionReportController {
  /**
   * GET /api/reports
   * Lấy danh sách báo cáo lỗi câu hỏi kèm phân trang, filter, search
   */
  async getReports(req: Request, res: Response) {
    try {
      const {
        page = 1,
        limit = 20,
        status,
        reportType,
        search,
      } = req.query;

      const result = await questionReportService.getReports({
        page: Number(page),
        limit: Number(limit),
        status: status as string,
        reportType: reportType as string,
        search: search as string,
      });

      return responseSuccess(res, "Lấy danh sách báo cáo thành công", result);
    } catch (error: any) {
      return responseError(res, error.message, 400);
    }
  }

  /**
   * GET /api/reports/dashboard
   * Thống kê tổng quan báo cáo lỗi
   */
  async getDashboard(req: Request, res: Response) {
    try {
      const result = await questionReportService.getDashboard();
      return responseSuccess(res, "Lấy thống kê dashboard thành công", result);
    } catch (error: any) {
      return responseError(res, error.message, 400);
    }
  }

  /**
   * GET /api/reports/:id
   * Lấy chi tiết 1 báo cáo kèm câu hỏi gốc và báo cáo liên quan
   */
  async getReportById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const result = await questionReportService.getReportById(id);
      return responseSuccess(res, "Lấy chi tiết báo cáo thành công", result);
    } catch (error: any) {
      return responseError(res, error.message, 400);
    }
  }

  /**
   * PATCH /api/reports/:id/status
   * Cập nhật trạng thái và adminNote cho báo cáo
   */
  async updateReportStatus(req: AdminAuthRequest, res: Response) {
    try {
      const { id } = req.params;
      const { status, adminNote, bulkResolve } = req.body;

      if (!status) {
        return responseError(res, "Trạng thái là bắt buộc", 400);
      }

      const validStatuses = ["pending", "reviewed", "resolved", "rejected"];
      if (!validStatuses.includes(status)) {
        return responseError(res, "Trạng thái không hợp lệ", 400);
      }

      // Bắt buộc adminNote khi resolve hoặc reject
      if ((status === "resolved" || status === "rejected") && !adminNote) {
        return responseError(
          res,
          "Ghi chú admin là bắt buộc khi xử lý hoặc từ chối",
          400
        );
      }

      const adminId = req.admin?.id;
      if (!adminId) {
        return responseError(res, "Không xác định được admin", 401);
      }

      const result = await questionReportService.updateReportStatus(id, {
        status,
        adminNote,
        bulkResolve: bulkResolve || false,
        adminId,
      });

      const message = result.bulkUpdatedCount > 0
        ? `Cập nhật thành công. Đã cập nhật thêm ${result.bulkUpdatedCount} báo cáo liên quan.`
        : "Cập nhật trạng thái báo cáo thành công";

      return responseSuccess(res, message, result);
    } catch (error: any) {
      return responseError(res, error.message, 400);
    }
  }
}

export default new QuestionReportController();
