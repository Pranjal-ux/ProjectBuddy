import mongoose from "mongoose";
import { Post } from "../models/Post.js";
import { Activity } from "../models/Activity.js";
import { inMemoryActivities } from "./joinRequestController.js";

const isDbReady = () => mongoose.connection.readyState === 1;

// Default initial posts in memory for fallback or seeding
const seedInitialPosts = [
  {
    customId: "post-1",
    author: {
      name: "Pranjal Shukla",
      handle: "@pranjal",
      fallback: "PS",
      verified: true,
      role: "Lead Creator",
    },
    type: "project",
    title: "AI-based Pothole Detection System",
    content:
      "Building an AI-based pothole and road defect detection system using YOLO + FastAPI with real-time video stream processing and OpenStreetMap overlays.",
    tags: ["Python", "YOLO", "FastAPI", "React", "PyTorch"],
    team: {
      current: 2,
      max: 4,
      lookingFor: ["React Developer", "UI Designer"],
    },
    stats: {
      likes: 38,
      comments: 2,
      reposts: 14,
      bookmarks: 12,
      shares: 6,
    },
    likedBy: ["@pranjal"],
    bookmarkedBy: ["@pranjal"],
    repostedBy: [],
    commentsList: [
      {
        id: "c-1",
        author: "Sarah Chen",
        handle: "@schen",
        text: "Are you running inference edge-side or sending frames to an inference cluster?",
        time: "10m ago",
        createdAt: new Date(Date.now() - 10 * 60 * 1000),
      },
      {
        id: "c-2",
        author: "Pranjal Shukla",
        handle: "@pranjal",
        text: "Currently using ONNX runtime directly in browser for pre-filtering, then FastAPI for heavier tensor processing!",
        time: "5m ago",
        createdAt: new Date(Date.now() - 5 * 60 * 1000),
      },
    ],
    createdAt: new Date(Date.now() - 15 * 60 * 1000),
  },
  {
    customId: "post-2",
    author: {
      name: "Alex Morgan",
      handle: "@alexm_dark",
      fallback: "AM",
      verified: true,
      role: "Design Technologist",
      avatarUrl:
        "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
    },
    type: "telemetry",
    title: "OLED Pitch-Black Design Engine",
    content:
      "Pitch-black OLED aesthetic with deep black #000000 background and crisp contrast typography. Battery-saving, pixel-level perfection for prolonged technical reading.",
    tags: ["OLED", "TailwindCSS", "DesignSystems", "DarkTheme"],
    telemetry: {
      filename: "OLED_Telemetry_Specs.json",
      spec: "SPEC v2.4",
      description: "0.000 nits true black level baseline",
      imageUrl:
        "https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&auto=format&fit=crop&q=80",
    },
    stats: {
      likes: 842,
      comments: 1,
      reposts: 118,
      bookmarks: 312,
      shares: 44,
    },
    likedBy: [],
    bookmarkedBy: ["@pranjal"],
    repostedBy: [],
    commentsList: [
      {
        id: "c-3",
        author: "Elena Rostova",
        handle: "@elena_codes",
        text: "True OLED black with 1px #171717 borders makes long dev sessions so much easier on the eyes.",
        time: "1h ago",
        createdAt: new Date(Date.now() - 60 * 60 * 1000),
      },
    ],
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
  },
  {
    customId: "post-3",
    author: {
      name: "Rahul Sharma",
      handle: "@rahul",
      fallback: "RS",
      role: "AI Engineer",
    },
    type: "project",
    title: "AI Resume Analyzer & Matchmaker",
    content:
      "AI Resume Analyzer using NLP embeddings and Next.js. Parsing PDF ASTs to calculate semantic skill overlap with JD vectors. Looking for Python Developer to scale embedding worker queues.",
    tags: ["Python", "NLP", "React", "OpenAI", "pgvector"],
    team: {
      current: 1,
      max: 3,
      lookingFor: ["Python Developer", "Data Engineer"],
    },
    stats: {
      likes: 42,
      comments: 0,
      reposts: 8,
      bookmarks: 19,
      shares: 3,
    },
    likedBy: [],
    bookmarkedBy: [],
    repostedBy: [],
    commentsList: [],
    createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000),
  },
  {
    customId: "post-4",
    author: {
      name: "Elena Rostova",
      handle: "@elena_codes",
      fallback: "ER",
      verified: true,
      role: "Frontend Architect",
      avatarUrl:
        "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80",
    },
    type: "code",
    title: "Zero Glow Bleed Token Configuration",
    content:
      "To guarantee zero glow bleed on dark-room monitors, keep all surface fills down to #000000, secondary containers at #0a0a0a, and stroke colors below #222222.",
    tags: ["CSS", "WebPerf", "Tokens"],
    codeSnippet: {
      filename: "tokens.config.css",
      language: "css",
      code: `:root {
  --bg-oled: #000000;
  --surface-low: #050505;
  --surface-card: #0a0a0a;
  --border-subtle: #171717;
  --text-high: #ffffff;
  --accent-glow: #6366f1;
}`,
    },
    stats: {
      likes: 129,
      comments: 0,
      reposts: 23,
      bookmarks: 230,
      shares: 15,
    },
    likedBy: [],
    bookmarkedBy: [],
    repostedBy: [],
    commentsList: [],
    createdAt: new Date(Date.now() - 7 * 60 * 60 * 1000),
  },
];

// In-memory fallback posts store
let fallbackPosts = JSON.parse(JSON.stringify(seedInitialPosts)).map((p) => ({
  ...p,
  id: p.customId,
  _id: p.customId,
}));

const formatRelativeTime = (dateInput) => {
  if (!dateInput) return "Just now";
  const date = new Date(dateInput);
  if (isNaN(date.getTime())) return typeof dateInput === "string" ? dateInput : "Just now";
  const diffSec = Math.floor((Date.now() - date.getTime()) / 1000);
  if (diffSec < 60) return "Just now";
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHours = Math.floor(diffMin / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays}d ago`;
};

const normalizeHandle = (h) => {
  if (!h) return "";
  const s = String(h).trim();
  return s.startsWith("@") ? s.toLowerCase() : `@${s.toLowerCase()}`;
};

// Helper to reliably find a post by customId or ObjectId
const findPostById = async (id) => {
  if (!id) return null;
  let post = await Post.findOne({ customId: id });
  if (!post && mongoose.Types.ObjectId.isValid(id) && /^[0-9a-fA-F]{24}$/.test(id)) {
    post = await Post.findById(id);
  }
  return post;
};

// Helper to format post with user specific states
const formatPost = (post, userHandle) => {
  const p = post.toObject ? post.toObject() : { ...post };
  const normHandle = normalizeHandle(userHandle);

  const likedBy = p.likedBy || [];
  const bookmarkedBy = p.bookmarkedBy || [];
  const repostedBy = p.repostedBy || [];

  return {
    ...p,
    id: p.customId || (p._id ? p._id.toString() : p.id),
    createdAt: formatRelativeTime(p.createdAt),
    userLiked: normHandle ? likedBy.some((h) => normalizeHandle(h) === normHandle) : false,
    userBookmarked: normHandle ? bookmarkedBy.some((h) => normalizeHandle(h) === normHandle) : false,
    userReposted: normHandle ? repostedBy.some((h) => normalizeHandle(h) === normHandle) : false,
    stats: {
      likes: p.stats?.likes ?? likedBy.length,
      comments: p.stats?.comments ?? (p.commentsList ? p.commentsList.length : 0),
      reposts: p.stats?.reposts ?? repostedBy.length,
      bookmarks: p.stats?.bookmarks ?? bookmarkedBy.length,
      shares: p.stats?.shares ?? 0,
    },
    commentsList: (p.commentsList || []).map((c) => ({
      ...c,
      time: c.time || formatRelativeTime(c.createdAt),
    })),
  };
};

/**
 * @desc Get all posts with likes, bookmarks, and comment counts
 * @route GET /api/posts
 */
export const getPosts = async (req, res) => {
  try {
    const userHandle = req.user?.handle || req.query.handle || "";

    if (isDbReady()) {
      let posts = await Post.find().sort({ createdAt: -1 });

      // Seed if empty
      if (posts.length === 0) {
        posts = await Post.insertMany(seedInitialPosts);
      }

      return res.status(200).json({
        success: true,
        count: posts.length,
        posts: posts.map((p) => formatPost(p, userHandle)),
      });
    }

    // In-memory fallback
    return res.status(200).json({
      success: true,
      count: fallbackPosts.length,
      posts: fallbackPosts.map((p) => formatPost(p, userHandle)),
    });
  } catch (error) {
    console.error("Error in getPosts:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch posts",
      error: error.message,
    });
  }
};

/**
 * @desc Create a new post
 * @route POST /api/posts
 */
export const createPost = async (req, res) => {
  try {
    const { title, content, type = "project", tags = [], team, telemetry, codeSnippet } = req.body;

    const authorName = req.user?.name || req.body.author?.name || "Developer";
    const authorHandle = req.user?.handle || req.body.author?.handle || "@developer";
    const authorAvatar = req.user?.avatar || req.body.author?.avatarUrl || "";
    const authorFallback = req.user?.initials || req.body.author?.fallback || "DEV";
    const authorRole = req.user?.role || req.body.author?.role || "Fullstack Engineer";

    const newPostData = {
      customId: `post-${Date.now()}`,
      author: {
        name: authorName,
        handle: authorHandle,
        avatarUrl: authorAvatar,
        fallback: authorFallback,
        verified: true,
        role: authorRole,
      },
      title: title || "",
      content: content || "",
      type,
      tags,
      team,
      telemetry,
      codeSnippet,
      stats: {
        likes: 0,
        comments: 0,
        reposts: 0,
        bookmarks: 0,
        shares: 0,
      },
      likedBy: [],
      bookmarkedBy: [],
      repostedBy: [],
      commentsList: [],
    };

    if (isDbReady()) {
      const created = await Post.create(newPostData);
      return res.status(201).json({
        success: true,
        post: formatPost(created, authorHandle),
      });
    }

    // In-memory fallback
    const memPost = {
      ...newPostData,
      id: newPostData.customId,
      _id: newPostData.customId,
      createdAt: "Just now",
    };
    fallbackPosts.unshift(memPost);

    return res.status(201).json({
      success: true,
      post: formatPost(memPost, authorHandle),
    });
  } catch (error) {
    console.error("Error in createPost:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to create post",
      error: error.message,
    });
  }
};

/**
 * @desc Toggle like on a post
 * @route POST /api/posts/:id/like
 */
export const toggleLike = async (req, res) => {
  try {
    const { id } = req.params;
    let rawHandle = req.user?.handle || req.body.handle || "@developer";
    const handle = normalizeHandle(rawHandle);
    const userName = req.user?.name || req.body.userName || "Developer";

    if (isDbReady()) {
      let post = await findPostById(id);

      if (!post) {
        return res.status(404).json({
          success: false,
          message: "Post not found",
        });
      }

      if (!Array.isArray(post.likedBy)) post.likedBy = [];
      const hasLiked = post.likedBy.some((h) => normalizeHandle(h) === handle);

      if (hasLiked) {
        post.likedBy = post.likedBy.filter((h) => normalizeHandle(h) !== handle);
        post.stats.likes = Math.max(0, (post.stats?.likes || 1) - 1);
      } else {
        post.likedBy.push(handle);
        post.stats.likes = (post.stats?.likes || 0) + 1;

        // Create activity notification for post author if different user
        if (normalizeHandle(post.author.handle) !== handle) {
          try {
            await Activity.create({
              type: "like",
              user: userName,
              handle: handle,
              initials: req.user?.initials || "DEV",
              action: "liked your post",
              target: post.title || post.content.slice(0, 30),
              recipientHandle: post.author.handle,
              hasAction: false,
              status: "none",
            });
          } catch (e) {
            console.warn("Could not create like activity:", e.message);
          }
        }
      }

      post.markModified("likedBy");
      post.markModified("stats");
      await post.save();

      return res.status(200).json({
        success: true,
        liked: !hasLiked,
        likesCount: post.stats.likes,
        post: formatPost(post, handle),
      });
    }

    // In-memory fallback
    const post = fallbackPosts.find((p) => p.id === id || p.customId === id || p._id === id);
    if (!post) {
      return res.status(404).json({
        success: false,
        message: "Post not found in memory",
      });
    }

    if (!post.likedBy) post.likedBy = [];
    const hasLiked = post.likedBy.includes(handle);

    if (hasLiked) {
      post.likedBy = post.likedBy.filter((h) => h !== handle);
      post.stats.likes = Math.max(0, post.stats.likes - 1);
    } else {
      post.likedBy.push(handle);
      post.stats.likes = (post.stats.likes || 0) + 1;

      // In-memory activity
      if (post.author.handle !== handle) {
        inMemoryActivities.unshift({
          _id: `act-${Date.now()}`,
          id: `act-${Date.now()}`,
          type: "like",
          user: userName,
          handle: handle,
          initials: req.user?.initials || "DEV",
          action: "liked your post",
          target: post.title || post.content.slice(0, 30),
          recipientHandle: post.author.handle,
          hasAction: false,
          status: "none",
          createdAt: new Date().toISOString(),
        });
      }
    }

    return res.status(200).json({
      success: true,
      liked: !hasLiked,
      likesCount: post.stats.likes,
      post: formatPost(post, handle),
    });
  } catch (error) {
    console.error("Error in toggleLike:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to update like status",
      error: error.message,
    });
  }
};

/**
 * @desc Toggle bookmark on a post
 * @route POST /api/posts/:id/bookmark
 */
export const toggleBookmark = async (req, res) => {
  try {
    const { id } = req.params;
    const rawHandle = req.user?.handle || req.body.handle || "@pranjal";
    const handle = normalizeHandle(rawHandle);

    if (isDbReady()) {
      let post = await findPostById(id);

      if (!post) {
        return res.status(404).json({
          success: false,
          message: "Post not found",
        });
      }

      if (!post.bookmarkedBy) post.bookmarkedBy = [];
      const hasBookmarked = post.bookmarkedBy.some(
        (h) => normalizeHandle(h) === handle
      );

      if (hasBookmarked) {
        post.bookmarkedBy = post.bookmarkedBy.filter(
          (h) => normalizeHandle(h) !== handle
        );
        post.stats.bookmarks = Math.max(0, (post.stats.bookmarks || 1) - 1);
      } else {
        post.bookmarkedBy.push(handle);
        post.stats.bookmarks = (post.stats.bookmarks || 0) + 1;
      }

      await post.save();

      return res.status(200).json({
        success: true,
        bookmarked: !hasBookmarked,
        bookmarksCount: post.stats.bookmarks,
        post: formatPost(post, handle),
      });
    }

    // In-memory fallback
    const post = fallbackPosts.find((p) => p.id === id || p.customId === id || p._id === id);
    if (!post) {
      return res.status(404).json({
        success: false,
        message: "Post not found in memory",
      });
    }

    if (!post.bookmarkedBy) post.bookmarkedBy = [];
    const hasBookmarked = post.bookmarkedBy.some(
      (h) => normalizeHandle(h) === handle
    );

    if (hasBookmarked) {
      post.bookmarkedBy = post.bookmarkedBy.filter(
        (h) => normalizeHandle(h) !== handle
      );
      post.stats.bookmarks = Math.max(0, post.stats.bookmarks - 1);
    } else {
      post.bookmarkedBy.push(handle);
      post.stats.bookmarks = (post.stats.bookmarks || 0) + 1;
    }

    return res.status(200).json({
      success: true,
      bookmarked: !hasBookmarked,
      bookmarksCount: post.stats.bookmarks,
      post: formatPost(post, handle),
    });
  } catch (error) {
    console.error("Error in toggleBookmark:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to toggle bookmark",
      error: error.message,
    });
  }
};

/**
 * @desc Get all bookmarked posts for user
 * @route GET /api/posts/bookmarks
 */
export const getBookmarks = async (req, res) => {
  try {
    const rawHandle = req.user?.handle || req.query.handle || "@pranjal";
    const handle = normalizeHandle(rawHandle);
    const altHandle = handle.replace(/^@/, "");

    if (isDbReady()) {
      const posts = await Post.find({
        $or: [
          { bookmarkedBy: handle },
          { bookmarkedBy: altHandle },
          { bookmarkedBy: { $in: [handle, altHandle] } },
        ],
      }).sort({ updatedAt: -1 });

      return res.status(200).json({
        success: true,
        count: posts.length,
        posts: posts.map((p) => formatPost(p, handle)),
      });
    }

    // In-memory fallback
    const bookmarked = fallbackPosts.filter((p) => {
      const bList = p.bookmarkedBy || [];
      return bList.some((h) => normalizeHandle(h) === handle);
    });

    return res.status(200).json({
      success: true,
      count: bookmarked.length,
      posts: bookmarked.map((p) => formatPost(p, handle)),
    });
  } catch (error) {
    console.error("Error in getBookmarks:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch bookmarks",
      error: error.message,
    });
  }
};

/**
 * @desc Add a comment to a post
 * @route POST /api/posts/:id/comments
 */
export const addComment = async (req, res) => {
  try {
    const { id } = req.params;
    const { text } = req.body;

    if (!text || !text.trim()) {
      return res.status(400).json({
        success: false,
        message: "Comment text is required",
      });
    }

    let author = "Developer";
    let handle = "@developer";
    let avatar = "";

    if (req.body.author && typeof req.body.author === "object") {
      author = req.body.author.name || req.body.author.author || req.user?.name || "Developer";
      handle = req.body.author.handle || req.user?.handle || "@developer";
      avatar = req.body.author.avatar || req.user?.avatar || "";
    } else {
      author = req.body.name || req.user?.name || (typeof req.body.author === "string" ? req.body.author : "Developer");
      handle = req.user?.handle || req.body.handle || "@developer";
      avatar = req.user?.avatar || req.body.avatar || "";
    }

    if (!handle.startsWith("@")) handle = `@${handle}`;

    const newComment = {
      id: `c-${Date.now()}`,
      author: String(author).trim() || "Developer",
      handle: String(handle).trim() || "@developer",
      avatar: String(avatar || ""),
      text: text.trim(),
      time: "Just now",
      createdAt: new Date(),
    };

    if (isDbReady()) {
      let post = await findPostById(id);

      if (!post) {
        return res.status(404).json({
          success: false,
          message: "Post not found",
        });
      }

      if (!Array.isArray(post.commentsList)) post.commentsList = [];
      post.commentsList.push(newComment);
      post.stats = post.stats || {};
      post.stats.comments = post.commentsList.length;

      // Activity notification
      if (normalizeHandle(post.author.handle) !== handle) {
        try {
          await Activity.create({
            type: "collab",
            user: author,
            handle: handle,
            initials: req.user?.initials || "DEV",
            action: "commented on your project",
            target: post.title || post.content.slice(0, 30),
            recipientHandle: post.author.handle,
            hasAction: false,
            status: "none",
          });
        } catch (e) {
          console.warn("Could not create comment activity:", e.message);
        }
      }

      post.markModified("commentsList");
      post.markModified("stats");
      await post.save();

      return res.status(201).json({
        success: true,
        comment: newComment,
        commentsCount: post.stats.comments,
        commentsList: post.commentsList,
      });
    }

    // In-memory fallback
    const post = fallbackPosts.find((p) => p.id === id || p.customId === id || p._id === id);
    if (!post) {
      return res.status(404).json({
        success: false,
        message: "Post not found in memory",
      });
    }

    if (!post.commentsList) post.commentsList = [];
    post.commentsList.push(newComment);
    post.stats.comments = post.commentsList.length;

    if (post.author.handle !== handle) {
      inMemoryActivities.unshift({
        _id: `act-${Date.now()}`,
        id: `act-${Date.now()}`,
        type: "collab",
        user: author,
        handle: handle,
        initials: req.user?.initials || "DEV",
        action: "commented on your project",
        target: post.title || post.content.slice(0, 30),
        recipientHandle: post.author.handle,
        hasAction: false,
        status: "none",
        createdAt: new Date().toISOString(),
      });
    }

    return res.status(201).json({
      success: true,
      comment: newComment,
      commentsCount: post.stats.comments,
      commentsList: post.commentsList,
    });
  } catch (error) {
    console.error("Error in addComment:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to add comment",
      error: error.message,
    });
  }
};

/**
 * @desc Get comments for a post
 * @route GET /api/posts/:id/comments
 */
export const getComments = async (req, res) => {
  try {
    const { id } = req.params;

    if (isDbReady()) {
      const post = await findPostById(id);

      if (!post) {
        return res.status(404).json({
          success: false,
          message: "Post not found",
        });
      }

      return res.status(200).json({
        success: true,
        comments: post.commentsList || [],
      });
    }

    // In-memory fallback
    const post = fallbackPosts.find((p) => p.id === id || p.customId === id || p._id === id);
    return res.status(200).json({
      success: true,
      comments: post?.commentsList || [],
    });
  } catch (error) {
    console.error("Error in getComments:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch comments",
      error: error.message,
    });
  }
};

/**
 * @desc Record a post share and increment counter
 * @route POST /api/posts/:id/share
 */
export const recordShare = async (req, res) => {
  try {
    const { id } = req.params;

    if (isDbReady()) {
      const post = await findPostById(id);

      if (post) {
        post.stats.shares = (post.stats.shares || 0) + 1;
        await post.save();
        return res.status(200).json({
          success: true,
          sharesCount: post.stats.shares,
        });
      }
    }

    const post = fallbackPosts.find((p) => p.id === id || p.customId === id || p._id === id);
    if (post) {
      post.stats.shares = (post.stats.shares || 0) + 1;
      return res.status(200).json({
        success: true,
        sharesCount: post.stats.shares,
      });
    }

    return res.status(200).json({
      success: true,
      sharesCount: 1,
    });
  } catch (error) {
    console.error("Error in recordShare:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to record share",
      error: error.message,
    });
  }
};

/**
 * @desc Get a single post by id or customId
 * @route GET /api/posts/:id
 */
export const getPostById = async (req, res) => {
  try {
    const { id } = req.params;
    const userHandle = req.user?.handle || req.query.handle;

    if (isDbReady()) {
      const post = await findPostById(id);
      if (!post) {
        return res.status(404).json({
          success: false,
          message: "Post not found",
        });
      }
      return res.status(200).json({
        success: true,
        post: formatPost(post, userHandle),
      });
    }

    const post = fallbackPosts.find((p) => p.id === id || p.customId === id || p._id === id);
    if (!post) {
      return res.status(404).json({
        success: false,
        message: "Post not found",
      });
    }

    return res.status(200).json({
      success: true,
      post: formatPost(post, userHandle),
    });
  } catch (error) {
    console.error("Error in getPostById:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch post",
      error: error.message,
    });
  }
};
