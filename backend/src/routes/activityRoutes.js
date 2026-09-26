import express from "express";
import {
  getActivities,
  seedActivities,
} from "../controllers/activityController.js";
import { respondToJoinRequest } from "../controllers/joinRequestController.js";

const router = express.Router();

// GET /api/activities
router.get("/", getActivities);

// POST /api/activities/seed
router.post("/seed", seedActivities);

// PATCH /api/activities/:id/respond
router.patch("/:id/respond", respondToJoinRequest);

export default router;
