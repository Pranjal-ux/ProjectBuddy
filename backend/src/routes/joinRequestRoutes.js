import express from "express";
import {
  createJoinRequest,
  getJoinRequests,
  respondToJoinRequest,
} from "../controllers/joinRequestController.js";

const router = express.Router();

// GET /api/join-requests
router.get("/", getJoinRequests);

// POST /api/join-requests
router.post("/", createJoinRequest);

// PATCH /api/join-requests/:id/respond
router.patch("/:id/respond", respondToJoinRequest);

export default router;
