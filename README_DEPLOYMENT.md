# KTPilot Deployment Guide

## 🚀 Quick Start

Your application is now configured for deployment to:
- **Frontend**: Netlify
- **Backend**: Railway (or Render/Heroku)
- **Database**: MongoDB Atlas

## 📋 Deployment Files Created

✅ **netlify.toml** - Netlify configuration for frontend
✅ **server/railway.json** - RAILPACK configuration for Railway
✅ **server/package.json** - Has `start` script for Railway
✅ **server/Procfile** - Process file for backend (optional, Railway uses package.json)
✅ **client/public/_redirects** - Netlify SPA redirects
✅ **NETLIFY_DEPLOYMENT.md** - Detailed Netlify setup guide
✅ **RAILWAY_DEPLOYMENT.md** - Detailed Railway setup guide
✅ **RAILWAY_FIX.md** - Railway build error troubleshooting
✅ **DEPLOYMENT_QUICKSTART.md** - Quick deployment steps

## 🎯 Quick Deployment (10 minutes)

### Step 1: Deploy Backend to Railway
1. Go to [railway.app](https://railway.app)
2. New Project → Deploy from GitHub
3. Set Root Directory: `server` ⚠️ **CRITICAL**
4. Leave Build/Start commands EMPTY (Railway auto-detects)
5. Add environment variables (see RAILWAY_DEPLOYMENT.md)
6. Deploy and copy your Railway URL

**Note**: Railway automatically detects Node.js from `package.json`. No Dockerfile needed!

### Step 2: Deploy Frontend to Netlify
1. Go to [netlify.com](https://www.netlify.com)
2. Add new site → Import from GitHub
3. Base directory: `client`
4. Build command: `npm install && npm run build`
5. Publish directory: `dist`
6. Add environment variable: `VITE_API_BASE_URL` = your Railway URL
7. Deploy

### Step 3: Update Backend CORS
1. In Railway, add environment variable: `FRONTEND_URL` = your Netlify URL
2. Railway will automatically redeploy

## 📝 Environment Variables

### Railway (Backend)
```
MONGODB_URI=mongodb+srv://...
JWT_SECRET=your-secret-key
GEMINI_API_KEY=your-gemini-key
FRONTEND_URL=https://your-app.netlify.app
```

### Netlify (Frontend)
```
VITE_API_BASE_URL=https://your-app.railway.app
```

## 🔍 Verify Deployment

1. **Backend Health Check**: `https://your-app.railway.app/api/health`
2. **Frontend**: `https://your-app.netlify.app`
3. **Test**: Sign up, login, upload document, use AI chat

## 📚 Detailed Guides

- **NETLIFY_DEPLOYMENT.md** - Complete Netlify setup
- **RAILWAY_DEPLOYMENT.md** - Complete Railway setup
- **DEPLOYMENT_QUICKSTART.md** - Quick reference

## 🛠️ Troubleshooting

### Frontend can't connect to backend
- Verify `VITE_API_BASE_URL` is set in Netlify
- Check Railway backend is running
- Check browser console for errors

### CORS errors
- Verify `FRONTEND_URL` in Railway matches Netlify URL
- Check backend logs for CORS errors
- Ensure URLs don't have trailing slashes

### MongoDB connection fails
- Check MongoDB Atlas IP whitelist
- Verify `MONGODB_URI` is correct
- Check Railway logs for errors

## 🎉 Next Steps

1. Deploy backend to Railway
2. Deploy frontend to Netlify
3. Configure environment variables
4. Test all features
5. Set up custom domains (optional)

## 📞 Support

For issues, check:
- Railway deployment logs
- Netlify build logs
- Browser console
- Backend API health endpoint

