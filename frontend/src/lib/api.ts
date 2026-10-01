const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

export interface User {
  id?: string;
  _id?: string;
  name: string;
  handle: string;
  email: string;
  role?: string;
  bio?: string;
  avatar?: string;
  initials?: string;
  skills?: string[];
  createdAt?: string;
}

export interface RegisterPayload {
  name: string;
  handle: string;
  email: string;
  password: string;
  role?: string;
  bio?: string;
}

export interface LoginPayload {
  loginIdentifier: string;
  password: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  token?: string;
  user?: User;
  requireOtp?: boolean;
  email?: string;
}

export interface ActivityItem {
  _id?: string;
  id?: string;
  customId?: string;
  type: "join_request" | "like" | "star" | "collab" | "mention";
  user: string;
  handle: string;
  initials: string;
  action: string;
  target: string;
  role?: string;
  recipientHandle?: string;
  joinRequestId?: string;
  hasAction?: boolean;
  status?: "pending" | "accepted" | "declined" | "none";
  createdAt?: string;
}

export interface JoinRequestPayload {
  projectId: string;
  projectTitle: string;
  projectAuthorName?: string;
  projectAuthorHandle?: string;
  applicantName?: string;
  applicantHandle?: string;
  applicantInitials?: string;
  role: string;
  githubUrl?: string;
  pitch: string;
}

export const api = {
  // Auth: Register new user (initiates email OTP verification)
  async register(payload: RegisterPayload): Promise<AuthResponse> {
    const res = await fetch(`${API_BASE_URL}/auth/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error(data.message || "Failed to create account");
    }
    return data;
  },

  // Auth: Verify 6-digit OTP code to finalize registration
  async verifyOtp(payload: { email: string; otp: string }): Promise<AuthResponse> {
    const res = await fetch(`${API_BASE_URL}/auth/verify-otp`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error(data.message || "Invalid or expired verification code");
    }
    return data;
  },

  // Auth: Resend verification code
  async resendOtp(payload: { email: string }): Promise<{ success: boolean; message: string }> {
    const res = await fetch(`${API_BASE_URL}/auth/resend-otp`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error(data.message || "Failed to resend verification code");
    }
    return data;
  },

  // Auth: Login user
  async login(payload: LoginPayload): Promise<AuthResponse> {
    const res = await fetch(`${API_BASE_URL}/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error(data.message || "Failed to login");
    }
    return data;
  },

  // Auth: Google Sign-in / Sign-up (OpenID Connect / OAuth 2.0)
  async googleAuth(payload: {
    credential?: string;
    accessToken?: string;
    code?: string;
    mode?: "login" | "register";
    devUser?: {
      email: string;
      name: string;
      picture?: string;
      sub?: string;
    };
  }): Promise<AuthResponse> {
    const res = await fetch(`${API_BASE_URL}/auth/google`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error(data.message || "Failed to authenticate with Google");
    }
    return data;
  },

  // Auth: Fetch Google Client ID (from backend if not in frontend env)
  async getGoogleClientId(): Promise<string> {
    try {
      const res = await fetch(`${API_BASE_URL}/auth/google/client-id`);
      if (res.ok) {
        const data = await res.json();
        return data.clientId || "";
      }
    } catch {
      // Backend not reached or offline
    }
    return "";
  },

  // Auth: Get current authenticated user
  async getMe(token: string): Promise<User> {
    const res = await fetch(`${API_BASE_URL}/auth/me`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error(data.message || "Failed to get user profile");
    }
    return data.user;
  },

  // Auth: Update user profile (photo, bio, skills, role, etc.)
  async updateProfile(
    payload: Partial<User>,
    token?: string
  ): Promise<{ success: boolean; message: string; user: User }> {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }
    const res = await fetch(`${API_BASE_URL}/auth/profile`, {
      method: "PUT",
      headers,
      body: JSON.stringify(payload),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error(data.message || "Failed to update profile");
    }
    return data;
  },

  // Fetch activities feed
  async getActivities(recipientHandle?: string): Promise<ActivityItem[]> {
    try {
      const url = recipientHandle
        ? `${API_BASE_URL}/activities?recipientHandle=${encodeURIComponent(recipientHandle)}`
        : `${API_BASE_URL}/activities`;
      const res = await fetch(url, {
        cache: "no-store",
      });
      if (!res.ok) throw new Error("Failed to fetch activities");
      const json = await res.json();
      return json.data || [];
    } catch (err) {
      console.warn("Backend not reachable for activities, using local fallback", err);
      throw err;
    }
  },

  // Submit a join request
  async submitJoinRequest(payload: JoinRequestPayload) {
    const res = await fetch(`${API_BASE_URL}/join-requests`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || "Failed to submit join request");
    }
    return res.json();
  },

  // Respond to a join request (accept or decline)
  async respondToJoinRequest(
    id: string,
    status: "accepted" | "declined",
    activityData?: Partial<ActivityItem>
  ) {
    // Try activities respond endpoint first, then join-requests
    try {
      const res = await fetch(`${API_BASE_URL}/activities/${id}/respond`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status, activityData }),
      });
      if (res.ok) {
        return res.json();
      }
    } catch {
      // Fallback to join-requests endpoint
    }

    const res = await fetch(`${API_BASE_URL}/join-requests/${id}/respond`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ status, activityData }),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || `Failed to ${status} request`);
    }
    return res.json();
  },
};
