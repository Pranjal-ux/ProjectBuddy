"use client";

import React, { useState } from "react";
import { Dialog, DialogHeader } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Post } from "@/data/mockData";
import { Sparkles } from "lucide-react";

interface CreateProjectModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onPublish: (newPost: Post) => void;
}

export function CreateProjectModal({
  open,
  onOpenChange,
  onPublish,
}: CreateProjectModalProps) {
  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [tags, setTags] = useState("");
  const [teamSize, setTeamSize] = useState(4);
  const [lookingFor, setLookingFor] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !desc.trim()) return;

    const parsedTags = tags
      ? tags.split(",").map((t) => t.trim()).filter(Boolean)
      : ["TypeScript", "Next.js"];

    const newPost: Post = {
      id: `proj-${Date.now()}`,
      author: {
        name: "Pranjal Shukla",
        handle: "@pranjal",
        fallback: "PS",
        verified: true,
        role: "Lead Creator",
      },
      createdAt: "Just now",
      type: "project",
      title: title.trim(),
      content: desc.trim(),
      tags: parsedTags,
      team: {
        current: 1,
        max: teamSize,
        lookingFor: lookingFor
          ? lookingFor.split(",").map((r) => r.trim()).filter(Boolean)
          : ["Contributor"],
      },
      stats: {
        likes: 1,
        comments: 0,
        reposts: 0,
        bookmarks: 0,
      },
      userLiked: true,
    };

    onPublish(newPost);
    setTitle("");
    setDesc("");
    setTags("");
    setLookingFor("");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogHeader onClose={() => onOpenChange(false)}>
        <div className="flex items-center gap-2">
          <Sparkles className="size-5 text-white" />
          <span>Publish New Project</span>
        </div>
      </DialogHeader>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4 mt-4">
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-mono text-[var(--text-secondary)]">
            Project Title
          </label>
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Decentralized File Share"
            required
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-mono text-[var(--text-secondary)]">
            Description & Architecture
          </label>
          <Textarea
            value={desc}
            onChange={(e) => setDesc(e.target.value)}
            placeholder="Describe your architecture, goals, tech stack, and what problem you are solving..."
            rows={3}
            required
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-mono text-[var(--text-secondary)]">
              Tags (comma separated)
            </label>
            <Input
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder="React, Solidity, IPFS"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-mono text-[var(--text-secondary)]">
              Max Team Size
            </label>
            <Input
              type="number"
              min={2}
              max={10}
              value={teamSize}
              onChange={(e) => setTeamSize(Number(e.target.value))}
            />
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-mono text-[var(--text-secondary)]">
            Looking for Roles (comma separated)
          </label>
          <Input
            value={lookingFor}
            onChange={(e) => setLookingFor(e.target.value)}
            placeholder="e.g. Frontend Dev, Smart Contract Auditor, UI/UX"
          />
        </div>

        <div className="flex items-center justify-end gap-3 pt-3 border-t border-[var(--border-subtle)]">
          <Button
            type="button"
            variant="ghost"
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button
            type="submit"
          >
            Publish Project
          </Button>
        </div>
      </form>
    </Dialog>
  );
}
