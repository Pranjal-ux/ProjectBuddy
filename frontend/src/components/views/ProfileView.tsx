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
  UserPlus,
  Users,
  LogIn,
  Camera,
  Edit3,
  Globe,
  Sparkles,
  CheckCircle2,
  FolderGit2,
  Check,
  ArrowLeft,
  Eye,
  X,
} from "lucide-react";
import { GithubIcon, LinkedinIcon, TwitterIcon } from "@/components/ui/BrandIcons";
import { initialPosts, suggestedPeople } from "@/data/mockData";
import { useAuth } from "@/context/AuthContext";
import { api, User as UserType } from "@/lib/api";
import { EditPhotoModal } from "@/components/profile/EditPhotoModal";
import { EditProfileModal } from "@/components/profile/EditProfileModal";
import { FollowListModal } from "@/components/profile/FollowListModal";

interface ProfileViewProps {
  initialInspectedUser?: UserType | null;
  onBackToMyProfile?: () => void;
}

export function ProfileView({
  initialInspectedUser = null,
  onBackToMyProfile,
}: ProfileViewProps) {
  const {
    user: myUser,
    token,
    openAuthModal,
    isAuthenticated,
    updateUserProfile,
    isFollowing,
    toggleFollowUser,
  } = useAuth();

  // Selected developer profile currently being viewed (null = viewing authenticated user's own profile)
  const [inspectedUser, setInspectedUser] = useState<UserType | null>(initialInspectedUser);
  const [isPreviewPublic, setIsPreviewPublic] = useState(false);

  // Sync inspectedUser when parent passes or changes initialInspectedUser
  useEffect(() => {
    setInspectedUser(initialInspectedUser);
  }, [initialInspectedUser]);

  // Determine active profile being displayed
  const activeUser = inspectedUser || myUser;
  const isOwnProfile = !inspectedUser && !isPreviewPublic;

  // Modals state
  const [isPhotoModalOpen, setIsPhotoModalOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isFollowModalOpen, setIsFollowModalOpen] = useState(false);
  const [followModalTab, setFollowModalTab] = useState<"followers" | "following">("followers");

  // Projects state
  const [backendProjects, setBackendProjects] = useState<any[]>([]);

  // Follow & profile stats state
  const [stats, setStats] = useState({
    activeProjectsCount: activeUser?.stats?.activeProjectsCount ?? 3,
    teamsJoinedCount: activeUser?.stats?.teamsJoinedCount ?? 5,
    collaboratorsCount: activeUser?.stats?.collaboratorsCount ?? 14,
    matchScore: activeUser?.stats?.matchScore ?? 98,
    followersCount: activeUser?.stats?.followersCount ?? (activeUser?.followers?.length ?? 0),
    followingCount: activeUser?.stats?.followingCount ?? (activeUser?.following?.length ?? 0),
  });

  // Re-sync stats when activeUser changes
  useEffect(() => {
    if (activeUser?.stats) {
      setStats({
        activeProjectsCount: activeUser.stats.activeProjectsCount ?? 3,
        teamsJoinedCount: activeUser.stats.teamsJoinedCount ?? 5,
        collaboratorsCount: activeUser.stats.collaboratorsCount ?? 14,
        matchScore: activeUser.stats.matchScore ?? 98,
        followersCount: activeUser.stats.followersCount ?? (activeUser.followers?.length ?? 0),
        followingCount: activeUser.stats.followingCount ?? (activeUser.following?.length ?? 0),
      });
    }
  }, [activeUser]);

  // Fetch live stats & projects for active user from backend
  useEffect(() => {
    if (activeUser?.handle) {
      if (inspectedUser?.handle) {
        api
          .getUserProfile(inspectedUser.handle)
          .then((fresh) => {
            if (fresh) {
              setInspectedUser(fresh);
            }
          })
          .catch(() => {});
      }

      api
        .getUserStats(activeUser.handle)
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
              followersCount:
                freshStats.followersCount ?? prev.followersCount,
              followingCount:
                freshStats.followingCount ?? prev.followingCount,
            }));
          }
        })
        .catch(() => {});

      api
        .getUserProjects(activeUser.handle)
        .then((projs) => {
          if (projs && projs.length > 0) {
            setBackendProjects(projs);
          } else {
            setBackendProjects([]);
          }
        })
        .catch(() => {});
    }
  }, [activeUser?.handle]);

  const handleSavePhoto = async (photoUrl: string) => {
    await updateUserProfile({ avatar: photoUrl });
  };

  const handleSaveProfile = async (updatedData: Partial<UserType>) => {
    await updateUserProfile(updatedData);
  };

  const openFollowModal = (tab: "followers" | "following") => {
    setFollowModalTab(tab);
    setIsFollowModalOpen(true);
  };

  // Follow / Following toggle for viewed developer
  const targetHandle = activeUser?.handle || "@developer";
  const targetIsFollowed = isFollowing(targetHandle);

  const handleToggleTargetFollow = async () => {
    if (!activeUser) return;
    const res = await toggleFollowUser({
      handle: activeUser.handle,
      name: activeUser.name,
      id: activeUser.id || activeUser._id,
    });

    // Update followers count on active profile card
    setStats((prev) => ({
      ...prev,
      followersCount:
        typeof res.followersCount === "number"
          ? res.followersCount
          : Math.max(
              0,
              res.isFollowing ? prev.followersCount + 1 : prev.followersCount - 1
            ),
    }));
  };

  const skills =
    activeUser?.skills && activeUser.skills.length > 0
      ? activeUser.skills
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
    (p) => p.author.handle === activeUser?.handle
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
      {/* Inspected User or Public Preview banner */}
      {(inspectedUser || isPreviewPublic) && (
        <div className="p-3 rounded-xl bg-white/5 border border-white/10 flex items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <span className="p-1 rounded-md bg-white/10 text-white">
              <Eye className="size-3.5" />
            </span>
            <span className="text-zinc-300">
              {inspectedUser ? (
                <>
                  Viewing developer profile for{" "}
                  <strong className="text-white">{inspectedUser.name}</strong> ({inspectedUser.handle})
                </>
              ) : (
                <>Previewing public profile view (as seen by other developers)</>
              )}
            </span>
          </div>
          <button
            onClick={() => {
              if (inspectedUser) {
                setInspectedUser(null);
                onBackToMyProfile?.();
              } else {
                setIsPreviewPublic(false);
              }
            }}
            className="px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-white font-medium flex items-center gap-1.5 transition-colors cursor-pointer shrink-0"
          >
            <ArrowLeft className="size-3" />
            <span>Return to My Profile</span>
          </button>
        </div>
      )}

      {/* Profile Banner & Header Card */}
      <div className="rounded-2xl bg-[var(--bg-surface-low)] border border-[var(--border-subtle)] overflow-hidden shadow-lg">
        {/* Cover Image / Clean Header */}
        <div className="relative h-32 sm:h-44 w-full bg-zinc-900 border-b border-[var(--border-subtle)]">
          {activeUser?.coverImage ? (
            <img
              src={activeUser.coverImage}
              alt="Profile Cover"
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="absolute inset-0 bg-gradient-to-b from-zinc-800/60 via-zinc-900 to-zinc-950" />
          )}

          {/* Quick Edit Cover Button (only on own profile) */}
          {isOwnProfile && (
            <button
              type="button"
              onClick={() => setIsProfileModalOpen(true)}
              className="absolute top-3 right-3 px-2.5 py-1 rounded-lg bg-black/60 hover:bg-black/80 backdrop-blur-md border border-white/10 text-white text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Camera className="size-3.5 text-zinc-300" />
              <span className="hidden sm:inline">Change Cover</span>
            </button>
          )}
        </div>

        {/* User Info Bar */}
        <div className="p-4 sm:p-6 pt-0 relative flex flex-col gap-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4 -mt-12 sm:-mt-16">
            {/* Avatar with Hover & Edit */}
            <div className="relative group shrink-0">
              <Avatar
                src={activeUser?.avatar}
                fallback={activeUser?.initials || "DEV"}
                size="xl"
                className="bg-zinc-800 text-white text-xl sm:text-2xl font-bold ring-4 ring-[var(--bg-surface-low)] shrink-0 size-20 sm:size-28 shadow-2xl"
              />
              {/* Photo edit overlays (only on own profile) */}
              {isOwnProfile && (
                <>
                  <button
                    type="button"
                    onClick={() => setIsPhotoModalOpen(true)}
                    title="Change profile photo"
                    className="absolute inset-0 rounded-full bg-black/60 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white cursor-pointer"
                  >
                    <Camera className="size-5 text-zinc-200" />
                    <span className="text-[10px] font-medium tracking-tight mt-0.5">
                      Edit Photo
                    </span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsPhotoModalOpen(true)}
                    title="Change profile photo"
                    className="absolute bottom-0 right-0 p-1.5 sm:p-2 rounded-full bg-white hover:bg-neutral-200 text-black shadow-md ring-2 ring-[var(--bg-surface-low)] transition-transform hover:scale-110 cursor-pointer"
                  >
                    <Camera className="size-3 sm:size-3.5 text-zinc-900" />
                  </button>
                </>
              )}
            </div>

            {/* Top Right Action Buttons */}
            <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
              {!isOwnProfile ? (
                /* Follow button when viewing another developer's profile */
                <Button
                  size="sm"
                  variant={targetIsFollowed ? "outline" : "secondary"}
                  onClick={handleToggleTargetFollow}
                  className={`text-xs h-8 sm:h-9 px-4 rounded-xl flex items-center gap-1.5 cursor-pointer group/btn ${
                    targetIsFollowed
                      ? "border-emerald-500/30 text-emerald-400 hover:border-red-500/40 hover:text-red-400 hover:bg-red-500/10"
                      : "bg-white hover:bg-neutral-200 text-black font-semibold shadow-sm"
                  }`}
                >
                  {targetIsFollowed ? (
                    <>
                      <Check className="size-3.5 text-emerald-400 group-hover/btn:hidden" />
                      <span className="group-hover/btn:hidden">Following</span>
                      <X className="size-3.5 hidden group-hover/btn:inline text-red-400" />
                      <span className="hidden group-hover/btn:inline">Unfollow</span>
                    </>
                  ) : (
                    <>
                      <UserPlus className="size-3.5" />
                      <span>Follow</span>
                    </>
                  )}
                </Button>
              ) : (
                /* Own profile actions */
                <>
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

                  {/* Public Preview Toggle */}
                  <Button
                    variant="outline"
                    onClick={() => setIsPreviewPublic(true)}
                    className="text-xs h-8 sm:h-9 border-[var(--border-subtle)] hover:bg-[var(--bg-surface-container)] text-zinc-300 hover:text-white flex items-center gap-1.5 cursor-pointer"
                    title="Preview profile as seen by public and test Follow button"
                  >
                    <Eye className="size-3.5 text-zinc-400" />
                    <span className="hidden sm:inline">Public View</span>
                  </Button>
                </>
              )}

              {!isAuthenticated ? (
                <Button
                  onClick={() => openAuthModal("register")}
                  className="text-xs h-8 sm:h-9 flex-1 sm:flex-initial bg-white hover:bg-neutral-200 text-black font-semibold flex items-center gap-1.5"
                >
                  <LogIn className="size-3.5" />
                  <span>Sign In</span>
                </Button>
              ) : isOwnProfile ? (
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono text-zinc-300 px-2.5 py-1 rounded bg-zinc-800/80 border border-zinc-700/80 flex items-center gap-1.5">
                    <UserCheck className="size-3.5 text-zinc-400" />
                    <span>Active Member</span>
                  </span>
                </div>
              ) : null}
            </div>
          </div>

          {/* Details */}
          <div className="flex flex-col gap-2 pt-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                {activeUser?.name || "Developer Profile"}
              </h2>
              {activeUser?.pronouns && (
                <span className="text-xs text-zinc-400 font-mono">
                  ({activeUser.pronouns})
                </span>
              )}
              <span className="px-2 py-0.5 rounded-full text-xs font-mono bg-zinc-800/80 text-zinc-300 border border-zinc-700/80">
                {isAuthenticated ? "VERIFIED" : "COMMUNITY"}
              </span>

              {/* Availability status badge */}
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-mono bg-zinc-800/80 text-zinc-300 border border-zinc-700/80">
                <span className="size-1.5 rounded-full bg-zinc-400" />
                {activeUser?.availability === "busy"
                  ? "Busy"
                  : activeUser?.availability === "not_looking"
                  ? "Not Looking"
                  : "Open to collaborate"}
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs font-mono text-[var(--text-muted)]">
              <span className="text-white font-medium">
                {activeUser?.handle || "@developer"}
              </span>
              <span>·</span>
              <span className="text-zinc-300">
                {activeUser?.role || "Fullstack Engineer"}
              </span>
              {activeUser?.location && (
                <>
                  <span>·</span>
                  <span className="flex items-center gap-1 text-zinc-400">
                    <MapPin className="size-3 text-zinc-400" />
                    {activeUser.location}
                  </span>
                </>
              )}
            </div>

            {/* Follow & Following Header Metric Buttons */}
            <div className="flex items-center gap-3 pt-1">
              <button
                type="button"
                onClick={() => openFollowModal("followers")}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[var(--bg-surface-container)] hover:bg-[var(--bg-surface-high)] border border-[var(--border-subtle)] text-xs font-mono text-zinc-300 hover:text-white transition-all cursor-pointer group shadow-sm"
                title="View who follows this developer"
              >
                <Users className="size-3.5 text-zinc-400 group-hover:text-white transition-colors" />
                <span className="font-bold text-white text-xs group-hover:underline">
                  {stats.followersCount}
                </span>
                <span className="text-[var(--text-muted)]">Followers</span>
              </button>

              <button
                type="button"
                onClick={() => openFollowModal("following")}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[var(--bg-surface-container)] hover:bg-[var(--bg-surface-high)] border border-[var(--border-subtle)] text-xs font-mono text-zinc-300 hover:text-white transition-all cursor-pointer group shadow-sm"
                title="View who this developer is following"
              >
                <UserCheck className="size-3.5 text-zinc-400 group-hover:text-white transition-colors" />
                <span className="font-bold text-white text-xs group-hover:underline">
                  {stats.followingCount}
                </span>
                <span className="text-[var(--text-muted)]">Following</span>
              </button>
            </div>

            {/* Custom Status */}
            {activeUser?.customStatus && (
              <div className="inline-flex items-center gap-1.5 text-xs text-zinc-300 py-1 px-2.5 rounded-lg bg-zinc-800/60 border border-zinc-700/60 max-w-fit mt-0.5">
                <span className="text-zinc-400 font-mono text-xs">Status:</span>
                <span>{activeUser.customStatus.replace(/^[🚀⚡🔬]\s*/, "")}</span>
              </div>
            )}

            {/* Bio */}
            <p className="text-xs sm:text-sm text-[var(--text-secondary)] mt-1 max-w-2xl leading-relaxed">
              {activeUser?.bio ||
                "Building software and collaborative tools on ProjectBuddy."}
            </p>

            {/* Social Links Row */}
            <div className="flex flex-wrap items-center gap-2 pt-2">
              {activeUser?.githubUrl && (
                <a
                  href={activeUser.githubUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-2.5 py-1 rounded-md bg-white/5 hover:bg-white/10 border border-white/10 text-xs text-zinc-300 hover:text-white transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <GithubIcon className="size-3.5 text-zinc-400" />
                  <span>GitHub</span>
                  <ExternalLink className="size-3 text-zinc-500" />
                </a>
              )}
              {activeUser?.linkedinUrl && (
                <a
                  href={activeUser.linkedinUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-2.5 py-1 rounded-md bg-white/5 hover:bg-white/10 border border-white/10 text-xs text-zinc-300 hover:text-white transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <LinkedinIcon className="size-3.5 text-zinc-400" />
                  <span>LinkedIn</span>
                  <ExternalLink className="size-3 text-zinc-500" />
                </a>
              )}
              {activeUser?.twitterUrl && (
                <a
                  href={activeUser.twitterUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-2.5 py-1 rounded-md bg-white/5 hover:bg-white/10 border border-white/10 text-xs text-zinc-300 hover:text-white transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <TwitterIcon className="size-3.5 text-zinc-400" />
                  <span>Twitter / X</span>
                  <ExternalLink className="size-3 text-zinc-500" />
                </a>
              )}
              {activeUser?.websiteUrl && (
                <a
                  href={activeUser.websiteUrl}
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
        currentPhoto={activeUser?.avatar || ""}
        initials={activeUser?.initials || "DEV"}
        userName={activeUser?.name || "Developer"}
        onSavePhoto={handleSavePhoto}
      />

      {/* Edit Profile Details Modal */}
      <EditProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        currentUser={activeUser}
        onSaveProfile={handleSaveProfile}
      />

      {/* Followers & Following Network Modal */}
      <FollowListModal
        isOpen={isFollowModalOpen}
        onClose={() => setIsFollowModalOpen(false)}
        initialTab={followModalTab}
        targetUser={activeUser}
        onSelectUser={(selectedDev) => {
          setInspectedUser(selectedDev);
        }}
      />

      {/* Stats Counter with dynamic backend stats & Follow network */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 sm:gap-3">
        {[
          {
            label: "Followers",
            value: stats.followersCount,
            sub: "Developer network",
            onClick: () => openFollowModal("followers"),
            clickable: true,
          },
          {
            label: "Following",
            value: stats.followingCount,
            sub: "Engineers tracked",
            onClick: () => openFollowModal("following"),
            clickable: true,
          },
          {
            label: "Active Projects",
            value: stats.activeProjectsCount,
            sub: "Authored in hub",
          },
          {
            label: "Teams Joined",
            value: stats.teamsJoinedCount,
            sub: `as ${activeUser?.role ? activeUser.role.split(" ")[0] : "Dev"}`,
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
            onClick={stat.onClick}
            className={`p-3.5 rounded-xl bg-[var(--bg-surface-low)] border border-[var(--border-subtle)] flex flex-col gap-1 transition-all hover:border-white/20 ${
              stat.clickable ? "cursor-pointer group hover:bg-[var(--bg-surface-container)]" : ""
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] text-[var(--text-muted)] font-mono">
                {stat.label}
              </span>
              {stat.clickable && (
                <span className="text-[9px] font-mono text-zinc-500 group-hover:text-white transition-colors">
                  view →
                </span>
              )}
            </div>
            <span className={`text-xl sm:text-2xl font-bold text-white ${stat.clickable ? "group-hover:underline" : ""}`}>
              {stat.value}
            </span>
            <span className="text-[10px] text-zinc-400 font-mono truncate">{stat.sub}</span>
          </div>
        ))}
      </div>

      {/* Suggested Developers to Follow (Network Discovery Widget) */}
      <div className="p-4 sm:p-5 rounded-xl bg-[var(--bg-surface-low)] border border-[var(--border-subtle)] flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="size-4 text-emerald-400" />
            <h3 className="text-sm font-semibold text-white tracking-tight">
              Recommended Engineers to Follow
            </h3>
          </div>
          <button
            onClick={() => openFollowModal("following")}
            className="text-xs text-zinc-400 hover:text-white transition-colors cursor-pointer font-mono"
          >
            View all →
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
          {suggestedPeople
            .filter((p) => p.handle?.toLowerCase() !== activeUser?.handle?.toLowerCase())
            .slice(0, 3)
            .map((person) => {
              const followed = isFollowing(person.handle);
              return (
                <div
                  key={person.id}
                  className="p-3 rounded-xl bg-[var(--bg-surface-container)] border border-[var(--border-subtle)] flex items-center justify-between gap-2.5 hover:border-white/20 transition-all"
                >
                  <div
                    className="flex items-center gap-2.5 min-w-0 cursor-pointer"
                    onClick={() => setInspectedUser(person as any)}
                  >
                    <Avatar
                      src={person.avatar}
                      fallback={person.initials}
                      size="sm"
                      className="ring-1 ring-[var(--border-subtle)] shrink-0"
                    />
                    <div className="flex flex-col min-w-0">
                      <span className="text-xs font-semibold text-white truncate hover:underline">
                        {person.name}
                      </span>
                      <span className="text-[11px] text-[var(--text-secondary)] truncate">
                        {person.role}
                      </span>
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
                    className={`h-7 px-2.5 text-xs font-medium shrink-0 rounded-lg gap-1 cursor-pointer group/btn ${
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
                      <>
                        <UserPlus className="size-3" />
                        <span>Follow</span>
                      </>
                    )}
                  </Button>
                </div>
              );
            })}
        </div>
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
          {isOwnProfile && (
            <button
              type="button"
              onClick={() => setIsProfileModalOpen(true)}
              className="text-xs text-zinc-400 hover:text-white transition-colors cursor-pointer"
            >
              + Edit Stack
            </button>
          )}
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

      {/* Edit Profile Modal */}
      <EditProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        currentUser={myUser}
        onSaveProfile={handleSaveProfile}
      />

      {/* Edit Photo Modal */}
      <EditPhotoModal
        isOpen={isPhotoModalOpen}
        onClose={() => setIsPhotoModalOpen(false)}
        currentPhoto={myUser?.avatar}
        initials={myUser?.initials || "DEV"}
        userName={myUser?.name || "Developer"}
        onSavePhoto={handleSavePhoto}
      />

      {/* Follow List Modal (Followers & Following) */}
      <FollowListModal
        isOpen={isFollowModalOpen}
        onClose={() => setIsFollowModalOpen(false)}
        initialTab={followModalTab}
        targetUser={activeUser}
        onSelectUser={(selectedDev) => {
          setInspectedUser(selectedDev);
        }}
      />
    </div>
  );
}
