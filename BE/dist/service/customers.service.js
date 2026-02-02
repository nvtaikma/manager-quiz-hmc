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
const customers_1 = __importDefault(require("../models/customers"));
const User_1 = __importDefault(require("../models/User"));
const redis_1 = __importDefault(require("../dbs/redis"));
class CustomersService {
    createCustomer(_a) {
        return __awaiter(this, arguments, void 0, function* ({ name, email }) {
            const normalizedEmail = email.toLowerCase();
            const foundCustomer = yield customers_1.default.findOne({ email: normalizedEmail })
                .select("-__v -createdAt -updatedAt -status")
                .lean();
            if (foundCustomer) {
                return foundCustomer;
            }
            const newCustomer = yield customers_1.default.create({ name, email: normalizedEmail });
            return {
                _id: newCustomer._id,
                name: newCustomer.name,
                email: newCustomer.email,
                avatar: newCustomer.avatar,
                count: newCustomer.count,
            };
        });
    }
    getListCustomer() {
        return __awaiter(this, arguments, void 0, function* (page = 1) {
            const limit = 15;
            const skip = (page - 1) * limit;
            const [customers, total] = yield Promise.all([
                customers_1.default.find()
                    .sort({ createdAt: -1 })
                    .select("-__v -createdAt -updatedAt")
                    .skip(skip)
                    .limit(limit)
                    .lean(),
                customers_1.default.countDocuments(),
            ]);
            return {
                customers,
                pagination: {
                    total,
                    page,
                    totalPages: Math.ceil(total / limit),
                },
            };
        });
    }
    updateCustomer(_a) {
        return __awaiter(this, arguments, void 0, function* ({ id, name, email, }) {
            return yield customers_1.default.findByIdAndUpdate(id, { name, email }, { new: true });
        });
    }
    updateStatusCustomer(id, status) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield customers_1.default.findByIdAndUpdate(id, { status }, { new: true });
        });
    }
    searchCustomer(keyword_1) {
        return __awaiter(this, arguments, void 0, function* (keyword, page = 1) {
            const limit = 15;
            const skip = (page - 1) * limit;
            const [customers, total] = yield Promise.all([
                customers_1.default.find({
                    $or: [
                        { name: { $regex: keyword, $options: "i" } },
                        { email: { $regex: keyword, $options: "i" } },
                    ],
                })
                    .select("-__v -createdAt -updatedAt")
                    .skip(skip)
                    .limit(limit)
                    .lean(),
                customers_1.default.countDocuments({
                    $or: [
                        { name: { $regex: keyword, $options: "i" } },
                        { email: { $regex: keyword, $options: "i" } },
                    ],
                }),
            ]);
            return {
                customers,
                pagination: {
                    total,
                    page,
                    totalPages: Math.ceil(total / limit),
                },
            };
        });
    }
    getCountCustomerActive() {
        return __awaiter(this, void 0, void 0, function* () {
            return yield customers_1.default.countDocuments({ status: "active" });
        });
    }
    getCountCustomerInactive() {
        return __awaiter(this, void 0, void 0, function* () {
            return yield customers_1.default.countDocuments({ status: "inactive" });
        });
    }
    getCustomerSession(customerId) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            if (!customerId)
                return null;
            // 1. Find Customer to get email
            const customer = yield customers_1.default.findById(customerId);
            if (!customer || !customer.email)
                return null;
            // 2. Find User by email to get Auth ID
            // Some Customers might not have a linked User account yet
            const user = yield User_1.default.findOne({ email: customer.email });
            if (!user)
                return null;
            const userId = (_a = user === null || user === void 0 ? void 0 : user._id) === null || _a === void 0 ? void 0 : _a.toString();
            // 3. Get active token from key "user_active_token:{userId}"
            const token = yield redis_1.default.get(`user_active_token:${userId}`);
            if (!token)
                return null;
            // 4. Get session details from key "session:{token}"
            const sessionData = yield redis_1.default.get(`session:${token}`);
            return sessionData ? JSON.parse(sessionData) : null;
        });
    }
}
exports.default = new CustomersService();
