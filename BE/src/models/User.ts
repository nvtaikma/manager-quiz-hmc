import mongoose, { Schema, Document } from "mongoose";

// Định nghĩa interface cho model User
export interface IUser extends Document {
  googleId?: string;
  email: string;
  displayName: string;
  firstName?: string;
  lastName?: string;
  profilePhoto?: string;
  password?: string; // Thêm trường password cho đăng nhập bằng email
  activeToken: string | null;
  lastActiveDevice?: string; // Lưu trữ clientId của thiết bị đăng nhập mới nhất
  createdAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

const userSchema = new Schema<IUser>({
  googleId: {
    type: String,
    // required: true,
    unique: true,
    sparse: true, // Cho phép multiple null values
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  displayName: {
    type: String,
    required: true,
  },
  firstName: String,
  lastName: String,
  profilePhoto: String,
  password: {
    type: String,
    // Password sẽ required khi không có googleId
  },
  activeToken: {
    type: String,
    default: null,
  },
  lastActiveDevice: {
    type: String,
    default: null,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.model<IUser>("User", userSchema);
