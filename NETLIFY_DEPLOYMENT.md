# Netlify Deployment Guide for KTPilot

## Overview

This guide explains how to deploy the KTPilot frontend to Netlify. The backend needs to be deployed separately to a service that supports Node.js (Railway, Render, Heroku, etc.).

## Architecture

- **Frontend (Netlify)**: React/Vite application
- **Backend (Separate Service)**: Node.js/Express API with MongoDB
- **Database**: MongoDB Atlas (cloud)

## Prerequisites

1. **Netlify Account**: Sign up at [netlify.com](https://www.netlify.com)
2. **Backend Deployed**: Deploy backend to Railway, Render, or similar service
3. **GitHub Repository**: Push your code to GitHub
4. **MongoDB Atlas**: Backend should be connected to MongoDB Atlas

## Step 1: Deploy Backend First

### Option A: Railway (Recommended)
1. Go to [railway.app](https://railway.app)
2. Create new project
3. Connect your GitHub repository
4. Select the `server` directory
5. Set environment variables:
   - `MONGODB_URI`: Your MongoDB Atlas connection string
   - `JWT_SECRET`: Your JWT secret key
   - `GEMINI_API_KEY`: Your Gemini API key
   - `PORT`: Railway will set this automatically
   - `FRONTEND_URL`: Your Netlify URL (e.g., `https://your-app.netlify.app`)
6. Deploy

### Option B: Render
1. Go to [render.com](https://render.com)
2. Create new Web Service
3. Connect your GitHub repository
4. Set build command: `cd server && npm install`
5. Set start command: `cd server && node index.js`
6. Set environment variables (same as Railway)
7. Deploy

## Step 2: Configure Frontend for Netlify

### 2.1 Update Environment Variables

The frontend needs to know where your backend is deployed. Update `client/.env.production.example` with your backend URL, or set it in Netlify dashboard.

### 2.2 Verify Build Configuration

The `netlify.toml` file is already configured. Verify:
- Build command: `cd client && npm install && npm run build`
- Publish directory: `client/dist`
- Node version: 18

## Step 3: Deploy to Netlify

### Option A: Netlify CLI (Recommended)

```bash
# Install Netlify CLI
npm install -g netlify-cli

# Login to Netlify
netlify login

# Deploy
cd client
netlify deploy --prod
```

### Option B: GitHub Integration (Recommended for Auto-Deploy)

1. Go to [app.netlify.com](https://app.netlify.com)
2. Click "Add new site" → "Import an existing project"
3. Connect to GitHub
4. Select your repository
5. Configure build settings:
   - **Base directory**: `client`
   - **Build command**: `npm install && npm run build`
   - **Publish directory**: `dist`
6. Set environment variables:
   - `VITE_API_BASE_URL`: Your backend URL (e.g., `https://your-app.railway.app`)
7. Click "Deploy site"

### Option C: Drag and Drop

```bash
# Build the frontend
cd client
npm install
npm run build

# Drag the 'dist' folder to Netlify dashboard
```

## Step 4: Configure Environment Variables in Netlify

1. Go to Netlify Dashboard → Your Site → Site Settings → Environment Variables
2. Add the following:
   - `VITE_API_BASE_URL`: Your backend URL (e.g., `https://your-app.railway.app`)

## Step 5: Update Backend CORS Settings

Update your backend's CORS configuration to allow your Netlify domain:

```javascript
// In server/index.js
const corsOptions = {
    origin: [
        "http://localhost:5173", // Local development
        "https://your-app.netlify.app", // Netlify production
        "https://your-custom-domain.com", // Custom domain
    ],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
};
```

Or use environment variable:

```javascript
const corsOptions = {
    origin: process.env.FRONTEND_URL || process.env.CORS_ORIGIN || "http://localhost:5173",
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
};
```

Set `FRONTEND_URL` in your backend environment variables to your Netlify URL.

## Step 6: Test Deployment

1. Visit your Netlify URL (e.g., `https://your-app.netlify.app`)
2. Test login/signup
3. Test document upload
4. Test AI chat
5. Verify all features work

## Step 7: Custom Domain (Optional)

1. Go to Netlify Dashboard → Domain Settings
2. Click "Add custom domain"
3. Follow the instructions to configure DNS
4. Update backend CORS to include your custom domain

## Troubleshooting

### Frontend Can't Connect to Backend

1. Check `VITE_API_BASE_URL` is set correctly in Netlify
2. Verify backend is running and accessible
3. Check CORS settings in backend
4. Check browser console for errors

### Build Fails

1. Check Node version (should be 18)
2. Verify `package.json` has correct build script
3. Check Netlify build logs for errors
4. Ensure all dependencies are in `package.json`

### CORS Errors

1. Verify backend CORS includes your Netlify URL
2. Check `FRONTEND_URL` environment variable in backend
3. Ensure credentials are enabled in CORS settings

### API Calls Fail

1. Verify backend URL is correct
2. Check backend logs for errors
3. Verify MongoDB connection in backend
4. Check authentication tokens are being sent

## Environment Variables Summary

### Frontend (Netlify)
- `VITE_API_BASE_URL`: Backend API URL

### Backend (Railway/Render)
- `MONGODB_URI`: MongoDB Atlas connection string
- `JWT_SECRET`: JWT secret key
- `GEMINI_API_KEY`: Google Gemini API key
- `FRONTEND_URL`: Netlify frontend URL (for CORS)
- `PORT`: Server port (usually auto-set by platform)

## Continuous Deployment

With GitHub integration, Netlify will automatically deploy when you push to your main branch. To deploy from a different branch:

1. Go to Netlify Dashboard → Site Settings → Build & Deploy
2. Configure branch settings
3. Set up branch deploys for previews

## Support

For issues:
1. Check Netlify build logs
2. Check backend logs
3. Check browser console
4. Verify all environment variables are set
5. Verify CORS settings

## Next Steps

1. ✅ Deploy backend to Railway/Render
2. ✅ Deploy frontend to Netlify
3. ✅ Configure environment variables
4. ✅ Update CORS settings
5. ✅ Test all features
6. ✅ Set up custom domain (optional)

