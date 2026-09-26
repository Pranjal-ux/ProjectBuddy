import mongoose from "mongoose";
import { JoinRequest } from "../models/JoinRequest.js";
import { Activity } from "../models/Activity.js";

// In-memory fallback stores if MongoDB is not yet connected
let inMemoryJoinRequests = [];
let inMemoryActivities = [
  {
    _id: "act-init-1",
    id: "act-init-1",
    type: "join_request",
    user: "Sarah Chen",
    handle: "@schen",
    initials: "SC",
    action: "requested to join your team for",
    target: "AI Pothole Detection System",
    role: "Python Developer / Inference",
    recipientHandle: "@pranjal",
    hasAction: true,
    status: "pending",
    createdAt: new Date(Date.now() - 20 * 60 * 1000).toISOString(),
  },
  {
    _id: "act-init-2",
    id: "act-init-2",
    type: "like",
    user: "Alex Rivera",
    handle: "@arivera",
    initials: "AR",
    action: "liked your project",
    target: "AI Pothole Detection System",
    recipientHandle: "@pranjal",
    hasAction: false,
    status: "none",
    createdAt: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
  },
  {
    _id: "act-init-3",
    id: "act-init-3",
    type: "star",
    user: "Elena Rostova",
    handle: "@elena_codes",
    initials: "ER",
    action: "bookmarked your code snippet",
    target: "tokens.config.css",
    recipientHandle: "@pranjal",
    hasAction: false,
    status: "none",
    createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
  },
  {
    _id: "act-init-4",
    id: "act-init-4",
    type: "collab",
    user: "Rahul Sharma",
    handle: "@rahul",
    initials: "RS",
    action: "invited you to collaborate on",
    target: "AI Resume Analyzer & Matchmaker",
    role: "Lead Fullstack Reviewer",
    recipientHandle: "@pranjal",
    hasAction: true,
    status: "pending",
    createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
  },
];

export { inMemoryActivities };

const isDbReady = () => mongoose.connection.readyState === 1;

/**
 * @desc Create a new join request and generate activity notification
 * @route POST /api/join-requests
 */
export const createJoinRequest = async (req, res) => {
  try {
    const {
      projectId,
      projectTitle,
      projectAuthorName = "Pranjal Shukla",
      projectAuthorHandle = "@pranjal",
      applicantName = "Current User",
      applicantHandle = "@developer",
      applicantInitials = "DEV",
      applicantAvatar = "",
      role,
      githubUrl = "",
      pitch,
    } = req.body;

    if (!projectId || !projectTitle || !role || !pitch) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields: projectId, projectTitle, role, and pitch are required.",
      });
    }

    if (isDbReady()) {
      // 1. Create Join Request document in MongoDB
      const newJoinRequest = await JoinRequest.create({
        projectId,
        projectTitle,
        projectAuthorName,
        projectAuthorHandle,
        applicantName,
        applicantHandle,
        applicantInitials,
        applicantAvatar,
        role,
        githubUrl,
        pitch,
        status: "pending",
      });

      // 2. Automatically create Activity alert for project owner
      const newActivity = await Activity.create({
        type: "join_request",
        user: applicantName,
        handle: applicantHandle,
        initials: applicantInitials,
        action: "requested to join your team for",
        target: projectTitle,
        role: role,
        recipientHandle: projectAuthorHandle,
        joinRequestId: newJoinRequest._id,
        hasAction: true,
        status: "pending",
      });

      return res.status(201).json({
        success: true,
        message: "Join request submitted successfully to MongoDB",
        data: {
          joinRequest: newJoinRequest,
          activity: newActivity,
        },
      });
    } else {
      // Fallback in-memory
      const fallbackId = `req-${Date.now()}`;
      const mockRequest = {
        _id: fallbackId,
        id: fallbackId,
        projectId,
        projectTitle,
        projectAuthorName,
        projectAuthorHandle,
        applicantName,
        applicantHandle,
        applicantInitials,
        applicantAvatar,
        role,
        githubUrl,
        pitch,
        status: "pending",
        createdAt: new Date().toISOString(),
      };
      inMemoryJoinRequests.unshift(mockRequest);

      const actId = `act-${Date.now()}`;
      const mockActivity = {
        _id: actId,
        id: actId,
        type: "join_request",
        user: applicantName,
        handle: applicantHandle,
        initials: applicantInitials,
        action: "requested to join your team for",
        target: projectTitle,
        role: role,
        recipientHandle: projectAuthorHandle,
        joinRequestId: fallbackId,
        hasAction: true,
        status: "pending",
        createdAt: new Date().toISOString(),
      };
      inMemoryActivities.unshift(mockActivity);

      return res.status(201).json({
        success: true,
        message: "Join request submitted successfully (In-Memory Fallback)",
        data: {
          joinRequest: mockRequest,
          activity: mockActivity,
        },
      });
    }
  } catch (error) {
    console.error("Error in createJoinRequest:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error while creating join request",
      error: error.message,
    });
  }
};

/**
 * @desc Get all join requests
 * @route GET /api/join-requests
 */
export const getJoinRequests = async (req, res) => {
  try {
    const { recipientHandle, status } = req.query;

    if (isDbReady()) {
      const filter = {};
      if (recipientHandle) filter.projectAuthorHandle = recipientHandle;
      if (status) filter.status = status;

      const requests = await JoinRequest.find(filter).sort({ createdAt: -1 });
      return res.status(200).json({
        success: true,
        count: requests.length,
        data: requests,
      });
    } else {
      let filtered = [...inMemoryJoinRequests];
      if (recipientHandle) {
        filtered = filtered.filter((r) => r.projectAuthorHandle === recipientHandle);
      }
      if (status) {
        filtered = filtered.filter((r) => r.status === status);
      }
      return res.status(200).json({
        success: true,
        count: filtered.length,
        data: filtered,
      });
    }
  } catch (error) {
    console.error("Error in getJoinRequests:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to retrieve join requests",
      error: error.message,
    });
  }
};

/**
 * @desc Accept or decline a join request
 * @route PATCH /api/join-requests/:id/respond
 */
export const respondToJoinRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, activityData } = req.body;

    if (!status || !["accepted", "declined"].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Status must be either 'accepted' or 'declined'",
      });
    }

    if (isDbReady()) {
      let joinRequest = null;
      let act = null;

      // 1. If valid ObjectId, try finding JoinRequest first
      if (mongoose.Types.ObjectId.isValid(id)) {
        joinRequest = await JoinRequest.findByIdAndUpdate(
          id,
          { status },
          { new: true }
        );
      }

      // If JoinRequest was found, update all corresponding activities
      if (joinRequest) {
        await Activity.updateMany(
          { joinRequestId: joinRequest._id },
          { status: status }
        );
      } else {
        // 2. If valid ObjectId, try finding Activity
        if (mongoose.Types.ObjectId.isValid(id)) {
          act = await Activity.findByIdAndUpdate(
            id,
            { status },
            { new: true }
          );
        }

        // 3. If not found by ObjectId, search by customId or string id
        if (!act) {
          act = await Activity.findOneAndUpdate(
            { customId: id },
            { status },
            { new: true }
          );
        }

        // 4. If still not found in MongoDB, upsert it so it's persisted permanently
        if (!act) {
          const payload = activityData || {};
          act = await Activity.create({
            customId: id,
            type: payload.type || "join_request",
            user: payload.user || "Applicant",
            handle: payload.handle || "@developer",
            initials: payload.initials || "DEV",
            action: payload.action || "requested to join your team for",
            target: payload.target || "Project",
            role: payload.role || "",
            recipientHandle: payload.recipientHandle || "@pranjal",
            hasAction: true,
            status,
          });
        }

        // If activity has a joinRequestId, also update that JoinRequest
        if (act && act.joinRequestId && mongoose.Types.ObjectId.isValid(act.joinRequestId)) {
          joinRequest = await JoinRequest.findByIdAndUpdate(
            act.joinRequestId,
            { status },
            { new: true }
          );
        }
      }

      // Also update in-memory fallback stores
      let targetReq = inMemoryJoinRequests.find((r) => r._id === id || r.id === id);
      if (targetReq) targetReq.status = status;

      let targetAct = inMemoryActivities.find(
        (a) => a._id === id || a.id === id || a.joinRequestId === id || a.customId === id
      );
      if (targetAct) {
        targetAct.status = status;
      }

      return res.status(200).json({
        success: true,
        message: `Join request marked as ${status}`,
        data: act || joinRequest || { id, status },
      });
    } else {
      // In-memory update
      let targetReq = inMemoryJoinRequests.find((r) => r._id === id || r.id === id);
      if (targetReq) {
        targetReq.status = status;
      }

      let targetAct = inMemoryActivities.find(
        (a) => a._id === id || a.id === id || a.joinRequestId === id || a.customId === id
      );
      if (targetAct) {
        targetAct.status = status;
      } else {
        const payload = activityData || {};
        const fallbackAct = {
          _id: id,
          id: id,
          customId: id,
          type: payload.type || "join_request",
          user: payload.user || "Applicant",
          handle: payload.handle || "@developer",
          initials: payload.initials || "DEV",
          action: payload.action || "requested to join your team for",
          target: payload.target || "Project",
          role: payload.role || "",
          recipientHandle: payload.recipientHandle || "@pranjal",
          hasAction: true,
          status,
          createdAt: new Date().toISOString(),
        };
        inMemoryActivities.unshift(fallbackAct);
      }

      return res.status(200).json({
        success: true,
        message: `Join request marked as ${status} (In-Memory Fallback)`,
        data: targetReq || targetAct || { id, status },
      });
    }
  } catch (error) {
    console.error("Error in respondToJoinRequest:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to respond to join request",
      error: error.message,
    });
  }
};
