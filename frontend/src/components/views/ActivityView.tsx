"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  Users,
  Heart,
  Star,
  GitPullRequest,
  Check,
  X,
  RefreshCw,
  Radio,
  Clock,
  MessageSquare,
  ExternalLink,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { api, ActivityItem } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { useNotification } from "@/context/NotificationContext";

interface ActivityViewProps {
  onOpenChat?: (handle: string) => void;
}

export function ActivityView({ onOpenChat }: ActivityViewProps) {
  const { user } = useAuth();
  const { showToast } = useNotification();
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [backendOnline, setBackendOnline] = useState(false);
  const [processingId, setProcessingId] = useState<string | null>(null);

  // Load cached activity statuses immediately on mount
  useEffect(() => {
    try {
      const cached = localStorage.getItem("projectbuddy_activities_cache");
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed)) {
          // Filter out any legacy dummy mocks
          const cleaned = parsed.filter(
            (p: any) =>
              !String(p.id || "").startsWith("act-") &&
              !String(p.customId || "").startsWith("act-") &&
              !["Alex Morgan", "Elena Rostova", "Rahul Sharma", "Sarah Chen", "Alex Rivera", "Devon Marcus", "Priya Patel"].includes(p.user)
          );
          setActivities(cleaned);
          localStorage.setItem("projectbuddy_activities_cache", JSON.stringify(cleaned));
        }
      }
    } catch (e) {
      console.warn("Failed to load activities from localStorage cache", e);
    }
  }, []);

  const fetchActivitiesList = useCallback(async () => {
    setIsLoading(true);
    try {
      const handle = user?.handle;
      const data = await api.getActivities(handle);
      if (Array.isArray(data)) {
        setActivities((prev) => {
          // Merge server data with any locally accepted/declined state
          const merged = data.map((serverItem) => {
            const serverId = serverItem._id || serverItem.id || serverItem.customId;
            const localMatch = prev.find(
              (p) =>
                (p._id && p._id === serverId) ||
                (p.id && p.id === serverId) ||
                (p.customId && p.customId === serverId) ||
                (p.target === serverItem.target && p.role === serverItem.role)
            );
            if (
              localMatch &&
              localMatch.status &&
              localMatch.status !== "pending" &&
              serverItem.status === "pending"
            ) {
              return { ...serverItem, status: localMatch.status };
            }
            return serverItem;
          });

          try {
            localStorage.setItem("projectbuddy_activities_cache", JSON.stringify(merged));
          } catch {}
          return merged;
        });
      } else {
        setActivities([]);
      }
      setBackendOnline(true);
    } catch {
      setBackendOnline(false);
    } finally {
      setIsLoading(false);
    }
  }, [user?.handle]);

  useEffect(() => {
    fetchActivitiesList();
  }, [fetchActivitiesList]);

  const handleResponse = async (act: ActivityItem, status: "accepted" | "declined") => {
    const actId = act._id || act.id || act.customId || "";
    setProcessingId(actId);

    // 1. Immediate UI update + localStorage sync
    setActivities((prev) => {
      const updated = prev.map((item) => {
        const itemId = item._id || item.id || item.customId || "";
        return itemId === actId || (item.target === act.target && item.role === act.role)
          ? { ...item, status }
          : item;
      });
      try {
        localStorage.setItem("projectbuddy_activities_cache", JSON.stringify(updated));
      } catch {}
      return updated;
    });

    // 2. Show notification pop-up toast
    if (status === "accepted") {
      showToast({
        type: "collab",
        title: "Collaborator Accepted! 🎉",
        message: `${act.user} (${act.handle}) has been added to your team for "${act.target}". Direct chat channel is now live!`,
        actionLabel: "Chat Now",
        onAction: () => onOpenChat?.(act.handle),
        durationMs: 7000,
      });
    } else {
      showToast({
        type: "info",
        title: "Request Declined",
        message: `Join request from ${act.user} for "${act.target}" was declined.`,
        durationMs: 4000,
      });
    }

    // 3. Persist to MongoDB backend
    try {
      const targetId = act.joinRequestId || act._id || act.id || act.customId || actId;
      await api.respondToJoinRequest(targetId, status, act);
    } catch (err) {
      console.error("Failed to update status on server:", err);
    } finally {
      setProcessingId(null);
    }
  };

  const getIconAndStyle = (type: string) => {
    switch (type) {
      case "join_request":
        return {
          icon: Users,
          iconColor: "text-white bg-white/10 border border-white/20",
        };
      case "like":
        return {
          icon: Heart,
          iconColor: "text-rose-400 bg-rose-500/10 border border-rose-500/20",
        };
      case "star":
        return {
          icon: Star,
          iconColor: "text-amber-400 bg-amber-500/10 border border-amber-500/20",
        };
      case "collab":
        return {
          icon: GitPullRequest,
          iconColor: "text-emerald-400 bg-emerald-500/10 border border-emerald-500/20",
        };
      default:
        return {
          icon: Users,
          iconColor: "text-white bg-white/10 border border-white/20",
        };
    }
  };

  const formatActivityTime = (dateStr?: string) => {
    if (!dateStr) return "Just now";
    if (dateStr.endsWith("ago") || dateStr.includes("Just now")) return dateStr;
    try {
      const date = new Date(dateStr);
      const diffMs = Date.now() - date.getTime();
      const diffMins = Math.floor(diffMs / (1000 * 60));
      if (diffMins < 1) return "Just now";
      if (diffMins < 60) return `${diffMins}m ago`;
      const diffHours = Math.floor(diffMins / 60);
      if (diffHours < 24) return `${diffHours}h ago`;
      const diffDays = Math.floor(diffHours / 24);
      return `${diffDays}d ago`;
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="p-4 sm:p-6 flex flex-col gap-4 sm:gap-5 max-w-3xl">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight">
              Activity & Team Alerts
            </h2>
            <div
              className={`flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-mono border ${
                backendOnline
                  ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                  : "bg-amber-500/10 text-amber-400 border-amber-500/20"
              }`}
            >
              <Radio className="size-2.5 animate-pulse" />
              <span>{backendOnline ? "API Live" : "Offline"}</span>
            </div>
          </div>
          <p className="text-xs text-[var(--text-secondary)] mt-1">
            Incoming joining applications, project reviews, and collaboration requests.
          </p>
        </div>

        <button
          onClick={fetchActivitiesList}
          disabled={isLoading}
          title="Refresh Activities"
          className="p-2 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-surface-low)] hover:bg-[var(--bg-surface-container)] text-[var(--text-secondary)] hover:text-white transition-colors cursor-pointer disabled:opacity-50"
        >
          <RefreshCw className={`size-4 ${isLoading ? "animate-spin" : ""}`} />
        </button>
      </div>

      {activities.length === 0 ? (
        <div className="p-12 text-center flex flex-col items-center justify-center gap-3 border border-[var(--border-subtle)] rounded-xl bg-[var(--bg-surface-low)]">
          <div className="p-3.5 rounded-full bg-white/5 border border-white/10 text-white/60">
            <Radio className="size-6 text-zinc-400" />
          </div>
          <div className="flex flex-col gap-1 max-w-sm">
            <h3 className="font-semibold text-sm text-white">No activity or team alerts yet</h3>
            <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
              When developers request to join your teams, star your projects, or invite you to collaborate, you&apos;ll be notified here in real-time.
            </p>
          </div>
        </div>
      ) : (
        <div className="flex flex-col divide-y divide-[var(--border-subtle)] border border-[var(--border-subtle)] rounded-xl bg-[var(--bg-surface-low)] overflow-hidden">
          {activities.map((act) => {
            const { icon: Icon, iconColor } = getIconAndStyle(act.type);
            const actId = act._id || act.id || "";
            const isPending = !act.status || act.status === "pending";
            const isAccepted = act.status === "accepted";
            const isDeclined = act.status === "declined";
            const isBusy = processingId === actId;

            return (
              <div
                key={actId}
                className="p-3.5 sm:p-4 flex flex-col sm:flex-row sm:items-start justify-between gap-3 sm:gap-4 hover:bg-[var(--bg-surface-container)] transition-colors"
              >
                <div className="flex items-start gap-3 min-w-0">
                  <div className={`p-2.5 rounded-lg ${iconColor} shrink-0 mt-0.5`}>
                    <Icon className="size-4" />
                  </div>
                  <div className="flex flex-col gap-1 min-w-0">
                    <p className="text-xs text-[var(--text-primary)] leading-relaxed">
                      <span className="font-semibold text-white">{act.user}</span>{" "}
                      <span className="text-[var(--text-secondary)]">({act.handle})</span>{" "}
                      {act.action}{" "}
                      <span className="font-medium text-white">
                        &quot;{act.target}&quot;
                      </span>
                    </p>
                    {act.role && (
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-[11px] font-mono text-zinc-400">
                          Role applied:
                        </span>
                        <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-[var(--bg-surface-high)] text-white border border-[var(--border-subtle)]">
                          {act.role}
                        </span>
                      </div>
                    )}

                    {/* Accessible Developer GitHub Profile Link */}
                    {act.handle && (
                      <div className="flex items-center gap-2 mt-0.5">
                        <a
                          href={`https://github.com/${act.handle.replace("@", "")}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 text-[11px] font-mono text-zinc-400 hover:text-white transition-colors bg-[var(--bg-surface-container)] hover:bg-[var(--bg-surface-high)] px-2 py-0.5 rounded border border-[var(--border-subtle)]"
                          title={`View ${act.handle}'s GitHub profile`}
                        >
                          <svg className="size-3 fill-current shrink-0" viewBox="0 0 24 24">
                            <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/>
                          </svg>
                          <span>github.com/{act.handle.replace("@", "")}</span>
                          <ExternalLink className="size-2.5 opacity-60" />
                        </a>
                      </div>
                    )}

                    <div className="flex items-center gap-1 text-[10px] font-mono text-[var(--text-muted)] mt-0.5">
                      <Clock className="size-3" />
                      <span>{formatActivityTime(act.createdAt)}</span>
                    </div>
                  </div>
                </div>

                {act.hasAction && (
                  <div className="flex items-center gap-2 self-end sm:self-auto shrink-0 pt-1 sm:pt-0">
                    {isPending ? (
                      <>
                        <Button
                          size="sm"
                          disabled={isBusy}
                          onClick={() => handleResponse(act, "accepted")}
                          className="h-7 sm:h-8 px-3 text-xs bg-white hover:bg-neutral-200 text-black font-semibold flex items-center gap-1 shadow-sm"
                        >
                          <Check className="size-3.5" />
                          <span>Accept</span>
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          disabled={isBusy}
                          onClick={() => handleResponse(act, "declined")}
                          className="h-7 sm:h-8 px-2.5 text-xs text-[var(--text-secondary)] hover:text-rose-400 hover:bg-rose-500/10 flex items-center gap-1"
                        >
                          <X className="size-3.5" />
                          <span>Decline</span>
                        </Button>
                      </>
                    ) : isAccepted ? (
                      <div className="flex items-center gap-2">
                        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-medium">
                          <Check className="size-3.5" />
                          <span>Accepted</span>
                        </div>
                        {onOpenChat && (
                          <Button
                            size="sm"
                            onClick={() => onOpenChat(act.handle)}
                            className="h-7 sm:h-8 px-2.5 text-xs bg-white hover:bg-neutral-200 text-black font-semibold flex items-center gap-1 shadow-sm cursor-pointer"
                          >
                            <MessageSquare className="size-3.5" />
                            <span>Chat</span>
                          </Button>
                        )}
                      </div>
                    ) : isDeclined ? (
                      <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-rose-500/10 text-rose-400 border border-rose-500/20 text-xs font-medium">
                        <X className="size-3.5" />
                        <span>Declined</span>
                      </div>
                    ) : null}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
