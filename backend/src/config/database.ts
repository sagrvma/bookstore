import mongoose from "mongoose";

const connectToDB = async (): Promise<void> => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI as string);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.log("Database connection error: ", error);
    process.exit(1);
  }
};

export default connectToDB;
