import mongoose from "mongoose";
import ExamHistory from "../models/ExamHistory";

class ExamHistoryService {
  async getExamByUserId({ userId }: { userId: string }) {
    const userIdObjectId = new mongoose.Types.ObjectId(userId);
    const examHistory = await ExamHistory.find({ userId: userIdObjectId })
      .sort({
        createdAt: -1,
      })
      .select("-__v -updatedAt -_id -completedAt")
      .lean();

    return examHistory;
  }
}

export default new ExamHistoryService();
