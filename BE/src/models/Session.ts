import mongoose, { Schema, Document } from "mongoose";

export interface ISession extends Document {
  userId: mongoose.Types.ObjectId;
  token: string;
  clientId: string;
  deviceInfo: {
    userAgent?: string;
    ip?: string;
    deviceName?: string;
    browser?: string;
    os?: string;
  };
  isActive: boolean;
  isCurrentDevice: boolean;
  lastActive: Date;
  expiresAt: Date;
  createdAt: Date;
  logoutAt?: Date | null;
  logoutReason?: string | null; // "manual" | "kicked" | "expired" | "password_reset"
}

const sessionSchema = new Schema<ISession>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    token: {
      type: String,
      required: true,
      unique: true,
    },
    clientId: {
      type: String,
      required: true,
      index: true,
    },
    deviceInfo: {
      userAgent: String,
      ip: String,
      deviceName: String,
      browser: String,
      os: String,
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
    isCurrentDevice: {
      type: Boolean,
      default: false,
    },
    lastActive: {
      type: Date,
      default: Date.now,
    },
    expiresAt: {
      type: Date,
      required: true,
      index: true,
    },
    logoutAt: {
      type: Date,
      default: null,
    },
    logoutReason: {
      type: String,
      enum: ["manual", "kicked", "expired", "password_reset", null],
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes cho query hiệu quả
sessionSchema.index({ userId: 1, isActive: 1 });
sessionSchema.index({ userId: 1, createdAt: -1 }); // Lịch sử đăng nhập (mới nhất trước)

export default mongoose.model<ISession>("Session", sessionSchema);
