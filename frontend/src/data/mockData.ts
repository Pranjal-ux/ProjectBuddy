export interface Post {
  id: string;
  author: {
    name: string;
    handle: string;
    avatarUrl?: string;
    fallback: string;
    verified?: boolean;
    role?: string;
  };
  createdAt: string;
  type: "project" | "telemetry" | "code" | "discussion";
  title?: string;
  content: string;
  tags?: string[];
  team?: {
    current: number;
    max: number;
    lookingFor: string[];
  };
  telemetry?: {
    filename: string;
    spec: string;
    description: string;
    imageUrl: string;
  };
  codeSnippet?: {
    filename: string;
    language: string;
    code: string;
  };
  stats: {
    likes: number;
    comments: number;
    reposts: number;
    bookmarks: number;
  };
  userLiked?: boolean;
  userBookmarked?: boolean;
  commentsList?: Array<{
    id: string;
    author: string;
    handle: string;
    text: string;
    time: string;
  }>;
}

export const initialPosts: Post[] = [
  {
    id: "post-1",
    author: {
      name: "Pranjal Shukla",
      handle: "@pranjal",
      fallback: "PS",
      verified: true,
      role: "Lead Creator",
    },
    createdAt: "Just now",
    type: "project",
    title: "AI-based Pothole Detection System",
    content: "Building an AI-based pothole and road defect detection system using YOLO + FastAPI with real-time video stream processing and OpenStreetMap overlays.",
    tags: ["Python", "YOLO", "FastAPI", "React", "PyTorch"],
    team: {
      current: 2,
      max: 4,
      lookingFor: ["React Developer", "UI Designer"],
    },
    stats: {
      likes: 38,
      comments: 7,
      reposts: 14,
      bookmarks: 12,
    },
    userLiked: true,
    commentsList: [
      {
        id: "c-1",
        author: "Sarah Chen",
        handle: "@schen",
        text: "Are you running inference edge-side or sending frames to an inference cluster?",
        time: "10m ago",
      },
      {
        id: "c-2",
        author: "Pranjal Shukla",
        handle: "@pranjal",
        text: "Currently using ONNX runtime directly in browser for pre-filtering, then FastAPI for heavier tensor processing!",
        time: "5m ago",
      },
    ],
  },
  {
    id: "post-2",
    author: {
      name: "Alex Morgan",
      handle: "@alexm_dark",
      fallback: "AM",
      verified: true,
      role: "Design Technologist",
      avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
    },
    createdAt: "2h ago",
    type: "telemetry",
    title: "OLED Pitch-Black Design Engine",
    content: "Pitch-black OLED aesthetic with deep black #000000 background and crisp contrast typography. Battery-saving, pixel-level perfection for prolonged technical reading.",
    tags: ["OLED", "TailwindCSS", "DesignSystems", "DarkTheme"],
    telemetry: {
      filename: "OLED_Telemetry_Specs.json",
      spec: "SPEC v2.4",
      description: "0.000 nits true black level baseline",
      imageUrl: "https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&auto=format&fit=crop&q=80",
    },
    stats: {
      likes: 842,
      comments: 24,
      reposts: 118,
      bookmarks: 312,
    },
    commentsList: [
      {
        id: "c-3",
        author: "Elena Rostova",
        handle: "@elena_codes",
        text: "True OLED black with 1px #171717 borders makes long dev sessions so much easier on the eyes.",
        time: "1h ago",
      },
    ],
  },
  {
    id: "post-3",
    author: {
      name: "Rahul Sharma",
      handle: "@rahul",
      fallback: "RS",
      role: "AI Engineer",
    },
    createdAt: "5h ago",
    type: "project",
    title: "AI Resume Analyzer & Matchmaker",
    content: "AI Resume Analyzer using NLP embeddings and Next.js. Parsing PDF ASTs to calculate semantic skill overlap with JD vectors. Looking for Python Developer to scale embedding worker queues.",
    tags: ["Python", "NLP", "React", "OpenAI", "pgvector"],
    team: {
      current: 1,
      max: 3,
      lookingFor: ["Python Developer", "Data Engineer"],
    },
    stats: {
      likes: 42,
      comments: 12,
      reposts: 8,
      bookmarks: 19,
    },
  },
  {
    id: "post-4",
    author: {
      name: "Elena Rostova",
      handle: "@elena_codes",
      fallback: "ER",
      verified: true,
      role: "Frontend Architect",
      avatarUrl: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80",
    },
    createdAt: "7h ago",
    type: "code",
    title: "Zero Glow Bleed Token Configuration",
    content: "To guarantee zero glow bleed on dark-room monitors, keep all surface fills down to #000000, secondary containers at #0a0a0a, and stroke colors below #222222.",
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
      likes: 519,
      comments: 18,
      reposts: 46,
      bookmarks: 230,
    },
  },
  {
    id: "post-5",
    author: {
      name: "Priya Patel",
      handle: "@priya",
      fallback: "PP",
      role: "Open Source Contributor",
    },
    createdAt: "1d ago",
    type: "project",
    title: "Open Source Web3 Design System",
    content: "Open Source Design System for Web3 apps. Building accessible wallet connectors, transaction modals, and block explorers with Radix and Tailwind.",
    tags: ["TypeScript", "Tailwind", "Radix", "Ethers.js"],
    team: {
      current: 3,
      max: 5,
      lookingFor: ["UI Engineers", "Docs Writer"],
    },
    stats: {
      likes: 89,
      comments: 19,
      reposts: 22,
      bookmarks: 45,
    },
  },
];

export const suggestedProjects = [
  {
    id: "sp-1",
    title: "AI Code Reviewer",
    matchScore: 98,
    description: "Automated PR reviews using custom fine-tuned LLMs.",
    tags: ["Rust", "LLMs", "Wasm"],
    members: "3 / 4",
  },
  {
    id: "sp-2",
    title: "Rust Game Engine",
    matchScore: 92,
    description: "High performance 3D graphics pipeline using wgpu.",
    tags: ["Rust", "Vulkan", "Shader"],
    members: "2 / 3",
  },
  {
    id: "sp-3",
    title: "Decentralized KV Store",
    matchScore: 89,
    description: "Peer-to-peer eventual consistency cache across Edge nodes.",
    tags: ["Go", "Raft", "Libp2p"],
    members: "1 / 4",
  },
];

export const suggestedPeople = [
  {
    id: "u-1",
    name: "Alex Rivera",
    handle: "@arivera",
    role: "Fullstack Engineer",
    skills: ["TypeScript", "Next.js", "Docker"],
    avatar: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80",
    initials: "AR",
  },
  {
    id: "u-2",
    name: "Sarah Chen",
    handle: "@schen",
    role: "Systems & Rust Architect",
    skills: ["Rust", "Kubernetes", "gRPC"],
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80",
    initials: "SC",
  },
  {
    id: "u-3",
    name: "Devon Marcus",
    handle: "@dmarcus",
    role: "AI / ML Researcher",
    skills: ["PyTorch", "CUDA", "FastAPI"],
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
    initials: "DM",
  },
];
