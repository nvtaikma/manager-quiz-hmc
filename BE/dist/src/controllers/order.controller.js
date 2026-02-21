"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const order_service_1 = __importDefault(require("../service/order.service"));
class OrderController {
    getOrder(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { id } = req.params;
            const order = yield order_service_1.default.getOrder(id);
            return res.status(200).json({
                message: "Order fetched successfully",
                data: order,
            });
        });
    }
    createOrder(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { customerId, items } = req.body;
            const order = yield order_service_1.default.createOrder({ customerId, items });
            return res.status(200).json({
                message: "Order created successfully",
                data: order,
            });
        });
    }
    updateOrder(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { id } = req.params;
            const { customerId, items } = req.body;
            const order = yield order_service_1.default.updateOrder({ id, customerId, items });
            return res.status(200).json({
                message: "Order updated successfully",
                data: order,
            });
        });
    }
    updateStatusOrder(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { id } = req.params;
            const { status } = req.body;
            const order = yield order_service_1.default.updateStatusOrder(id, status);
            return res.status(200).json({
                message: "Order status updated successfully",
                data: order,
            });
        });
    }
    getListOrders(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { page } = req.query;
            const { userId, productId } = req.query;
            const orders = yield order_service_1.default.getListOrder({
                page,
                userId,
                productId,
            });
            return res.status(200).json({
                message: "Order list fetched successfully",
                data: orders,
            });
        });
    }
    // async getListOrderByUser(req: Request, res: Response) {
    //   const { userId } = req.query as { userId: string };
    //   const { page } = req.query as unknown as { page: number };
    //   const orders = await OrderService.getListOrderByUser(userId, page);
    //   return res.status(200).json({
    //     message: "Order list fetched successfully",
    //     data: orders,
    //   });
    // }
    // async getListOrderByProduct(req: Request, res: Response) {
    //   const { productId } = req.query as { productId: string };
    //   const { page } = req.query as unknown as { page: number };
    //   const orders = await OrderService.getListOrderByProduct(productId, page);
    //   return res.status(200).json({
    //     message: "Order list fetched successfully",
    //     data: orders,
    //   });
    // }
    getTotalAmountOrderByStatusSuccess(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const totalAmount = yield order_service_1.default.getTotalAmountOrderByStatusSuccess();
            return res.status(200).json({
                message: "Total amount order fetched successfully",
                data: totalAmount,
            });
        });
    }
    getTotalAmountOrderByDate(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const totalAmount = yield order_service_1.default.getTotalAmountOrderByDate();
            return res.status(200).json({
                message: "Total amount order fetched successfully",
                data: totalAmount,
            });
        });
    }
    getCountOrder(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const count = yield order_service_1.default.getCountOrder();
            return res.status(200).json({
                message: "Count order fetched successfully",
                data: { count },
            });
        });
    }
    getCountOrderByStatus(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { status } = req.query;
            const count = yield order_service_1.default.getCountOrderByStatus(status);
            return res.status(200).json({
                message: "Count order fetched successfully",
                data: { count },
            });
        });
    }
    getTotalAmountLast7Days(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const totalAmount = yield order_service_1.default.getTotalAmountLast7Days();
            return res.status(200).json({
                message: "Total amount order fetched successfully",
                data: totalAmount,
            });
        });
    }
    getTotalAmountLast12Months(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const totalAmount = yield order_service_1.default.getTotalAmountLast12Months();
            return res.status(200).json({
                message: "Total amount order fetched successfully",
                data: totalAmount,
            });
        });
    }
    getTotalAmountYesterday(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const totalAmount = yield order_service_1.default.getTotalAmountYesterday();
            return res.status(200).json({
                message: "Total amount order fetched successfully",
                data: totalAmount,
            });
        });
    }
    getOrderByEmail(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { email } = req.query;
            const orders = yield order_service_1.default.getOrderByEmail(email);
            return res.status(200).json({
                message: "Order list fetched successfully",
                data: orders,
            });
        });
    }
}
exports.default = new OrderController();
