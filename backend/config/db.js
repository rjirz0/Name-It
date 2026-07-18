import mongoose from "mongoose";

/**
 * Establishes a secure and stable connection to your MongoDB Atlas cluster.
 */
export const connectDB = async () => {
  const mongoURI = process.env.MONGODB_URl;

  if (!mongoURI) {
    console.error("❌ CRITICAL ERROR: The MONGODB_URl environment variable is not defined!");
    process.exit(1);
  }

  try {
    // Connect using Mongoose with robust options
    const conn = await mongoose.connect(mongoURI);
    
    console.log(`✅ MongoDB Connected Successfully: ${conn.connection.host}`);
    console.log(`📂 Active Database: ${conn.connection.name}`);
  } catch (error) {
    console.error(`❌ MongoDB Connection Failure: ${error.message}`);
    // Exits the process with failure if unable to connect
    process.exit(1);
  }
};
