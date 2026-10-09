import mongoose from "mongoose";
import { Conversation } from "../models/Conversation.js";
import { Message } from "../models/Message.js";

const isDbReady = () => mongoose.connection.readyState === 1;

// In-memory fallback stores
let inMemoryConversations = [];
let inMemoryMessages = {};

export { inMemoryConversations, inMemoryMessages };

const makeHandleRegex = (handle) => {
  if (!handle) return null;
  const clean = handle.toString().trim().replace(/^@/, "");
  return new RegExp(`^@?${clean}$`, "i");
};

/**
 * Helper to fetch user profile (avatar, name, role) from MongoDB users collection
 */
const getUserProfile = async (handle) => {
  if (!handle || !isDbReady()) return null;
  try {
    const clean = handle.toString().trim().replace(/^@/, "");
    return await mongoose.connection.collection("users").findOne(
      { handle: new RegExp(`^@?${clean}$`, "i") },
      { projection: { name: 1, handle: 1, avatar: 1, role: 1 } }
    );
  } catch {
    return null;
  }
};

/**
 * @desc Get all conversations for a user
 * @route GET /api/chat/conversations
 */
export const getConversations = async (req, res) => {
  try {
    const handle = (req.query.handle || "").trim();
    const handleRegex = makeHandleRegex(handle);

    if (isDbReady()) {
      const filter = handleRegex
        ? { participants: { $in: [handleRegex] } }
        : {};
      const convs = await Conversation.find(filter).sort({ lastMessageAt: -1 }).lean();

      // Enrich conversations with real-time unreadCount, live user avatars and last message
      const enriched = await Promise.all(
        convs.map(async (conv) => {
          const convId = conv._id?.toString() || conv.id;
          let unread = 0;
          if (handleRegex) {
            unread = await Message.countDocuments({
              conversationId: convId,
              senderHandle: { $not: handleRegex },
              seen: { $ne: true },
            });
          }

          let lastMsg = conv.lastMessage;
          if (!lastMsg) {
            const latest = await Message.findOne({ conversationId: convId }).sort({ createdAt: -1 });
            if (latest) lastMsg = latest.text;
          }

          // Live avatar and profile enrichment for participants
          const updatedParticipantDetails = await Promise.all(
            (conv.participants || []).map(async (pHandle) => {
              const cleanP = pHandle.replace(/^@/, "");
              const existing = conv.participantDetails?.find(
                (d) => d.handle?.toLowerCase().replace(/^@/, "") === cleanP.toLowerCase()
              );
              const userDoc = await getUserProfile(pHandle);
              const fallbackAvatar = `https://api.dicebear.com/7.x/bottts/svg?seed=${cleanP}`;

              return {
                name: userDoc?.name || existing?.name || cleanP,
                handle: pHandle.startsWith("@") ? pHandle : `@${pHandle}`,
                avatar: userDoc?.avatar || existing?.avatar || fallbackAvatar,
                role: userDoc?.role || existing?.role || "Developer",
                initials: (userDoc?.name || existing?.name || cleanP).slice(0, 2).toUpperCase(),
              };
            })
          );

          return {
            ...conv,
            id: convId,
            participantDetails: updatedParticipantDetails,
            lastMessage: lastMsg || "Started a conversation",
            unreadCount: unread,
          };
        })
      );

      return res.status(200).json({
        success: true,
        count: enriched.length,
        data: enriched,
      });
    }

    // In-memory fallback
    const filtered = handle
      ? inMemoryConversations.filter((c) =>
          c.participants?.some(
            (p) => p.toLowerCase().replace(/^@/, "") === handle.toLowerCase().replace(/^@/, "")
          )
        )
      : inMemoryConversations;

    const enrichedInMemory = filtered.map((c) => {
      const convId = c._id || c.id;
      const msgs = inMemoryMessages[convId] || [];
      const unread = msgs.filter(
        (m) =>
          m.senderHandle?.toLowerCase().replace(/^@/, "") !== handle.toLowerCase().replace(/^@/, "") &&
          !m.seen
      ).length;

      return {
        ...c,
        id: convId,
        unreadCount: unread,
      };
    });

    return res.status(200).json({
      success: true,
      count: enrichedInMemory.length,
      data: enrichedInMemory,
    });
  } catch (error) {
    console.error("Error in getConversations:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch conversations",
      error: error.message,
    });
  }
};

/**
 * @desc Get messages for a specific conversation
 * @route GET /api/chat/conversations/:id/messages
 */
export const getMessages = async (req, res) => {
  try {
    const { id } = req.params;
    const viewerHandle = (req.query.viewerHandle || "").trim();
    const viewerRegex = makeHandleRegex(viewerHandle);

    if (isDbReady()) {
      if (viewerRegex) {
        // Mark all messages from the other user as seen
        await Message.updateMany(
          {
            conversationId: id,
            senderHandle: { $not: viewerRegex },
            seen: { $ne: true },
          },
          {
            $set: { status: "seen", seen: true, seenAt: new Date() },
          }
        );
      }

      const msgs = await Message.find({ conversationId: id }).sort({ createdAt: 1 }).lean();

      // Ensure every message has the sender's live avatar and name
      const enrichedMsgs = await Promise.all(
        msgs.map(async (m) => {
          let avatar = m.senderAvatar;
          let name = m.senderName;
          const cleanSender = (m.senderHandle || "").replace(/^@/, "");

          if (!avatar || !avatar.trim()) {
            const userDoc = await getUserProfile(m.senderHandle);
            if (userDoc?.avatar) avatar = userDoc.avatar;
            if (userDoc?.name && !name) name = userDoc.name;
          }

          if (!avatar || !avatar.trim()) {
            avatar = `https://api.dicebear.com/7.x/bottts/svg?seed=${cleanSender || "dev"}`;
          }

          return {
            ...m,
            senderAvatar: avatar,
            senderName: name || cleanSender || "Developer",
          };
        })
      );

      return res.status(200).json({
        success: true,
        count: enrichedMsgs.length,
        data: enrichedMsgs,
      });
    }

    // In-memory fallback
    const msgs = inMemoryMessages[id] || [];
    if (viewerHandle) {
      const cleanViewer = viewerHandle.toLowerCase().replace(/^@/, "");
      msgs.forEach((m) => {
        if (m.senderHandle?.toLowerCase().replace(/^@/, "") !== cleanViewer) {
          m.status = "seen";
          m.seen = true;
          m.seenAt = new Date().toISOString();
        }
      });
    }

    return res.status(200).json({
      success: true,
      count: msgs.length,
      data: msgs,
    });
  } catch (error) {
    console.error("Error in getMessages:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch messages",
      error: error.message,
    });
  }
};

/**
 * @desc Send a message in a conversation
 * @route POST /api/chat/conversations/:id/messages
 */
export const sendMessage = async (req, res) => {
  try {
    const { id } = req.params;
    let { senderHandle, senderName, senderAvatar, text } = req.body;

    if (!text || !text.trim()) {
      return res.status(400).json({
        success: false,
        message: "Message text is required",
      });
    }

    const cleanText = text.trim();
    const timeStr = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    const cleanSender = (senderHandle || "").replace(/^@/, "");

    // Resolve sender avatar from database if missing
    if (!senderAvatar || !senderAvatar.trim()) {
      const userDoc = await getUserProfile(senderHandle);
      if (userDoc?.avatar) senderAvatar = userDoc.avatar;
      if (userDoc?.name && !senderName) senderName = userDoc.name;
    }
    if (!senderAvatar || !senderAvatar.trim()) {
      senderAvatar = `https://api.dicebear.com/7.x/bottts/svg?seed=${cleanSender || "dev"}`;
    }

    if (isDbReady()) {
      const newMsg = await Message.create({
        conversationId: id,
        senderHandle: senderHandle || "@developer",
        senderName: senderName || cleanSender || "Developer",
        senderAvatar: senderAvatar,
        text: cleanText,
        time: timeStr,
        status: "sent",
        seen: false,
      });

      // Update conversation lastMessage & lastMessageAt
      await Conversation.findOneAndUpdate(
        { _id: id },
        {
          $set: {
            lastMessage: cleanText,
            lastMessageAt: new Date(),
          },
        }
      );

      // Sync to in-memory store
      if (!inMemoryMessages[id]) inMemoryMessages[id] = [];
      inMemoryMessages[id].push(newMsg);

      return res.status(201).json({
        success: true,
        data: newMsg,
      });
    }

    // In-memory fallback
    const mockMsg = {
      _id: `m-${Date.now()}`,
      id: `m-${Date.now()}`,
      conversationId: id,
      senderHandle: senderHandle || "@developer",
      senderName: senderName || cleanSender || "Developer",
      senderAvatar: senderAvatar,
      text: cleanText,
      time: timeStr,
      status: "sent",
      seen: false,
      createdAt: new Date().toISOString(),
    };

    if (!inMemoryMessages[id]) inMemoryMessages[id] = [];
    inMemoryMessages[id].push(mockMsg);

    // Update conversation lastMessage
    const conv = inMemoryConversations.find((c) => c._id === id || c.id === id);
    if (conv) {
      conv.lastMessage = cleanText;
      conv.lastMessageAt = new Date().toISOString();
    }

    return res.status(201).json({
      success: true,
      data: mockMsg,
    });
  } catch (error) {
    console.error("Error in sendMessage:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to send message",
      error: error.message,
    });
  }
};

/**
 * @desc Mark messages as seen in conversation
 * @route PATCH /api/chat/conversations/:id/seen
 */
export const markMessagesAsSeen = async (req, res) => {
  try {
    const { id } = req.params;
    const viewerHandle = (req.body.viewerHandle || req.query.viewerHandle || "").trim();
    const viewerRegex = makeHandleRegex(viewerHandle);

    if (isDbReady()) {
      const filter = { conversationId: id };
      if (viewerRegex) {
        filter.senderHandle = { $not: viewerRegex };
      }
      await Message.updateMany(filter, {
        $set: { status: "seen", seen: true, seenAt: new Date() },
      });

      return res.status(200).json({
        success: true,
        message: "Messages marked as seen",
      });
    }

    // In-memory fallback
    const msgs = inMemoryMessages[id] || [];
    const cleanViewer = viewerHandle.toLowerCase().replace(/^@/, "");
    msgs.forEach((m) => {
      if (!cleanViewer || m.senderHandle?.toLowerCase().replace(/^@/, "") !== cleanViewer) {
        m.status = "seen";
        m.seen = true;
        m.seenAt = new Date().toISOString();
      }
    });

    return res.status(200).json({
      success: true,
      message: "Messages marked as seen",
    });
  } catch (error) {
    console.error("Error in markMessagesAsSeen:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to mark messages as seen",
      error: error.message,
    });
  }
};

/**
 * @desc Start or get an existing conversation between two users
 * @route POST /api/chat/conversations/start
 */
export const startConversation = async (req, res) => {
  try {
    let {
      participant1Handle,
      participant1Name,
      participant1Avatar,
      participant1Role,
      participant2Handle,
      participant2Name,
      participant2Avatar,
      participant2Role,
      project,
      initialMessage,
      conversationId,
    } = req.body;

    if (!participant1Handle || !participant2Handle) {
      return res.status(400).json({
        success: false,
        message: "Both participant handles are required",
      });
    }

    const r1 = makeHandleRegex(participant1Handle);
    const r2 = makeHandleRegex(participant2Handle);

    const norm1 = participant1Handle.startsWith("@") ? participant1Handle : `@${participant1Handle}`;
    const norm2 = participant2Handle.startsWith("@") ? participant2Handle : `@${participant2Handle}`;

    const clean1 = norm1.replace(/^@/, "");
    const clean2 = norm2.replace(/^@/, "");

    // Fetch live user avatars if missing
    if (!participant1Avatar || !participant1Avatar.trim()) {
      const u1 = await getUserProfile(norm1);
      if (u1?.avatar) participant1Avatar = u1.avatar;
      if (u1?.name && !participant1Name) participant1Name = u1.name;
    }
    if (!participant2Avatar || !participant2Avatar.trim()) {
      const u2 = await getUserProfile(norm2);
      if (u2?.avatar) participant2Avatar = u2.avatar;
      if (u2?.name && !participant2Name) participant2Name = u2.name;
    }

    if (!participant1Avatar) participant1Avatar = `https://api.dicebear.com/7.x/bottts/svg?seed=${clean1}`;
    if (!participant2Avatar) participant2Avatar = `https://api.dicebear.com/7.x/bottts/svg?seed=${clean2}`;

    if (isDbReady()) {
      // 1. Check if conversation already exists in MongoDB
      let existing = await Conversation.findOne({
        participants: { $all: [r1, r2] },
      });

      if (existing) {
        return res.status(200).json({
          success: true,
          data: existing,
          isNew: false,
        });
      }

      // 2. Generate new conversation in MongoDB
      const newId = conversationId || `chat-${Date.now()}`;
      const newConvData = {
        _id: newId,
        participants: [norm1, norm2],
        participantDetails: [
          {
            name: participant1Name || clean1,
            handle: norm1,
            avatar: participant1Avatar,
            role: participant1Role || "Developer",
            initials: (participant1Name || clean1).slice(0, 2).toUpperCase(),
          },
          {
            name: participant2Name || clean2,
            handle: norm2,
            avatar: participant2Avatar,
            role: participant2Role || "Team Contributor",
            initials: (participant2Name || clean2).slice(0, 2).toUpperCase(),
          },
        ],
        project: project || "Project Collaboration",
        lastMessage: initialMessage || "Started a conversation",
        lastMessageAt: new Date(),
        unreadCounts: {},
      };

      const savedConv = await Conversation.create(newConvData);

      // If initialMessage provided, seed first message
      if (initialMessage && initialMessage.trim()) {
        await Message.create({
          conversationId: savedConv._id,
          senderHandle: norm1,
          senderName: participant1Name || clean1,
          senderAvatar: participant1Avatar,
          text: initialMessage.trim(),
          status: "sent",
          seen: false,
        });
      }

      // Keep in-memory store in sync
      inMemoryConversations.unshift(savedConv.toObject ? savedConv.toObject() : savedConv);

      return res.status(201).json({
        success: true,
        data: savedConv,
        isNew: true,
      });
    }

    // In-memory fallback
    let existingInMemory = inMemoryConversations.find((c) => {
      const parts = (c.participants || []).map((p) => p.toLowerCase().replace(/^@/, ""));
      const p1 = norm1.toLowerCase().replace(/^@/, "");
      const p2 = norm2.toLowerCase().replace(/^@/, "");
      return parts.includes(p1) && parts.includes(p2);
    });

    if (existingInMemory) {
      return res.status(200).json({
        success: true,
        data: existingInMemory,
        isNew: false,
      });
    }

    const newId = conversationId || `chat-${Date.now()}`;
    const newConv = {
      _id: newId,
      id: newId,
      participants: [norm1, norm2],
      participantDetails: [
        {
          name: participant1Name || clean1,
          handle: norm1,
          avatar: participant1Avatar,
          role: participant1Role || "Developer",
          initials: (participant1Name || clean1).slice(0, 2).toUpperCase(),
        },
        {
          name: participant2Name || clean2,
          handle: norm2,
          avatar: participant2Avatar,
          role: participant2Role || "Team Contributor",
          initials: (participant2Name || clean2).slice(0, 2).toUpperCase(),
        },
      ],
      project: project || "Project Collaboration",
      lastMessage: initialMessage || "Started a conversation",
      lastMessageAt: new Date().toISOString(),
      unreadCounts: { [norm1]: 0, [norm2]: initialMessage ? 1 : 0 },
    };

    inMemoryConversations.unshift(newConv);

    if (initialMessage && initialMessage.trim()) {
      const msgId = `m-${Date.now()}`;
      inMemoryMessages[newId] = [
        {
          _id: msgId,
          id: msgId,
          conversationId: newId,
          senderHandle: norm1,
          senderName: participant1Name || clean1,
          senderAvatar: participant1Avatar,
          text: initialMessage.trim(),
          time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          status: "sent",
          seen: false,
          createdAt: new Date().toISOString(),
        },
      ];
    }

    return res.status(201).json({
      success: true,
      data: newConv,
      isNew: true,
    });
  } catch (error) {
    console.error("Error in startConversation:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to start conversation",
      error: error.message,
    });
  }
};
