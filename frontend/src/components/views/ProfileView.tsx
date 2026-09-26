"use client";

import React from "react";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Layers, GitBranch, MapPin, Calendar, ExternalLink, Code2, UserCheck, LogIn } from "lucide-react";
import { initialPosts } from "@/data/mockData";
import { useAuth } from "@/context/AuthContext";

export function ProfileView() {
  const { user, openAuthModal, isAuthenticated } = useAuth();
  const userProjects = initialPosts.filter((p) => p.author.handle === user?.handle);

  const skills = user?.skills && user.skills.length > 0 ? user.skills : [
    "Next.js 15",
    "React",
    "TypeScript",
    "TailwindCSS",
    "Node.js",
    "Python",
    "FastAPI",
    "PostgreSQL",
    "Docker",
  ];

  return (
    <div className="flex flex-col max-w-4xl p-4 sm:p-6 gap-4 sm:gap-6">
      {/* Profile Header Card */}
      <div className="p-4 sm:p-6 rounded-2xl bg-[var(--bg-surface-low)] border border-[var(--border-subtle)] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 sm:gap-6">
        <div className="flex items-start sm:items-center gap-3.5 sm:gap-4">
          <Avatar
            fallback={user?.initials || "DEV"}
            size="xl"
            className="bg-indigo-700 text-white text-lg sm:text-xl font-bold ring-2 ring-indigo-500/40 shrink-0"
          />
          <div className="flex flex-col gap-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-lg sm:text-xl font-bold text-white">{user?.name || "Developer Profile"}</h2>
              <span className="px-2 py-0.5 rounded-full text-xs font-mono bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                {isAuthenticated ? "VERIFIED DEV" : "GUEST DEV"}
              </span>
            </div>
            <span className="text-xs font-mono text-[var(--text-muted)] truncate">
              {user?.handle || "@developer"} · {user?.role || "Fullstack Engineer"}
            </span>
            <p className="text-xs text-[var(--text-secondary)] mt-1 max-w-md leading-relaxed">
              {user?.bio || "Building next-gen applications, developer platforms, and collaborative tools on ProjectBuddy."}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto shrink-0 pt-1 sm:pt-0">
          {!isAuthenticated ? (
            <Button
              onClick={() => openAuthModal("register")}
              className="text-xs h-8 sm:h-9 flex-1 sm:flex-initial bg-indigo-600 hover:bg-indigo-500 text-white flex items-center gap-1.5"
            >
              <LogIn className="size-3.5" />
              <span>Create / Switch Account</span>
            </Button>
          ) : (
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono text-emerald-400 px-2 py-1 rounded bg-emerald-500/10 border border-emerald-500/20 flex items-center gap-1">
                <UserCheck className="size-3.5" />
                <span>Logged In</span>
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Stats Counter */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        {[
          { label: "Active Projects", value: "3", sub: "2 looking for team" },
          { label: "Teams Joined", value: "5", sub: "as Fullstack" },
          { label: "Collaborators", value: "14", sub: "Network peers" },
          { label: "Match Score", value: "98%", sub: "High synergy" },
        ].map((stat, i) => (
          <div
            key={i}
            className="p-4 rounded-xl bg-[var(--bg-surface-low)] border border-[var(--border-subtle)] flex flex-col gap-1"
          >
            <span className="text-xs text-[var(--text-muted)] font-mono">
              {stat.label}
            </span>
            <span className="text-2xl font-bold text-white">{stat.value}</span>
            <span className="text-[11px] text-indigo-400 font-mono">{stat.sub}</span>
          </div>
        ))}
      </div>

      {/* Tech Stack Arsenal */}
      <div className="p-5 rounded-xl bg-[var(--bg-surface-low)] border border-[var(--border-subtle)] flex flex-col gap-3">
        <div className="flex items-center gap-2">
          <Code2 className="size-4 text-indigo-400" />
          <h3 className="text-sm font-semibold text-white">
            Verified Skills & Tech Stack
          </h3>
        </div>
        <div className="flex flex-wrap gap-2">
          {skills.map((s) => (
            <Badge key={s} variant="tech" className="py-1 px-3 text-xs">
              {s}
            </Badge>
          ))}
        </div>
      </div>

      {/* User Projects List */}
      <div className="flex flex-col gap-4">
        <h3 className="text-base font-bold text-white">Created Projects</h3>
        <div className="flex flex-col gap-3">
          {userProjects.map((p) => (
            <div
              key={p.id}
              className="p-4 rounded-xl bg-[var(--bg-surface-low)] border border-[var(--border-subtle)] flex flex-col gap-2"
            >
              <div className="flex items-center justify-between">
                <span className="font-semibold text-sm text-white">
                  {p.title || "Project"}
                </span>
                {p.team && (
                  <span className="text-xs font-mono text-indigo-400">
                    Team: {p.team.current} / {p.team.max} members
                  </span>
                )}
              </div>
              <p className="text-xs text-[var(--text-secondary)]">{p.content}</p>
              <div className="flex items-center justify-between pt-2">
                <div className="flex gap-1.5">
                  {p.tags?.map((t) => (
                    <Badge key={t} variant="tech" className="text-[10px]">
                      {t}
                    </Badge>
                  ))}
                </div>
                <span className="text-[11px] text-[var(--text-muted)] font-mono">
                  {p.createdAt}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
