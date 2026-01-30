import mongoose from "mongoose";
import Session, { ISession } from "../models/Session";

class SessionService {
  async getSessionByUserId({ userId }: { userId: string }) {
    // chuyển userId thành objectId
    const userIdObjectId = new mongoose.Types.ObjectId(userId);
    console.log(userIdObjectId);
    const session = await Session.find({ userId: userIdObjectId })
      .sort({
        createdAt: -1,
      })
      .select(
        "-__v -updatedAt -_id -expiresAt -token -clientId  -isActive -isCurrentDevice -lastActive"
      )
      .lean();
    return session;
  }
}

export default new SessionService();
