"use client";

import React from "react";
import { Bookmark, Code, FileText } from "lucide-react";
import { initialPosts, Post } from "@/data/mockData";
import { PostCard } from "@/components/feed/PostCard";

interface BookmarksViewProps {
  onRequestJoin: (post: Post) => void;
}

export function BookmarksView({ onRequestJoin }: BookmarksViewProps) {
  const bookmarkedPosts = initialPosts.filter((p) => p.type === "code" || p.type === "telemetry");

  return (
    <div className="flex flex-col">
      <div className="p-4 sm:p-6 border-b border-[var(--border-subtle)]">
        <div className="flex items-center gap-2">
          <Bookmark className="size-4 sm:size-5 text-amber-400 fill-amber-400" />
          <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight">
            Saved & Bookmarked Snippets
          </h2>
        </div>
        <p className="text-xs text-[var(--text-secondary)] mt-1">
          Reference architectures, hardware specs, and code configurations.
        </p>
      </div>

      <div className="divide-y divide-[var(--border-subtle)]">
        {bookmarkedPosts.map((post) => (
          <PostCard
            key={post.id}
            post={post}
            onRequestJoin={onRequestJoin}
          />
        ))}
      </div>
    </div>
  );
}
