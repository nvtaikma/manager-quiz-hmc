import QuestionReport, { IQuestionReport } from "../models/QuestionReport";
import { Types } from "mongoose";

interface ReportListQuery {
  page: number;
  limit: number;
  status?: string;
  reportType?: string;
  search?: string;
}

interface UpdateStatusData {
  status: "pending" | "reviewed" | "resolved" | "rejected";
  adminNote?: string;
  bulkResolve?: boolean;
  adminId: string;
}

class QuestionReportService {
  /**
   * Lấy danh sách báo cáo kèm phân trang, filter, search và stats
   */
  async getReports(query: ReportListQuery) {
    const { page = 1, limit = 20, status, reportType, search } = query;
    const skip = (page - 1) * limit;

    // Build filter object
    const filter: Record<string, any> = {};
    if (status && status !== "all") {
      filter.status = status;
    }
    if (reportType && reportType !== "all") {
      filter.reportType = reportType;
    }
    if (search) {
      filter.questionText = { $regex: search, $options: "i" };
    }

    // Parallel: Fetch reports + count + stats
    const [reports, total, stats] = await Promise.all([
      QuestionReport.find(filter)
        .populate("userId", "name email")
        .populate("examId", "name")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      QuestionReport.countDocuments(filter),
      this.getStats(),
    ]);

    // Aggregate: đếm số báo cáo trùng questionId cho mỗi report
    const questionIds = [...new Set(reports.map((r) => r.questionId.toString()))];
    const duplicateCounts = await QuestionReport.aggregate([
      { $match: { questionId: { $in: questionIds.map((id) => new Types.ObjectId(id)) } } },
      { $group: { _id: "$questionId", count: { $sum: 1 } } },
    ]);

    const duplicateMap = new Map(
      duplicateCounts.map((d) => [d._id.toString(), d.count])
    );

    const reportsWithDuplicates = reports.map((report) => ({
      ...report,
      duplicateCount: duplicateMap.get(report.questionId.toString()) || 1,
    }));

    return {
      reports: reportsWithDuplicates,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
      stats,
    };
  }

  /**
   * Lấy thống kê số lượng theo trạng thái
   */
  async getStats() {
    const statsPipeline = await QuestionReport.aggregate([
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
        },
      },
    ]);

    const stats = {
      total: 0,
      pending: 0,
      reviewed: 0,
      resolved: 0,
      rejected: 0,
    };

    statsPipeline.forEach((item) => {
      stats[item._id as keyof typeof stats] = item.count;
      stats.total += item.count;
    });

    return stats;
  }

  /**
   * Lấy chi tiết 1 báo cáo kèm câu hỏi gốc và các báo cáo cùng questionId
   */
  async getReportById(reportId: string) {
    const report = await QuestionReport.findById(reportId)
      .populate("userId", "name email")
      .populate("examId", "name")
      .populate("questionId", "text answers image orderNumber difficulty")
      .populate("resolvedBy", "email")
      .lean();

    if (!report) {
      throw new Error("Không tìm thấy báo cáo");
    }

    // Tìm các báo cáo khác cùng questionId
    const relatedReports = await QuestionReport.find({
      questionId: report.questionId,
      _id: { $ne: report._id },
    })
      .populate("userId", "name email")
      .sort({ createdAt: -1 })
      .lean();

    return {
      report,
      relatedReports,
      relatedCount: relatedReports.length,
    };
  }

  /**
   * Cập nhật trạng thái và adminNote cho báo cáo
   * Hỗ trợ bulk resolve nếu bulkResolve = true
   */
  async updateReportStatus(reportId: string, data: UpdateStatusData) {
    const { status, adminNote, bulkResolve, adminId } = data;

    const report = await QuestionReport.findById(reportId);
    if (!report) {
      throw new Error("Không tìm thấy báo cáo");
    }

    // Build update object
    const updateData: Record<string, any> = {
      status,
      adminNote: adminNote || report.adminNote,
    };

    if (status === "resolved" || status === "rejected") {
      updateData.resolvedBy = new Types.ObjectId(adminId);
      updateData.resolvedAt = new Date();
    }

    // Update the main report
    const updatedReport = await QuestionReport.findByIdAndUpdate(
      reportId,
      updateData,
      { new: true }
    )
      .populate("userId", "name email")
      .populate("examId", "name");

    // Bulk resolve: cập nhật tất cả báo cáo cùng questionId đang pending/reviewed
    let bulkUpdatedCount = 0;
    if (bulkResolve && report.questionId) {
      const bulkResult = await QuestionReport.updateMany(
        {
          questionId: report.questionId,
          _id: { $ne: report._id },
          status: { $in: ["pending", "reviewed"] },
        },
        {
          $set: {
            status,
            adminNote: adminNote || "",
            resolvedBy: new Types.ObjectId(adminId),
            resolvedAt: new Date(),
          },
        }
      );
      bulkUpdatedCount = bulkResult.modifiedCount;
    }

    return {
      report: updatedReport,
      bulkUpdatedCount,
    };
  }

  /**
   * Dashboard: Thống kê tổng quan
   * - Tổng số báo cáo
   * - Phân loại theo type
   * - Trend 7 ngày gần nhất
   * - Top 5 câu hỏi bị báo lỗi nhiều nhất
   */
  async getDashboard() {
    const now = new Date();
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    const [stats, byType, trend, topQuestions] = await Promise.all([
      // Stats tổng quan
      this.getStats(),

      // Phân loại theo type
      QuestionReport.aggregate([
        {
          $group: {
            _id: "$reportType",
            count: { $sum: 1 },
          },
        },
      ]),

      // Trend 7 ngày
      QuestionReport.aggregate([
        {
          $match: {
            createdAt: { $gte: sevenDaysAgo },
          },
        },
        {
          $group: {
            _id: {
              $dateToString: { format: "%Y-%m-%d", date: "$createdAt" },
            },
            count: { $sum: 1 },
          },
        },
        { $sort: { _id: 1 } },
      ]),

      // Top 5 câu hỏi bị báo lỗi nhiều nhất
      QuestionReport.aggregate([
        {
          $group: {
            _id: "$questionId",
            count: { $sum: 1 },
            questionText: { $first: "$questionText" },
            latestReport: { $max: "$createdAt" },
          },
        },
        { $sort: { count: -1 } },
        { $limit: 5 },
      ]),
    ]);

    // Fill missing days in trend
    const trendMap = new Map(trend.map((t) => [t._id, t.count]));
    const filledTrend = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      const dateStr = date.toISOString().split("T")[0];
      filledTrend.push({
        date: dateStr,
        count: trendMap.get(dateStr) || 0,
      });
    }

    return {
      stats,
      byType: byType.map((t) => ({ type: t._id, count: t.count })),
      trend: filledTrend,
      topQuestions,
    };
  }
}

export default new QuestionReportService();
