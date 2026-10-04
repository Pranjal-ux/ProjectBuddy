"use client";

import React, { useState, useEffect } from "react";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Layers,
  GitBranch,
  MapPin,
  Calendar,
  ExternalLink,
  Code2,
  UserCheck,
  LogIn,
  Camera,
  Edit3,
  Globe,
  Sparkles,
  CheckCircle2,
  FolderGit2,
} from "lucide-react";
import { GithubIcon, LinkedinIcon, TwitterIcon } from "@/components/ui/BrandIcons";
import { initialPosts } from "@/data/mockData";
import { useAuth } from "@/context/AuthContext";
import { api, User as UserType } from "@/lib/api";
import { EditPhotoModal } from "@/components/profile/EditPhotoModal";
import { EditProfileModal } from "@/components/profile/EditProfileModal";

export function ProfileView() {
  const { user, token, openAuthModal, isAuthenticated, updateUserProfile } = useAuth();
  const [isPhotoModalOpen, setIsPhotoModalOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [backendProjects, setBackendProjects] = useState<any[]>([]);
  const [stats, setStats] = useState({
    activeProjectsCount: user?.stats?.activeProjectsCount || 3,
    teamsJoinedCount: user?.stats?.teamsJoinedCount || 5,
    collaboratorsCount: user?.stats?.collaboratorsCount || 14,
    matchScore: user?.stats?.matchScore || 98,
  });

  // Fetch live stats & projects for user from backend
  useEffect(() => {
    if (user?.handle) {
      api
        .getUserStats(user.handle)
        .then((freshStats) => {
          if (freshStats && Object.keys(freshStats).length > 0) {
            setStats((prev) => ({
              activeProjectsCount:
                freshStats.activeProjectsCount ?? prev.activeProjectsCount,
              teamsJoinedCount:
                freshStats.teamsJoinedCount ?? prev.teamsJoinedCount,
              collaboratorsCount:
                freshStats.collaboratorsCount ?? prev.collaboratorsCount,
              matchScore: freshStats.matchScore ?? prev.matchScore,
            }));
          }
        })
        .catch(() => {});

      api
        .getUserProjects(user.handle)
        .then((projs) => {
          if (projs && projs.length > 0) {
            setBackendProjects(projs);
          }
        })
        .catch(() => {});
    }
  }, [user?.handle]);

  const handleSavePhoto = async (photoUrl: string) => {
    await updateUserProfile({ avatar: photoUrl });
  };

  const handleSaveProfile = async (updatedData: Partial<UserType>) => {
    await updateUserProfile(updatedData);
  };

  const skills =
    user?.skills && user.skills.length > 0
      ? user.skills
      : [
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

  // Combine backend projects or mockData posts
  const mockUserProjects = initialPosts.filter(
    (p) => p.author.handle === user?.handle
  );

  const displayProjects =
    backendProjects.length > 0
      ? backendProjects
      : mockUserProjects.length > 0
      ? mockUserProjects.map((p) => ({
          id: p.id,
          title: p.title || "Project",
          description: p.content,
          tags: p.tags,
          team: p.team,
          createdAt: p.createdAt,
        }))
      : [
          {
            id: "proj-1",
            title: "AI-based Pothole Detection System",
            description:
              "Building an AI-based pothole and road defect detection system using YOLO + FastAPI with real-time video stream processing and OpenStreetMap overlays.",
            tags: ["Python", "YOLO", "FastAPI", "React", "PyTorch"],
            team: { current: 2, max: 4 },
            createdAt: "Just now",
          },
        ];

  return (
    <div className="flex flex-col max-w-4xl p-3 sm:p-6 gap-4 sm:gap-6">
      {/* Profile Banner & Header Card */}
      <div className="rounded-2xl bg-[var(--bg-surface-low)] border border-[var(--border-subtle)] overflow-hidden shadow-lg">
        {/* Cover Image / Clean Header */}
        <div className="relative h-32 sm:h-44 w-full bg-zinc-900 border-b border-[var(--border-subtle)]">
          {user?.coverImage ? (
            <img
              src={user.coverImage}
              alt="Profile Cover"
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="absolute inset-0 bg-gradient-to-b from-zinc-800/60 via-zinc-900 to-zinc-950" />
          )}

          {/* Quick Edit Cover Button */}
          <button
            type="button"
            onClick={() => setIsProfileModalOpen(true)}
            className="absolute top-3 right-3 px-2.5 py-1 rounded-lg bg-black/60 hover:bg-black/80 backdrop-blur-md border border-white/10 text-white text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Camera className="size-3.5 text-zinc-300" />
            <span className="hidden sm:inline">Change Cover</span>
          </button>
        </div>

        {/* User Info Bar */}
        <div className="p-4 sm:p-6 pt-0 relative flex flex-col gap-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4 -mt-12 sm:-mt-16">
            {/* Avatar with Hover & Edit */}
            <div className="relative group shrink-0">
              <Avatar
                src={user?.avatar}
                fallback={user?.initials || "DEV"}
                size="xl"
                className="bg-zinc-800 text-white text-xl sm:text-2xl font-bold ring-4 ring-[var(--bg-surface-low)] shrink-0 size-20 sm:size-28 shadow-2xl"
              />
              {/* Hover overlay */}
              <button
                type="button"
                onClick={() => setIsPhotoModalOpen(true)}
                title="Change profile photo"
                className="absolute inset-0 rounded-full bg-black/60 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white cursor-pointer"
              >
                <Camera className="size-5 text-zinc-200" />
                <span className="text-[10px] font-medium tracking-tight mt-0.5">Edit Photo</span>
              </button>
              {/* Corner quick button */}
              <button
                type="button"
                onClick={() => setIsPhotoModalOpen(true)}
                title="Change profile photo"
                className="absolute bottom-0 right-0 p-1.5 sm:p-2 rounded-full bg-white hover:bg-neutral-200 text-black shadow-md ring-2 ring-[var(--bg-surface-low)] transition-transform hover:scale-110 cursor-pointer"
              >
                <Camera className="size-3 sm:size-3.5 text-zinc-900" />
              </button>
            </div>

            {/* Top Right Action Buttons */}
            <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
              <Button
                variant="outline"
                onClick={() => setIsProfileModalOpen(true)}
                className="text-xs h-8 sm:h-9 border-[var(--border-subtle)] hover:bg-[var(--bg-surface-container)] text-white flex items-center gap-1.5 cursor-pointer"
              >
                <Edit3 className="size-3.5 text-zinc-300" />
                <span>Edit Profile</span>
              </Button>

              <Button
                variant="outline"
                onClick={() => setIsPhotoModalOpen(true)}
                className="text-xs h-8 sm:h-9 border-[var(--border-subtle)] hover:bg-[var(--bg-surface-container)] text-white flex items-center gap-1.5 cursor-pointer"
              >
                <Camera className="size-3.5 text-zinc-300" />
                <span>Photo</span>
              </Button>

              {!isAuthenticated ? (
                <Button
                  onClick={() => openAuthModal("register")}
                  className="text-xs h-8 sm:h-9 flex-1 sm:flex-initial bg-white hover:bg-neutral-200 text-black font-semibold flex items-center gap-1.5"
                >
                  <LogIn className="size-3.5" />
                  <span>Sign In</span>
                </Button>
              ) : (
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono text-zinc-300 px-2.5 py-1 rounded bg-zinc-800/80 border border-zinc-700/80 flex items-center gap-1.5">
                    <UserCheck className="size-3.5 text-zinc-400" />
                    <span>Active Member</span>
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Details */}
          <div className="flex flex-col gap-2 pt-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                {user?.name || "Developer Profile"}
              </h2>
              {user?.pronouns && (
                <span className="text-xs text-zinc-400 font-mono">
                  ({user.pronouns})
                </span>
              )}
              <span className="px-2 py-0.5 rounded-full text-xs font-mono bg-zinc-800/80 text-zinc-300 border border-zinc-700/80">
                {isAuthenticated ? "VERIFIED" : "COMMUNITY"}
              </span>

              {/* Availability status badge */}
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-mono bg-zinc-800/80 text-zinc-300 border border-zinc-700/80">
                <span className="size-1.5 rounded-full bg-zinc-400" />
                {user?.availability === "busy"
                  ? "Busy"
                  : user?.availability === "not_looking"
                  ? "Not Looking"
                  : "Open to collaborate"}
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs font-mono text-[var(--text-muted)]">
              <span className="text-white font-medium">{user?.handle || "@developer"}</span>
              <span>·</span>
              <span className="text-zinc-300">{user?.role || "Fullstack Engineer"}</span>
              {user?.location && (
                <>
                  <span>·</span>
                  <span className="flex items-center gap-1 text-zinc-400">
                    <MapPin className="size-3 text-zinc-400" />
                    {user.location}
                  </span>
                </>
              )}
            </div>

            {/* Custom Status */}
            {user?.customStatus && (
              <div className="inline-flex items-center gap-1.5 text-xs text-zinc-300 py-1 px-2.5 rounded-lg bg-zinc-800/60 border border-zinc-700/60 max-w-fit mt-0.5">
                <span className="text-zinc-400 font-mono text-xs">Status:</span>
                <span>{user.customStatus.replace(/^[🚀⚡🔬]\s*/, "")}</span>
              </div>
            )}

            {/* Bio */}
            <p className="text-xs sm:text-sm text-[var(--text-secondary)] mt-1 max-w-2xl leading-relaxed">
              {user?.bio ||
                "Building software and collaborative tools on ProjectBuddy."}
            </p>

            {/* Social Links Row */}
            <div className="flex flex-wrap items-center gap-2 pt-2">
              {user?.githubUrl && (
                <a
                  href={user.githubUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-2.5 py-1 rounded-md bg-white/5 hover:bg-white/10 border border-white/10 text-xs text-zinc-300 hover:text-white transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <GithubIcon className="size-3.5 text-zinc-400" />
                  <span>GitHub</span>
                  <ExternalLink className="size-3 text-zinc-500" />
                </a>
              )}
              {user?.linkedinUrl && (
                <a
                  href={user.linkedinUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-2.5 py-1 rounded-md bg-white/5 hover:bg-white/10 border border-white/10 text-xs text-zinc-300 hover:text-white transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <LinkedinIcon className="size-3.5 text-zinc-400" />
                  <span>LinkedIn</span>
                  <ExternalLink className="size-3 text-zinc-500" />
                </a>
              )}
              {user?.twitterUrl && (
                <a
                  href={user.twitterUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-2.5 py-1 rounded-md bg-white/5 hover:bg-white/10 border border-white/10 text-xs text-zinc-300 hover:text-white transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <TwitterIcon className="size-3.5 text-zinc-400" />
                  <span>Twitter / X</span>
                  <ExternalLink className="size-3 text-zinc-500" />
                </a>
              )}
              {user?.websiteUrl && (
                <a
                  href={user.websiteUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-2.5 py-1 rounded-md bg-white/5 hover:bg-white/10 border border-white/10 text-xs text-zinc-300 hover:text-white transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <Globe className="size-3.5 text-zinc-400" />
                  <span>Portfolio</span>
                  <ExternalLink className="size-3 text-zinc-500" />
                </a>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Edit Photo Modal */}
      <EditPhotoModal
        isOpen={isPhotoModalOpen}
        onClose={() => setIsPhotoModalOpen(false)}
        currentPhoto={user?.avatar || ""}
        initials={user?.initials || "DEV"}
        userName={user?.name || "Developer"}
        onSavePhoto={handleSavePhoto}
      />

      {/* Edit Profile Details Modal */}
      <EditProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        currentUser={user}
        onSaveProfile={handleSaveProfile}
      />

      {/* Stats Counter with dynamic backend stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        {[
          {
            label: "Active Projects",
            value: stats.activeProjectsCount,
            sub: "Authored in hub",
          },
          {
            label: "Teams Joined",
            value: stats.teamsJoinedCount,
            sub: `as ${user?.role ? user.role.split(" ")[0] : "Dev"}`,
          },
          {
            label: "Collaborators",
            value: stats.collaboratorsCount,
            sub: "Synergy network",
          },
          {
            label: "Match Score",
            value: `${stats.matchScore}%`,
            sub: "High compatibility",
          },
        ].map((stat, i) => (
          <div
            key={i}
            className="p-4 rounded-xl bg-[var(--bg-surface-low)] border border-[var(--border-subtle)] flex flex-col gap-1 transition-all hover:border-white/20"
          >
            <span className="text-xs text-[var(--text-muted)] font-mono">
              {stat.label}
            </span>
            <span className="text-2xl font-bold text-white">{stat.value}</span>
            <span className="text-[11px] text-zinc-400 font-mono">{stat.sub}</span>
          </div>
        ))}
      </div>

      {/* Tech Stack Arsenal */}
      <div className="p-5 rounded-xl bg-[var(--bg-surface-low)] border border-[var(--border-subtle)] flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Code2 className="size-4 text-white" />
            <h3 className="text-sm font-semibold text-white">
              Verified Skills & Tech Stack
            </h3>
          </div>
          <button
            type="button"
            onClick={() => setIsProfileModalOpen(true)}
            className="text-xs text-zinc-400 hover:text-white transition-colors cursor-pointer"
          >
            + Edit Stack
          </button>
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
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FolderGit2 className="size-4 text-white" />
            <h3 className="text-base font-bold text-white">Projects</h3>
          </div>
          <span className="text-xs font-mono text-zinc-400">
            {displayProjects.length} Total
          </span>
        </div>

        <div className="flex flex-col gap-3">
          {displayProjects.map((p: any) => (
            <div
              key={p.id || p._id}
              className="p-4 rounded-xl bg-[var(--bg-surface-low)] border border-[var(--border-subtle)] flex flex-col gap-2 hover:border-white/20 transition-colors"
            >
              <div className="flex items-center justify-between">
                <span className="font-semibold text-sm text-white">
                  {p.title || "Project"}
                </span>
                {p.team && (
                  <span className="text-xs font-mono text-zinc-300">
                    Team: {p.team.current} / {p.team.max} members
                  </span>
                )}
                {p.role && !p.team && (
                  <span className="text-xs font-mono text-zinc-400">
                    {p.role}
                  </span>
                )}
              </div>
              <p className="text-xs text-[var(--text-secondary)]">
                {p.description || p.content}
              </p>
              <div className="flex items-center justify-between pt-2">
                <div className="flex flex-wrap gap-1.5">
                  {p.tags?.map((t: string) => (
                    <Badge key={t} variant="tech" className="text-[10px]">
                      {t}
                    </Badge>
                  ))}
                </div>
                <span className="text-[11px] text-[var(--text-muted)] font-mono">
                  {p.createdAt || "Active"}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
