# 🚀 ProjectBuddy Deployment Guide

This guide walks you through deploying the **Backend to Render** and the **Frontend to Vercel**, then linking the two services.

---

## 🛠️ Step 1: Push All Changes to GitHub

Ensure all recent updates, bug fixes, and models are pushed to your GitHub repository:

```bash
git add .
git commit -m "feat: real-time chat with read receipts, dynamic badges, and deployment config"
git push origin main
```

Your repo: `https://github.com/Pranjal-ux/ProjectBuddy.git`

---

## 🌐 Step 2: Deploy Backend to Render (https://render.com)

1. Log in to your [Render Dashboard](https://dashboard.render.com).
2. Click **New +** → **Web Service**.
3. Select **Build and deploy from a Git repository** and connect your `ProjectBuddy` repository.
4. Configure the Web Service settings:
   - **Name**: `projectbuddy-backend`
   - **Root Directory**: `backend`
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Plan**: `Free`
5. Click **Advanced** → **Add Environment Variable** and add the following keys:

| Key | Value | Description |
|---|---|---|
| `NODE_ENV` | `production` | Production environment flag |
| `PORT` | `5000` | Express server port (Render routes this automatically) |
| `MONGO_URI` | `your_mongodb_connection_uri` | Your MongoDB Atlas connection URI |
| `JWT_SECRET` | `your_jwt_secret_key` | Secret for auth JWT tokens |
| `USE_DUMMY_SMTP` | `true` | Ethereal SMTP fallback for verification codes |
| `CLIENT_URL` | `https://your-frontend-project.vercel.app` | (Update after Vercel deployment) |
| `GOOGLE_CLIENT_ID` | `your_google_oauth_client_id.apps.googleusercontent.com` | Google OAuth client ID |
| `GOOGLE_CLIENT_SECRET` | `your_google_oauth_client_secret` | Google OAuth secret |

6. Click **Deploy Web Service**.
7. Once deployed, Render will provide your live backend URL, for example:
### 🌐 Live Production URLs

- **Backend (Render)**: [https://projectbuddy-988y.onrender.com](https://projectbuddy-988y.onrender.com)
  - Health check: `https://projectbuddy-988y.onrender.com/health`
- **Frontend (Vercel)**: [https://projectbuddy-drab.vercel.app](https://projectbuddy-drab.vercel.app)
  - API proxy check: `https://projectbuddy-drab.vercel.app/api/health`

---

## 🔗 Live Configuration Summary

1. **Backend Environment on Render**:
   - `CLIENT_URL` = `https://projectbuddy-drab.vercel.app`
   - Health check path = `/health` (or `/api/health`)

2. **Frontend Environment on Vercel**:
   - Project Name: `projectbuddy`
   - `NEXT_PUBLIC_API_URL` = `https://projectbuddy-988y.onrender.com/api`
   - Rewrites in `next.config.ts` automatically proxy `/api/*` to the Render backend.
   - Render will auto-deploy the changes.

2. **Update Google Cloud Console Authorized Origins (Optional for Google OAuth)**:
   - In [Google Cloud Console](https://console.cloud.google.com/apis/credentials):
   - Under Authorized JavaScript Origins, add:
     - `https://projectbuddy.vercel.app`
     - `https://projectbuddy-backend.onrender.com`
   - Under Authorized Redirect URIs, add:
     - `https://projectbuddy-backend.onrender.com/api/auth/google/callback`

---

## ✅ Step 5: Verification Checklist

- [ ] Visit frontend on Vercel (`https://projectbuddy.vercel.app`)
- [ ] Post feed loads real database posts
- [ ] Sign in / Sign up functions properly with MongoDB
- [ ] Discover section loads registered developers
- [ ] Chat messages show single tick (`✓`) when sent and double blue ticks (`✓✓`) when seen
