"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  Send,
  Circle,
  ArrowLeft,
  Search,
  CheckCheck,
  Sparkles,
  MessageSquare,
} from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";

interface Contact {
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
}

export function MessagesView() {
  const [activeChat, setActiveChat] = useState("chat-1");
  const [messageInput, setMessageInput] = useState("");
  const [searchContact, setSearchContact] = useState("");
  // On mobile (< md), toggle between contact list and conversation view
  const [mobileShowChat, setMobileShowChat] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const contacts: Contact[] = [
    {
      id: "chat-1",
      name: "Sarah Chen",
      handle: "@schen",
      avatar:
        "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80",
      initials: "SC",
      project: "AI Pothole Detection System",
      lastMsg: "Let's connect on Discord to discuss the ONNX quantization pipeline.",
      time: "12m ago",
      unread: 1,
      online: true,
      role: "Python & ML Eng",
    },
    {
      id: "chat-2",
      name: "Alex Rivera",
      handle: "@arivera",
      avatar:
        "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80",
      initials: "AR",
      project: "Decentralized KV Store",
      lastMsg: "I submitted a PR with the raft consensus benchmark!",
      time: "2h ago",
      unread: 0,
      online: true,
      role: "Rust Core Dev",
    },
    {
      id: "chat-3",
      name: "Elena Rostova",
      handle: "@elena_codes",
      avatar:
        "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80",
      initials: "ER",
      project: "OLED Token System",
      lastMsg: "The #000000 true black contrast ratios look stunning.",
      time: "1d ago",
      unread: 0,
      online: false,
      role: "Design Engineer",
    },
  ];

  const [messages, setMessages] = useState<
    Record<string, Array<{ sender: "me" | "them"; text: string; time: string }>>
  >({
    "chat-1": [
      {
        sender: "them",
        text: "Hey Pranjal! Saw your AI Pothole Detection project. The architecture with FastAPI and YOLO looks great.",
        time: "11:20 AM",
      },
      {
        sender: "me",
        text: "Thanks Sarah! We are currently looking for someone experienced with inference optimization and edge deployment.",
        time: "11:24 AM",
      },
      {
        sender: "them",
        text: "Let's connect on Discord to discuss the ONNX quantization pipeline.",
        time: "11:32 AM",
      },
    ],
    "chat-2": [
      {
        sender: "them",
        text: "Hi Pranjal! I was checking out the Raft consensus module in the repo.",
        time: "1:15 PM",
      },
      {
        sender: "me",
        text: "Awesome Alex! How does the throughput benchmark look on high cluster loads?",
        time: "1:22 PM",
      },
      {
        sender: "them",
        text: "I submitted a PR with the raft consensus benchmark! Reached ~45k writes/sec with RocksDB backend.",
        time: "2:04 PM",
      },
    ],
    "chat-3": [
      {
        sender: "them",
        text: "Hey! Reviewed the color design tokens for the OLED dark mode.",
        time: "Yesterday",
      },
      {
        sender: "me",
        text: "Great! Did you test it on HDR OLED panels for color bleeding?",
        time: "Yesterday",
      },
      {
        sender: "them",
        text: "The #000000 true black contrast ratios look stunning. No edge bleed detected.",
        time: "Yesterday",
      },
    ],
  });

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [activeChat, messages]);

  const handleSelectContact = (id: string) => {
    setActiveChat(id);
    setMobileShowChat(true);
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageInput.trim()) return;

    const newMsg = {
      sender: "me" as const,
      text: messageInput.trim(),
      time: "Just now",
    };

    setMessages((prev) => ({
      ...prev,
      [activeChat]: [...(prev[activeChat] || []), newMsg],
    }));
    setMessageInput("");
  };

  const currentContact = contacts.find((c) => c.id === activeChat) || contacts[0];

  const filteredContacts = contacts.filter((c) => {
    if (!searchContact) return true;
    const q = searchContact.toLowerCase();
    return (
      c.name.toLowerCase().includes(q) ||
      c.handle.toLowerCase().includes(q) ||
      c.project.toLowerCase().includes(q)
    );
  });

  const chatMessages = messages[activeChat] || [];

  return (
    <div className="flex flex-1 w-full h-[calc(100dvh-5rem)] md:h-[calc(100vh)] overflow-hidden bg-[var(--bg-canvas)]">
      {/* ── Contact List Panel ──
          On mobile: visible only when !mobileShowChat
          On md+: always visible (w-72 or lg:w-80)
      */}
      <div
        className={`${
          mobileShowChat ? "hidden md:flex" : "flex"
        } w-full md:w-72 lg:w-80 shrink-0 border-r border-[var(--border-subtle)] bg-[var(--bg-surface-low)] flex-col h-full`}
      >
        {/* Header */}
        <div className="p-3.5 sm:p-4 border-b border-[var(--border-subtle)] flex flex-col gap-2.5">
          <div className="flex items-center justify-between">
            <h2 className="font-bold text-white text-base tracking-tight">
              Direct Messages
            </h2>
            <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              {contacts.length} Active
            </span>
          </div>

          {/* Search bar inside contacts */}
          <div className="relative">
            <Search className="absolute left-3 top-2.5 size-3.5 text-[var(--text-muted)]" />
            <input
              type="text"
              value={searchContact}
              onChange={(e) => setSearchContact(e.target.value)}
              placeholder="Search conversations..."
              className="w-full h-8 pl-8 pr-3 rounded-lg bg-[var(--bg-surface-container)] border border-[var(--border-subtle)] text-xs text-white placeholder:text-[var(--text-muted)] focus:outline-none focus:border-indigo-500"
            />
          </div>
        </div>

        {/* Contacts Scrollable List */}
        <div className="overflow-y-auto flex-1 divide-y divide-[var(--border-subtle)]">
          {filteredContacts.length === 0 ? (
            <div className="p-6 text-center text-xs text-[var(--text-muted)]">
              No contacts found
            </div>
          ) : (
            filteredContacts.map((contact) => {
              const isSelected = activeChat === contact.id;
              return (
                <button
                  key={contact.id}
                  onClick={() => handleSelectContact(contact.id)}
                  className={`w-full p-3.5 sm:p-4 flex gap-3 text-left transition-colors cursor-pointer ${
                    isSelected
                      ? "bg-[var(--bg-surface-high)] border-l-2 border-indigo-500"
                      : "hover:bg-[var(--bg-surface-container)]"
                  }`}
                >
                  <div className="relative shrink-0 mt-0.5">
                    <Avatar
                      src={contact.avatar}
                      fallback={contact.initials}
                      size="md"
                    />
                    {contact.online && (
                      <span className="absolute bottom-0 right-0 size-2.5 rounded-full bg-emerald-500 ring-2 ring-[var(--bg-surface-low)]" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1">
                      <span className="text-sm font-semibold text-white truncate">
                        {contact.name}
                      </span>
                      <span className="text-[10px] text-[var(--text-muted)] font-mono shrink-0">
                        {contact.time}
                      </span>
                    </div>
                    <span className="text-[11px] text-indigo-400 block truncate font-mono">
                      {contact.project}
                    </span>
                    <p className="text-xs text-[var(--text-secondary)] truncate mt-1">
                      {contact.lastMsg}
                    </p>
                  </div>
                </button>
              );
            })
          )}
        </div>
      </div>

      {/* ── Chat Conversation Panel ──
          On mobile: visible only when mobileShowChat
          On md+: always visible (flex-1)
      */}
      <div
        className={`${
          mobileShowChat ? "flex" : "hidden md:flex"
        } flex-1 flex-col h-full bg-[var(--bg-canvas)] min-w-0`}
      >
        {/* Chat Header */}
        {currentContact ? (
          <div className="px-3.5 sm:px-5 py-3 border-b border-[var(--border-subtle)] flex items-center justify-between bg-[var(--bg-surface-low)] shrink-0">
            <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
              {/* Mobile Back Button */}
              <button
                onClick={() => setMobileShowChat(false)}
                className="md:hidden p-1.5 -ml-1 text-[var(--text-muted)] hover:text-white hover:bg-[var(--bg-surface-container)] rounded-lg transition-colors cursor-pointer"
                title="Back to contacts"
              >
                <ArrowLeft className="size-5" />
              </button>

              <div className="relative shrink-0">
                <Avatar
                  src={currentContact.avatar}
                  fallback={currentContact.initials}
                  size="sm"
                />
                {currentContact.online && (
                  <span className="absolute bottom-0 right-0 size-2 rounded-full bg-emerald-500 ring-1 ring-[var(--bg-surface-low)]" />
                )}
              </div>

              <div className="flex flex-col min-w-0">
                <div className="flex items-center gap-2 min-w-0">
                  <h3 className="text-sm font-semibold text-white truncate">
                    {currentContact.name}
                  </h3>
                  <span className="hidden sm:inline text-[10px] font-mono px-1.5 py-0.2 rounded bg-[var(--bg-surface-high)] text-[var(--text-secondary)] border border-[var(--border-subtle)] shrink-0">
                    {currentContact.role}
                  </span>
                </div>
                <span className="text-[11px] font-mono text-[var(--text-muted)] truncate">
                  {currentContact.handle} · {currentContact.project}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <span className="flex items-center gap-1.5 text-xs text-emerald-400 font-mono">
                <Circle className="size-2 fill-emerald-400" />
                <span className="hidden sm:inline">
                  {currentContact.online ? "Online" : "Away"}
                </span>
              </span>
            </div>
          </div>
        ) : (
          <div className="p-4 border-b border-[var(--border-subtle)] bg-[var(--bg-surface-low)]">
            <span className="text-sm text-[var(--text-muted)]">Select a contact</span>
          </div>
        )}

        {/* Message Stream */}
        <div className="flex-1 p-3.5 sm:p-5 overflow-y-auto flex flex-col gap-3 min-h-0">
          {/* Project collaboration badge at start of thread */}
          {currentContact && (
            <div className="my-2 p-3 rounded-xl bg-[var(--bg-surface-low)] border border-[var(--border-subtle)] flex items-center justify-between gap-3 max-w-lg self-center w-full">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400 shrink-0">
                  <Sparkles className="size-4" />
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="text-xs font-semibold text-white truncate">
                    Connected via {currentContact.project}
                  </span>
                  <span className="text-[10px] text-[var(--text-muted)] font-mono">
                    Direct conversation channel
                  </span>
                </div>
              </div>
            </div>
          )}

          {chatMessages.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-8 gap-2">
              <MessageSquare className="size-8 text-[var(--text-muted)] opacity-50" />
              <p className="text-xs text-[var(--text-muted)]">
                No messages yet. Send a greeting to start the conversation!
              </p>
            </div>
          ) : (
            chatMessages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex flex-col max-w-[85%] sm:max-w-[70%] ${
                  msg.sender === "me"
                    ? "self-end items-end"
                    : "self-start items-start"
                }`}
              >
                <div
                  className={`p-3 rounded-2xl text-xs leading-relaxed break-words ${
                    msg.sender === "me"
                      ? "bg-indigo-600 text-white rounded-br-none shadow-sm shadow-indigo-600/20"
                      : "bg-[var(--bg-surface-container)] text-[var(--text-primary)] border border-[var(--border-subtle)] rounded-bl-none"
                  }`}
                >
                  {msg.text}
                </div>
                <div className="flex items-center gap-1 mt-1 px-1">
                  <span className="text-[10px] text-[var(--text-muted)] font-mono">
                    {msg.time}
                  </span>
                  {msg.sender === "me" && (
                    <CheckCheck className="size-3 text-indigo-400" />
                  )}
                </div>
              </div>
            ))
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Message Input Bar */}
        <form
          onSubmit={handleSendMessage}
          className="p-2.5 sm:p-3.5 border-t border-[var(--border-subtle)] bg-[var(--bg-surface-low)] flex gap-2 shrink-0 items-center"
        >
          <input
            type="text"
            value={messageInput}
            onChange={(e) => setMessageInput(e.target.value)}
            placeholder="Type a message or code snippet..."
            className="flex-1 h-10 px-3.5 rounded-xl bg-[var(--bg-surface-container)] border border-[var(--border-subtle)] text-xs text-white placeholder:text-[var(--text-muted)] focus:outline-none focus:border-indigo-500 transition-colors"
          />
          <Button
            type="submit"
            disabled={!messageInput.trim()}
            className="h-10 px-3.5 sm:px-4 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white rounded-xl gap-1.5 shrink-0"
          >
            <span className="hidden sm:inline text-xs">Send</span>
            <Send className="size-3.5" />
          </Button>
        </form>
      </div>
    </div>
  );
}
