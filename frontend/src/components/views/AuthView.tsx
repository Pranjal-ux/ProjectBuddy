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
  Users2,
  MessageSquare,
  Zap,
  Mail,
  RotateCcw,
  ArrowLeft,
  KeyRound,
  ExternalLink,
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
  const [otpPreview, setOtpPreview] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
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

        if (res?.requireOtp) {
          setOtpPendingEmail(email.trim());
          setOtpStep(true);
          setOtpCode("");
          setResendCooldown(60);
          if (res.otpPreview) {
            setOtpPreview(res.otpPreview);
          }
          if (res.previewUrl) {
            setPreviewUrl(res.previewUrl);
          }
          setSuccessMsg(res.message || "A 6-digit verification code has been sent.");
          return;
        }

        setSuccessMsg("Account created successfully! Loading your feed...");
      } else {
        if (!email.trim() || !password.trim()) {
          setError("Please provide both email/handle and password.");
          setLoading(false);
          return;
        }

        const res = await login({ loginIdentifier: email.trim(), password });
        if (res?.requireOtp) {
          setOtpPendingEmail(res.email || email.trim());
          setOtpStep(true);
          setOtpCode("");
          setResendCooldown(60);
          if (res.otpPreview) {
            setOtpPreview(res.otpPreview);
          }
          setSuccessMsg(res.message || "Please enter the OTP verification code sent to your email.");
          return;
        }

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
      setSuccessMsg("Email verified successfully! Loading your workspace...");
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

  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const faqs = [
    {
      q: "What is ProjectBuddy (projectbuddyapp)?",
      a: "ProjectBuddy is the leading developer collaboration platform where software engineers, designers, and creators discover trending open-source projects, recruit co-founders, showcase code snippets, and collaborate in real-time.",
    },
    {
      q: "How can I find developers and teammates for my project?",
      a: "Publish your project with stack requirements, open roles (e.g. Frontend, Backend, AI/ML), and project description. Interested developers can browse your initiative and request to join with a single click.",
    },
    {
      q: "Is ProjectBuddy free for developers?",
      a: "Yes, ProjectBuddy is 100% free to explore projects, message teammates, showcase code, and build software together.",
    },
    {
      q: "How does tech stack synergy matching work?",
      a: "ProjectBuddy matches your skills (e.g. Next.js, TypeScript, Python, Rust) against open project requirements to calculate high-fidelity synergy match scores.",
    },
  ];

  return (
    <div className="min-h-screen bg-[var(--bg-canvas)] text-white flex flex-col justify-center items-center p-4 sm:p-6 lg:p-10 relative overflow-hidden select-none w-full">
      {/* Background radial gradient glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-blue-500/10 blur-[130px] pointer-events-none rounded-full" />
      <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[250px] bg-emerald-500/10 blur-[140px] pointer-events-none rounded-full" />
      <div className="absolute top-1/3 left-1/6 w-[350px] h-[250px] bg-purple-500/10 blur-[150px] pointer-events-none rounded-full" />

      <div className="w-full max-w-6xl 2xl:max-w-7xl mx-auto my-auto relative z-10 py-6 sm:py-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          {/* Left Column: Semantic SEO Headline, Value Prop & Live Stats (Large Screens) */}
          <div className="lg:col-span-7 flex flex-col gap-6 text-left">
            <div className="flex items-center gap-3">
              <ProjectBuddyLogo variant="full" size="lg" />
              <span className="hidden sm:inline-flex text-[11px] font-mono font-medium px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                v0.1 Public Beta
              </span>
            </div>

            {/* Semantic SEO H1 Tag */}
            <div className="flex flex-col gap-3">
              <h1 className="text-2xl sm:text-3xl lg:text-4xl 2xl:text-5xl font-extrabold tracking-tight text-white leading-tight">
                The Developer Network for{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-zinc-200 to-zinc-400">
                  Open Source & Project Collaboration
                </span>
              </h1>
              <p className="text-sm sm:text-base text-[var(--text-secondary)] max-w-xl leading-relaxed">
                Connect with verified engineers, discover trending open-source initiatives, recruit teammates for your hackathons and indie products, and showcase code in high-contrast developer aesthetic.
              </p>
            </div>

            {/* Live Developer Network Metrics */}
            <div className="grid grid-cols-3 gap-3 max-w-lg">
              <div className="p-3 sm:p-4 rounded-xl bg-[var(--bg-surface-low)] border border-[var(--border-subtle)] flex flex-col gap-0.5">
                <span className="text-lg sm:text-2xl font-bold font-mono text-white">5,400+</span>
                <span className="text-[11px] text-[var(--text-muted)]">Verified Devs</span>
              </div>
              <div className="p-3 sm:p-4 rounded-xl bg-[var(--bg-surface-low)] border border-[var(--border-subtle)] flex flex-col gap-0.5">
                <span className="text-lg sm:text-2xl font-bold font-mono text-white">1,280+</span>
                <span className="text-[11px] text-[var(--text-muted)]">Open Projects</span>
              </div>
              <div className="p-3 sm:p-4 rounded-xl bg-[var(--bg-surface-low)] border border-[var(--border-subtle)] flex flex-col gap-0.5">
                <span className="text-lg sm:text-2xl font-bold font-mono text-emerald-400">98%</span>
                <span className="text-[11px] text-[var(--text-muted)]">Synergy Match</span>
              </div>
            </div>

            {/* Developer FAQ Accordion for Google Crawlers and Users */}
            <div className="hidden md:flex flex-col gap-2 pt-2 max-w-xl">
              <span className="text-xs font-mono text-[var(--text-muted)] uppercase tracking-wider">
                Frequently Asked Questions
              </span>
              <div className="flex flex-col gap-2">
                {faqs.map((faq, idx) => (
                  <div
                    key={idx}
                    className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface-low)] overflow-hidden transition-colors"
                  >
                    <button
                      type="button"
                      onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                      className="w-full p-3 text-left flex items-center justify-between gap-3 text-xs font-semibold text-white hover:text-emerald-400 cursor-pointer"
                    >
                      <span>{faq.q}</span>
                      <span className="text-zinc-400 shrink-0 text-sm">
                        {openFaq === idx ? "−" : "+"}
                      </span>
                    </button>
                    {openFaq === idx && (
                      <div className="px-3 pb-3 text-xs text-[var(--text-secondary)] leading-relaxed border-t border-[var(--border-subtle)]/50 pt-2">
                        {faq.a}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column: Sleek Auth Form Box */}
          <div className="lg:col-span-5 w-full max-w-md mx-auto flex flex-col gap-4">
            {/* Main Auth Card */}
            <div className="bg-[var(--bg-surface-low)] border border-[var(--border-subtle)] rounded-2xl shadow-2xl p-6 sm:p-7 backdrop-blur-xl transition-all">
          {/* Mode Switcher Tabs (hidden in OTP step) */}
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

          {otpStep ? (
            /* ── OTP Verification View ── */
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-2.5 p-3 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-300 text-xs">
                <Mail className="size-4 shrink-0 text-blue-400" />
                <span>
                  We sent a 6-digit verification code to{" "}
                  <strong className="text-white font-mono">{otpPendingEmail}</strong>.
                </span>
              </div>


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
                  className="w-full h-11 bg-white hover:bg-neutral-200 text-black font-semibold rounded-xl shadow-lg flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
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
            /* ── Direct Login / Registration Form ── */
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
  </div>
</div>
  );
}
