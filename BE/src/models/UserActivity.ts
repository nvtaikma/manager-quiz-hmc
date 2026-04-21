import mongoose, { Schema, Document } from "mongoose";

export interface IUserActivity extends Document {
  userId: string;       // Auth User ID từ Redis key: online:user:{userId}
  date: Date;           // Chuẩn hóa về 00:00:00 GMT+7 (UTC store)
  activities: Date[];   // Mảng timestamps mỗi lần cron bắt được user online
}

const userActivitySchema = new Schema<IUserActivity>(
  {
    userId: {
      type: String,
      required: true,
      index: true,
    },
    date: {
      type: Date,
      required: true,
    },
    activities: [{ type: Date }],
  },
  { timestamps: true }
);

// Compound unique index: mỗi user chỉ có 1 document/ngày → dùng cho upsert
userActivitySchema.index({ userId: 1, date: 1 }, { unique: true });

// TTL index: MongoDB tự xóa document sau 30 ngày kể từ trường `date`
// 2592000 giây = 30 ngày (nâng từ 7 ngày để admin xem lịch sử lâu hơn)
// NOTE: Nếu thay đổi TTL trên DB đã có index, cần chạy:
//   db.useractivities.dropIndex("date_1") rồi để Mongoose tạo lại
userActivitySchema.index({ date: 1 }, { expireAfterSeconds: 2592000 });

export default mongoose.model<IUserActivity>("UserActivity", userActivitySchema);
