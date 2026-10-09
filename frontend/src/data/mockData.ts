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

export const initialPosts: Post[] = [];
export const suggestedProjects: any[] = [];
export const suggestedPeople: any[] = [];

