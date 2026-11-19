import mongoose from "mongoose";

// Tự động dùng DB Production khi build Docker (NODE_ENV=production), dùng Localhost khi code ở máy
const PROD_URI = "mongodb://hmcuser:hmcuser1a123@103.162.20.159:27017/admin";
const LOCAL_URI = "mongodb://localhost:27017/google-auth";

const uri =
  process.env.MONGODB_URI ||
  (process.env.NODE_ENV === "production" ? PROD_URI : LOCAL_URI);

async function connectDB() {
  try {
    await mongoose.connect(uri, {
      autoIndex: true,
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
      family: 4,
    });
    console.log("Kết nối MongoDB thành công!");
  } catch (error) {
    console.log("Lỗi kết nối MongoDB:", error);
    process.exit(1);
  }
}

export default connectDB;
