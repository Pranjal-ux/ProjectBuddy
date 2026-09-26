"use client";

import React, { useState, useEffect } from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import { RightSidebar } from "@/components/layout/RightSidebar";
import { FeedHeader } from "@/components/feed/FeedHeader";
import { PostComposer } from "@/components/feed/PostComposer";
import { PostCard } from "@/components/feed/PostCard";
import { CreateProjectModal } from "@/components/modals/CreateProjectModal";
import { JoinTeamModal } from "@/components/modals/JoinTeamModal";
import { ProjectDetailModal } from "@/components/modals/ProjectDetailModal";
import { DiscoverView } from "@/components/views/DiscoverView";
import { MessagesView } from "@/components/views/MessagesView";
import { ActivityView } from "@/components/views/ActivityView";
import { ProfileView } from "@/components/views/ProfileView";
import { BookmarksView } from "@/components/views/BookmarksView";
import { initialPosts, suggestedProjects, Post } from "@/data/mockData";
import { Sun, Moon } from "lucide-react";
import { cn } from "@/lib/utils";
import { AuthProvider } from "@/context/AuthContext";
import { AuthModal } from "@/components/modals/AuthModal";

function HomeContent() {
  const [activeTab, setActiveTab] = useState("home");
  const [feedFilter, setFeedFilter] = useState<
    "for-you" | "following" | "open-teams" | "showcases"
  >("for-you");
  const [theme, setTheme] = useState<"charcoal" | "oled">("charcoal");
  const [posts, setPosts] = useState<Post[]>(initialPosts);
  const [searchQuery, setSearchQuery] = useState("");

  // Modals state
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [joinModalOpen, setJoinModalOpen] = useState(false);
  const [selectedPostForJoin, setSelectedPostForJoin] = useState<Post | null>(
    null
  );
  const [quickViewModalOpen, setQuickViewModalOpen] = useState(false);
  const [selectedProjectPreview, setSelectedProjectPreview] = useState<
    (typeof suggestedProjects)[0] | null
  >(null);

  // Apply theme to html data-theme
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === "charcoal" ? "oled" : "charcoal"));
  };

  const handlePublishPost = (newPost: Post) => {
    setPosts((prev) => [newPost, ...prev]);
  };

  const handleRequestJoin = (post: Post) => {
    setSelectedPostForJoin(post);
    setJoinModalOpen(true);
  };

  const handleQuickViewProject = (
    project: (typeof suggestedProjects)[0]
  ) => {
    setSelectedProjectPreview(project);
    setQuickViewModalOpen(true);
  };

  // Filter posts based on active search and tab filters
  const filteredPosts = posts.filter((post) => {
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const matches =
        post.title?.toLowerCase().includes(q) ||
        post.content.toLowerCase().includes(q) ||
        post.author.name.toLowerCase().includes(q) ||
        post.author.handle.toLowerCase().includes(q) ||
        post.tags?.some((t) => t.toLowerCase().includes(q));
      if (!matches) return false;
    }

    if (feedFilter === "open-teams") {
      return !!post.team;
    }
    if (feedFilter === "showcases") {
      return post.type === "code" || post.type === "telemetry";
    }
    return true;
  });

  return (
    <div className="flex min-h-screen bg-[var(--bg-canvas)] text-[var(--text-primary)] transition-colors relative">
      {/* 1. Left Sticky Navigation Sidebar */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        openCreateModal={() => setCreateModalOpen(true)}
      />

      {/* 2. Main Center Content Stream */}
      <main
        className={cn(
          "flex-1 min-w-0 border-r border-[var(--border-subtle)] min-h-screen flex flex-col bg-[var(--bg-canvas)]",
          activeTab === "messages" ? "pb-14 md:pb-0 overflow-hidden" : "pb-16 sm:pb-0"
        )}
      >
        {/* Mobile Header for views other than Home & Messages */}
        {activeTab !== "home" && activeTab !== "messages" && (
          <div className="sm:hidden sticky top-0 z-30 flex items-center justify-between px-4 py-3 border-b border-[var(--border-subtle)] bg-[var(--bg-canvas)]/90 backdrop-blur-md">
            <span className="font-bold text-base text-white capitalize">
              {activeTab === "profile" ? "Developer Profile" : activeTab}
            </span>
            <button
              onClick={toggleTheme}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg border border-[var(--border-strong)] bg-[var(--bg-surface-container)] text-xs font-mono text-[var(--text-secondary)] hover:text-white transition-colors cursor-pointer"
            >
              {theme === "oled" ? (
                <>
                  <Sun className="size-3.5 text-amber-400" />
                  <span>OLED</span>
                </>
              ) : (
                <>
                  <Moon className="size-3.5 text-indigo-400" />
                  <span>Dark</span>
                </>
              )}
            </button>
          </div>
        )}

        {activeTab === "home" && (
          <>
            <FeedHeader
              feedFilter={feedFilter}
              setFeedFilter={setFeedFilter}
              theme={theme}
              toggleTheme={toggleTheme}
              openCreateModal={() => setCreateModalOpen(true)}
            />

            <PostComposer onPublish={handlePublishPost} />

            {/* Live Feed Stream */}
            <div className="flex flex-col divide-y divide-[var(--border-subtle)]">
              {filteredPosts.length === 0 ? (
                <div className="p-12 text-center flex flex-col items-center justify-center gap-2">
                  <p className="text-sm text-[var(--text-secondary)]">
                    No posts matched &quot;{searchQuery}&quot;
                  </p>
                  <button
                    onClick={() => setSearchQuery("")}
                    className="text-xs text-indigo-400 hover:underline"
                  >
                    Clear search filter
                  </button>
                </div>
              ) : (
                filteredPosts.map((post) => (
                  <PostCard
                    key={post.id}
                    post={post}
                    onRequestJoin={handleRequestJoin}
                    onTagClick={(tag) => setSearchQuery(tag)}
                  />
                ))
              )}
            </div>
          </>
        )}

        {activeTab === "discover" && (
          <DiscoverView
            onJoinClick={handleRequestJoin}
            searchQuery={searchQuery}
          />
        )}

        {activeTab === "messages" && <MessagesView />}

        {activeTab === "activity" && <ActivityView />}

        {activeTab === "profile" && <ProfileView />}

        {activeTab === "bookmarks" && (
          <BookmarksView onRequestJoin={handleRequestJoin} />
        )}

        {activeTab === "settings" && (
          <div className="p-6 max-w-xl flex flex-col gap-6">
            <h2 className="text-xl font-bold text-white">Platform Settings</h2>
            <div className="p-5 rounded-xl bg-[var(--bg-surface-low)] border border-[var(--border-subtle)] flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-semibold text-white">Visual Mode</h4>
                  <p className="text-xs text-[var(--text-secondary)]">
                    Switch between Developer Indigo Charcoal and Pitch-Black OLED
                  </p>
                </div>
                <button
                  onClick={toggleTheme}
                  className="px-3 py-1.5 rounded-lg bg-[var(--bg-surface-high)] text-xs font-mono text-white border border-[var(--border-strong)]"
                >
                  {theme === "oled" ? "OLED Black" : "Developer Dark"}
                </button>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-[var(--border-subtle)]">
                <div>
                  <h4 className="text-sm font-semibold text-white">Team Notifications</h4>
                  <p className="text-xs text-[var(--text-secondary)]">
                    Receive alerts when developers request to join your project
                  </p>
                </div>
                <input
                  type="checkbox"
                  defaultChecked
                  className="accent-indigo-600 size-4"
                />
              </div>
            </div>
          </div>
        )}
      </main>

      {/* 3. Right Sticky Context & Recommendations Sidebar */}
      <RightSidebar
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        onSelectTag={(tag) => {
          setSearchQuery(tag);
          setActiveTab("home");
        }}
        onQuickViewProject={handleQuickViewProject}
      />

      {/* Modals */}
      <CreateProjectModal
        open={createModalOpen}
        onOpenChange={setCreateModalOpen}
        onPublish={handlePublishPost}
      />

      <JoinTeamModal
        open={joinModalOpen}
        onOpenChange={setJoinModalOpen}
        post={selectedPostForJoin}
      />

      <ProjectDetailModal
        open={quickViewModalOpen}
        onOpenChange={setQuickViewModalOpen}
        project={selectedProjectPreview}
        onApply={() => {
          if (selectedProjectPreview) {
            const fakePost: Post = {
              id: selectedProjectPreview.id,
              author: {
                name: "Project Lead",
                handle: "@lead",
                fallback: "PL",
              },
              createdAt: "Active",
              type: "project",
              title: selectedProjectPreview.title,
              content: selectedProjectPreview.description,
              team: {
                current: 2,
                max: 4,
                lookingFor: ["Contributor"],
              },
              stats: { likes: 10, comments: 2, reposts: 1, bookmarks: 4 },
            };
            handleRequestJoin(fakePost);
          }
        }}
      />
    </div>
  );
}

export default function Home() {
  return (
    <AuthProvider>
      <HomeContent />
      <AuthModal />
    </AuthProvider>
  );
}
