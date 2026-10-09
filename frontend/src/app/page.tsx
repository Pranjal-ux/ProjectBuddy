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
import { Post } from "@/data/mockData";
import { Sun, Moon, Loader2, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { AuthProvider, useAuth } from "@/context/AuthContext";
import { NotificationProvider } from "@/context/NotificationContext";
import { AuthModal } from "@/components/modals/AuthModal";
import { AuthView } from "@/components/views/AuthView";
import { api } from "@/lib/api";

function HomeContent() {
  const { user, isFollowing, isAuthenticated, isLoading } = useAuth();
  const [activeTab, setActiveTab] = useState("home");
  const [feedFilter, setFeedFilter] = useState<
    "for-you" | "following" | "open-teams" | "showcases"
  >("for-you");
  const [theme, setTheme] = useState<"charcoal" | "oled">("charcoal");
  const [posts, setPosts] = useState<Post[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loadingPosts, setLoadingPosts] = useState(true);

  // Fetch real-time posts from backend API
  useEffect(() => {
    if (!isAuthenticated) return;
    let isMounted = true;
    const fetchFeedPosts = async () => {
      try {
        setLoadingPosts(true);
        const data = await api.getPosts(user?.handle);
        if (isMounted) {
          setPosts(data || []);
        }
      } catch (err) {
        console.warn("Could not fetch posts from API:", err);
      } finally {
        if (isMounted) setLoadingPosts(false);
      }
    };
    fetchFeedPosts();
    return () => {
      isMounted = false;
    };
  }, [user?.handle, isAuthenticated]);

  // Modals state
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [joinModalOpen, setJoinModalOpen] = useState(false);
  const [selectedPostForJoin, setSelectedPostForJoin] = useState<Post | null>(
    null
  );
  const [quickViewModalOpen, setQuickViewModalOpen] = useState(false);
  const [selectedProjectPreview, setSelectedProjectPreview] = useState<any | null>(null);

  // Inspected User (null = current user's profile)
  const [inspectedUser, setInspectedUser] = useState<any | null>(null);

  // Selected chat contact for direct messaging
  const [selectedChatContact, setSelectedChatContact] = useState<string | null>(null);

  const handleTabChange = (tab: string) => {
    if (tab === "profile") {
      setInspectedUser(null);
    }
    setActiveTab(tab);
  };

  const handleOpenChat = (targetHandleOrId: string) => {
    setSelectedChatContact(targetHandleOrId);
    setActiveTab("messages");
  };

  const handleOpenUserProfile = (author: {
    handle: string;
    name?: string;
    avatar?: string;
    role?: string;
    fallback?: string;
  }) => {
    if (user?.handle && author.handle.toLowerCase() === user.handle.toLowerCase()) {
      setInspectedUser(null);
    } else {
      setInspectedUser({
        handle: author.handle,
        name: author.name || author.handle.replace("@", ""),
        avatar: author.avatar || "",
        role: author.role || "Developer",
        initials: author.fallback || (author.name || "DV").slice(0, 2).toUpperCase(),
      });
    }
    setActiveTab("profile");
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

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

  const handlePostUpdate = (updatedPost: Post) => {
    setPosts((prev) =>
      prev.map((p) => (p.id === updatedPost.id ? updatedPost : p))
    );
  };

  const handleRequestJoin = (post: Post) => {
    setSelectedPostForJoin(post);
    setJoinModalOpen(true);
  };

  const handleQuickViewProject = (
    project: any
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

    if (feedFilter === "following") {
      const authorHandle = post.author.handle;
      const followed = isFollowing(authorHandle);
      const isSelf = user?.handle && authorHandle.toLowerCase() === user.handle.toLowerCase();
      return followed || isSelf;
    }
    if (feedFilter === "open-teams") {
      return !!post.team;
    }
    if (feedFilter === "showcases") {
      return post.type === "code" || post.type === "telemetry";
    }
    return true;
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0d1117] flex flex-col items-center justify-center gap-4 text-white">
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center shadow-xl shadow-indigo-500/30 animate-pulse">
          <Sparkles className="w-7 h-7 text-white" />
        </div>
        <div className="flex items-center gap-2 text-zinc-400 text-sm font-medium">
          <Loader2 className="w-4 h-4 animate-spin text-indigo-400" />
          <span>Loading ProjectBuddy...</span>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <AuthView />;
  }

  return (
    <div className="flex min-h-screen bg-[var(--bg-canvas)] text-[var(--text-primary)] transition-colors relative">
      {/* 1. Left Sticky Navigation Sidebar */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={handleTabChange}
        openCreateModal={() => setCreateModalOpen(true)}
      />

      {/* 2. Main Center Content Stream */}
      <main
        className={cn(
          "flex-1 min-w-0 border-r border-[var(--border-subtle)] flex flex-col bg-[var(--bg-canvas)]",
          activeTab === "messages"
            ? "h-screen max-h-screen overflow-hidden pb-14 sm:pb-0"
            : "min-h-screen pb-16 sm:pb-0"
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
                  <Sun className="size-3.5 text-zinc-300" />
                  <span>OLED</span>
                </>
              ) : (
                <>
                  <Moon className="size-3.5 text-zinc-300" />
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
              {loadingPosts && posts.length === 0 ? (
                <div className="p-4 sm:p-6 flex flex-col gap-4">
                  {[1, 2, 3].map((n) => (
                    <div
                      key={n}
                      className="p-5 rounded-2xl bg-[var(--bg-surface-low)] border border-[var(--border-subtle)] animate-pulse flex flex-col gap-3"
                    >
                      <div className="flex items-center gap-3">
                        <div className="size-10 rounded-full bg-white/10" />
                        <div className="flex flex-col gap-1.5 flex-1">
                          <div className="w-32 h-3.5 bg-white/10 rounded" />
                          <div className="w-20 h-2.5 bg-white/5 rounded" />
                        </div>
                      </div>
                      <div className="w-3/4 h-4 bg-white/10 rounded mt-1" />
                      <div className="w-full h-3 bg-white/5 rounded" />
                      <div className="w-2/3 h-3 bg-white/5 rounded" />
                    </div>
                  ))}
                </div>
              ) : filteredPosts.length === 0 ? (
                <div className="p-12 text-center flex flex-col items-center justify-center gap-2">
                  <p className="text-sm text-[var(--text-secondary)]">
                    {feedFilter === "following"
                      ? "No posts from developers you follow yet. Follow buddies in the sidebar or Discover section to see their updates here!"
                      : searchQuery
                      ? `No posts matched "${searchQuery}"`
                      : "No posts available in this view."}
                  </p>
                  {feedFilter === "following" ? (
                    <button
                      onClick={() => setActiveTab("discover")}
                      className="text-xs px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white font-medium cursor-pointer transition-colors mt-1"
                    >
                      Explore & Follow Tech Buddies →
                    </button>
                  ) : searchQuery ? (
                    <button
                      onClick={() => setSearchQuery("")}
                      className="text-xs text-white hover:underline cursor-pointer"
                    >
                      Clear search filter
                    </button>
                  ) : null}
                </div>
              ) : (
                filteredPosts.map((post) => (
                  <PostCard
                    key={post.id}
                    post={post}
                    onRequestJoin={handleRequestJoin}
                    onTagClick={(tag) => setSearchQuery(tag)}
                    onPostUpdate={handlePostUpdate}
                    onAuthorClick={handleOpenUserProfile}
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
            onQuickViewProject={handleQuickViewProject}
            openCreateModal={() => setCreateModalOpen(true)}
            onNavigateToTab={(tab: string) => setActiveTab(tab)}
            onSelectUser={handleOpenUserProfile}
          />
        )}

        {activeTab === "messages" && (
          <MessagesView
            initialChatContact={selectedChatContact}
            onClearInitialChat={() => setSelectedChatContact(null)}
            onOpenProfile={handleOpenUserProfile}
          />
        )}

        {activeTab === "activity" && (
          <ActivityView onOpenChat={handleOpenChat} />
        )}

        {activeTab === "profile" && (
          <ProfileView
            initialInspectedUser={inspectedUser}
            onBackToMyProfile={() => setInspectedUser(null)}
          />
        )}

        {activeTab === "bookmarks" && (
          <BookmarksView
            posts={posts}
            onRequestJoin={handleRequestJoin}
            onPostUpdate={handlePostUpdate}
            onAuthorClick={handleOpenUserProfile}
          />
        )}

        {activeTab === "settings" && (
          <div className="p-6 max-w-xl flex flex-col gap-6">
            <h2 className="text-xl font-bold text-white">Platform Settings</h2>
            <div className="p-5 rounded-xl bg-[var(--bg-surface-low)] border border-[var(--border-subtle)] flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-semibold text-white">Visual Mode</h4>
                  <p className="text-xs text-[var(--text-secondary)]">
                    Switch between Monochrome Dark and Pitch-Black OLED
                  </p>
                </div>
                <button
                  onClick={toggleTheme}
                  className="px-3 py-1.5 rounded-lg bg-[var(--bg-surface-high)] text-xs font-mono text-white border border-[var(--border-strong)]"
                >
                  {theme === "oled" ? "OLED Black" : "Dark"}
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
                  className="accent-white size-4"
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
        onSelectUser={handleOpenUserProfile}
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
      <NotificationProvider>
        <HomeContent />
        <AuthModal />
      </NotificationProvider>
    </AuthProvider>
  );
}
