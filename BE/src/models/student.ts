import { Schema, model } from "mongoose";

const studentSchema = new Schema(
  {
    email: { type: String, required: true, lowercase: true },
    productId: { type: Schema.Types.ObjectId, ref: "products" },
    orderId: { type: Schema.Types.ObjectId, ref: "Order" }, // Cột mới để liên kết theo sát đơn hàng
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
