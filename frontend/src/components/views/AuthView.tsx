"use client";

import React, { useState, useEffect } from "react";
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
  ArrowLeft,
  Mail,
  ShieldCheck,
  RotateCcw,
  Code2,
  Users2,
  MessageSquare,
  Zap,
} from "lucide-react";

export function AuthView() {
  const { login, register, verifyOtp, resendOtp } = useAuth();

  // Mode: "login" | "register"
  const [mode, setMode] = useState<"login" | "register">("login");

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
  const [resendCooldown, setResendCooldown] = useState(0);
  const [verifyingOtp, setVerifyingOtp] = useState(false);
  const [resendingOtp, setResendingOtp] = useState(false);

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

        if (res.requireOtp) {
          setOtpPendingEmail(email.trim());
          setOtpStep(true);
          setOtpCode("");
          setResendCooldown(30);
          setSuccessMsg(`A 6-digit verification code was sent to ${email.trim()}`);
        } else {
          setSuccessMsg("Account created successfully! Welcome aboard.");
        }
      } else {
        if (!email.trim() || !password.trim()) {
          setError("Please provide both email/handle and password.");
          setLoading(false);
          return;
        }

        await login({ loginIdentifier: email.trim(), password });
        setSuccessMsg("Signed in successfully! Loading your feed...");
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
    if (!otpCode.trim() || otpCode.trim().length < 6) {
      setError("Please enter the complete 6-digit code.");
      return;
    }

    setVerifyingOtp(true);
    setError(null);
    setSuccessMsg(null);

    try {
      await verifyOtp({ email: otpPendingEmail, otp: otpCode.trim() });
      setSuccessMsg("Email verified! Your account is activated. Signing you in...");
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Invalid or expired verification code.");
      }
    } finally {
      setVerifyingOtp(false);
    }
  };

  const handleResendOtp = async () => {
    if (resendCooldown > 0 || !otpPendingEmail) return;
    setResendingOtp(true);
    setError(null);
    try {
      const res = await resendOtp({ email: otpPendingEmail });
      setResendCooldown(30);
      setSuccessMsg(res.message || "A new 6-digit code has been sent!");
    } catch (err: unknown) {
      if (err instanceof Error) setError(err.message);
      else setError("Failed to resend verification code.");
    } finally {
      setResendingOtp(false);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--bg-canvas)] text-white flex flex-col items-center justify-center p-4 sm:p-6 relative overflow-hidden select-none">
      {/* Background radial gradient glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-blue-500/10 blur-[130px] pointer-events-none rounded-full" />
      <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[250px] bg-emerald-500/10 blur-[140px] pointer-events-none rounded-full" />

      <div className="w-full max-w-md flex flex-col gap-6 relative z-10 my-auto">
        {/* Brand Header */}
        <div className="flex flex-col items-center text-center gap-2.5">
          <ProjectBuddyLogo variant="full" size="lg" />
          <p className="text-xs sm:text-sm text-[var(--text-secondary)] max-w-sm leading-relaxed mt-1">
            The developer network to build teams, share indie projects, and collaborate in real time.
          </p>
        </div>

        {/* Main Auth Card */}
        <div className="bg-[var(--bg-surface-low)] border border-[var(--border-subtle)] rounded-2xl shadow-2xl p-6 sm:p-7 backdrop-blur-xl transition-all">
          {/* Mode Switcher Tabs (Hidden during OTP step) */}
          {!otpStep && (
            <div className="flex bg-[var(--bg-surface-container)] p-1 rounded-xl border border-[var(--border-subtle)] mb-5">
              <button
                type="button"
                onClick={() => {
                  setMode("login");
                  setError(null);
                  setSuccessMsg(null);
                }}
                className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all flex items-center justify-center gap-2 cursor-pointer ${
                  mode === "login"
                    ? "bg-white text-black shadow-md"
                    : "text-zinc-400 hover:text-white"
                }`}
              >
                <LogIn className="size-3.5" />
                <span>Sign In</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setMode("register");
                  setError(null);
                  setSuccessMsg(null);
                }}
                className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all flex items-center justify-center gap-2 cursor-pointer ${
                  mode === "register"
                    ? "bg-white text-black shadow-md"
                    : "text-zinc-400 hover:text-white"
                }`}
              >
                <UserPlus className="size-3.5" />
                <span>Create Account</span>
              </button>
            </div>
          )}

          {/* Alerts: Error & Success */}
          {error && (
            <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs flex items-center gap-2.5 animate-in fade-in">
              <AlertCircle className="size-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {successMsg && (
            <div className="mb-4 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs flex items-center gap-2.5 animate-in fade-in">
              <CheckCircle2 className="size-4 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* OTP Verification Step */}
          {otpStep ? (
            <div className="flex flex-col gap-4 animate-in fade-in">
              <button
                type="button"
                onClick={() => {
                  setOtpStep(false);
                  setError(null);
                  setSuccessMsg(null);
                }}
                className="flex items-center gap-1.5 text-xs text-[var(--text-secondary)] hover:text-white transition-colors cursor-pointer w-fit"
              >
                <ArrowLeft className="size-3.5" />
                <span>Back to edit details</span>
              </button>

              <div className="text-center py-2">
                <div className="inline-flex p-3 rounded-2xl bg-white/10 border border-white/20 text-white mb-2 shadow-lg">
                  <Mail className="size-6 text-white" />
                </div>
                <h3 className="text-sm font-semibold text-white">Check your Inbox</h3>
                <p className="text-xs text-[var(--text-secondary)] max-w-xs mx-auto mt-1 leading-relaxed">
                  We sent a 6-digit verification code to{" "}
                  <span className="text-white font-mono font-medium">{otpPendingEmail}</span>.
                </p>
              </div>

              <form onSubmit={handleVerifyOtp} className="flex flex-col gap-4 mt-1">
                <div className="flex flex-col items-center gap-2">
                  <label className="text-xs font-mono text-[var(--text-secondary)]">
                    6-Digit Verification Code
                  </label>
                  <input
                    type="text"
                    maxLength={6}
                    autoFocus
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ""))}
                    placeholder="------"
                    className="w-52 text-center text-2xl font-mono font-bold tracking-[8px] h-12 rounded-xl bg-[var(--bg-surface-container)] border border-[var(--border-subtle)] text-white focus:outline-none focus:border-white focus:ring-2 focus:ring-white/20 transition-all placeholder:text-[var(--text-muted)]"
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
                      <CheckCircle2 className="size-4 text-black" />
                      <span>Verify & Enter ProjectBuddy</span>
                    </>
                  )}
                </Button>

                <div className="flex items-center justify-between text-xs pt-1 px-1">
                  <span className="text-[var(--text-muted)]">Didn&apos;t receive the code?</span>
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
            /* Standard Login / Registration Form */
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
                      className="h-10 text-xs sm:text-sm bg-[var(--bg-surface-container)]"
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
                      className="h-10 text-xs sm:text-sm bg-[var(--bg-surface-container)]"
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
                      className="h-10 text-xs sm:text-sm bg-[var(--bg-surface-container)]"
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
                  className="h-10 text-xs sm:text-sm bg-[var(--bg-surface-container)]"
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
                  className="h-10 text-xs sm:text-sm bg-[var(--bg-surface-container)]"
                />
              </div>

              {mode === "register" && (
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-mono text-[var(--text-secondary)]">
                    Short Bio
                  </label>
                  <Input
                    placeholder="What are you building or interested in?"
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    className="h-10 text-xs sm:text-sm bg-[var(--bg-surface-container)]"
                  />
                </div>
              )}

              <div className="pt-2">
                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full h-11 bg-white hover:bg-neutral-200 text-black font-semibold rounded-xl shadow-lg flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
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
          )}

          {/* Toggle bottom link */}
          {!otpStep && (
            <div className="text-center pt-4 border-t border-[var(--border-subtle)] mt-4">
              {mode === "register" ? (
                <p className="text-xs text-[var(--text-muted)]">
                  Already have an account?{" "}
                  <button
                    type="button"
                    onClick={() => {
                      setMode("login");
                      setError(null);
                      setSuccessMsg(null);
                    }}
                    className="text-white hover:underline font-semibold cursor-pointer"
                  >
                    Sign In
                  </button>
                </p>
              ) : (
                <p className="text-xs text-[var(--text-muted)]">
                  New to ProjectBuddy?{" "}
                  <button
                    type="button"
                    onClick={() => {
                      setMode("register");
                      setError(null);
                      setSuccessMsg(null);
                    }}
                    className="text-white hover:underline font-semibold cursor-pointer"
                  >
                    Create an account
                  </button>
                </p>
              )}
            </div>
          )}
        </div>

        {/* Highlight Feature Badges below card */}
        <div className="grid grid-cols-3 gap-2.5 text-center">
          <div className="p-2.5 rounded-xl bg-white/[0.03] border border-white/5 flex flex-col items-center gap-1">
            <Users2 className="size-4 text-[#1d9bf0]" />
            <span className="text-[11px] font-semibold text-white">Find Teams</span>
            <span className="text-[10px] text-[var(--text-muted)]">Join active projects</span>
          </div>
          <div className="p-2.5 rounded-xl bg-white/[0.03] border border-white/5 flex flex-col items-center gap-1">
            <MessageSquare className="size-4 text-emerald-400" />
            <span className="text-[11px] font-semibold text-white">Live Chat</span>
            <span className="text-[10px] text-[var(--text-muted)]">Direct & team DMs</span>
          </div>
          <div className="p-2.5 rounded-xl bg-white/[0.03] border border-white/5 flex flex-col items-center gap-1">
            <Zap className="size-4 text-amber-400" />
            <span className="text-[11px] font-semibold text-white">Synergy Match</span>
            <span className="text-[10px] text-[var(--text-muted)]">Match tech stacks</span>
          </div>
        </div>
      </div>
    </div>
  );
}
