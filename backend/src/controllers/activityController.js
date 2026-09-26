import mongoose from "mongoose";
import { Activity } from "../models/Activity.js";
import { inMemoryActivities } from "./joinRequestController.js";

const sampleActivities = [
  {
    type: "join_request",
    user: "Sarah Chen",
    handle: "@schen",
    initials: "SC",
    action: "requested to join your team for",
    target: "AI Pothole Detection System",
    role: "Python Developer / Inference",
    recipientHandle: "@pranjal",
    hasAction: true,
    status: "pending",
  },
  {
    type: "like",
    user: "Alex Rivera",
    handle: "@arivera",
    initials: "AR",
    action: "liked your project",
    target: "AI Pothole Detection System",
    recipientHandle: "@pranjal",
    hasAction: false,
    status: "none",
  },
  {
    type: "star",
    user: "Elena Rostova",
    handle: "@elena_codes",
    initials: "ER",
    action: "bookmarked your code snippet",
    target: "tokens.config.css",
    recipientHandle: "@pranjal",
    hasAction: false,
    status: "none",
  },
  {
    type: "collab",
    user: "Rahul Sharma",
    handle: "@rahul",
    initials: "RS",
    action: "invited you to collaborate on",
    target: "AI Resume Analyzer & Matchmaker",
    role: "Lead Fullstack Reviewer",
    recipientHandle: "@pranjal",
    hasAction: true,
    status: "pending",
  },
];

const isDbReady = () => mongoose.connection.readyState === 1;

/**
 * @desc Get all activities / notifications
 * @route GET /api/activities
 */
export const getActivities = async (req, res) => {
  try {
    const { recipientHandle = "@pranjal" } = req.query;

    if (isDbReady()) {
      let activities = await Activity.find({
        recipientHandle,
      }).sort({ createdAt: -1 });

      // If empty in MongoDB, seed initial activities
      if (activities.length === 0) {
        activities = await Activity.insertMany(sampleActivities);
      }

      return res.status(200).json({
        success: true,
        source: "mongodb",
        count: activities.length,
        data: activities,
      });
    } else {
      return res.status(200).json({
        success: true,
        source: "in-memory",
        count: inMemoryActivities.length,
        data: inMemoryActivities,
      });
    }
  } catch (error) {
    console.error("Error in getActivities:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch activities",
      error: error.message,
    });
  }
};

/**
 * @desc Seed initial activities
 * @route POST /api/activities/seed
 */
export const seedActivities = async (req, res) => {
  try {
    if (isDbReady()) {
      await Activity.deleteMany({});
      const seeded = await Activity.insertMany(sampleActivities);
      return res.status(201).json({
        success: true,
        message: "Activities seeded in MongoDB successfully",
        data: seeded,
      });
    } else {
      return res.status(200).json({
        success: true,
        message: "Activities reset in in-memory storage",
        data: inMemoryActivities,
      });
    }
  } catch (error) {
    console.error("Error seeding activities:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to seed activities",
      error: error.message,
    });
  }
};
