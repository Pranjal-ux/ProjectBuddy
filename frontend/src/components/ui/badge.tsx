import * as React from "react";
import { cn } from "@/lib/utils";

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "secondary" | "outline" | "success" | "tech";
}

export function Badge({
  className,
  variant = "default",
  ...props
}: BadgeProps) {
  const variants = {
    default:
      "bg-[var(--bg-surface-high)] text-[var(--color-primary-light)] border border-[var(--border-subtle)]",
    secondary:
      "bg-[var(--bg-surface-container)] text-[var(--color-secondary)] border border-[var(--border-subtle)]",
    outline:
      "border border-[var(--border-strong)] text-[var(--text-secondary)]",
    success:
      "bg-emerald-950/60 text-emerald-400 border border-emerald-800/50",
    tech: "bg-[var(--badge-bg)] text-[var(--badge-text)] border border-[var(--border-subtle)] font-mono text-[11px] tracking-wide",
  };

  return (
    <div
      className={cn(
        "inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium transition-colors",
        variants[variant],
        className
      )}
      {...props}
    />
  );
}
