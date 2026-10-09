"use client";

import React, { createContext, useContext, useState, useCallback } from "react";
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

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const [notifications, setNotifications] = useState<ToastNotification[]>([]);

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
      const id = `toast-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
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

      setNotifications((prev) => [newNotif, ...prev.slice(0, 3)]); // Keep max 4 toasts

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

      {/* Floating Toast Container */}
      <div
        className="fixed top-4 right-4 z-[9999] flex flex-col gap-2.5 max-w-sm sm:max-w-md w-full pointer-events-none p-2"
        aria-live="polite"
      >
        {notifications.map((toast) => {
          const isCollab = toast.type === "collab" || toast.type === "success";
          const isChat = toast.type === "chat";

          return (
            <div
              key={toast.id}
              className={cn(
                "pointer-events-auto flex items-start gap-3 p-3.5 sm:p-4 rounded-xl border shadow-2xl transition-all duration-300 transform translate-y-0",
                "bg-black/95 backdrop-blur-xl",
                isCollab
                  ? "border-emerald-500/40 text-white shadow-[0_8px_30px_rgba(16,185,129,0.2)]"
                  : isChat
                  ? "border-cyan-500/40 text-white shadow-[0_8px_30px_rgba(6,182,212,0.2)]"
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
                ) : isChat ? (
                  <div className="size-9 rounded-full bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-400">
                    <MessageSquare className="size-4" />
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
