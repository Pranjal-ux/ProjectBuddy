<div align="center">

# 🚀 ProjectBuddy (projectbuddyapp)

### The Premier Developer Network & Open Source Project Collaboration Platform

[![Live App](https://img.shields.io/badge/Live_App-projectbuddyapp.vercel.app-10b981?style=for-the-badge&logo=vercel&logoColor=white)](https://projectbuddyapp.vercel.app)
[![Next.js](https://img.shields.io/badge/Next.js_16-000000?style=for-the-badge&logo=next.js&logoColor=white)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React_19-20232a?style=for-the-badge&logo=react&logoColor=61dafb)](https://react.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_v4-38bdf8?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-47A248?style=for-the-badge&logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![Typography](https://img.shields.io/badge/Font-Apple_SF_Pro-white?style=for-the-badge&logo=apple&logoColor=black)](https://developer.apple.com/fonts/)
[![License](https://img.shields.io/badge/License-MIT-blue?style=for-the-badge)](LICENSE)

<br />

<p align="center">
  <strong>Stop coding alone.</strong> Find your dream co-builders, discover trending open-source initiatives, recruit teammates, and ship real-world software together.
</p>

[**Explore Live Demo**](https://projectbuddyapp.vercel.app) • [**Watch Launch Video**](#-launch-video--walkthrough) • [**Key Features**](#-key-features) • [**Tech Stack**](#-tech-stack) • [**Quick Start**](#-getting-started)

</div>

---

## 🎬 Launch Video & Walkthrough

> *"Still coding alone? Find your team on ProjectBuddy."*

<div align="center">

[![ProjectBuddy Launch Video](brag-output/brag.jpg)](brag-output/brag.mp4)

*Click the preview above to watch the official **ProjectBuddy Launch Film** ([brag.mp4](brag-output/brag.mp4)), showcasing real-time team discovery, synergy match algorithms, and live collaboration.*

</div>

---

## 🌟 Why ProjectBuddy?

Every week, brilliant software engineers conceive game-changing projects that die in isolation because finding motivated, skilled co-builders is painful.

**ProjectBuddy** bridges this gap:
- **Discover Open Projects:** Browse vetted developer initiatives with transparent tech stack tags and clear open roles.
- **Recruit Dream Teammates:** Broadcast open positions (Frontend, Backend, AI/ML, UI/UX, Smart Contracts) with live member capacity tracking.
- **Synergy Matching:** Smart algorithm compares developer skills to project needs to compute an instant synergy match score.
- **Real-Time Collaboration:** 1-on-1 direct messaging, team discussions, and code snippet reviews.
- **Developer-Native Aesthetics:** Powered by authentic Apple SF Pro typography, dark charcoal and pitch-black OLED modes, with responsiveness across mobile, desktop, 1440p, and 4K ultra-wide monitors.

---

## ⚡ Key Features

| Feature | Description |
|---|---|
| 🔍 **Project Discovery** | Filter initiatives by categories (AI/ML, Web3, Fullstack, Mobile, DevOps) with synergy match percentages. |
| 👥 **Team Recruitment Engine** | Post initiatives with open team slots (e.g., `2 / 4 devs`) and instant "Request to Join" workflow. |
| 💻 **Clean Code Showcases** | Share formatted, syntax-highlighted code snippets with copy button — automatically hidden unless code is attached. |
| 💬 **Live Developer Chat** | Twitter/X-style direct messages, unread counters, code attachments, and online indicators. |
| 📊 **Developer Profiles** | Custom avatars, bio, role badges, GitHub/Twitter/LinkedIn social links, follower network, and bookmarked projects. |
| 🔔 **Activity & Application Alerts** | Real-time notifications for incoming team join requests with 1-click Accept / Reject controls. |
| 🌓 **Dual Visual Themes** | Seamless toggle between Charcoal Dark Mode and pure Pitch-Black OLED Mode. |
| 📱 **Full Screen Responsiveness** | Tailored UI that scales gracefully from mobile viewports to 4K ultra-wide monitors. |
| 🔎 **Google SEO Position #1** | Schema.org JSON-LD (`WebSite`, `SoftwareApplication`, `FAQPage`, `Organization`), semantic `<h1>` structure, robots.txt, and sitemap.xml. |

---

## 🛠 Tech Stack

### Frontend (`/frontend`)
- **Framework:** Next.js 16 (App Router with Turbopack)
- **UI Library:** React 19
- **Styling:** Tailwind CSS v4 & Vanilla CSS Variables
- **Typography:** Self-hosted Apple SF Pro (`SF Pro Display` & `SF Pro Text` woff2) with native negative tracking
- **Icons:** Lucide React & Custom SVG Brand Icons
- **State & Context:** React Context API (`AuthContext`, `NotificationContext`)
- **Deployment:** Vercel

### Backend (`/backend`)
- **Runtime:** Node.js (ES Modules)
- **Framework:** Express.js
- **Database:** MongoDB with Mongoose ODM
- **Authentication:** JWT (JSON Web Tokens) with Secure OTP Email Verification via Nodemailer
- **Architecture:** Controller-Service-Model RESTful API pattern
- **Deployment:** Render / Node Cloud

---

## 🚀 Getting Started

Follow these steps to run ProjectBuddy locally on your machine:

### Prerequisites
- [Node.js](https://nodejs.org/) (v18.0.0 or later)
- [npm](https://www.npmjs.com/) or [pnpm](https://pnpm.io/)
- [MongoDB](https://www.mongodb.com/) (Local instance or MongoDB Atlas URI)

### 1. Clone the Repository
```bash
git clone https://github.com/Pranjal-ux/ProjectBuddy.git
cd ProjectBuddy
```

### 2. Configure Backend
```bash
cd backend
npm install
```

Create a `.env` file in `backend/`:
```env
PORT=5000
MONGO_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/projectbuddy?retryWrites=true&w=majority
JWT_SECRET=your_super_secret_jwt_key
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_specific_password
CLIENT_URL=http://localhost:3000
```

Start the backend API server:
```bash
npm run dev
# Server runs on http://localhost:5000
```

### 3. Configure Frontend
Open a new terminal:
```bash
cd frontend
npm install
```

Create a `.env.local` file in `frontend/`:
```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

Start the Next.js development server:
```bash
npm run dev
# Frontend runs on http://localhost:3000
```

Visit [http://localhost:3000](http://localhost:3000) in your browser!

---

## 📂 Project Structure

```
ProjectBuddy/
├── README.md               # Root Project Documentation (You are here)
├── DEPLOYMENT.md           # Production Deployment Guide (Vercel + Render)
├── render.yaml             # Render Blueprint Configuration
├── brag-output/            # Official Launch Video Assets
│   ├── brag.mp4            # High-Definition 1080p Launch Film
│   ├── brag.jpg            # Poster Frame & Social Thumbnail
│   └── brag-plan.md        # Script & Storyboard Design Document
├── backend/                # Node.js + Express REST API
│   ├── src/
│   │   ├── controllers/    # Request Handlers (Posts, Auth, Chat, Activities)
│   │   ├── middleware/     # Auth & Validation Middlewares
│   │   ├── models/         # Mongoose Schemas (User, Post, Chat, JoinRequest)
│   │   ├── routes/         # Express Route Definitions
│   │   └── server.js       # Entrypoint & DB Connection
│   └── package.json
└── frontend/               # Next.js 16 + React 19 Client
    ├── public/
    │   ├── fonts/          # Self-hosted Apple SF Pro woff2 Font Assets
    │   └── projectbuddy-*  # Brand Logos & Manifest Assets
    ├── src/
    │   ├── app/            # App Router (layout, page, robots, sitemap)
    │   ├── components/
    │   │   ├── feed/       # PostCard, PostComposer, FeedHeader
    │   │   ├── layout/     # Sidebar, RightSidebar
    │   │   ├── modals/     # CreateProject, JoinTeam, Auth Modals
    │   │   └── views/      # Home, Discover, Messages, Profile, Activity
    │   ├── context/        # Auth & Notification State Providers
    │   └── lib/            # API Client & Utility Helpers
    └── package.json
```

---

## 📡 Core API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/auth/register` | Register new developer account & trigger OTP |
| `POST` | `/api/auth/verify-otp` | Verify OTP code & issue authentication token |
| `POST` | `/api/auth/login` | Log in with email / handle & password |
| `GET` | `/api/posts` | Fetch live feed posts with synergy filtering |
| `POST` | `/api/posts` | Create new project post or code snippet |
| `POST` | `/api/posts/:id/like` | Toggle like on a project post |
| `POST` | `/api/join-requests` | Submit request to join a project team |
| `GET` | `/api/chats/:user` | Retrieve conversations & direct message threads |
| `POST` | `/api/chats/message` | Send real-time chat message with snippet |
| `GET` | `/api/activities/:user`| Retrieve alerts, joining requests & team status |

---

## 🤝 Contributing

Contributions make the open-source community thrive! To contribute:

1. **Fork** the Project.
2. **Create a Feature Branch** (`git checkout -b feature/AmazingFeature`).
3. **Commit Your Changes** (`git commit -m 'Add some AmazingFeature'`).
4. **Push to the Branch** (`git push origin feature/AmazingFeature`).
5. **Open a Pull Request**.

---

## 📄 License

Distributed under the **MIT License**. See `LICENSE` for more information.

---

<div align="center">

Built with ❤️ by **[Pranjal Shukla](https://github.com/Pranjal-ux)** for developers worldwide.

**[Launch ProjectBuddy](https://projectbuddyapp.vercel.app)** • **[Star on GitHub](https://github.com/Pranjal-ux/ProjectBuddy)**

</div>
