import express from "express";
import ProductController from "../controllers/product.controller";
import asyncHandler from "../util/asynHandler";
import CustomerController from "../controllers/customer.controller";

const router = express.Router();

router.post("/", asyncHandler(CustomerController.createCustomer));
router.patch("/:id", asyncHandler(CustomerController.updateCustomer));
router.patch(
  "/:id/status",
  asyncHandler(CustomerController.updateStatusCustomer)
);
router.get("/list", asyncHandler(CustomerController.getListCustomer));
router.get(
  "/count/active",
  asyncHandler(CustomerController.getCountCustomerActive)
);
router.get(
  "/count/inactive",
  asyncHandler(CustomerController.getCountCustomerInactive)
);

router.get("/search", asyncHandler(CustomerController.searchCustomer));
export default router;
