"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { api, User, LoginPayload, RegisterPayload, AuthResponse } from "@/lib/api";

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (payload: LoginPayload) => Promise<void>;
  register: (payload: RegisterPayload) => Promise<AuthResponse>;
  verifyOtp: (payload: { email: string; otp: string }) => Promise<AuthResponse>;
  resendOtp: (payload: { email: string }) => Promise<{ success: boolean; message: string }>;
  googleLogin: (payload: {
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
  }) => Promise<void>;
  logout: () => void;
  updateUserProfile: (data: Partial<User>) => Promise<boolean>;
  followedHandles: string[];
  isFollowing: (handleOrId: string) => boolean;
  toggleFollowUser: (target: { handle: string; name?: string; id?: string }) => Promise<{ isFollowing: boolean; followersCount?: number }>;
  openAuthModal: (initialMode?: "login" | "register") => void;
  closeAuthModal: () => void;
  authModalOpen: boolean;
  authModalMode: "login" | "register";
}

const defaultUser: User = {
  id: "usr-default-1",
  _id: "usr-default-1",
  name: "Pranjal Shukla",
  handle: "@pranjal",
  email: "pranjal@projectbuddy.dev",
  role: "Lead Fullstack Architect",
  bio: "Building developer-first collaboration tools, AI systems, and cloud architectures.",
  initials: "PS",
  skills: ["Next.js", "TypeScript", "Node.js", "MongoDB", "Python", "TailwindCSS"],
  followers: ["@schen", "@arivera", "@elena_codes", "@dmarcus"],
  following: ["@schen", "@arivera"],
  stats: {
    activeProjectsCount: 3,
    teamsJoinedCount: 5,
    collaboratorsCount: 14,
    matchScore: 98,
    followersCount: 4,
    followingCount: 2,
  },
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(defaultUser);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<"login" | "register">("login");
  const [followedHandles, setFollowedHandles] = useState<string[]>(() => {
    if (typeof window !== "undefined") {
      try {
        const stored = localStorage.getItem("projectbuddy_following");
        if (stored) return JSON.parse(stored);
      } catch {}
    }
    return ["@schen", "@arivera"];
  });

  // Load user & token from localStorage on initial render
  useEffect(() => {
    try {
      const storedToken = localStorage.getItem("projectbuddy_token");
      const storedUser = localStorage.getItem("projectbuddy_user");

      if (storedToken && storedUser) {
        setToken(storedToken);
        const parsed = JSON.parse(storedUser);
        setUser(parsed);
        if (Array.isArray(parsed.following) && parsed.following.length > 0) {
          setFollowedHandles(parsed.following);
        }
        // Verify/refresh user from backend
        api.getMe(storedToken).then((freshUser) => {
          if (freshUser) {
            setUser(freshUser);
            if (Array.isArray(freshUser.following)) {
              setFollowedHandles(freshUser.following);
              localStorage.setItem("projectbuddy_following", JSON.stringify(freshUser.following));
            }
            localStorage.setItem("projectbuddy_user", JSON.stringify(freshUser));
          }
        }).catch(() => {
          // If token expired, clear or keep stored
        });
      }
    } catch (err) {
      console.error("Failed to load auth state from localStorage:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Ensure followedHandles stays in sync when user object changes
  useEffect(() => {
    if (user?.following && Array.isArray(user.following)) {
      setFollowedHandles(user.following);
      if (typeof window !== "undefined") {
        localStorage.setItem("projectbuddy_following", JSON.stringify(user.following));
      }
    }
  }, [user?.following]);

  const login = async (payload: LoginPayload) => {
    const res = await api.login(payload);
    if (res.user && res.token) {
      setUser(res.user);
      setToken(res.token);
      if (Array.isArray(res.user.following)) {
        setFollowedHandles(res.user.following);
        localStorage.setItem("projectbuddy_following", JSON.stringify(res.user.following));
      }
      localStorage.setItem("projectbuddy_token", res.token);
      localStorage.setItem("projectbuddy_user", JSON.stringify(res.user));
      setAuthModalOpen(false);
    }
  };

  const register = async (payload: RegisterPayload): Promise<AuthResponse> => {
    const res = await api.register(payload);
    // If user and token returned immediately (e.g. without OTP requirement)
    if (res.user && res.token) {
      setUser(res.user);
      setToken(res.token);
      if (Array.isArray(res.user.following)) {
        setFollowedHandles(res.user.following);
        localStorage.setItem("projectbuddy_following", JSON.stringify(res.user.following));
      }
      localStorage.setItem("projectbuddy_token", res.token);
      localStorage.setItem("projectbuddy_user", JSON.stringify(res.user));
      setAuthModalOpen(false);
    }
    return res;
  };

  const verifyOtp = async (payload: { email: string; otp: string }): Promise<AuthResponse> => {
    const res = await api.verifyOtp(payload);
    if (res.user && res.token) {
      setUser(res.user);
      setToken(res.token);
      localStorage.setItem("projectbuddy_token", res.token);
      localStorage.setItem("projectbuddy_user", JSON.stringify(res.user));
    }
    return res;
  };

  const resendOtp = async (payload: { email: string }): Promise<{ success: boolean; message: string }> => {
    return await api.resendOtp(payload);
  };

  const googleLogin = async (payload: {
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
  }) => {
    const res = await api.googleAuth(payload);
    if (res.user && res.token) {
      setUser(res.user);
      setToken(res.token);
      localStorage.setItem("projectbuddy_token", res.token);
      localStorage.setItem("projectbuddy_user", JSON.stringify(res.user));
      setAuthModalOpen(false);
    }
  };

  const logout = () => {
    setUser(defaultUser);
    setToken(null);
    localStorage.removeItem("projectbuddy_token");
    localStorage.removeItem("projectbuddy_user");
  };

  const updateUserProfile = async (data: Partial<User>): Promise<boolean> => {
    try {
      const currentUser = user || defaultUser;
      const updatedUser: User = {
        ...currentUser,
        ...data,
      };

      // Recalculate initials if name was changed and initials not explicitly passed
      if (data.name && !data.initials) {
        const parts = data.name.trim().split(" ");
        updatedUser.initials =
          parts.length >= 2
            ? `${parts[0][0]}${parts[1][0]}`.toUpperCase()
            : data.name.slice(0, 2).toUpperCase();
      }

      setUser(updatedUser);
      localStorage.setItem("projectbuddy_user", JSON.stringify(updatedUser));

      // Attempt backend update if token exists or server is available
      try {
        const res = await api.updateProfile(data, token || undefined);
        if (res && res.user) {
          setUser(res.user);
          localStorage.setItem("projectbuddy_user", JSON.stringify(res.user));
        }
      } catch (err) {
        console.warn("Backend profile sync notice:", err);
      }

      return true;
    } catch (err) {
      console.error("Failed to update profile:", err);
      return false;
    }
  };

  const isFollowing = (handleOrId: string) => {
    if (!handleOrId) return false;
    let clean = handleOrId.trim().toLowerCase();
    if (!clean.startsWith("@")) clean = `@${clean}`;
    return followedHandles.some((h) => {
      let norm = h.trim().toLowerCase();
      if (!norm.startsWith("@")) norm = `@${norm}`;
      return norm === clean;
    });
  };

  const toggleFollowUser = async (target: { handle: string; name?: string; id?: string }) => {
    if (!target.handle) return { isFollowing: false };
    let clean = target.handle.trim().toLowerCase();
    if (!clean.startsWith("@")) clean = `@${clean}`;

    const alreadyFollowing = isFollowing(clean);
    let nextFollowed: string[];

    if (alreadyFollowing) {
      nextFollowed = followedHandles.filter((h) => {
        let norm = h.trim().toLowerCase();
        if (!norm.startsWith("@")) norm = `@${norm}`;
        return norm !== clean;
      });
    } else {
      nextFollowed = [...followedHandles, clean];
    }

    setFollowedHandles(nextFollowed);
    if (typeof window !== "undefined") {
      localStorage.setItem("projectbuddy_following", JSON.stringify(nextFollowed));
    }

    // Update current user's following stats dynamically
    setUser((prev) => {
      if (!prev) return prev;
      const currentFollowing = prev.following || [];
      const updatedFollowing = alreadyFollowing
        ? currentFollowing.filter((h) => h.toLowerCase() !== clean)
        : [...currentFollowing, clean];

      const currentStats = prev.stats || {};
      const currentCount = currentStats.followingCount ?? updatedFollowing.length;
      const nextCount = Math.max(0, alreadyFollowing ? currentCount - 1 : currentCount + 1);

      const updated: User = {
        ...prev,
        following: updatedFollowing,
        stats: {
          ...currentStats,
          followingCount: nextCount,
        },
      };

      if (typeof window !== "undefined") {
        localStorage.setItem("projectbuddy_user", JSON.stringify(updated));
      }
      return updated;
    });

    // Notify backend
    try {
      const res = await api.toggleFollow(clean, {
        followerHandle: user?.handle || "@pranjal",
        followerName: user?.name || "Pranjal Shukla",
      });

      if (res.currentUser) {
        setUser(res.currentUser);
        if (typeof window !== "undefined") {
          localStorage.setItem("projectbuddy_user", JSON.stringify(res.currentUser));
        }
      }
      if (Array.isArray(res.following)) {
        setFollowedHandles(res.following);
        if (typeof window !== "undefined") {
          localStorage.setItem("projectbuddy_following", JSON.stringify(res.following));
        }
      }

      return { isFollowing: res.isFollowing, followersCount: res.followersCount };
    } catch {
      // Offline fallback succeeded locally
      return { isFollowing: !alreadyFollowing };
    }
  };

  const openAuthModal = (mode: "login" | "register" = "login") => {
    setAuthModalMode(mode);
    setAuthModalOpen(true);
  };

  const closeAuthModal = () => {
    setAuthModalOpen(false);
  };

  const isAuthenticated = !!token;

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated,
        isLoading,
        login,
        register,
        verifyOtp,
        resendOtp,
        googleLogin,
        logout,
        updateUserProfile,
        followedHandles,
        isFollowing,
        toggleFollowUser,
        openAuthModal,
        closeAuthModal,
        authModalOpen,
        authModalMode,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
