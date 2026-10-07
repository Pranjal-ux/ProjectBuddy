"use client";

import React from "react";
import { cn } from "@/lib/utils";

interface ProjectBuddyLogoProps {
  variant?: "full" | "icon" | "responsive";
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  className?: string;
  showBadge?: boolean;
  badgeText?: string;
}

/**
 * High-fidelity vector SVG brand emblem for ProjectBuddy.
 * Scales pixel-perfectly from 16px to 256px with glowing gradients and zero raster distortion.
 */
export function ProjectBuddyEmblem({
  className,
  size = "md",
}: {
  className?: string;
  size?: "xs" | "sm" | "md" | "lg" | "xl";
}) {
  const pixelSizes = {
    xs: "size-6", // 24px
    sm: "size-7", // 28px
    md: "size-9", // 36px
    lg: "size-10", // 40px
    xl: "size-12", // 48px
  };

  return (
    <div
      className={cn(
        "relative shrink-0 flex items-center justify-center select-none group/logo transition-transform duration-200 hover:scale-105",
        pixelSizes[size],
        className
      )}
    >
      {/* Ambient background glow on hover */}
      <div className="absolute inset-0 rounded-xl bg-gradient-to-tr from-indigo-600/30 via-sky-500/20 to-cyan-400/20 blur-md opacity-0 group-hover/logo:opacity-100 transition-opacity duration-300 pointer-events-none" />

      {/* Vector SVG Mark */}
      <svg
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full relative z-10 drop-shadow-[0_2px_8px_rgba(0,0,0,0.5)]"
      >
        <defs>
          <linearGradient id="pb-emblem-bg" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#0f172a" />
            <stop offset="50%" stopColor="#090d16" />
            <stop offset="100%" stopColor="#030712" />
          </linearGradient>

          <linearGradient id="pb-emblem-border" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#818cf8" stopOpacity="0.75" />
            <stop offset="50%" stopColor="#38bdf8" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#6366f1" stopOpacity="0.65" />
          </linearGradient>

          <linearGradient id="pb-emblem-p" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#c084fc" />
            <stop offset="45%" stopColor="#818cf8" />
            <stop offset="100%" stopColor="#3b82f6" />
          </linearGradient>

          <linearGradient id="pb-emblem-b" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#38bdf8" />
            <stop offset="50%" stopColor="#06b6d4" />
            <stop offset="100%" stopColor="#10b981" />
          </linearGradient>

          <filter id="pb-emblem-glow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* Base Squircle Box */}
        <rect
          x="5"
          y="5"
          width="90"
          height="90"
          rx="24"
          fill="url(#pb-emblem-bg)"
          stroke="url(#pb-emblem-border)"
          strokeWidth="2"
        />

        {/* Inner Subtle Radial Glow */}
        <circle cx="50" cy="50" r="30" fill="#38bdf8" opacity="0.08" />

        {/* Collaborative Mark: Interlocking P & B */}
        <g filter="url(#pb-emblem-glow)">
          {/* P Loop */}
          <path
            d="M32 72V28C32 24.6863 34.6863 22 38 22H48C56.8366 22 64 29.1634 64 38C64 46.8366 56.8366 54 48 54H32"
            stroke="url(#pb-emblem-p)"
            strokeWidth="7"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* B Loop */}
          <path
            d="M48 54H54C62.8366 54 70 61.1634 70 70C70 74.4183 66.4183 78 62 78H38"
            stroke="url(#pb-emblem-b)"
            strokeWidth="7"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Synergy Central Node */}
          <circle cx="48" cy="54" r="4.5" fill="#38bdf8" />
          <circle cx="48" cy="54" r="2" fill="#ffffff" />
        </g>

        {/* Code Bracket Whispers */}
        <path
          d="M21 46L16 50L21 54"
          stroke="#818cf8"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          opacity="0.8"
        />
        <path
          d="M79 46L84 50L79 54"
          stroke="#38bdf8"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          opacity="0.8"
        />
      </svg>
    </div>
  );
}

/**
 * Main ProjectBuddy brand logo component.
 * Supports icon-only, full brand mark with typography, or responsive mode.
 */
export function ProjectBuddyLogo({
  variant = "responsive",
  size = "md",
  className,
  showBadge = false,
  badgeText = "v1.0",
}: ProjectBuddyLogoProps) {
  // Typography font size mapping
  const textSizes = {
    xs: "text-sm",
    sm: "text-base",
    md: "text-lg",
    lg: "text-xl",
    xl: "text-2xl",
  };

  const gapSizes = {
    xs: "gap-1.5",
    sm: "gap-2",
    md: "gap-2.5",
    lg: "gap-3",
    xl: "gap-3.5",
  };

  const badgeSizes = {
    xs: "text-[9px] px-1 py-0.2",
    sm: "text-[10px] px-1.5 py-0.5",
    md: "text-[10px] px-1.5 py-0.5",
    lg: "text-[11px] px-2 py-0.5",
    xl: "text-xs px-2.5 py-1",
  };

  // 1. Icon only variant
  if (variant === "icon") {
    return <ProjectBuddyEmblem size={size} className={className} />;
  }

  // 2. Full logo variant (Emblem + Typography + Optional Badge)
  if (variant === "full") {
    return (
      <div
        className={cn(
          "inline-flex items-center select-none shrink-0 group/pb cursor-pointer",
          gapSizes[size],
          className
        )}
      >
        <ProjectBuddyEmblem size={size} />

        <div className="flex items-center gap-1.5 leading-none">
          <div className={cn("font-bold tracking-tight text-white flex items-center", textSizes[size])}>
            <span>Project</span>
            <span className="font-extrabold bg-gradient-to-r from-indigo-400 via-sky-400 to-cyan-300 bg-clip-text text-transparent ml-0.5">
              Buddy
            </span>
            <span className="size-1 rounded-full bg-cyan-400 ml-0.5 shadow-[0_0_6px_#38bdf8] inline-block animate-pulse" />
          </div>

          {showBadge && (
            <span
              className={cn(
                "font-mono font-medium rounded-full bg-indigo-500/10 text-indigo-300 border border-indigo-500/30 shrink-0 tracking-tight",
                badgeSizes[size]
              )}
            >
              {badgeText}
            </span>
          )}
        </div>
      </div>
    );
  }

  // 3. Responsive variant: Icon on mobile/tablet, full logo on desktop (lg+)
  return (
    <div
      className={cn(
        "inline-flex items-center select-none shrink-0 cursor-pointer group/pb",
        className
      )}
    >
      {/* Mobile & Tablet Compact Emblem */}
      <div className="lg:hidden">
        <ProjectBuddyEmblem size={size} />
      </div>

      {/* Desktop Full Logo */}
      <div className={cn("hidden lg:flex items-center", gapSizes[size])}>
        <ProjectBuddyEmblem size={size} />

        <div className="flex items-center gap-1.5 leading-none">
          <div className={cn("font-bold tracking-tight text-white flex items-center", textSizes[size])}>
            <span>Project</span>
            <span className="font-extrabold bg-gradient-to-r from-indigo-400 via-sky-400 to-cyan-300 bg-clip-text text-transparent ml-0.5">
              Buddy
            </span>
            <span className="size-1 rounded-full bg-cyan-400 ml-0.5 shadow-[0_0_6px_#38bdf8] inline-block animate-pulse" />
          </div>

          {showBadge && (
            <span
              className={cn(
                "font-mono font-medium rounded-full bg-indigo-500/10 text-indigo-300 border border-indigo-500/30 shrink-0 tracking-tight",
                badgeSizes[size]
              )}
            >
              {badgeText}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
