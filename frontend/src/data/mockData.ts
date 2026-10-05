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
    shares?: number;
  };
  userLiked?: boolean;
  userBookmarked?: boolean;
  commentsList?: Array<{
    id: string;
    author: string;
    handle: string;
    text: string;
    time: string;
    avatar?: string;
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
    title: "AI Code Reviewer & Auto-Fixer",
    matchScore: 98,
    category: "ai",
    description: "Automated PR reviews and architectural anomaly detection using custom fine-tuned LLMs with WebAssembly AST parser.",
    tags: ["Rust", "LLMs", "Wasm", "TypeScript", "Python"],
    members: "3 / 4",
    team: {
      current: 3,
      max: 4,
      lookingFor: ["Wasm Specialist", "Security Auditor"],
    },
    author: {
      name: "Sarah Chen",
      handle: "@schen",
      fallback: "SC",
      role: "Systems & Rust Architect",
      avatarUrl: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80",
    },
    stars: 142,
  },
  {
    id: "sp-2",
    title: "Vulkan High-Perf 3D Engine",
    matchScore: 92,
    category: "systems",
    description: "High performance 3D graphics pipeline using Rust, wgpu, and custom compute shaders for procedural voxel simulations.",
    tags: ["Rust", "Vulkan", "Shader", "C++", "WebGPU"],
    members: "2 / 3",
    team: {
      current: 2,
      max: 3,
      lookingFor: ["Shader Developer", "Math / Physics Eng"],
    },
    author: {
      name: "Alex Rivera",
      handle: "@arivera",
      fallback: "AR",
      role: "Systems Specialist",
      avatarUrl: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80",
    },
    stars: 89,
  },
  {
    id: "sp-3",
    title: "Decentralized KV Store & Mesh",
    matchScore: 89,
    category: "web3",
    description: "Peer-to-peer eventual consistency cache across edge nodes using Raft consensus and libp2p gossiping protocol.",
    tags: ["Go", "Raft", "Libp2p", "Docker", "Distributed"],
    members: "1 / 4",
    team: {
      current: 1,
      max: 4,
      lookingFor: ["Go Backend Eng", "Network Protocol Dev"],
    },
    author: {
      name: "Elena Rostova",
      handle: "@elena_codes",
      fallback: "ER",
      role: "Distributed Systems Lead",
      avatarUrl: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80",
    },
    stars: 215,
  },
  {
    id: "sp-4",
    title: "Zero-Latency Realtime Audio Mesh",
    matchScore: 95,
    category: "systems",
    description: "Decentralized low-latency spatial audio conferencing server built on WebRTC data channels and WebAudio worklets.",
    tags: ["TypeScript", "WebRTC", "Rust", "Node.js", "Docker"],
    members: "2 / 5",
    team: {
      current: 2,
      max: 5,
      lookingFor: ["WebRTC Engineer", "Frontend UI Eng"],
    },
    author: {
      name: "Pranjal Shukla",
      handle: "@pranjal",
      fallback: "PS",
      role: "Lead Fullstack Architect",
    },
    stars: 178,
  },
];

export const suggestedPeople = [
  {
    id: "u-1",
    name: "Alex Rivera",
    handle: "@arivera",
    role: "Fullstack & Cloud Systems Engineer",
    bio: "Distributed architectures, Go, Rust, microservices, and Kubernetes clusters. Building next-gen cloud infra.",
    location: "Austin, TX / Remote",
    availability: "available" as const,
    experienceLevel: "senior" as const,
    skills: ["TypeScript", "Next.js", "Docker", "Go", "Rust", "PostgreSQL", "Kubernetes"],
    avatar: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80",
    initials: "AR",
    stats: {
      activeProjectsCount: 3,
      teamsJoinedCount: 4,
      collaboratorsCount: 12,
      matchScore: 92,
    },
    githubUrl: "https://github.com",
    linkedinUrl: "https://linkedin.com",
    twitterUrl: "https://x.com",
  },
  {
    id: "u-2",
    name: "Sarah Chen",
    handle: "@schen",
    role: "Systems & Rust Architect",
    bio: "Obsessed with low-level systems, compiler optimizations, computer vision, and edge neural processing.",
    location: "San Francisco, CA",
    availability: "open_to_collab" as const,
    experienceLevel: "lead" as const,
    skills: ["Rust", "Kubernetes", "gRPC", "Python", "PyTorch", "C++", "Docker"],
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80",
    initials: "SC",
    stats: {
      activeProjectsCount: 4,
      teamsJoinedCount: 6,
      collaboratorsCount: 18,
      matchScore: 97,
    },
    githubUrl: "https://github.com",
    linkedinUrl: "https://linkedin.com",
    twitterUrl: "https://x.com",
  },
  {
    id: "u-3",
    name: "Devon Marcus",
    handle: "@dmarcus",
    role: "AI / ML Researcher & Vector DB Specialist",
    bio: "Building RAG pipelines, fine-tuning deep learning models, and optimizing GPU inference clusters.",
    location: "Seattle, WA / Remote",
    availability: "open_to_collab" as const,
    experienceLevel: "senior" as const,
    skills: ["PyTorch", "CUDA", "FastAPI", "Python", "Next.js", "OpenAI", "Docker"],
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
    initials: "DM",
    stats: {
      activeProjectsCount: 2,
      teamsJoinedCount: 3,
      collaboratorsCount: 9,
      matchScore: 94,
    },
    githubUrl: "https://github.com",
    linkedinUrl: "https://linkedin.com",
    twitterUrl: "https://x.com",
  },
  {
    id: "u-4",
    name: "Elena Rostova",
    handle: "@elena_codes",
    role: "Frontend Architect & Design Technologist",
    bio: "Pixel perfectionist, creator of dark OLED theme specs, micro-interactions, and high-performance WebGL interfaces.",
    location: "Berlin, Germany / Remote",
    availability: "available" as const,
    experienceLevel: "lead" as const,
    skills: ["React", "Next.js", "TailwindCSS", "TypeScript", "Three.js", "CSS"],
    avatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80",
    initials: "ER",
    stats: {
      activeProjectsCount: 5,
      teamsJoinedCount: 7,
      collaboratorsCount: 22,
      matchScore: 99,
    },
    githubUrl: "https://github.com",
    linkedinUrl: "https://linkedin.com",
    twitterUrl: "https://x.com",
  },
  {
    id: "u-5",
    name: "Priya Patel",
    handle: "@priya",
    role: "Web3 Protocols & Smart Contract Auditor",
    bio: "Security-first Solidity development, EVM mechanics, decentralized governance, and cross-chain messaging.",
    location: "London, UK / Remote",
    availability: "open_to_collab" as const,
    experienceLevel: "senior" as const,
    skills: ["Solidity", "TypeScript", "Ethers.js", "Rust", "Tailwind", "Radix"],
    avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80",
    initials: "PP",
    stats: {
      activeProjectsCount: 3,
      teamsJoinedCount: 5,
      collaboratorsCount: 15,
      matchScore: 91,
    },
    githubUrl: "https://github.com",
    linkedinUrl: "https://linkedin.com",
    twitterUrl: "https://x.com",
  },
];

