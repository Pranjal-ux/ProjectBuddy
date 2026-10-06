"use client";

import React from "react";
import { cn } from "@/lib/utils";

interface ProjectBuddyLogoProps {
  variant?: "full" | "icon" | "responsive";
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  className?: string;
  showBadge?: boolean;
}

export function ProjectBuddyLogo({
  variant = "responsive",
  size = "md",
  className,
  showBadge = false,
}: ProjectBuddyLogoProps) {
  // Height presets for full logo
  const heightClasses = {
    xs: "h-6",
    sm: "h-7",
    md: "h-8 sm:h-9",
    lg: "h-10 sm:h-11",
    xl: "h-12 sm:h-14",
  };

  // Icon container dimensions
  const iconSizes = {
    xs: "size-6 rounded-lg",
    sm: "size-7 rounded-lg",
    md: "size-9 rounded-xl",
    lg: "size-10 rounded-xl",
    xl: "size-12 rounded-2xl",
  };

  if (variant === "icon") {
    return (
      <div
        className={cn(
          "relative overflow-hidden bg-black border border-white/15 shrink-0 flex items-center justify-center select-none shadow-sm",
          iconSizes[size],
          className
        )}
      >
        <img
          src="/projectbuddy-logo.png"
          alt="ProjectBuddy Icon"
          className="w-[285%] max-w-none h-auto object-cover -translate-x-[18.2%] pointer-events-none"
        />
      </div>
    );
  }

  if (variant === "full") {
    return (
      <div className={cn("inline-flex items-center gap-2 select-none shrink-0", className)}>
        <img
          src="/projectbuddy-logo.png"
          alt="ProjectBuddy Logo"
          className={cn("w-auto object-contain rounded-lg max-w-[210px]", heightClasses[size])}
        />
        {showBadge && (
          <span className="hidden lg:inline text-[10px] font-mono px-1.5 py-0.5 rounded bg-[var(--bg-surface-high)] text-[var(--text-secondary)] border border-[var(--border-subtle)] shrink-0">
            v1.0
          </span>
        )}
      </div>
    );
  }

  // Responsive: On compact/tablet (hidden on lg+), shows icon; on desktop (lg+), shows full logo
  return (
    <div className={cn("inline-flex items-center gap-2 select-none shrink-0", className)}>
      {/* Compact Icon on mobile / tablet */}
      <div
        className={cn(
          "lg:hidden relative overflow-hidden bg-black border border-white/15 shrink-0 flex items-center justify-center shadow-sm",
          iconSizes[size]
        )}
      >
        <img
          src="/projectbuddy-logo.png"
          alt="ProjectBuddy Mark"
          className="w-[285%] max-w-none h-auto object-cover -translate-x-[18.2%] pointer-events-none"
        />
      </div>

      {/* Full Logo on desktop */}
      <div className="hidden lg:flex items-center gap-2">
        <img
          src="/projectbuddy-logo.png"
          alt="ProjectBuddy Logo"
          className={cn("w-auto object-contain rounded-lg max-w-[210px]", heightClasses[size])}
        />
        {showBadge && (
          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[var(--bg-surface-high)] text-[var(--text-secondary)] border border-[var(--border-subtle)] shrink-0">
            v1.0
          </span>
        )}
      </div>
    </div>
  );
}
