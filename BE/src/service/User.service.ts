import User from "../models/User";

class UserService {
  async getUserByEmail({ email }: { email: string }) {
    const normalizedEmail = email.toLowerCase();
    const user = await User.findOne({ email: normalizedEmail })
      .select("_id")
      .lean();
    return user;
  }
}

export default new UserService();
