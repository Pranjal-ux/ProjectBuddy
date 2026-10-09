"use client";

import React, { useState, useEffect } from "react";
import {
  Heart,
  MessageSquare,
  Bookmark,
  Share2,
  Users,
  Copy,
  Check,
  Send,
  Loader2,
} from "lucide-react";
import { Post } from "@/data/mockData";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/lib/api";

interface PostCardProps {
  post: Post;
  onRequestJoin?: (post: Post) => void;
  onTagClick?: (tag: string) => void;
  onBookmarkToggle?: (postId: string, bookmarked: boolean) => void;
  onPostUpdate?: (updatedPost: Post) => void;
  onAuthorClick?: (author: {
    handle: string;
    name?: string;
    avatar?: string;
    fallback?: string;
    role?: string;
  }) => void;
}

export function PostCard({
  post,
  onRequestJoin,
  onTagClick,
  onBookmarkToggle,
  onPostUpdate,
  onAuthorClick,
}: PostCardProps) {
  const { user } = useAuth();
  const [liked, setLiked] = useState(post.userLiked || false);
  const [likesCount, setLikesCount] = useState(post.stats.likes || 0);
  const [bookmarked, setBookmarked] = useState(post.userBookmarked || false);
  const [bookmarksCount, setBookmarksCount] = useState(post.stats.bookmarks || 0);
  const [sharesCount, setSharesCount] = useState(post.stats.shares || 0);
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState(post.commentsList || []);
  const [newComment, setNewComment] = useState("");
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const [codeCopied, setCodeCopied] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  // Sync state if post prop changes
  useEffect(() => {
    setLiked(post.userLiked || false);
    setLikesCount(post.stats.likes || 0);
    setBookmarked(post.userBookmarked || false);
    setBookmarksCount(post.stats.bookmarks || 0);
    setSharesCount(post.stats.shares || 0);
    setComments(post.commentsList || []);
  }, [post]);

  const toggleLike = async () => {
    const nextLiked = !liked;
    const nextCount = nextLiked ? likesCount + 1 : Math.max(0, likesCount - 1);
    setLiked(nextLiked);
    setLikesCount(nextCount);

    if (onPostUpdate) {
      onPostUpdate({
        ...post,
        userLiked: nextLiked,
        stats: {
          ...post.stats,
          likes: nextCount,
        },
      });
    }

    try {
      const res = await api.toggleLike(post.id, user?.handle, user?.name);
      if (res.success) {
        setLiked(res.liked);
        setLikesCount(res.likesCount);
        if (onPostUpdate) {
          onPostUpdate({
            ...post,
            userLiked: res.liked,
            stats: {
              ...post.stats,
              likes: res.likesCount,
            },
          });
        }
      }
    } catch (err) {
      console.warn("Failed to toggle like on backend:", err);
    }
  };

  const toggleBookmark = async () => {
    const nextBookmarked = !bookmarked;
    const nextCount = nextBookmarked
      ? bookmarksCount + 1
      : Math.max(0, bookmarksCount - 1);
    setBookmarked(nextBookmarked);
    setBookmarksCount(nextCount);

    if (onBookmarkToggle) {
      onBookmarkToggle(post.id, nextBookmarked);
    }

    if (onPostUpdate) {
      onPostUpdate({
        ...post,
        userBookmarked: nextBookmarked,
        stats: {
          ...post.stats,
          bookmarks: nextCount,
        },
      });
    }

    try {
      const res = await api.toggleBookmark(post.id, user?.handle);
      if (res.success) {
        setBookmarked(res.bookmarked);
        setBookmarksCount(res.bookmarksCount);
        if (onPostUpdate && res.post) {
          onPostUpdate(res.post);
        }
      }
    } catch (err) {
      console.warn("Failed to toggle bookmark on backend:", err);
    }
  };

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCodeCopied(true);
    setTimeout(() => setCodeCopied(false), 2000);
  };

  const handleShare = async () => {
    // Increment share counter on backend & notify parent
    const nextShares = sharesCount + 1;
    setSharesCount(nextShares);
    if (onPostUpdate) {
      onPostUpdate({
        ...post,
        stats: {
          ...post.stats,
          shares: nextShares,
        },
      });
    }
    api.recordShare(post.id).catch((e) => console.warn("Share count record failed:", e));

    const shareUrl = typeof window !== "undefined" ? window.location.href : "";
    if (navigator.clipboard) {
      navigator.clipboard.writeText(shareUrl);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2200);
    }

    // Native mobile share if supported and user clicks
    if (navigator.share && /mobile|android|iphone/i.test(navigator.userAgent)) {
      try {
        await navigator.share({
          title: post.title || "ProjectBuddy Developer Project",
          text: post.content,
          url: shareUrl,
        });
      } catch {
        // User dismissed native share sheet
      }
    }
  };

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || isSubmittingComment) return;

    const commentText = newComment.trim();
    const optimisticComment = {
      id: `c-${Date.now()}`,
      author: user?.name || "Developer",
      handle: user?.handle || "@developer",
      avatar: user?.avatar || "",
      text: commentText,
      time: "Just now",
    };

    const nextComments = [...comments, optimisticComment];
    setComments(nextComments);
    setNewComment("");
    setIsSubmittingComment(true);

    if (onPostUpdate) {
      onPostUpdate({
        ...post,
        commentsList: nextComments,
        stats: {
          ...post.stats,
          comments: nextComments.length,
        },
      });
    }

    try {
      const res = await api.addComment(post.id, commentText, {
        name: user?.name,
        handle: user?.handle,
        avatar: user?.avatar,
      });

      if (res.success && res.commentsList) {
        setComments(res.commentsList);
        if (onPostUpdate) {
          onPostUpdate({
            ...post,
            commentsList: res.commentsList,
            stats: {
              ...post.stats,
              comments: res.commentsList.length,
            },
          });
        }
      }
    } catch (err) {
      console.warn("Failed to add comment on backend:", err);
    } finally {
      setIsSubmittingComment(false);
    }
  };

  return (
    <article className="p-3.5 sm:p-5 border-b border-[var(--border-subtle)] bg-[var(--bg-canvas)] hover:bg-[var(--bg-surface-low)] transition-all">
      <div className="flex gap-2.5 sm:gap-3.5">
        {/* Author Avatar */}
        <div
          onClick={() =>
            onAuthorClick?.({
              handle: post.author.handle,
              name: post.author.name,
              avatar: post.author.avatarUrl,
              fallback: post.author.fallback,
              role: post.author.role,
            })
          }
          className="shrink-0 cursor-pointer hover:opacity-85 transition-opacity"
          title={`View ${post.author.name}'s profile`}
        >
          <Avatar
            src={post.author.avatarUrl}
            fallback={post.author.fallback}
            size="md"
            className="mt-0.5"
          />
        </div>

        {/* Post Main Body */}
        <div className="flex-1 flex flex-col gap-2 min-w-0">
          {/* Header Row */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 flex-wrap min-w-0">
              <span
                onClick={() =>
                  onAuthorClick?.({
                    handle: post.author.handle,
                    name: post.author.name,
                    avatar: post.author.avatarUrl,
                    fallback: post.author.fallback,
                    role: post.author.role,
                  })
                }
                className="font-semibold text-sm text-white hover:underline cursor-pointer"
                title={`View ${post.author.name}'s profile`}
              >
                {post.author.name}
              </span>
              {post.author.verified && (
                <span className="size-3.5 rounded-full bg-white/10 text-white flex items-center justify-center text-[10px] font-bold">
                  ✓
                </span>
              )}
              <span
                onClick={() =>
                  onAuthorClick?.({
                    handle: post.author.handle,
                    name: post.author.name,
                    avatar: post.author.avatarUrl,
                    fallback: post.author.fallback,
                    role: post.author.role,
                  })
                }
                className="text-xs font-mono text-[var(--text-muted)] hover:text-white cursor-pointer transition-colors"
                title={`View ${post.author.name}'s profile`}
              >
                {post.author.handle}
              </span>
              <span className="text-[var(--text-muted)] text-xs">·</span>
              <span className="text-xs text-[var(--text-muted)]">{post.createdAt}</span>

              {post.author.role && (
                <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-[var(--bg-surface-high)] text-[var(--text-secondary)] border border-[var(--border-subtle)]">
                  {post.author.role}
                </span>
              )}

              <a
                href={`https://github.com/${post.author.handle.replace("@", "")}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-zinc-500 hover:text-white transition-colors"
                title={`Visit ${post.author.handle}'s GitHub profile`}
              >
                <svg className="size-3 fill-current" viewBox="0 0 24 24">
                  <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/>
                </svg>
              </a>
            </div>
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
                  className="cursor-pointer hover:border-white/50 hover:text-white transition-colors"
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
                  <span className="text-xs font-mono font-medium px-2 py-0.5 rounded-full bg-white/10 text-white border border-white/20 flex items-center gap-1.5">
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
                            ? "bg-white"
                            : "bg-[var(--border-strong)]"
                        )}
                      />
                    ))}
                  </div>
                </div>

                <div className="text-xs text-zinc-300">
                  <span className="text-[var(--text-muted)]">Looking for: </span>
                  <span className="font-medium">
                    {post.team.lookingFor.join(" · ")}
                  </span>
                </div>
              </div>

              <Button
                size="sm"
                onClick={() => onRequestJoin?.(post)}
                className="h-8 px-3.5 text-xs font-medium bg-white hover:bg-neutral-200 text-black font-semibold rounded-lg shrink-0 gap-1.5"
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
              <pre className="p-3.5 text-[12px] leading-relaxed text-zinc-200 overflow-x-auto">
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
              className="flex items-center gap-1.5 hover:text-white transition-colors group cursor-pointer"
              title="View comments"
            >
              <MessageSquare className="size-4 group-hover:scale-110 transition-transform" />
              <span>{comments.length}</span>
            </button>

            {/* Like button */}
            <button
              onClick={toggleLike}
              className={cn(
                "flex items-center gap-1.5 hover:text-rose-500 transition-colors group cursor-pointer",
                liked && "text-rose-500 font-semibold"
              )}
              title={liked ? "Unlike" : "Like"}
            >
              <Heart
                className={cn(
                  "size-4 group-hover:scale-110 transition-transform",
                  liked && "fill-current"
                )}
              />
              <span>{likesCount}</span>
            </button>

            {/* Bookmark button */}
            <button
              onClick={toggleBookmark}
              className={cn(
                "flex items-center gap-1.5 hover:text-white transition-colors group cursor-pointer",
                bookmarked && "text-amber-400"
              )}
              title={bookmarked ? "Remove bookmark" : "Save bookmark"}
            >
              <Bookmark
                className={cn(
                  "size-4 group-hover:scale-110 transition-transform",
                  bookmarked && "fill-current"
                )}
              />
              <span>{bookmarksCount > 0 ? bookmarksCount : ""}</span>
            </button>

            {/* Share button */}
            <button
              onClick={handleShare}
              className="flex items-center gap-1.5 hover:text-white transition-colors group cursor-pointer relative"
              title="Share project"
            >
              {copiedLink ? (
                <Check className="size-4 text-emerald-400" />
              ) : (
                <Share2 className="size-4 group-hover:scale-110 transition-transform" />
              )}
              <span>{sharesCount > 0 ? sharesCount : ""}</span>
              {copiedLink && (
                <span className="absolute -top-7 left-1/2 -translate-x-1/2 text-[10px] bg-neutral-900 border border-[var(--border-subtle)] text-white px-2 py-0.5 rounded shadow whitespace-nowrap z-30">
                  Link Copied!
                </span>
              )}
            </button>
          </div>

          {/* Inline Comments Thread */}
          {showComments && (
            <div className="mt-3 pt-3 border-t border-[var(--border-subtle)] flex flex-col gap-3 animate-in fade-in duration-200">
              {comments.length === 0 ? (
                <p className="text-xs text-[var(--text-muted)] italic py-1">
                  No comments yet. Start the conversation!
                </p>
              ) : (
                comments.map((comment) => (
                  <div key={comment.id} className="flex gap-2.5 text-xs">
                    <div
                      onClick={() =>
                        onAuthorClick?.({
                          handle: comment.handle,
                          name: comment.author,
                          avatar: comment.avatar,
                        })
                      }
                      className="shrink-0 cursor-pointer hover:opacity-85 transition-opacity"
                      title={`View ${comment.author}'s profile`}
                    >
                      <Avatar
                        src={comment.avatar}
                        fallback={(comment.author || "U").slice(0, 2).toUpperCase()}
                        size="sm"
                      />
                    </div>
                    <div className="flex-1 bg-[var(--bg-surface-container)] p-2.5 rounded-lg border border-[var(--border-subtle)]">
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-1.5">
                          <span
                            onClick={() =>
                              onAuthorClick?.({
                                handle: comment.handle,
                                name: comment.author,
                                avatar: comment.avatar,
                              })
                            }
                            className="font-semibold text-white hover:underline cursor-pointer"
                            title={`View ${comment.author}'s profile`}
                          >
                            {comment.author}
                          </span>
                          <span
                            onClick={() =>
                              onAuthorClick?.({
                                handle: comment.handle,
                                name: comment.author,
                                avatar: comment.avatar,
                              })
                            }
                            className="text-[11px] font-mono text-[var(--text-muted)] hover:text-white cursor-pointer transition-colors"
                            title={`View ${comment.author}'s profile`}
                          >
                            {comment.handle}
                          </span>
                        </div>
                        <span className="text-[10px] text-[var(--text-muted)]">
                          {comment.time}
                        </span>
                      </div>
                      <p className="text-[var(--text-primary)] leading-normal">
                        {comment.text}
                      </p>
                    </div>
                  </div>
                ))
              )}

              {/* Add comment box */}
              <form onSubmit={handleAddComment} className="flex gap-2 mt-1">
                <input
                  type="text"
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  disabled={isSubmittingComment}
                  placeholder="Write a reply or question about this project..."
                  className="flex-1 h-8 px-3 rounded-lg bg-[var(--bg-surface-container)] border border-[var(--border-subtle)] text-xs text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-white disabled:opacity-50"
                />
                <Button
                  type="submit"
                  size="sm"
                  disabled={!newComment.trim() || isSubmittingComment}
                  className="h-8 px-3 text-xs bg-white hover:bg-neutral-200 text-black font-semibold gap-1 disabled:opacity-50"
                >
                  {isSubmittingComment ? (
                    <Loader2 className="size-3 animate-spin" />
                  ) : (
                    <>
                      <span>Reply</span>
                      <Send className="size-3" />
                    </>
                  )}
                </Button>
              </form>
            </div>
          )}
        </div>
      </div>
    </article>
  );
}
