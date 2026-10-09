import mongoose from "mongoose";
import { Activity } from "../models/Activity.js";
import { inMemoryActivities } from "./joinRequestController.js";

const isDbReady = () => mongoose.connection.readyState === 1;

/**
 * @desc Get all activities / notifications
 * @route GET /api/activities
 */
export const getActivities = async (req, res) => {
  try {
    const { recipientHandle } = req.query;

    if (isDbReady()) {
      const filter = {};
      if (recipientHandle) {
        filter.recipientHandle = new RegExp(`^${recipientHandle}$`, "i");
      }

      const activities = await Activity.find(filter).sort({ createdAt: -1 });

      return res.status(200).json({
        success: true,
        source: "mongodb",
        count: activities.length,
        data: activities,
      });
    } else {
      let data = [...inMemoryActivities];
      if (recipientHandle) {
        data = data.filter(
          (a) =>
            a.recipientHandle &&
            a.recipientHandle.toLowerCase() === recipientHandle.toLowerCase()
        );
      }

      return res.status(200).json({
        success: true,
        source: "in-memory",
        count: data.length,
        data,
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
 * @desc Clear activities / reset storage
 * @route POST /api/activities/seed
 */
export const seedActivities = async (req, res) => {
  try {
    if (isDbReady()) {
      await Activity.deleteMany({});
      return res.status(200).json({
        success: true,
        message: "Activities cleared from MongoDB successfully",
        data: [],
      });
    } else {
      inMemoryActivities.length = 0;
      return res.status(200).json({
        success: true,
        message: "Activities reset in in-memory storage",
        data: [],
      });
    }
  } catch (error) {
    console.error("Error clearing activities:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to clear activities",
      error: error.message,
    });
  }
};
