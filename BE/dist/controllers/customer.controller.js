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
const customers_service_1 = __importDefault(require("../service/customers.service"));
class CustomerController {
    createCustomer(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { name, email } = req.body;
            const customer = yield customers_service_1.default.createCustomer({
                name,
                email,
            });
            return res.json({
                message: "Customer created successfully",
                data: customer,
            });
        });
    }
    getListCustomer(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { page } = req.query;
            const customers = yield customers_service_1.default.getListCustomer(page);
            return res.json({
                message: "Customer list fetched successfully",
                data: customers,
            });
        });
    }
    updateCustomer(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { id } = req.params;
            const { name, email } = req.body;
            const customer = yield customers_service_1.default.updateCustomer({ id, name, email });
            return res.json({
                message: "Customer updated successfully",
                data: customer,
            });
        });
    }
    updateStatusCustomer(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { id } = req.params;
            const { status } = req.query;
            const customer = yield customers_service_1.default.updateStatusCustomer(id, status);
            return res.json({
                message: "Customer status updated successfully",
                data: customer,
            });
        });
    }
    getCountCustomerActive(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const count = yield customers_service_1.default.getCountCustomerActive();
            return res.json({
                message: "Count customer active fetched successfully",
                data: { count },
            });
        });
    }
    getCountCustomerInactive(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const count = yield customers_service_1.default.getCountCustomerInactive();
            return res.json({
                message: "Count customer inactive fetched successfully",
                data: { count },
            });
        });
    }
    searchCustomer(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { keyword } = req.query;
            const { page } = req.query;
            const customers = yield customers_service_1.default.searchCustomer(keyword, page);
            return res.json({
                message: "Customer list fetched successfully",
                data: customers,
            });
        });
    }
    getCustomerSession(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { id } = req.params;
            const session = yield customers_service_1.default.getCustomerSession(id);
            return res.json({
                message: "Customer session fetched successfully",
                data: session,
            });
        });
    }
}
exports.default = new CustomerController();
