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
    coverImage: {
      type: String,
      default: "",
    },
    initials: {
      type: String,
      default: "DEV",
    },
    location: {
      type: String,
      default: "",
      trim: true,
    },
    websiteUrl: {
      type: String,
      default: "",
      trim: true,
    },
    githubUrl: {
      type: String,
      default: "",
      trim: true,
    },
    linkedinUrl: {
      type: String,
      default: "",
      trim: true,
    },
    twitterUrl: {
      type: String,
      default: "",
      trim: true,
    },
    pronouns: {
      type: String,
      default: "",
      trim: true,
    },
    customStatus: {
      type: String,
      default: "Open to collaborate",
      trim: true,
    },
    availability: {
      type: String,
      enum: ["available", "open_to_collab", "busy", "not_looking"],
      default: "open_to_collab",
    },
    experienceLevel: {
      type: String,
      enum: ["junior", "mid", "senior", "lead", "architect"],
      default: "mid",
    },
    interests: {
      type: [String],
      default: ["Web Development", "Open Source", "AI Systems"],
    },
    skills: {
      type: [String],
      default: ["JavaScript", "React", "Node.js"],
    },
    stats: {
      activeProjectsCount: {
        type: Number,
        default: 0,
      },
      teamsJoinedCount: {
        type: Number,
        default: 0,
      },
      collaboratorsCount: {
        type: Number,
        default: 0,
      },
      matchScore: {
        type: Number,
        default: 95,
      },
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

// Method to return public profile payload (no private info like email if not wanted)
userSchema.methods.toPublicProfile = function () {
  return {
    id: this._id.toString(),
    _id: this._id.toString(),
    name: this.name,
    handle: this.handle,
    role: this.role,
    bio: this.bio,
    avatar: this.avatar,
    coverImage: this.coverImage,
    initials: this.initials,
    location: this.location,
    websiteUrl: this.websiteUrl,
    githubUrl: this.githubUrl,
    linkedinUrl: this.linkedinUrl,
    twitterUrl: this.twitterUrl,
    pronouns: this.pronouns,
    customStatus: this.customStatus,
    availability: this.availability,
    experienceLevel: this.experienceLevel,
    interests: this.interests,
    skills: this.skills,
    stats: this.stats,
    createdAt: this.createdAt,
  };
};

export const User = mongoose.models.User || mongoose.model("User", userSchema);
