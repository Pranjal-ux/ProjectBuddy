# ProjectBuddy Backend API

Modular REST API service built with **Node.js**, **Express.js**, and **MongoDB** (Mongoose).

---

## 🚀 Quick Start

### 1. Install dependencies
```bash
cd backend
npm install
```

### 2. Configure MongoDB Atlas Free Tier Cluster
1. Create a free cluster at [MongoDB Atlas](https://cloud.mongodb.com).
2. Go to **Network Access** and add your IP (or `0.0.0.0/0` for development).
3. Go to **Database Access** and create a user (e.g., `admin`).
4. Click **Connect** -> **Drivers** -> Copy the connection string.
5. In `backend/.env`, paste your connection string:
```env
PORT=5000
MONGO_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/projectbuddy?retryWrites=true&w=majority
CLIENT_URL=http://localhost:3000
NODE_ENV=development
```

*(Note: The server has an automatic in-memory fallback, so all features function seamlessly even before Atlas credentials are configured!)*

### 3. Run the Backend Server
```bash
# Development mode with hot-reload
npm run dev

# Or standard production mode
npm start
```

---

## 📡 API Endpoints

### Profile Section (`/api/profile`)
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `GET` | `/api/profile/me` | Bearer Token | Get authenticated user's profile with computed stats |
| `PUT` | `/api/profile/me` | Bearer Token | Update profile (role, bio, location, socials, customStatus, skills, availability) |
| `POST` | `/api/profile/me/avatar` | Bearer Token | Update or upload profile avatar image |
| `DELETE` | `/api/profile/me/avatar` | Bearer Token | Remove custom avatar (revert to initials) |
| `POST` | `/api/profile/me/cover` | Bearer Token | Update cover banner image |
| `DELETE` | `/api/profile/me/cover` | Bearer Token | Remove cover banner |
| `PUT` | `/api/profile/me/skills` | Bearer Token | Update, add, or remove verified developer skills |
| `GET` | `/api/profile/search` | Public | Search developers by skill, role, availability, or keyword |
| `GET` | `/api/profile/:identifier` | Public | View public profile by `@handle` or user ID |
| `GET` | `/api/profile/:identifier/projects` | Public | Get authored or joined projects |
| `GET` | `/api/profile/:identifier/activities` | Public | Get developer activity & contribution history |
| `GET` | `/api/profile/:identifier/stats` | Public | Get live synergy match score & profile stats |

### Join Requests (`/api/join-requests`)
| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/join-requests` | Submit an application to join a project team |
| `GET` | `/api/join-requests` | List join requests (supports `?recipientHandle=@pranjal&status=pending`) |
| `PATCH` | `/api/join-requests/:id/respond` | Accept or Decline a request (`{ "status": "accepted" \| "declined" }`) |

### Activities & Alerts (`/api/activities`)
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/activities` | Get activity feed & notifications |
| `POST` | `/api/activities/seed` | Reset/seed default activity alerts |

### System Health
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/health` | Health check & MongoDB connection status |

