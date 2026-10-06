"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  X,
  Search,
  Users,
  UserCheck,
  UserPlus,
  Check,
  Sparkles,
  ExternalLink,
  Code2,
} from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogHeader } from "@/components/ui/dialog";
import { useAuth } from "@/context/AuthContext";
import { api, User as UserType } from "@/lib/api";
import { suggestedPeople } from "@/data/mockData";

interface FollowListModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: "followers" | "following";
  targetUser: UserType | null;
  onSelectUser?: (developer: UserType) => void;
}

export function FollowListModal({
  isOpen,
  onClose,
  initialTab = "followers",
  targetUser,
  onSelectUser,
}: FollowListModalProps) {
  const { user: authUser, isFollowing, toggleFollowUser } = useAuth();
  const [activeTab, setActiveTab] = useState<"followers" | "following">(initialTab);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [followersList, setFollowersList] = useState<UserType[]>([]);
  const [followingList, setFollowingList] = useState<UserType[]>([]);
  const [togglingHandles, setTogglingHandles] = useState<Set<string>>(new Set());

  // Update active tab when modal opens or initialTab changes
  useEffect(() => {
    if (isOpen) {
      setActiveTab(initialTab);
      setSearchQuery("");
    }
  }, [isOpen, initialTab]);

  // Load followers & following from backend / cache
  useEffect(() => {
    if (!isOpen || !targetUser?.handle) return;

    let isMounted = true;
    const fetchLists = async () => {
      try {
        setLoading(true);
        const [followersRes, followingRes] = await Promise.allSettled([
          api.getFollowers(targetUser.handle, authUser?.handle),
          api.getFollowing(targetUser.handle, authUser?.handle),
        ]);

        if (isMounted) {
          if (followersRes.status === "fulfilled" && followersRes.value.length > 0) {
            setFollowersList(followersRes.value);
          } else {
            // Seed realistic followers from mock buddies
            const defaultFollowers: UserType[] = suggestedPeople.slice(0, 4).map((p) => ({
              id: p.id,
              name: p.name,
              handle: p.handle,
              email: `${p.handle.replace(/^@/, "")}@projectbuddy.dev`,
              role: p.role,
              bio: p.bio,
              avatar: p.avatar,
              initials: p.initials,
              skills: p.skills,
              location: p.location,
              stats: p.stats,
            }));
            setFollowersList(defaultFollowers);
          }

          if (followingRes.status === "fulfilled" && followingRes.value.length > 0) {
            setFollowingList(followingRes.value);
          } else {
            // Seed realistic following from mock buddies
            const defaultFollowing: UserType[] = suggestedPeople.slice(1, 3).map((p) => ({
              id: p.id,
              name: p.name,
              handle: p.handle,
              email: `${p.handle.replace(/^@/, "")}@projectbuddy.dev`,
              role: p.role,
              bio: p.bio,
              avatar: p.avatar,
              initials: p.initials,
              skills: p.skills,
              location: p.location,
              stats: p.stats,
            }));
            setFollowingList(defaultFollowing);
          }
        }
      } catch (err) {
        console.warn("Could not load follow lists from API, using fallback data:", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchLists();
    return () => {
      isMounted = false;
    };
  }, [isOpen, targetUser?.handle, authUser?.handle]);

  // Handle follow / unfollow toggle
  const handleToggle = async (dev: UserType) => {
    const handle = dev.handle;
    setTogglingHandles((prev) => new Set(prev).add(handle));
    try {
      await toggleFollowUser({
        handle: dev.handle,
        name: dev.name,
        id: dev.id || dev._id,
      });
    } finally {
      setTogglingHandles((prev) => {
        const next = new Set(prev);
        next.delete(handle);
        return next;
      });
    }
  };

  // Filter current active list by search query
  const currentList = activeTab === "followers" ? followersList : followingList;
  const filteredList = useMemo(() => {
    if (!searchQuery.trim()) return currentList;
    const q = searchQuery.toLowerCase().trim();
    return currentList.filter(
      (d) =>
        d.name?.toLowerCase().includes(q) ||
        d.handle?.toLowerCase().includes(q) ||
        d.role?.toLowerCase().includes(q) ||
        d.skills?.some((s) => s.toLowerCase().includes(q))
    );
  }, [currentList, searchQuery]);

  const followersCount = targetUser?.stats?.followersCount ?? followersList.length;
  const followingCount = targetUser?.stats?.followingCount ?? followingList.length;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <div className="flex flex-col gap-4 max-h-[80vh]">
        {/* Header with Title and Tabs */}
        <div className="flex items-center justify-between pb-3 border-b border-[var(--border-subtle)]">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-white/10 text-white">
              <Users className="size-4" />
            </span>
            <div>
              <h2 className="text-base font-bold text-white tracking-tight">
                {targetUser?.name || "Developer"}&apos;s Network
              </h2>
              <p className="text-[11px] text-[var(--text-muted)] font-mono">
                {targetUser?.handle || "@developer"}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-[var(--text-muted)] hover:text-white hover:bg-[var(--bg-surface-high)] transition-colors cursor-pointer"
          >
            <X className="size-4" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-[var(--bg-surface-container)] border border-[var(--border-subtle)]">
          <button
            onClick={() => setActiveTab("followers")}
            className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              activeTab === "followers"
                ? "bg-white text-black shadow-sm"
                : "text-[var(--text-secondary)] hover:text-white"
            }`}
          >
            <Users className="size-3.5" />
            <span>Followers</span>
            <span
              className={`text-[10px] font-mono px-1.5 py-0.2 rounded-full ${
                activeTab === "followers" ? "bg-black/10 text-black" : "bg-white/10 text-white"
              }`}
            >
              {followersCount}
            </span>
          </button>

          <button
            onClick={() => setActiveTab("following")}
            className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              activeTab === "following"
                ? "bg-white text-black shadow-sm"
                : "text-[var(--text-secondary)] hover:text-white"
            }`}
          >
            <UserCheck className="size-3.5" />
            <span>Following</span>
            <span
              className={`text-[10px] font-mono px-1.5 py-0.2 rounded-full ${
                activeTab === "following" ? "bg-black/10 text-black" : "bg-white/10 text-white"
              }`}
            >
              {followingCount}
            </span>
          </button>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-2.5 size-3.5 text-[var(--text-muted)]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={`Search ${activeTab} by name, handle, skill...`}
            className="w-full h-9 pl-9 pr-8 rounded-lg bg-[var(--bg-surface-container)] border border-[var(--border-subtle)] text-xs text-white placeholder:text-[var(--text-muted)] focus:outline-none focus:border-white/40 transition-all font-mono"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-2.5 top-2.5 text-[10px] text-[var(--text-muted)] hover:text-white cursor-pointer"
            >
              Clear
            </button>
          )}
        </div>

        {/* User List Stream */}
        <div className="flex flex-col gap-2 overflow-y-auto max-h-[46vh] pr-1 divide-y divide-[var(--border-subtle)]/40">
          {loading ? (
            <div className="p-8 text-center text-xs text-[var(--text-muted)] flex flex-col items-center justify-center gap-2">
              <div className="size-5 rounded-full border-2 border-white/20 border-t-white animate-spin" />
              <span>Loading developer network...</span>
            </div>
          ) : filteredList.length === 0 ? (
            <div className="p-8 text-center flex flex-col items-center justify-center gap-2">
              <Users className="size-8 text-[var(--text-muted)]/50" />
              <p className="text-xs text-[var(--text-secondary)]">
                {searchQuery
                  ? `No ${activeTab} found matching "${searchQuery}"`
                  : activeTab === "followers"
                  ? "No followers yet. Share your profile to build your network!"
                  : "Not following anyone yet. Discover and follow tech buddies!"}
              </p>
            </div>
          ) : (
            filteredList.map((dev) => {
              const isUserSelf =
                authUser?.handle &&
                dev.handle?.toLowerCase() === authUser.handle.toLowerCase();
              const followed = isFollowing(dev.handle);
              const isToggling = togglingHandles.has(dev.handle);

              return (
                <div
                  key={dev.id || dev._id || dev.handle}
                  className="pt-2.5 pb-2.5 flex items-center justify-between gap-3 group"
                >
                  {/* Left: Avatar + Details */}
                  <div
                    className="flex items-center gap-3 min-w-0 cursor-pointer"
                    onClick={() => {
                      if (onSelectUser) {
                        onSelectUser(dev);
                        onClose();
                      }
                    }}
                  >
                    <Avatar
                      src={dev.avatar}
                      fallback={dev.initials || dev.name?.slice(0, 2).toUpperCase() || "DEV"}
                      size="md"
                      className="bg-zinc-800 ring-1 ring-[var(--border-subtle)] group-hover:ring-white/40 transition-all shrink-0"
                    />
                    <div className="flex flex-col min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-xs font-semibold text-white truncate group-hover:underline">
                          {dev.name}
                        </span>
                        <span className="text-[11px] font-mono text-[var(--text-muted)]">
                          {dev.handle}
                        </span>
                      </div>
                      <span className="text-[11px] text-[var(--text-secondary)] truncate max-w-[220px] sm:max-w-[280px]">
                        {dev.role || "Software Engineer"}
                      </span>
                      {dev.skills && dev.skills.length > 0 && (
                        <div className="flex items-center gap-1 pt-1 flex-wrap">
                          {dev.skills.slice(0, 3).map((s) => (
                            <span
                              key={s}
                              className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-white/5 border border-white/10 text-zinc-300"
                            >
                              {s}
                            </span>
                          ))}
                          {dev.skills.length > 3 && (
                            <span className="text-[9px] font-mono text-[var(--text-muted)]">
                              +{dev.skills.length - 3}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Right: Follow Toggle Button */}
                  {!isUserSelf && (
                    <Button
                      size="sm"
                      variant={followed ? "outline" : "secondary"}
                      disabled={isToggling}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleToggle(dev);
                      }}
                      className={`h-7 px-2.5 text-xs font-medium shrink-0 rounded-lg transition-all cursor-pointer gap-1 group/btn ${
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
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Footer Info */}
        <div className="pt-2 border-t border-[var(--border-subtle)] flex items-center justify-between text-[11px] text-[var(--text-muted)] font-mono">
          <span>{filteredList.length} developers shown</span>
          <span className="text-zinc-400">ProjectBuddy Network</span>
        </div>
      </div>
    </Dialog>
  );
}
