import mongoose from "mongoose";

const otpVerificationSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    otp: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: ["register", "login", "reset_password"],
      default: "register",
    },
    pendingUserData: {
      type: Object,
      default: null,
    },
    expiresAt: {
      type: Date,
      required: true,
      // Document automatically deleted by MongoDB when expiresAt is reached
      index: { expires: 0 },
    },
  },
  { timestamps: true }
);

export const OtpVerification =
  mongoose.models.OtpVerification ||
  mongoose.model("OtpVerification", otpVerificationSchema);
