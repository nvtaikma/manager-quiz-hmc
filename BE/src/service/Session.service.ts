import mongoose from "mongoose";
import Session, { ISession } from "../models/Session";
import redis from "../dbs/redis";

class SessionService {
  async getSessionByUserId({ userId }: { userId: string }) {
   // src/service/customers.service.ts


    if (!userId) return null;
    
    // 1. Từ ID user -> Lấy Active Token
    const token = await redis.get(`user_active_token:${userId}`);
    if (!token) return null;

    // 2. Từ Token -> Lấy thông tin Session (JWT detail)
    const sessionData = await redis.get(`session:${token}`);
    
    // 3. Trả về thông tin cho giao diện
    return sessionData ? JSON.parse(sessionData) : null;
  
  }
}

export default new SessionService();
