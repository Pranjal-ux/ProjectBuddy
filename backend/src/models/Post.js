import mongoose from "mongoose";

const commentSchema = new mongoose.Schema(
  {
    id: {
      type: String,
      required: true,
      default: () => `c-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
    },
    author: {
      type: String,
      required: true,
      trim: true,
    },
    handle: {
      type: String,
      required: true,
      trim: true,
    },
    avatar: {
      type: String,
      default: "",
    },
    text: {
      type: String,
      required: true,
      trim: true,
    },
    time: {
      type: String,
      default: "Just now",
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: false }
);

const postSchema = new mongoose.Schema(
  {
    customId: {
      type: String,
      unique: true,
      sparse: true,
      index: true,
    },
    author: {
      name: {
        type: String,
        required: true,
      },
      handle: {
        type: String,
        required: true,
        index: true,
      },
      avatarUrl: {
        type: String,
        default: "",
      },
      fallback: {
        type: String,
        default: "DEV",
      },
      verified: {
        type: Boolean,
        default: false,
      },
      role: {
        type: String,
        default: "Developer",
      },
    },
    type: {
      type: String,
      enum: ["project", "telemetry", "code", "discussion"],
      default: "project",
    },
    title: {
      type: String,
      default: "",
      trim: true,
    },
    content: {
      type: String,
      required: true,
    },
    tags: {
      type: [String],
      default: [],
      index: true,
    },
    team: {
      current: { type: Number, default: 1 },
      max: { type: Number, default: 4 },
      lookingFor: { type: [String], default: [] },
    },
    telemetry: {
      filename: { type: String, default: "" },
      spec: { type: String, default: "" },
      description: { type: String, default: "" },
      imageUrl: { type: String, default: "" },
    },
    codeSnippet: {
      filename: { type: String, default: "" },
      language: { type: String, default: "javascript" },
      code: { type: String, default: "" },
    },
    stats: {
      likes: { type: Number, default: 0 },
      comments: { type: Number, default: 0 },
      reposts: { type: Number, default: 0 },
      bookmarks: { type: Number, default: 0 },
      shares: { type: Number, default: 0 },
    },
    likedBy: {
      type: [String],
      default: [],
      index: true,
    },
    bookmarkedBy: {
      type: [String],
      default: [],
      index: true,
    },
    repostedBy: {
      type: [String],
      default: [],
      index: true,
    },
    commentsList: {
      type: [commentSchema],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

export const Post = mongoose.models.Post || mongoose.model("Post", postSchema);
