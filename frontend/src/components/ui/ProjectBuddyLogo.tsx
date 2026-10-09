"use client";

import React from "react";
import { cn } from "@/lib/utils";

interface ProjectBuddyLogoProps {
  variant?: "full" | "icon" | "responsive";
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  className?: string;
}

// The exact vectorized SVG path of the ProjectBuddy "P" Monogram Buddy Logo
const PB_MONOGRAM_PATH =
  "M 74.03 10.40 L 70.61 8.55 L 66.69 7.08 L 62.28 6.20 L 59.64 6.00 L 16.18 6.00 L 14.32 6.59 L 13.34 7.47 L 12.56 9.13 L 12.56 25.38 L 12.95 27.63 L 13.83 30.18 L 14.91 32.14 L 16.28 34.00 L 17.75 35.46 L 19.21 36.54 L 21.76 38.01 L 24.60 38.99 L 26.36 39.38 L 28.02 39.48 L 28.32 39.87 L 25.48 40.46 L 20.68 42.41 L 18.63 43.88 L 15.49 47.01 L 13.93 49.76 L 12.95 52.40 L 12.56 54.26 L 12.46 87.54 L 12.56 91.26 L 13.05 92.43 L 13.73 93.22 L 15.20 93.90 L 20.88 93.90 L 24.11 93.31 L 26.26 92.43 L 27.93 91.45 L 28.91 90.67 L 31.06 88.32 L 32.33 85.78 L 33.02 82.74 L 33.02 57.88 L 33.41 55.24 L 34.78 52.10 L 36.34 50.05 L 38.40 48.19 L 41.34 46.62 L 42.71 46.13 L 45.06 45.74 L 54.06 45.64 L 53.87 45.25 L 52.89 44.76 L 51.13 42.90 L 50.24 41.14 L 49.95 39.18 L 50.05 37.03 L 50.64 35.37 L 51.52 34.09 L 53.08 32.53 L 53.87 32.04 L 56.12 31.25 L 58.27 31.16 L 59.64 31.35 L 61.40 32.14 L 63.46 33.80 L 64.83 36.15 L 65.22 38.11 L 64.93 40.75 L 63.85 43.00 L 62.38 44.57 L 60.91 45.35 L 60.72 45.64 L 64.14 46.13 L 67.08 47.21 L 69.82 49.07 L 71.19 50.64 L 71.39 51.22 L 69.04 52.79 L 66.69 53.77 L 62.38 54.75 L 46.43 54.75 L 43.00 55.73 L 40.55 57.29 L 39.09 58.76 L 38.20 60.13 L 37.32 61.99 L 36.83 64.24 L 36.83 81.18 L 37.72 80.49 L 43.20 73.25 L 45.94 70.51 L 47.31 69.63 L 51.22 68.16 L 52.89 67.96 L 59.05 67.96 L 62.48 67.57 L 66.69 66.59 L 69.43 65.61 L 73.35 63.66 L 75.40 62.28 L 78.44 59.74 L 81.18 56.61 L 82.94 54.06 L 84.51 51.03 L 86.36 45.94 L 87.25 41.34 L 87.44 38.60 L 87.25 32.43 L 86.76 29.49 L 85.88 26.16 L 84.31 22.25 L 81.57 17.55 L 78.73 14.22 L 77.26 12.85 Z M 35.56 20.00 L 37.13 20.00 L 38.99 20.39 L 40.36 20.88 L 41.04 21.37 L 41.24 21.37 L 43.29 23.13 L 44.27 24.40 L 44.47 24.99 L 44.86 25.58 L 44.86 25.87 L 45.25 26.65 L 45.55 29.10 L 45.45 30.67 L 45.25 31.16 L 45.25 31.65 L 44.86 32.33 L 44.86 32.63 L 44.27 33.90 L 42.90 35.56 L 41.04 37.03 L 39.58 37.72 L 39.38 37.91 L 37.03 38.40 L 35.27 38.40 L 33.21 37.91 L 33.02 37.72 L 32.14 37.52 L 31.45 36.93 L 30.37 36.34 L 29.49 35.56 L 28.71 34.58 L 28.51 34.09 L 28.12 33.60 L 27.93 32.92 L 27.63 32.53 L 27.54 31.94 L 27.24 31.45 L 27.05 29.88 L 27.14 27.83 L 27.63 26.07 L 28.71 24.01 L 29.69 22.84 L 30.67 21.96 L 31.06 21.76 L 31.16 21.56 L 31.84 21.27 L 32.33 20.88 L 32.82 20.78 L 33.02 20.59 L 33.60 20.39 L 34.09 20.39 Z";

/**
 * High-fidelity vector SVG brand emblem for ProjectBuddy.
 * Renders the iconic "P" Buddy monogram with high visibility and organic atmospheric glow.
 */
export function ProjectBuddyEmblem({
  className,
  size = "md",
}: {
  className?: string;
  size?: "xs" | "sm" | "md" | "lg" | "xl";
}) {
  const pixelSizes = {
    xs: "size-7 sm:size-8",     // 28px - 32px
    sm: "size-8 sm:size-9",     // 32px - 36px
    md: "size-10 sm:size-11",   // 40px - 44px
    lg: "size-12 sm:size-14",   // 48px - 56px
    xl: "size-16 sm:size-20",   // 64px - 80px
  };

  return (
    <div
      className={cn(
        "relative shrink-0 flex items-center justify-center select-none group/logo transition-transform duration-200 hover:scale-105",
        pixelSizes[size],
        className
      )}
    >
      {/* Outer ambient glow cloud matching the original design */}
      <div className="absolute inset-0 rounded-2xl bg-white/10 blur-md opacity-40 group-hover/logo:opacity-80 transition-opacity duration-300 pointer-events-none" />

      {/* Sleek backplate squircle with subtle border */}
      <div className="absolute inset-0 rounded-xl sm:rounded-2xl bg-black border border-white/20 shadow-lg shadow-black/80" />

      {/* Razor-sharp Vector Monogram */}
      <svg
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full relative z-10 p-1.5 sm:p-2 drop-shadow-[0_0_12px_rgba(255,255,255,0.7)]"
      >
        <defs>
          <filter id="pb-core-glow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="1.8" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* Monogram P with Buddy figures cut out */}
        <path
          d={PB_MONOGRAM_PATH}
          fill="#FFFFFF"
          fillRule="evenodd"
          filter="url(#pb-core-glow)"
        />
      </svg>
    </div>
  );
}

/**
 * Main ProjectBuddy brand logo component with high visibility, large font size, and high font weight.
 */
export function ProjectBuddyLogo({
  variant = "responsive",
  size = "md",
  className,
}: ProjectBuddyLogoProps) {
  // Bold high-impact font sizes
  const textSizes = {
    xs: "text-base sm:text-lg",
    sm: "text-lg sm:text-xl",
    md: "text-xl sm:text-2xl",
    lg: "text-2xl sm:text-3xl",
    xl: "text-3xl sm:text-4xl",
  };

  const gapSizes = {
    xs: "gap-2",
    sm: "gap-2.5",
    md: "gap-3",
    lg: "gap-3.5",
    xl: "gap-4",
  };

  // Typography wordmark
  const Wordmark = () => (
    <div className="flex items-center gap-2 leading-none">
      <div
        className={cn(
          "font-black tracking-tight text-white flex items-center select-none",
          textSizes[size]
        )}
      >
        <span className="font-extrabold text-white">Project</span>
        <span className="font-black text-white ml-0.5 drop-shadow-[0_1px_4px_rgba(255,255,255,0.4)]">
          Buddy
        </span>
        <span className="size-1.5 rounded-full bg-white ml-1 shadow-[0_0_8px_#ffffff] inline-block animate-pulse" />
      </div>
    </div>
  );

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
        <Wordmark />
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
      <div className="lg:hidden flex items-center justify-center">
        <ProjectBuddyEmblem size={size} />
      </div>

      {/* Desktop Full Logo */}
      <div className={cn("hidden lg:flex items-center", gapSizes[size])}>
        <ProjectBuddyEmblem size={size} />
        <Wordmark />
      </div>
    </div>
  );
}
