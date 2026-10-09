"use client";

import React, { useState, useEffect } from "react";
import { Dialog, DialogHeader } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { ProjectBuddyLogo } from "@/components/ui/ProjectBuddyLogo";
import {
  LogIn,
  UserPlus,
  AlertCircle,
  Loader2,
  CheckCircle2,
  Sparkles,
} from "lucide-react";

export function AuthModal() {
  const {
    authModalOpen,
    authModalMode,
    closeAuthModal,
    login,
    register,
  } = useAuth();

  // Mode: "login" | "register"
  const [mode, setMode] = useState<"login" | "register">(authModalMode);

  // Form states
  const [name, setName] = useState("");
  const [handle, setHandle] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("Fullstack Developer");
  const [bio, setBio] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Sync mode with context
  useEffect(() => {
    setMode(authModalMode);
    setError(null);
    setSuccessMsg(null);
  }, [authModalMode, authModalOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccessMsg(null);

    try {
      if (mode === "register") {
        if (!name.trim() || !handle.trim() || !email.trim() || !password.trim()) {
          setError("Please fill in all required fields.");
          setLoading(false);
          return;
        }
        if (password.length < 6) {
          setError("Password must be at least 6 characters.");
          setLoading(false);
          return;
        }

        await register({
          name: name.trim(),
          handle: handle.trim(),
          email: email.trim(),
          password,
          role: role.trim() || "Fullstack Developer",
          bio: bio.trim() || "Building cool software on ProjectBuddy.",
        });

        setSuccessMsg("Account created successfully! Welcome aboard.");
        setTimeout(() => {
          closeAuthModal();
          resetForm();
        }, 800);
      } else {
        if (!email.trim() || !password.trim()) {
          setError("Please provide both email/handle and password.");
          setLoading(false);
          return;
        }

        await login({ loginIdentifier: email.trim(), password });
        setSuccessMsg("Signed in successfully! Welcome back.");
        setTimeout(() => {
          closeAuthModal();
          resetForm();
        }, 800);
      }
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("An error occurred during authentication.");
      }
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setName("");
    setHandle("");
    setEmail("");
    setPassword("");
    setBio("");
    setError(null);
    setSuccessMsg(null);
  };

  return (
    <Dialog open={authModalOpen} onOpenChange={closeAuthModal}>
      <DialogHeader onClose={closeAuthModal}>
        <div className="flex flex-col items-center gap-2">
          <ProjectBuddyLogo variant="full" size="md" />
          <p className="text-xs text-[var(--text-secondary)] font-normal text-center mt-1">
            {mode === "login"
              ? "Sign in to connect, share projects, and find collaborators"
              : "Create your developer profile to start networking"}
          </p>
        </div>
      </DialogHeader>

      {/* Tab Switcher */}
      <div className="flex border-b border-[var(--border-subtle)] px-6 pt-2">
        <button
          type="button"
          onClick={() => {
            setMode("login");
            setError(null);
          }}
          className={`flex-1 pb-3 text-sm font-medium transition-colors border-b-2 cursor-pointer ${
            mode === "login"
              ? "border-white text-white font-semibold"
              : "border-transparent text-[var(--text-secondary)] hover:text-white"
          }`}
        >
          <div className="flex items-center justify-center gap-2">
            <LogIn className="size-4" />
            <span>Sign In</span>
          </div>
        </button>
        <button
          type="button"
          onClick={() => {
            setMode("register");
            setError(null);
          }}
          className={`flex-1 pb-3 text-sm font-medium transition-colors border-b-2 cursor-pointer ${
            mode === "register"
              ? "border-white text-white font-semibold"
              : "border-transparent text-[var(--text-secondary)] hover:text-white"
          }`}
        >
          <div className="flex items-center justify-center gap-2">
            <UserPlus className="size-4" />
            <span>Create Account</span>
          </div>
        </button>
      </div>

      <div className="p-6 flex flex-col gap-4">
        {error && (
          <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs flex items-center gap-2.5">
            <AlertCircle className="size-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {successMsg && (
          <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs flex items-center gap-2.5">
            <CheckCircle2 className="size-4 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Regular Email/Password Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-3.5">
          {mode === "register" && (
            <>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-mono text-[var(--text-secondary)]">
                  Full Name <span className="text-white">*</span>
                </label>
                <Input
                  placeholder="e.g. Alex Rivers"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="h-10"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-mono text-[var(--text-secondary)]">
                  Username / Handle <span className="text-white">*</span>
                </label>
                <Input
                  placeholder="e.g. @arivers"
                  value={handle}
                  onChange={(e) => setHandle(e.target.value)}
                  required
                  className="h-10"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-mono text-[var(--text-secondary)]">
                  Role / Title
                </label>
                <Input
                  placeholder="e.g. AI Engineer, Fullstack Dev"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="h-10"
                />
              </div>
            </>
          )}

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-mono text-[var(--text-secondary)]">
              {mode === "register" ? "Email Address" : "Email or Handle"}{" "}
              <span className="text-white">*</span>
            </label>
            <Input
              type={mode === "register" ? "email" : "text"}
              placeholder={
                mode === "register"
                  ? "you@example.com"
                  : "you@example.com or @handle"
              }
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="h-10"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-mono text-[var(--text-secondary)]">
              Password <span className="text-white">*</span>
            </label>
            <Input
              type="password"
              placeholder="At least 6 characters"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="h-10"
            />
          </div>

          {mode === "register" && (
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-mono text-[var(--text-secondary)]">
                Short Bio
              </label>
              <Input
                placeholder="What are you interested in building?"
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                className="h-10"
              />
            </div>
          )}

          <div className="pt-1">
            <Button
              type="submit"
              disabled={loading}
              className="w-full h-11 bg-white hover:bg-neutral-200 text-black font-semibold rounded-xl shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="size-4 animate-spin text-black" />
                  <span>
                    {mode === "register"
                      ? "Creating Account..."
                      : "Signing In..."}
                  </span>
                </>
              ) : mode === "register" ? (
                <>
                  <Sparkles className="size-4" />
                  <span>Create Account</span>
                </>
              ) : (
                <>
                  <LogIn className="size-4" />
                  <span>Sign In</span>
                </>
              )}
            </Button>
          </div>
        </form>

        {/* Mode Toggle Link */}
        <div className="text-center pt-1">
          {mode === "register" ? (
            <p className="text-xs text-[var(--text-muted)]">
              Already have an account?{" "}
              <button
                type="button"
                onClick={() => setMode("login")}
                className="text-white hover:underline font-medium cursor-pointer"
              >
                Sign In
              </button>
            </p>
          ) : (
            <p className="text-xs text-[var(--text-muted)]">
              Don&apos;t have an account yet?{" "}
              <button
                type="button"
                onClick={() => setMode("register")}
                className="text-white hover:underline font-medium cursor-pointer"
              >
                Create Account
              </button>
            </p>
          )}
        </div>
      </div>
    </Dialog>
  );
}
