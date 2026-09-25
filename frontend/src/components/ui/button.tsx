import * as React from "react";
import { cn } from "@/lib/utils";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "oled";
  size?: "sm" | "md" | "lg" | "icon";
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", ...props }, ref) => {
    const baseStyles =
      "inline-flex items-center justify-center font-medium rounded-lg transition-all focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-indigo-500 disabled:pointer-events-none disabled:opacity-50 cursor-pointer active:scale-[0.98]";

    const variants = {
      primary:
        "bg-indigo-600 hover:bg-indigo-500 text-white shadow-sm shadow-indigo-500/20",
      secondary:
        "bg-[var(--bg-surface-high)] hover:bg-[var(--bg-surface-highest)] text-[var(--text-primary)] border border-[var(--border-subtle)]",
      outline:
        "border border-[var(--border-strong)] bg-transparent hover:bg-[var(--bg-surface-high)] text-[var(--text-primary)] hover:border-[var(--text-secondary)]",
      ghost:
        "bg-transparent hover:bg-[var(--bg-surface-container)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]",
      oled:
        "bg-white text-black font-semibold hover:bg-neutral-200 transition-colors shadow-sm",
    };

    const sizes = {
      sm: "h-8 px-3 text-xs tracking-wide",
      md: "h-9 px-4 text-sm",
      lg: "h-11 px-6 text-base font-semibold",
      icon: "h-9 w-9 p-0",
    };

    return (
      <button
        ref={ref}
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        {...props}
      />
    );
  }
);

Button.displayName = "Button";
