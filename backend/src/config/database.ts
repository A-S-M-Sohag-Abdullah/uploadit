import mongoose from "mongoose";

export const connectDB = async (): Promise<void> => {
  try {
    const mongoUri =
      process.env.MONGODB_URI || "mongodb://localhost:27017/uploadit";

    await mongoose.connect(mongoUri, {
      family: 4, // Force IPv4
    });
    console.log("✅ MongoDB connected successfully");

    mongoose.connection.on("error", (error) => {
      console.error("❌ MongoDB connection error:", error);
    });

    mongoose.connection.on("disconnected", () => {
      console.log("⚠️  MongoDB disconnected");
    });
  } catch (error) {
    console.error("❌ Failed to connect to MongoDB:", error);
    process.exit(1);
  }
};
