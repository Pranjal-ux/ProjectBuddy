"use client";

import React, { useState } from "react";
import {
  Heart,
  MessageSquare,
  Repeat2,
  Bookmark,
  Share2,
  MoreHorizontal,
  Users,
  Copy,
  Check,
  Send,
  Sparkles,
} from "lucide-react";
import { Post } from "@/data/mockData";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface PostCardProps {
  post: Post;
  onRequestJoin?: (post: Post) => void;
  onTagClick?: (tag: string) => void;
}

export function PostCard({ post, onRequestJoin, onTagClick }: PostCardProps) {
  const [liked, setLiked] = useState(post.userLiked || false);
  const [likesCount, setLikesCount] = useState(post.stats.likes);
  const [bookmarked, setBookmarked] = useState(post.userBookmarked || false);
  const [reposted, setReposted] = useState(false);
  const [repostsCount, setRepostsCount] = useState(post.stats.reposts);
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState(post.commentsList || []);
  const [newComment, setNewComment] = useState("");
  const [codeCopied, setCodeCopied] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  const toggleLike = () => {
    if (liked) {
      setLiked(false);
      setLikesCount((prev) => prev - 1);
    } else {
      setLiked(true);
      setLikesCount((prev) => prev + 1);
    }
  };

  const toggleRepost = () => {
    if (reposted) {
      setReposted(false);
      setRepostsCount((prev) => prev - 1);
    } else {
      setReposted(true);
      setRepostsCount((prev) => prev + 1);
    }
  };

  const toggleBookmark = () => {
    setBookmarked(!bookmarked);
  };

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCodeCopied(true);
    setTimeout(() => setCodeCopied(false), 2000);
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    setComments((prev) => [
      ...prev,
      {
        id: `c-${Date.now()}`,
        author: "Pranjal Shukla",
        handle: "@pranjal",
        text: newComment.trim(),
        time: "Just now",
      },
    ]);
    setNewComment("");
  };

  return (
    <article className="p-3.5 sm:p-5 border-b border-[var(--border-subtle)] bg-[var(--bg-canvas)] hover:bg-[var(--bg-surface-low)] transition-all">
      <div className="flex gap-2.5 sm:gap-3.5">
        {/* Author Avatar */}
        <Avatar
          src={post.author.avatarUrl}
          fallback={post.author.fallback}
          size="md"
          className="mt-0.5 shrink-0"
        />

        {/* Post Main Body */}
        <div className="flex-1 flex flex-col gap-2 min-w-0">
          {/* Header Row */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 flex-wrap min-w-0">
              <span className="font-semibold text-sm text-white hover:underline cursor-pointer">
                {post.author.name}
              </span>
              {post.author.verified && (
                <span className="size-3.5 rounded-full bg-indigo-500/20 text-indigo-400 flex items-center justify-center text-[10px] font-bold">
                  ✓
                </span>
              )}
              <span className="text-xs font-mono text-[var(--text-muted)]">
                {post.author.handle}
              </span>
              <span className="text-[var(--text-muted)] text-xs">·</span>
              <span className="text-xs text-[var(--text-muted)]">{post.createdAt}</span>

              {post.author.role && (
                <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-[var(--bg-surface-high)] text-[var(--text-secondary)] border border-[var(--border-subtle)]">
                  {post.author.role}
                </span>
              )}
            </div>

            <button
              className="text-[var(--text-muted)] hover:text-white p-1 rounded transition-colors"
              title="More options"
            >
              <MoreHorizontal className="size-4" />
            </button>
          </div>

          {/* Project Title (if any) */}
          {post.title && (
            <h4 className="font-semibold text-base text-white tracking-tight leading-snug">
              {post.title}
            </h4>
          )}

          {/* Post Content */}
          <p className="text-sm text-[var(--text-primary)] leading-relaxed whitespace-pre-line">
            {post.content}
          </p>

          {/* Tech Stack Tags */}
          {post.tags && post.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 pt-1">
              {post.tags.map((tag) => (
                <Badge
                  key={tag}
                  variant="tech"
                  className="cursor-pointer hover:border-indigo-500/50 hover:text-indigo-300 transition-colors"
                  onClick={() => onTagClick?.(tag)}
                >
                  {tag}
                </Badge>
              ))}
            </div>
          )}

          {/* Team Collaboration Progress & Looking For Block */}
          {post.team && (
            <div className="mt-2 p-3 rounded-xl bg-[var(--bg-surface-container)] border border-[var(--border-subtle)] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex flex-col gap-1.5">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono font-medium px-2 py-0.5 rounded-full bg-indigo-500/15 text-indigo-400 border border-indigo-500/30 flex items-center gap-1.5">
                    <Users className="size-3.5" />
                    Team: {post.team.current} / {post.team.max} members
                  </span>
                  <div className="flex gap-1">
                    {Array.from({ length: post.team.max }).map((_, i) => (
                      <span
                        key={i}
                        className={cn(
                          "size-2 rounded-full",
                          i < post.team!.current
                            ? "bg-indigo-500"
                            : "bg-[var(--border-strong)]"
                        )}
                      />
                    ))}
                  </div>
                </div>

                <div className="text-xs text-[var(--color-secondary)]">
                  <span className="text-[var(--text-muted)]">Looking for: </span>
                  <span className="font-medium">
                    {post.team.lookingFor.join(" · ")}
                  </span>
                </div>
              </div>

              <Button
                size="sm"
                onClick={() => onRequestJoin?.(post)}
                className="h-8 px-3.5 text-xs font-medium bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg shrink-0 gap-1.5"
              >
                <span>Request to Join</span>
              </Button>
            </div>
          )}

          {/* Code Snippet Box (Screen 1 tokens.config.css style) */}
          {post.codeSnippet && (
            <div className="mt-2 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface-lowest)] overflow-hidden font-mono text-xs">
              <div className="flex items-center justify-between px-3 py-2 border-b border-[var(--border-subtle)] bg-[var(--bg-surface-container)]">
                <div className="flex items-center gap-2">
                  <span className="size-2 rounded-full bg-emerald-500" />
                  <span className="text-xs text-[var(--text-secondary)]">
                    {post.codeSnippet.filename}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-[var(--bg-surface-high)] text-[var(--text-muted)] uppercase">
                    {post.codeSnippet.language}
                  </span>
                  <button
                    onClick={() => handleCopyCode(post.codeSnippet!.code)}
                    className="p-1 rounded text-[var(--text-muted)] hover:text-white hover:bg-[var(--bg-surface-high)] transition-colors flex items-center gap-1"
                    title="Copy code"
                  >
                    {codeCopied ? (
                      <>
                        <Check className="size-3.5 text-emerald-400" />
                        <span className="text-[10px] text-emerald-400">Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy className="size-3.5" />
                        <span className="text-[10px]">Copy</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
              <pre className="p-3.5 text-[12px] leading-relaxed text-indigo-200 overflow-x-auto">
                <code>{post.codeSnippet.code}</code>
              </pre>
            </div>
          )}

          {/* Hardware / Telemetry Card (Screen 1 OLED spec style) */}
          {post.telemetry && (
            <div className="mt-2 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface-lowest)] overflow-hidden group">
              <div
                className="h-48 w-full bg-cover bg-center transition-transform group-hover:scale-102 duration-300"
                style={{ backgroundImage: `url('${post.telemetry.imageUrl}')` }}
              />
              <div className="p-3 bg-[var(--bg-surface-container)] border-t border-[var(--border-subtle)] flex items-center justify-between">
                <div>
                  <p className="text-white text-xs font-semibold font-mono">
                    {post.telemetry.filename}
                  </p>
                  <p className="text-[var(--text-muted)] text-[11px] font-mono mt-0.5">
                    {post.telemetry.description}
                  </p>
                </div>
                <span className="text-[10px] font-mono text-white px-2 py-0.5 rounded border border-[var(--border-subtle)] bg-[var(--bg-surface-high)]">
                  {post.telemetry.spec}
                </span>
              </div>
            </div>
          )}

          {/* Micro-Interactions Toolbar */}
          <div className="flex items-center justify-between w-full sm:max-w-md pt-3 text-[var(--text-muted)] text-xs">
            {/* Comments Toggle */}
            <button
              onClick={() => setShowComments(!showComments)}
              className="flex items-center gap-1.5 hover:text-[var(--color-secondary)] transition-colors group cursor-pointer"
            >
              <MessageSquare className="size-4 group-hover:scale-110 transition-transform" />
              <span>{comments.length}</span>
            </button>

            {/* Repost */}
            <button
              onClick={toggleRepost}
              className={cn(
                "flex items-center gap-1.5 hover:text-emerald-400 transition-colors group cursor-pointer",
                reposted && "text-emerald-400 font-semibold"
              )}
            >
              <Repeat2 className="size-4 group-hover:scale-110 transition-transform" />
              <span>{repostsCount}</span>
            </button>

            {/* Like button */}
            <button
              onClick={toggleLike}
              className={cn(
                "flex items-center gap-1.5 hover:text-rose-500 transition-colors group cursor-pointer",
                liked && "text-rose-500 font-semibold"
              )}
            >
              <Heart
                className={cn(
                  "size-4 group-hover:scale-110 transition-transform",
                  liked && "fill-current"
                )}
              />
              <span>{likesCount}</span>
            </button>

            {/* Bookmark */}
            <button
              onClick={toggleBookmark}
              className={cn(
                "flex items-center gap-1.5 hover:text-white transition-colors group cursor-pointer",
                bookmarked && "text-amber-400"
              )}
            >
              <Bookmark
                className={cn(
                  "size-4 group-hover:scale-110 transition-transform",
                  bookmarked && "fill-current"
                )}
              />
            </button>

            {/* Share */}
            <button
              onClick={handleShare}
              className="flex items-center gap-1.5 hover:text-white transition-colors group cursor-pointer relative"
              title="Share link"
            >
              {copiedLink ? (
                <Check className="size-4 text-emerald-400" />
              ) : (
                <Share2 className="size-4 group-hover:scale-110 transition-transform" />
              )}
              {copiedLink && (
                <span className="absolute -top-7 left-1/2 -translate-x-1/2 text-[10px] bg-neutral-900 text-white px-2 py-0.5 rounded shadow whitespace-nowrap">
                  Link Copied!
                </span>
              )}
            </button>
          </div>

          {/* Inline Comments Thread */}
          {showComments && (
            <div className="mt-3 pt-3 border-t border-[var(--border-subtle)] flex flex-col gap-3 animate-in fade-in duration-200">
              {comments.map((comment) => (
                <div key={comment.id} className="flex gap-2.5 text-xs">
                  <Avatar fallback={comment.author.slice(0, 2).toUpperCase()} size="sm" />
                  <div className="flex-1 bg-[var(--bg-surface-container)] p-2.5 rounded-lg border border-[var(--border-subtle)]">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-semibold text-white">
                        {comment.author}
                      </span>
                      <span className="text-[10px] text-[var(--text-muted)]">
                        {comment.time}
                      </span>
                    </div>
                    <p className="text-[var(--text-primary)] leading-normal">
                      {comment.text}
                    </p>
                  </div>
                </div>
              ))}

              {/* Add comment box */}
              <form onSubmit={handleAddComment} className="flex gap-2 mt-1">
                <input
                  type="text"
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Write a reply or question about this project..."
                  className="flex-1 h-8 px-3 rounded-lg bg-[var(--bg-surface-container)] border border-[var(--border-subtle)] text-xs text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-indigo-500"
                />
                <Button
                  type="submit"
                  size="sm"
                  disabled={!newComment.trim()}
                  className="h-8 px-3 text-xs bg-indigo-600 hover:bg-indigo-500 text-white gap-1"
                >
                  <span>Reply</span>
                  <Send className="size-3" />
                </Button>
              </form>
            </div>
          )}
        </div>
      </div>
    </article>
  );
}
