import mongoose from "mongoose";
import { JoinRequest } from "../models/JoinRequest.js";
import { Activity } from "../models/Activity.js";
import { Conversation } from "../models/Conversation.js";
import { Message } from "../models/Message.js";
import { inMemoryConversations, inMemoryMessages } from "./chatController.js";

// In-memory fallback stores if MongoDB is not yet connected
let inMemoryJoinRequests = [];
let inMemoryActivities = [];

export { inMemoryActivities };

const isDbReady = () => mongoose.connection.readyState === 1;

/**
 * Automatically creates/initiates a chat conversation between project owner and accepted applicant
 */
const ensureChatOnAccepted = async ({
  applicantHandle,
  applicantName,
  applicantAvatar = "",
  applicantRole = "Team Contributor",
  applicantInitials = "TC",
  projectAuthorHandle = "@pranjal",
  projectAuthorName = "Pranjal Shukla",
  projectTitle = "Project",
}) => {
  if (!applicantHandle) return null;
  const norm1 = projectAuthorHandle.toLowerCase();
  const norm2 = applicantHandle.toLowerCase();

  // Check if conversation already exists in memory
  let existing = inMemoryConversations.find((c) => {
    const parts = c.participants.map((p) => p.toLowerCase());
    return parts.includes(norm1) && parts.includes(norm2);
  });

  const initialMsgText = `Hey ${applicantName || "there"}! I accepted your request to collaborate on ${projectTitle}. Welcome to the team!`;

  if (existing) {
    existing.project = projectTitle;
    existing.lastMessage = initialMsgText;
    existing.lastMessageAt = new Date().toISOString();
    return existing;
  }

  const newId = `chat-${Date.now()}`;
  const newConv = {
    _id: newId,
    id: newId,
    participants: [projectAuthorHandle, applicantHandle],
    participantDetails: [
      {
        name: projectAuthorName,
        handle: projectAuthorHandle,
        avatar: "",
        role: "Project Lead",
        initials: "PL",
      },
      {
        name: applicantName || applicantHandle.replace("@", ""),
        handle: applicantHandle,
        avatar: applicantAvatar || "",
        role: applicantRole || "Team Contributor",
        initials: applicantInitials || (applicantName || "TC").slice(0, 2).toUpperCase(),
      },
    ],
    project: projectTitle,
    lastMessage: initialMsgText,
    lastMessageAt: new Date().toISOString(),
    unreadCounts: { [applicantHandle]: 1, [projectAuthorHandle]: 0 },
  };

  inMemoryConversations.unshift(newConv);
  inMemoryMessages[newId] = [
    {
      _id: `m-${Date.now()}`,
      id: `m-${Date.now()}`,
      conversationId: newId,
      senderHandle: projectAuthorHandle,
      senderName: projectAuthorName,
      text: initialMsgText,
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      createdAt: new Date().toISOString(),
    },
  ];

  if (isDbReady()) {
    try {
      const dbConv = await Conversation.create(newConv);
      await Message.create({
        conversationId: dbConv._id.toString(),
        senderHandle: projectAuthorHandle,
        senderName: projectAuthorName,
        text: initialMsgText,
      });
    } catch (err) {
      console.warn("MongoDB chat sync notice:", err.message);
    }
  }

  return newConv;
};

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

      let conversation = null;
      if (status === "accepted") {
        const applicantHandle = (joinRequest && joinRequest.applicantHandle) || (act && act.handle) || (targetReq && targetReq.applicantHandle) || (targetAct && targetAct.handle) || (activityData && activityData.handle);
        const applicantName = (joinRequest && joinRequest.applicantName) || (act && act.user) || (targetReq && targetReq.applicantName) || (targetAct && targetAct.user) || (activityData && activityData.user);
        const applicantRole = (joinRequest && joinRequest.role) || (act && act.role) || (targetReq && targetReq.role) || (targetAct && targetAct.role) || (activityData && activityData.role);
        const projectTitle = (joinRequest && joinRequest.projectTitle) || (act && act.target) || (targetReq && targetReq.projectTitle) || (targetAct && targetAct.target) || (activityData && activityData.target);
        const projectAuthorHandle = (joinRequest && joinRequest.projectAuthorHandle) || (act && act.recipientHandle) || (targetReq && targetReq.projectAuthorHandle) || (targetAct && targetAct.recipientHandle) || "@pranjal";

        conversation = await ensureChatOnAccepted({
          applicantHandle,
          applicantName,
          applicantRole,
          projectTitle,
          projectAuthorHandle,
        });
      }

      return res.status(200).json({
        success: true,
        message: `Join request marked as ${status}`,
        data: act || joinRequest || { id, status },
        conversation,
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

      let conversation = null;
      if (status === "accepted") {
        const applicantHandle = (targetReq && targetReq.applicantHandle) || (targetAct && targetAct.handle) || (activityData && activityData.handle);
        const applicantName = (targetReq && targetReq.applicantName) || (targetAct && targetAct.user) || (activityData && activityData.user);
        const applicantRole = (targetReq && targetReq.role) || (targetAct && targetAct.role) || (activityData && activityData.role);
        const projectTitle = (targetReq && targetReq.projectTitle) || (targetAct && targetAct.target) || (activityData && activityData.target);
        const projectAuthorHandle = (targetReq && targetReq.projectAuthorHandle) || (targetAct && targetAct.recipientHandle) || "@pranjal";

        conversation = await ensureChatOnAccepted({
          applicantHandle,
          applicantName,
          applicantRole,
          projectTitle,
          projectAuthorHandle,
        });
      }

      return res.status(200).json({
        success: true,
        message: `Join request marked as ${status} (In-Memory Fallback)`,
        data: targetReq || targetAct || { id, status },
        conversation,
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
