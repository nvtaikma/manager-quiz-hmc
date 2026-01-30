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
const mongoose_1 = __importDefault(require("mongoose"));
const customers_1 = __importDefault(require("../models/customers"));
const order_1 = __importDefault(require("../models/order"));
const products_1 = __importDefault(require("../models/products"));
const student_service_1 = __importDefault(require("./student.service"));
class OrderService {
    getOrder(id) {
        return __awaiter(this, void 0, void 0, function* () {
            const order = yield order_1.default.aggregate([
                { $match: { _id: new mongoose_1.default.Types.ObjectId(id) } },
                {
                    $lookup: {
                        from: "customers",
                        localField: "customerId",
                        foreignField: "_id",
                        as: "customer",
                    },
                },
                {
                    $project: {
                        _id: 1,
                        customerId: {
                            name: { $arrayElemAt: ["$customer.name", 0] },
                            email: { $arrayElemAt: ["$customer.email", 0] },
                            avatar: { $arrayElemAt: ["$customer.avatar", 0] },
                        },
                        items: 1,
                        status: 1,
                        orderDate: 1,
                        totalAmount: 1,
                    },
                },
                {
                    $unwind: "$items",
                },
                {
                    $lookup: {
                        from: "products",
                        localField: "items.productId",
                        foreignField: "_id",
                        as: "product",
                    },
                },
                {
                    $project: {
                        _id: 1,
                        customerId: 1,
                        status: 1,
                        orderDate: 1,
                        totalAmount: 1,
                        products: {
                            _id: { $arrayElemAt: ["$product._id", 0] },
                            name: { $arrayElemAt: ["$product.name", 0] },
                            type: "$items.type",
                            amount: "$items.amount",
                        },
                    },
                },
                // gộp các sản phẩm có cùng id
                {
                    $group: {
                        _id: "$_id",
                        status: { $first: "$status" },
                        orderDate: { $first: "$orderDate" },
                        totalAmount: { $first: "$totalAmount" },
                        customer: { $first: "$customerId" },
                        products: { $push: "$products" },
                    },
                },
            ]);
            return order;
        });
    }
    /**  order
    async getListOrderByUser(userId: string, page: number = 1) {
      const limit = 15;
      const skip = (page - 1) * limit;
      const customer = await Customer.findOne({ _id: userId })
        .select("-__v -createdAt -updatedAt")
        .lean();
      if (!customer) {
        throw new Error("Customer not found");
      }
  
      const [orders, total] = await Promise.all([
        Order.find({
          customerId: customer._id,
        })
          .select("-__v -createdAt -updatedAt")
          .populate("customerId", "name email avatar")
          .skip(skip)
          .limit(limit)
          .lean()
          .then((orders) =>
            orders.map((order) => ({
              ...order,
              customer: order.customerId,
              customerId: undefined,
            }))
          ),
        Order.countDocuments({ customerId: customer._id }),
      ]);
  
      return {
        orders,
        pagination: {
          total,
          page,
          totalPages: Math.ceil(total / limit),
        },
      };
    }
  
    async getListOrderByProduct(productId: string, page: number = 1) {
      const limit = 15;
      const skip = (page - 1) * limit;
      const orders = await Order.find({
        "items.productId": productId,
      })
        .select("-__v -createdAt -updatedAt")
        .populate("customerId", "name email avatar")
        .skip(skip)
        .limit(limit)
        .lean()
        .then((orders) =>
          orders.map((order) => ({
            ...order,
            customer: order.customerId,
            customerId: undefined,
          }))
        );
      const total = await Order.countDocuments({
        "items.productId": productId,
      });
      return {
        orders,
        pagination: {
          total,
          page,
          totalPages: Math.ceil(total / limit),
        },
      };
    }
  
    async getListOrder(page: number = 1) {
      const limit = 15;
      const skip = (page - 1) * limit;
  
      const [orders, total] = await Promise.all([
        Order.find()
          .select("-__v -createdAt -updatedAt")
          .populate({
            path: "customerId",
            select: "name email avatar",
            model: "Customer",
          })
          .sort({ orderDate: -1 })
          .skip(skip)
          .limit(limit)
          .lean()
          .then((orders) =>
            orders.map((order) => ({
              ...order,
              customer: order.customerId,
              customerId: undefined,
            }))
          ),
        Order.countDocuments(),
      ]);
  
      return {
        orders,
        pagination: {
          total,
          page,
          totalPages: Math.ceil(total / limit),
        },
      };
    }
    
    */
    getListOrder(options) {
        return __awaiter(this, void 0, void 0, function* () {
            // Thiết lập giá trị mặc định
            const { userId, productId, page = 1, limit = 15, sort = { orderDate: -1 }, } = options;
            const skip = (page - 1) * limit;
            let query = {};
            // Xác định query dựa trên tham số đầu vào
            if (userId) {
                // Kiểm tra customer tồn tại
                const customer = yield customers_1.default.findOne({ _id: userId })
                    .select("-__v -createdAt -updatedAt")
                    .lean();
                if (!customer) {
                    throw new Error("Customer not found");
                }
                query.customerId = customer._id;
            }
            if (productId) {
                query["items.productId"] = productId;
            }
            // Thực hiện truy vấn và đếm tổng số
            const [orders, total] = yield Promise.all([
                order_1.default.find(query)
                    .select("-__v -createdAt -updatedAt")
                    .populate({
                    path: "customerId",
                    select: "name email avatar",
                    model: "Customer",
                })
                    .sort(sort)
                    .skip(skip)
                    .limit(limit)
                    .lean()
                    .then((orders) => orders.map((order) => (Object.assign(Object.assign({}, order), { customer: order.customerId, customerId: undefined })))),
                order_1.default.countDocuments(query),
            ]);
            return {
                orders,
                pagination: {
                    total,
                    page,
                    limit,
                    totalPages: Math.ceil(total / limit),
                },
            };
        });
    }
    createOrder(_a) {
        return __awaiter(this, arguments, void 0, function* ({ customerId, items, }) {
            console.log("customerId", customerId);
            const foundCustomer = yield customers_1.default.findById(new mongoose_1.default.Types.ObjectId(customerId))
                .select("-__v -createdAt -updatedAt")
                .lean();
            console.log("foundCustomer", foundCustomer);
            if (!foundCustomer) {
                throw new Error("Customer not found");
            }
            const foundListProductId = yield products_1.default.find({
                _id: { $in: items.map((item) => item.productId) },
            }).lean();
            if (foundListProductId.length !== items.length) {
                throw new Error("Some products not found");
            }
            const newOrder = yield order_1.default.create({
                customerId,
                items: items.map((item) => ({
                    productId: item.productId,
                    type: item.selectedType,
                })),
                orderDate: new Date(),
                status: "pending",
            });
            // Thêm sinh viên vào lớp sau khi đơn hàng được tạo thành công
            try {
                // Thêm sinh viên cho mỗi sản phẩm trong đơn hàng
                const studentCreationPromises = items.map((item) => __awaiter(this, void 0, void 0, function* () {
                    return student_service_1.default.createStudent({
                        email: foundCustomer.email,
                        productId: item.productId,
                    });
                }));
                yield Promise.all(studentCreationPromises);
                console.log(`Đã thêm học sinh ${foundCustomer.email} vào các lớp học tương ứng`);
            }
            catch (error) {
                console.error("Lỗi khi thêm học sinh vào lớp:", error);
                // Không ném lỗi ra ngoài vì đơn hàng vẫn được tạo thành công
                // Có thể xem xét xử lý thêm tùy theo yêu cầu nghiệp vụ
            }
            return {
                name: foundCustomer.name,
                email: foundCustomer.email,
                items: newOrder.items,
                orderDate: newOrder.orderDate,
                status: newOrder.status,
                totalAmount: newOrder.totalAmount,
                _id: newOrder._id,
            };
        });
    }
    updateOrder(_a) {
        return __awaiter(this, arguments, void 0, function* ({ id, customerId, items, }) {
            const foundOrder = yield order_1.default.findById(id).lean();
            if (!foundOrder) {
                throw new Error("Không tìm thấy đơn hàng");
            }
            const foundCustomer = yield customers_1.default.findById(customerId).lean();
            if (!foundCustomer) {
                throw new Error("Không tìm thấy khách hàng");
            }
            const foundListProductId = yield products_1.default.find({
                _id: { $in: items.map((item) => item.productId) },
            }).lean();
            if (foundListProductId.length !== items.length) {
                throw new Error("Một số sản phẩm không tồn tại");
            }
            return yield order_1.default.findByIdAndUpdate(id, {
                items: items.map((item) => ({
                    productId: item.productId,
                    type: item.selectedType,
                })),
                orderDate: new Date(),
            }, { new: true });
        });
    }
    updateStatusOrder(id, status) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield order_1.default.findByIdAndUpdate(id, { status }, { new: true });
        });
    }
    getCountOrder() {
        return __awaiter(this, void 0, void 0, function* () {
            return yield order_1.default.countDocuments();
        });
    }
    getCountOrderByStatus(status) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield order_1.default.countDocuments({ status });
        });
    }
    // tổng doanh thu theo status success
    getTotalAmountOrderByStatusSuccess() {
        return __awaiter(this, void 0, void 0, function* () {
            const result = yield order_1.default.aggregate([
                { $match: { status: "completed" } },
                { $group: { _id: null, totalAmount: { $sum: "$totalAmount" } } },
                { $project: { _id: 0, totalAmount: 1 } },
            ]);
            return result[0] || { totalAmount: 0 };
        });
    }
    getTotalAmountOrderByDate() {
        return __awaiter(this, void 0, void 0, function* () {
            const vietnamTimeOffset = 7 * 60 * 60 * 1000; // Múi giờ +7 (7 giờ * 60 phút * 60 giây * 1000 mili giây)
            const now = new Date();
            const today = new Date(now.getTime() + vietnamTimeOffset);
            today.setUTCHours(0, 0, 0, 0); // Đặt thời gian về 00:00:00 theo giờ Việt Nam
            const tomorrow = new Date(today);
            tomorrow.setUTCDate(tomorrow.getUTCDate() + 1); // Ngày mai theo giờ Việt Nam
            const result = yield order_1.default.aggregate([
                {
                    $match: {
                        orderDate: {
                            $gte: today, // Từ 00:00:00 ngày hôm nay theo giờ Việt Nam
                            $lt: tomorrow, // Đến trước 00:00:00 ngày mai theo giờ Việt Nam
                        },
                        status: "completed", // Chỉ tính các đơn hàng đã hoàn thành
                    },
                },
                { $group: { _id: null, totalAmount: { $sum: "$totalAmount" } } }, // Tính tổng doanh thu
                { $project: { _id: 0, totalAmount: 1 } }, // Chỉ lấy trường totalAmount
            ]);
            return result[0] || { totalAmount: 0 }; // Trả về 0 nếu không có doanh thu
        });
    }
    // tổng thu nhập hôm qua
    getTotalAmountYesterday() {
        return __awaiter(this, void 0, void 0, function* () {
            const yesterday = new Date();
            yesterday.setDate(yesterday.getDate() - 1);
            yesterday.setHours(0, 0, 0, 0);
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            const result = yield order_1.default.aggregate([
                {
                    $match: {
                        orderDate: {
                            $gte: yesterday,
                            $lt: today,
                        },
                        status: "completed",
                    },
                },
                { $group: { _id: null, totalAmount: { $sum: "$totalAmount" } } },
                { $project: { _id: 0, totalAmount: 1 } },
            ]);
            return result[0] || { totalAmount: 0 };
        });
    }
    getTotalAmountLast7Days() {
        return __awaiter(this, void 0, void 0, function* () {
            const sevenDaysAgo = new Date();
            sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
            const result = yield order_1.default.aggregate([
                {
                    $match: {
                        orderDate: { $gte: sevenDaysAgo },
                        status: "completed",
                    },
                },
                {
                    $group: {
                        _id: { $dateToString: { format: "%Y-%m-%d", date: "$orderDate" } },
                        totalAmount: { $sum: "$totalAmount" },
                    },
                },
                { $sort: { _id: 1 } },
                { $project: { date: "$_id", totalAmount: 1, _id: 0 } },
            ]);
            return result;
        });
    }
    getTotalAmountLast12Months() {
        return __awaiter(this, void 0, void 0, function* () {
            const twelveMonthsAgo = new Date();
            twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 12);
            const result = yield order_1.default.aggregate([
                {
                    $match: {
                        orderDate: { $gte: twelveMonthsAgo },
                        status: "completed",
                    },
                },
                {
                    $group: {
                        _id: {
                            year: { $year: "$orderDate" },
                            month: { $month: "$orderDate" },
                        },
                        totalAmount: { $sum: "$totalAmount" },
                    },
                },
                {
                    $project: {
                        _id: 0,
                        date: {
                            $concat: [
                                { $toString: "$_id.year" },
                                "-",
                                { $toString: "$_id.month" },
                            ],
                        },
                        totalAmount: 1,
                    },
                },
                { $sort: { date: 1 } },
            ]);
            return result;
        });
    }
    // async getOrderByEmail(email: string) {
    //   const customer = await Customer.findOne({ email })
    //     .select("-__v -createdAt -updatedAt")
    //     .lean();
    //   if (!customer) {
    //     throw new Error("Customer not found");
    //   }
    //   const orders = await Order.aggregate([
    //     { $match: { customerId: new mongoose.Types.ObjectId(customer._id) } },
    //     {
    //       $lookup: {
    //         from: "customers",
    //         localField: "customerId",
    //         foreignField: "_id",
    //         as: "customer",
    //       },
    //     },
    //     {
    //       $project: {
    //         _id: 1,
    //         customerId: {
    //           name: { $arrayElemAt: ["$customer.name", 0] },
    //           email: { $arrayElemAt: ["$customer.email", 0] },
    //           avatar: { $arrayElemAt: ["$customer.avatar", 0] },
    //         },
    //         items: 1,
    //         status: 1,
    //         orderDate: 1,
    //         totalAmount: 1,
    //       },
    //     },
    //     {
    //       $unwind: "$items",
    //     },
    //     {
    //       $lookup: {
    //         from: "products",
    //         localField: "items.productId",
    //         foreignField: "_id",
    //         as: "product",
    //       },
    //     },
    //     {
    //       $project: {
    //         _id: 1,
    //         customerId: 1,
    //         status: 1,
    //         orderDate: 1,
    //         totalAmount: 1,
    //         products: {
    //           _id: { $arrayElemAt: ["$product._id", 0] },
    //           name: { $arrayElemAt: ["$product.name", 0] },
    //           type: "$items.type",
    //           amount: "$items.amount",
    //         },
    //       },
    //     },
    //     // gộp các sản phẩm có cùng id
    //     {
    //       $group: {
    //         _id: "$_id",
    //         status: { $first: "$status" },
    //         orderDate: { $first: "$orderDate" },
    //         totalAmount: { $first: "$totalAmount" },
    //         customer: { $first: "$customerId" },
    //         products: { $push: "$products" },
    //       },
    //     },
    //   ]);
    //   console.log("orders", orders);
    //   return {
    //     customer,
    //     orders,
    //   };
    // }
    getOrderByEmail(email) {
        return __awaiter(this, void 0, void 0, function* () {
            // 1. Fetch Customer (Giữ nguyên vì đã tốt)
            const customer = yield customers_1.default.findOne({ email })
                .select("-__v -createdAt -updatedAt")
                .lean();
            if (!customer) {
                throw new Error("Customer not found");
            }
            // 2. Aggregation tối ưu
            const orders = yield order_1.default.aggregate([
                // Bước 1: Match chính xác, ép kiểu an toàn
                {
                    $match: {
                        customerId: new mongoose_1.default.Types.ObjectId(customer._id.toString()),
                    },
                },
                // Bước 2: Lấy thông tin Products một lần duy nhất cho mảng items
                {
                    $lookup: {
                        from: "products",
                        localField: "items.productId",
                        foreignField: "_id",
                        as: "productDetails", // Lấy toàn bộ info sản phẩm liên quan vào mảng tạm này
                    },
                },
                // Bước 3: Map dữ liệu để merge thông tin (Thay thế cho Unwind/Group)
                {
                    $project: {
                        _id: 1,
                        status: 1,
                        orderDate: 1,
                        totalAmount: 1,
                        // Không cần lookup customer, lát nữa ta sẽ gán customer vào return
                        products: {
                            $map: {
                                input: "$items",
                                as: "item",
                                in: {
                                    // Tìm product tương ứng trong mảng productDetails
                                    $let: {
                                        vars: {
                                            productInfo: {
                                                $arrayElemAt: [
                                                    {
                                                        $filter: {
                                                            input: "$productDetails",
                                                            as: "pd",
                                                            cond: { $eq: ["$$pd._id", "$$item.productId"] },
                                                        },
                                                    },
                                                    0,
                                                ],
                                            },
                                        },
                                        in: {
                                            _id: "$$productInfo._id",
                                            name: "$$productInfo.name",
                                            type: "$$item.type",
                                            amount: "$$item.amount",
                                        },
                                    },
                                },
                            },
                        },
                    },
                },
            ]);
            // 3. Mapping data ở tầng ứng dụng (NodeJS) - Nhanh hơn DB làm
            // Nếu FE cần cấu trúc customer nằm trong từng order (dù hơi dư thừa):
            const populatedOrders = orders.map((order) => (Object.assign(Object.assign({}, order), { customer: {
                    name: customer.name,
                    email: customer.email,
                    avatar: customer.avatar,
                } })));
            console.log("orders", populatedOrders.length);
            return {
                customer,
                orders: populatedOrders, // Hoặc trả về 'orders' gốc nếu FE không cần customer lặp lại
            };
        });
    }
}
exports.default = new OrderService();
