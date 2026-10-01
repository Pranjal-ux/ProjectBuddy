import express from "express";
import {
  registerUser,
  verifyRegistrationOtp,
  resendRegistrationOtp,
  loginUser,
  getMe,
  updateProfile,
  googleAuth,
} from "../controllers/authController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/register", registerUser);
router.post("/verify-otp", verifyRegistrationOtp);
router.post("/resend-otp", resendRegistrationOtp);
router.post("/login", loginUser);
router.post("/google", googleAuth);
router.get("/google/client-id", (req, res) => {
  res.json({ clientId: process.env.GOOGLE_CLIENT_ID || "" });
});
router.get("/me", protect, getMe);
router.put("/profile", protect, updateProfile);

export default router;
