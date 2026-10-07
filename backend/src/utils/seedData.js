import mongoose from "mongoose";
import { User } from "../models/User.js";
import { Post } from "../models/Post.js";
import { inMemoryUsers } from "../data/inMemoryStore.js";

const isDbReady = () => mongoose.connection.readyState === 1;

export const seedDatabase = async () => {
  if (!isDbReady()) return;

  try {
    console.log("🌱 [Database] Running startup check & seed for default users and collections...");

    // 1. Ensure core users exist and have followers/following initialized
    for (const memUser of inMemoryUsers) {
      const cleanHandle = memUser.handle.trim().toLowerCase();
      const rawHandle = cleanHandle.replace(/^@/, "");

      let existing = await User.findOne({
        $or: [
          { handle: cleanHandle },
          { handle: `@${rawHandle}` },
          { handle: rawHandle },
          { email: memUser.email },
        ],
      });

      if (!existing) {
        console.log(`✨ Seeding core user to database: ${cleanHandle} (${memUser.name})`);
        try {
          await User.create({
            name: memUser.name,
            handle: cleanHandle,
            email: memUser.email,
            password: "$2a$10$abcdefghijklmnopqrstuvwxyz1234567890",
            role: memUser.role,
            bio: memUser.bio,
            avatar: memUser.avatar || "",
            coverImage: memUser.coverImage || "",
            initials: memUser.initials,
            location: memUser.location || "",
            websiteUrl: memUser.websiteUrl || "",
            githubUrl: memUser.githubUrl || "",
            linkedinUrl: memUser.linkedinUrl || "",
            twitterUrl: memUser.twitterUrl || "",
            pronouns: memUser.pronouns || "",
            customStatus: memUser.customStatus || "Open to collaborate",
            availability: memUser.availability || "open_to_collab",
            experienceLevel: memUser.experienceLevel || "architect",
            interests: memUser.interests || [],
            skills: memUser.skills || [],
            followers: memUser.followers || [],
            following: memUser.following || [],
            stats: memUser.stats || {
              followersCount: (memUser.followers || []).length,
              followingCount: (memUser.following || []).length,
            },
            isEmailVerified: true,
            authProvider: "local",
          });
        } catch (createErr) {
          console.warn(`Could not seed user ${cleanHandle}:`, createErr.message);
        }
      } else {
        // Ensure followers and following arrays exist
        let changed = false;
        if (!Array.isArray(existing.followers)) {
          existing.followers = memUser.followers || [];
          changed = true;
        }
        if (!Array.isArray(existing.following)) {
          existing.following = memUser.following || [];
          changed = true;
        }
        if (!existing.stats) {
          existing.stats = {
            followersCount: existing.followers.length,
            followingCount: existing.following.length,
          };
          changed = true;
        } else {
          if (typeof existing.stats.followersCount !== "number") {
            existing.stats.followersCount = existing.followers.length;
            changed = true;
          }
          if (typeof existing.stats.followingCount !== "number") {
            existing.stats.followingCount = existing.following.length;
            changed = true;
          }
        }

        if (changed) {
          existing.markModified("followers");
          existing.markModified("following");
          existing.markModified("stats");
          await existing.save();
        }
      }
    }

    // 2. Repair any users with undefined followers/following
    await User.updateMany(
      { followers: { $exists: false } },
      { $set: { followers: [], "stats.followersCount": 0 } }
    );
    await User.updateMany(
      { following: { $exists: false } },
      { $set: { following: [], "stats.followingCount": 0 } }
    );

    // 3. Clean up and sanitize posts likedBy duplicates
    const allPosts = await Post.find();
    for (const p of allPosts) {
      let modified = false;
      if (Array.isArray(p.likedBy)) {
        const unique = Array.from(new Set(p.likedBy.map((h) => (h.startsWith("@") ? h.toLowerCase() : `@${h.toLowerCase()}`))));
        if (unique.length !== p.likedBy.length) {
          p.likedBy = unique;
          modified = true;
        }
      } else {
        p.likedBy = [];
        modified = true;
      }

      if (!p.stats) {
        p.stats = {
          likes: p.likedBy.length,
          comments: (p.commentsList || []).length,
          reposts: 0,
          bookmarks: 0,
          shares: 0,
        };
        modified = true;
      } else {
        if (typeof p.stats.comments !== "number" || p.stats.comments !== (p.commentsList || []).length) {
          p.stats.comments = (p.commentsList || []).length;
          modified = true;
        }
      }

      if (modified) {
        p.markModified("likedBy");
        p.markModified("stats");
        await p.save();
      }
    }

    console.log("✅ [Database] Seed & repair complete. All users and posts verified!");
  } catch (error) {
    console.error("❌ [Database] Error during database seeding:", error);
  }
};
