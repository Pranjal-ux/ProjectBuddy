"use client";

import React from "react";
import { Dialog, DialogHeader } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { suggestedProjects } from "@/data/mockData";
import { Sparkles, Users, ExternalLink } from "lucide-react";

interface ProjectDetailModalProps {
  project: (typeof suggestedProjects)[0] | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onApply: () => void;
}

export function ProjectDetailModal({
  project,
  open,
  onOpenChange,
  onApply,
}: ProjectDetailModalProps) {
  if (!project) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogHeader onClose={() => onOpenChange(false)}>
        <div className="flex items-center gap-2">
          <Sparkles className="size-5 text-white" />
          <span>Project Overview</span>
        </div>
      </DialogHeader>

      <div className="flex flex-col gap-4 mt-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="text-lg font-bold text-white">{project.title}</h3>
            <span className="text-xs font-mono text-zinc-400">
              Match score: {project.matchScore}%
            </span>
          </div>
          <Badge variant="default" className="text-xs">
            Team: {project.members}
          </Badge>
        </div>

        <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
          {project.description}
        </p>

        <div>
          <span className="text-xs font-mono text-[var(--text-muted)] block mb-1.5">
            Technologies & Stacks
          </span>
          <div className="flex flex-wrap gap-1.5">
            {project.tags.map((tag) => (
              <Badge key={tag} variant="tech">
                {tag}
              </Badge>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 pt-3 border-t border-[var(--border-subtle)]">
          <Button
            type="button"
            variant="ghost"
            onClick={() => onOpenChange(false)}
          >
            Close
          </Button>
          <Button
            onClick={() => {
              onOpenChange(false);
              onApply();
            }}
          >
            Request to Join
          </Button>
        </div>
      </div>
    </Dialog>
  );
}
