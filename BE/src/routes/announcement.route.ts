import express from "express";

import asyncHandler from "../util/asynHandler";
import announcementController from "../controllers/announcement.controller";

const router = express.Router();

// create announcement
router.post("/", asyncHandler(announcementController.createAnnouncement));

// get announcement
router.get("/:id", asyncHandler(announcementController.getAnnouncement));

// update announcement
router.patch("/:id", asyncHandler(announcementController.updateAnnouncement));

// delete announcement
router.delete("/:id", asyncHandler(announcementController.deleteAnnouncement));

// get all announcements
router.get("/", asyncHandler(announcementController.getAllAnnouncements));

// get all active announcements
router.get(
  "/active",
  asyncHandler(announcementController.getAllActiveAnnouncements)
);

// get all expired announcements
router.get(
  "/expired",
  asyncHandler(announcementController.getAllExpiredAnnouncements)
);

export default router;
