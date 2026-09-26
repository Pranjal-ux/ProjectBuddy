import mongoose from "mongoose";

const joinRequestSchema = new mongoose.Schema(
  {
    projectId: {
      type: String,
      required: true,
      index: true,
    },
    projectTitle: {
      type: String,
      required: true,
      trim: true,
    },
    projectAuthorName: {
      type: String,
      default: "Project Creator",
    },
    projectAuthorHandle: {
      type: String,
      required: true,
      index: true,
    },
    applicantName: {
      type: String,
      required: true,
      trim: true,
    },
    applicantHandle: {
      type: String,
      required: true,
      trim: true,
    },
    applicantInitials: {
      type: String,
      default: "DEV",
    },
    applicantAvatar: {
      type: String,
      default: "",
    },
    role: {
      type: String,
      required: true,
      trim: true,
    },
    githubUrl: {
      type: String,
      default: "",
      trim: true,
    },
    pitch: {
      type: String,
      required: true,
      trim: true,
    },
    status: {
      type: String,
      enum: ["pending", "accepted", "declined"],
      default: "pending",
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

export const JoinRequest =
  mongoose.models.JoinRequest || mongoose.model("JoinRequest", joinRequestSchema);
