# SIPP Deployment Guide

High-performance deployment strategy for the Student Innovator Performance Platform.

## 1. Backend (Render)
1. Push the `/server` folder code to GitHub.
2. In [Render](https://render.com), create a new **Web Service**.
3. Use the `server/render.yaml` or follow these settings:
   - **Build Command**: `npm install`
   - **Start Command**: `node server.js`
4. **Environment Variables**:
   - `MONGODB_URI`: (Your Atlas URI)
   - `JWT_SECRET`: (Long random string)
   - `OPENROUTER_API_KEY`: (From openrouter.ai)
   - `CLIENT_URL`: `https://your-app.vercel.app`

## 2. Frontend (Vercel)
1. Push the `/client` folder code to GitHub.
2. In [Vercel](https://vercel.com), create a new project and select the `client` folder.
3. **Environment Variables**:
   - `VITE_API_URL`: `https://your-backend.onrender.com/api`
4. Deploy.

## 3. Post-Deployment setup
1. Run a `POST` request to `/api/auth/seed-admin` once to create the system administrator.
   - **Login**: `admin@sipp.com`
   - **Password**: `Admin@2026`
2. Run a `POST` request to `/api/admin/quizzes/seed` (authenticated as admin) to seed initial assessment content.
