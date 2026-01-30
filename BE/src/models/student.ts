import { Schema, model } from "mongoose";

const studentSchema = new Schema(
  {
    email: { type: String, required: true, lowercase: true },
    productId: { type: Schema.Types.ObjectId, ref: "Product" },
    status: {
      type: String,
      enum: ["completed", "pending", "expired"],
      default: "pending",
    },
  },
  { timestamps: true }
);

const Student = model("Student", studentSchema);

export default Student;
