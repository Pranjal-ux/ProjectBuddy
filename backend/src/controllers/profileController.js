import mongoose from "mongoose";
import { User } from "../models/User.js";
import { JoinRequest } from "../models/JoinRequest.js";
import { Activity } from "../models/Activity.js";
import { inMemoryUsers, inMemoryProjects } from "../data/inMemoryStore.js";
import { inMemoryActivities } from "./joinRequestController.js";

const isDbReady = () => mongoose.connection.readyState === 1;

/**
 * Format initials helper
 */
const getInitials = (name) => {
  if (!name) return "DEV";
  const parts = name.trim().split(" ");
  if (parts.length >= 2) {
    return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  }
  return name.slice(0, 2).toUpperCase();
};

/**
 * Normalize handle helper
 */
const formatHandle = (handle) => {
  if (!handle) return "@developer";
  let clean = handle.trim().toLowerCase();
  if (!clean.startsWith("@")) {
    clean = `@${clean}`;
  }
  return clean;
};

/**
 * Sanitize URL helper
 */
const sanitizeUrl = (url) => {
  if (!url || typeof url !== "string") return "";
  const trimmed = url.trim();
  if (!trimmed) return "";
  if (
    trimmed.startsWith("http://") ||
    trimmed.startsWith("https://") ||
    trimmed.startsWith("data:")
  ) {
    return trimmed;
  }
  return `https://${trimmed}`;
};

/**
 * Calculate dynamic stats for a user
 */
const calculateUserStats = async (user) => {
  const handle = formatHandle(user.handle);
  const userId = user._id ? user._id.toString() : user.id;

  if (isDbReady()) {
    try {
      // 1. Accepted join requests where user is the applicant (teams joined)
      const teamsJoined = await JoinRequest.countDocuments({
        applicantHandle: handle,
        status: "accepted",
      });

      // 2. Projects created by this user
      const createdRequests = await JoinRequest.find({
        projectAuthorHandle: handle,
      });

      const uniqueProjectIds = new Set(createdRequests.map((r) => r.projectId));
      const activeProjectsCount = Math.max(uniqueProjectIds.size, user.stats?.activeProjectsCount || 1);

      // 3. Collaborators (distinct people collaborated with)
      const acceptedApplicantHandles = await JoinRequest.distinct("applicantHandle", {
        projectAuthorHandle: handle,
        status: "accepted",
      });
      const acceptedAuthorHandles = await JoinRequest.distinct("projectAuthorHandle", {
        applicantHandle: handle,
        status: "accepted",
      });

      const allCollabs = new Set([...acceptedApplicantHandles, ...acceptedAuthorHandles]);
      allCollabs.delete(handle);
      const collaboratorsCount = Math.max(allCollabs.size, user.stats?.collaboratorsCount || 0);

      // 4. Synergy / Match Score
      const skillsCount = Array.isArray(user.skills) ? user.skills.length : 0;
      const baseScore = 80;
      const computedScore = Math.min(
        99,
        baseScore + (skillsCount > 3 ? 10 : skillsCount * 3) + Math.min(collaboratorsCount * 2, 8)
      );

      return {
        activeProjectsCount,
        teamsJoinedCount: Math.max(teamsJoined, user.stats?.teamsJoinedCount || 0),
        collaboratorsCount,
        matchScore: user.stats?.matchScore || computedScore,
        skillsCount,
      };
    } catch (err) {
      console.warn("Error calculating user stats from DB:", err.message);
    }
  }

  // Fallback in-memory calculation
  const authoredInMem = inMemoryProjects.filter(
    (p) => formatHandle(p.authorHandle) === handle
  );
  const activeProjectsCount = Math.max(authoredInMem.length, user.stats?.activeProjectsCount || 3);
  const teamsJoinedCount = user.stats?.teamsJoinedCount || 5;
  const collaboratorsCount = user.stats?.collaboratorsCount || 14;
  const matchScore = user.stats?.matchScore || 98;
  const skillsCount = Array.isArray(user.skills) ? user.skills.length : 9;

  return {
    activeProjectsCount,
    teamsJoinedCount,
    collaboratorsCount,
    matchScore,
    skillsCount,
  };
};

/**
 * Format user for response
 */
const formatUserResponse = (user, stats) => {
  const id = user._id ? user._id.toString() : user.id;
  return {
    id,
    _id: id,
    name: user.name,
    handle: formatHandle(user.handle),
    email: user.email,
    role: user.role || "Fullstack Developer",
    bio: user.bio || "",
    avatar: user.avatar || "",
    coverImage: user.coverImage || "",
    initials: user.initials || getInitials(user.name),
    location: user.location || "",
    websiteUrl: user.websiteUrl || "",
    githubUrl: user.githubUrl || "",
    linkedinUrl: user.linkedinUrl || "",
    twitterUrl: user.twitterUrl || "",
    pronouns: user.pronouns || "",
    customStatus: user.customStatus || "Open to collaborate",
    availability: user.availability || "open_to_collab",
    experienceLevel: user.experienceLevel || "mid",
    interests: user.interests || ["Web Development", "AI Systems", "Open Source"],
    skills: user.skills || ["React", "TypeScript", "Node.js"],
    stats: stats || user.stats || {
      activeProjectsCount: 3,
      teamsJoinedCount: 5,
      collaboratorsCount: 14,
      matchScore: 98,
    },
    isEmailVerified: user.isEmailVerified !== undefined ? user.isEmailVerified : true,
    authProvider: user.authProvider || "local",
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
};

/**
 * @desc Get current authenticated user profile
 * @route GET /api/profile/me
 */
export const getMyProfile = async (req, res) => {
  try {
    const userId = req.user.id || req.user._id;

    if (isDbReady()) {
      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: "Authenticated user not found in database",
        });
      }

      const stats = await calculateUserStats(user);
      return res.status(200).json({
        success: true,
        user: formatUserResponse(user, stats),
      });
    }

    // In-memory fallback
    const user =
      inMemoryUsers.find(
        (u) =>
          u.id === userId ||
          u._id === userId ||
          (u.email && req.user.email && u.email === req.user.email) ||
          (u.handle && req.user.handle && formatHandle(u.handle) === formatHandle(req.user.handle))
      ) || req.user;

    const stats = await calculateUserStats(user);
    return res.status(200).json({
      success: true,
      user: formatUserResponse(user, stats),
    });
  } catch (error) {
    console.error("Error in getMyProfile:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch user profile",
      error: error.message,
    });
  }
};

/**
 * @desc Update authenticated user profile
 * @route PUT /api/profile/me
 */
export const updateMyProfile = async (req, res) => {
  try {
    const userId = req.user.id || req.user._id;
    const {
      name,
      role,
      bio,
      location,
      websiteUrl,
      githubUrl,
      linkedinUrl,
      twitterUrl,
      pronouns,
      customStatus,
      availability,
      experienceLevel,
      interests,
      skills,
      avatar,
      coverImage,
      initials,
    } = req.body;

    if (isDbReady()) {
      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: "User not found in database",
        });
      }

      if (name !== undefined && name.trim()) {
        user.name = name.trim();
        user.initials = initials ? initials.trim().toUpperCase() : getInitials(user.name);
      } else if (initials !== undefined && initials.trim()) {
        user.initials = initials.trim().toUpperCase();
      }

      if (role !== undefined) user.role = role.trim();
      if (bio !== undefined) user.bio = bio.trim();
      if (location !== undefined) user.location = location.trim();
      if (websiteUrl !== undefined) user.websiteUrl = sanitizeUrl(websiteUrl);
      if (githubUrl !== undefined) user.githubUrl = sanitizeUrl(githubUrl);
      if (linkedinUrl !== undefined) user.linkedinUrl = sanitizeUrl(linkedinUrl);
      if (twitterUrl !== undefined) user.twitterUrl = sanitizeUrl(twitterUrl);
      if (pronouns !== undefined) user.pronouns = pronouns.trim();
      if (customStatus !== undefined) user.customStatus = customStatus.trim();
      if (availability !== undefined) user.availability = availability;
      if (experienceLevel !== undefined) user.experienceLevel = experienceLevel;
      if (interests !== undefined && Array.isArray(interests)) user.interests = interests;
      if (skills !== undefined && Array.isArray(skills)) user.skills = skills;
      if (avatar !== undefined) user.avatar = avatar;
      if (coverImage !== undefined) user.coverImage = coverImage;

      const updatedUser = await user.save();
      const stats = await calculateUserStats(updatedUser);

      return res.status(200).json({
        success: true,
        message: "Profile updated successfully!",
        user: formatUserResponse(updatedUser, stats),
      });
    }

    // In-memory fallback
    let user = inMemoryUsers.find(
      (u) =>
        u.id === userId ||
        u._id === userId ||
        (u.email && req.user.email && u.email === req.user.email) ||
        (u.handle && req.user.handle && formatHandle(u.handle) === formatHandle(req.user.handle))
    );

    if (!user) {
      user = {
        _id: userId,
        id: userId,
        name: req.user.name || "Developer",
        handle: formatHandle(req.user.handle || "@developer"),
        email: req.user.email || "developer@projectbuddy.dev",
        role: "Fullstack Developer",
        bio: "",
        avatar: "",
        coverImage: "",
        initials: "DEV",
        skills: ["React", "TypeScript", "Node.js"],
        createdAt: new Date().toISOString(),
      };
      inMemoryUsers.push(user);
    }

    if (name !== undefined && name.trim()) {
      user.name = name.trim();
      user.initials = initials ? initials.trim().toUpperCase() : getInitials(user.name);
    } else if (initials !== undefined && initials.trim()) {
      user.initials = initials.trim().toUpperCase();
    }

    if (role !== undefined) user.role = role.trim();
    if (bio !== undefined) user.bio = bio.trim();
    if (location !== undefined) user.location = location.trim();
    if (websiteUrl !== undefined) user.websiteUrl = sanitizeUrl(websiteUrl);
    if (githubUrl !== undefined) user.githubUrl = sanitizeUrl(githubUrl);
    if (linkedinUrl !== undefined) user.linkedinUrl = sanitizeUrl(linkedinUrl);
    if (twitterUrl !== undefined) user.twitterUrl = sanitizeUrl(twitterUrl);
    if (pronouns !== undefined) user.pronouns = pronouns.trim();
    if (customStatus !== undefined) user.customStatus = customStatus.trim();
    if (availability !== undefined) user.availability = availability;
    if (experienceLevel !== undefined) user.experienceLevel = experienceLevel;
    if (interests !== undefined && Array.isArray(interests)) user.interests = interests;
    if (skills !== undefined && Array.isArray(skills)) user.skills = skills;
    if (avatar !== undefined) user.avatar = avatar;
    if (coverImage !== undefined) user.coverImage = coverImage;
    user.updatedAt = new Date().toISOString();

    const stats = await calculateUserStats(user);

    return res.status(200).json({
      success: true,
      message: "Profile updated successfully (In-Memory Fallback)!",
      user: formatUserResponse(user, stats),
    });
  } catch (error) {
    console.error("Error in updateMyProfile:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to update profile",
      error: error.message,
    });
  }
};

/**
 * @desc Get public profile by username handle or user ID
 * @route GET /api/profile/:identifier
 */
export const getUserProfile = async (req, res) => {
  try {
    const { identifier } = req.params;
    if (!identifier) {
      return res.status(400).json({
        success: false,
        message: "Profile identifier is required",
      });
    }

    const cleanHandle = formatHandle(identifier);
    const rawHandle = identifier.replace(/^@/, "").toLowerCase();

    if (isDbReady()) {
      let user = null;
      if (mongoose.Types.ObjectId.isValid(identifier)) {
        user = await User.findById(identifier);
      }
      if (!user) {
        user = await User.findOne({
          $or: [
            { handle: cleanHandle },
            { handle: `@${rawHandle}` },
            { handle: rawHandle },
          ],
        });
      }

      if (!user) {
        return res.status(404).json({
          success: false,
          message: `Developer profile '${identifier}' not found`,
        });
      }

      const stats = await calculateUserStats(user);
      return res.status(200).json({
        success: true,
        user: formatUserResponse(user, stats),
      });
    }

    // In-memory fallback
    const user = inMemoryUsers.find(
      (u) =>
        u.id === identifier ||
        u._id === identifier ||
        formatHandle(u.handle) === cleanHandle ||
        u.handle.replace(/^@/, "").toLowerCase() === rawHandle
    );

    if (!user) {
      // Dynamic fallback for any developer username requested
      const mockUser = {
        id: `usr-${rawHandle}`,
        _id: `usr-${rawHandle}`,
        name: rawHandle
          .split(/[\._\-]/)
          .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
          .join(" "),
        handle: `@${rawHandle}`,
        email: `${rawHandle}@projectbuddy.dev`,
        role: "Fullstack Engineer",
        bio: `Building innovative open-source developer applications on ProjectBuddy.`,
        initials: rawHandle.slice(0, 2).toUpperCase(),
        location: "Global / Remote",
        avatar: "",
        coverImage: "",
        customStatus: "Open to collaborate",
        availability: "open_to_collab",
        skills: ["TypeScript", "Next.js", "React", "Node.js", "TailwindCSS"],
        stats: {
          activeProjectsCount: 2,
          teamsJoinedCount: 3,
          collaboratorsCount: 6,
          matchScore: 92,
        },
      };

      return res.status(200).json({
        success: true,
        user: formatUserResponse(mockUser, mockUser.stats),
      });
    }

    const stats = await calculateUserStats(user);
    return res.status(200).json({
      success: true,
      user: formatUserResponse(user, stats),
    });
  } catch (error) {
    console.error("Error in getUserProfile:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch user profile",
      error: error.message,
    });
  }
};

/**
 * @desc Get projects created or joined by user
 * @route GET /api/profile/:identifier/projects
 */
export const getUserProjects = async (req, res) => {
  try {
    const { identifier } = req.params;
    const cleanHandle = formatHandle(identifier);
    const rawHandle = identifier.replace(/^@/, "").toLowerCase();

    if (isDbReady()) {
      // Find join requests where user is author or applicant with accepted status
      const authoredRequests = await JoinRequest.find({
        $or: [
          { projectAuthorHandle: cleanHandle },
          { projectAuthorHandle: `@${rawHandle}` },
          { projectAuthorHandle: rawHandle },
        ],
      }).sort({ createdAt: -1 });

      const joinedRequests = await JoinRequest.find({
        $or: [
          { applicantHandle: cleanHandle },
          { applicantHandle: `@${rawHandle}` },
          { applicantHandle: rawHandle },
        ],
        status: "accepted",
      }).sort({ createdAt: -1 });

      const projects = [
        ...authoredRequests.map((r) => ({
          id: r.projectId,
          title: r.projectTitle,
          role: "Owner / Author",
          authorHandle: r.projectAuthorHandle,
          authorName: r.projectAuthorName,
          status: "active",
          createdAt: r.createdAt,
        })),
        ...joinedRequests.map((r) => ({
          id: r.projectId,
          title: r.projectTitle,
          role: r.role,
          authorHandle: r.projectAuthorHandle,
          authorName: r.projectAuthorName,
          status: "joined",
          createdAt: r.createdAt,
        })),
      ];

      // Remove duplicate project IDs
      const uniqueProjects = Array.from(
        new Map(projects.map((p) => [p.id, p])).values()
      );

      return res.status(200).json({
        success: true,
        count: uniqueProjects.length,
        projects: uniqueProjects,
      });
    }

    // In-memory fallback
    const authored = inMemoryProjects.filter(
      (p) =>
        formatHandle(p.authorHandle) === cleanHandle ||
        p.authorHandle.replace(/^@/, "").toLowerCase() === rawHandle
    );

    return res.status(200).json({
      success: true,
      count: authored.length,
      projects: authored,
    });
  } catch (error) {
    console.error("Error in getUserProjects:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch user projects",
      error: error.message,
    });
  }
};

/**
 * @desc Get user activity / contribution stream
 * @route GET /api/profile/:identifier/activities
 */
export const getUserActivities = async (req, res) => {
  try {
    const { identifier } = req.params;
    const cleanHandle = formatHandle(identifier);
    const rawHandle = identifier.replace(/^@/, "").toLowerCase();

    if (isDbReady()) {
      const activities = await Activity.find({
        $or: [
          { recipientHandle: cleanHandle },
          { recipientHandle: `@${rawHandle}` },
          { handle: cleanHandle },
          { handle: `@${rawHandle}` },
        ],
      })
        .sort({ createdAt: -1 })
        .limit(20);

      return res.status(200).json({
        success: true,
        count: activities.length,
        activities,
      });
    }

    // In-memory fallback
    const activities = inMemoryActivities.filter(
      (a) =>
        formatHandle(a.recipientHandle) === cleanHandle ||
        formatHandle(a.handle) === cleanHandle ||
        a.handle?.replace(/^@/, "").toLowerCase() === rawHandle
    );

    return res.status(200).json({
      success: true,
      count: activities.length,
      activities: activities.slice(0, 20),
    });
  } catch (error) {
    console.error("Error in getUserActivities:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch user activities",
      error: error.message,
    });
  }
};

/**
 * @desc Get user statistics
 * @route GET /api/profile/:identifier/stats
 */
export const getUserStats = async (req, res) => {
  try {
    const { identifier } = req.params;
    const cleanHandle = formatHandle(identifier);

    let user = null;
    if (isDbReady()) {
      if (mongoose.Types.ObjectId.isValid(identifier)) {
        user = await User.findById(identifier);
      }
      if (!user) {
        user = await User.findOne({ handle: cleanHandle });
      }
    } else {
      user = inMemoryUsers.find(
        (u) => formatHandle(u.handle) === cleanHandle || u.id === identifier
      );
    }

    if (!user) {
      return res.status(200).json({
        success: true,
        stats: {
          activeProjectsCount: 2,
          teamsJoinedCount: 3,
          collaboratorsCount: 6,
          matchScore: 92,
          skillsCount: 6,
        },
      });
    }

    const stats = await calculateUserStats(user);
    return res.status(200).json({
      success: true,
      stats,
    });
  } catch (error) {
    console.error("Error in getUserStats:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch user statistics",
      error: error.message,
    });
  }
};

/**
 * @desc Update profile avatar
 * @route POST /api/profile/me/avatar
 */
export const updateAvatar = async (req, res) => {
  try {
    const { avatar } = req.body;
    if (!avatar) {
      return res.status(400).json({
        success: false,
        message: "Avatar URL or image data is required",
      });
    }

    return updateMyProfile(
      { ...req, body: { avatar } },
      res
    );
  } catch (error) {
    console.error("Error in updateAvatar:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to update avatar",
      error: error.message,
    });
  }
};

/**
 * @desc Delete profile avatar (reset to default initials)
 * @route DELETE /api/profile/me/avatar
 */
export const deleteAvatar = async (req, res) => {
  try {
    return updateMyProfile(
      { ...req, body: { avatar: "" } },
      res
    );
  } catch (error) {
    console.error("Error in deleteAvatar:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to delete avatar",
      error: error.message,
    });
  }
};

/**
 * @desc Update cover banner image
 * @route POST /api/profile/me/cover
 */
export const updateCoverImage = async (req, res) => {
  try {
    const { coverImage } = req.body;
    if (!coverImage) {
      return res.status(400).json({
        success: false,
        message: "Cover image URL or data is required",
      });
    }

    return updateMyProfile(
      { ...req, body: { coverImage } },
      res
    );
  } catch (error) {
    console.error("Error in updateCoverImage:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to update cover image",
      error: error.message,
    });
  }
};

/**
 * @desc Delete cover banner image
 * @route DELETE /api/profile/me/cover
 */
export const deleteCoverImage = async (req, res) => {
  try {
    return updateMyProfile(
      { ...req, body: { coverImage: "" } },
      res
    );
  } catch (error) {
    console.error("Error in deleteCoverImage:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to delete cover image",
      error: error.message,
    });
  }
};

/**
 * @desc Update verified skills list
 * @route PUT /api/profile/me/skills
 */
export const updateSkills = async (req, res) => {
  try {
    const { skills, addSkill, removeSkill } = req.body;
    const userId = req.user.id || req.user._id;

    let currentSkills = req.user.skills || [];

    if (Array.isArray(skills)) {
      currentSkills = skills.map((s) => s.trim()).filter(Boolean);
    } else if (addSkill && typeof addSkill === "string") {
      const clean = addSkill.trim();
      if (clean && !currentSkills.includes(clean)) {
        currentSkills.push(clean);
      }
    } else if (removeSkill && typeof removeSkill === "string") {
      const clean = removeSkill.trim();
      currentSkills = currentSkills.filter((s) => s !== clean);
    }

    return updateMyProfile(
      { ...req, body: { skills: currentSkills } },
      res
    );
  } catch (error) {
    console.error("Error in updateSkills:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to update skills",
      error: error.message,
    });
  }
};

/**
 * @desc Search developers for team recruitment & synergy matching
 * @route GET /api/profile/search
 */
export const searchDevelopers = async (req, res) => {
  try {
    const { q, skill, role, availability } = req.query;
    const queryTerm = (q || "").trim().toLowerCase();
    const skillTerm = (skill || "").trim().toLowerCase();
    const roleTerm = (role || "").trim().toLowerCase();

    if (isDbReady()) {
      const filter = {};

      if (queryTerm) {
        filter.$or = [
          { name: { $regex: queryTerm, $options: "i" } },
          { handle: { $regex: queryTerm, $options: "i" } },
          { role: { $regex: queryTerm, $options: "i" } },
          { skills: { $regex: queryTerm, $options: "i" } },
        ];
      }

      if (skillTerm) {
        filter.skills = { $regex: skillTerm, $options: "i" };
      }

      if (roleTerm) {
        filter.role = { $regex: roleTerm, $options: "i" };
      }

      if (availability) {
        filter.availability = availability;
      }

      const users = await User.find(filter).limit(20);
      return res.status(200).json({
        success: true,
        count: users.length,
        developers: users.map((u) => formatUserResponse(u)),
      });
    }

    // In-memory fallback
    let matches = inMemoryUsers.filter((u) => {
      let pass = true;
      if (queryTerm) {
        const inName = u.name?.toLowerCase().includes(queryTerm);
        const inHandle = u.handle?.toLowerCase().includes(queryTerm);
        const inRole = u.role?.toLowerCase().includes(queryTerm);
        const inSkills = u.skills?.some((s) => s.toLowerCase().includes(queryTerm));
        pass = pass && (inName || inHandle || inRole || inSkills);
      }
      if (skillTerm) {
        pass = pass && u.skills?.some((s) => s.toLowerCase().includes(skillTerm));
      }
      if (roleTerm) {
        pass = pass && u.role?.toLowerCase().includes(roleTerm);
      }
      if (availability) {
        pass = pass && u.availability === availability;
      }
      return pass;
    });

    return res.status(200).json({
      success: true,
      count: matches.length,
      developers: matches.map((u) => formatUserResponse(u)),
    });
  } catch (error) {
    console.error("Error in searchDevelopers:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to search developers",
      error: error.message,
    });
  }
};
