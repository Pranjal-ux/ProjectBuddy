import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { connectDB, getDbStatus } from "./config/db.js";
import joinRequestRoutes from "./routes/joinRequestRoutes.js";
import activityRoutes from "./routes/activityRoutes.js";
import authRoutes from "./routes/authRoutes.js";

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:3000",
    credentials: true,
  })
);
app.use(express.json());

// API Health & Status check
app.get("/api/health", (req, res) => {
  const dbStatus = getDbStatus();
  res.status(200).json({
    status: "ok",
    message: "ProjectBuddy Backend API is running smoothly",
    timestamp: new Date().toISOString(),
    database: {
      status: dbStatus.isConnected ? "connected" : "in-memory-fallback",
      readyState: dbStatus.readyState,
    },
  });
});

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/join-requests", joinRequestRoutes);
app.use("/api/activities", activityRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `API route not found: ${req.method} ${req.originalUrl}`,
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error("Server Error:", err);
  res.status(500).json({
    success: false,
    message: "An unexpected internal server error occurred",
    error: process.env.NODE_ENV === "development" ? err.message : undefined,
  });
});

// Start server and initialize database
const startServer = async () => {
  // Attempt MongoDB connection
  await connectDB();

  app.listen(PORT, () => {
    console.log(`\n======================================================`);
    console.log(`🚀 ProjectBuddy Backend running at: http://localhost:${PORT}`);
    console.log(`📡 Health Check: http://localhost:${PORT}/api/health`);
    console.log(`📋 Join Requests API: http://localhost:${PORT}/api/join-requests`);
    console.log(`⚡ Activities API: http://localhost:${PORT}/api/activities`);
    console.log(`======================================================\n`);
  });
};

startServer();
