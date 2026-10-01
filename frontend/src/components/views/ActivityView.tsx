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
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { api, ActivityItem } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";

const initialFallbackActivities: ActivityItem[] = [
  {
    id: "act-1",
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
    createdAt: "20m ago",
  },
  {
    id: "act-2",
    type: "like",
    user: "Alex Rivera",
    handle: "@arivera",
    initials: "AR",
    action: "liked your project",
    target: "AI Pothole Detection System",
    recipientHandle: "@pranjal",
    hasAction: false,
    status: "none",
    createdAt: "1h ago",
  },
  {
    id: "act-3",
    type: "star",
    user: "Elena Rostova",
    handle: "@elena_codes",
    initials: "ER",
    action: "bookmarked your code snippet",
    target: "tokens.config.css",
    recipientHandle: "@pranjal",
    hasAction: false,
    status: "none",
    createdAt: "3h ago",
  },
  {
    id: "act-4",
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
    createdAt: "5h ago",
  },
];

export function ActivityView() {
  const { user } = useAuth();
  const [activities, setActivities] = useState<ActivityItem[]>(initialFallbackActivities);
  const [isLoading, setIsLoading] = useState(false);
  const [backendOnline, setBackendOnline] = useState(false);
  const [processingId, setProcessingId] = useState<string | null>(null);

  // Load cached activity statuses immediately on mount to prevent reload flash
  useEffect(() => {
    try {
      const cached = localStorage.getItem("projectbuddy_activities_cache");
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setActivities(parsed);
        }
      }
    } catch (e) {
      console.warn("Failed to load activities from localStorage cache", e);
    }
  }, []);

  const fetchActivitiesList = useCallback(async () => {
    setIsLoading(true);
    try {
      const handle = user?.handle || "@pranjal";
      const data = await api.getActivities(handle);
      if (data && data.length > 0) {
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

    // 2. Persist to MongoDB backend
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
                    <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-medium">
                      <Check className="size-3.5" />
                      <span>Accepted</span>
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
    </div>
  );
}
