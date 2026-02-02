import mongoose, { Schema, Document } from "mongoose";

export interface IClass extends Document {
  name: string;
  createdAt: Date;
  updatedAt: Date;
}

const ClassSchema: Schema = new Schema(
  {
    name: { type: String, required: true, unique: true, trim: true },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model<IClass>("Class", ClassSchema);
