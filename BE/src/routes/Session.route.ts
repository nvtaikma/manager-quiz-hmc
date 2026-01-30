import express from "express";
import SessionController from "../controllers/Session.controller";
import asyncHandler from "../util/asynHandler";

const router = express.Router();

router.get("/:userId", asyncHandler(SessionController.getSessionByUserId));

export default router;
