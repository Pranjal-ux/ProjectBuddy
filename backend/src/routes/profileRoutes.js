import express from "express";
import {
  getMyProfile,
  updateMyProfile,
  getUserProfile,
  getUserProjects,
  getUserActivities,
  getUserStats,
  updateAvatar,
  deleteAvatar,
  updateCoverImage,
  deleteCoverImage,
  updateSkills,
  searchDevelopers,
} from "../controllers/profileController.js";
import { protect, optionalProtect } from "../middleware/authMiddleware.js";

const router = express.Router();

// Current authenticated user routes
router.get("/me", protect, getMyProfile);
router.put("/me", protect, updateMyProfile);
router.post("/me/avatar", protect, updateAvatar);
router.delete("/me/avatar", protect, deleteAvatar);
router.post("/me/cover", protect, updateCoverImage);
router.delete("/me/cover", protect, deleteCoverImage);
router.put("/me/skills", protect, updateSkills);

// Developer discovery / search
router.get("/search", searchDevelopers);

// Public / user profile inspection routes (by handle @handle or ID)
router.get("/:identifier", optionalProtect, getUserProfile);
router.get("/:identifier/projects", getUserProjects);
router.get("/:identifier/activities", getUserActivities);
router.get("/:identifier/stats", getUserStats);

export default router;
