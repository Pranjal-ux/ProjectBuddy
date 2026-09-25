"use client";

import React, { useState } from "react";
import {
  Code,
  Image as ImageIcon,
  Smile,
  Users,
  Send,
  Sparkles,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Post } from "@/data/mockData";

interface PostComposerProps {
  onPublish: (newPost: Post) => void;
}

export function PostComposer({ onPublish }: PostComposerProps) {
  const [content, setContent] = useState("");
  const [isExpanded, setIsExpanded] = useState(false);
  const [title, setTitle] = useState("");
  const [tags, setTags] = useState("");
  const [isTeamProject, setIsTeamProject] = useState(false);
  const [teamSize, setTeamSize] = useState(3);
  const [lookingFor, setLookingFor] = useState("");
  const [includeCode, setIncludeCode] = useState(false);
  const [codeContent, setCodeContent] = useState("");
  const [codeFilename, setCodeFilename] = useState("solution.ts");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() && !title.trim()) return;

    const parsedTags = tags
      ? tags.split(",").map((t) => t.trim()).filter(Boolean)
      : ["Next.js", "TypeScript"];

    const newPost: Post = {
      id: `post-${Date.now()}`,
      author: {
        name: "Pranjal Shukla",
        handle: "@pranjal",
        fallback: "PS",
        verified: true,
        role: "Lead Creator",
      },
      createdAt: "Just now",
      type: isTeamProject ? "project" : includeCode ? "code" : "discussion",
      title: title.trim() || undefined,
      content: content.trim(),
      tags: parsedTags,
      team: isTeamProject
        ? {
            current: 1,
            max: teamSize,
            lookingFor: lookingFor
              ? lookingFor.split(",").map((r) => r.trim()).filter(Boolean)
              : ["Fullstack Contributor"],
          }
        : undefined,
      codeSnippet:
        includeCode && codeContent.trim()
          ? {
              filename: codeFilename || "main.ts",
              language: "typescript",
              code: codeContent.trim(),
            }
          : undefined,
      stats: {
        likes: 0,
        comments: 0,
        reposts: 0,
        bookmarks: 0,
      },
      userLiked: false,
    };

    onPublish(newPost);

    // Reset form
    setContent("");
    setTitle("");
    setTags("");
    setIsTeamProject(false);
    setIncludeCode(false);
    setCodeContent("");
    setIsExpanded(false);
  };

  return (
    <div className="p-3.5 sm:p-5 border-b border-[var(--border-subtle)] bg-[var(--bg-surface-low)] transition-colors">
      <form onSubmit={handleSubmit} className="flex gap-2.5 sm:gap-3.5">
        <Avatar
          fallback="PS"
          size="md"
          className="bg-indigo-700 text-white shrink-0 mt-0.5"
        />

        <div className="flex-1 flex flex-col gap-3">
          {/* Optional Project Title Header */}
          {(isExpanded || isTeamProject) && (
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Project Title (e.g. Autonomous Agent Network)"
              className="font-medium text-white bg-[var(--bg-surface-container)]"
            />
          )}

          {/* Main Description */}
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            onFocus={() => setIsExpanded(true)}
            placeholder="What are you building or looking for collaborators on?"
            rows={isExpanded ? 3 : 2}
            className="w-full bg-[var(--bg-surface-container)] rounded-xl p-3 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] border border-[var(--border-subtle)] focus:outline-none focus:border-[var(--color-primary)] focus:ring-1 focus:ring-[var(--color-primary)] transition-all resize-none leading-relaxed"
          />

          {/* Team Collaboration Drawer */}
          {isTeamProject && (
            <div className="p-3.5 rounded-xl bg-[var(--bg-surface-container)] border border-indigo-500/20 flex flex-col gap-3 animate-in fade-in duration-200">
              <div className="flex items-center justify-between text-xs font-medium text-indigo-400">
                <span className="flex items-center gap-1.5">
                  <Users className="size-3.5" />
                  Team Recruiter Settings
                </span>
                <span className="text-[var(--text-muted)] font-mono">
                  Target Size: {teamSize}
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] text-[var(--text-secondary)] font-mono mb-1 block">
                    Roles Needed (comma separated)
                  </label>
                  <Input
                    value={lookingFor}
                    onChange={(e) => setLookingFor(e.target.value)}
                    placeholder="e.g. Rust Dev, UI Designer"
                    className="h-8 text-xs bg-[var(--bg-surface-high)]"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-[var(--text-secondary)] font-mono mb-1 block">
                    Max Team Size
                  </label>
                  <input
                    type="range"
                    min="2"
                    max="8"
                    value={teamSize}
                    onChange={(e) => setTeamSize(Number(e.target.value))}
                    className="w-full accent-indigo-500 mt-2"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Code Snippet Drawer */}
          {includeCode && (
            <div className="p-3.5 rounded-xl bg-[var(--bg-surface-container)] border border-[var(--border-subtle)] flex flex-col gap-2 animate-in fade-in duration-200">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono text-[var(--text-muted)] flex items-center gap-1">
                  <Code className="size-3.5" />
                  Code Attachment
                </span>
                <Input
                  value={codeFilename}
                  onChange={(e) => setCodeFilename(e.target.value)}
                  placeholder="filename.ts"
                  className="w-36 h-7 text-xs font-mono bg-[var(--bg-surface-high)]"
                />
              </div>
              <textarea
                value={codeContent}
                onChange={(e) => setCodeContent(e.target.value)}
                placeholder="// Paste code snippet here..."
                rows={3}
                className="w-full font-mono text-xs p-2.5 rounded-lg bg-[var(--bg-surface-lowest)] text-emerald-400 border border-[var(--border-subtle)] focus:outline-none focus:border-indigo-500"
              />
            </div>
          )}

          {/* Tags Drawer */}
          {isExpanded && (
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-mono text-[var(--text-muted)] shrink-0">
                Tags:
              </span>
              <Input
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                placeholder="Python, React, FastAPI, Solana (comma separated)"
                className="h-8 text-xs bg-[var(--bg-surface-container)]"
              />
            </div>
          )}

          {/* Composer Action Bar */}
          <div className="flex items-center justify-between pt-1">
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setIsTeamProject(!isTeamProject)}
                className={`p-2 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer ${
                  isTeamProject
                    ? "bg-indigo-600/20 text-indigo-400 border border-indigo-500/30"
                    : "text-[var(--text-secondary)] hover:bg-[var(--bg-surface-container)] hover:text-white"
                }`}
                title="Looking for team members"
              >
                <Users className="size-4" />
                <span className="hidden sm:inline">Recruit Team</span>
              </button>

              <button
                type="button"
                onClick={() => setIncludeCode(!includeCode)}
                className={`p-2 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer ${
                  includeCode
                    ? "bg-indigo-600/20 text-indigo-400 border border-indigo-500/30"
                    : "text-[var(--text-secondary)] hover:bg-[var(--bg-surface-container)] hover:text-white"
                }`}
                title="Add code snippet"
              >
                <Code className="size-4" />
                <span className="hidden sm:inline">Code</span>
              </button>

              <button
                type="button"
                onClick={() => setIsExpanded(!isExpanded)}
                className="p-2 rounded-lg text-[var(--text-secondary)] hover:bg-[var(--bg-surface-container)] hover:text-white transition-colors cursor-pointer"
                title="Toggle additional fields"
              >
                {isExpanded ? (
                  <ChevronUp className="size-4" />
                ) : (
                  <ChevronDown className="size-4" />
                )}
              </button>
            </div>

            <Button
              type="submit"
              disabled={!content.trim() && !title.trim()}
              className="gap-2 h-9 px-4 text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg shadow-sm"
            >
              <span>{isTeamProject ? "Publish Project" : "Post"}</span>
              <Send className="size-3.5" />
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}
