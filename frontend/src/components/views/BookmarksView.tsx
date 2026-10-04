"use client";

import React, { useState, useEffect } from "react";
import { Bookmark, Code, Cpu, FolderKanban, Loader2 } from "lucide-react";
import { Post } from "@/data/mockData";
import { PostCard } from "@/components/feed/PostCard";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/lib/api";
import { cn } from "@/lib/utils";

interface BookmarksViewProps {
  posts?: Post[];
  onRequestJoin: (post: Post) => void;
  onPostUpdate?: (post: Post) => void;
}

type BookmarkFilter = "all" | "project" | "telemetry" | "code";

export function BookmarksView({
  posts,
  onRequestJoin,
  onPostUpdate,
}: BookmarksViewProps) {
  const { user } = useAuth();
  const [filter, setFilter] = useState<BookmarkFilter>("all");
  const [bookmarks, setBookmarks] = useState<Post[]>([]);
  const [loading, setLoading] = useState(false);

  // If parent page provides posts, derive bookmarked posts directly
  useEffect(() => {
    if (posts && posts.length > 0) {
      const saved = posts.filter((p) => p.userBookmarked);
      setBookmarks(saved);
    } else {
      // Fetch from API if no parent posts provided
      let isMounted = true;
      const fetchSavedBookmarks = async () => {
        try {
          setLoading(true);
          const data = await api.getBookmarks(user?.handle);
          if (isMounted) {
            setBookmarks(data || []);
          }
        } catch (err) {
          console.warn("Could not fetch bookmarks:", err);
          if (isMounted) {
            setBookmarks([]);
          }
        } finally {
          if (isMounted) {
            setLoading(false);
          }
        }
      };
      fetchSavedBookmarks();
      return () => {
        isMounted = false;
      };
    }
  }, [posts, user?.handle]);

  // Handle un-bookmarking live inside the bookmarks view
  const handleBookmarkToggle = (postId: string, isBookmarked: boolean) => {
    if (!isBookmarked) {
      setBookmarks((prev) => prev.filter((p) => p.id !== postId));
    }
  };

  const handleLocalPostUpdate = (updatedPost: Post) => {
    setBookmarks((prev) => {
      if (!updatedPost.userBookmarked) {
        return prev.filter((p) => p.id !== updatedPost.id);
      }
      return prev.map((p) => (p.id === updatedPost.id ? updatedPost : p));
    });
    if (onPostUpdate) {
      onPostUpdate(updatedPost);
    }
  };

  const filteredBookmarks = bookmarks.filter((post) => {
    if (filter === "all") return true;
    return post.type === filter;
  });

  return (
    <div className="flex flex-col min-h-screen">
      {/* Header */}
      <div className="p-4 sm:p-6 border-b border-[var(--border-subtle)] bg-[var(--bg-canvas)]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="size-8 rounded-lg bg-[var(--bg-surface-container)] border border-[var(--border-subtle)] flex items-center justify-center">
              <Bookmark className="size-4 text-amber-400 fill-amber-400" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight">
                Saved & Bookmarked
              </h2>
              <p className="text-xs text-[var(--text-secondary)] mt-0.5">
                Reference architectures, telemetry specs, and code configurations.
              </p>
            </div>
          </div>
          <span className="text-xs font-mono px-2.5 py-1 rounded-full bg-[var(--bg-surface-container)] border border-[var(--border-subtle)] text-[var(--text-muted)]">
            {bookmarks.length} {bookmarks.length === 1 ? "item" : "items"}
          </span>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 mt-4 pt-2 overflow-x-auto scrollbar-none">
          <button
            onClick={() => setFilter("all")}
            className={cn(
              "px-3 py-1 rounded-lg text-xs font-mono transition-colors whitespace-nowrap cursor-pointer",
              filter === "all"
                ? "bg-white text-black font-semibold"
                : "bg-[var(--bg-surface-container)] text-[var(--text-secondary)] hover:text-white border border-[var(--border-subtle)]"
            )}
          >
            All ({bookmarks.length})
          </button>
          <button
            onClick={() => setFilter("project")}
            className={cn(
              "px-3 py-1 rounded-lg text-xs font-mono transition-colors flex items-center gap-1.5 whitespace-nowrap cursor-pointer",
              filter === "project"
                ? "bg-white text-black font-semibold"
                : "bg-[var(--bg-surface-container)] text-[var(--text-secondary)] hover:text-white border border-[var(--border-subtle)]"
            )}
          >
            <FolderKanban className="size-3" />
            <span>Projects</span>
          </button>
          <button
            onClick={() => setFilter("telemetry")}
            className={cn(
              "px-3 py-1 rounded-lg text-xs font-mono transition-colors flex items-center gap-1.5 whitespace-nowrap cursor-pointer",
              filter === "telemetry"
                ? "bg-white text-black font-semibold"
                : "bg-[var(--bg-surface-container)] text-[var(--text-secondary)] hover:text-white border border-[var(--border-subtle)]"
            )}
          >
            <Cpu className="size-3" />
            <span>Telemetry</span>
          </button>
          <button
            onClick={() => setFilter("code")}
            className={cn(
              "px-3 py-1 rounded-lg text-xs font-mono transition-colors flex items-center gap-1.5 whitespace-nowrap cursor-pointer",
              filter === "code"
                ? "bg-white text-black font-semibold"
                : "bg-[var(--bg-surface-container)] text-[var(--text-secondary)] hover:text-white border border-[var(--border-subtle)]"
            )}
          >
            <Code className="size-3" />
            <span>Code Snippets</span>
          </button>
        </div>
      </div>

      {/* Content Stream */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 text-[var(--text-muted)] gap-3">
          <Loader2 className="size-6 animate-spin text-zinc-400" />
          <span className="text-xs font-mono">Loading saved bookmarks...</span>
        </div>
      ) : filteredBookmarks.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 px-6 text-center">
          <div className="size-12 rounded-xl bg-[var(--bg-surface-container)] border border-[var(--border-subtle)] flex items-center justify-center mb-3">
            <Bookmark className="size-5 text-zinc-500" />
          </div>
          <h3 className="text-sm font-semibold text-white">
            {filter === "all" ? "No bookmarks saved yet" : `No ${filter} bookmarks saved`}
          </h3>
          <p className="text-xs text-[var(--text-secondary)] max-w-sm mt-1 leading-relaxed">
            Bookmark projects, hardware specs, and code snippets from your feed using the bookmark icon to access them quickly here.
          </p>
          {filter !== "all" && bookmarks.length > 0 && (
            <button
              onClick={() => setFilter("all")}
              className="mt-3 text-xs text-zinc-300 hover:text-white underline cursor-pointer"
            >
              View all bookmarks ({bookmarks.length})
            </button>
          )}
        </div>
      ) : (
        <div className="divide-y divide-[var(--border-subtle)]">
          {filteredBookmarks.map((post) => (
            <PostCard
              key={post.id}
              post={post}
              onRequestJoin={onRequestJoin}
              onBookmarkToggle={handleBookmarkToggle}
              onPostUpdate={handleLocalPostUpdate}
            />
          ))}
        </div>
      )}
    </div>
  );
}
