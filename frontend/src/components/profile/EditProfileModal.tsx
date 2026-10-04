"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  X,
  User,
  Briefcase,
  FileText,
  MapPin,
  Globe,
  Upload,
  Plus,
  Trash2,
  Loader2,
  Check,
} from "lucide-react";
import { GithubIcon, LinkedinIcon, TwitterIcon } from "@/components/ui/BrandIcons";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { User as UserType } from "@/lib/api";


interface EditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserType | null;
  onSaveProfile: (updatedData: Partial<UserType>) => Promise<boolean | void>;
}

const COVER_PRESETS = [
  "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1200&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=1200&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=1200&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?w=1200&auto=format&fit=crop&q=80",
];

const SKILL_SUGGESTIONS = [
  "React",
  "Next.js",
  "TypeScript",
  "Node.js",
  "Python",
  "FastAPI",
  "TailwindCSS",
  "PostgreSQL",
  "MongoDB",
  "Docker",
  "GraphQL",
  "Go",
  "Rust",
  "AWS",
  "Kubernetes",
  "PyTorch",
];

export function EditProfileModal({
  isOpen,
  onClose,
  currentUser,
  onSaveProfile,
}: EditProfileModalProps) {
  const [name, setName] = useState("");
  const [role, setRole] = useState("");
  const [bio, setBio] = useState("");
  const [location, setLocation] = useState("");
  const [customStatus, setCustomStatus] = useState("");
  const [availability, setAvailability] = useState<
    "available" | "open_to_collab" | "busy" | "not_looking"
  >("open_to_collab");
  const [websiteUrl, setWebsiteUrl] = useState("");
  const [githubUrl, setGithubUrl] = useState("");
  const [linkedinUrl, setLinkedinUrl] = useState("");
  const [twitterUrl, setTwitterUrl] = useState("");
  const [coverImage, setCoverImage] = useState("");
  const [skills, setSkills] = useState<string[]>([]);
  const [newSkill, setNewSkill] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState<"general" | "links" | "skills" | "cover">("general");

  useEffect(() => {
    if (currentUser) {
      setName(currentUser.name || "");
      setRole(currentUser.role || "");
      setBio(currentUser.bio || "");
      setLocation(currentUser.location || "");
      setCustomStatus(currentUser.customStatus ? currentUser.customStatus.replace(/^[🚀⚡🔬]\s*/, "") : "Open to collaborate");
      setAvailability(currentUser.availability || "open_to_collab");
      setWebsiteUrl(currentUser.websiteUrl || "");
      setGithubUrl(currentUser.githubUrl || "");
      setLinkedinUrl(currentUser.linkedinUrl || "");
      setTwitterUrl(currentUser.twitterUrl || "");
      setCoverImage(currentUser.coverImage || "");
      setSkills(currentUser.skills && currentUser.skills.length > 0 ? [...currentUser.skills] : []);
    }
  }, [currentUser, isOpen]);

  const coverFileInputRef = useRef<HTMLInputElement>(null);

  const handleCoverFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !file.type.startsWith("image/")) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const maxDim = 1200;
        let width = img.width;
        let height = img.height;
        if (width > maxDim) {
          height = Math.round((height * maxDim) / width);
          width = maxDim;
        }
        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          setCoverImage(canvas.toDataURL("image/jpeg", 0.85));
        } else {
          setCoverImage(event.target?.result as string);
        }
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  if (!isOpen) return null;

  const handleAddSkill = (skillToAdd: string) => {
    const trimmed = skillToAdd.trim();
    if (trimmed && !skills.includes(trimmed)) {
      setSkills([...skills, trimmed]);
      setNewSkill("");
    }
  };

  const handleRemoveSkill = (skillToRemove: string) => {
    setSkills(skills.filter((s) => s !== skillToRemove));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await onSaveProfile({
        name,
        role,
        bio,
        location,
        customStatus,
        availability,
        websiteUrl,
        githubUrl,
        linkedinUrl,
        twitterUrl,
        coverImage,
        skills,
      });
      onClose();
    } catch (err) {
      console.error("Failed to save profile:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-[var(--bg-surface-low)] border border-[var(--border-subtle)] rounded-2xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-[var(--border-subtle)] bg-[var(--bg-surface-card)]">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-white/5 border border-white/10 text-zinc-300">
              <User className="size-4 text-zinc-300" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white">Edit Profile</h2>
              <p className="text-xs text-[var(--text-muted)]">
                Manage your profile details, links, and technical skill set.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-zinc-400 hover:text-white rounded-lg hover:bg-white/5 transition-colors cursor-pointer"
          >
            <X className="size-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-[var(--border-subtle)] px-4 pt-2 gap-2 bg-[var(--bg-surface-low)] overflow-x-auto text-xs font-medium">
          <button
            type="button"
            onClick={() => setActiveTab("general")}
            className={`pb-2.5 px-3 border-b-2 transition-colors cursor-pointer ${
              activeTab === "general"
                ? "border-white text-white font-semibold"
                : "border-transparent text-zinc-400 hover:text-zinc-200"
            }`}
          >
            General Info
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("skills")}
            className={`pb-2.5 px-3 border-b-2 transition-colors cursor-pointer ${
              activeTab === "skills"
                ? "border-white text-white font-semibold"
                : "border-transparent text-zinc-400 hover:text-zinc-200"
            }`}
          >
            Skills ({skills.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("links")}
            className={`pb-2.5 px-3 border-b-2 transition-colors cursor-pointer ${
              activeTab === "links"
                ? "border-white text-white font-semibold"
                : "border-transparent text-zinc-400 hover:text-zinc-200"
            }`}
          >
            Links & Portfolio
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("cover")}
            className={`pb-2.5 px-3 border-b-2 transition-colors cursor-pointer ${
              activeTab === "cover"
                ? "border-white text-white font-semibold"
                : "border-transparent text-zinc-400 hover:text-zinc-200"
            }`}
          >
            Header Banner
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
          {activeTab === "general" && (
            <div className="space-y-4 animate-in fade-in duration-150">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-zinc-300 flex items-center gap-1.5">
                    <User className="size-3.5 text-zinc-400" /> Full Name
                  </label>
                  <Input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Alex Turing"
                    className="bg-zinc-900/60 border-zinc-800 text-white text-sm"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-zinc-300 flex items-center gap-1.5">
                    <Briefcase className="size-3.5 text-zinc-400" /> Professional Title / Role
                  </label>
                  <Input
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    placeholder="Fullstack Engineer"
                    className="bg-zinc-900/60 border-zinc-800 text-white text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-zinc-300 flex items-center gap-1.5">
                    <MapPin className="size-3.5 text-zinc-400" /> Location
                  </label>
                  <Input
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="San Francisco, CA / Remote"
                    className="bg-zinc-900/60 border-zinc-800 text-white text-sm"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-zinc-300">Collaboration Status</label>
                  <select
                    value={availability}
                    onChange={(e) => setAvailability(e.target.value as any)}
                    className="w-full h-10 px-3 rounded-lg bg-zinc-900/60 border border-zinc-800 text-white text-sm focus:outline-none focus:ring-1 focus:ring-white/40"
                  >
                    <option value="open_to_collab">Open to collaborate</option>
                    <option value="available">Available for projects</option>
                    <option value="busy">Busy with current tasks</option>
                    <option value="not_looking">Not currently looking</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-zinc-300">Status Message</label>
                <Input
                  value={customStatus}
                  onChange={(e) => setCustomStatus(e.target.value)}
                  placeholder="e.g. Building distributed query engines"
                  className="bg-zinc-900/60 border-zinc-800 text-white text-sm"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-zinc-300 flex items-center gap-1.5">
                  <FileText className="size-3.5 text-zinc-400" /> Bio / Pitch
                </label>
                <textarea
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  rows={3}
                  placeholder="Share a short intro about what you love building and what you are seeking in collaborators..."
                  className="w-full p-3 rounded-lg bg-zinc-900/60 border border-zinc-800 text-white text-sm focus:outline-none focus:ring-1 focus:ring-white/40 resize-none"
                />
              </div>
            </div>
          )}

          {activeTab === "skills" && (
            <div className="space-y-4 animate-in fade-in duration-150">
              <div className="flex gap-2">
                <Input
                  value={newSkill}
                  onChange={(e) => setNewSkill(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleAddSkill(newSkill);
                    }
                  }}
                  placeholder="Type a skill (e.g. Docker, Rust, PyTorch)..."
                  className="bg-zinc-900/60 border-zinc-800 text-white text-sm"
                />
                <Button
                  type="button"
                  onClick={() => handleAddSkill(newSkill)}
                  className="bg-white hover:bg-neutral-200 text-black text-xs font-semibold shrink-0 cursor-pointer"
                >
                  <Plus className="size-4 mr-1" /> Add
                </Button>
              </div>

              {/* Current Skills list */}
              <div className="p-3 rounded-xl bg-zinc-950/40 border border-zinc-800/80 min-h-[90px] flex flex-wrap gap-2 items-center content-start">
                {skills.length === 0 ? (
                  <span className="text-xs text-zinc-500 italic">
                    No skills added yet. Add skills or select suggestions below.
                  </span>
                ) : (
                  skills.map((skill) => (
                    <Badge
                      key={skill}
                      variant="tech"
                      className="py-1 px-2.5 text-xs flex items-center gap-1.5 bg-zinc-800/90 text-zinc-200 border-zinc-700 hover:border-zinc-500 group"
                    >
                      <span>{skill}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveSkill(skill)}
                        className="text-zinc-400 group-hover:text-white transition-colors"
                      >
                        <X className="size-3" />
                      </button>
                    </Badge>
                  ))
                )}
              </div>

              {/* Quick Suggestions */}
              <div className="space-y-1.5 pt-2">
                <span className="text-[11px] font-mono text-zinc-400 uppercase tracking-wider">
                  Quick Add Suggestions:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {SKILL_SUGGESTIONS.filter((s) => !skills.includes(s)).map((suggestion) => (
                    <button
                      key={suggestion}
                      type="button"
                      onClick={() => handleAddSkill(suggestion)}
                      className="text-xs px-2.5 py-1 rounded-md bg-white/5 hover:bg-white/10 text-zinc-300 hover:text-white border border-white/10 transition-colors flex items-center gap-1 cursor-pointer"
                    >
                      <Plus className="size-3" />
                      {suggestion}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === "links" && (
            <div className="space-y-3.5 animate-in fade-in duration-150">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-zinc-300 flex items-center gap-1.5">
                  <GithubIcon className="size-3.5 text-zinc-400" /> GitHub Profile URL
                </label>
                <Input
                  value={githubUrl}
                  onChange={(e) => setGithubUrl(e.target.value)}
                  placeholder="https://github.com/your-username"
                  className="bg-zinc-900/60 border-zinc-800 text-white text-sm font-mono text-xs"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-zinc-300 flex items-center gap-1.5">
                  <LinkedinIcon className="size-3.5 text-zinc-400" /> LinkedIn Profile URL
                </label>
                <Input
                  value={linkedinUrl}
                  onChange={(e) => setLinkedinUrl(e.target.value)}
                  placeholder="https://linkedin.com/in/your-username"
                  className="bg-zinc-900/60 border-zinc-800 text-white text-sm font-mono text-xs"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-zinc-300 flex items-center gap-1.5">
                  <TwitterIcon className="size-3.5 text-zinc-400" /> X / Twitter Profile URL
                </label>
                <Input
                  value={twitterUrl}
                  onChange={(e) => setTwitterUrl(e.target.value)}
                  placeholder="https://x.com/your-handle"
                  className="bg-zinc-900/60 border-zinc-800 text-white text-sm font-mono text-xs"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-zinc-300 flex items-center gap-1.5">
                  <Globe className="size-3.5 text-zinc-400" /> Personal Website / Portfolio
                </label>
                <Input
                  value={websiteUrl}
                  onChange={(e) => setWebsiteUrl(e.target.value)}
                  placeholder="https://yourportfolio.dev"
                  className="bg-zinc-900/60 border-zinc-800 text-white text-sm font-mono text-xs"
                />
              </div>
            </div>
          )}

          {activeTab === "cover" && (
            <div className="space-y-4 animate-in fade-in duration-150">
              <input
                ref={coverFileInputRef}
                type="file"
                accept="image/*"
                onChange={handleCoverFileChange}
                className="hidden"
              />

              <div
                onClick={() => coverFileInputRef.current?.click()}
                className="border border-dashed border-zinc-700 hover:border-zinc-500 rounded-xl p-5 flex flex-col items-center justify-center gap-2 cursor-pointer bg-zinc-900/40 hover:bg-zinc-900/80 transition-all text-center group"
              >
                <div className="p-2.5 rounded-full bg-white/5 text-zinc-300 group-hover:scale-105 transition-transform">
                  <Upload className="size-5" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-white">Upload Header Banner</p>
                  <p className="text-[11px] text-zinc-400 mt-0.5">Click to choose image from your files (PNG, JPG, WebP)</p>
                </div>
              </div>

              {coverImage && (
                <div className="relative rounded-xl overflow-hidden border border-zinc-700 h-28 w-full group">
                  <img
                    src={coverImage}
                    alt="Cover preview"
                    className="w-full h-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => setCoverImage("")}
                    className="absolute top-2 right-2 p-1.5 rounded-lg bg-black/70 hover:bg-black text-zinc-300 hover:text-white text-xs flex items-center gap-1 cursor-pointer transition-colors"
                  >
                    <Trash2 className="size-3.5 text-zinc-400" />
                    <span>Clear</span>
                  </button>
                </div>
              )}

              <div className="space-y-2 pt-2">
                <span className="text-[11px] font-mono text-zinc-400 uppercase tracking-wider">
                  Preset Banners:
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {COVER_PRESETS.map((preset, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setCoverImage(preset)}
                      className={`relative rounded-lg overflow-hidden h-16 border-2 transition-all cursor-pointer ${
                        coverImage === preset
                          ? "border-white ring-2 ring-white/20 scale-[1.02]"
                          : "border-zinc-800 hover:border-zinc-600"
                      }`}
                    >
                      <img
                        src={preset}
                        alt={`Preset ${idx + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-[var(--border-subtle)]">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="text-xs h-9 text-zinc-300 border-[var(--border-subtle)] hover:bg-white/5 cursor-pointer"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="text-xs h-9 bg-white hover:bg-neutral-200 text-black font-semibold flex items-center gap-1.5 cursor-pointer"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="size-3.5 animate-spin" />
                  <span>Saving Changes...</span>
                </>
              ) : (
                <>
                  <Check className="size-3.5" />
                  <span>Save Profile</span>
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
