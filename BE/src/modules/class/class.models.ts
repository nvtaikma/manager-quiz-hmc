import mongoose, { Schema, Document } from "mongoose";

export interface IClass extends Document {
  name: string;
  lastTimetableUpdate?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const ClassSchema: Schema = new Schema(
  {
    name: { type: String, required: true, unique: true, trim: true },
    lastTimetableUpdate: { type: Date },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model<IClass>("Class", ClassSchema);
