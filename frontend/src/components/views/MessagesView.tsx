"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import {
  Send,
  Circle,
  ArrowLeft,
  Search,
  CheckCheck,
  Sparkles,
  MessageSquare,
  ExternalLink,
  SquarePen,
  Info,
  Image as ImageIcon,
  Code2,
  Smile,
  X,
  Check,
  Pin,
  MoreHorizontal,
  Copy,
  ThumbsUp,
  Heart,
  Flame,
  Rocket,
  ShieldCheck,
  UserPlus,
  SlidersHorizontal,
} from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogHeader } from "@/components/ui/dialog";
import { GithubIcon, LinkedinIcon, TwitterIcon } from "@/components/ui/BrandIcons";
import { api, ChatMessage } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";

export interface Contact {
  id: string;
  name: string;
  handle: string;
  avatar: string;
  initials: string;
  project: string;
  lastMsg: string;
  time: string;
  unread: number;
  online: boolean;
  role: string;
  bio?: string;
  skills?: string[];
  githubUrl?: string;
  linkedinUrl?: string;
  twitterUrl?: string;
  verified?: boolean;
  pinned?: boolean;
}

export interface UIMessage {
  id?: string;
  sender: "me" | "them";
  senderHandle?: string;
  senderName?: string;
  senderAvatar?: string;
  text: string;
  time: string;
  status?: "sent" | "delivered" | "seen";
  seen?: boolean;
  reactions?: Record<string, number>;
  userReaction?: string; // Tracks the user's active reaction (only 1 reaction per message)
  codeSnippet?: {
    code: string;
    language?: string;
  };
  attachmentUrl?: string;
}

const QUICK_EMOJIS = ["❤️", "👍", "🔥", "😂", "😭"];

interface MessagesViewProps {
  initialChatContact?: string | null;
  onClearInitialChat?: () => void;
  onOpenProfile?: (author: {
    handle: string;
    name?: string;
    avatar?: string;
    role?: string;
    fallback?: string;
  }) => void;
}

export function MessagesView({
  initialChatContact,
  onClearInitialChat,
  onOpenProfile,
}: MessagesViewProps) {
  const { user } = useAuth();
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [activeChat, setActiveChat] = useState<string>("");
  const [messageInput, setMessageInput] = useState("");
  const [searchContact, setSearchContact] = useState("");
  const [activeTabFilter, setActiveTabFilter] = useState<"all" | "teams" | "unread">("all");

  // Mobile drawer toggle
  const [mobileShowChat, setMobileShowChat] = useState(false);

  // Twitter style info sidebar
  const [showInfoDrawer, setShowInfoDrawer] = useState(false);

  // "New message" compose dialog
  const [isNewMessageModalOpen, setIsNewMessageModalOpen] = useState(false);
  const [newMsgSearch, setNewMsgSearch] = useState("");
  const [availableDevs, setAvailableDevs] = useState<any[]>([]);

  // Code Snippet drawer / mode
  const [showCodeEditor, setShowCodeEditor] = useState(false);
  const [snippetCode, setSnippetCode] = useState("");
  const [snippetLang, setSnippetLang] = useState("typescript");

  // Emoji popover toggle
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  // Messages dictionary
  const [messages, setMessages] = useState<Record<string, UIMessage[]>>({});
  const [copiedSnippetIdx, setCopiedSnippetIdx] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const activeChatRef = useRef(activeChat);

  useEffect(() => {
    activeChatRef.current = activeChat;
  }, [activeChat]);

  // Fetch registered developers for compose dialog
  useEffect(() => {
    if (isNewMessageModalOpen) {
      api.searchDevelopers().then((devs) => {
        if (Array.isArray(devs)) {
          setAvailableDevs(devs.filter((d) => d.handle?.toLowerCase() !== user?.handle?.toLowerCase()));
        }
      }).catch(() => {});
    }
  }, [isNewMessageModalOpen, user?.handle]);

  // 1. Fetch live conversations from backend
  const loadConversations = useCallback(async () => {
    try {
      const handle = user?.handle;
      if (!handle) {
        setContacts([]);
        setActiveChat("");
        return;
      }
      const myCleanHandle = handle.toLowerCase().replace(/^@/, "");
      const serverConvs = await api.getConversations(handle);
      if (Array.isArray(serverConvs)) {
        const liveContacts: Contact[] = serverConvs.map((conv: any) => {
          const otherHandle =
            conv.participants?.find(
              (p: string) => p.toLowerCase().replace(/^@/, "") !== myCleanHandle
            ) ||
            conv.participants?.[0] ||
            "@collaborator";

          const cleanOther = otherHandle.toLowerCase().replace(/^@/, "");
          const details =
            conv.participantDetails?.find(
              (p: any) => p.handle?.toLowerCase().replace(/^@/, "") === cleanOther
            ) || {};

          const convId = conv._id || conv.id;
          const cleanName = details.name || otherHandle.replace("@", "");
          const isCurrentlyActive = convId === activeChatRef.current;

          // If the user is currently looking at this conversation and it has unread messages, auto-mark seen
          if (isCurrentlyActive && ((conv.unreadCount || 0) > 0 || (conv.unreadCounts && (conv.unreadCounts[handle] || conv.unreadCounts[myCleanHandle]) > 0))) {
            api.markConversationAsSeen(convId, handle).catch(() => {});
          }

          return {
            id: convId,
            name: cleanName,
            handle: otherHandle,
            avatar: details.avatar || "",
            initials: cleanName.slice(0, 2).toUpperCase(),
            project: conv.project || "Team Collaboration",
            lastMsg: conv.lastMessage?.text || conv.lastMessage || "Started conversation",
            time: "Just now",
            unread: isCurrentlyActive
              ? 0
              : conv.unreadCount !== undefined
              ? conv.unreadCount
              : (conv.unreadCounts &&
                  (conv.unreadCounts[handle] || conv.unreadCounts[myCleanHandle])) ||
                0,
            online: true,
            role: details.role || "Developer",
            bio: details.bio || "Active contributor on ProjectBuddy.",
            skills: details.skills || ["TypeScript", "Fullstack"],
            githubUrl: `https://github.com/${cleanOther}`,
            linkedinUrl: `https://www.linkedin.com/search/results/all/?keywords=${encodeURIComponent(cleanName)}`,
            verified: true,
          };
        });

        setContacts(liveContacts);
        if (liveContacts.length > 0) {
          setActiveChat((prev) => {
            const nextChat = prev && liveContacts.some((c) => c.id === prev) ? prev : liveContacts[0].id;
            if (nextChat && handle) {
              api.markConversationAsSeen(nextChat, handle).catch(() => {});
            }
            return nextChat;
          });
        } else {
          setActiveChat("");
        }
      }
    } catch (err) {
      console.warn("Could not load backend conversations:", err);
    }
  }, [user?.handle]);

  useEffect(() => {
    loadConversations();
    const interval = setInterval(loadConversations, 3000);
    return () => clearInterval(interval);
  }, [loadConversations]);

  // 2. Respond to initialChatContact if user clicked "Chat" from Activity or Profile
  useEffect(() => {
    if (!initialChatContact) return;
    const target = initialChatContact.trim();
    const cleanTarget = target.toLowerCase().replace(/^@/, "");

    const match = contacts.find(
      (c) =>
        c.id === target ||
        c.handle.toLowerCase().replace(/^@/, "") === cleanTarget
    );

    if (match) {
      setActiveChat(match.id);
      setMobileShowChat(true);
      onClearInitialChat?.();
    } else {
      const handleWithAt = target.startsWith("@") ? target : `@${target}`;
      const cleanName = cleanTarget.charAt(0).toUpperCase() + cleanTarget.slice(1);

      api.startConversation({
        participant1Handle: user?.handle || "@developer",
        participant1Name: user?.name || "Developer",
        participant1Avatar: user?.avatar || "",
        participant1Role: user?.role || "Developer",
        participant2Handle: handleWithAt,
        participant2Name: cleanName,
        project: "Team Collaboration",
      }).then((res) => {
        const convId = res?.data?._id || res?.data?.id || `chat-live-${Date.now()}`;
        const newContact: Contact = {
          id: convId,
          name: cleanName,
          handle: handleWithAt,
          avatar: `https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80`,
          initials: cleanName.slice(0, 2).toUpperCase(),
          project: "Team Collaboration",
          lastMsg: "Connected on ProjectBuddy! Let's collaborate.",
          time: "Just now",
          unread: 0,
          online: true,
          role: "Team Collaborator",
          bio: `Software developer collaborating with ${user?.name || "you"} on ProjectBuddy.`,
          skills: ["Collaboration", "Git"],
          githubUrl: `https://github.com/${cleanTarget}`,
          linkedinUrl: `https://www.linkedin.com/search/results/all/?keywords=${encodeURIComponent(cleanName)}`,
          verified: true,
        };

        setContacts((prev) => [newContact, ...prev.filter((c) => c.id !== convId)]);
        setActiveChat(convId);
        setMobileShowChat(true);
      }).catch((e) => {
        console.warn("Could not sync conversation start with backend", e);
      });
      onClearInitialChat?.();
    }
  }, [initialChatContact, contacts, user, onClearInitialChat]);

  // 3. Load messages whenever activeChat changes & poll for live read receipts
  useEffect(() => {
    if (!activeChat) return;
    const fetchChatMessages = async () => {
      try {
        const myHandle = (user?.handle || "@pranjal").toLowerCase();
        const serverMsgs = await api.getMessages(activeChat, myHandle);
        const cleanMyHandle = myHandle.replace(/^@/, "");
        if (serverMsgs && serverMsgs.length > 0) {
          setMessages((prev) => ({
            ...prev,
            [activeChat]: serverMsgs.map((m: ChatMessage) => ({
              id: m._id || m.id || `m-${Date.now()}`,
              sender:
                m.senderHandle &&
                m.senderHandle.toLowerCase().replace(/^@/, "") === cleanMyHandle
                  ? ("me" as const)
                  : ("them" as const),
              senderHandle: m.senderHandle,
              senderName: m.senderName,
              senderAvatar: m.senderAvatar,
              text: m.text,
              time: m.time || "Just now",
              status: m.status || (m.seen ? "seen" : "sent"),
              seen: Boolean(m.seen || m.status === "seen"),
            })),
          }));
        }
      } catch (err) {
        console.warn("Could not load backend messages, retaining current messages", err);
      }
    };
    fetchChatMessages();
    const pollInterval = setInterval(fetchChatMessages, 2500);
    return () => clearInterval(pollInterval);
  }, [activeChat, user?.handle]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [activeChat, messages]);

  // Mark current active conversation as seen on backend and reset unread count immediately
  useEffect(() => {
    if (!activeChat || !user?.handle) return;
    api.markConversationAsSeen(activeChat, user.handle).catch(() => {});
    setContacts((prev) =>
      prev.map((c) => (c.id === activeChat ? { ...c, unread: 0 } : c))
    );
  }, [activeChat, user?.handle]);

  const handleSelectContact = (id: string) => {
    setActiveChat(id);
    setMobileShowChat(true);
    // Mark as read locally and on server
    setContacts((prev) =>
      prev.map((c) => (c.id === id ? { ...c, unread: 0 } : c))
    );
    if (user?.handle) {
      api.markConversationAsSeen(id, user.handle).catch(() => {});
    }
  };

  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!messageInput.trim() && !snippetCode.trim()) return;

    const textToSend = messageInput.trim();
    const currentChatId = activeChat;
    const currentTime = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

    const newMsg: UIMessage = {
      id: `msg-${Date.now()}`,
      sender: "me" as const,
      senderHandle: user?.handle || "@developer",
      senderName: user?.name || "Developer",
      senderAvatar: user?.avatar || "",
      text: textToSend || (snippetCode ? "Shared a code snippet:" : ""),
      time: currentTime,
      status: "sent",
      seen: false,
      ...(snippetCode
        ? {
            codeSnippet: {
              code: snippetCode,
              language: snippetLang,
            },
          }
        : {}),
    };

    // Optimistic UI update
    setMessages((prev) => ({
      ...prev,
      [currentChatId]: [...(prev[currentChatId] || []), newMsg],
    }));
    setMessageInput("");
    setSnippetCode("");
    setShowCodeEditor(false);

    // Update contacts list last message
    setContacts((prev) =>
      prev.map((c) =>
        c.id === currentChatId
          ? {
              ...c,
              lastMsg: textToSend || "Shared a code snippet",
              time: "Just now",
            }
          : c
      )
    );

    // Persist to backend
    try {
      await api.sendMessage(currentChatId, textToSend || snippetCode, {
        handle: user?.handle || "@pranjal",
        name: user?.name || "Pranjal",
        avatar: user?.avatar || "",
      });
    } catch (err) {
      console.warn("Backend message send failed, preserved locally", err);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Single reaction per user at a time (Twitter / Slack style)
  const handleToggleReaction = (msgIdx: number, emoji: string) => {
    setMessages((prev) => {
      const currentList = [...(prev[activeChat] || [])];
      const targetMsg = { ...currentList[msgIdx] };
      const currentReactions = { ...(targetMsg.reactions || {}) };
      const previousUserReaction = targetMsg.userReaction;

      if (previousUserReaction === emoji) {
        // User clicked same emoji again -> remove reaction (toggle off)
        if (currentReactions[emoji] > 1) {
          currentReactions[emoji] -= 1;
        } else {
          delete currentReactions[emoji];
        }
        targetMsg.userReaction = undefined;
      } else {
        // User clicked a different emoji or reacted for the first time
        // 1. Remove previous reaction if user already had one
        if (previousUserReaction && currentReactions[previousUserReaction]) {
          if (currentReactions[previousUserReaction] > 1) {
            currentReactions[previousUserReaction] -= 1;
          } else {
            delete currentReactions[previousUserReaction];
          }
        }
        // 2. Add the new reaction
        currentReactions[emoji] = (currentReactions[emoji] || 0) + 1;
        targetMsg.userReaction = emoji;
      }

      targetMsg.reactions = currentReactions;
      currentList[msgIdx] = targetMsg;
      return {
        ...prev,
        [activeChat]: currentList,
      };
    });
  };

  // Start new conversation from "New Message" dialog
  const handleStartNewChatWithUser = async (person: any) => {
    const cleanPersonHandle = (person.handle || "").toLowerCase().replace(/^@/, "");
    const existing = contacts.find(
      (c) => c.handle.toLowerCase().replace(/^@/, "") === cleanPersonHandle
    );

    if (existing) {
      setActiveChat(existing.id);
      setIsNewMessageModalOpen(false);
      setMobileShowChat(true);
      return;
    }

    const cleanName = person.name || person.handle?.replace("@", "") || "Developer";
    setIsNewMessageModalOpen(false);
    setMobileShowChat(true);

    try {
      const res = await api.startConversation({
        participant1Handle: user?.handle || "@developer",
        participant1Name: user?.name || "Developer",
        participant1Avatar: user?.avatar || "",
        participant2Handle: person.handle,
        participant2Name: cleanName,
        participant2Avatar: person.avatar || "",
        project: "Direct Collaboration",
      });

      const conv = res?.data;
      const convId = conv?._id || conv?.id || `chat-${Date.now()}`;

      const newContact: Contact = {
        id: convId,
        name: cleanName,
        handle: person.handle,
        avatar: person.avatar || "",
        initials: (cleanName).slice(0, 2).toUpperCase(),
        project: "Direct Collaboration",
        lastMsg: "Started a conversation",
        time: "Just now",
        unread: 0,
        online: true,
        role: person.role || "Developer",
        bio: person.bio || "Building on ProjectBuddy.",
        skills: person.skills || ["TypeScript", "Next.js"],
        githubUrl: person.githubUrl || `https://github.com/${cleanPersonHandle}`,
        linkedinUrl: person.linkedinUrl,
        verified: true,
      };

      setContacts((prev) => [newContact, ...prev.filter((c) => c.id !== convId)]);
      setActiveChat(convId);
    } catch (err) {
      console.warn("Could not start conversation:", err);
    }
  };

  const handleCopyCode = (code: string, id: string) => {
    navigator.clipboard.writeText(code);
    setCopiedSnippetIdx(id);
    setTimeout(() => setCopiedSnippetIdx(null), 2000);
  };

  const currentContact = contacts.find((c) => c.id === activeChat) || (contacts.length > 0 ? contacts[0] : null);

  // Filtering contact list
  const filteredContacts = contacts.filter((c) => {
    if (activeTabFilter === "unread" && c.unread === 0) return false;
    if (activeTabFilter === "teams" && !c.project) return false;

    if (!searchContact.trim()) return true;
    const q = searchContact.toLowerCase();
    return (
      c.name.toLowerCase().includes(q) ||
      c.handle.toLowerCase().includes(q) ||
      c.project.toLowerCase().includes(q) ||
      c.role.toLowerCase().includes(q)
    );
  });

  const chatMessages = messages[activeChat] || [];

  return (
    <div className="flex flex-1 w-full h-full max-h-full overflow-hidden bg-[var(--bg-canvas)] select-none">
      {/* ── LEFT PANE: Twitter-Style Direct Messages Navigation (320px - 380px) ── */}
      <div
        className={`${
          mobileShowChat ? "hidden md:flex" : "flex"
        } w-full md:w-80 lg:w-[380px] shrink-0 border-r border-[var(--border-subtle)] bg-[var(--bg-surface-low)] flex-col h-full`}
      >
        {/* Twitter Header */}
        <div className="p-4 border-b border-[var(--border-subtle)] flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h1 className="font-bold text-white text-lg tracking-tight">
                Messages
              </h1>
              {(() => {
                const totalUnread = contacts.reduce((sum, c) => sum + (c.unread || 0), 0);
                return totalUnread > 0 ? (
                  <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-[#1d9bf0] text-white">
                    {totalUnread}
                  </span>
                ) : null;
              })()}
            </div>

            {/* Twitter-style action buttons (Compose New Message) */}
            <div className="flex items-center gap-1">
              <button
                onClick={() => setIsNewMessageModalOpen(true)}
                className="p-2 rounded-full hover:bg-white/10 text-white transition-colors cursor-pointer group"
                title="New message (Ctrl+M)"
              >
                <SquarePen className="size-4.5 text-white group-hover:scale-105 transition-transform" />
              </button>
            </div>
          </div>

          {/* Twitter Search Bar */}
          <div className="relative">
            <Search className="absolute left-3.5 top-2.5 size-4 text-[var(--text-muted)]" />
            <input
              type="text"
              value={searchContact}
              onChange={(e) => setSearchContact(e.target.value)}
              placeholder="Search Direct Messages"
              className="w-full h-9 pl-9 pr-8 rounded-full bg-[var(--bg-surface-container)] border border-transparent focus:border-[#1d9bf0] text-xs text-white placeholder:text-[var(--text-muted)] focus:outline-none transition-all"
            />
            {searchContact && (
              <button
                onClick={() => setSearchContact("")}
                className="absolute right-3 top-2.5 text-xs text-zinc-400 hover:text-white"
              >
                <X className="size-3.5" />
              </button>
            )}
          </div>

          {/* Twitter Category Tabs: All | Teams | Unread */}
          <div className="flex items-center gap-1 p-0.5 rounded-lg bg-[var(--bg-surface-container)] border border-[var(--border-subtle)]">
            <button
              onClick={() => setActiveTabFilter("all")}
              className={`flex-1 py-1 text-center rounded-md text-xs font-medium transition-colors cursor-pointer ${
                activeTabFilter === "all"
                  ? "bg-white text-black font-semibold shadow-sm"
                  : "text-[var(--text-secondary)] hover:text-white"
              }`}
            >
              All
            </button>
            <button
              onClick={() => setActiveTabFilter("teams")}
              className={`flex-1 py-1 text-center rounded-md text-xs font-medium transition-colors cursor-pointer ${
                activeTabFilter === "teams"
                  ? "bg-white text-black font-semibold shadow-sm"
                  : "text-[var(--text-secondary)] hover:text-white"
              }`}
            >
              Teams
            </button>
            <button
              onClick={() => setActiveTabFilter("unread")}
              className={`flex-1 py-1 text-center rounded-md text-xs font-medium transition-colors cursor-pointer flex items-center justify-center gap-1 ${
                activeTabFilter === "unread"
                  ? "bg-white text-black font-semibold shadow-sm"
                  : "text-[var(--text-secondary)] hover:text-white"
              }`}
            >
              <span>Unread</span>
              {contacts.some((c) => c.unread > 0) && (
                <span className="size-1.5 rounded-full bg-[#1d9bf0]" />
              )}
            </button>
          </div>
        </div>

        {/* Twitter Conversation List */}
        <div className="overflow-y-auto flex-1 divide-y divide-[var(--border-subtle)]">
          {filteredContacts.length === 0 ? (
            <div className="p-8 text-center flex flex-col items-center gap-3">
              <div className="size-12 rounded-full bg-[var(--bg-surface-container)] flex items-center justify-center text-zinc-500">
                <MessageSquare className="size-6" />
              </div>
              <p className="text-xs text-[var(--text-muted)] max-w-xs">
                No direct messages matching your criteria.
              </p>
              <Button
                size="sm"
                onClick={() => setIsNewMessageModalOpen(true)}
                className="mt-1 h-8 text-xs bg-white text-black font-semibold rounded-full"
              >
                Start a Conversation
              </Button>
            </div>
          ) : (
            filteredContacts.map((contact) => {
              const isSelected = activeChat === contact.id;
              return (
                <button
                  key={contact.id}
                  onClick={() => handleSelectContact(contact.id)}
                  className={`w-full p-3.5 flex gap-3 text-left transition-colors cursor-pointer relative group ${
                    isSelected
                      ? "bg-white/[0.08] border-r-2 border-[#1d9bf0]"
                      : "hover:bg-white/[0.04]"
                  }`}
                >
                  {/* Avatar with Twitter presence ring */}
                  <div className="relative shrink-0 mt-0.5">
                    <Avatar
                      src={contact.avatar}
                      fallback={contact.initials}
                      size="md"
                      className="border border-white/10"
                    />
                    {contact.online && (
                      <span className="absolute bottom-0 right-0 size-3 rounded-full bg-emerald-500 ring-2 ring-[var(--bg-surface-low)]" />
                    )}
                  </div>

                  <div className="flex-1 min-w-0 flex flex-col gap-0.5">
                    {/* Top Row: Name + Verified Check + Handle + Time */}
                    <div className="flex items-center justify-between gap-1">
                      <div className="flex items-center gap-1 min-w-0">
                        <span className="text-sm font-bold text-white truncate">
                          {contact.name}
                        </span>
                        {contact.verified && (
                          <span className="text-[#1d9bf0] shrink-0" title="Verified Collaborator">
                            <ShieldCheck className="size-3.5 fill-[#1d9bf0] text-black" />
                          </span>
                        )}
                        <span className="text-xs text-[var(--text-muted)] truncate font-mono">
                          {contact.handle}
                        </span>
                      </div>
                      <span className="text-[10px] text-[var(--text-muted)] font-mono shrink-0">
                        {contact.time}
                      </span>
                    </div>

                    {/* Second Row: Project collaboration tag */}
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-white/5 text-zinc-300 border border-white/10 truncate">
                        {contact.project}
                      </span>
                    </div>

                    {/* Third Row: Last Message + Unread Pill */}
                    <div className="flex items-center justify-between gap-2 mt-0.5">
                      <p
                        className={`text-xs truncate leading-snug ${
                          contact.unread > 0
                            ? "text-white font-semibold"
                            : "text-[var(--text-secondary)]"
                        }`}
                      >
                        {contact.lastMsg}
                      </p>
                      {contact.unread > 0 && (
                        <span className="size-4.5 rounded-full bg-[#1d9bf0] text-white text-[10px] font-bold flex items-center justify-center shrink-0">
                          {contact.unread}
                        </span>
                      )}
                    </div>
                  </div>
                </button>
              );
            })
          )}
        </div>
      </div>

      {/* ── MIDDLE PANE: Twitter-Style Active Conversation Thread ── */}
      <div
        className={`${
          mobileShowChat ? "flex" : "hidden md:flex"
        } flex-1 flex-col h-full max-h-full bg-[var(--bg-canvas)] min-w-0 relative overflow-hidden`}
      >
        {/* Twitter Sticky Header */}
        {currentContact ? (
          <>
            <div className="h-14 px-4 sm:px-6 border-b border-[var(--border-subtle)] flex items-center justify-between bg-[var(--bg-surface-low)]/80 backdrop-blur-md shrink-0 sticky top-0 z-10">
              <div className="flex items-center gap-3 min-w-0">
                {/* Mobile Back Button */}
                <button
                  onClick={() => setMobileShowChat(false)}
                  className="md:hidden p-1.5 -ml-1 text-[var(--text-muted)] hover:text-white hover:bg-white/10 rounded-full transition-colors cursor-pointer"
                  title="Back to conversations"
                >
                  <ArrowLeft className="size-5" />
                </button>

                {/* Clickable User Header to open profile */}
                <div
                  onClick={() => {
                    onOpenProfile?.({
                      handle: currentContact.handle,
                      name: currentContact.name,
                      avatar: currentContact.avatar,
                      role: currentContact.role,
                      fallback: currentContact.initials,
                    });
                  }}
                  className="flex items-center gap-3 min-w-0 cursor-pointer group/header hover:opacity-90 transition-opacity"
                  title={`Click to view ${currentContact.name}'s profile`}
                >
                  <div className="relative shrink-0">
                    <Avatar
                      src={currentContact.avatar}
                      fallback={currentContact.initials}
                      size="sm"
                      className="border border-white/10 group-hover/header:ring-2 group-hover/header:ring-[#1d9bf0] transition-all"
                    />
                    {currentContact.online && (
                      <span className="absolute bottom-0 right-0 size-2.5 rounded-full bg-emerald-500 ring-1 ring-[var(--bg-surface-low)]" />
                    )}
                  </div>

                  <div className="flex flex-col min-w-0">
                    <div className="flex items-center gap-1.5 min-w-0">
                      <h2 className="text-sm font-bold text-white truncate group-hover/header:text-[#1d9bf0] group-hover/header:underline transition-colors">
                        {currentContact.name}
                      </h2>
                      {currentContact.verified && (
                        <ShieldCheck className="size-3.5 fill-[#1d9bf0] text-black shrink-0" />
                      )}
                      <span className="text-xs text-[var(--text-muted)] font-mono truncate hidden sm:inline">
                        {currentContact.handle}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] text-emerald-400 font-mono flex items-center gap-1">
                        <Circle className="size-1.5 fill-emerald-400" />
                        <span>{currentContact.online ? "Active now" : "Recently active"}</span>
                      </span>
                      <span className="text-[10px] text-zinc-500 font-mono hidden sm:inline">·</span>
                      <span className="text-[10px] text-zinc-400 truncate hidden sm:inline">
                        {currentContact.project}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Twitter Action Tools in Header */}
              <div className="flex items-center gap-1 sm:gap-2 shrink-0">
                {/* GitHub external profile */}
                {currentContact.githubUrl && (
                  <a
                    href={currentContact.githubUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 rounded-full hover:bg-white/10 text-zinc-400 hover:text-white transition-colors cursor-pointer"
                    title={`${currentContact.name}'s GitHub`}
                  >
                    <GithubIcon className="size-4" />
                  </a>
                )}

                {/* LinkedIn external profile */}
                {currentContact.linkedinUrl && (
                  <a
                    href={currentContact.linkedinUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 rounded-full hover:bg-[#0077b5]/20 text-[#38bdf8] hover:text-[#70b5f9] transition-colors cursor-pointer"
                    title={`${currentContact.name}'s LinkedIn`}
                  >
                    <LinkedinIcon className="size-4" />
                  </a>
                )}

                {/* Twitter Info Drawer toggle button */}
                <button
                  onClick={() => setShowInfoDrawer(!showInfoDrawer)}
                  className={`p-2 rounded-full transition-colors cursor-pointer ${
                    showInfoDrawer
                      ? "bg-white/20 text-white"
                      : "hover:bg-white/10 text-zinc-400 hover:text-white"
                  }`}
                  title="Conversation details"
                >
                  <Info className="size-4" />
                </button>
              </div>
            </div>

        {/* Message Stream Scroll Area */}
        <div className="flex-1 p-3.5 sm:p-5 overflow-y-auto overflow-x-hidden flex flex-col gap-4 min-h-0 w-full max-w-full">
          {/* Twitter-style Profile Card Banner at Top of Thread */}
          {currentContact && (
            <div className="py-6 border-b border-[var(--border-subtle)] flex flex-col items-center text-center gap-3 max-w-md mx-auto w-full animate-in fade-in duration-300">
              <div className="relative">
                <Avatar
                  src={currentContact.avatar}
                  fallback={currentContact.initials}
                  size="lg"
                  className="size-18 border-2 border-white/20 shadow-xl"
                />
                {currentContact.online && (
                  <span className="absolute bottom-1 right-1 size-3.5 rounded-full bg-emerald-500 ring-2 ring-black" />
                )}
              </div>

              <div className="flex flex-col items-center gap-1">
                <div className="flex items-center gap-1.5">
                  <h3 className="text-base font-bold text-white">
                    {currentContact.name}
                  </h3>
                  {currentContact.verified && (
                    <ShieldCheck className="size-4 fill-[#1d9bf0] text-black" />
                  )}
                </div>
                <span className="text-xs text-[var(--text-muted)] font-mono">
                  {currentContact.handle} · {currentContact.role}
                </span>
                {currentContact.bio && (
                  <p className="text-xs text-[var(--text-secondary)] mt-1 max-w-sm leading-relaxed">
                    {currentContact.bio}
                  </p>
                )}
              </div>

              {/* Project Badge */}
              <div className="flex items-center gap-2 p-2 rounded-xl bg-[var(--bg-surface-low)] border border-[var(--border-subtle)] text-xs text-zinc-300">
                <Sparkles className="size-3.5 text-[#1d9bf0]" />
                <span>Connected on <strong>{currentContact.project}</strong></span>
              </div>

              {/* Social Link Badges */}
              <div className="flex items-center gap-2">
                {currentContact.githubUrl && (
                  <a
                    href={currentContact.githubUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono bg-white/10 hover:bg-white/20 text-white border border-white/20 transition-colors"
                  >
                    <GithubIcon className="size-3" />
                    <span>GitHub</span>
                    <ExternalLink className="size-2.5 opacity-60" />
                  </a>
                )}
                {currentContact.linkedinUrl && (
                  <a
                    href={currentContact.linkedinUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono bg-[#0077b5]/15 hover:bg-[#0077b5]/25 text-[#38bdf8] border border-[#0077b5]/30 transition-colors"
                  >
                    <LinkedinIcon className="size-3" />
                    <span>LinkedIn</span>
                    <ExternalLink className="size-2.5 opacity-60" />
                  </a>
                )}
              </div>

              {/* Date Divider */}
              <div className="w-full flex items-center gap-3 pt-4">
                <div className="flex-1 h-px bg-[var(--border-subtle)]" />
                <span className="text-[11px] font-mono text-[var(--text-muted)] uppercase tracking-wider">
                  Today
                </span>
                <div className="flex-1 h-px bg-[var(--border-subtle)]" />
              </div>
            </div>
          )}

          {/* Messages Loop */}
          {chatMessages.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-8 gap-3">
              <div className="size-14 rounded-full bg-[var(--bg-surface-container)] flex items-center justify-center text-zinc-500">
                <MessageSquare className="size-7" />
              </div>
              <h4 className="text-sm font-bold text-white">No messages yet</h4>
              <p className="text-xs text-[var(--text-muted)] max-w-xs">
                Send a greeting or share code to get the team conversation started!
              </p>
            </div>
          ) : (
            chatMessages.map((msg, idx) => {
              const isMe = msg.sender === "me";
              const senderAvatar = msg.senderAvatar || currentContact?.avatar;
              const senderName = msg.senderName || currentContact?.name || "Developer";
              const senderHandle = msg.senderHandle || currentContact?.handle || "@developer";

              return (
                <div
                  key={msg.id || idx}
                  className={`flex gap-2.5 items-end w-full max-w-full min-w-0 ${
                    isMe ? "justify-end" : "justify-start"
                  } group/msg relative`}
                >
                  {/* Incoming Sender Avatar */}
                  {!isMe && (
                    <div
                      onClick={() => {
                        onOpenProfile?.({
                          handle: senderHandle,
                          name: senderName,
                          avatar: senderAvatar,
                          role: currentContact?.role || "Developer",
                          fallback: senderName.slice(0, 2).toUpperCase(),
                        });
                      }}
                      className="shrink-0 cursor-pointer hover:opacity-85 transition-opacity mb-4"
                      title={`Click to view ${senderName}'s profile`}
                    >
                      <Avatar
                        src={senderAvatar}
                        fallback={senderName.slice(0, 2).toUpperCase()}
                        size="sm"
                        className="size-8 border border-white/10 hover:ring-2 hover:ring-[#1d9bf0] transition-all"
                      />
                    </div>
                  )}

                  {/* Bubble Container */}
                  <div
                    className={`relative max-w-[85%] sm:max-w-[70%] min-w-0 group/bubble flex flex-col ${
                      isMe ? "items-end" : "items-start"
                    }`}
                  >
                    {/* Incoming Sender Name Label */}
                    {!isMe && (
                      <div className="flex items-center gap-1.5 mb-1 px-1">
                        <span
                          onClick={() => {
                            onOpenProfile?.({
                              handle: senderHandle,
                              name: senderName,
                              avatar: senderAvatar,
                              role: currentContact?.role || "Developer",
                              fallback: senderName.slice(0, 2).toUpperCase(),
                            });
                          }}
                          className="text-[11px] font-semibold text-white/90 hover:text-[#1d9bf0] hover:underline cursor-pointer"
                        >
                          {senderName}
                        </span>
                        <span className="text-[10px] text-[var(--text-muted)] font-mono">
                          {senderHandle}
                        </span>
                      </div>
                    )}

                    {/* Hover Reaction Toolbar (Twitter Style - 1 reaction per user) */}
                    <div
                      className={`absolute -top-7 hidden group-hover/bubble:flex items-center gap-1 px-2 py-0.5 rounded-full bg-[var(--bg-surface-high)] border border-[var(--border-strong)] shadow-lg z-20 transition-all ${
                        isMe ? "right-0" : "left-0"
                      }`}
                    >
                      {QUICK_EMOJIS.map((emoji) => {
                        const isSelected = msg.userReaction === emoji;
                        return (
                          <button
                            key={emoji}
                            type="button"
                            onClick={() => handleToggleReaction(idx, emoji)}
                            className={`hover:scale-125 transition-all text-xs p-1 rounded-full cursor-pointer ${
                              isSelected
                                ? "bg-[#1d9bf0]/30 ring-1 ring-[#1d9bf0] scale-110"
                                : "hover:bg-white/10"
                            }`}
                            title={isSelected ? `Remove ${emoji}` : `React with ${emoji}`}
                          >
                            {emoji}
                          </button>
                        );
                      })}
                    </div>

                    {/* Text Pill */}
                    <div
                      className={`p-3.5 text-xs sm:text-sm leading-relaxed break-words [overflow-wrap:anywhere] max-w-full overflow-hidden shadow-sm transition-all ${
                        isMe
                          ? "bg-[#1d9bf0] text-white font-normal rounded-2xl rounded-br-sm shadow-blue-500/10"
                          : "bg-[var(--bg-surface-container)] text-white border border-[var(--border-subtle)] rounded-2xl rounded-bl-sm"
                      }`}
                    >
                      {msg.text}

                      {/* Code Snippet Card (if attached) */}
                      {msg.codeSnippet && (
                        <div className="mt-2.5 rounded-xl bg-black/70 border border-white/10 overflow-hidden text-left font-mono max-w-full w-full">
                          <div className="px-3 py-1.5 bg-white/5 border-b border-white/10 flex items-center justify-between text-[11px] text-zinc-400">
                            <span className="truncate">{msg.codeSnippet.language || "code"}</span>
                            <button
                              onClick={() =>
                                handleCopyCode(msg.codeSnippet!.code, `snip-${idx}`)
                              }
                              className="hover:text-white flex items-center gap-1 cursor-pointer shrink-0 ml-2"
                            >
                              {copiedSnippetIdx === `snip-${idx}` ? (
                                <>
                                  <Check className="size-3 text-emerald-400" />
                                  <span>Copied</span>
                                </>
                              ) : (
                                <>
                                  <Copy className="size-3" />
                                  <span>Copy</span>
                                </>
                              )}
                            </button>
                          </div>
                          <pre className="p-3 text-[11px] leading-relaxed overflow-x-auto max-w-full text-emerald-300">
                            <code>{msg.codeSnippet.code}</code>
                          </pre>
                        </div>
                      )}
                    </div>

                    {/* Floating Reaction Badges (Twitter style - 1 reaction per user) */}
                    {msg.reactions && Object.keys(msg.reactions).length > 0 && (
                      <div
                        className={`flex items-center gap-1 mt-1 ${
                          isMe ? "justify-end" : "justify-start"
                        }`}
                      >
                        {Object.entries(msg.reactions).map(([emoji, count]) => {
                          const isMyReaction = msg.userReaction === emoji;
                          return (
                            <button
                              key={emoji}
                              type="button"
                              onClick={() => handleToggleReaction(idx, emoji)}
                              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] transition-all cursor-pointer select-none ${
                                isMyReaction
                                  ? "bg-[#1d9bf0]/25 border border-[#1d9bf0] text-[#1d9bf0] font-semibold"
                                  : "bg-[var(--bg-surface-high)] border border-[var(--border-subtle)] text-white hover:bg-white/10"
                              }`}
                              title={
                                isMyReaction
                                  ? "Click to remove your reaction"
                                  : `React with ${emoji}`
                              }
                            >
                              <span>{emoji}</span>
                              <span className="font-mono text-[10px]">{count}</span>
                            </button>
                          );
                        })}
                      </div>
                    )}

                    {/* Micro Timestamp & Read Receipt */}
                    <div className="flex items-center gap-1.5 mt-1 px-1">
                      <span className="text-[10px] text-[var(--text-muted)] font-mono">
                        {msg.time}
                      </span>
                      {isMe && (
                        <span className="flex items-center gap-1 text-[10px] font-mono">
                          {msg.seen || msg.status === "seen" ? (
                            <span
                              className="flex items-center gap-0.5 text-[#38bdf8]"
                              title="Seen"
                            >
                              <CheckCheck className="size-3.5 stroke-[2.5] text-[#38bdf8]" />
                            </span>
                          ) : (
                            <span
                              className="flex items-center gap-0.5 text-zinc-400"
                              title="Sent"
                            >
                              <Check className="size-3 stroke-[2] text-zinc-400" />
                            </span>
                          )}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Outgoing My Avatar */}
                  {isMe && (
                    <div
                      onClick={() => {
                        onOpenProfile?.({
                          handle: user?.handle || "@developer",
                          name: user?.name || "Developer",
                          avatar: user?.avatar,
                          role: user?.role || "Developer",
                          fallback: (user?.name || "ME").slice(0, 2).toUpperCase(),
                        });
                      }}
                      className="shrink-0 cursor-pointer hover:opacity-85 transition-opacity mb-4 hidden sm:block"
                      title="Click to view your profile"
                    >
                      <Avatar
                        src={user?.avatar}
                        fallback={(user?.name || "ME").slice(0, 2).toUpperCase()}
                        size="sm"
                        className="size-8 border border-white/10 hover:ring-2 hover:ring-white/40 transition-all"
                      />
                    </div>
                  )}
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* ── Twitter-Style Compose Bar ── */}
        <div className="p-3 sm:p-4 border-t border-[var(--border-subtle)] bg-[var(--bg-surface-low)] shrink-0 w-full max-w-full">
          {/* Code Snippet Drawer (if toggled) */}
          {showCodeEditor && (
            <div className="mb-3 p-3 rounded-xl bg-black border border-white/20 flex flex-col gap-2 w-full max-w-full overflow-hidden">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Code2 className="size-4 text-emerald-400" />
                  <span className="text-xs font-semibold text-white">
                    Send Code Snippet
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <select
                    value={snippetLang}
                    onChange={(e) => setSnippetLang(e.target.value)}
                    className="h-6 px-2 rounded bg-[var(--bg-surface-high)] border border-white/10 text-[11px] text-white focus:outline-none"
                  >
                    <option value="typescript">TypeScript</option>
                    <option value="javascript">JavaScript</option>
                    <option value="python">Python</option>
                    <option value="rust">Rust</option>
                    <option value="go">Go</option>
                    <option value="sql">SQL</option>
                  </select>
                  <button
                    onClick={() => setShowCodeEditor(false)}
                    className="text-zinc-400 hover:text-white"
                  >
                    <X className="size-4" />
                  </button>
                </div>
              </div>
              <textarea
                value={snippetCode}
                onChange={(e) => setSnippetCode(e.target.value)}
                placeholder="Paste your code snippet here..."
                rows={3}
                className="w-full font-mono text-xs p-2 rounded-lg bg-[var(--bg-surface-container)] text-emerald-300 placeholder:text-zinc-600 focus:outline-none border border-transparent focus:border-white/20 resize-none max-w-full"
              />
            </div>
          )}

          {/* Quick Emoji Picker Drawer (if toggled) */}
          {showEmojiPicker && (
            <div className="mb-2 p-2 rounded-xl bg-[var(--bg-surface-high)] border border-[var(--border-strong)] flex items-center gap-2 shadow-lg max-w-full overflow-x-auto">
              <span className="text-[10px] font-mono text-zinc-400 px-1 shrink-0">Quick:</span>
              <div className="flex items-center gap-1.5 flex-wrap">
                {QUICK_EMOJIS.map((e) => (
                  <button
                    key={e}
                    onClick={() => {
                      setMessageInput((prev) => prev + e);
                      setShowEmojiPicker(false);
                      inputRef.current?.focus();
                    }}
                    className="hover:scale-125 transition-transform text-base p-1 cursor-pointer"
                  >
                    {e}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Twitter Input Pill */}
          <form
            onSubmit={handleSendMessage}
            className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[var(--bg-surface-container)] border border-[var(--border-subtle)] focus-within:border-[#1d9bf0] transition-colors w-full min-w-0 max-w-full"
          >
            {/* Attachment Icons on Left */}
            <div className="flex items-center gap-1 text-zinc-400 shrink-0">
              <button
                type="button"
                onClick={() => setShowCodeEditor(!showCodeEditor)}
                className={`p-1.5 rounded-full hover:bg-white/10 hover:text-white transition-colors cursor-pointer ${
                  showCodeEditor ? "text-emerald-400 bg-white/10" : ""
                }`}
                title="Send Code Snippet"
              >
                <Code2 className="size-4" />
              </button>

              <button
                type="button"
                onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                className={`p-1.5 rounded-full hover:bg-white/10 hover:text-white transition-colors cursor-pointer ${
                  showEmojiPicker ? "text-amber-400 bg-white/10" : ""
                }`}
                title="Insert Emoji"
              >
                <Smile className="size-4" />
              </button>
            </div>

            {/* Input field */}
            <input
              ref={inputRef}
              type="text"
              value={messageInput}
              onChange={(e) => setMessageInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Start a new message"
              className="flex-1 min-w-0 bg-transparent py-2 text-xs sm:text-sm text-white placeholder:text-[var(--text-muted)] focus:outline-none"
            />

            {/* Send Button on Right (Lights up Twitter blue when active) */}
            <button
              type="submit"
              disabled={!messageInput.trim() && !snippetCode.trim()}
              className={`p-2 rounded-full transition-all cursor-pointer shrink-0 ${
                messageInput.trim() || snippetCode.trim()
                  ? "bg-[#1d9bf0] text-white hover:bg-[#1a8cd8] shadow-md shadow-blue-500/20 scale-100"
                  : "text-zinc-600 cursor-not-allowed opacity-50"
              }`}
              title="Send message (Enter)"
            >
              <Send className="size-3.5" />
            </button>
          </form>
        </div>
      </>
    ) : (
      <div className="flex-1 flex flex-col items-center justify-center p-8 text-center max-w-sm mx-auto gap-4">
        <div className="p-4 rounded-full bg-white/5 border border-white/10 text-white">
          <SquarePen className="size-8 text-[#1d9bf0]" />
        </div>
        <div className="flex flex-col gap-1.5">
          <h2 className="text-xl font-bold text-white tracking-tight">Select a message</h2>
          <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
            Choose from your existing conversations, start a new one, or chat with accepted team members.
          </p>
        </div>
        <Button
          onClick={() => setIsNewMessageModalOpen(true)}
          className="bg-[#1d9bf0] hover:bg-[#1a8cd8] text-white rounded-full font-bold px-5 text-xs h-9 shadow-lg shadow-blue-500/20"
        >
          New message
        </Button>
      </div>
    )}
  </div>

      {/* ── RIGHT PANE: Twitter-Style Conversation Details Drawer ── */}
      {showInfoDrawer && currentContact && (
        <div className="w-72 lg:w-80 shrink-0 border-l border-[var(--border-subtle)] bg-[var(--bg-surface-low)] flex flex-col h-full overflow-y-auto animate-in slide-in-from-right duration-200">
          <div className="p-4 border-b border-[var(--border-subtle)] flex items-center justify-between">
            <h3 className="font-bold text-white text-sm">Conversation Info</h3>
            <button
              onClick={() => setShowInfoDrawer(false)}
              className="p-1 rounded-lg text-zinc-400 hover:text-white hover:bg-white/10 transition-colors"
            >
              <X className="size-4" />
            </button>
          </div>

          <div className="p-4 flex flex-col gap-5">
            {/* User Profile Overview */}
            <div
              onClick={() => {
                onOpenProfile?.({
                  handle: currentContact.handle,
                  name: currentContact.name,
                  avatar: currentContact.avatar,
                  role: currentContact.role,
                  fallback: currentContact.initials,
                });
              }}
              className="flex flex-col items-center text-center gap-2 p-3 rounded-xl bg-[var(--bg-surface-container)] border border-[var(--border-subtle)] cursor-pointer hover:border-[#1d9bf0]/50 transition-all group/info"
              title="Click to view full profile"
            >
              <Avatar
                src={currentContact.avatar}
                fallback={currentContact.initials}
                size="lg"
                className="size-16 border-2 border-white/10 group-hover/info:ring-2 group-hover/info:ring-[#1d9bf0] transition-all"
              />
              <div className="flex flex-col items-center">
                <div className="flex items-center gap-1">
                  <span className="font-bold text-sm text-white group-hover/info:text-[#1d9bf0] transition-colors">
                    {currentContact.name}
                  </span>
                  {currentContact.verified && (
                    <ShieldCheck className="size-3.5 fill-[#1d9bf0] text-black" />
                  )}
                </div>
                <span className="text-xs text-[var(--text-muted)] font-mono">
                  {currentContact.handle}
                </span>
                <span className="text-xs text-zinc-300 font-medium mt-1">
                  {currentContact.role}
                </span>
              </div>
              <Button
                size="sm"
                className="w-full mt-2 h-7 text-xs bg-white/10 hover:bg-white/20 text-white border border-white/20 rounded-lg pointer-events-none"
              >
                View Full Profile →
              </Button>
            </div>

            {/* Bio */}
            {currentContact.bio && (
              <div>
                <span className="text-[11px] font-mono text-[var(--text-muted)] uppercase tracking-wider block mb-1">
                  Bio
                </span>
                <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                  {currentContact.bio}
                </p>
              </div>
            )}

            {/* Verified Skills */}
            {currentContact.skills && currentContact.skills.length > 0 && (
              <div>
                <span className="text-[11px] font-mono text-[var(--text-muted)] uppercase tracking-wider block mb-1.5">
                  Verified Skills
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {currentContact.skills.map((skill) => (
                    <span
                      key={skill}
                      className="px-2 py-0.5 rounded-md text-[10px] font-mono bg-white/5 border border-white/10 text-white"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Social Links */}
            <div>
              <span className="text-[11px] font-mono text-[var(--text-muted)] uppercase tracking-wider block mb-2">
                Social Profiles
              </span>
              <div className="flex flex-col gap-2">
                {currentContact.githubUrl && (
                  <a
                    href={currentContact.githubUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between p-2.5 rounded-lg bg-[var(--bg-surface-container)] hover:bg-[var(--bg-surface-high)] border border-[var(--border-subtle)] text-xs text-white transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <GithubIcon className="size-4" />
                      <span>GitHub Profile</span>
                    </div>
                    <ExternalLink className="size-3 text-zinc-400" />
                  </a>
                )}
                {currentContact.linkedinUrl && (
                  <a
                    href={currentContact.linkedinUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between p-2.5 rounded-lg bg-[#0077b5]/10 hover:bg-[#0077b5]/20 border border-[#0077b5]/30 text-xs text-[#38bdf8] transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <LinkedinIcon className="size-4" />
                      <span>LinkedIn Profile</span>
                    </div>
                    <ExternalLink className="size-3 opacity-60" />
                  </a>
                )}
              </div>
            </div>

            {/* Shared Project */}
            <div>
              <span className="text-[11px] font-mono text-[var(--text-muted)] uppercase tracking-wider block mb-1">
                Project Channel
              </span>
              <div className="p-2.5 rounded-lg bg-[var(--bg-surface-container)] border border-[var(--border-subtle)] text-xs">
                <span className="font-semibold text-white block">
                  {currentContact.project}
                </span>
                <span className="text-[11px] text-zinc-400 font-mono mt-0.5 block">
                  Encrypted Team DM
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Twitter-Style "New Message" Compose Dialog ── */}
      {isNewMessageModalOpen && (
        <Dialog
          open={isNewMessageModalOpen}
          onOpenChange={setIsNewMessageModalOpen}
        >
          <DialogHeader onClose={() => setIsNewMessageModalOpen(false)}>
            <div className="flex items-center gap-2 text-white">
              <SquarePen className="size-5 text-[#1d9bf0]" />
              <span>New message</span>
            </div>
          </DialogHeader>

          <div className="flex flex-col gap-4 mt-3">
            {/* Search Person Bar */}
            <div className="relative">
              <Search className="absolute left-3 top-2.5 size-4 text-[var(--text-muted)]" />
              <input
                type="text"
                value={newMsgSearch}
                onChange={(e) => setNewMsgSearch(e.target.value)}
                placeholder="Search people or handle..."
                autoFocus
                className="w-full h-9 pl-9 pr-3 rounded-full bg-[var(--bg-surface-container)] border border-[var(--border-subtle)] text-xs text-white placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[#1d9bf0]"
              />
            </div>

            {/* Available Collaborators List from Platform */}
            <div className="flex flex-col gap-1 max-h-72 overflow-y-auto divide-y divide-[var(--border-subtle)]">
              {availableDevs.length === 0 ? (
                <div className="p-6 text-center text-xs text-[var(--text-secondary)]">
                  {newMsgSearch ? "No developers found matching search query." : "No other registered developers found."}
                </div>
              ) : (
                availableDevs
                  .filter((p) => {
                    if (!newMsgSearch.trim()) return true;
                    const q = newMsgSearch.toLowerCase();
                    return (
                      (p.name && p.name.toLowerCase().includes(q)) ||
                      (p.handle && p.handle.toLowerCase().includes(q)) ||
                      (p.role && p.role.toLowerCase().includes(q))
                    );
                  })
                  .map((person) => (
                    <button
                      key={person.id || person._id || person.handle}
                      onClick={() => handleStartNewChatWithUser(person)}
                      className="p-3 flex items-center justify-between gap-3 text-left hover:bg-[var(--bg-surface-container)] rounded-xl transition-colors cursor-pointer group"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <Avatar
                          src={person.avatar}
                          fallback={person.initials || (person.name || "DV").slice(0, 2).toUpperCase()}
                          size="md"
                          className="border border-white/10"
                        />
                        <div className="flex flex-col min-w-0">
                          <div className="flex items-center gap-1">
                            <span className="text-sm font-bold text-white truncate group-hover:text-[#1d9bf0] transition-colors">
                              {person.name || person.handle}
                            </span>
                            <span className="text-xs text-[var(--text-muted)] font-mono truncate">
                              {person.handle}
                            </span>
                          </div>
                          <span className="text-xs text-zinc-400 truncate">
                            {person.role || "Developer"}
                          </span>
                        </div>
                      </div>

                      <div className="p-1.5 rounded-full bg-white/10 group-hover:bg-[#1d9bf0] text-white transition-colors shrink-0">
                        <UserPlus className="size-4" />
                      </div>
                    </button>
                  ))
              )}
            </div>
          </div>
        </Dialog>
      )}
    </div>
  );
}
