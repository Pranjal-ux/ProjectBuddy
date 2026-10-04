import express from "express";
import {
  getPosts,
  createPost,
  toggleLike,
  toggleBookmark,
  getBookmarks,
  addComment,
  getComments,
  recordShare,
} from "../controllers/postController.js";
import { optionalProtect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", optionalProtect, getPosts);
router.post("/", optionalProtect, createPost);
router.get("/bookmarks", optionalProtect, getBookmarks);

router.post("/:id/like", optionalProtect, toggleLike);
router.post("/:id/bookmark", optionalProtect, toggleBookmark);
router.get("/:id/comments", getComments);
router.post("/:id/comments", optionalProtect, addComment);
router.post("/:id/share", recordShare);

export default router;
