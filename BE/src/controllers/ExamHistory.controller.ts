import { Request, Response } from "express";
import ExamHistoryService from "../service/ExamHistory.service";

class ExamHistoryController {
  async getExamByUserId(req: Request, res: Response) {
    const { userId } = req.params;
    const examHistory = await ExamHistoryService.getExamByUserId({
      userId,
    });
    console.log(examHistory);
    return res.status(200).json({
      message: "Success",
      data: examHistory,
    });
  }
}

export default new ExamHistoryController();
