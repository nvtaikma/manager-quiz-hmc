import express from "express";
import ClassController from "./class.controller";

const router = express.Router();

router.get("/", ClassController.getClasses);
router.post("/bulk", ClassController.bulkCreateClasses);
router.get("/:className/timetable", ClassController.getTimetable);
router.post("/timetable/import", ClassController.importTimetable);
router.post("/:className/timetable/import", ClassController.importTimetableForClass);

export default router;
