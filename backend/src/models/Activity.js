import mongoose from "mongoose";

const activitySchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ["join_request", "like", "star", "collab", "mention"],
      required: true,
      default: "join_request",
    },
    user: {
      type: String,
      required: true,
      trim: true,
    },
    handle: {
      type: String,
      required: true,
      trim: true,
    },
    initials: {
      type: String,
      default: "DEV",
    },
    action: {
      type: String,
      required: true,
      default: "requested to join your team for",
    },
    target: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      default: "",
    },
    recipientHandle: {
      type: String,
      required: true,
      default: "@pranjal",
      index: true,
    },
    joinRequestId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "JoinRequest",
      default: null,
    },
    customId: {
      type: String,
      default: null,
      index: true,
    },
    hasAction: {
      type: Boolean,
      default: true,
    },
    status: {
      type: String,
      enum: ["pending", "accepted", "declined", "none"],
      default: "pending",
    },
  },
  {
    timestamps: true,
  }
);

export const Activity =
  mongoose.models.Activity || mongoose.model("Activity", activitySchema);
