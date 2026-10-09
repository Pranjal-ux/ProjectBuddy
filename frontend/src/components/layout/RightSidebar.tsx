"use client";

import React, { useState } from "react";
import { Search, Sparkles, TrendingUp, Users, Check, ExternalLink, X } from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ProjectBuddyLogo } from "@/components/ui/ProjectBuddyLogo";
import { useAuth } from "@/context/AuthContext";
import { api, User as UserType } from "@/lib/api";

interface RightSidebarProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  onSelectTag?: (tag: string) => void;
  onQuickViewProject?: (project: any) => void;
  onSelectUser?: (user: {
    handle: string;
    name?: string;
    avatar?: string;
    role?: string;
    fallback?: string;
  }) => void;
}

export function RightSidebar({
  searchQuery,
  setSearchQuery,
  onSelectTag,
  onQuickViewProject,
  onSelectUser,
}: RightSidebarProps) {
  const { user, isFollowing, toggleFollowUser } = useAuth();
  const [realDevs, setRealDevs] = useState<UserType[]>([]);
  const [realProjects, setRealProjects] = useState<any[]>([]);

  React.useEffect(() => {
    let isMounted = true;
    api.searchDevelopers().then((devs) => {
      if (isMounted && Array.isArray(devs) && devs.length > 0) {
        setRealDevs(devs);
      }
    }).catch(() => {});

    api.getPosts().then((posts) => {
      if (isMounted && Array.isArray(posts)) {
        const projs = posts
          .filter((p) => p.type === "project")
          .map((p) => ({
            id: p.id,
            title: p.title || "Developer Initiative",
            description: p.content,
            tags: p.tags || [],
            members: p.team ? `${p.team.current}/${p.team.max} devs` : "1/3 devs",
            matchScore: 94,
            rawPost: p,
          }));
        setRealProjects(projs);
      }
    }).catch(() => {});

    return () => {
      isMounted = false;
    };
  }, []);

  const displayPeople = React.useMemo(() => {
    if (realDevs.length > 0) {
      return realDevs
        .filter((d) => d.handle?.toLowerCase() !== user?.handle?.toLowerCase())
        .slice(0, 5)
        .map((d) => ({
          id: d.id || d._id || d.handle,
          name: d.name,
          handle: d.handle,
          avatar: d.avatar || "",
          initials: d.initials || (d.name || "DV").slice(0, 2).toUpperCase(),
          role: d.role || "Developer",
          githubUrl: d.githubUrl,
          linkedinUrl: d.linkedinUrl,
        }));
    }
    return [];
  }, [realDevs, user?.handle]);

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
          {realProjects.length === 0 ? (
            <div className="p-4 rounded-xl bg-[var(--bg-surface-container)] border border-[var(--border-subtle)] text-center text-xs text-[var(--text-muted)] font-mono">
              No recommended projects yet.
            </div>
          ) : (
            realProjects.slice(0, 4).map((project) => (
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
                    {project.tags.map((t: string) => (
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
            ))
          )}
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
          {displayPeople.length === 0 ? (
            <div className="p-4 rounded-xl bg-[var(--bg-surface-container)] border border-[var(--border-subtle)] text-center text-xs text-[var(--text-muted)] font-mono">
              No suggested buddies yet.
            </div>
          ) : (
            displayPeople.map((person) => {
              const followed = isFollowing(person.handle);
              return (
                <div
                  key={person.id}
                  className="p-3 rounded-xl bg-[var(--bg-surface-container)] border border-[var(--border-subtle)] flex items-center justify-between gap-2"
                >
                  <div
                    className="flex items-center gap-2.5 min-w-0 cursor-pointer hover:opacity-85 transition-opacity"
                    onClick={() =>
                      onSelectUser?.({
                        handle: person.handle,
                        name: person.name,
                        avatar: person.avatar,
                        role: person.role,
                        fallback: person.initials,
                      })
                    }
                    title={`View ${person.name}'s profile`}
                  >
                    <Avatar
                      src={person.avatar}
                      fallback={person.initials}
                      size="sm"
                    className="ring-1 ring-[var(--border-subtle)]"
                  />
                  <div className="flex flex-col min-w-0">
                    <span className="text-xs font-semibold text-white truncate hover:underline">
                      {person.name}
                    </span>
                    <span className="text-[11px] text-[var(--text-secondary)] truncate">
                      {person.role}
                    </span>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <span className="text-[10px] font-mono text-[var(--text-muted)] truncate">
                        {person.handle}
                      </span>
                      {person.githubUrl && (
                        <a
                          href={person.githubUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="text-zinc-400 hover:text-white transition-colors"
                          title={`${person.name}'s GitHub`}
                        >
                          <svg className="size-2.5 fill-current" viewBox="0 0 24 24">
                            <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/>
                          </svg>
                        </a>
                      )}
                      {person.linkedinUrl && (
                        <a
                          href={person.linkedinUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="text-[#38bdf8] hover:text-[#70b5f9] transition-colors"
                          title={`${person.name}'s LinkedIn`}
                        >
                          <svg className="size-2.5 fill-current" viewBox="0 0 24 24">
                            <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.38-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
                          </svg>
                        </a>
                      )}
                    </div>
                  </div>
                </div>

                <Button
                  size="sm"
                  variant={followed ? "outline" : "secondary"}
                  onClick={() =>
                    toggleFollowUser({
                      handle: person.handle,
                      name: person.name,
                      id: person.id,
                    })
                  }
                  className={`h-7 px-3 text-xs shrink-0 rounded-lg gap-1 transition-all cursor-pointer group/btn ${
                    followed
                      ? "border-emerald-500/30 text-emerald-400 hover:border-red-500/40 hover:text-red-400 hover:bg-red-500/10"
                      : "bg-white hover:bg-neutral-200 text-black font-semibold shadow-sm"
                  }`}
                >
                  {followed ? (
                    <>
                      <Check className="size-3 text-emerald-400 group-hover/btn:hidden" />
                      <span className="group-hover/btn:hidden">Following</span>
                      <X className="size-3 hidden group-hover/btn:inline text-red-400" />
                      <span className="hidden group-hover/btn:inline">Unfollow</span>
                    </>
                  ) : (
                    <span>Follow</span>
                  )}
                </Button>
              </div>
            );
          })
          )}
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
      <div className="mt-auto pt-4 border-t border-[var(--border-subtle)] text-[11px] text-[var(--text-muted)] flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <ProjectBuddyLogo variant="full" size="xs" />
        </div>
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
