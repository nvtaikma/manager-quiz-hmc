import express from "express";
import PracticeExamHistoryController from "../controllers/PracticeExamHistory.controller";
import asyncHandler from "../util/asynHandler";

const router = express.Router();

router.get(
  "/:userId",
  asyncHandler(PracticeExamHistoryController.getExamByUserId)
);

export default router;
