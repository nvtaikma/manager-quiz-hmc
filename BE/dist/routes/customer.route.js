"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const asynHandler_1 = __importDefault(require("../util/asynHandler"));
const customer_controller_1 = __importDefault(require("../controllers/customer.controller"));
const router = express_1.default.Router();
router.post("/", (0, asynHandler_1.default)(customer_controller_1.default.createCustomer));
router.patch("/:id", (0, asynHandler_1.default)(customer_controller_1.default.updateCustomer));
router.patch("/:id/status", (0, asynHandler_1.default)(customer_controller_1.default.updateStatusCustomer));
router.get("/list", (0, asynHandler_1.default)(customer_controller_1.default.getListCustomer));
router.get("/count/active", (0, asynHandler_1.default)(customer_controller_1.default.getCountCustomerActive));
router.get("/count/inactive", (0, asynHandler_1.default)(customer_controller_1.default.getCountCustomerInactive));
router.get("/search", (0, asynHandler_1.default)(customer_controller_1.default.searchCustomer));
exports.default = router;
