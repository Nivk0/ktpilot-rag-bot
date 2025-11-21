# Quick Deployment Guide

## Overview

Deploy KTPilot with:
- **Frontend**: Netlify (free, easy, fast)
- **Backend**: Railway (free tier, auto-deploy)
- **Database**: MongoDB Atlas (free tier)

## Quick Steps

### 1. Deploy Backend to Railway (5 minutes)

1. Go to [railway.app](https://railway.app) and sign up
2. Click "New Project" → "Deploy from GitHub repo"
3. Select your repository
4. **Go to Settings** → Scroll to "Root Directory" section
5. **Set Root Directory to:** `server` ⚠️ **CRITICAL - This tells Railway to only build the server directory**
6. **Leave Build Command EMPTY** (Railway auto-detects)
7. **Leave Start Command EMPTY** (Railway auto-detects from package.json)
8. **Go to Variables** → Add:
   ```
   MONGODB_URI=mongodb+srv://dal198705_db_user:4IVNQ3Y1sY1LuMmF@cluster0.a9eohzp.mongodb.net/ktpilot?retryWrites=true&w=majority
   JWT_SECRET=your-secret-key-here
   GEMINI_API_KEY=AIzaSyBPfhJB5vXrk2IR4YZ4H7x0GxOO6MEEVM
   FRONTEND_URL=https://your-app.netlify.app
   ```
9. Copy your Railway URL (e.g., `https://your-app.railway.app`)

**⚠️ IMPORTANT:** Your repository has both `client/` and `server/` directories. You MUST set Root Directory to `server` in Railway settings, otherwise Railway won't know which directory to build!

**Note**: Railway automatically detects Node.js from `package.json` in the server directory. No Dockerfile needed!

### 2. Deploy Frontend to Netlify (5 minutes)

1. Go to [netlify.com](https://www.netlify.com) and sign up
2. Click "Add new site" → "Import an existing project"
3. Connect GitHub and select your repository
4. Configure build settings:
   - **Base directory**: `client`
   - **Build command**: `npm install && npm run build`
   - **Publish directory**: `dist`
5. Add environment variable:
   - `VITE_API_BASE_URL`: Your Railway URL (e.g., `https://your-app.railway.app`)
6. Click "Deploy site"
7. Copy your Netlify URL (e.g., `https://your-app.netlify.app`)

### 3. Connect Frontend to Backend

**In Netlify:**
1. Go to Netlify Dashboard → Site Settings → Environment Variables
2. Add: `VITE_API_BASE_URL` = `https://your-app.railway.app` (your Railway URL)
3. Redeploy your Netlify site (trigger a new deployment)

**In Railway:**
1. Go to Railway Dashboard → Variables
2. Add: `FRONTEND_URL` = `https://your-app.netlify.app` (your Netlify URL)
3. Railway will automatically redeploy

**See `CONNECT_NETLIFY_RAILWAY.md` for detailed step-by-step instructions.**

### 4. Test

1. Visit your Netlify URL
2. Sign up / Log in
3. Upload a document
4. Test the AI chat
5. Everything should work! 🎉

## Environment Variables Summary

### Railway (Backend)
- `MONGODB_URI`: MongoDB Atlas connection string
- `JWT_SECRET`: Random secret key for JWT tokens
- `GEMINI_API_KEY`: Your Gemini API key
- `FRONTEND_URL`: Your Netlify URL (for CORS)

### Netlify (Frontend)
- `VITE_API_BASE_URL`: Your Railway backend URL

## Troubleshooting

### Frontend can't connect to backend
- Check `VITE_API_BASE_URL` is set in Netlify
- Verify Railway backend is running
- Check browser console for errors

### CORS errors
- Verify `FRONTEND_URL` in Railway matches your Netlify URL
- Check backend logs for CORS errors
- Ensure URLs don't have trailing slashes

### MongoDB connection fails
- Check MongoDB Atlas IP whitelist (allow all: `0.0.0.0/0`)
- Verify `MONGODB_URI` is correct
- Check Railway logs for connection errors

## Next Steps

- Set up custom domains
- Configure email (SMTP) for password resets
- Set up monitoring and alerts
- Enable HTTPS (automatic on Netlify and Railway)

## Support

- See `NETLIFY_DEPLOYMENT.md` for detailed Netlify setup
- See `RAILWAY_DEPLOYMENT.md` for detailed Railway setup
- Check logs in Railway and Netlify dashboards

