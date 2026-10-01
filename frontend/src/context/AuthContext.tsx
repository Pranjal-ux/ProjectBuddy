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
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(defaultUser);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<"login" | "register">("login");

  // Load user & token from localStorage on initial render
  useEffect(() => {
    try {
      const storedToken = localStorage.getItem("projectbuddy_token");
      const storedUser = localStorage.getItem("projectbuddy_user");

      if (storedToken && storedUser) {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
        // Verify/refresh user from backend
        api.getMe(storedToken).then((freshUser) => {
          if (freshUser) {
            setUser(freshUser);
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

  const login = async (payload: LoginPayload) => {
    const res = await api.login(payload);
    if (res.user && res.token) {
      setUser(res.user);
      setToken(res.token);
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
