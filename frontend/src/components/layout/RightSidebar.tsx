"use client";

import React, { useState } from "react";
import { Search, Sparkles, TrendingUp, Users, Check, ExternalLink } from "lucide-react";
import { suggestedProjects, suggestedPeople } from "@/data/mockData";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface RightSidebarProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  onSelectTag?: (tag: string) => void;
  onQuickViewProject?: (project: (typeof suggestedProjects)[0]) => void;
}

export function RightSidebar({
  searchQuery,
  setSearchQuery,
  onSelectTag,
  onQuickViewProject,
}: RightSidebarProps) {
  const [followedUsers, setFollowedUsers] = useState<Record<string, boolean>>({});

  const toggleFollow = (id: string) => {
    setFollowedUsers((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const trendingTags = [
    { tag: "Nextjs15", posts: "1.4k posts" },
    { tag: "Rust", posts: "890 posts" },
    { tag: "PyTorch", posts: "620 posts" },
    { tag: "FastAPI", posts: "410 posts" },
    { tag: "shadcn", posts: "1.2k posts" },
  ];

  return (
    <aside className="hidden xl:flex shrink-0 h-screen sticky top-0 flex-col p-5 gap-6 border-l border-[var(--border-subtle)] bg-[var(--bg-surface-low)] overflow-y-auto w-80">
      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3.5 top-2.5 size-4 text-[var(--text-muted)]" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search projects, stacks, tags..."
          className="w-full h-10 pl-10 pr-4 rounded-xl bg-[var(--bg-surface-container)] border border-[var(--border-subtle)] text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[var(--color-primary)] focus:ring-1 focus:ring-[var(--color-primary)] transition-all"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery("")}
            className="absolute right-3 top-2.5 text-xs text-[var(--text-muted)] hover:text-white"
          >
            Clear
          </button>
        )}
      </div>

      {/* Suggested Projects */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="size-4 text-white" />
            <h3 className="font-semibold text-sm text-white tracking-tight">
              Recommended Projects
            </h3>
          </div>
          <span className="text-[11px] font-mono text-[var(--text-muted)]">
            AI Matched
          </span>
        </div>

        <div className="flex flex-col gap-2.5">
          {suggestedProjects.map((project) => (
            <div
              key={project.id}
              className="p-3.5 rounded-xl bg-[var(--bg-surface-container)] border border-[var(--border-subtle)] hover:border-[var(--border-strong)] transition-all flex flex-col gap-2 group cursor-pointer"
              onClick={() => onQuickViewProject?.(project)}
            >
              <div className="flex items-start justify-between gap-2">
                <span className="font-medium text-sm text-white group-hover:text-white transition-colors">
                  {project.title}
                </span>
                <span className="text-[11px] font-mono font-medium px-2 py-0.5 rounded-full bg-white/10 text-white border border-white/20 shrink-0">
                  {project.matchScore}% match
                </span>
              </div>
              <p className="text-xs text-[var(--text-secondary)] line-clamp-2 leading-relaxed">
                {project.description}
              </p>
              <div className="flex items-center justify-between pt-1">
                <div className="flex flex-wrap gap-1">
                  {project.tags.map((t) => (
                    <Badge key={t} variant="tech" className="text-[10px] py-0 px-1.5">
                      {t}
                    </Badge>
                  ))}
                </div>
                <span className="text-[11px] text-[var(--text-muted)] font-mono">
                  {project.members}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Suggested Buddies & Collaborators */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center gap-2">
          <Users className="size-4 text-white" />
          <h3 className="font-semibold text-sm text-white tracking-tight">
            Suggested Buddies
          </h3>
        </div>

        <div className="flex flex-col gap-2.5">
          {suggestedPeople.map((person) => {
            const isFollowing = !!followedUsers[person.id];
            return (
              <div
                key={person.id}
                className="p-3 rounded-xl bg-[var(--bg-surface-container)] border border-[var(--border-subtle)] flex items-center justify-between gap-2"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <Avatar
                    src={person.avatar}
                    fallback={person.initials}
                    size="sm"
                    className="ring-1 ring-[var(--border-subtle)]"
                  />
                  <div className="flex flex-col min-w-0">
                    <span className="text-xs font-semibold text-white truncate">
                      {person.name}
                    </span>
                    <span className="text-[11px] text-[var(--text-secondary)] truncate">
                      {person.role}
                    </span>
                  </div>
                </div>

                <Button
                  size="sm"
                  variant={isFollowing ? "outline" : "secondary"}
                  onClick={() => toggleFollow(person.id)}
                  className="h-7 px-3 text-xs shrink-0 rounded-lg gap-1"
                >
                  {isFollowing ? (
                    <>
                      <Check className="size-3 text-emerald-400" />
                      <span>Following</span>
                    </>
                  ) : (
                    <span>Follow</span>
                  )}
                </Button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Trending Tech Stacks */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center gap-2">
          <TrendingUp className="size-4 text-emerald-400" />
          <h3 className="font-semibold text-sm text-white tracking-tight">
            Trending Stacks
          </h3>
        </div>

        <div className="flex flex-wrap gap-2">
          {trendingTags.map((t) => (
            <button
              key={t.tag}
              onClick={() => onSelectTag?.(t.tag)}
              className="px-2.5 py-1 rounded-lg bg-[var(--bg-surface-container)] border border-[var(--border-subtle)] hover:border-white/40 hover:bg-white/10 text-xs font-mono text-[var(--text-secondary)] hover:text-white transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <span>#{t.tag}</span>
              <span className="text-[10px] text-[var(--text-muted)]">· {t.posts}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Footer Info */}
      <div className="mt-auto pt-4 border-t border-[var(--border-subtle)] text-[11px] text-[var(--text-muted)] flex flex-col gap-1">
        <div className="flex gap-3">
          <a href="#" className="hover:text-[var(--text-secondary)]">About</a>
          <a href="#" className="hover:text-[var(--text-secondary)]">Guidelines</a>
          <a href="#" className="hover:text-[var(--text-secondary)]">API</a>
          <a href="#" className="hover:text-[var(--text-secondary)]">Status</a>
        </div>
        <p>© 2026 ProjectBuddy Network</p>
      </div>
    </aside>
  );
}
