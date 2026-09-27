import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
    },
    handle: {
      type: String,
      required: [true, "Handle is required"],
      unique: true,
      trim: true,
      lowercase: true,
      index: true,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      trim: true,
      lowercase: true,
      index: true,
    },
    password: {
      type: String,
      required: function () {
        return !this.googleId;
      },
      minlength: [6, "Password must be at least 6 characters long"],
    },
    googleId: {
      type: String,
      default: null,
      index: true,
    },
    authProvider: {
      type: String,
      enum: ["local", "google"],
      default: "local",
    },
    isEmailVerified: {
      type: Boolean,
      default: false,
    },
    role: {
      type: String,
      default: "Fullstack Developer",
      trim: true,
    },
    bio: {
      type: String,
      default: "Building cool software on ProjectBuddy.",
      trim: true,
    },
    avatar: {
      type: String,
      default: "",
    },
    initials: {
      type: String,
      default: "DEV",
    },
    githubUrl: {
      type: String,
      default: "",
    },
    skills: {
      type: [String],
      default: ["JavaScript", "React", "Node.js"],
    },
  },
  {
    timestamps: true,
  }
);

// Method to remove password from returned user object
userSchema.methods.toJSON = function () {
  const userObject = this.toObject();
  delete userObject.password;
  return userObject;
};

export const User = mongoose.models.User || mongoose.model("User", userSchema);
