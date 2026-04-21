import mongoose from "mongoose";

const uri = "mongodb://localhost:27017/google-auth";
// const uri = "mongodb://hmcuser:hmcuser1a123@157.10.199.146:27017/admin";
// const uri = "mongodb://nvtaikma:nvtaikma@172.17.0.1:27017/admin";

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
