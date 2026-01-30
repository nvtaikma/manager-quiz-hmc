import express from "express";
import ProductController from "../controllers/product.controller";
import asyncHandler from "../util/asynHandler";
import OrderController from "../controllers/order.controller";

const router = express.Router();

router.post("/", asyncHandler(OrderController.createOrder));
router.patch("/:id", asyncHandler(OrderController.updateOrder));
router.patch("/:id/status", asyncHandler(OrderController.updateStatusOrder));
router.get("/list", asyncHandler(OrderController.getListOrders));
router.get("/id/:id", asyncHandler(OrderController.getOrder));
// router.get("/user", asyncHandler(OrderController.getListOrderByUser));
router.get("/count", asyncHandler(OrderController.getCountOrder));
router.get(
  "/count/status",
  asyncHandler(OrderController.getCountOrderByStatus),
);
router.get(
  "/total/amount",
  asyncHandler(OrderController.getTotalAmountOrderByStatusSuccess),
);
router.get(
  "/total/amount/date",
  asyncHandler(OrderController.getTotalAmountOrderByDate),
);

router.get(
  "/total/amount/last7days",
  asyncHandler(OrderController.getTotalAmountLast7Days),
);

router.get(
  "/total/amount/last12months",
  asyncHandler(OrderController.getTotalAmountLast12Months),
);

router.get(
  "/total/amount/yesterday",
  asyncHandler(OrderController.getTotalAmountYesterday),
);

router.get("/email", asyncHandler(OrderController.getOrderByEmail));

// router.get("/product", asyncHandler(OrderController.getListOrderByProduct));
export default router;
