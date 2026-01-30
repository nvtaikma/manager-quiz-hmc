import mongoose from "mongoose";
import PracticeExamHistory from "../models/PracticeExamHistory";
class PracticeExamHistoryService {
  async getExamByUserId({ userId }: { userId: string }) {
    const userIdObjectId = new mongoose.Types.ObjectId(userId);
    const examHistory = await PracticeExamHistory.find({
      userId: userIdObjectId,
    })
      .sort({
        createdAt: -1,
      })
      .select(
        "-__v -updatedAt -_id -completedAt -selectedQuestions -userAnswers"
      )
      .lean();

    return examHistory;
  }
}

export default new PracticeExamHistoryService();
