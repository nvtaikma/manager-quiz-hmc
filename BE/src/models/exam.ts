import { Schema, model } from "mongoose";

const examSchema = new Schema(
  {
    productId: {
      type: Schema.Types.ObjectId,
      ref: "products",
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    description: {
      type: String,
    },
    duration: {
      type: Number,
      required: true,
      default: 45,
      min: 1,
    }, // thời gian tính bằng phút
    status: {
      type: String,
      enum: ["active", "inactive", "draft"],
      default: "active",
    },
    count: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

const Exam = model("Exam", examSchema);

export default Exam;
