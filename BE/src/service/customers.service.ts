import Customer from "../models/customers";

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
}

export default new CustomersService();
