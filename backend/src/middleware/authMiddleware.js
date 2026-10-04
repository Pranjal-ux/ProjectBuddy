import jwt from "jsonwebtoken";
import { User } from "../models/User.js";
import mongoose from "mongoose";
import { inMemoryUsers } from "../data/inMemoryStore.js";

const JWT_SECRET = process.env.JWT_SECRET || "projectbuddy_dev_secret_key_2026";

export const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer ")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      message: "Not authorized, no token provided",
    });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);

    if (mongoose.connection.readyState === 1) {
      req.user = await User.findById(decoded.id).select("-password");
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: "User not found or token invalid",
        });
      }
    } else {
      // Find in-memory user to populate full profile fields
      const memoryUser = inMemoryUsers.find(
        (u) =>
          u._id === decoded.id ||
          u.id === decoded.id ||
          (u.email && decoded.email && u.email === decoded.email) ||
          (u.handle && decoded.handle && u.handle === decoded.handle)
      );

      if (memoryUser) {
        req.user = { ...memoryUser };
      } else {
        req.user = {
          _id: decoded.id,
          id: decoded.id,
          name: decoded.name || "Developer",
          handle: decoded.handle || "@developer",
          email: decoded.email || "developer@projectbuddy.dev",
          role: "Fullstack Developer",
          bio: "",
          avatar: "",
          coverImage: "",
          initials: decoded.name ? decoded.name.slice(0, 2).toUpperCase() : "DEV",
          skills: ["JavaScript", "React"],
        };
      }
    }

    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Not authorized, token failed",
      error: error.message,
    });
  }
};

/**
 * Optional protection middleware:
 * Attaches req.user if a valid token is provided, but does not block requests if not.
 */
export const optionalProtect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer ")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token) {
    return next();
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);

    if (mongoose.connection.readyState === 1) {
      req.user = await User.findById(decoded.id).select("-password");
    } else {
      const memoryUser = inMemoryUsers.find(
        (u) =>
          u._id === decoded.id ||
          u.id === decoded.id ||
          (u.email && decoded.email && u.email === decoded.email) ||
          (u.handle && decoded.handle && u.handle === decoded.handle)
      );
      if (memoryUser) {
        req.user = { ...memoryUser };
      } else {
        req.user = decoded;
      }
    }
  } catch {
    // Ignore invalid token on optional endpoints
  }

  next();
};
