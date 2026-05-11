import express from "express";
import asyncHandler from "../util/asynHandler";
import OrderController from "../controllers/order.controller";
import ClassController from "../modules/class/class.controller";
import { apiKeyAuth } from "../middlewares/apiKeyAuth";

const router = express.Router();

// === Order Extension routes (API Key auth) ===
router.get(
  "/orders/email/extension",
  apiKeyAuth as any,
  asyncHandler(OrderController.getOrderByEmail),
);
router.patch(
  "/orders/:id/status/extension",
  apiKeyAuth as any,
  asyncHandler(OrderController.updateStatusOrder),
);

// === Class Extension routes (API Key auth) ===
router.post(
  "/classes/bulk/extension",
  apiKeyAuth as any,
  ClassController.bulkCreateClasses,
);
router.post(
  "/classes/:className/timetable/import/extension",
  apiKeyAuth as any,
  ClassController.importTimetableForClass,
);

export default router;
