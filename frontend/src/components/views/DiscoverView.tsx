"use client";

import React, { useState } from "react";
import { Search, Filter, Sparkles, Users, ArrowUpRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { initialPosts, Post } from "@/data/mockData";

interface DiscoverViewProps {
  onJoinClick: (post: Post) => void;
  searchQuery: string;
}

export function DiscoverView({ onJoinClick, searchQuery }: DiscoverViewProps) {
  const [selectedCategory, setSelectedCategory] = useState("all");

  const categories = [
    { id: "all", label: "All Projects" },
    { id: "ai", label: "AI & ML" },
    { id: "systems", label: "Systems & Rust" },
    { id: "web3", label: "Web3 & Crypto" },
    { id: "frontend", label: "Design Systems & UI" },
  ];

  const projects = initialPosts.filter((p) => p.type === "project");

  const filteredProjects = projects.filter((p) => {
    const matchesSearch =
      !searchQuery ||
      p.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.tags?.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));

    if (!matchesSearch) return false;

    if (selectedCategory === "all") return true;
    if (selectedCategory === "ai")
      return p.tags?.some((t) => ["Python", "YOLO", "FastAPI", "NLP", "OpenAI"].includes(t));
    if (selectedCategory === "web3")
      return p.tags?.some((t) => ["Solidity", "Ethers.js", "Web3", "Radix"].includes(t));
    if (selectedCategory === "frontend")
      return p.tags?.some((t) => ["React", "Tailwind", "CSS", "TypeScript"].includes(t));

    return true;
  });

  return (
    <div className="flex flex-col gap-4 sm:gap-6 p-4 sm:p-6">
      <div>
        <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight">
          Explore Projects & Teams
        </h2>
        <p className="text-xs text-[var(--text-secondary)] mt-1">
          Discover open-source initiatives and developer projects recruiting collaborators.
        </p>
      </div>

      {/* Category Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
        {categories.map((c) => (
          <button
            key={c.id}
            onClick={() => setSelectedCategory(c.id)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all whitespace-nowrap cursor-pointer ${
              selectedCategory === c.id
                ? "bg-white text-black shadow-sm"
                : "bg-[var(--bg-surface-container)] text-[var(--text-secondary)] hover:text-white border border-[var(--border-subtle)]"
            }`}
          >
            {c.label}
          </button>
        ))}
      </div>

      {/* Projects Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredProjects.map((proj) => (
          <div
            key={proj.id}
            className="p-5 rounded-xl bg-[var(--bg-surface-low)] border border-[var(--border-subtle)] hover:border-[var(--border-strong)] transition-all flex flex-col justify-between gap-4 group"
          >
            <div className="flex flex-col gap-2.5">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h3 className="text-base font-semibold text-white group-hover:text-white transition-colors">
                    {proj.title}
                  </h3>
                  <span className="text-xs font-mono text-[var(--text-muted)]">
                    by {proj.author.name} ({proj.author.handle})
                  </span>
                </div>
                {proj.team && (
                  <span className="px-2 py-0.5 rounded-full text-[11px] font-mono bg-white/10 text-white border border-white/20 shrink-0">
                    {proj.team.current}/{proj.team.max} slots
                  </span>
                )}
              </div>

              <p className="text-xs text-[var(--text-secondary)] leading-relaxed line-clamp-3">
                {proj.content}
              </p>

              <div className="flex flex-wrap gap-1.5 pt-1">
                {proj.tags?.map((t) => (
                  <Badge key={t} variant="tech">
                    {t}
                  </Badge>
                ))}
              </div>
            </div>

            <div className="pt-3 border-t border-[var(--border-subtle)] flex items-center justify-between">
              <div className="text-xs text-zinc-300 truncate max-w-[200px]">
                <span className="text-[var(--text-muted)]">Needs: </span>
                {proj.team?.lookingFor.join(", ")}
              </div>

              <Button
                size="sm"
                onClick={() => onJoinClick(proj)}
                className="h-8 px-3 text-xs bg-white hover:bg-neutral-200 text-black font-semibold rounded-lg gap-1"
              >
                <span>Join Team</span>
                <ArrowUpRight className="size-3.5" />
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
