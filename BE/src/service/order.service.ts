import mongoose from "mongoose";
import Customer from "../models/customers";
import Order from "../models/order";
import Product from "../models/products";
import Student from "../models/student";
import StudentService from "./student.service";

class OrderService {
  async getOrder(id: string) {
    const order = await Order.aggregate([
      { $match: { _id: new mongoose.Types.ObjectId(id) } },
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
    if (!order || order.length === 0) {
      return order;
    }

    // Lấy danh sách student gắn với orderId này
    const students = await Student.find({ orderId: id }).lean();

    const mappedOrder = {
      ...order[0],
      students: students.map((s) => ({
        _id: s._id.toString(),
        productId: s.productId?.toString(),
        status: s.status,
        email: s.email,
      })),
      products: (order[0].products || []).map((prod: any) => {
        const matchingStudent = students.find(
          (s) => s.productId?.toString() === prod._id?.toString()
        );
        return {
          ...prod,
          student: matchingStudent
            ? {
                _id: matchingStudent._id.toString(),
                status: matchingStudent.status,
              }
            : null,
        };
      }),
    };

    return [mappedOrder];
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

  async getListOrder(options: {
    userId?: string;
    productId?: string;
    page?: number;
    limit?: number;
    sort?: { [key: string]: 1 | -1 };
  }) {
    // Thiết lập giá trị mặc định
    const {
      userId,
      productId,
      page = 1,
      limit = 15,
      sort = { orderDate: -1 },
    } = options;

    const skip = (page - 1) * limit;
    let query: any = {};

    // Xác định query dựa trên tham số đầu vào
    if (userId) {
      // Kiểm tra customer tồn tại
      const customer = await Customer.findOne({ _id: userId })
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
    const [orders, total] = await Promise.all([
      Order.find(query)
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
        .then((orders) =>
          orders.map((order) => ({
            ...order,
            customer: order.customerId,
            customerId: undefined,
          })),
        ),
      Order.countDocuments(query),
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
  }

  async createOrder({
    customerId,
    items,
    isVip = false,
  }: {
    customerId: string;
    items: { productId: string; selectedType: string }[];
    isVip?: boolean;
  }) {
    console.log("customerId", customerId);
    const foundCustomer = await Customer.findById(
      new mongoose.Types.ObjectId(customerId),
    )
      .select("-__v -createdAt -updatedAt")
      .lean();
    console.log("foundCustomer", foundCustomer);
    if (!foundCustomer) {
      throw new Error("Customer not found");
    }

    const foundListProductId = await Product.find({
      _id: { $in: items.map((item) => item.productId) },
    }).lean();

    if (foundListProductId.length !== items.length) {
      throw new Error("Some products not found");
    }

    // --- LOGIC MỚI: KIỂM TRA SINH VIÊN ĐÃ SỞ HỮU MÔN HỌC (COMPLETED HOẶC PENDING HOẶC VIP) CHƯA ---
    const existingCompletedStudents = await Student.find({
      email: foundCustomer.email.toLowerCase(),
      productId: { $in: items.map(item => item.productId) },
      status: { $in: ["completed", "pending", "vip"] }
    }).lean();

    if (existingCompletedStudents.length > 0) {
      throw new Error("Sinh viên này đã sở hữu hoặc đang chờ duyệt khóa học trong đơn. Vui lòng kiểm tra lại để tránh trùng lặp đơn hàng.");
    }
    // -------------------------------------------------------------------------

    const newOrder = await Order.create({
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
      const initialStudentStatus = isVip ? "vip" : "pending";
      // Thêm sinh viên cho mỗi sản phẩm trong đơn hàng
      const studentCreationPromises = items.map(async (item) =>
        StudentService.createStudent({
          email: foundCustomer.email,
          productId: item.productId,
          orderId: newOrder._id.toString(),
          status: initialStudentStatus,
        }),
      );

      await Promise.all(studentCreationPromises);
      console.log(
        `Đã thêm học sinh ${foundCustomer.email} (${initialStudentStatus}) vào các lớp học tương ứng`,
      );
    } catch (error) {
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
  }

  async updateOrder({
    id,
    customerId,
    items,
  }: {
    id: string;
    customerId: string;
    items: { productId: string; selectedType: string }[];
  }) {
    const foundOrder = await Order.findById(id).lean();
    if (!foundOrder) {
      throw new Error("Không tìm thấy đơn hàng");
    }

    const foundCustomer = await Customer.findById(customerId).lean();
    if (!foundCustomer) {
      throw new Error("Không tìm thấy khách hàng");
    }

    const foundListProductId = await Product.find({
      _id: { $in: items.map((item) => item.productId) },
    }).lean();

    if (foundListProductId.length !== items.length) {
      throw new Error("Một số sản phẩm không tồn tại");
    }

    return await Order.findByIdAndUpdate(
      id,
      {
        items: items.map((item) => ({
          productId: item.productId,
          type: item.selectedType,
        })),
        orderDate: new Date(),
      },
      { new: true },
    );
  }

  async updateStatusOrder(id: string, status: string) {
    if (status === "completed" || status === "pending") {
       const orderToUpdate = await Order.findById(id).lean();
       if (!orderToUpdate) throw new Error("Không tìm thấy đơn hàng");
       
       const foundCustomer = await Customer.findById(orderToUpdate.customerId).lean();
       if (foundCustomer) {
         // Kiểm tra xem sinh viên đã có vé học (do thêm bằng tay hoặc đơn khác) chưa
          const existingCompletedStudents = await Student.find({
            email: foundCustomer.email.toLowerCase(),
            productId: { $in: orderToUpdate.items.map(item => item.productId) },
            status: { $in: ["completed", "pending", "vip"] },
            orderId: { $ne: id as any } // Bỏ qua vé do chính đơn này tạo ra (nếu vé mang orderId hiện tại vẫn còn sống)
          }).lean();

         if (existingCompletedStudents.length > 0) {
           throw new Error("Khôi phục đơn thất bại: Khách hàng đã được cấp một hoặc nhiều khóa học trong đơn này (thêm bằng tay hoặc từ đơn khác).");
         }
       }
    }

    const orderUpdated = await Order.findByIdAndUpdate(id, { status }, { new: true });
    if (!orderUpdated) return null;
    
    // Nếu đơn bị huỷ thì xoá record học sinh đăng kí theo orderId đó
    if (status === "cancelled") {
      try {
        await StudentService.deleteStudentsByOrderId(id);
        console.log(`Đã hủy vé học tập cho đơn hàng ${id}`);
      } catch (e) {
        console.error("Lỗi khi hủy sinh viên theo mã Order: ", e);
      }
    } else if (status === "completed" || status === "pending") {
      try {
        // Đồng bộ trạng thái của đơn hàng sang Student
        const updateResult = await StudentService.updateStudentStatusByOrderId(id, status);
        
        // Nếu không có record nào được cập nhật, tức là đơn đã từng bị 'cancelled' và xoá mất sinh viên
        // Ta cần phục hồi lại các thẻ Học viên này
        if (updateResult.matchedCount === 0) {
           const foundCustomer = await Customer.findById(orderUpdated.customerId).lean();
           if (foundCustomer) {
             // Tái tạo lại student record cho các item
             const studentCreationPromises = orderUpdated.items.map(async (item) =>
               StudentService.createStudent({
                 email: foundCustomer.email,
                 productId: item.productId.toString(),
                 orderId: id,
                 status: status // Giữ đúng trạng thái mới của đơn
               })
             );
             await Promise.all(studentCreationPromises);
             console.log(`Đã tái tạo vé học tập thành ${status} cho đơn hàng ${id} (phục hồi sau huỷ)`);
           }
        } else {
           console.log(`Đã cập nhật vé học tập thành ${status} cho đơn hàng ${id}`);
        }
      } catch (e) {
        console.error("Lỗi khi cập nhật sinh viên theo mã Order: ", e);
      }
    }
    
    return orderUpdated;
  }

  async updateStudentStatusByOrderId(orderId: string, status: string) {
    return await StudentService.updateStudentStatusByOrderId(orderId, status);
  }

  async getCountOrder() {
    return await Order.countDocuments();
  }

  async getCountOrderByStatus(status: string) {
    return await Order.countDocuments({ status });
  }

  // tổng doanh thu theo status success
  async getTotalAmountOrderByStatusSuccess() {
    const result = await Order.aggregate([
      { $match: { status: "completed" } },
      { $group: { _id: null, totalAmount: { $sum: "$totalAmount" } } },
      { $project: { _id: 0, totalAmount: 1 } },
    ]);
    return result[0] || { totalAmount: 0 };
  }

  // Helper tính khoảng ngày theo múi giờ Việt Nam (GMT+7)
  private getVietnamDateRange() {
    const now = new Date();
    const formatter = new Intl.DateTimeFormat("en-CA", {
      timeZone: "Asia/Ho_Chi_Minh",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
    const todayStr = formatter.format(now); // "YYYY-MM-DD"
    // 00:00:00 hôm nay theo GMT+7
    const startOfToday = new Date(`${todayStr}T00:00:00+07:00`);
    const startOfTomorrow = new Date(startOfToday.getTime() + 24 * 60 * 60 * 1000);
    const startOfYesterday = new Date(startOfToday.getTime() - 24 * 60 * 60 * 1000);
    // 7 ngày gần nhất (tính cả hôm nay, tức lùi 6 ngày về trước)
    const startOf7DaysAgo = new Date(startOfToday.getTime() - 6 * 24 * 60 * 60 * 1000);

    return {
      todayStr,
      startOfToday,
      startOfTomorrow,
      startOfYesterday,
      startOf7DaysAgo,
    };
  }

  async getTotalAmountOrderByDate() {
    const { startOfToday, startOfTomorrow } = this.getVietnamDateRange();

    const result = await Order.aggregate([
      {
        $match: {
          orderDate: {
            $gte: startOfToday,
            $lt: startOfTomorrow,
          },
          status: "completed",
        },
      },
      { $group: { _id: null, totalAmount: { $sum: "$totalAmount" } } },
      { $project: { _id: 0, totalAmount: 1 } },
    ]);
    return result[0] || { totalAmount: 0 };
  }

  // tổng thu nhập hôm qua (theo giờ Việt Nam GMT+7)
  async getTotalAmountYesterday() {
    const { startOfYesterday, startOfToday } = this.getVietnamDateRange();

    const result = await Order.aggregate([
      {
        $match: {
          orderDate: {
            $gte: startOfYesterday,
            $lt: startOfToday,
          },
          status: "completed",
        },
      },
      { $group: { _id: null, totalAmount: { $sum: "$totalAmount" } } },
      { $project: { _id: 0, totalAmount: 1 } },
    ]);
    return result[0] || { totalAmount: 0 };
  }

  // Doanh thu 7 ngày gần nhất theo giờ Việt Nam GMT+7
  async getTotalAmountLast7Days() {
    const { startOf7DaysAgo, startOfTomorrow } = this.getVietnamDateRange();

    const result = await Order.aggregate([
      {
        $match: {
          orderDate: {
            $gte: startOf7DaysAgo,
            $lt: startOfTomorrow,
          },
          status: "completed",
        },
      },
      {
        $group: {
          _id: {
            $dateToString: {
              format: "%Y-%m-%d",
              date: "$orderDate",
              timezone: "+07:00",
            },
          },
          totalAmount: { $sum: "$totalAmount" },
        },
      },
      { $sort: { _id: 1 } },
      { $project: { date: "$_id", totalAmount: 1, _id: 0 } },
    ]);

    return result;
  }

  // Doanh thu 12 tháng gần nhất theo giờ Việt Nam GMT+7
  async getTotalAmountLast12Months() {
    const now = new Date();
    const twelveMonthsAgo = new Date(now);
    twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 12);

    const result = await Order.aggregate([
      {
        $match: {
          orderDate: { $gte: twelveMonthsAgo },
          status: "completed",
        },
      },
      {
        $group: {
          _id: {
            year: { $year: { date: "$orderDate", timezone: "+07:00" } },
            month: { $month: { date: "$orderDate", timezone: "+07:00" } },
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

  async getOrderByEmail(email: string) {
    // 1. Fetch Customer (Giữ nguyên vì đã tốt)
    const customer = await Customer.findOne({ email })
      .select("-__v -createdAt -updatedAt")
      .lean();

    if (!customer) {
      throw new Error("Customer not found");
    }

    // 2. Aggregation tối ưu
    const orders = await Order.aggregate([
      // Bước 1: Match chính xác, ép kiểu an toàn
      {
        $match: {
          customerId: new mongoose.Types.ObjectId(customer._id.toString()),
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
    const populatedOrders = orders.map((order) => ({
      ...order,
      customer: {
        name: customer.name,
        email: customer.email,
        avatar: customer.avatar,
      },
    }));

    console.log("orders", populatedOrders.length);

    return {
      customer,
      orders: populatedOrders, // Hoặc trả về 'orders' gốc nếu FE không cần customer lặp lại
    };
  }
}

export default new OrderService();
