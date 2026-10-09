import mongoose from "mongoose";
import { User } from "../models/User.js";
import { Post } from "../models/Post.js";

const isDbReady = () => mongoose.connection.readyState === 1;

export const seedDatabase = async () => {
  if (!isDbReady()) return;

  try {
    console.log("🌱 [Database] Running startup check & cleanup of dummy users and posts...");

    // 1. Purge dummy users from database
    const dummyHandles = [
      "@elena_codes",
      "elena_codes",
      "@alexm_dark",
      "alexm_dark",
      "@schen",
      "schen",
      "@arivera",
      "arivera",
      "@dmarcus",
      "dmarcus",
      "@priya",
      "priya",
      "@sconnor",
      "sconnor",
      "@googledev",
      "googledev",
      "@rahul",
      "rahul",
    ];

    const dummyEmails = [
      "elena.codes@example.com",
      "sarah.chen@example.com",
      "alex.rivera@example.com",
      "devon.marcus@example.com",
      "priya.patel@example.com",
      "sarah@cyberdyne.dev",
      "google.dev@example.com",
      "pranjal@projectbuddy.dev",
    ];

    const delUsersResult = await User.deleteMany({
      $or: [
        { handle: { $in: dummyHandles } },
        { email: { $in: dummyEmails } },
        {
          name: {
            $in: [
              "Elena Rostova",
              "Alex Morgan",
              "Sarah Chen",
              "Alex Rivera",
              "Devon Marcus",
              "Priya Patel",
              "Sarah Connor",
              "Rahul Sharma",
            ],
          },
        },
      ],
    });

    if (delUsersResult.deletedCount > 0) {
      console.log(`🧹 Deleted ${delUsersResult.deletedCount} dummy users from database`);
    }

    // 2. Purge dummy posts from database
    const delPostsResult = await Post.deleteMany({
      $or: [
        { customId: { $in: ["post-2", "post-3", "post-4"] } },
        { id: { $in: ["post-2", "post-3", "post-4"] } },
        {
          "author.name": {
            $in: [
              "Alex Morgan",
              "Elena Rostova",
              "Rahul Sharma",
              "Sarah Chen",
              "Alex Rivera",
            ],
          },
        },
        {
          "author.handle": {
            $in: ["@alexm_dark", "@elena_codes", "@rahul", "@schen", "@arivera"],
          },
        },
      ],
    });

    if (delPostsResult.deletedCount > 0) {
      console.log(`🧹 Deleted ${delPostsResult.deletedCount} dummy posts from database`);
    }

    // 3. Remove dummy handles from following/followers of real users
    await User.updateMany(
      {},
      {
        $pull: {
          followers: { $in: dummyHandles },
          following: { $in: dummyHandles },
        },
      }
    );

    // 4. Ensure real users have valid stats
    const realUsers = await User.find();
    for (const u of realUsers) {
      u.followers = u.followers || [];
      u.following = u.following || [];
      if (!u.stats) u.stats = {};
      u.stats.followersCount = u.followers.length;
      u.stats.followingCount = u.following.length;
      await u.save();
    }

    // 5. Clean up and sanitize posts likedBy duplicates
    const allPosts = await Post.find();
    for (const p of allPosts) {
      let modified = false;
      if (Array.isArray(p.likedBy)) {
        const unique = Array.from(
          new Set(
            p.likedBy.map((h) =>
              h.startsWith("@") ? h.toLowerCase() : `@${h.toLowerCase()}`
            )
          )
        );
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
        if (
          typeof p.stats.comments !== "number" ||
          p.stats.comments !== (p.commentsList || []).length
        ) {
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

    console.log("✅ [Database] Dummy cleanup & user verification complete!");
  } catch (error) {
    console.error("❌ [Database] Error during database cleanup:", error);
  }
};
