import { Request, Response } from "express";
import userActivityService from "../service/userActivity.service";
import { responseError } from "../util/errorhandler";
import Customer from "../models/customers";
import User from "../models/User";

/**
 * Resolve Auth User ID từ Customer ID.
 * Luồng: Customer._id → Customer.email → User.findOne({email}) → User._id (Auth)
 *
 * Pattern giống getCustomerSession() trong customers.service.ts:
 * Trang Manage Users hiển thị Customer._id, nhưng UserActivity và Redis
 * dùng Auth User._id (collection khác).
 */
async function resolveAuthUserId(customerId: string): Promise<string | null> {
  const customer = await Customer.findById(customerId).select("email").lean();
  if (!customer?.email) return null;

  const user = await User.findOne({ email: customer.email }).select("_id").lean();
  if (!user) return null;

  return user._id.toString();
}

class UserActivityController {
  /**
   * GET /api/customers/:id/activities?days=7
   *
   * Lấy raw activity documents (mỗi doc = 1 ngày, activities[] thô).
   * Dùng cho các trường hợp cần dữ liệu thô, không cần gom nhóm.
   * Tham số `id` là Customer._id từ trang Manage Users.
   */
  async getActivities(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const days = parseInt(req.query.days as string) || 7;

      const authUserId = await resolveAuthUserId(id);
      if (!authUserId) {
        return res.status(200).json({
          message: "User không liên kết với tài khoản Auth",
          data: [],
        });
      }

      const activities = await userActivityService.getActivitiesByUserId(
        authUserId,
        days
      );

      return res.status(200).json({ message: "Success", data: activities });
    } catch (error: any) {
      return responseError(res, error.message, 400);
    }
  }

  /**
   * GET /api/customers/:id/sessions?days=7
   *
   * Lấy lịch sử hoạt động đã gom nhóm theo phiên (Session Grouping).
   * Trả về DailyActivitySummary[] với startTime, endTime, duration cho từng phiên.
   * Tự phát hiện online/offline qua Redis.
   * Tham số `id` là Customer._id từ trang Manage Users.
   */
  async getSessions(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const days = parseInt(req.query.days as string) || 7;

      const authUserId = await resolveAuthUserId(id);
      if (!authUserId) {
        return res.status(200).json({
          message: "User không liên kết với tài khoản Auth",
          data: [],
        });
      }

      const data = await userActivityService.getSessionsByUserId(
        authUserId,
        days
      );

      return res.status(200).json({ message: "Success", data });
    } catch (error: any) {
      return responseError(res, error.message, 400);
    }
  }
}

export default new UserActivityController();
