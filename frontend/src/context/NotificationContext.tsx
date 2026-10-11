"use client";

import React, { createContext, useContext, useState, useCallback, useRef } from "react";
import { CheckCircle2, Bell, MessageSquare, Sparkles, X, Users, ArrowRight } from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

export interface ToastNotification {
  id: string;
  type?: "success" | "info" | "collab" | "chat" | "warning";
  title: string;
  message: string;
  avatar?: string;
  initials?: string;
  actionLabel?: string;
  onAction?: () => void;
  durationMs?: number;
}

interface NotificationContextType {
  notifications: ToastNotification[];
  showToast: (notification: Omit<ToastNotification, "id">) => void;
  dismissToast: (id: string) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

const playNotificationChime = () => {
  try {
    if (typeof window === "undefined") return;
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sine";
    // Pleasant dual-frequency ding
    osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
    osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.12); // A5
    gain.gain.setValueAtTime(0.15, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.35);
  } catch {
    // AudioContext blocked before user interaction, safely ignored
  }
};

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const [notifications, setNotifications] = useState<ToastNotification[]>([]);
  const recentToastsRef = useRef<Map<string, number>>(new Map());

  const dismissToast = useCallback((id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  }, []);

  const showToast = useCallback(
    ({
      type = "success",
      title,
      message,
      avatar,
      initials,
      actionLabel,
      onAction,
      durationMs = 5000,
    }: Omit<ToastNotification, "id">) => {
      // Loop protection & deduplication
      const notifKey = `${type}::${title}::${message}`;
      const now = Date.now();
      const lastShown = recentToastsRef.current.get(notifKey);

      // Prevent identical notification loop if fired within 4 seconds
      if (lastShown && now - lastShown < 4000) {
        return;
      }
      recentToastsRef.current.set(notifKey, now);

      // Clean up stale cache entries older than 10s
      for (const [key, timestamp] of recentToastsRef.current.entries()) {
        if (now - timestamp > 10000) {
          recentToastsRef.current.delete(key);
        }
      }

      const id = `toast-${now}-${Math.random().toString(36).substring(2, 6)}`;
      const newNotif: ToastNotification = {
        id,
        type,
        title,
        message,
        avatar,
        initials,
        actionLabel,
        onAction,
        durationMs,
      };

      if (type === "chat") {
        playNotificationChime();
      }

      setNotifications((prev) => [newNotif, ...prev.slice(0, 2)]); // Keep max 3 toasts

      if (durationMs > 0) {
        setTimeout(() => {
          dismissToast(id);
        }, durationMs);
      }
    },
    [dismissToast]
  );

  return (
    <NotificationContext.Provider value={{ notifications, showToast, dismissToast }}>
      {children}

      {/* ── Top-of-Screen Notification Popups ── */}
      <div
        className="fixed top-3 sm:top-4 left-1/2 -translate-x-1/2 z-[10000] flex flex-col items-center gap-2.5 max-w-md w-[calc(100%-1.25rem)] pointer-events-none p-1"
        aria-live="polite"
      >
        {notifications.map((toast) => {
          const isChat = toast.type === "chat";
          const isCollab = toast.type === "collab" || toast.type === "success";

          if (isChat) {
            return (
              <div
                key={toast.id}
                onClick={() => {
                  toast.onAction?.();
                  dismissToast(toast.id);
                }}
                className={cn(
                  "pointer-events-auto w-full flex items-center justify-between gap-3 p-3 sm:p-3.5 rounded-2xl border shadow-2xl transition-all duration-300 cursor-pointer group",
                  "animate-in fade-in slide-in-from-top-6 duration-300 ease-out",
                  "bg-black/95 backdrop-blur-2xl border-[#1d9bf0]/50 text-white shadow-[0_12px_45px_rgba(29,155,240,0.3)] hover:border-[#1d9bf0] hover:scale-[1.01]"
                )}
              >
                {/* Left: Avatar with online dot */}
                <div className="relative shrink-0">
                  <Avatar
                    src={toast.avatar}
                    fallback={toast.initials || "DEV"}
                    size="md"
                    className="size-10 border border-white/20 ring-2 ring-[#1d9bf0]/40"
                  />
                  <span className="absolute bottom-0 right-0 size-2.5 rounded-full bg-emerald-500 ring-2 ring-black" />
                </div>

                {/* Middle: Sender & Message text */}
                <div className="flex-1 min-w-0 flex flex-col gap-0.5">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <span className="text-[10px] font-mono uppercase tracking-wider text-[#1d9bf0] font-bold flex items-center gap-1 shrink-0">
                      <MessageSquare className="size-3 fill-[#1d9bf0]" />
                      <span>New Message</span>
                    </span>
                    <span className="text-zinc-600 text-xs">·</span>
                    <span className="text-[10px] font-mono text-zinc-400">Just now</span>
                  </div>
                  <h4 className="font-bold text-xs sm:text-sm text-white truncate leading-tight group-hover:text-[#1d9bf0] transition-colors">
                    {toast.title}
                  </h4>
                  <p className="text-xs text-zinc-300 truncate leading-snug">
                    {toast.message}
                  </p>
                </div>

                {/* Right: Reply button & Dismiss */}
                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toast.onAction?.();
                      dismissToast(toast.id);
                    }}
                    className="px-3 py-1.5 rounded-full text-xs font-bold bg-[#1d9bf0] hover:bg-[#1a8cd8] text-white shadow-md shadow-blue-500/25 transition-all cursor-pointer hover:scale-105"
                  >
                    Reply
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      dismissToast(toast.id);
                    }}
                    className="p-1 rounded-full text-zinc-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                    title="Dismiss"
                  >
                    <X className="size-3.5" />
                  </button>
                </div>
              </div>
            );
          }

          return (
            <div
              key={toast.id}
              className={cn(
                "pointer-events-auto w-full flex items-start gap-3 p-3.5 sm:p-4 rounded-xl border shadow-2xl transition-all duration-300 transform translate-y-0",
                "animate-in fade-in slide-in-from-top-6 duration-300 ease-out",
                "bg-black/95 backdrop-blur-xl",
                isCollab
                  ? "border-emerald-500/40 text-white shadow-[0_8px_30px_rgba(16,185,129,0.2)]"
                  : "border-white/20 text-white shadow-[0_8px_30px_rgba(255,255,255,0.1)]"
              )}
            >
              {/* Avatar or Icon Badge */}
              <div className="shrink-0 mt-0.5">
                {toast.avatar || toast.initials ? (
                  <Avatar
                    src={toast.avatar}
                    fallback={toast.initials || "PB"}
                    size="md"
                    className="ring-2 ring-emerald-500/30"
                  />
                ) : isCollab ? (
                  <div className="size-9 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
                    <Users className="size-4" />
                  </div>
                ) : (
                  <div className="size-9 rounded-full bg-white/20 border border-white/30 flex items-center justify-center text-white">
                    <CheckCircle2 className="size-4" />
                  </div>
                )}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0 flex flex-col gap-1">
                <div className="flex items-center justify-between gap-2">
                  <h4 className="font-bold text-xs sm:text-sm text-white tracking-tight flex items-center gap-1.5 truncate">
                    <Sparkles className="size-3.5 text-emerald-400 shrink-0" />
                    <span>{toast.title}</span>
                  </h4>
                  <button
                    onClick={() => dismissToast(toast.id)}
                    className="text-zinc-400 hover:text-white p-0.5 rounded transition-colors cursor-pointer"
                  >
                    <X className="size-3.5" />
                  </button>
                </div>

                <p className="text-xs text-zinc-300 leading-relaxed break-words">
                  {toast.message}
                </p>

                {toast.actionLabel && toast.onAction && (
                  <button
                    onClick={() => {
                      toast.onAction?.();
                      dismissToast(toast.id);
                    }}
                    className="mt-1.5 self-start inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-white hover:bg-neutral-200 text-black shadow transition-all cursor-pointer group"
                  >
                    <span>{toast.actionLabel}</span>
                    <ArrowRight className="size-3 transition-transform group-hover:translate-x-0.5" />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </NotificationContext.Provider>
  );
}

export function useNotification() {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error("useNotification must be used within a NotificationProvider");
  }
  return context;
}
