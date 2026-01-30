import express from "express";
import ExamHistoryController from "../controllers/ExamHistory.controller";
import asyncHandler from "../util/asynHandler";

const router = express.Router();

router.get("/:userId", asyncHandler(ExamHistoryController.getExamByUserId));

export default router;
