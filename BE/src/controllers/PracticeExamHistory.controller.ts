import { Request, Response } from "express";

import PracticeExamHistoryService from "../service/PracticeExamHistory.service";
class PracticeExamHistorySController {
  async getExamByUserId(req: Request, res: Response) {
    const { userId } = req.params;
    const examHistory = await PracticeExamHistoryService.getExamByUserId({
      userId,
    });
    return res.status(200).json({
      message: "Success",
      data: examHistory,
    });
  }
}

export default new PracticeExamHistorySController();
