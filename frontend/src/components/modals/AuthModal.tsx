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
  Mail,
  RotateCcw,
  ArrowLeft,
  KeyRound,
} from "lucide-react";

export function AuthModal() {
  const {
    authModalOpen,
    authModalMode,
    closeAuthModal,
    login,
    register,
    verifyOtp,
    resendOtp,
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

  // OTP Verification state
  const [otpStep, setOtpStep] = useState(false);
  const [otpCode, setOtpCode] = useState("");
  const [otpPendingEmail, setOtpPendingEmail] = useState("");
  const [otpPreview, setOtpPreview] = useState<string | null>(null);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [verifyingOtp, setVerifyingOtp] = useState(false);
  const [resendingOtp, setResendingOtp] = useState(false);

  // Sync mode with context
  useEffect(() => {
    setMode(authModalMode);
    setError(null);
    setSuccessMsg(null);
    setOtpStep(false);
    setOtpCode("");
    setOtpPreview(null);
  }, [authModalMode, authModalOpen]);

  // Resend cooldown timer
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setInterval(() => {
      setResendCooldown((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [resendCooldown]);

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

        const res = await register({
          name: name.trim(),
          handle: handle.trim(),
          email: email.trim(),
          password,
          role: role.trim() || "Fullstack Developer",
          bio: bio.trim() || "Building cool software on ProjectBuddy.",
        });

        if (res?.requireOtp) {
          setOtpPendingEmail(email.trim());
          setOtpStep(true);
          setOtpCode("");
          setResendCooldown(60);
          if (res.otpPreview) {
            setOtpPreview(res.otpPreview);
          }
          setSuccessMsg(res.message || "A 6-digit verification code has been sent.");
          return;
        }

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

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanCode = otpCode.trim();
    if (!cleanCode || cleanCode.length < 6) {
      setError("Please enter the complete 6-digit verification code.");
      return;
    }

    setVerifyingOtp(true);
    setError(null);
    setSuccessMsg(null);

    try {
      await verifyOtp({ email: otpPendingEmail, otp: cleanCode });
      setSuccessMsg("Email verified successfully! Welcome to ProjectBuddy.");
      setTimeout(() => {
        closeAuthModal();
        resetForm();
      }, 800);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Invalid or expired code. Please try again.");
      }
    } finally {
      setVerifyingOtp(false);
    }
  };

  const handleResendOtp = async () => {
    if (resendCooldown > 0 || !otpPendingEmail) return;
    setResendingOtp(true);
    setError(null);
    setSuccessMsg(null);

    try {
      const res = await resendOtp({ email: otpPendingEmail });
      setResendCooldown(60);
      if (res?.otpPreview) {
        setOtpPreview(res.otpPreview);
      }
      setSuccessMsg(res?.message || `New verification code sent to ${otpPendingEmail}`);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Failed to resend code. Please try again.");
      }
    } finally {
      setResendingOtp(false);
    }
  };

  const resetForm = () => {
    setName("");
    setHandle("");
    setEmail("");
    setPassword("");
    setBio("");
    setOtpStep(false);
    setOtpCode("");
    setOtpPendingEmail("");
    setOtpPreview(null);
    setError(null);
    setSuccessMsg(null);
  };

  return (
    <Dialog open={authModalOpen} onOpenChange={closeAuthModal}>
      <DialogHeader onClose={closeAuthModal}>
        <div className="flex flex-col items-center gap-2">
          <ProjectBuddyLogo variant="full" size="md" />
          <p className="text-xs text-[var(--text-secondary)] font-normal text-center mt-1">
            {otpStep
              ? `Enter the 6-digit code sent to ${otpPendingEmail}`
              : mode === "login"
              ? "Sign in to connect, share projects, and find collaborators"
              : "Create your developer profile to start networking"}
          </p>
        </div>
      </DialogHeader>

      {/* Tab Switcher (only shown when not in OTP step) */}
      {!otpStep && (
        <div className="flex border-b border-[var(--border-subtle)] px-6 pt-2">
          <button
            type="button"
            onClick={() => {
              setMode("login");
              setError(null);
              setSuccessMsg(null);
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
              setSuccessMsg(null);
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
      )}

      {/* Main Content Area */}
      {otpStep ? (
        /* ── OTP Verification View ── */
        <div className="p-6 flex flex-col gap-4">
          <div className="flex items-center gap-2.5 p-3 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-300 text-xs">
            <Mail className="size-4 shrink-0 text-blue-400" />
            <span>
              We sent a 6-digit code to{" "}
              <strong className="text-white font-mono">{otpPendingEmail}</strong>. Please check your inbox and spam folder.
            </span>
          </div>

          {otpPreview && (
            <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <KeyRound className="size-4 shrink-0 text-amber-400" />
                <span>
                  Test Mode OTP: <strong className="font-mono text-white text-sm">{otpPreview}</strong>
                </span>
              </div>
              <button
                type="button"
                onClick={() => setOtpCode(otpPreview)}
                className="underline text-amber-200 hover:text-white font-medium cursor-pointer text-xs"
              >
                Auto-fill
              </button>
            </div>
          )}

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

          <form onSubmit={handleVerifyOtp} className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <label className="text-xs font-mono text-[var(--text-secondary)] text-center">
                Enter 6-Digit Code
              </label>
              <Input
                type="text"
                inputMode="numeric"
                autoComplete="one-time-code"
                maxLength={6}
                placeholder="· · · · · ·"
                value={otpCode}
                onChange={(e) => {
                  const val = e.target.value.replace(/\D/g, "").slice(0, 6);
                  setOtpCode(val);
                }}
                autoFocus
                className="h-12 text-center font-mono text-2xl tracking-[0.4em] font-bold bg-[var(--bg-surface-container)] focus:border-white"
              />
            </div>

            <Button
              type="submit"
              disabled={verifyingOtp || otpCode.length < 6}
              className="w-full h-11 bg-white hover:bg-neutral-200 text-black font-semibold rounded-xl shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {verifyingOtp ? (
                <>
                  <Loader2 className="size-4 animate-spin text-black" />
                  <span>Verifying Code...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="size-4" />
                  <span>Verify & Activate Account</span>
                </>
              )}
            </Button>

            <div className="flex items-center justify-between text-xs pt-1 px-1">
              <button
                type="button"
                onClick={() => {
                  setOtpStep(false);
                  setError(null);
                  setSuccessMsg(null);
                }}
                className="text-[var(--text-muted)] hover:text-white flex items-center gap-1 cursor-pointer"
              >
                <ArrowLeft className="size-3" />
                <span>Change Email / Back</span>
              </button>

              <button
                type="button"
                disabled={resendCooldown > 0 || resendingOtp}
                onClick={handleResendOtp}
                className="text-white hover:underline font-medium flex items-center gap-1 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {resendingOtp ? (
                  <Loader2 className="size-3 animate-spin" />
                ) : (
                  <RotateCcw className="size-3" />
                )}
                <span>
                  {resendCooldown > 0
                    ? `Resend in ${resendCooldown}s`
                    : "Resend Code"}
                </span>
              </button>
            </div>
          </form>
        </div>
      ) : (
        /* ── Standard Login / Register Form ── */
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
                    <span>Create Account & Send Code</span>
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
      )}
    </Dialog>
  );
}
