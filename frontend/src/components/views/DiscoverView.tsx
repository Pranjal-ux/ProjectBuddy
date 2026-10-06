"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  Search,
  Filter,
  Sparkles,
  Users,
  ArrowUpRight,
  SlidersHorizontal,
  Zap,
  Share2,
  Bookmark,
  Check,
  ExternalLink,
  MessageSquare,
  UserPlus,
  MapPin,
  Layers,
  Globe,
  ChevronDown,
  CheckCircle2,
  X,
  Code2,
  FolderGit2,
  Flame,
  Clock,
  CheckCheck,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar } from "@/components/ui/avatar";
import { Dialog, DialogHeader } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { GithubIcon, LinkedinIcon, TwitterIcon } from "@/components/ui/BrandIcons";
import {
  initialPosts,
  suggestedProjects,
  suggestedPeople,
  Post,
} from "@/data/mockData";
import { useAuth } from "@/context/AuthContext";
import { api, User as UserType } from "@/lib/api";

interface DiscoverViewProps {
  onJoinClick: (post: Post) => void;
  searchQuery: string;
  onQuickViewProject?: (project: (typeof suggestedProjects)[0]) => void;
  openCreateModal?: () => void;
  onNavigateToTab?: (tab: string) => void;
}

interface NormalizedProject {
  id: string;
  title: string;
  description: string;
  category: string;
  tags: string[];
  team?: {
    current: number;
    max: number;
    lookingFor: string[];
  };
  author: {
    name: string;
    handle: string;
    avatarUrl?: string;
    fallback: string;
    role?: string;
    verified?: boolean;
  };
  stats: {
    likes: number;
    comments: number;
    reposts: number;
    bookmarks: number;
  };
  createdAt?: string;
  rawPost?: Post;
  rawSuggested?: (typeof suggestedProjects)[0];
}

interface DeveloperCardData {
  id: string;
  name: string;
  handle: string;
  role: string;
  bio: string;
  location: string;
  availability: "available" | "open_to_collab" | "busy" | "not_looking";
  experienceLevel: string;
  skills: string[];
  avatar?: string;
  initials: string;
  stats: {
    activeProjectsCount: number;
    teamsJoinedCount: number;
    collaboratorsCount: number;
    matchScore: number;
  };
  customStatus?: string;
  websiteUrl?: string;
  githubUrl?: string;
  linkedinUrl?: string;
  twitterUrl?: string;
}

export function DiscoverView({
  onJoinClick,
  searchQuery: propSearchQuery,
  onQuickViewProject,
  openCreateModal,
  onNavigateToTab,
}: DiscoverViewProps) {
  const { user, isFollowing, toggleFollowUser } = useAuth();

  // Mode: "projects" vs "developers"
  const [activeMode, setActiveMode] = useState<"projects" | "developers">("projects");

  // Local search query (initialized from prop, editable directly in view)
  const [localSearch, setLocalSearch] = useState(propSearchQuery || "");
  useEffect(() => {
    if (propSearchQuery !== undefined) {
      setLocalSearch(propSearchQuery);
    }
  }, [propSearchQuery]);

  // Category filter
  const [selectedCategory, setSelectedCategory] = useState("all");

  // Secondary filters
  const [projectFilter, setProjectFilter] = useState<"all" | "recruiting" | "high_synergy" | "trending">("all");
  const [devFilter, setDevFilter] = useState<"all" | "available" | "open_to_collab" | "high_synergy">("all");
  const [sortBy, setSortBy] = useState<"synergy" | "popular" | "newest" | "open_slots">("synergy");

  // Live data fetched from backend
  const [backendPosts, setBackendPosts] = useState<Post[]>([]);
  const [backendDevelopers, setBackendDevelopers] = useState<UserType[]>([]);
  const [loadingBackend, setLoadingBackend] = useState(false);

  // Modals & interactive feedback state
  const [selectedDeveloperForModal, setSelectedDeveloperForModal] = useState<DeveloperCardData | null>(null);
  const [inviteModalOpen, setInviteModalOpen] = useState(false);
  const [invitedDev, setInvitedDev] = useState<DeveloperCardData | null>(null);
  const [selectedProjectToInvite, setSelectedProjectToInvite] = useState("");
  const [inviteRole, setInviteRole] = useState("");
  const [inviteMessage, setInviteMessage] = useState("");
  const [inviteSuccess, setInviteSuccess] = useState(false);
  const [bookmarkedProjectIds, setBookmarkedProjectIds] = useState<Set<string>>(new Set());
  const [copiedShareId, setCopiedShareId] = useState<string | null>(null);

  // Categories definitions
  const categories = [
    { id: "all", label: "All Disciplines" },
    { id: "ai", label: "AI & Machine Learning" },
    { id: "systems", label: "Systems & Rust" },
    { id: "web3", label: "Web3 & Decentralized" },
    { id: "frontend", label: "Frontend & UI Engineering" },
    { id: "cloud", label: "Cloud & Microservices" },
  ];

  // User's active skills for synergy matchmaking
  const userSkills: string[] = useMemo(() => {
    if (user?.skills && Array.isArray(user.skills) && user.skills.length > 0) {
      return user.skills;
    }
    return ["TypeScript", "Next.js", "React", "Python", "Node.js", "TailwindCSS"];
  }, [user?.skills]);

  // Fetch real-time backend data
  useEffect(() => {
    let isMounted = true;
    const fetchDiscoveryData = async () => {
      try {
        setLoadingBackend(true);
        const [postsRes, devsRes] = await Promise.allSettled([
          api.getPosts(),
          api.searchDevelopers(),
        ]);

        if (isMounted) {
          if (postsRes.status === "fulfilled" && postsRes.value?.length > 0) {
            setBackendPosts(postsRes.value);
          }
          if (devsRes.status === "fulfilled" && devsRes.value?.length > 0) {
            setBackendDevelopers(devsRes.value);
          }
        }
      } catch (err) {
        console.warn("Could not fetch remote discovery data, using built-in catalog:", err);
      } finally {
        if (isMounted) setLoadingBackend(false);
      }
    };

    fetchDiscoveryData();
    return () => {
      isMounted = false;
    };
  }, []);

  // Compute Synergy Match between user skills and target tags/skills
  const computeSynergy = (targetItems: string[] = []): { score: number; overlapping: string[] } => {
    if (!targetItems || targetItems.length === 0) return { score: 85, overlapping: [] };

    const lowerUserSkills = userSkills.map((s) => s.toLowerCase());
    const overlapping: string[] = [];

    targetItems.forEach((item) => {
      const lower = item.toLowerCase();
      if (lowerUserSkills.some((us) => us.includes(lower) || lower.includes(us))) {
        overlapping.push(item);
      }
    });

    const overlapCount = overlapping.length;
    let score = 78 + Math.min(overlapCount * 8, 20);
    if (score > 99) score = 99;

    return { score, overlapping };
  };

  // Build unified project pool
  const allProjects: NormalizedProject[] = useMemo(() => {
    const pool: NormalizedProject[] = [];
    const seenIds = new Set<string>();

    // 1. Projects from backend posts or initialPosts
    const sourcePosts = backendPosts.length > 0 ? backendPosts : initialPosts;
    sourcePosts
      .filter((p) => p.type === "project")
      .forEach((post) => {
        if (seenIds.has(post.id)) return;
        seenIds.add(post.id);

        let cat = "all";
        const tagsLower = (post.tags || []).map((t) => t.toLowerCase());
        if (tagsLower.some((t) => ["python", "yolo", "fastapi", "pytorch", "nlp", "openai", "ai"].includes(t))) {
          cat = "ai";
        } else if (tagsLower.some((t) => ["solidity", "ethers.js", "web3", "radix", "crypto"].includes(t))) {
          cat = "web3";
        } else if (tagsLower.some((t) => ["rust", "wasm", "vulkan", "go", "systems"].includes(t))) {
          cat = "systems";
        } else if (tagsLower.some((t) => ["react", "next.js", "css", "tailwind", "design"].includes(t))) {
          cat = "frontend";
        }

        pool.push({
          id: post.id,
          title: post.title || "Developer Initiative",
          description: post.content,
          category: cat,
          tags: post.tags || ["TypeScript", "React"],
          team: post.team || {
            current: 1,
            max: 3,
            lookingFor: ["Collaborator"],
          },
          author: {
            name: post.author.name,
            handle: post.author.handle,
            avatarUrl: post.author.avatarUrl,
            fallback: post.author.fallback || "PB",
            role: post.author.role || "Project Lead",
            verified: post.author.verified,
          },
          stats: {
            likes: post.stats?.likes || 12,
            comments: post.stats?.comments || 2,
            reposts: post.stats?.reposts || 4,
            bookmarks: post.stats?.bookmarks || 5,
          },
          createdAt: post.createdAt,
          rawPost: post,
        });
      });

    // 2. Curated suggested projects
    suggestedProjects.forEach((sp) => {
      if (seenIds.has(sp.id)) return;
      seenIds.add(sp.id);

      const parsedMembers = sp.members.split("/").map((s) => parseInt(s.trim()));
      const current = parsedMembers[0] || 2;
      const max = parsedMembers[1] || 4;

      pool.push({
        id: sp.id,
        title: sp.title,
        description: sp.description,
        category: sp.category || "systems",
        tags: sp.tags,
        team: sp.team || {
          current,
          max,
          lookingFor: ["Contributor", "Systems Dev"],
        },
        author: sp.author || {
          name: "Project Lead",
          handle: "@lead",
          fallback: "PL",
          role: "Architect",
        },
        stats: {
          likes: sp.stars || 45,
          comments: 6,
          reposts: 8,
          bookmarks: 14,
        },
        createdAt: "Active",
        rawSuggested: sp,
      });
    });

    return pool;
  }, [backendPosts]);

  // Build unified developer pool
  const allDevelopers: DeveloperCardData[] = useMemo(() => {
    const pool: DeveloperCardData[] = [];
    const seenHandles = new Set<string>();

    // 1. Backend discovered users
    if (backendDevelopers.length > 0) {
      backendDevelopers.forEach((dev) => {
        const handle = dev.handle?.toLowerCase();
        if (!handle || seenHandles.has(handle)) return;
        seenHandles.add(handle);

        pool.push({
          id: dev.id || dev._id || `dev-${handle}`,
          name: dev.name,
          handle: dev.handle,
          role: dev.role || "Software Engineer",
          bio: dev.bio || "Building innovative developer experiences on ProjectBuddy.",
          location: dev.location || "Remote / Global",
          availability: dev.availability || "open_to_collab",
          experienceLevel: dev.experienceLevel || "mid",
          skills: dev.skills && dev.skills.length > 0 ? dev.skills : ["TypeScript", "React", "Node.js"],
          avatar: dev.avatar,
          initials: dev.initials || "DEV",
          stats: {
            activeProjectsCount: dev.stats?.activeProjectsCount || 2,
            teamsJoinedCount: dev.stats?.teamsJoinedCount || 3,
            collaboratorsCount: dev.stats?.collaboratorsCount || 8,
            matchScore: dev.stats?.matchScore || 94,
          },
          customStatus: dev.customStatus,
          websiteUrl: dev.websiteUrl,
          githubUrl: dev.githubUrl,
          linkedinUrl: dev.linkedinUrl,
          twitterUrl: dev.twitterUrl,
        });
      });
    }

    // 2. Curated suggested developers
    suggestedPeople.forEach((sp) => {
      const handle = sp.handle.toLowerCase();
      if (seenHandles.has(handle)) return;
      seenHandles.add(handle);

      pool.push({
        id: sp.id,
        name: sp.name,
        handle: sp.handle,
        role: sp.role,
        bio: sp.bio || "Building open source systems on ProjectBuddy.",
        location: sp.location || "Global / Remote",
        availability: sp.availability || "available",
        experienceLevel: sp.experienceLevel || "senior",
        skills: sp.skills,
        avatar: sp.avatar,
        initials: sp.initials,
        stats: sp.stats || {
          activeProjectsCount: 3,
          teamsJoinedCount: 4,
          collaboratorsCount: 12,
          matchScore: 92,
        },
        customStatus: "Open to collaborate on ambitious projects",
        githubUrl: sp.githubUrl,
        linkedinUrl: sp.linkedinUrl,
        twitterUrl: sp.twitterUrl,
      });
    });

    return pool;
  }, [backendDevelopers]);

  // Filtered & Sorted Projects
  const filteredProjects = useMemo(() => {
    return allProjects
      .filter((proj) => {
        // Keyword Search
        if (localSearch) {
          const q = localSearch.toLowerCase();
          const matchTitle = proj.title.toLowerCase().includes(q);
          const matchDesc = proj.description.toLowerCase().includes(q);
          const matchAuthor =
            proj.author.name.toLowerCase().includes(q) ||
            proj.author.handle.toLowerCase().includes(q);
          const matchTags = proj.tags.some((t) => t.toLowerCase().includes(q));
          const matchRoles = proj.team?.lookingFor.some((r) => r.toLowerCase().includes(q));
          if (!matchTitle && !matchDesc && !matchAuthor && !matchTags && !matchRoles) {
            return false;
          }
        }

        // Category Filter
        if (selectedCategory !== "all") {
          if (selectedCategory === "ai") {
            const hasAiTag = proj.tags.some((t) =>
              ["python", "yolo", "fastapi", "pytorch", "nlp", "openai", "ai", "llms", "wasm"].includes(t.toLowerCase())
            );
            if (!hasAiTag && proj.category !== "ai") return false;
          } else if (selectedCategory === "systems") {
            const hasSysTag = proj.tags.some((t) =>
              ["rust", "go", "vulkan", "raft", "libp2p", "c++", "shader", "webgpu", "webrtc"].includes(t.toLowerCase())
            );
            if (!hasSysTag && proj.category !== "systems") return false;
          } else if (selectedCategory === "web3") {
            const hasWeb3Tag = proj.tags.some((t) =>
              ["solidity", "ethers.js", "web3", "radix", "crypto", "blockchain"].includes(t.toLowerCase())
            );
            if (!hasWeb3Tag && proj.category !== "web3") return false;
          } else if (selectedCategory === "frontend") {
            const hasFeTag = proj.tags.some((t) =>
              ["react", "next.js", "css", "tailwind", "typescript", "designsystems", "tokens"].includes(t.toLowerCase())
            );
            if (!hasFeTag && proj.category !== "frontend") return false;
          } else if (selectedCategory === "cloud") {
            const hasCloudTag = proj.tags.some((t) =>
              ["docker", "kubernetes", "microservices", "cloud", "aws", "gRPC"].includes(t.toLowerCase())
            );
            if (!hasCloudTag && proj.category !== "cloud") return false;
          }
        }

        // Secondary Project Filter
        if (projectFilter === "recruiting") {
          if (!proj.team || proj.team.current >= proj.team.max) return false;
        } else if (projectFilter === "high_synergy") {
          const { score } = computeSynergy([...proj.tags, ...(proj.team?.lookingFor || [])]);
          if (score < 88) return false;
        } else if (projectFilter === "trending") {
          if (proj.stats.likes < 30) return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === "synergy") {
          const scoreA = computeSynergy([...a.tags, ...(a.team?.lookingFor || [])]).score;
          const scoreB = computeSynergy([...b.tags, ...(b.team?.lookingFor || [])]).score;
          return scoreB - scoreA;
        }
        if (sortBy === "popular") {
          return b.stats.likes - a.stats.likes;
        }
        if (sortBy === "open_slots") {
          const slotsA = (a.team?.max || 0) - (a.team?.current || 0);
          const slotsB = (b.team?.max || 0) - (b.team?.current || 0);
          return slotsB - slotsA;
        }
        return 0;
      });
  }, [allProjects, localSearch, selectedCategory, projectFilter, sortBy, userSkills]);

  // Filtered & Sorted Developers
  const filteredDevelopers = useMemo(() => {
    return allDevelopers
      .filter((dev) => {
        // Keyword Search
        if (localSearch) {
          const q = localSearch.toLowerCase();
          const matchName = dev.name.toLowerCase().includes(q);
          const matchHandle = dev.handle.toLowerCase().includes(q);
          const matchRole = dev.role.toLowerCase().includes(q);
          const matchBio = dev.bio.toLowerCase().includes(q);
          const matchLocation = dev.location.toLowerCase().includes(q);
          const matchSkills = dev.skills.some((s) => s.toLowerCase().includes(q));
          if (!matchName && !matchHandle && !matchRole && !matchBio && !matchLocation && !matchSkills) {
            return false;
          }
        }

        // Category Filter
        if (selectedCategory !== "all") {
          const skillsLower = dev.skills.map((s) => s.toLowerCase());
          if (selectedCategory === "ai") {
            const matches = skillsLower.some((s) =>
              ["python", "pytorch", "yolo", "fastapi", "cuda", "openai", "ml"].includes(s)
            );
            if (!matches) return false;
          } else if (selectedCategory === "systems") {
            const matches = skillsLower.some((s) =>
              ["rust", "go", "c++", "kubernetes", "grpc", "docker"].includes(s)
            );
            if (!matches) return false;
          } else if (selectedCategory === "web3") {
            const matches = skillsLower.some((s) =>
              ["solidity", "ethers.js", "web3", "radix"].includes(s)
            );
            if (!matches) return false;
          } else if (selectedCategory === "frontend") {
            const matches = skillsLower.some((s) =>
              ["react", "next.js", "tailwind", "typescript", "three.js", "css"].includes(s)
            );
            if (!matches) return false;
          } else if (selectedCategory === "cloud") {
            const matches = skillsLower.some((s) =>
              ["docker", "kubernetes", "postgresql", "kafka", "grpc"].includes(s)
            );
            if (!matches) return false;
          }
        }

        // Secondary Dev Filter
        if (devFilter === "available") {
          if (dev.availability !== "available") return false;
        } else if (devFilter === "open_to_collab") {
          if (dev.availability !== "open_to_collab" && dev.availability !== "available") return false;
        } else if (devFilter === "high_synergy") {
          const { score } = computeSynergy(dev.skills);
          if (score < 88) return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === "synergy") {
          const scoreA = computeSynergy(a.skills).score;
          const scoreB = computeSynergy(b.skills).score;
          return scoreB - scoreA;
        }
        if (sortBy === "popular") {
          return b.stats.collaboratorsCount - a.stats.collaboratorsCount;
        }
        return b.stats.activeProjectsCount - a.stats.activeProjectsCount;
      });
  }, [allDevelopers, localSearch, selectedCategory, devFilter, sortBy, userSkills]);

  // Handle Project Quick View
  const handleInspectProject = (proj: NormalizedProject) => {
    if (proj.rawSuggested && onQuickViewProject) {
      onQuickViewProject(proj.rawSuggested);
    } else if (onQuickViewProject) {
      onQuickViewProject({
        id: proj.id,
        title: proj.title,
        matchScore: computeSynergy([...proj.tags, ...(proj.team?.lookingFor || [])]).score,
        category: proj.category,
        description: proj.description,
        tags: proj.tags,
        members: `${proj.team?.current || 1} / ${proj.team?.max || 4}`,
        team: proj.team || {
          current: 1,
          max: 4,
          lookingFor: ["Contributor"],
        },
        author: {
          name: proj.author.name,
          handle: proj.author.handle,
          fallback: proj.author.fallback,
          role: proj.author.role || "Architect",
          avatarUrl: proj.author.avatarUrl || "",
        },
        stars: proj.stats.likes,
      });
    } else {
      handleJoinProject(proj);
    }
  };

  // Handle Join Application
  const handleJoinProject = (proj: NormalizedProject) => {
    if (proj.rawPost) {
      onJoinClick(proj.rawPost);
    } else {
      const syntheticPost: Post = {
        id: proj.id,
        author: {
          name: proj.author.name,
          handle: proj.author.handle,
          fallback: proj.author.fallback,
          role: proj.author.role,
          avatarUrl: proj.author.avatarUrl,
        },
        createdAt: "Active",
        type: "project",
        title: proj.title,
        content: proj.description,
        tags: proj.tags,
        team: proj.team,
        stats: proj.stats,
      };
      onJoinClick(syntheticPost);
    }
  };

  // Toggle Bookmark
  const handleToggleBookmark = (id: string) => {
    setBookmarkedProjectIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  // Share Project Link
  const handleShareProject = (proj: NormalizedProject) => {
    if (navigator?.clipboard) {
      navigator.clipboard.writeText(
        `${window.location.origin}?project=${encodeURIComponent(proj.id)}`
      );
      setCopiedShareId(proj.id);
      setTimeout(() => setCopiedShareId(null), 2500);
    }
  };

  // Quick invite developer
  const handleOpenInviteModal = (dev: DeveloperCardData) => {
    setInvitedDev(dev);
    setSelectedProjectToInvite(allProjects[0]?.title || "AI-based Pothole Detection System");
    setInviteRole(dev.role || "Developer");
    setInviteMessage(`Hey ${dev.name}, we're building an ambitious project and your expertise in ${dev.skills.slice(0, 2).join(" & ")} would be invaluable.`);
    setInviteSuccess(false);
    setInviteModalOpen(true);
  };

  const handleSendInvitation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!invitedDev) return;

    try {
      await api.submitJoinRequest({
        projectId: `inv-${Date.now()}`,
        projectTitle: selectedProjectToInvite,
        projectAuthorName: user?.name || "Lead Architect",
        projectAuthorHandle: user?.handle || "@lead",
        applicantName: invitedDev.name,
        applicantHandle: invitedDev.handle,
        role: inviteRole,
        pitch: inviteMessage,
      });
    } catch {
      // Graceful offline fallback
    }

    setInviteSuccess(true);
    setTimeout(() => {
      setInviteSuccess(false);
      setInviteModalOpen(false);
    }, 2000);
  };

  return (
    <div className="flex flex-col gap-5 sm:gap-6 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full">
      {/* ── 1. Hero Header & Quick Action ── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-[var(--border-subtle)]">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-white/10 text-white border border-white/20">
              <Sparkles className="size-4 text-emerald-400" />
            </span>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
              Discover Projects & Tech Buddies
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-[var(--text-secondary)] mt-1.5 max-w-2xl leading-relaxed">
            Find high-synergy open-source teams, recruit teammates for your initiatives, or connect with verified engineers.
          </p>
        </div>

        {openCreateModal && (
          <Button
            onClick={openCreateModal}
            className="shrink-0 h-9 px-4 text-xs font-semibold bg-white hover:bg-neutral-200 text-black rounded-xl shadow-sm gap-1.5 self-start md:self-auto cursor-pointer"
          >
            <FolderGit2 className="size-3.5" />
            <span>Publish Project</span>
          </Button>
        )}
      </div>

      {/* ── 2. Metric Highlight Badges ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3">
        <div className="p-3 rounded-xl bg-[var(--bg-surface-low)] border border-[var(--border-subtle)] flex items-center gap-3">
          <div className="size-8 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center shrink-0">
            <Flame className="size-4" />
          </div>
          <div>
            <div className="text-sm font-bold text-white leading-tight">
              {allProjects.length}+ Projects
            </div>
            <div className="text-[11px] font-mono text-[var(--text-muted)]">
              Recruiting Members
            </div>
          </div>
        </div>

        <div className="p-3 rounded-xl bg-[var(--bg-surface-low)] border border-[var(--border-subtle)] flex items-center gap-3">
          <div className="size-8 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 flex items-center justify-center shrink-0">
            <Users className="size-4" />
          </div>
          <div>
            <div className="text-sm font-bold text-white leading-tight">
              {allDevelopers.length}+ Engineers
            </div>
            <div className="text-[11px] font-mono text-[var(--text-muted)]">
              Open to Collab
            </div>
          </div>
        </div>

        <div className="p-3 rounded-xl bg-[var(--bg-surface-low)] border border-[var(--border-subtle)] flex items-center gap-3">
          <div className="size-8 rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 flex items-center justify-center shrink-0">
            <Zap className="size-4" />
          </div>
          <div>
            <div className="text-sm font-bold text-white leading-tight">
              Synergy Engine
            </div>
            <div className="text-[11px] font-mono text-[var(--text-muted)]">
              Smart Skill Match
            </div>
          </div>
        </div>

        <div className="p-3 rounded-xl bg-[var(--bg-surface-low)] border border-[var(--border-subtle)] flex items-center gap-3">
          <div className="size-8 rounded-lg bg-violet-500/10 text-violet-400 border border-violet-500/20 flex items-center justify-center shrink-0">
            <Clock className="size-4" />
          </div>
          <div>
            <div className="text-sm font-bold text-white leading-tight">
              Realtime Sync
            </div>
            <div className="text-[11px] font-mono text-[var(--text-muted)]">
              Live Applications
            </div>
          </div>
        </div>
      </div>

      {/* ── 3. Primary Mode Tabs: Projects vs Developers ── */}
      <div className="flex items-center justify-between border-b border-[var(--border-subtle)] pb-2 gap-4">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveMode("projects")}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
              activeMode === "projects"
                ? "bg-white text-black shadow-sm"
                : "bg-[var(--bg-surface-container)] text-[var(--text-secondary)] hover:text-white border border-[var(--border-subtle)]"
            }`}
          >
            <FolderGit2 className="size-4" />
            <span>Explore Projects & Teams</span>
            <span
              className={`text-[11px] font-mono px-1.5 py-0.2 rounded-full ${
                activeMode === "projects" ? "bg-black/10 text-black" : "bg-white/10 text-zinc-300"
              }`}
            >
              {filteredProjects.length}
            </span>
          </button>

          <button
            onClick={() => setActiveMode("developers")}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
              activeMode === "developers"
                ? "bg-white text-black shadow-sm"
                : "bg-[var(--bg-surface-container)] text-[var(--text-secondary)] hover:text-white border border-[var(--border-subtle)]"
            }`}
          >
            <Users className="size-4" />
            <span>Discover Developers & Buddies</span>
            <span
              className={`text-[11px] font-mono px-1.5 py-0.2 rounded-full ${
                activeMode === "developers" ? "bg-black/10 text-black" : "bg-white/10 text-zinc-300"
              }`}
            >
              {filteredDevelopers.length}
            </span>
          </button>
        </div>

        {/* Sort Options */}
        <div className="hidden sm:flex items-center gap-2">
          <span className="text-xs text-[var(--text-muted)] font-mono">Sort:</span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="bg-[var(--bg-surface-container)] text-white text-xs border border-[var(--border-subtle)] rounded-lg px-2.5 py-1.5 font-mono focus:outline-none cursor-pointer"
          >
            <option value="synergy">⚡ Highest Synergy</option>
            <option value="popular">🔥 Most Popular</option>
            {activeMode === "projects" && <option value="open_slots">👥 Open Slots</option>}
            <option value="newest">✨ Newest First</option>
          </select>
        </div>
      </div>

      {/* ── 4. Unified Search & Category Filtering Bar ── */}
      <div className="flex flex-col gap-3">
        {/* Search Input Bar */}
        <div className="relative w-full">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-[var(--text-muted)]" />
          <input
            type="text"
            value={localSearch}
            onChange={(e) => setLocalSearch(e.target.value)}
            placeholder={
              activeMode === "projects"
                ? "Search projects by title, stack (e.g. Next.js, Rust), description, or role needed..."
                : "Search engineers by name, @handle, role, verified skills, or location..."
            }
            className="w-full h-11 pl-10 pr-10 rounded-xl bg-[var(--bg-surface-low)] border border-[var(--border-subtle)] hover:border-[var(--border-strong)] focus:border-white text-xs sm:text-sm text-white placeholder:text-[var(--text-muted)] transition-colors focus:outline-none"
          />
          {localSearch && (
            <button
              onClick={() => setLocalSearch("")}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 size-4 text-[var(--text-muted)] hover:text-white"
            >
              <X className="size-4" />
            </button>
          )}
        </div>

        {/* Category Pills Bar */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
          {categories.map((c) => (
            <button
              key={c.id}
              onClick={() => setSelectedCategory(c.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all whitespace-nowrap cursor-pointer ${
                selectedCategory === c.id
                  ? "bg-white text-black shadow-sm"
                  : "bg-[var(--bg-surface-container)] text-[var(--text-secondary)] hover:text-white border border-[var(--border-subtle)]"
              }`}
            >
              {c.label}
            </button>
          ))}
        </div>

        {/* Secondary Sub-filters */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pt-1">
          {activeMode === "projects" ? (
            <>
              <button
                onClick={() => setProjectFilter("all")}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-mono transition-colors cursor-pointer ${
                  projectFilter === "all"
                    ? "bg-white/10 text-white border border-white/20"
                    : "text-[var(--text-muted)] hover:text-white"
                }`}
              >
                All Projects
              </button>
              <button
                onClick={() => setProjectFilter("recruiting")}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-mono transition-colors cursor-pointer ${
                  projectFilter === "recruiting"
                    ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                    : "text-[var(--text-muted)] hover:text-white"
                }`}
              >
                <span className="size-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Actively Recruiting Slots
              </button>
              <button
                onClick={() => setProjectFilter("high_synergy")}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-mono transition-colors cursor-pointer ${
                  projectFilter === "high_synergy"
                    ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/30"
                    : "text-[var(--text-muted)] hover:text-white"
                }`}
              >
                <Zap className="size-3 text-cyan-400" />
                High Synergy (88%+)
              </button>
              <button
                onClick={() => setProjectFilter("trending")}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-mono transition-colors cursor-pointer ${
                  projectFilter === "trending"
                    ? "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                    : "text-[var(--text-muted)] hover:text-white"
                }`}
              >
                <Flame className="size-3 text-amber-400" />
                Trending / Most Liked
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => setDevFilter("all")}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-mono transition-colors cursor-pointer ${
                  devFilter === "all"
                    ? "bg-white/10 text-white border border-white/20"
                    : "text-[var(--text-muted)] hover:text-white"
                }`}
              >
                All Engineers
              </button>
              <button
                onClick={() => setDevFilter("available")}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-mono transition-colors cursor-pointer ${
                  devFilter === "available"
                    ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                    : "text-[var(--text-muted)] hover:text-white"
                }`}
              >
                <span className="size-1.5 rounded-full bg-emerald-400" />
                Available Now
              </button>
              <button
                onClick={() => setDevFilter("open_to_collab")}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-mono transition-colors cursor-pointer ${
                  devFilter === "open_to_collab"
                    ? "bg-indigo-500/20 text-indigo-300 border border-indigo-500/30"
                    : "text-[var(--text-muted)] hover:text-white"
                }`}
              >
                <span className="size-1.5 rounded-full bg-indigo-400" />
                Open to Collab
              </button>
              <button
                onClick={() => setDevFilter("high_synergy")}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-mono transition-colors cursor-pointer ${
                  devFilter === "high_synergy"
                    ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/30"
                    : "text-[var(--text-muted)] hover:text-white"
                }`}
              >
                <Zap className="size-3 text-cyan-400" />
                High Synergy (88%+)
              </button>
            </>
          )}
        </div>
      </div>

      {/* ── 5. Content Stream: Projects Grid or Developers Grid ── */}
      {activeMode === "projects" ? (
        filteredProjects.length === 0 ? (
          <div className="py-16 text-center flex flex-col items-center justify-center gap-3 rounded-2xl bg-[var(--bg-surface-low)] border border-[var(--border-subtle)] p-8">
            <FolderGit2 className="size-10 text-[var(--text-muted)]" />
            <h3 className="text-base font-semibold text-white">No projects found</h3>
            <p className="text-xs text-[var(--text-secondary)] max-w-sm">
              We couldn&apos;t find any initiatives matching &quot;{localSearch}&quot; in this category.
            </p>
            <div className="flex gap-2 mt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setLocalSearch("");
                  setSelectedCategory("all");
                  setProjectFilter("all");
                }}
              >
                Reset All Filters
              </Button>
              {openCreateModal && (
                <Button size="sm" onClick={openCreateModal}>
                  Publish First One
                </Button>
              )}
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {filteredProjects.map((proj) => {
              const { score: matchScore, overlapping } = computeSynergy([
                ...proj.tags,
                ...(proj.team?.lookingFor || []),
              ]);
              const slotsLeft = (proj.team?.max || 4) - (proj.team?.current || 1);
              const isBookmarked = bookmarkedProjectIds.has(proj.id);
              const isShareCopied = copiedShareId === proj.id;

              return (
                <div
                  key={proj.id}
                  className="p-5 rounded-2xl bg-[var(--bg-surface-low)] border border-[var(--border-subtle)] hover:border-[var(--border-strong)] transition-all flex flex-col justify-between gap-4 group relative"
                >
                  <div className="flex flex-col gap-3">
                    {/* Header: Author + Synergy Badge */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-2.5">
                        <Avatar
                          src={proj.author.avatarUrl}
                          fallback={proj.author.fallback}
                          className="size-9 rounded-xl border border-[var(--border-subtle)]"
                        />
                        <div className="flex flex-col min-w-0">
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs font-semibold text-white truncate max-w-[140px]">
                              {proj.author.name}
                            </span>
                            {proj.author.verified && (
                              <CheckCircle2 className="size-3 text-cyan-400 shrink-0" />
                            )}
                          </div>
                          <span className="text-[11px] font-mono text-[var(--text-muted)] truncate">
                            {proj.author.handle}
                          </span>
                        </div>
                      </div>

                      {/* Synergy Match Score Badge */}
                      <div className="flex items-center gap-2 shrink-0">
                        <div
                          title={
                            overlapping.length > 0
                              ? `Matches your skills in: ${overlapping.join(", ")}`
                              : "Synergy match based on domain alignment"
                          }
                          className="flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-mono font-semibold bg-cyan-950/60 text-cyan-300 border border-cyan-800/60 shadow-sm cursor-help"
                        >
                          <Zap className="size-3 text-cyan-400 fill-cyan-400" />
                          <span>{matchScore}% Match</span>
                        </div>
                      </div>
                    </div>

                    {/* Project Title & Overview */}
                    <div className="flex flex-col gap-1.5">
                      <h3
                        onClick={() => handleInspectProject(proj)}
                        className="text-base font-bold text-white hover:text-zinc-200 transition-colors cursor-pointer group-hover:underline"
                      >
                        {proj.title}
                      </h3>
                      <p className="text-xs text-[var(--text-secondary)] leading-relaxed line-clamp-3">
                        {proj.description}
                      </p>
                    </div>

                    {/* Tech Stacks Tags */}
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {proj.tags.map((tag) => {
                        const isMatched = userSkills.some(
                          (us) => us.toLowerCase() === tag.toLowerCase()
                        );
                        return (
                          <button
                            key={tag}
                            onClick={() => setLocalSearch(tag)}
                            className={`px-2 py-0.5 rounded-md text-[11px] font-mono transition-all cursor-pointer ${
                              isMatched
                                ? "bg-emerald-950/80 text-emerald-300 border border-emerald-700/60"
                                : "bg-[var(--badge-bg)] text-[var(--badge-text)] border border-[var(--border-subtle)] hover:text-white"
                            }`}
                          >
                            #{tag}
                          </button>
                        );
                      })}
                    </div>

                    {/* Roles Needed Row */}
                    {proj.team?.lookingFor && proj.team.lookingFor.length > 0 && (
                      <div className="p-2.5 rounded-xl bg-[var(--bg-surface-container)] border border-[var(--border-subtle)] flex items-center justify-between text-xs">
                        <div className="flex items-center gap-1.5 min-w-0">
                          <span className="text-[11px] font-mono text-[var(--text-muted)] shrink-0">
                            Recruiting:
                          </span>
                          <span className="text-xs text-white font-medium truncate">
                            {proj.team.lookingFor.join(", ")}
                          </span>
                        </div>

                        <span
                          className={`text-[10px] font-mono px-2 py-0.5 rounded-full shrink-0 font-semibold ${
                            slotsLeft > 0
                              ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30"
                              : "bg-white/10 text-zinc-400 border border-white/20"
                          }`}
                        >
                          {slotsLeft > 0 ? `${slotsLeft} slot${slotsLeft > 1 ? "s" : ""} open` : "Team Full"}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Card Footer: Metrics & Interactive Actions */}
                  <div className="pt-3 border-t border-[var(--border-subtle)] flex items-center justify-between gap-2">
                    <div className="flex items-center gap-3 text-xs text-[var(--text-muted)] font-mono">
                      <span className="flex items-center gap-1">
                        <Flame className="size-3.5 text-zinc-400" />
                        <span>{proj.stats.likes}</span>
                      </span>

                      {/* Bookmark Button */}
                      <button
                        onClick={() => handleToggleBookmark(proj.id)}
                        className={`hover:text-white transition-colors cursor-pointer ${
                          isBookmarked ? "text-white" : ""
                        }`}
                        title={isBookmarked ? "Remove Bookmark" : "Save Project"}
                      >
                        <Bookmark
                          className={`size-3.5 ${
                            isBookmarked ? "fill-white text-white" : ""
                          }`}
                        />
                      </button>

                      {/* Share Button */}
                      <button
                        onClick={() => handleShareProject(proj)}
                        className="hover:text-white transition-colors cursor-pointer relative"
                        title="Copy project link"
                      >
                        {isShareCopied ? (
                          <Check className="size-3.5 text-emerald-400" />
                        ) : (
                          <Share2 className="size-3.5" />
                        )}
                      </button>
                    </div>

                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleInspectProject(proj)}
                        className="h-8 px-2.5 text-xs text-[var(--text-secondary)] hover:text-white cursor-pointer"
                      >
                        <span>Overview</span>
                      </Button>

                      <Button
                        size="sm"
                        onClick={() => handleJoinProject(proj)}
                        className="h-8 px-3.5 text-xs bg-white hover:bg-neutral-200 text-black font-semibold rounded-lg gap-1.5 cursor-pointer shadow-sm"
                      >
                        <span>Join Team</span>
                        <ArrowUpRight className="size-3.5" />
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )
      ) : (
        /* ── Developers & Buddies Grid ── */
        filteredDevelopers.length === 0 ? (
          <div className="py-16 text-center flex flex-col items-center justify-center gap-3 rounded-2xl bg-[var(--bg-surface-low)] border border-[var(--border-subtle)] p-8">
            <Users className="size-10 text-[var(--text-muted)]" />
            <h3 className="text-base font-semibold text-white">No developers found</h3>
            <p className="text-xs text-[var(--text-secondary)] max-w-sm">
              We couldn&apos;t find any developers matching &quot;{localSearch}&quot; under these filters.
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setLocalSearch("");
                setSelectedCategory("all");
                setDevFilter("all");
              }}
            >
              Reset Filters
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {filteredDevelopers.map((dev) => {
              const { score: devSynergy, overlapping } = computeSynergy(dev.skills);
              const isAvailable = dev.availability === "available";
              const isCollab = dev.availability === "open_to_collab";

              return (
                <div
                  key={dev.id}
                  className="p-5 rounded-2xl bg-[var(--bg-surface-low)] border border-[var(--border-subtle)] hover:border-[var(--border-strong)] transition-all flex flex-col justify-between gap-4 group relative"
                >
                  <div className="flex flex-col gap-3">
                    {/* Header: Avatar, Name, Availability, Synergy */}
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="relative">
                          <Avatar
                            src={dev.avatar}
                            fallback={dev.initials}
                            className="size-11 rounded-2xl border border-[var(--border-subtle)]"
                          />
                          <span
                            className={`absolute -bottom-0.5 -right-0.5 size-3 rounded-full border-2 border-[var(--bg-surface-low)] ${
                              isAvailable
                                ? "bg-emerald-400"
                                : isCollab
                                ? "bg-indigo-400"
                                : "bg-amber-400"
                            }`}
                            title={`Status: ${dev.availability}`}
                          />
                        </div>

                        <div className="flex flex-col min-w-0">
                          <div className="flex items-center gap-1.5">
                            <h4
                              onClick={() => setSelectedDeveloperForModal(dev)}
                              className="text-sm font-bold text-white hover:text-zinc-300 transition-colors cursor-pointer truncate max-w-[130px]"
                            >
                              {dev.name}
                            </h4>
                          </div>
                          <span className="text-[11px] font-mono text-[var(--text-muted)] truncate">
                            {dev.handle}
                          </span>
                        </div>
                      </div>

                      {/* Synergy Match badge */}
                      <div
                        title={`Synergy Match based on skills: ${overlapping.join(", ") || "Complementary expertise"}`}
                        className="px-2 py-0.5 rounded-full text-[10px] font-mono font-semibold bg-cyan-950/70 text-cyan-300 border border-cyan-800/60 flex items-center gap-1 shrink-0"
                      >
                        <Zap className="size-2.5 text-cyan-400 fill-cyan-400" />
                        <span>{devSynergy}% Synergy</span>
                      </div>
                    </div>

                    {/* Headline Role & Location */}
                    <div>
                      <div className="text-xs font-semibold text-white">
                        {dev.role}
                      </div>
                      <div className="flex items-center gap-1 text-[11px] text-[var(--text-muted)] mt-0.5">
                        <MapPin className="size-3" />
                        <span>{dev.location}</span>
                      </div>
                    </div>

                    {/* Bio */}
                    <p className="text-xs text-[var(--text-secondary)] leading-relaxed line-clamp-2">
                      {dev.bio}
                    </p>

                    {/* Verified Skills Cloud */}
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {dev.skills.slice(0, 5).map((skill) => {
                        const isMatch = userSkills.some(
                          (us) => us.toLowerCase() === skill.toLowerCase()
                        );
                        return (
                          <button
                            key={skill}
                            onClick={() => setLocalSearch(skill)}
                            className={`px-2 py-0.5 rounded-md text-[10px] font-mono transition-all cursor-pointer ${
                              isMatch
                                ? "bg-emerald-950/70 text-emerald-300 border border-emerald-800/60 font-semibold"
                                : "bg-[var(--bg-surface-container)] text-[var(--text-secondary)] border border-[var(--border-subtle)] hover:text-white"
                            }`}
                          >
                            {skill}
                          </button>
                        );
                      })}
                      {dev.skills.length > 5 && (
                        <span className="text-[10px] font-mono text-[var(--text-muted)] self-center">
                          +{dev.skills.length - 5}
                        </span>
                      )}
                    </div>

                    {/* Stats Strip */}
                    <div className="grid grid-cols-3 gap-2 p-2 rounded-xl bg-[var(--bg-surface-container)] border border-[var(--border-subtle)] text-center">
                      <div>
                        <div className="text-xs font-bold text-white">
                          {dev.stats.activeProjectsCount}
                        </div>
                        <div className="text-[9px] font-mono text-[var(--text-muted)] uppercase">
                          Projects
                        </div>
                      </div>
                      <div>
                        <div className="text-xs font-bold text-white">
                          {dev.stats.teamsJoinedCount}
                        </div>
                        <div className="text-[9px] font-mono text-[var(--text-muted)] uppercase">
                          Teams
                        </div>
                      </div>
                      <div>
                        <div className="text-xs font-bold text-white">
                          {dev.stats.collaboratorsCount}
                        </div>
                        <div className="text-[9px] font-mono text-[var(--text-muted)] uppercase">
                          Collabs
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Card Actions */}
                  <div className="pt-3 border-t border-[var(--border-subtle)] flex items-center justify-between gap-2">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setSelectedDeveloperForModal(dev)}
                      className="h-8 px-2.5 text-xs text-[var(--text-secondary)] hover:text-white cursor-pointer"
                    >
                      <span>Snapshot</span>
                    </Button>

                    <div className="flex items-center gap-1.5">
                      {/* Follow toggle button */}
                      <Button
                        size="sm"
                        variant={isFollowing(dev.handle) ? "outline" : "secondary"}
                        onClick={() =>
                          toggleFollowUser({
                            handle: dev.handle,
                            name: dev.name,
                            id: dev.id,
                          })
                        }
                        className={`h-8 px-2.5 text-xs rounded-lg gap-1 cursor-pointer group/btn ${
                          isFollowing(dev.handle)
                            ? "border-emerald-500/30 text-emerald-400 hover:border-red-500/40 hover:text-red-400 hover:bg-red-500/10"
                            : "bg-[var(--bg-surface-high)] text-white hover:bg-white hover:text-black font-medium"
                        }`}
                      >
                        {isFollowing(dev.handle) ? (
                          <>
                            <Check className="size-3 text-emerald-400 group-hover/btn:hidden" />
                            <span className="group-hover/btn:hidden">Following</span>
                            <X className="size-3 hidden group-hover/btn:inline text-red-400" />
                            <span className="hidden group-hover/btn:inline">Unfollow</span>
                          </>
                        ) : (
                          <>
                            <UserPlus className="size-3" />
                            <span>Follow</span>
                          </>
                        )}
                      </Button>

                      <Button
                        size="sm"
                        onClick={() => handleOpenInviteModal(dev)}
                        className="h-8 px-3 text-xs bg-white hover:bg-neutral-200 text-black font-semibold rounded-lg gap-1.5 cursor-pointer shadow-sm"
                      >
                        <UserPlus className="size-3.5" />
                        <span>Invite</span>
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )
      )}

      {/* ── 6. Interactive Developer Profile Modal ── */}
      {selectedDeveloperForModal && (
        <Dialog
          open={!!selectedDeveloperForModal}
          onOpenChange={(open) => !open && setSelectedDeveloperForModal(null)}
        >
          <DialogHeader onClose={() => setSelectedDeveloperForModal(null)}>
            <div className="flex items-center gap-2">
              <Users className="size-5 text-white" />
              <span>Developer Snapshot</span>
            </div>
          </DialogHeader>

          <div className="flex flex-col gap-4 mt-3">
            {/* Header / Avatar */}
            <div className="flex items-start justify-between gap-3 p-4 rounded-xl bg-[var(--bg-surface-container)] border border-[var(--border-subtle)]">
              <div className="flex items-center gap-3">
                <Avatar
                  src={selectedDeveloperForModal.avatar}
                  fallback={selectedDeveloperForModal.initials}
                  className="size-14 rounded-2xl border-2 border-white/10"
                />
                <div className="flex flex-col">
                  <div className="flex items-center gap-1.5">
                    <h3 className="text-base font-bold text-white">
                      {selectedDeveloperForModal.name}
                    </h3>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                      {selectedDeveloperForModal.availability.replace(/_/g, " ")}
                    </span>
                  </div>
                  <span className="text-xs font-mono text-[var(--text-muted)]">
                    {selectedDeveloperForModal.handle}
                  </span>
                  <span className="text-xs text-white font-medium mt-0.5">
                    {selectedDeveloperForModal.role}
                  </span>
                </div>
              </div>

              {/* Match Badge */}
              <div className="text-right">
                <div className="text-lg font-bold text-cyan-300 font-mono">
                  {computeSynergy(selectedDeveloperForModal.skills).score}%
                </div>
                <div className="text-[10px] font-mono text-[var(--text-muted)]">
                  Synergy Match
                </div>
              </div>
            </div>

            {/* Bio */}
            <div>
              <span className="text-xs font-mono text-[var(--text-muted)] block mb-1">
                Bio & Engineering Focus
              </span>
              <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                {selectedDeveloperForModal.bio}
              </p>
            </div>

            {/* Custom Status Quote */}
            {selectedDeveloperForModal.customStatus && (
              <div className="p-3 rounded-xl bg-[var(--bg-surface-low)] border border-[var(--border-subtle)] text-xs font-mono text-zinc-300 italic">
                &ldquo;{selectedDeveloperForModal.customStatus}&rdquo;
              </div>
            )}

            {/* Skills Cloud */}
            <div>
              <span className="text-xs font-mono text-[var(--text-muted)] block mb-1.5">
                Verified Skill Stack
              </span>
              <div className="flex flex-wrap gap-1.5">
                {selectedDeveloperForModal.skills.map((skill) => {
                  const isMatch = userSkills.some(
                    (us) => us.toLowerCase() === skill.toLowerCase()
                  );
                  return (
                    <Badge
                      key={skill}
                      variant={isMatch ? "success" : "tech"}
                      className="text-xs py-1"
                    >
                      {skill} {isMatch && "✓"}
                    </Badge>
                  );
                })}
              </div>
            </div>

            {/* Social & Code Links */}
            <div className="flex items-center gap-3 pt-2">
              {selectedDeveloperForModal.githubUrl && (
                <a
                  href={selectedDeveloperForModal.githubUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-1.5 text-xs text-[var(--text-secondary)] hover:text-white transition-colors"
                >
                  <GithubIcon className="size-4" />
                  <span>GitHub</span>
                </a>
              )}
              {selectedDeveloperForModal.linkedinUrl && (
                <a
                  href={selectedDeveloperForModal.linkedinUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-1.5 text-xs text-[var(--text-secondary)] hover:text-white transition-colors"
                >
                  <LinkedinIcon className="size-4" />
                  <span>LinkedIn</span>
                </a>
              )}
              {selectedDeveloperForModal.twitterUrl && (
                <a
                  href={selectedDeveloperForModal.twitterUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-1.5 text-xs text-[var(--text-secondary)] hover:text-white transition-colors"
                >
                  <TwitterIcon className="size-4" />
                  <span>X / Twitter</span>
                </a>
              )}
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-[var(--border-subtle)] mt-2">
              <Button
                variant="ghost"
                onClick={() => setSelectedDeveloperForModal(null)}
              >
                Close
              </Button>

              {/* Follow Toggle */}
              <Button
                variant={isFollowing(selectedDeveloperForModal.handle) ? "outline" : "secondary"}
                onClick={() =>
                  toggleFollowUser({
                    handle: selectedDeveloperForModal.handle,
                    name: selectedDeveloperForModal.name,
                    id: selectedDeveloperForModal.id,
                  })
                }
                className={`gap-1.5 cursor-pointer ${
                  isFollowing(selectedDeveloperForModal.handle)
                    ? "border-emerald-500/30 text-emerald-400 hover:border-red-500/40 hover:text-red-400 hover:bg-red-500/10"
                    : "bg-white hover:bg-neutral-200 text-black font-semibold"
                }`}
              >
                {isFollowing(selectedDeveloperForModal.handle) ? (
                  <>
                    <Check className="size-3.5 text-emerald-400" />
                    <span>Following</span>
                  </>
                ) : (
                  <>
                    <UserPlus className="size-3.5" />
                    <span>Follow</span>
                  </>
                )}
              </Button>

              <Button
                variant="outline"
                onClick={() => {
                  setSelectedDeveloperForModal(null);
                  if (onNavigateToTab) onNavigateToTab("messages");
                }}
                className="gap-1.5"
              >
                <MessageSquare className="size-3.5" />
                <span>Message</span>
              </Button>

              <Button
                onClick={() => {
                  const dev = selectedDeveloperForModal;
                  setSelectedDeveloperForModal(null);
                  handleOpenInviteModal(dev);
                }}
                className="gap-1.5"
              >
                <UserPlus className="size-3.5" />
                <span>Invite to Team</span>
              </Button>
            </div>
          </div>
        </Dialog>
      )}

      {/* ── 7. Interactive Invite Developer to Project Modal ── */}
      {invitedDev && (
        <Dialog open={inviteModalOpen} onOpenChange={setInviteModalOpen}>
          <DialogHeader onClose={() => setInviteModalOpen(false)}>
            <div className="flex items-center gap-2">
              <UserPlus className="size-5 text-white" />
              <span>Invite Developer to Team</span>
            </div>
          </DialogHeader>

          {inviteSuccess ? (
            <div className="py-8 flex flex-col items-center justify-center gap-3 text-center animate-in zoom-in-95">
              <CheckCircle2 className="size-12 text-emerald-400" />
              <h4 className="text-base font-semibold text-white">
                Invitation Sent!
              </h4>
              <p className="text-xs text-[var(--text-secondary)] max-w-xs">
                {invitedDev.name} ({invitedDev.handle}) has been invited to join &quot;{selectedProjectToInvite}&quot;.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSendInvitation} className="flex flex-col gap-4 mt-3">
              <div className="p-3 rounded-xl bg-[var(--bg-surface-container)] border border-[var(--border-subtle)] flex items-center gap-3">
                <Avatar
                  src={invitedDev.avatar}
                  fallback={invitedDev.initials}
                  className="size-10 rounded-xl"
                />
                <div>
                  <div className="text-xs font-semibold text-white">
                    Inviting {invitedDev.name}
                  </div>
                  <div className="text-[11px] font-mono text-[var(--text-muted)]">
                    {invitedDev.handle} • {invitedDev.role}
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-mono text-[var(--text-secondary)]">
                  Select Project
                </label>
                <select
                  value={selectedProjectToInvite}
                  onChange={(e) => setSelectedProjectToInvite(e.target.value)}
                  className="w-full h-10 px-3 rounded-lg bg-[var(--bg-surface-low)] border border-[var(--border-subtle)] text-xs text-white focus:outline-none"
                  required
                >
                  {allProjects.map((p) => (
                    <option key={p.id} value={p.title}>
                      {p.title}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-mono text-[var(--text-secondary)]">
                  Proposed Role in Project
                </label>
                <Input
                  value={inviteRole}
                  onChange={(e) => setInviteRole(e.target.value)}
                  placeholder="e.g. Lead Frontend Architect, ML Pipeline Eng"
                  required
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-mono text-[var(--text-secondary)]">
                  Personal Pitch / Collaboration Note
                </label>
                <Textarea
                  value={inviteMessage}
                  onChange={(e) => setInviteMessage(e.target.value)}
                  placeholder="Tell them why you chose them and what exciting technical challenge they will solve..."
                  rows={3}
                  required
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-[var(--border-subtle)]">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setInviteModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" className="gap-1.5">
                  <UserPlus className="size-3.5" />
                  <span>Send Invitation</span>
                </Button>
              </div>
            </form>
          )}
        </Dialog>
      )}
    </div>
  );
}
