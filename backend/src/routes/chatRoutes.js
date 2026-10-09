import express from "express";
import {
  getConversations,
  getMessages,
  sendMessage,
  startConversation,
  markMessagesAsSeen,
} from "../controllers/chatController.js";

const router = express.Router();

// GET /api/chat/conversations
router.get("/conversations", getConversations);

// POST /api/chat/conversations/start
router.post("/conversations/start", startConversation);

// GET /api/chat/conversations/:id/messages
router.get("/conversations/:id/messages", getMessages);

// POST /api/chat/conversations/:id/messages
router.post("/conversations/:id/messages", sendMessage);

// PATCH /api/chat/conversations/:id/seen
router.patch("/conversations/:id/seen", markMessagesAsSeen);

export default router;
