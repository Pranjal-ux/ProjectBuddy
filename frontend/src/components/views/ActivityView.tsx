"use client";

import React from "react";
import { Users, Heart, Star, GitPullRequest, ArrowUpRight } from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";

export function ActivityView() {
  const activities = [
    {
      id: "act-1",
      type: "join_request",
      user: "Sarah Chen",
      handle: "@schen",
      initials: "SC",
      action: "requested to join your team for",
      target: "AI Pothole Detection System",
      role: "Python Developer / Inference",
      time: "20m ago",
      icon: Users,
      iconColor: "text-indigo-400 bg-indigo-500/10",
      hasAction: true,
    },
    {
      id: "act-2",
      type: "like",
      user: "Alex Rivera",
      handle: "@arivera",
      initials: "AR",
      action: "liked your project",
      target: "AI Pothole Detection System",
      time: "1h ago",
      icon: Heart,
      iconColor: "text-rose-500 bg-rose-500/10",
    },
    {
      id: "act-3",
      type: "star",
      user: "Elena Rostova",
      handle: "@elena_codes",
      initials: "ER",
      action: "bookmarked your code snippet",
      target: "tokens.config.css",
      time: "3h ago",
      icon: Star,
      iconColor: "text-amber-400 bg-amber-400/10",
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
      time: "5h ago",
      icon: GitPullRequest,
      iconColor: "text-emerald-400 bg-emerald-500/10",
      hasAction: true,
    },
  ];

  return (
    <div className="p-4 sm:p-6 flex flex-col gap-4 sm:gap-5 max-w-3xl">
      <div>
        <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight">Activity & Alerts</h2>
        <p className="text-xs text-[var(--text-secondary)] mt-1">
          Team applications, mentions, and project updates.
        </p>
      </div>

      <div className="flex flex-col divide-y divide-[var(--border-subtle)] border border-[var(--border-subtle)] rounded-xl bg-[var(--bg-surface-low)] overflow-hidden">
        {activities.map((act) => {
          const Icon = act.icon;
          return (
            <div
              key={act.id}
              className="p-3.5 sm:p-4 flex flex-col sm:flex-row sm:items-start justify-between gap-3 sm:gap-4 hover:bg-[var(--bg-surface-container)] transition-colors"
            >
              <div className="flex items-start gap-3 min-w-0">
                <div className={`p-2 rounded-lg ${act.iconColor} shrink-0 mt-0.5`}>
                  <Icon className="size-4" />
                </div>
                <div className="flex flex-col gap-1 min-w-0">
                  <p className="text-xs text-[var(--text-primary)] leading-relaxed">
                    <span className="font-semibold text-white">{act.user}</span>{" "}
                    <span className="text-[var(--text-secondary)]">({act.handle})</span>{" "}
                    {act.action}{" "}
                    <span className="font-medium text-indigo-400">
                      &quot;{act.target}&quot;
                    </span>
                  </p>
                  {act.role && (
                    <span className="text-[11px] font-mono text-[var(--color-secondary)]">
                      Applied role: {act.role}
                    </span>
                  )}
                  <span className="text-[10px] font-mono text-[var(--text-muted)]">
                    {act.time}
                  </span>
                </div>
              </div>

              {act.hasAction && (
                <div className="flex items-center gap-2 self-end sm:self-auto shrink-0 pt-1 sm:pt-0">
                  <Button
                    size="sm"
                    className="h-7 sm:h-8 px-3 text-xs bg-indigo-600 hover:bg-indigo-500 text-white"
                  >
                    Accept
                  </Button>
                  <Button size="sm" variant="ghost" className="h-7 sm:h-8 px-2 text-xs">
                    Decline
                  </Button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
