"use client";

import React, { useState } from "react";
import { Dialog, DialogHeader } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Post } from "@/data/mockData";
import { Users, CheckCircle2 } from "lucide-react";

interface JoinTeamModalProps {
  post: Post | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function JoinTeamModal({
  post,
  open,
  onOpenChange,
}: JoinTeamModalProps) {
  const [role, setRole] = useState("");
  const [pitch, setPitch] = useState("");
  const [github, setGithub] = useState("");
  const [submitted, setSubmitted] = useState(false);

  if (!post) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      onOpenChange(false);
      setRole("");
      setPitch("");
      setGithub("");
    }, 1800);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogHeader onClose={() => onOpenChange(false)}>
        <div className="flex items-center gap-2">
          <Users className="size-5 text-indigo-400" />
          <span>Apply to Join Team</span>
        </div>
      </DialogHeader>

      {submitted ? (
        <div className="py-8 flex flex-col items-center justify-center gap-3 text-center animate-in zoom-in-95">
          <CheckCircle2 className="size-12 text-emerald-400" />
          <h4 className="text-base font-semibold text-white">
            Application Sent!
          </h4>
          <p className="text-xs text-[var(--text-secondary)] max-w-xs">
            {post.author.name} ({post.author.handle}) has been notified. Check your
            Messages tab for updates!
          </p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="flex flex-col gap-4 mt-3">
          <div className="p-3 rounded-lg bg-[var(--bg-surface-container)] border border-[var(--border-subtle)] text-xs">
            <span className="text-[var(--text-muted)] block mb-0.5">Project:</span>
            <span className="font-semibold text-white text-sm block">
              {post.title || post.content.slice(0, 45)}
            </span>
            {post.team?.lookingFor && (
              <span className="text-[var(--color-secondary)] block mt-1">
                Roles looking for: {post.team.lookingFor.join(", ")}
              </span>
            )}
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-mono text-[var(--text-secondary)]">
              Which role are you applying for?
            </label>
            <Input
              value={role}
              onChange={(e) => setRole(e.target.value)}
              placeholder="e.g. React Developer or UI Designer"
              required
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-mono text-[var(--text-secondary)]">
              GitHub or Portfolio URL
            </label>
            <Input
              value={github}
              onChange={(e) => setGithub(e.target.value)}
              placeholder="https://github.com/your-username"
              required
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-mono text-[var(--text-secondary)]">
              Quick Pitch & Relevant Experience
            </label>
            <Textarea
              value={pitch}
              onChange={(e) => setPitch(e.target.value)}
              placeholder="Share what skills you bring, hours available per week, or past projects..."
              rows={3}
              required
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
              className="bg-indigo-600 hover:bg-indigo-500 text-white font-medium"
            >
              Send Application
            </Button>
          </div>
        </form>
      )}
    </Dialog>
  );
}
