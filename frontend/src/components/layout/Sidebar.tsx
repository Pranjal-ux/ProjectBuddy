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
  LogOut,
  LogIn,
  UserPlus,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar } from "@/components/ui/avatar";
import { ProjectBuddyLogo } from "@/components/ui/ProjectBuddyLogo";
import { cn } from "@/lib/utils";
import { useAuth } from "@/context/AuthContext";

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  openCreateModal: () => void;
}

export function Sidebar({ activeTab, setActiveTab, openCreateModal }: SidebarProps) {
  const { user, isAuthenticated, logout, openAuthModal } = useAuth();
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
        className={cn(
          "hidden sm:flex shrink-0 h-screen sticky top-0 flex-col justify-between border-r border-[var(--border-subtle)] bg-[var(--bg-surface-low)] select-none",
          "w-16 md:w-20 lg:w-64 xl:w-72 p-2 md:p-3 lg:p-5"
        )}
      >
        <div className="flex flex-col gap-4 lg:gap-6">
          {/* Logo and Brand */}
          <div className="flex items-center justify-between px-1 pt-1 lg:px-2">
            <div
              onClick={() => setActiveTab("home")}
              className="flex items-center cursor-pointer transition-transform hover:scale-[1.02]"
              title="ProjectBuddy Home"
            >
              <ProjectBuddyLogo variant="responsive" size="md" showBadge={true} />
            </div>
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
                      ? "bg-white/10 text-white border border-white/20 font-semibold"
                      : "text-[var(--text-secondary)] hover:text-white hover:bg-[var(--bg-surface-high)]"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <Icon
                        className={cn(
                          "size-5 transition-transform group-hover:scale-110",
                          isActive
                            ? "text-white"
                            : "text-[var(--text-muted)] group-hover:text-white"
                        )}
                      />
                      {/* Badge dot on icon for sm/md tablet */}
                      {item.badge && (
                        <span className="lg:hidden absolute -top-1.5 -right-1.5 size-4 rounded-full text-[9px] font-mono font-bold bg-white text-black flex items-center justify-center">
                          {item.badge}
                        </span>
                      )}
                    </div>
                    <span className="hidden lg:inline">{item.label}</span>
                  </div>
                  {/* Badge pill — shown only lg+ */}
                  {item.badge && (
                    <span className="hidden lg:inline px-1.5 py-0.2 rounded-full text-[11px] font-mono font-bold bg-white text-black">
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
              className="hidden lg:flex w-full gap-2 h-11 bg-white hover:bg-white text-black hover:text-black font-medium rounded-xl shadow-md"
            >
              <Plus className="size-4 stroke-[2.5]" />
              <span>Create Project</span>
            </Button>
            {/* Compact icon button on sm/md tablet */}
            <button
              onClick={openCreateModal}
              title="Create Project"
              className="lg:hidden flex items-center justify-center w-full h-10 rounded-xl bg-white hover:bg-white text-black shadow-md"
            >
              <Plus className="size-5 stroke-[2.5]" />
            </button>
          </div>
        </div>

        {/* User profile snippet & Auth Controls */}
        <div className="flex flex-col gap-2">
          {!isAuthenticated ? (
            <div className="p-1 lg:p-2 rounded-xl bg-[var(--bg-surface-container)] border border-[var(--border-subtle)] flex flex-col gap-1.5">
              <button
                onClick={() => openAuthModal("login")}
                className="w-full flex items-center justify-center lg:justify-start gap-2 py-2 px-2.5 rounded-lg text-xs font-semibold text-black bg-white hover:bg-neutral-200 transition-colors cursor-pointer shadow-sm"
              >
                <LogIn className="size-3.5" />
                <span className="hidden lg:inline">Sign In / Register</span>
              </button>
            </div>
          ) : (
            <div className="p-2 lg:p-2.5 rounded-xl bg-[var(--bg-surface-container)] border border-[var(--border-subtle)] flex items-center justify-between hover:border-[var(--border-strong)] transition-colors">
              <div
                onClick={() => setActiveTab("profile")}
                className="flex items-center gap-2 lg:gap-2.5 min-w-0 cursor-pointer flex-1"
              >
                <div className="relative shrink-0">
                  <Avatar
                    src={user?.avatar}
                    fallback={user?.initials || "DEV"}
                    size="sm"
                    className="bg-zinc-800 text-white font-bold border border-zinc-700"
                  />
                  <span className="absolute bottom-0 right-0 size-2.5 rounded-full bg-emerald-500 ring-2 ring-[var(--bg-surface-container)]" />
                </div>
                <div className="hidden lg:flex flex-col min-w-0">
                  <span className="text-xs font-semibold text-white truncate leading-tight">
                    {user?.name || "Developer"}
                  </span>
                  <span className="text-[11px] font-mono text-[var(--text-muted)] truncate">
                    {user?.handle || "@developer"}
                  </span>
                </div>
              </div>
              <button
                onClick={logout}
                title="Log Out"
                className="hidden lg:flex p-1.5 rounded-lg text-[var(--text-muted)] hover:text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer"
              >
                <LogOut className="size-3.5" />
              </button>
            </div>
          )}
        </div>
      </aside>

      {/* ── Mobile Floating Action Button (FAB) for Create Project ── */}
      <button
        onClick={openCreateModal}
        title="Create Project"
        className="sm:hidden fixed bottom-18 right-4 z-40 size-12 rounded-full bg-white hover:bg-neutral-200 text-black shadow-xl flex items-center justify-center active:scale-95 transition-transform"
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
                  ? "text-white font-semibold"
                  : "text-[var(--text-muted)] hover:text-white"
              )}
            >
              <div className="relative">
                <Icon
                  className={cn(
                    "size-5 transition-transform",
                    isActive ? "text-white scale-105" : "text-[var(--text-muted)]"
                  )}
                />
                {item.badge && (
                  <span className="absolute -top-1 -right-2 size-3.5 rounded-full text-[9px] font-mono font-bold bg-white text-black flex items-center justify-center">
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
