import express from "express";
import {
  getConversations,
  getMessages,
  sendMessage,
  startConversation,
  markMessagesAsSeen,
  getOnlineUsers,
  sendHeartbeat,
  setStatusOffline,
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

// GET /api/chat/online-users
router.get("/online-users", getOnlineUsers);

// POST /api/chat/heartbeat
router.post("/heartbeat", sendHeartbeat);

// POST /api/chat/status/offline
router.post("/status/offline", setStatusOffline);

export default router;
