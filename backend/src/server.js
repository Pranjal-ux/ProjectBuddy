import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { connectDB, getDbStatus } from "./config/db.js";
import { seedDatabase } from "./utils/seedData.js";
import joinRequestRoutes from "./routes/joinRequestRoutes.js";
import activityRoutes from "./routes/activityRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import profileRoutes from "./routes/profileRoutes.js";
import postRoutes from "./routes/postRoutes.js";
import chatRoutes from "./routes/chatRoutes.js";

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

const allowedOrigins = [
  "http://localhost:3000",
  "http://localhost:3001",
  "http://127.0.0.1:3000",
  "http://127.0.0.1:3001",
  process.env.CLIENT_URL,
].filter(Boolean);

// Middleware
app.use(
  cors({
    origin: true, // Allow request origin reflection for localhost, 127.0.0.1, LAN
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With", "Accept"],
    optionsSuccessStatus: 200,
  })
);
app.options("*", cors());
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Root & Health check handlers (supports /, /health, and /api/health)
const sendHealthStatus = (req, res) => {
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
};

app.get("/", sendHealthStatus);
app.get("/health", sendHealthStatus);
app.get("/api/health", sendHealthStatus);

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/profile", profileRoutes);
app.use("/api/posts", postRoutes);
app.use("/api/join-requests", joinRequestRoutes);
app.use("/api/activities", activityRoutes);
app.use("/api/chat", chatRoutes);

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
  await seedDatabase();

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`\n======================================================`);
    console.log(`🚀 ProjectBuddy Backend running at: http://localhost:${PORT}`);
    console.log(`📡 Health Check: http://localhost:${PORT}/api/health`);
    console.log(`👤 Profile API: http://localhost:${PORT}/api/profile`);
    console.log(`📝 Posts API: http://localhost:${PORT}/api/posts`);
    console.log(`📋 Join Requests API: http://localhost:${PORT}/api/join-requests`);
    console.log(`⚡ Activities API: http://localhost:${PORT}/api/activities`);
    console.log(`======================================================\n`);
  });
};

startServer();
