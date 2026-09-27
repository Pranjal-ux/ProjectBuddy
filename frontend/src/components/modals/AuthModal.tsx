"use client";

import React, { useState, useEffect } from "react";
import { Dialog, DialogHeader } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/lib/api";
import {
  LogIn,
  UserPlus,
  AlertCircle,
  Loader2,
  CheckCircle2,
  Sparkles,
  ArrowLeft,
  ChevronRight,
  User as UserIcon,
  Mail,
  ShieldCheck,
  RotateCcw,
} from "lucide-react";

const DEV_GOOGLE_ACCOUNTS = [
  {
    name: "Pranjal Shukla",
    email: "pranjalshukla@gmail.com",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80",
    role: "Lead Fullstack Architect",
  },
  {
    name: "Alex Chen",
    email: "alex.chen.dev@gmail.com",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80",
    role: "Senior AI Engineer",
  },
  {
    name: "Sarah Connor",
    email: "sarah.connor@gmail.com",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=120&auto=format&fit=crop&q=80",
    role: "Cloud Systems Lead",
  },
];

declare global {
  interface Window {
    google?: {
      accounts?: {
        id?: {
          initialize: (config: any) => void;
          prompt: (notification?: any) => void;
          renderButton: (parent: HTMLElement, options: any) => void;
          disableAutoSelect: () => void;
        };
        oauth2?: {
          initCodeClient: (config: any) => {
            requestCode: () => void;
          };
          initTokenClient: (config: any) => {
            requestAccessToken: (overrideConfig?: any) => void;
          };
        };
      };
    };
  }
}

function GoogleIcon({ className = "size-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24">
      <path
        fill="#4285F4"
        d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"
      />
      <path
        fill="#34A853"
        d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"
      />
      <path
        fill="#FBBC05"
        d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
      />
      <path
        fill="#EA4335"
        d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
      />
    </svg>
  );
}

export function AuthModal() {
  const {
    authModalOpen,
    authModalMode,
    closeAuthModal,
    login,
    register,
    verifyOtp,
    resendOtp,
    googleLogin,
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
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // OTP Verification state
  const [otpStep, setOtpStep] = useState(false);
  const [otpCode, setOtpCode] = useState("");
  const [otpPendingEmail, setOtpPendingEmail] = useState("");
  const [resendCooldown, setResendCooldown] = useState(0);
  const [verifyingOtp, setVerifyingOtp] = useState(false);
  const [resendingOtp, setResendingOtp] = useState(false);

  // Google Account Chooser (Dev / Immediate Testing Mode)
  const [showGoogleChooser, setShowGoogleChooser] = useState(false);
  const [customName, setCustomName] = useState("");
  const [customEmail, setCustomEmail] = useState("");
  const [showCustomInput, setShowCustomInput] = useState(false);
  const [activeGoogleClientId, setActiveGoogleClientId] = useState<string>(
    process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || ""
  );

  // Auto-fetch Google Client ID from backend if not defined in frontend env
  useEffect(() => {
    if (process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID) {
      setActiveGoogleClientId(process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID);
      return;
    }
    api.getGoogleClientId().then((id) => {
      if (id) setActiveGoogleClientId(id);
    });
  }, [authModalOpen]);

  // Sync mode with context
  useEffect(() => {
    setMode(authModalMode);
    setError(null);
    setSuccessMsg(null);
    setGoogleLoading(false);
    setShowGoogleChooser(false);
    setShowCustomInput(false);
    setOtpStep(false);
    setOtpCode("");
  }, [authModalMode, authModalOpen]);

  // Resend cooldown timer
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setInterval(() => {
      setResendCooldown((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [resendCooldown]);

  // Load official Google Identity Services (GIS) library
  useEffect(() => {
    const googleClientId =
      activeGoogleClientId || process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

    const setupGoogleGsi = () => {
      if (googleClientId && window.google?.accounts?.id) {
        window.google.accounts.id.initialize({
          client_id: googleClientId,
          callback: async (res: any) => {
            if (res.credential) {
              await handleGoogleCredential(res.credential);
            }
          },
          auto_select: false,
          cancel_on_tap_outside: true,
        });
      }
    };

    if (!document.getElementById("google-gsi-client")) {
      const script = document.createElement("script");
      script.id = "google-gsi-client";
      script.src = "https://accounts.google.com/gsi/client";
      script.async = true;
      script.defer = true;
      script.onload = setupGoogleGsi;
      document.body.appendChild(script);
    } else {
      setupGoogleGsi();
    }
  }, [activeGoogleClientId]);

  const handleGoogleCredential = async (credential: string) => {
    setGoogleLoading(true);
    setError(null);
    try {
      await googleLogin({ credential, mode });
      setSuccessMsg(
        mode === "register"
          ? "Account created and signed in with Google!"
          : "Signed in with Google successfully!"
      );
      setTimeout(() => {
        closeAuthModal();
        resetForm();
      }, 1000);
    } catch (err: unknown) {
      if (err instanceof Error) setError(err.message);
      else setError("Failed to authenticate with Google");
    } finally {
      setGoogleLoading(false);
    }
  };

  const handleSelectDevAccount = async (account: {
    name: string;
    email: string;
    avatar?: string;
  }) => {
    setGoogleLoading(true);
    setError(null);
    try {
      await googleLogin({
        mode,
        devUser: {
          email: account.email,
          name: account.name,
          picture: account.avatar || "",
          sub: `google_user_${account.email.replace(/[^a-zA-Z0-9]/g, "_")}`,
        },
      });
      setSuccessMsg(`Welcome, ${account.name}! Signed in with Google.`);
      setTimeout(() => {
        closeAuthModal();
        setShowGoogleChooser(false);
        resetForm();
      }, 900);
    } catch (err: unknown) {
      if (err instanceof Error) setError(err.message);
      else setError("Failed to authenticate with Google");
    } finally {
      setGoogleLoading(false);
    }
  };

  const handleGoogleAuthClick = () => {
    const googleClientId =
      activeGoogleClientId || process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

    // If client ID is missing in environment variables and backend, open the interactive Google Account Chooser
    if (!googleClientId) {
      setShowGoogleChooser(true);
      return;
    }

    setGoogleLoading(true);
    setError(null);

    // 1. Try Google Identity Services OAuth 2.0 Token Client (Instant token & userinfo flow)
    if (window.google?.accounts?.oauth2?.initTokenClient) {
      try {
        const tokenClient = window.google.accounts.oauth2.initTokenClient({
          client_id: googleClientId,
          scope: "openid profile email",
          callback: async (response: any) => {
            if (response.access_token) {
              try {
                await googleLogin({ accessToken: response.access_token, mode });
                setSuccessMsg(
                  mode === "register"
                    ? "Account created and signed in with Google!"
                    : "Signed in with Google successfully!"
                );
                setTimeout(() => {
                  closeAuthModal();
                  resetForm();
                }, 1000);
              } catch (err: unknown) {
                if (err instanceof Error) setError(err.message);
                else setError("Failed to authenticate with Google");
              } finally {
                setGoogleLoading(false);
              }
            } else if (response.error) {
              setGoogleLoading(false);
              if (response.error === "popup_closed_by_user") {
                setError("Google sign-in popup was closed.");
              } else {
                setError(`Google authentication failed: ${response.error}`);
              }
            }
          },
          error_callback: (err: any) => {
            setGoogleLoading(false);
            if (err?.type === "popup_closed") {
              setError("Google sign-in was closed before completing.");
            } else if (err?.message) {
              setError(`Google authentication failed: ${err.message}`);
            }
          },
        });
        tokenClient.requestAccessToken({ prompt: "select_account" });
        return;
      } catch (clientErr) {
        console.warn("initTokenClient error, falling back to codeClient:", clientErr);
      }
    }

    // 2. Fallback to Google Identity Services Code Client
    if (window.google?.accounts?.oauth2?.initCodeClient) {
      try {
        const codeClient = window.google.accounts.oauth2.initCodeClient({
          client_id: googleClientId,
          scope: "openid profile email",
          ux_mode: "popup",
          callback: async (response: any) => {
            if (response.code) {
              try {
                await googleLogin({ code: response.code, mode });
                setSuccessMsg(
                  mode === "register"
                    ? "Account created and signed in with Google!"
                    : "Signed in with Google successfully!"
                );
                setTimeout(() => {
                  closeAuthModal();
                  resetForm();
                }, 1000);
              } catch (err: unknown) {
                if (err instanceof Error) setError(err.message);
                else setError("Failed to authenticate with Google");
              } finally {
                setGoogleLoading(false);
              }
            }
          },
          error_callback: (err: any) => {
            setGoogleLoading(false);
            if (err?.type === "popup_closed") {
              setError("Google sign-in was closed before completing.");
            } else if (err?.message) {
              setError(`Google authentication failed: ${err.message}`);
            }
          },
        });
        codeClient.requestCode();
        return;
      } catch (codeErr) {
        console.warn("initCodeClient error, trying GIS prompt:", codeErr);
      }
    }

    // 2. Fallback to Google Identity Services ID Token One-Tap / Prompt
    if (window.google?.accounts?.id) {
      window.google.accounts.id.prompt((notification: any) => {
        if (notification.isNotDisplayed()) {
          setGoogleLoading(false);
          setError(
            "Google sign-in popup was blocked or suppressed. Please ensure popups and third-party cookies are allowed for localhost."
          );
        } else if (notification.isSkippedMoment()) {
          setGoogleLoading(false);
        }
      });
    } else {
      setGoogleLoading(false);
      setError("Google authentication service is still initializing. Please try again in a moment.");
    }
  };

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
          setTimeout(() => {
            closeAuthModal();
            resetForm();
          }, 1200);
        }
      } else {
        if (!email.trim() || !password.trim()) {
          setError("Please enter your email/handle and password.");
          setLoading(false);
          return;
        }

        await login({
          loginIdentifier: email.trim(),
          password,
        });

        setSuccessMsg("Logged in successfully! Redirecting...");
        setTimeout(() => {
          closeAuthModal();
          resetForm();
        }, 1200);
      }
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("An unexpected error occurred. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otpCode || otpCode.trim().length < 6) {
      setError("Please enter the full 6-digit verification code.");
      return;
    }

    setVerifyingOtp(true);
    setError(null);
    setSuccessMsg(null);

    try {
      await verifyOtp({
        email: otpPendingEmail,
        otp: otpCode.trim(),
      });

      setSuccessMsg("Email verified successfully! Welcome to ProjectBuddy.");
      setTimeout(() => {
        closeAuthModal();
        resetForm();
      }, 1200);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Failed to verify code. Please try again.");
      }
    } finally {
      setVerifyingOtp(false);
    }
  };

  const handleResendOtp = async () => {
    if (resendCooldown > 0 || resendingOtp) return;
    setResendingOtp(true);
    setError(null);
    try {
      await resendOtp({ email: otpPendingEmail });
      setSuccessMsg(`New verification code sent to ${otpPendingEmail}`);
      setResendCooldown(30);
    } catch (err: unknown) {
      if (err instanceof Error) setError(err.message);
      else setError("Failed to resend code");
    } finally {
      setResendingOtp(false);
    }
  };

  const resetForm = () => {
    setName("");
    setHandle("");
    setEmail("");
    setPassword("");
    setRole("Fullstack Developer");
    setBio("");
    setError(null);
    setSuccessMsg(null);
    setGoogleLoading(false);
    setOtpStep(false);
    setOtpCode("");
    setOtpPendingEmail("");
  };

  return (
    <Dialog open={authModalOpen} onOpenChange={closeAuthModal}>
      <DialogHeader onClose={closeAuthModal}>
        <div className="flex flex-col gap-0.5">
          <div className="flex items-center gap-2">
            {otpStep ? (
              <ShieldCheck className="size-5 text-indigo-400" />
            ) : mode === "register" ? (
              <UserPlus className="size-5 text-indigo-400" />
            ) : (
              <LogIn className="size-5 text-indigo-400" />
            )}
            <span>
              {otpStep
                ? "Verify Your Email Address"
                : mode === "register"
                ? "Create Developer Account"
                : "Sign In to ProjectBuddy"}
            </span>
          </div>
          <span className="text-xs text-[var(--text-secondary)] font-normal">
            {otpStep
              ? `Enter the 6-digit code sent to ${otpPendingEmail}`
              : mode === "register"
              ? "Join thousands of builders collaborating on high-impact projects."
              : "Welcome back! Enter your credentials to access your account."}
          </span>
        </div>
      </DialogHeader>

      {/* Mode Tabs (Only when not in Google Account Chooser and not in OTP Step) */}
      {!showGoogleChooser && !otpStep && (
        <div className="flex border-b border-[var(--border-subtle)] px-6 pt-2">
          <button
            type="button"
            onClick={() => {
              setMode("login");
              setError(null);
            }}
            className={`flex-1 pb-3 text-sm font-medium transition-colors border-b-2 cursor-pointer ${
              mode === "login"
                ? "border-indigo-500 text-white"
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
                ? "border-indigo-500 text-white"
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

      {otpStep ? (
        <div className="p-6 flex flex-col gap-4 animate-in fade-in-50">
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
            <div className="inline-flex p-3 rounded-2xl bg-indigo-600/10 border border-indigo-500/20 text-indigo-400 mb-2">
              <Mail className="size-7 text-indigo-400" />
            </div>
            <h3 className="text-base font-semibold text-white">Check your Inbox</h3>
            <p className="text-xs text-[var(--text-secondary)] max-w-xs mx-auto mt-1 leading-relaxed">
              We sent a 6-digit verification code to <span className="text-indigo-300 font-mono font-medium">{otpPendingEmail}</span>. Enter it below to activate your account.
            </p>
          </div>

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
                className="w-52 text-center text-2xl font-mono font-bold tracking-[8px] h-12 rounded-xl bg-[var(--bg-surface-container)] border border-[var(--border-subtle)] text-white focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/40 transition-all placeholder:text-[var(--text-muted)]"
              />
            </div>

            <Button
              type="submit"
              disabled={verifyingOtp || otpCode.length < 6}
              className="w-full h-11 bg-indigo-600 hover:bg-indigo-500 text-white font-medium rounded-xl shadow-lg shadow-indigo-600/25 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {verifyingOtp ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  <span>Verifying Code...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="size-4" />
                  <span>Verify Email & Create Account</span>
                </>
              )}
            </Button>

            <div className="flex items-center justify-between text-xs pt-1 px-1">
              <span className="text-[var(--text-muted)]">Didn&apos;t receive the code?</span>
              <button
                type="button"
                disabled={resendCooldown > 0 || resendingOtp}
                onClick={handleResendOtp}
                className="text-indigo-400 hover:text-indigo-300 font-medium flex items-center gap-1 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
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
      ) : showGoogleChooser ? (
        <div className="p-6 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={() => {
                setShowGoogleChooser(false);
                setShowCustomInput(false);
                setError(null);
              }}
              className="flex items-center gap-1.5 text-xs text-[var(--text-secondary)] hover:text-white transition-colors cursor-pointer"
            >
              <ArrowLeft className="size-3.5" />
              <span>Back to standard login</span>
            </button>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              1-Click Testing Mode
            </span>
          </div>

          <div className="text-center py-1">
            <div className="inline-flex p-3 rounded-2xl bg-white/5 border border-white/10 mb-2">
              <GoogleIcon className="size-7" />
            </div>
            <h3 className="text-base font-semibold text-white">Choose a Google account</h3>
            <p className="text-xs text-[var(--text-secondary)]">
              to continue to <strong className="text-white">ProjectBuddy</strong>
            </p>
          </div>

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

          {/* List of simulated Google accounts */}
          <div className="flex flex-col gap-2">
            {DEV_GOOGLE_ACCOUNTS.map((acc) => (
              <button
                key={acc.email}
                type="button"
                disabled={googleLoading}
                onClick={() => handleSelectDevAccount(acc)}
                className="w-full p-3 rounded-xl bg-[var(--bg-surface-container)] hover:bg-[var(--bg-surface-high)] border border-[var(--border-subtle)] hover:border-indigo-500/40 transition-all flex items-center justify-between text-left group cursor-pointer disabled:opacity-50"
              >
                <div className="flex items-center gap-3">
                  <img
                    src={acc.avatar}
                    alt={acc.name}
                    className="size-9 rounded-full object-cover border border-white/10"
                  />
                  <div>
                    <div className="text-xs font-semibold text-white group-hover:text-indigo-300 transition-colors">
                      {acc.name}
                    </div>
                    <div className="text-[11px] text-[var(--text-muted)] font-mono">
                      {acc.email}
                    </div>
                  </div>
                </div>
                {googleLoading ? (
                  <Loader2 className="size-4 animate-spin text-indigo-400" />
                ) : (
                  <ChevronRight className="size-4 text-[var(--text-muted)] group-hover:text-white group-hover:translate-x-0.5 transition-all" />
                )}
              </button>
            ))}

            {/* Custom Google account toggle */}
            {!showCustomInput ? (
              <button
                type="button"
                onClick={() => setShowCustomInput(true)}
                className="w-full p-3 rounded-xl bg-transparent hover:bg-[var(--bg-surface-container)] border border-dashed border-[var(--border-subtle)] hover:border-slate-500 text-xs text-[var(--text-secondary)] hover:text-white transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <UserIcon className="size-3.5" />
                <span>Use another Google account</span>
              </button>
            ) : (
              <div className="p-3.5 rounded-xl bg-[var(--bg-surface-container)] border border-[var(--border-subtle)] flex flex-col gap-2.5">
                <span className="text-xs font-medium text-white">Enter any Google email to test:</span>
                <Input
                  placeholder="Your Name (e.g. John Doe)"
                  value={customName}
                  onChange={(e) => setCustomName(e.target.value)}
                  className="h-9 text-xs"
                />
                <Input
                  type="email"
                  placeholder="Google Email (e.g. user@gmail.com)"
                  value={customEmail}
                  onChange={(e) => setCustomEmail(e.target.value)}
                  className="h-9 text-xs"
                />
                <div className="flex items-center gap-2 pt-1">
                  <Button
                    type="button"
                    disabled={!customEmail.trim() || googleLoading}
                    onClick={() =>
                      handleSelectDevAccount({
                        name: customName.trim() || customEmail.split("@")[0],
                        email: customEmail.trim(),
                        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(customEmail)}`,
                      })
                    }
                    className="flex-1 h-8 text-xs bg-indigo-600 hover:bg-indigo-500 text-white font-medium rounded-lg"
                  >
                    {googleLoading ? <Loader2 className="size-3 animate-spin" /> : "Continue with this account"}
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => setShowCustomInput(false)}
                    className="h-8 text-xs"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            )}
          </div>

          <div className="p-3 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-[11px] text-indigo-300 leading-relaxed">
            <span className="font-semibold text-white">💡 Live Google Cloud OAuth Ready:</span> Once you obtain credentials from Google Cloud Console, add <code className="bg-indigo-950/60 text-indigo-200 px-1 py-0.5 rounded font-mono text-[10px]">NEXT_PUBLIC_GOOGLE_CLIENT_ID</code> to <code className="bg-indigo-950/60 text-indigo-200 px-1 py-0.5 rounded font-mono text-[10px]">frontend/.env.local</code> to seamlessly switch to Google&apos;s official live popup dialog.
          </div>
        </div>
      ) : (
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

        {/* ── 1. Regular Email/Password Form ── */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-3.5">
          {mode === "register" && (
            <>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-mono text-[var(--text-secondary)]">
                  Full Name <span className="text-indigo-400">*</span>
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
                  Username / Handle <span className="text-indigo-400">*</span>
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
              <span className="text-indigo-400">*</span>
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
              Password <span className="text-indigo-400">*</span>
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
              disabled={loading || googleLoading}
              className="w-full h-11 bg-indigo-600 hover:bg-indigo-500 text-white font-medium rounded-xl shadow-lg shadow-indigo-600/25 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
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

        {/* ── 2. Subtle Divider: OR ── */}
        <div className="relative flex items-center justify-center my-1">
          <div className="border-t border-[var(--border-subtle)] w-full" />
          <span className="bg-[var(--bg-surface-lowest)] px-3 text-[11px] font-mono text-[var(--text-muted)] tracking-wider uppercase shrink-0">
            OR
          </span>
          <div className="border-t border-[var(--border-subtle)] w-full" />
        </div>

        {/* ── 3. Google Auth Button with Logo, Hover, Focus, Loading & Disabled States ── */}
        <button
          type="button"
          id="google-auth-button"
          disabled={loading || googleLoading}
          onClick={handleGoogleAuthClick}
          aria-label="Continue with Google"
          className="w-full h-11 px-4 rounded-xl bg-[var(--bg-surface-container)] hover:bg-[var(--bg-surface-high)] active:bg-[var(--bg-surface-highest)] text-white border border-[var(--border-subtle)] hover:border-[var(--border-strong)] focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 flex items-center justify-center gap-3 text-xs sm:text-sm font-medium shadow-sm transition-all cursor-pointer group disabled:opacity-50 disabled:cursor-not-allowed select-none"
        >
          {googleLoading ? (
            <>
              <Loader2 className="size-4 animate-spin text-indigo-400" />
              <span>Connecting to Google...</span>
            </>
          ) : (
            <>
              <GoogleIcon className="size-4 shrink-0 transition-transform group-hover:scale-110" />
              <span>Continue with Google</span>
            </>
          )}
        </button>

        {/* Mode Toggle Link */}
        <div className="text-center pt-0.5">
          {mode === "register" ? (
            <p className="text-xs text-[var(--text-muted)]">
              Already have an account?{" "}
              <button
                type="button"
                onClick={() => setMode("login")}
                className="text-indigo-400 hover:underline font-medium cursor-pointer"
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
                className="text-indigo-400 hover:underline font-medium cursor-pointer"
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
