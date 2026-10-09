import mongoose from "mongoose";

const MessageSchema = new mongoose.Schema(
  {
    conversationId: {
      type: String,
      required: true,
      index: true,
    },
    senderHandle: {
      type: String,
      required: true,
      index: true,
    },
    senderName: {
      type: String,
      default: "",
    },
    senderAvatar: {
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
      default: () =>
        new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    },
    status: {
      type: String,
      enum: ["sent", "delivered", "seen"],
      default: "sent",
    },
    seen: {
      type: Boolean,
      default: false,
    },
    seenAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

export const Message = mongoose.model("Message", MessageSchema);
