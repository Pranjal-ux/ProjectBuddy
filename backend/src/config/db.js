import mongoose from "mongoose";

let isConnected = false;

export const connectDB = async () => {
  const mongoUri = process.env.MONGO_URI;

  if (!mongoUri || mongoUri.includes("<username>") || mongoUri.includes("admin:password@cluster0")) {
    console.warn(
      "\n⚠️ [MongoDB] Placeholder or invalid MONGO_URI detected in backend/.env."
    );
    console.warn(
      "👉 To connect your MongoDB Atlas free tier cluster:"
    );
    console.warn(
      "   1. Go to MongoDB Atlas (https://cloud.mongodb.com)"
    );
    console.warn(
      "   2. Click 'Connect' -> 'Drivers' (Node.js)"
    );
    console.warn(
      "   3. Copy the connection string and paste it into backend/.env (replace <password> with your DB user password)"
    );
    console.warn(
      "   Backend is running in in-memory fallback mode until MongoDB Atlas is configured!\n"
    );
    return false;
  }

  try {
    const conn = await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 5000,
    });
    isConnected = true;
    console.log(`✅ [MongoDB] Connected successfully to host: ${conn.connection.host}`);
    return true;
  } catch (error) {
    console.error(`❌ [MongoDB] Connection error: ${error.message}`);
    console.warn(
      "💡 Tip: Ensure your IP address is whitelisted in MongoDB Atlas Network Access (e.g. 0.0.0.0/0 for dev)."
    );
    return false;
  }
};

export const getDbStatus = () => ({
  isConnected: mongoose.connection.readyState === 1 || isConnected,
  readyState: mongoose.connection.readyState,
});
