import mongoose, { Schema, Document } from "mongoose";
import bcrypt from "bcryptjs";

export interface IAdmin extends Document {
  email: string;
  password?: string; // Optional because we might exclude it in queries
  role: "admin" | "teacher";
  comparePassword(candidatePassword: string): Promise<boolean>;
  createdAt: Date;
  updatedAt: Date;
}

const AdminSchema: Schema = new Schema(
  {
    email: { type: String, required: true, unique: true, trim: true, lowercase: true },
    password: { type: String, required: true },
    role: { type: String, enum: ["admin", "teacher"], default: "teacher", required: true },
  },
  {
    timestamps: true,
  }
);

// Hash the password before saving
AdminSchema.pre<IAdmin>("save", async function (next) {
  if (!this.isModified("password")) return next();
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password as string, salt);
    next();
  } catch (err: any) {
    next(err);
  }
});

// Method to compare password
AdminSchema.methods.comparePassword = async function (candidatePassword: string): Promise<boolean> {
  return await bcrypt.compare(candidatePassword, this.password as string);
};

export default mongoose.model<IAdmin>("Admin", AdminSchema);
