import express from "express";
import UserController from "../controllers/User.controller";
import asyncHandler from "../util/asynHandler";

const router = express.Router();

router.get("/:email", asyncHandler(UserController.getUserByEmail));

export default router;
