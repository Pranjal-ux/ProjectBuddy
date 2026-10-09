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
  toggleFollowUser,
  getFollowers,
  getFollowing,
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

// Cleanup dummy users and posts
router.post("/cleanup-dummy", async (req, res) => {
  try {
    const { seedDatabase } = await import("../utils/seedData.js");
    await seedDatabase();
    return res.status(200).json({ success: true, message: "Dummy data purged successfully" });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// Follow / Following system
router.post("/:identifier/follow", optionalProtect, toggleFollowUser);
router.delete("/:identifier/follow", optionalProtect, toggleFollowUser);
router.get("/:identifier/followers", optionalProtect, getFollowers);
router.get("/:identifier/following", optionalProtect, getFollowing);

// Public / user profile inspection routes (by handle @handle or ID)
router.get("/:identifier", optionalProtect, getUserProfile);
router.get("/:identifier/projects", getUserProjects);
router.get("/:identifier/activities", getUserActivities);
router.get("/:identifier/stats", getUserStats);

export default router;
