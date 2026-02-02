import express from "express";
import productRouter from "./product.route";
import orderRouter from "./order.route";
import customerRouter from "./customer.route";
import examRouter from "./exam.route";
import questionRouter from "./question.route";
import studentRouter from "./student.route";
import announcementRouter from "./announcement.route";
import examHistoryRouter from "./ExamHistory.route";
import sessionRouter from "./Session.route";
import userRouter from "./User.route";
import practiceExamHistoryRouter from "./PracticeExamHistory.route";
import classRouter from "../modules/class/class.route";

const router = express.Router();

router.use("/products", productRouter);
router.use("/orders", orderRouter);
router.use("/customers", customerRouter);
router.use("/exams", examRouter);
router.use("/questions", questionRouter);
router.use("/students", studentRouter);
router.use("/announcements", announcementRouter);
router.use("/exam-histories", examHistoryRouter);
router.use("/sessions", sessionRouter);
router.use("/users", userRouter);
router.use("/PracticeExamHistory", practiceExamHistoryRouter);
router.use("/classes", classRouter);

export default router;
