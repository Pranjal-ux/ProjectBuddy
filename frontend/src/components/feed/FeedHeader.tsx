"use client";

import React from "react";
import { Moon, Sun, Filter, Code, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface FeedHeaderProps {
  feedFilter: "for-you" | "following" | "open-teams" | "showcases";
  setFeedFilter: (filter: "for-you" | "following" | "open-teams" | "showcases") => void;
  theme: "charcoal" | "oled";
  toggleTheme: () => void;
  openCreateModal: () => void;
}

export function FeedHeader({
  feedFilter,
  setFeedFilter,
  theme,
  toggleTheme,
  openCreateModal,
}: FeedHeaderProps) {
  const tabs = [
    { id: "for-you", label: "For You" },
    { id: "following", label: "Following" },
    { id: "open-teams", label: "Open Teams", icon: Users },
    { id: "showcases", label: "Code & Telemetry", icon: Code },
  ];

  return (
    <header className="sticky top-0 z-30 border-b border-[var(--border-subtle)] bg-[var(--bg-canvas)]/90 backdrop-blur-md">
      {/* Top Header Row */}
      <div className="flex items-center justify-between px-4 sm:px-6 py-3 sm:py-3.5">
        <div className="flex items-center gap-2 sm:gap-3">
          <h1 className="font-bold text-base sm:text-xl text-white tracking-tight">
            {theme === "oled" ? "OLED Feed" : "Home Feed"}
          </h1>
          <span className="hidden sm:inline text-xs px-2 py-0.5 rounded-full font-mono bg-white/10 text-white border border-white/20">
            Live Stream
          </span>
        </div>

        {/* Right Tools */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Theme switcher */}
          <button
            onClick={toggleTheme}
            className="flex items-center gap-1.5 sm:gap-2 px-2 sm:px-3 py-1.5 rounded-lg border border-[var(--border-strong)] bg-[var(--bg-surface-container)] hover:bg-[var(--bg-surface-high)] text-xs font-mono text-[var(--text-secondary)] hover:text-white transition-colors cursor-pointer"
            title="Toggle between Developer Dark and True OLED Black mode"
          >
            {theme === "oled" ? (
              <>
                <Sun className="size-3.5 text-zinc-300" />
                <span className="hidden sm:inline">OLED: ON</span>
              </>
            ) : (
              <>
                <Moon className="size-3.5 text-zinc-300" />
                <span className="hidden sm:inline">Theme: Dark</span>
              </>
            )}
          </button>

          {/* "+ New Project" hidden on mobile (create via FAB in bottom nav) */}
          <Button
            size="sm"
            onClick={openCreateModal}
            className="hidden sm:flex h-8 px-3 text-xs bg-white hover:bg-neutral-200 text-black font-semibold"
          >
            <span>+ New Project</span>
          </Button>
        </div>
      </div>

      {/* Filter Tabs Row — scrollable on mobile */}
      <div className="flex items-center gap-0 px-2 sm:px-6 overflow-x-auto no-scrollbar">
        {tabs.map((tab) => {
          const isActive = feedFilter === tab.id;
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() =>
                setFeedFilter(
                  tab.id as "for-you" | "following" | "open-teams" | "showcases"
                )
              }
              className={cn(
                "relative py-2.5 sm:py-3 px-2.5 sm:px-3 text-xs sm:text-sm font-medium transition-colors flex items-center gap-1 sm:gap-2 whitespace-nowrap cursor-pointer shrink-0",
                isActive
                  ? "text-white font-semibold"
                  : "text-[var(--text-secondary)] hover:text-white"
              )}
            >
              {Icon && <Icon className="size-3 sm:size-4 text-[var(--text-muted)]" />}
              <span>{tab.label}</span>
              {isActive && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-white rounded-full" />
              )}
            </button>
          );
        })}
      </div>
    </header>
  );
}
