import { Schema, model } from "mongoose";

const productSchema = new Schema(
  {
    name: { type: String, required: true, unique: true },
    status: { type: String, default: "active", enum: ["active", "inactive"] },
    image: {
      type: String,
      required: true,
      default:
        "https://ddfswlvvpvikrayszlls.supabase.co/storage/v1/object/public/image-quizizz/1752335106675-screenshot-2025-07-12-224447.png",
    },
    countQuestion: { type: Number, default: 0 },
    documentId: { type: String }, // ID của tài liệu Google Docs
  },
  {
    timestamps: true,
  }
);

// Lỗi ở đây là bạn đang sử dụng MongoClient thay vì model từ mongoose
// MongoClient được dùng để kết nối đến MongoDB
// Trong khi model được dùng để định nghĩa schema và tạo model trong mongoose
const Product = model("products", productSchema);

export default Product;
