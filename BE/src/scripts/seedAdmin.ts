import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";
import Admin from "../modules/admin/admin.model";

dotenv.config({ path: path.join(__dirname, "../../.env") });

const seedAdmin = async () => {
  try {
    const mongoUri = process.env.MONGODB_URL || "mongodb://localhost:27017/google-auth";
    console.log(`Connecting to MongoDB at: ${mongoUri}`);
    await mongoose.connect(mongoUri);

    const defaultAdminEmail = "admin@hmc.com";
    const defaultPassword = "adminpassword123";

    // Check if admin already exists
    const existingAdmin = await Admin.findOne({ email: defaultAdminEmail });
    if (existingAdmin) {
      console.log(`Admin with email ${defaultAdminEmail} already exists.`);
    } else {
      // Create new admin
      const newAdmin = new Admin({
        email: defaultAdminEmail,
        password: defaultPassword,
        role: "admin",
      });
      await newAdmin.save();
      console.log(`Admin created successfully. Email: ${defaultAdminEmail}, Password: ${defaultPassword}`);
    }

    mongoose.disconnect();
    console.log("Database disconnected. Seed complete.");
  } catch (error) {
    console.error("Error seeding admin:", error);
    process.exit(1);
  }
};

seedAdmin();
