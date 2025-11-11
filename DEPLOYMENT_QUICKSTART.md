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
4. Go to Settings → Set Root Directory to `server`
5. Go to Variables → Add:
   ```
   MONGODB_URI=mongodb+srv://dal198705_db_user:4IVNQ3Y1sY1LuMmF@cluster0.a9eohzp.mongodb.net/ktpilot?retryWrites=true&w=majority
   JWT_SECRET=your-secret-key-here
   GEMINI_API_KEY=AIzaSyBPfhJB5vXrk2IR4YZ4H7x0GxOO6MEEVM
   FRONTEND_URL=https://your-app.netlify.app
   ```
6. Copy your Railway URL (e.g., `https://your-app.railway.app`)

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

### 3. Update Backend CORS

1. Go back to Railway → Variables
2. Update `FRONTEND_URL` to your Netlify URL
3. Railway will automatically redeploy

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

