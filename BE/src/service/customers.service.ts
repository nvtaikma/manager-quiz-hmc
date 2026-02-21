import Customer from "../models/customers";
import User from "../models/User";
import Session from "../models/Session";
import redis from "../dbs/redis";

class CustomersService {
  async createCustomer({ name, email }: { name: string; email: string }) {
    const normalizedEmail = email.toLowerCase();
    const foundCustomer = await Customer.findOne({ email: normalizedEmail })
      .select("-__v -createdAt -updatedAt -status")
      .lean();
    if (foundCustomer) {
      return foundCustomer;
    }
    const newCustomer = await Customer.create({ name, email: normalizedEmail });
    return {
      _id: newCustomer._id,
      name: newCustomer.name,
      email: newCustomer.email,
      avatar: newCustomer.avatar,
      count: newCustomer.count,
    };
  }

  async getListCustomer(page: number = 1) {
    const limit = 15;
    const skip = (page - 1) * limit;
    const [customers, total] = await Promise.all([
      Customer.find()
        .sort({ createdAt: -1 })
        .select("-__v -createdAt -updatedAt")
        .skip(skip)
        .limit(limit)
        .lean(),
      Customer.countDocuments(),
    ]);
    return {
      customers,
      pagination: {
        total,
        page,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async updateCustomer({
    id,
    name,
    email,
  }: {
    id: string;
    name: string;
    email: string;
  }) {
    return await Customer.findByIdAndUpdate(id, { name, email }, { new: true });
  }

  async updateStatusCustomer(id: string, status: "active" | "inactive") {
    return await Customer.findByIdAndUpdate(id, { status }, { new: true });
  }

  async searchCustomer(keyword: string, page: number = 1) {
    const limit = 15;
    const skip = (page - 1) * limit;
    const [customers, total] = await Promise.all([
      Customer.find({
        $or: [
          { name: { $regex: keyword, $options: "i" } },
          { email: { $regex: keyword, $options: "i" } },
        ],
      })
        .select("-__v -createdAt -updatedAt")
        .skip(skip)
        .limit(limit)
        .lean(),
      Customer.countDocuments({
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
  }

  async getCountCustomerActive() {
    return await Customer.countDocuments({ status: "active" });
  }

  async getCountCustomerInactive() {
    return await Customer.countDocuments({ status: "inactive" });
  }

  async getCountCustomerOnline() {
    try {
      const keys = await redis.keys("online:user:*");
      return keys.length;
    } catch (error) {
      console.error("Error fetching online users from Redis:", error);
      return 0; // Trả về 0 nếu có lỗi Redis
    }
  }

  async getCustomerSession(customerId: string) {
    if (!customerId) return null;
    
    // 1. Find Customer to get email
    const customer = await Customer.findById(customerId);
    if (!customer || !customer.email) return null;

    // 2. Find User by email to get Auth ID
    const user = await User.findOne({ email: customer.email });
    if (!user) return null;
    
    const userId = user?._id?.toString();

    // 3. Check if user is online based on Redis key
    const isOnline = await redis.exists(`online:user:${userId}`);

    // 4. Lấy lịch sử phiên đăng nhập từ MongoDB
    // Lấy tối đa 50 phiên đăng nhập gần nhất
    const sessionHistory = await Session.find({ userId: userId })
      .sort({ createdAt: -1 })
      .limit(50)
      .lean();

    // 5. Nếu cần thông tin Active Session chi tiết trong cache
    const activeToken = await redis.get(`user_active_token:${userId}`);
    let activeSessionRedis = null;
    if (activeToken) {
       const sessionData = await redis.get(`session:${activeToken}`);
       if (sessionData) {
         activeSessionRedis = JSON.parse(sessionData);
       }
    }

    return {
       isOnline: isOnline === 1,
       activeSessionRedis,
       sessionHistory
    };
  }
}

export default new CustomersService();
