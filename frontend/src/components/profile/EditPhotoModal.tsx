"use client";

import React, { useState, useRef } from "react";
import {
  X,
  Upload,
  Link2,
  Sparkles,
  Trash2,
  Check,
  Camera,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface EditPhotoModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentPhoto?: string;
  initials: string;
  userName: string;
  onSavePhoto: (photoUrl: string) => Promise<boolean | void>;
}

// Curated avatar presets for developers
const AVATAR_PRESETS = [
  {
    id: "bot-1",
    name: "Cyber Bot",
    url: "https://api.dicebear.com/7.x/bottts/svg?seed=CyberArchitect&backgroundColor=0f172a",
  },
  {
    id: "bot-2",
    name: "Neon Hacker",
    url: "https://api.dicebear.com/7.x/bottts/svg?seed=NeonMatrix&backgroundColor=1e1b4b",
  },
  {
    id: "adv-1",
    name: "Alex Dev",
    url: "https://api.dicebear.com/7.x/avataaars/svg?seed=Alex&backgroundColor=312e81",
  },
  {
    id: "adv-2",
    name: "Maya Code",
    url: "https://api.dicebear.com/7.x/avataaars/svg?seed=Maya&backgroundColor=1e293b",
  },
  {
    id: "adv-3",
    name: "Sam Tech",
    url: "https://api.dicebear.com/7.x/avataaars/svg?seed=Sam&backgroundColor=022c22",
  },
  {
    id: "bot-3",
    name: "Quantum Core",
    url: "https://api.dicebear.com/7.x/identicon/svg?seed=QuantumDev&backgroundColor=3730a3",
  },
  {
    id: "photo-1",
    name: "Urban Engineer",
    url: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80",
  },
  {
    id: "photo-2",
    name: "Dev Studio",
    url: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&auto=format&fit=crop&q=80",
  },
];

export function EditPhotoModal({
  isOpen,
  onClose,
  currentPhoto = "",
  initials,
  userName,
  onSavePhoto,
}: EditPhotoModalProps) {
  const [activeTab, setActiveTab] = useState<"upload" | "url" | "presets">("upload");
  const [previewPhoto, setPreviewPhoto] = useState<string>(currentPhoto);
  const [urlInput, setUrlInput] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  // Process uploaded image file and resize/compress via canvas for fast loading
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setErrorMsg(null);

    // Validation: only image types
    if (!file.type.startsWith("image/")) {
      setErrorMsg("Please upload a valid image file (PNG, JPG, WebP, GIF).");
      return;
    }

    // Limit to 5MB raw file
    if (file.size > 5 * 1024 * 1024) {
      setErrorMsg("Image size exceeds 5MB. Please choose a smaller file.");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        // Max dimension 400x400 for optimal avatar performance
        const maxDim = 400;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > maxDim) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          }
        } else {
          if (height > maxDim) {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }

        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          const compressedDataUrl = canvas.toDataURL("image/jpeg", 0.88);
          setPreviewPhoto(compressedDataUrl);
        } else {
          setPreviewPhoto(event.target?.result as string);
        }
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleApplyUrl = () => {
    const trimmed = urlInput.trim();
    if (!trimmed) {
      setErrorMsg("Please enter an image URL.");
      return;
    }
    try {
      new URL(trimmed);
      setPreviewPhoto(trimmed);
      setErrorMsg(null);
    } catch {
      setErrorMsg("Please enter a valid HTTP or HTTPS image URL.");
    }
  };

  const handleSelectPreset = (presetUrl: string) => {
    setPreviewPhoto(presetUrl);
    setErrorMsg(null);
  };

  const handleRemovePhoto = () => {
    setPreviewPhoto("");
    setErrorMsg(null);
  };

  const handleSave = async () => {
    setIsSubmitting(true);
    setErrorMsg(null);
    try {
      await onSavePhoto(previewPhoto);
      setSuccessMsg("Profile photo updated successfully!");
      setTimeout(() => {
        setSuccessMsg(null);
        onClose();
      }, 700);
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to update profile photo");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="w-full max-w-lg bg-[var(--bg-surface-low)] border border-[var(--border-subtle)] rounded-2xl shadow-2xl overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-[var(--border-subtle)] bg-[var(--bg-surface-container)]">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-white/10 text-white border border-white/20">
              <Camera className="size-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Change Profile Photo</h3>
              <p className="text-xs text-[var(--text-secondary)]">
                Choose a new photo or avatar for {userName || "your profile"}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-[var(--text-muted)] hover:text-white hover:bg-[var(--bg-surface-high)] transition-colors cursor-pointer"
          >
            <X className="size-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-4 sm:p-6 flex flex-col gap-5 overflow-y-auto max-h-[75vh]">
          {/* Live Preview Display */}
          <div className="flex items-center justify-center py-2">
            <div className="relative group">
              <div className="relative rounded-full p-1 bg-zinc-700 border border-zinc-600 shadow-lg">
                <Avatar
                  src={previewPhoto || undefined}
                  fallback={initials || "DEV"}
                  size="xl"
                  className="size-24 sm:size-28 text-2xl font-bold bg-zinc-800 text-white ring-4 ring-[var(--bg-surface-low)]"
                />
              </div>

              {previewPhoto && (
                <button
                  type="button"
                  onClick={handleRemovePhoto}
                  title="Remove custom photo"
                  className="absolute bottom-0 right-0 p-1.5 rounded-full bg-rose-600 hover:bg-rose-500 text-white shadow-md transition-transform hover:scale-110 cursor-pointer"
                >
                  <Trash2 className="size-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex p-1 rounded-xl bg-[var(--bg-surface-container)] border border-[var(--border-subtle)]">
            <button
              type="button"
              onClick={() => {
                setActiveTab("upload");
                setErrorMsg(null);
              }}
              className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
                activeTab === "upload"
                  ? "bg-white text-black shadow-sm"
                  : "text-[var(--text-secondary)] hover:text-white"
              }`}
            >
              <Upload className="size-3.5" />
              <span>Upload File</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setActiveTab("url");
                setErrorMsg(null);
              }}
              className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
                activeTab === "url"
                  ? "bg-white text-black shadow-sm"
                  : "text-[var(--text-secondary)] hover:text-white"
              }`}
            >
              <Link2 className="size-3.5" />
              <span>Image URL</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setActiveTab("presets");
                setErrorMsg(null);
              }}
              className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
                activeTab === "presets"
                  ? "bg-white text-black shadow-sm"
                  : "text-[var(--text-secondary)] hover:text-white"
              }`}
            >
              <Sparkles className="size-3.5" />
              <span>Dev Presets</span>
            </button>
          </div>

          {/* Tab Content: Upload */}
          {activeTab === "upload" && (
            <div className="flex flex-col gap-3">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-[var(--border-strong)] hover:border-white/60 rounded-xl p-6 flex flex-col items-center justify-center gap-2 cursor-pointer bg-[var(--bg-surface-container)]/40 hover:bg-white/5 transition-all text-center group"
              >
                <div className="p-3 rounded-full bg-white/10 text-white group-hover:scale-110 transition-transform">
                  <Upload className="size-6" />
                </div>
                <div>
                  <p className="text-xs sm:text-sm font-semibold text-white">
                    Click to browse or drop image here
                  </p>
                  <p className="text-[11px] text-[var(--text-muted)] mt-0.5">
                    PNG, JPG, WebP, or GIF (auto-resized for crisp rendering)
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Tab Content: URL */}
          {activeTab === "url" && (
            <div className="flex flex-col gap-3">
              <p className="text-xs text-[var(--text-secondary)]">
                Paste any publicly accessible image link (e.g., GitHub avatar, Unsplash, Gravatar).
              </p>
              <div className="flex gap-2">
                <Input
                  value={urlInput}
                  onChange={(e) => setUrlInput(e.target.value)}
                  placeholder="https://example.com/avatar.jpg"
                  className="text-xs bg-[var(--bg-surface-container)] text-white"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleApplyUrl();
                    }
                  }}
                />
                <Button
                  type="button"
                  onClick={handleApplyUrl}
                  className="shrink-0 text-xs bg-white hover:bg-neutral-200 text-black font-semibold"
                >
                  Preview
                </Button>
              </div>
              <p className="text-[11px] font-mono text-[var(--text-muted)]">
                Tip: For GitHub profile picture, use https://github.com/your-username.png
              </p>
            </div>
          )}

          {/* Tab Content: Presets */}
          {activeTab === "presets" && (
            <div className="flex flex-col gap-3">
              <p className="text-xs text-[var(--text-secondary)]">
                Select from stylized developer and bot avatars:
              </p>
              <div className="grid grid-cols-4 gap-2.5 sm:gap-3">
                {AVATAR_PRESETS.map((preset) => {
                  const isSelected = previewPhoto === preset.url;
                  return (
                    <button
                      key={preset.id}
                      type="button"
                      onClick={() => handleSelectPreset(preset.url)}
                      className={`relative flex flex-col items-center gap-1.5 p-2 rounded-xl border transition-all cursor-pointer ${
                        isSelected
                          ? "border-white bg-white/10 ring-2 ring-white/30"
                          : "border-[var(--border-subtle)] bg-[var(--bg-surface-container)] hover:border-white/40"
                      }`}
                    >
                      <Avatar
                        src={preset.url}
                        fallback="DEV"
                        size="md"
                        className="size-11 sm:size-12 ring-1 ring-white/10"
                      />
                      <span className="text-[10px] text-[var(--text-secondary)] truncate w-full text-center">
                        {preset.name}
                      </span>
                      {isSelected && (
                        <span className="absolute top-1 right-1 size-3.5 rounded-full bg-white text-black flex items-center justify-center">
                          <Check className="size-2.5" />
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Messages */}
          {errorMsg && (
            <div className="p-2.5 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs flex items-center gap-2">
              <AlertCircle className="size-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs flex items-center gap-2">
              <Check className="size-4 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-t border-[var(--border-subtle)] bg-[var(--bg-surface-container)]">
          <Button
            type="button"
            variant="ghost"
            onClick={onClose}
            disabled={isSubmitting}
            className="text-xs text-[var(--text-secondary)] hover:text-white"
          >
            Cancel
          </Button>

          <div className="flex items-center gap-2">
            {previewPhoto && (
              <Button
                type="button"
                variant="outline"
                onClick={handleRemovePhoto}
                disabled={isSubmitting}
                className="text-xs text-rose-400 border-rose-500/30 hover:bg-rose-500/10"
              >
                Reset to Initials
              </Button>
            )}
            <Button
              type="button"
              onClick={handleSave}
              disabled={isSubmitting}
              className="text-xs bg-white hover:bg-neutral-200 text-black font-semibold flex items-center gap-1.5"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="size-3.5 animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <Check className="size-3.5" />
                  <span>Apply Photo</span>
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
