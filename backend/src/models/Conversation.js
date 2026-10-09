import mongoose from "mongoose";

const ConversationSchema = new mongoose.Schema(
  {
    _id: {
      type: String,
      default: () => `chat-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    },
    participants: {
      type: [String],
      required: true,
      index: true,
    },
    participantDetails: [
      {
        name: { type: String, default: "" },
        handle: { type: String, required: true },
        avatar: { type: String, default: "" },
        role: { type: String, default: "" },
        initials: { type: String, default: "" },
      },
    ],
    project: {
      type: String,
      default: "",
    },
    lastMessage: {
      type: String,
      default: "",
    },
    lastMessageAt: {
      type: Date,
      default: Date.now,
    },
    unreadCounts: {
      type: Map,
      of: Number,
      default: {},
    },
  },
  { timestamps: true }
);

export const Conversation = mongoose.model("Conversation", ConversationSchema);
