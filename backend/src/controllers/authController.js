import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import { OAuth2Client } from "google-auth-library";
import { User } from "../models/User.js";

const JWT_SECRET = process.env.JWT_SECRET || "projectbuddy_dev_secret_key_2026";
const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// In-memory fallback if MongoDB is not connected
const inMemoryUsers = [
  {
    _id: "usr-default-1",
    id: "usr-default-1",
    name: "Pranjal Shukla",
    handle: "@pranjal",
    email: "pranjal@projectbuddy.dev",
    passwordHash: "$2a$10$abcdefghijklmnopqrstuvwxyz1234567890", // placeholder
    role: "Fullstack Developer & Architect",
    bio: "Building AI-assisted dev tools, distributed systems & high-performance web apps.",
    initials: "PS",
    skills: ["TypeScript", "Next.js", "Python", "MongoDB", "FastAPI"],
    createdAt: new Date().toISOString(),
  },
];

const isDbReady = () => mongoose.connection.readyState === 1;

const generateToken = (id, handle, email) => {
  return jwt.sign({ id, handle, email }, JWT_SECRET, {
    expiresIn: "30d",
  });
};

const formatHandle = (handle) => {
  let clean = handle.trim().toLowerCase();
  if (!clean.startsWith("@")) {
    clean = `@${clean}`;
  }
  return clean;
};

const getInitials = (name) => {
  if (!name) return "DEV";
  const parts = name.trim().split(" ");
  if (parts.length >= 2) {
    return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  }
  return name.slice(0, 2).toUpperCase();
};

const generateUniqueHandle = async (email, name) => {
  let base = (email ? email.split("@")[0] : name || "dev")
    .toLowerCase()
    .replace(/[^a-z0-9_]/g, "");
  if (!base) base = "dev";
  let handle = `@${base}`;

  if (isDbReady()) {
    let count = 1;
    while (await User.findOne({ handle })) {
      handle = `@${base}${count++}`;
    }
  } else {
    let count = 1;
    while (inMemoryUsers.some((u) => u.handle === handle)) {
      handle = `@${base}${count++}`;
    }
  }
  return handle;
};

/**
 * @desc Register a new user
 * @route POST /api/auth/register
 */
export const registerUser = async (req, res) => {
  try {
    const { name, handle, email, password, role, bio } = req.body;

    if (!name || !handle || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Please provide all required fields: name, handle, email, and password.",
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 6 characters long.",
      });
    }

    const formattedHandle = formatHandle(handle);
    const normalizedEmail = email.trim().toLowerCase();
    const initials = getInitials(name);

    if (isDbReady()) {
      // Check if user with same email or handle exists
      const existingEmail = await User.findOne({ email: normalizedEmail });
      if (existingEmail) {
        return res.status(400).json({
          success: false,
          message: "An account with this email address already exists.",
        });
      }

      const existingHandle = await User.findOne({ handle: formattedHandle });
      if (existingHandle) {
        return res.status(400).json({
          success: false,
          message: "This username/handle is already taken. Please choose another.",
        });
      }

      // Hash password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      const user = await User.create({
        name: name.trim(),
        handle: formattedHandle,
        email: normalizedEmail,
        password: hashedPassword,
        role: role?.trim() || "Fullstack Developer",
        bio: bio?.trim() || "Building cool software on ProjectBuddy.",
        initials,
        skills: ["React", "TypeScript", "Node.js"],
      });

      const token = generateToken(user._id, user.handle, user.email);

      return res.status(201).json({
        success: true,
        message: "Account created successfully!",
        token,
        user: {
          id: user._id,
          _id: user._id,
          name: user.name,
          handle: user.handle,
          email: user.email,
          role: user.role,
          bio: user.bio,
          initials: user.initials,
          skills: user.skills,
          createdAt: user.createdAt,
        },
      });
    } else {
      // In-memory fallback
      const existing = inMemoryUsers.find(
        (u) => u.email === normalizedEmail || u.handle === formattedHandle
      );
      if (existing) {
        return res.status(400).json({
          success: false,
          message: "User with this email or handle already exists in mock memory.",
        });
      }

      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      const mockId = `usr-${Date.now()}`;
      const newUser = {
        _id: mockId,
        id: mockId,
        name: name.trim(),
        handle: formattedHandle,
        email: normalizedEmail,
        passwordHash: hashedPassword,
        role: role?.trim() || "Fullstack Developer",
        bio: bio?.trim() || "Building cool software on ProjectBuddy.",
        initials,
        skills: ["React", "TypeScript", "Node.js"],
        createdAt: new Date().toISOString(),
      };
      inMemoryUsers.push(newUser);

      const token = generateToken(mockId, formattedHandle, normalizedEmail);

      return res.status(201).json({
        success: true,
        message: "Account created successfully (In-Memory Fallback)!",
        token,
        user: {
          id: mockId,
          _id: mockId,
          name: newUser.name,
          handle: newUser.handle,
          email: newUser.email,
          role: newUser.role,
          bio: newUser.bio,
          initials: newUser.initials,
          skills: newUser.skills,
          createdAt: newUser.createdAt,
        },
      });
    }
  } catch (error) {
    console.error("Error in registerUser:", error);
    return res.status(500).json({
      success: false,
      message: "Server error occurred during registration",
      error: error.message,
    });
  }
};

/**
 * @desc Authenticate user & get token
 * @route POST /api/auth/login
 */
export const loginUser = async (req, res) => {
  try {
    const { loginIdentifier, password } = req.body;

    if (!loginIdentifier || !password) {
      return res.status(400).json({
        success: false,
        message: "Please enter your email or handle, and your password.",
      });
    }

    const cleanIdentifier = loginIdentifier.trim().toLowerCase();
    const handleVariant = cleanIdentifier.startsWith("@")
      ? cleanIdentifier
      : `@${cleanIdentifier}`;

    if (isDbReady()) {
      const user = await User.findOne({
        $or: [
          { email: cleanIdentifier },
          { handle: cleanIdentifier },
          { handle: handleVariant },
        ],
      });

      if (!user) {
        return res.status(401).json({
          success: false,
          message: "Invalid credentials: User not found.",
        });
      }

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(401).json({
          success: false,
          message: "Invalid credentials: Password incorrect.",
        });
      }

      const token = generateToken(user._id, user.handle, user.email);

      return res.status(200).json({
        success: true,
        message: "Logged in successfully!",
        token,
        user: {
          id: user._id,
          _id: user._id,
          name: user.name,
          handle: user.handle,
          email: user.email,
          role: user.role,
          bio: user.bio,
          initials: user.initials,
          skills: user.skills,
          createdAt: user.createdAt,
        },
      });
    } else {
      // In-memory fallback
      const user = inMemoryUsers.find(
        (u) =>
          u.email === cleanIdentifier ||
          u.handle === cleanIdentifier ||
          u.handle === handleVariant
      );

      if (!user) {
        return res.status(401).json({
          success: false,
          message: "Invalid credentials in mock memory.",
        });
      }

      const token = generateToken(user.id, user.handle, user.email);

      return res.status(200).json({
        success: true,
        message: "Logged in successfully (In-Memory Fallback)!",
        token,
        user: {
          id: user.id,
          _id: user.id,
          name: user.name,
          handle: user.handle,
          email: user.email,
          role: user.role,
          bio: user.bio,
          initials: user.initials,
          skills: user.skills,
          createdAt: user.createdAt,
        },
      });
    }
  } catch (error) {
    console.error("Error in loginUser:", error);
    return res.status(500).json({
      success: false,
      message: "Server error occurred during login",
      error: error.message,
    });
  }
};

/**
 * @desc Get current authenticated user profile
 * @route GET /api/auth/me
 */
export const getMe = async (req, res) => {
  try {
    return res.status(200).json({
      success: true,
      user: req.user,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error fetching user profile",
      error: error.message,
    });
  }
};

/**
 * @desc Sign in or Sign up with Google OAuth (OpenID Connect / OAuth 2.0)
 * @route POST /api/auth/google
 */
export const googleAuth = async (req, res) => {
  try {
    const { credential, accessToken, code, devUser } = req.body;

    if (!credential && !accessToken && !code && !devUser) {
      return res.status(400).json({
        success: false,
        message: "Missing Google authentication data. Please provide credential, accessToken, code, or devUser.",
      });
    }

    let email = null;
    let name = null;
    let picture = "";
    let sub = null;

    // 0. Development Simulator mode (when running locally without Google Cloud credentials)
    if (devUser && (process.env.NODE_ENV !== "production" || !process.env.GOOGLE_CLIENT_ID)) {
      email = devUser.email;
      name = devUser.name || (email ? email.split("@")[0] : "Google User");
      picture = devUser.picture || "";
      sub = devUser.sub || `google_dev_${Buffer.from(email || "test").toString("hex").slice(0, 16)}`;
    }

    // 1. Verify Google OpenID Connect ID Token (JWT)
    if (credential) {
      try {
        if (process.env.GOOGLE_CLIENT_ID) {
          const ticket = await googleClient.verifyIdToken({
            idToken: credential,
            audience: process.env.GOOGLE_CLIENT_ID,
          });
          const payload = ticket.getPayload();
          if (payload && payload.email) {
            email = payload.email;
            name = payload.name;
            picture = payload.picture || "";
            sub = payload.sub;
          }
        }
      } catch (verifyErr) {
        console.warn("Local verifyIdToken failed, falling back to Google tokeninfo endpoint:", verifyErr.message);
      }

      // If local verification didn't produce payload or client id not set, verify with Google's official tokeninfo API
      if (!email) {
        try {
          const tokenInfoRes = await fetch(
            `https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(credential)}`
          );
          if (tokenInfoRes.ok) {
            const tokenInfo = await tokenInfoRes.json();
            if (tokenInfo && tokenInfo.email) {
              // Validate issuer
              if (
                tokenInfo.iss === "accounts.google.com" ||
                tokenInfo.iss === "https://accounts.google.com"
              ) {
                // If client id configured, verify audience
                if (
                  process.env.GOOGLE_CLIENT_ID &&
                  tokenInfo.aud !== process.env.GOOGLE_CLIENT_ID
                ) {
                  return res.status(401).json({
                    success: false,
                    message: "Invalid Google token: Client ID / Audience mismatch.",
                  });
                }
                email = tokenInfo.email;
                name = tokenInfo.name || tokenInfo.email.split("@")[0];
                picture = tokenInfo.picture || "";
                sub = tokenInfo.sub;
              }
            }
          }
        } catch (fetchErr) {
          console.warn("Google tokeninfo endpoint error:", fetchErr.message);
        }
      }
    }

    // 2. Verify Google OAuth 2.0 Access Token via userinfo endpoint
    if (!email && accessToken) {
      try {
        const userInfoRes = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });
        if (userInfoRes.ok) {
          const userInfo = await userInfoRes.json();
          if (userInfo && userInfo.email) {
            email = userInfo.email;
            name = userInfo.name || userInfo.email.split("@")[0];
            picture = userInfo.picture || "";
            sub = userInfo.sub;
          }
        }
      } catch (userinfoErr) {
        console.warn("Google userinfo endpoint error:", userinfoErr.message);
      }
    }

    // 3. Verify OAuth 2.0 Authorization Code exchange if code is provided
    if (!email && code && process.env.GOOGLE_CLIENT_SECRET) {
      try {
        const client = new OAuth2Client(
          process.env.GOOGLE_CLIENT_ID,
          process.env.GOOGLE_CLIENT_SECRET,
          "postmessage"
        );

        let tokens = null;
        // Attempt exchange with 'postmessage' (standard for GIS popup clients)
        try {
          const res = await client.getToken({
            code,
            redirect_uri: "postmessage",
          });
          tokens = res.tokens;
        } catch (postmsgErr) {
          console.warn("postmessage code exchange failed, attempting with client URL:", postmsgErr.message);
          try {
            const res = await client.getToken({
              code,
              redirect_uri: process.env.CLIENT_URL || "http://localhost:3000",
            });
            tokens = res.tokens;
          } catch (urlErr) {
            console.warn("client URL code exchange also failed:", urlErr.message);
          }
        }

        if (tokens) {
          if (tokens.id_token) {
            try {
              const ticket = await client.verifyIdToken({
                idToken: tokens.id_token,
                audience: process.env.GOOGLE_CLIENT_ID,
              });
              const payload = ticket.getPayload();
              if (payload && payload.email) {
                email = payload.email;
                name = payload.name;
                picture = payload.picture || "";
                sub = payload.sub;
              }
            } catch (verifyErr) {
              console.warn("id_token verification error:", verifyErr.message);
            }
          }

          // Fallback: If id_token didn't resolve email, fetch via userinfo using tokens.access_token
          if (!email && tokens.access_token) {
            try {
              const userInfoRes = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
                headers: { Authorization: `Bearer ${tokens.access_token}` },
              });
              if (userInfoRes.ok) {
                const userInfo = await userInfoRes.json();
                if (userInfo && userInfo.email) {
                  email = userInfo.email;
                  name = userInfo.name || userInfo.email.split("@")[0];
                  picture = userInfo.picture || "";
                  sub = userInfo.sub;
                }
              }
            } catch (uErr) {
              console.warn("Userinfo fallback error during code exchange:", uErr.message);
            }
          }
        }
      } catch (codeErr) {
        console.warn("Google authorization code exchange general error:", codeErr.message);
      }
    }

    if (!email || !sub) {
      return res.status(401).json({
        success: false,
        message: "Invalid or expired Google authentication credential. Verification failed.",
      });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const initials = getInitials(name || "Google User");

    if (isDbReady()) {
      // Find user by email or googleId
      let user = await User.findOne({
        $or: [{ email: normalizedEmail }, { googleId: sub }],
      });

      if (user) {
        // Link googleId and avatar if not already present
        let updated = false;
        if (!user.googleId && sub) {
          user.googleId = sub;
          updated = true;
        }
        if (!user.avatar && picture) {
          user.avatar = picture;
          updated = true;
        }
        if (updated) {
          await user.save();
        }
      } else {
        // New user: Create new account via Google
        const handle = await generateUniqueHandle(normalizedEmail, name);
        user = await User.create({
          name: name || normalizedEmail.split("@")[0],
          handle,
          email: normalizedEmail,
          googleId: sub,
          authProvider: "google",
          avatar: picture,
          role: "Fullstack Developer",
          bio: "Building cool projects on ProjectBuddy with Google account.",
          initials,
          skills: ["React", "TypeScript", "Node.js"],
        });
      }

      const token = generateToken(user._id, user.handle, user.email);

      return res.status(200).json({
        success: true,
        message: "Google authentication successful!",
        token,
        user: {
          id: user._id,
          _id: user._id,
          name: user.name,
          handle: user.handle,
          email: user.email,
          role: user.role,
          bio: user.bio,
          avatar: user.avatar,
          initials: user.initials,
          skills: user.skills,
          authProvider: user.authProvider,
          createdAt: user.createdAt,
        },
      });
    } else {
      // In-memory fallback
      let user = inMemoryUsers.find(
        (u) => u.email === normalizedEmail || u.googleId === sub
      );

      if (!user) {
        const handle = await generateUniqueHandle(normalizedEmail, name);
        const mockId = `usr-google-${Date.now()}`;
        user = {
          _id: mockId,
          id: mockId,
          name: name || normalizedEmail.split("@")[0],
          handle,
          email: normalizedEmail,
          googleId: sub,
          authProvider: "google",
          avatar: picture,
          role: "Fullstack Developer",
          bio: "Building cool projects on ProjectBuddy with Google account.",
          initials,
          skills: ["React", "TypeScript", "Node.js"],
          createdAt: new Date().toISOString(),
        };
        inMemoryUsers.push(user);
      }

      const token = generateToken(user.id || user._id, user.handle, user.email);

      return res.status(200).json({
        success: true,
        message: "Google authentication successful (In-Memory Fallback)!",
        token,
        user: {
          id: user.id || user._id,
          _id: user.id || user._id,
          name: user.name,
          handle: user.handle,
          email: user.email,
          role: user.role,
          bio: user.bio,
          avatar: user.avatar,
          initials: user.initials,
          skills: user.skills,
          authProvider: user.authProvider,
          createdAt: user.createdAt,
        },
      });
    }
  } catch (error) {
    console.error("Error in googleAuth:", error);
    return res.status(500).json({
      success: false,
      message: "Server error occurred during Google authentication",
      error: error.message,
    });
  }
};
