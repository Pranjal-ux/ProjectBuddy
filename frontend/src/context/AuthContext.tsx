"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { api, User, LoginPayload, RegisterPayload } from "@/lib/api";

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (payload: LoginPayload) => Promise<void>;
  register: (payload: RegisterPayload) => Promise<void>;
  googleLogin: (payload: {
    credential?: string;
    accessToken?: string;
    code?: string;
    devUser?: {
      email: string;
      name: string;
      picture?: string;
      sub?: string;
    };
  }) => Promise<void>;
  logout: () => void;
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

  const register = async (payload: RegisterPayload) => {
    const res = await api.register(payload);
    if (res.user && res.token) {
      setUser(res.user);
      setToken(res.token);
      localStorage.setItem("projectbuddy_token", res.token);
      localStorage.setItem("projectbuddy_user", JSON.stringify(res.user));
      setAuthModalOpen(false);
    }
  };

  const googleLogin = async (payload: {
    credential?: string;
    accessToken?: string;
    code?: string;
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
        googleLogin,
        logout,
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
