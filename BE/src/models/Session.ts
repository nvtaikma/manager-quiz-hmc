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
  },
  {
    timestamps: true,
  }
);

// Đánh chỉ mục phức hợp để truy vấn nhanh hơn
sessionSchema.index({ userId: 1, clientId: 1 });
sessionSchema.index({ userId: 1, isActive: 1 });

export default mongoose.model<ISession>("Session", sessionSchema);
