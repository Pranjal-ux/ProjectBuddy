"use client";

import React from "react";
import {
  Home,
  Compass,
  MessageSquare,
  Bell,
  Bookmark,
  User,
  Settings,
  Plus,
  Layers,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  openCreateModal: () => void;
}

export function Sidebar({ activeTab, setActiveTab, openCreateModal }: SidebarProps) {
  const navItems = [
    { id: "home", label: "Home", icon: Home },
    { id: "discover", label: "Discover", icon: Compass },
    { id: "messages", label: "Messages", icon: MessageSquare, badge: "3" },
    { id: "activity", label: "Activity", icon: Bell, badge: "5" },
    { id: "bookmarks", label: "Bookmarks", icon: Bookmark },
    { id: "profile", label: "Profile", icon: User },
    { id: "settings", label: "Settings", icon: Settings },
  ];

  // Mobile bottom bar tabs (Home, Discover, Messages, Activity, Profile)
  const mobileNavItems = [
    { id: "home", label: "Home", icon: Home },
    { id: "discover", label: "Discover", icon: Compass },
    { id: "messages", label: "Messages", icon: MessageSquare, badge: "3" },
    { id: "activity", label: "Activity", icon: Bell, badge: "5" },
    { id: "profile", label: "Profile", icon: User },
  ];

  return (
    <>
      {/* ── Desktop & Tablet Left Sidebar ── */}
      <aside
        className="hidden sm:flex shrink-0 h-screen sticky top-0 flex-col justify-between border-r border-[var(--border-subtle)] bg-[var(--bg-surface-low)] select-none
        w-16 md:w-20 lg:w-64 xl:w-72
        p-2 md:p-3 lg:p-5"
      >
        <div className="flex flex-col gap-4 lg:gap-6">
          {/* Logo and Brand */}
          <div className="flex items-center justify-between px-1 pt-1 lg:px-2">
            <div
              onClick={() => setActiveTab("home")}
              className="flex items-center gap-2.5 cursor-pointer"
            >
              <div className="size-9 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-md shadow-indigo-600/30 shrink-0">
                <Layers className="size-5" />
              </div>
              {/* Brand text — hidden on tablet (sm/md), shown lg+ */}
              <div className="hidden lg:flex flex-col">
                <span className="font-bold text-lg tracking-tight text-white leading-none">
                  ProjectBuddy
                </span>
                <span className="text-[11px] font-mono text-[var(--color-secondary)] tracking-wider mt-0.5">
                  DEV NETWORK
                </span>
              </div>
            </div>
            <span className="hidden lg:inline text-[10px] font-mono px-1.5 py-0.5 rounded bg-[var(--bg-surface-high)] text-[var(--text-secondary)] border border-[var(--border-subtle)]">
              v1.0
            </span>
          </div>

          {/* Navigation list */}
          <nav className="flex flex-col gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  title={item.label}
                  className={cn(
                    "relative flex items-center rounded-xl text-sm font-medium transition-all group cursor-pointer",
                    // Sizing: icon-centered on sm/md, full label on lg+
                    "justify-center lg:justify-between px-2 py-2.5 md:px-3 lg:px-3.5",
                    isActive
                      ? "bg-indigo-600/15 text-indigo-400 border border-indigo-500/30 font-semibold"
                      : "text-[var(--text-secondary)] hover:text-white hover:bg-[var(--bg-surface-high)]"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <Icon
                        className={cn(
                          "size-5 transition-transform group-hover:scale-110",
                          isActive
                            ? "text-indigo-400"
                            : "text-[var(--text-muted)] group-hover:text-white"
                        )}
                      />
                      {/* Badge dot on icon for sm/md tablet */}
                      {item.badge && (
                        <span className="lg:hidden absolute -top-1.5 -right-1.5 size-4 rounded-full text-[9px] font-mono font-bold bg-indigo-500 text-white flex items-center justify-center">
                          {item.badge}
                        </span>
                      )}
                    </div>
                    <span className="hidden lg:inline">{item.label}</span>
                  </div>
                  {/* Badge pill — shown only lg+ */}
                  {item.badge && (
                    <span className="hidden lg:inline px-1.5 py-0.2 rounded-full text-[11px] font-mono font-bold bg-indigo-500 text-white">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Action Button */}
          <div className="pt-1">
            {/* Full button on lg+ */}
            <Button
              onClick={openCreateModal}
              className="hidden lg:flex w-full gap-2 h-11 bg-indigo-600 hover:bg-indigo-500 text-white font-medium rounded-xl shadow-lg shadow-indigo-600/20"
            >
              <Plus className="size-4 stroke-[2.5]" />
              <span>Create Project</span>
            </Button>
            {/* Compact icon button on sm/md tablet */}
            <button
              onClick={openCreateModal}
              title="Create Project"
              className="lg:hidden flex items-center justify-center w-full h-10 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white transition-colors shadow-md shadow-indigo-600/20"
            >
              <Plus className="size-5 stroke-[2.5]" />
            </button>
          </div>
        </div>

        {/* User profile snippet */}
        <div
          onClick={() => setActiveTab("profile")}
          className="p-2 lg:p-3 rounded-xl bg-[var(--bg-surface-container)] border border-[var(--border-subtle)] flex items-center justify-between hover:border-[var(--border-strong)] transition-colors cursor-pointer"
        >
          <div className="flex items-center gap-2 lg:gap-3 min-w-0">
            <div className="relative shrink-0">
              <Avatar fallback="PS" size="sm" className="bg-indigo-700 text-white font-bold" />
              <span className="absolute bottom-0 right-0 size-2.5 rounded-full bg-emerald-500 ring-2 ring-[var(--bg-surface-container)]" />
            </div>
            <div className="hidden lg:flex flex-col min-w-0">
              <span className="text-sm font-medium text-white truncate leading-tight">
                Pranjal Shukla
              </span>
              <span className="text-xs font-mono text-[var(--text-muted)] truncate">
                @pranjal
              </span>
            </div>
          </div>
          <span className="hidden lg:inline text-[10px] font-mono px-1.5 py-0.5 rounded bg-emerald-950/60 text-emerald-400 border border-emerald-800/40">
            PRO
          </span>
        </div>
      </aside>

      {/* ── Mobile Floating Action Button (FAB) for Create Project ── */}
      <button
        onClick={openCreateModal}
        title="Create Project"
        className="sm:hidden fixed bottom-18 right-4 z-40 size-12 rounded-full bg-indigo-600 hover:bg-indigo-500 text-white shadow-xl shadow-indigo-600/40 flex items-center justify-center active:scale-95 transition-transform"
      >
        <Plus className="size-6 stroke-[2.5]" />
      </button>

      {/* ── Mobile Bottom Navigation Bar ── */}
      <nav className="sm:hidden fixed bottom-0 left-0 right-0 z-50 flex items-center justify-around bg-[var(--bg-surface-low)]/95 backdrop-blur-md border-t border-[var(--border-subtle)] px-2 py-1.5">
        {mobileNavItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={cn(
                "relative flex flex-col items-center justify-center gap-0.5 px-3 py-1 rounded-xl transition-all cursor-pointer min-w-[56px]",
                isActive
                  ? "text-indigo-400 font-semibold"
                  : "text-[var(--text-muted)] hover:text-[var(--text-secondary)]"
              )}
            >
              <div className="relative">
                <Icon
                  className={cn(
                    "size-5 transition-transform",
                    isActive ? "text-indigo-400 scale-105" : "text-[var(--text-muted)]"
                  )}
                />
                {item.badge && (
                  <span className="absolute -top-1 -right-2 size-3.5 rounded-full text-[9px] font-mono font-bold bg-indigo-500 text-white flex items-center justify-center">
                    {item.badge}
                  </span>
                )}
              </div>
              <span className="text-[10px] leading-tight">{item.label}</span>
            </button>
          );
        })}
      </nav>
    </>
  );
}
