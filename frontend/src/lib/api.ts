import { Post } from "@/data/mockData";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

export interface ProfileStats {
  activeProjectsCount?: number;
  teamsJoinedCount?: number;
  collaboratorsCount?: number;
  matchScore?: number;
  skillsCount?: number;
  followersCount?: number;
  followingCount?: number;
}

export interface User {
  id?: string;
  _id?: string;
  name: string;
  handle: string;
  email?: string;
  role?: string;
  bio?: string;
  avatar?: string;
  coverImage?: string;
  initials?: string;
  location?: string;
  websiteUrl?: string;
  githubUrl?: string;
  linkedinUrl?: string;
  twitterUrl?: string;
  pronouns?: string;
  customStatus?: string;
  availability?: "available" | "open_to_collab" | "busy" | "not_looking";
  experienceLevel?: "junior" | "mid" | "senior" | "lead" | "architect";
  interests?: string[];
  skills?: string[];
  followers?: string[];
  following?: string[];
  isFollowing?: boolean;
  stats?: ProfileStats;
  createdAt?: string;
  updatedAt?: string;
}

export interface RegisterPayload {
  name: string;
  handle: string;
  email: string;
  password: string;
  role?: string;
  bio?: string;
}

export interface LoginPayload {
  loginIdentifier: string;
  password: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  token?: string;
  user?: User;
  requireOtp?: boolean;
  email?: string;
}

export interface ActivityItem {
  _id?: string;
  id?: string;
  customId?: string;
  type: "join_request" | "like" | "star" | "collab" | "mention";
  user: string;
  handle: string;
  initials: string;
  action: string;
  target: string;
  role?: string;
  recipientHandle?: string;
  joinRequestId?: string;
  hasAction?: boolean;
  status?: "pending" | "accepted" | "declined" | "none";
  createdAt?: string;
}

export interface JoinRequestPayload {
  projectId: string;
  projectTitle: string;
  projectAuthorName?: string;
  projectAuthorHandle?: string;
  applicantName?: string;
  applicantHandle?: string;
  applicantInitials?: string;
  role: string;
  githubUrl?: string;
  pitch: string;
}

export const getAuthHeaders = (): Record<string, string> => {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("projectbuddy_token");
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }
  }
  return headers;
};

export const api = {
  // Auth: Register new user (initiates email OTP verification)
  async register(payload: RegisterPayload): Promise<AuthResponse> {
    const res = await fetch(`${API_BASE_URL}/auth/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error(data.message || "Failed to create account");
    }
    return data;
  },

  // Auth: Verify 6-digit OTP code to finalize registration
  async verifyOtp(payload: { email: string; otp: string }): Promise<AuthResponse> {
    const res = await fetch(`${API_BASE_URL}/auth/verify-otp`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error(data.message || "Invalid or expired verification code");
    }
    return data;
  },

  // Auth: Resend verification code
  async resendOtp(payload: { email: string }): Promise<{ success: boolean; message: string }> {
    const res = await fetch(`${API_BASE_URL}/auth/resend-otp`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error(data.message || "Failed to resend verification code");
    }
    return data;
  },

  // Auth: Login user
  async login(payload: LoginPayload): Promise<AuthResponse> {
    const res = await fetch(`${API_BASE_URL}/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error(data.message || "Failed to login");
    }
    return data;
  },

  // Auth: Google Sign-in / Sign-up (OpenID Connect / OAuth 2.0)
  async googleAuth(payload: {
    credential?: string;
    accessToken?: string;
    code?: string;
    mode?: "login" | "register";
    devUser?: {
      email: string;
      name: string;
      picture?: string;
      sub?: string;
    };
  }): Promise<AuthResponse> {
    const res = await fetch(`${API_BASE_URL}/auth/google`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error(data.message || "Failed to authenticate with Google");
    }
    return data;
  },

  // Auth: Fetch Google Client ID (from backend if not in frontend env)
  async getGoogleClientId(): Promise<string> {
    try {
      const res = await fetch(`${API_BASE_URL}/auth/google/client-id`);
      if (res.ok) {
        const data = await res.json();
        return data.clientId || "";
      }
    } catch {
      // Backend not reached or offline
    }
    return "";
  },

  // Auth / Profile: Get current authenticated user
  async getMe(token: string): Promise<User> {
    try {
      const res = await fetch(`${API_BASE_URL}/profile/me`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (res.ok) {
        const data = await res.json();
        return data.user;
      }
    } catch {
      // Fallback to /auth/me
    }

    const res = await fetch(`${API_BASE_URL}/auth/me`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error(data.message || "Failed to get user profile");
    }
    return data.user;
  },

  // Auth / Profile: Update user profile (photo, bio, skills, role, social links, etc.)
  async updateProfile(
    payload: Partial<User>,
    token?: string
  ): Promise<{ success: boolean; message: string; user: User }> {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    // Try /profile/me first
    if (token) {
      try {
        const res = await fetch(`${API_BASE_URL}/profile/me`, {
          method: "PUT",
          headers,
          body: JSON.stringify(payload),
        });
        if (res.ok) {
          return await res.json();
        }
      } catch {
        // Fallback to /auth/profile
      }
    }

    const res = await fetch(`${API_BASE_URL}/auth/profile`, {
      method: "PUT",
      headers,
      body: JSON.stringify(payload),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error(data.message || "Failed to update profile");
    }
    return data;
  },

  // Profile: Get public profile by handle (@username) or ID
  async getUserProfile(identifier: string): Promise<User> {
    const res = await fetch(
      `${API_BASE_URL}/profile/${encodeURIComponent(identifier)}`,
      { cache: "no-store" }
    );
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error(data.message || "Failed to fetch user profile");
    }
    return data.user;
  },

  // Profile: Get user stats
  async getUserStats(identifier: string): Promise<ProfileStats> {
    const res = await fetch(
      `${API_BASE_URL}/profile/${encodeURIComponent(identifier)}/stats`,
      { cache: "no-store" }
    );
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error(data.message || "Failed to fetch profile stats");
    }
    return data.stats || {};
  },

  // Profile: Get user authored/joined projects
  async getUserProjects(identifier: string): Promise<any[]> {
    const res = await fetch(
      `${API_BASE_URL}/profile/${encodeURIComponent(identifier)}/projects`,
      { cache: "no-store" }
    );
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error(data.message || "Failed to fetch user projects");
    }
    return data.projects || [];
  },

  // Profile: Search developers
  async searchDevelopers(params?: {
    q?: string;
    skill?: string;
    role?: string;
    availability?: string;
  }): Promise<User[]> {
    const query = new URLSearchParams();
    if (params?.q) query.set("q", params.q);
    if (params?.skill) query.set("skill", params.skill);
    if (params?.role) query.set("role", params.role);
    if (params?.availability) query.set("availability", params.availability);

    const res = await fetch(`${API_BASE_URL}/profile/search?${query.toString()}`, {
      cache: "no-store",
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error(data.message || "Failed to search developers");
    }
    return data.developers || [];
  },

  // Profile: Toggle follow status (follow/unfollow a developer)
  async toggleFollow(
    identifier: string,
    followerData?: { followerHandle?: string; followerName?: string }
  ): Promise<{
    success: boolean;
    message: string;
    isFollowing: boolean;
    followersCount: number;
    user?: User;
  }> {
    const res = await fetch(
      `${API_BASE_URL}/profile/${encodeURIComponent(identifier)}/follow`,
      {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify(followerData || {}),
      }
    );
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error(data.message || "Failed to update follow status");
    }
    return data;
  },

  // Profile: Get followers list for a developer
  async getFollowers(identifier: string, viewerHandle?: string): Promise<User[]> {
    const url = viewerHandle
      ? `${API_BASE_URL}/profile/${encodeURIComponent(identifier)}/followers?viewerHandle=${encodeURIComponent(viewerHandle)}`
      : `${API_BASE_URL}/profile/${encodeURIComponent(identifier)}/followers`;
    const res = await fetch(url, { cache: "no-store" });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error(data.message || "Failed to fetch followers");
    }
    return data.followers || [];
  },

  // Profile: Get following list for a developer
  async getFollowing(identifier: string, viewerHandle?: string): Promise<User[]> {
    const url = viewerHandle
      ? `${API_BASE_URL}/profile/${encodeURIComponent(identifier)}/following?viewerHandle=${encodeURIComponent(viewerHandle)}`
      : `${API_BASE_URL}/profile/${encodeURIComponent(identifier)}/following`;
    const res = await fetch(url, { cache: "no-store" });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error(data.message || "Failed to fetch following list");
    }
    return data.following || [];
  },

  // Fetch activities feed
  async getActivities(recipientHandle?: string): Promise<ActivityItem[]> {
    try {
      const url = recipientHandle
        ? `${API_BASE_URL}/activities?recipientHandle=${encodeURIComponent(recipientHandle)}`
        : `${API_BASE_URL}/activities`;
      const res = await fetch(url, {
        cache: "no-store",
      });
      if (!res.ok) throw new Error("Failed to fetch activities");
      const json = await res.json();
      return json.data || [];
    } catch (err) {
      console.warn("Backend not reachable for activities, using local fallback", err);
      throw err;
    }
  },

  // Submit a join request
  async submitJoinRequest(payload: JoinRequestPayload) {
    const res = await fetch(`${API_BASE_URL}/join-requests`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || "Failed to submit join request");
    }
    return res.json();
  },

  // Respond to a join request (accept or decline)
  async respondToJoinRequest(
    id: string,
    status: "accepted" | "declined",
    activityData?: Partial<ActivityItem>
  ) {
    // Try activities respond endpoint first, then join-requests
    try {
      const res = await fetch(`${API_BASE_URL}/activities/${id}/respond`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status, activityData }),
      });
      if (res.ok) {
        return res.json();
      }
    } catch {
      // Fallback to join-requests endpoint
    }

    const res = await fetch(`${API_BASE_URL}/join-requests/${id}/respond`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ status, activityData }),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || `Failed to ${status} request`);
    }
    return res.json();
  },

  // Posts: Get all posts
  async getPosts(handle?: string): Promise<Post[]> {
    try {
      const url = handle
        ? `${API_BASE_URL}/posts?handle=${encodeURIComponent(handle)}`
        : `${API_BASE_URL}/posts`;
      const res = await fetch(url, { cache: "no-store" });
      if (!res.ok) throw new Error("Failed to fetch posts");
      const json = await res.json();
      return json.posts || [];
    } catch (err) {
      console.warn("Backend not reachable for posts, using fallback", err);
      throw err;
    }
  },

  // Posts: Create new post
  async createPost(payload: Partial<Post>): Promise<Post> {
    const res = await fetch(`${API_BASE_URL}/posts`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });
    const json = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error(json.message || "Failed to create post");
    }
    return json.post;
  },

  // Posts: Toggle like on a post
  async toggleLike(
    id: string,
    handle?: string,
    userName?: string
  ): Promise<{ success: boolean; liked: boolean; likesCount: number; post: Post }> {
    const res = await fetch(`${API_BASE_URL}/posts/${id}/like`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify({ handle, userName }),
    });
    const json = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error(json.message || "Failed to toggle like");
    }
    return json;
  },

  // Posts: Toggle bookmark on a post
  async toggleBookmark(
    id: string,
    handle?: string
  ): Promise<{ success: boolean; bookmarked: boolean; bookmarksCount: number; post: Post }> {
    const res = await fetch(`${API_BASE_URL}/posts/${id}/bookmark`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify({ handle }),
    });
    const json = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error(json.message || "Failed to toggle bookmark");
    }
    return json;
  },

  // Posts: Get all bookmarked posts
  async getBookmarks(handle?: string): Promise<Post[]> {
    try {
      const url = handle
        ? `${API_BASE_URL}/posts/bookmarks?handle=${encodeURIComponent(handle)}`
        : `${API_BASE_URL}/posts/bookmarks`;
      const res = await fetch(url, {
        headers: getAuthHeaders(),
        cache: "no-store",
      });
      if (!res.ok) throw new Error("Failed to fetch bookmarks");
      const json = await res.json();
      return json.posts || [];
    } catch (err) {
      console.warn("Backend not reachable for bookmarks, using fallback", err);
      throw err;
    }
  },

  // Posts: Add comment to a post
  async addComment(
    id: string,
    text: string,
    user?: { name?: string; handle?: string; avatar?: string }
  ): Promise<{ success: boolean; comment: any; commentsCount: number; commentsList: any[] }> {
    const res = await fetch(`${API_BASE_URL}/posts/${id}/comments`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify({
        text,
        handle: user?.handle,
        author: user?.name,
        avatar: user?.avatar,
      }),
    });
    const json = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error(json.message || "Failed to add comment");
    }
    return json;
  },

  // Posts: Get comments for a post
  async getComments(id: string): Promise<any[]> {
    const res = await fetch(`${API_BASE_URL}/posts/${id}/comments`, {
      cache: "no-store",
    });
    const json = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error(json.message || "Failed to fetch comments");
    }
    return json.comments || [];
  },

  // Posts: Record share
  async recordShare(id: string): Promise<{ success: boolean; sharesCount: number }> {
    const res = await fetch(`${API_BASE_URL}/posts/${id}/share`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
    });
    const json = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error(json.message || "Failed to record share");
    }
    return json;
  },
};
