# 🌐 Making Users Visible to Everyone

## The Problem

Currently, if you run the backend on your local computer, users are stored in a local file (`server/users.json`). This means:
- ❌ Users who sign up on your computer are only visible to you
- ❌ Users who sign up on other computers are only visible to them
- ❌ Everyone sees different user lists

## The Solution

**Deploy the backend to a shared server** so everyone connects to the same backend instance. This way:
- ✅ All users are stored in one shared database
- ✅ Everyone sees the same user list
- ✅ Users can message each other across different devices

## Quick Deployment Steps

### Option 1: Railway (Easiest - Recommended)

1. **Go to https://railway.app** and sign in with GitHub
2. **Click "New Project"** → **"Deploy from GitHub repo"**
3. **Select your repository** (`ktpilot-rag-bot`)
4. **Important Settings:**
   - **Root Directory:** Set to `server`
   - **Start Command:** `node index.js`
5. **Add Environment Variables** (in Railway dashboard → Variables tab):
   ```
   PORT=5050
   FRONTEND_URL=https://your-frontend-url.vercel.app
   JWT_SECRET=your-secret-key-change-this
   ```
   (Also add email settings if you have them)
6. **Get your Railway URL:**
   - Railway will give you a URL like `https://your-project.railway.app`
   - Copy this URL

### Option 2: Render

1. **Go to https://render.com** and sign in
2. **Click "New"** → **"Web Service"**
3. **Connect your GitHub repository**
4. **Settings:**
   - **Root Directory:** `server`
   - **Build Command:** `npm install`
   - **Start Command:** `node index.js`
5. **Add Environment Variables** (same as Railway above)
6. **Get your Render URL**

### Update Frontend to Use Shared Backend

Once your backend is deployed:

1. **If using Vercel for frontend:**
   - Go to Vercel → Your Project → Settings → Environment Variables
   - Add/Update: `VITE_API_BASE_URL` = `https://your-backend.railway.app`
   - Redeploy

2. **If running frontend locally:**
   - Create `client/.env` file:
     ```
     VITE_API_BASE_URL=https://your-backend.railway.app
     ```
   - Restart your frontend dev server

## Verify It Works

1. **Sign up a test user on your computer**
2. **Have someone else sign up on their computer**
3. **Both of you should see each other in the "Messages" → "Add Contact" list**
4. **You should be able to message each other**

## Important Notes

- ⚠️ **The backend must be running 24/7** for everyone to access it
- ⚠️ **All users share the same backend**, so make sure it's secure
- ⚠️ **Backup your data** - Railway/Render provide backups, but it's good practice
- ✅ **Once deployed, everyone uses the same user database**

## Troubleshooting

**"I still can't see other users":**
- Make sure everyone is using the same backend URL
- Check that `VITE_API_BASE_URL` is set correctly in frontend
- Verify the backend is running (check Railway/Render dashboard)

**"Users disappeared after deployment":**
- Local users are stored in `server/users.json` on your computer
- Deployed backend starts with an empty database
- You may need to manually add users or re-signup

**"How do I keep my existing users?"**
- Before deploying, copy `server/users.json` content
- After deploying, you can manually add users through the signup process
- Or modify the deployed backend's database (advanced)

## Need Help?

See `DEPLOYMENT.md` for more detailed deployment instructions.

