# Railway Deployment Guide for KTPilot Backend

## Overview

This guide explains how to deploy the KTPilot backend to Railway, which is recommended for hosting the Node.js/Express API.

## Prerequisites

1. **Railway Account**: Sign up at [railway.app](https://railway.app)
2. **GitHub Repository**: Push your code to GitHub
3. **MongoDB Atlas**: Your MongoDB Atlas connection string

## Step 1: Create Railway Project

1. Go to [railway.app](https://railway.app)
2. Click "New Project"
3. Select "Deploy from GitHub repo"
4. Connect your GitHub account (if not already connected)
5. Select your repository: `ktpilot-rag-bot`

## Step 2: Configure Service

1. Railway will detect your project structure
2. Click on the service that was created
3. Go to "Settings" tab
4. Set the following:
   - **Root Directory**: `server`
   - **Build Command**: `npm install` (or leave empty, Railway auto-detects)
   - **Start Command**: `node index.js` (or leave empty, Railway auto-detects)

## Step 3: Set Environment Variables

Go to the "Variables" tab and add the following:

### Required Variables

```
MONGODB_URI=mongodb+srv://dal198705_db_user:4IVNQ3Y1sY1LuMmF@cluster0.a9eohzp.mongodb.net/ktpilot?retryWrites=true&w=majority
JWT_SECRET=your-secret-key-change-in-production
GEMINI_API_KEY=AIzaSyBPfhJB5vXrk2IR4YZ4H7x0GxOO6MEEVM
```

### Optional Variables

```
PORT=5050
FRONTEND_URL=https://your-app.netlify.app
CORS_ORIGIN=https://your-app.netlify.app
```

**Important**: 
- Replace `your-secret-key-change-in-production` with a strong random string
- Replace `your-app.netlify.app` with your actual Netlify URL
- Railway will automatically set `PORT`, but you can override it

## Step 4: Deploy

1. Railway will automatically start deploying
2. Watch the build logs for any errors
3. Once deployed, Railway will provide a URL like: `https://your-app.railway.app`

## Step 5: Update CORS in Backend

Make sure your backend CORS settings include your Netlify URL. The code should already support this via the `FRONTEND_URL` environment variable.

## Step 6: Get Your Backend URL

1. Go to Railway Dashboard → Your Service → Settings
2. Copy the generated domain (e.g., `https://your-app.railway.app`)
3. Use this URL in your Netlify environment variables as `VITE_API_BASE_URL`

## Step 7: Custom Domain (Optional)

1. Go to Railway Dashboard → Your Service → Settings → Domains
2. Click "Generate Domain" or "Add Custom Domain"
3. Follow the instructions to configure DNS
4. Update your Netlify `VITE_API_BASE_URL` to use the custom domain

## Step 8: Test Backend

1. Visit `https://your-app.railway.app/api/health`
2. You should see:
   ```json
   {
     "status": "ok",
     "server": "running",
     "database": "connected",
     "timestamp": "..."
   }
   ```

## Troubleshooting

### Build Fails

1. Check Railway build logs
2. Verify `package.json` exists in `server` directory
3. Ensure all dependencies are listed in `package.json`
4. Check Node version (Railway uses Node 18 by default)

### MongoDB Connection Fails

1. Verify `MONGODB_URI` is set correctly
2. Check MongoDB Atlas IP whitelist (allow all IPs: `0.0.0.0/0`)
3. Verify database user has correct permissions
4. Check Railway logs for connection errors

### CORS Errors

1. Verify `FRONTEND_URL` is set to your Netlify URL
2. Check backend CORS configuration
3. Ensure credentials are enabled in CORS settings

### Port Issues

1. Railway automatically sets `PORT` environment variable
2. Your code should use: `const PORT = process.env.PORT || 5050;`
3. This is already configured in your `server/index.js`

## Environment Variables Reference

| Variable | Required | Description | Example |
|----------|----------|-------------|---------|
| `MONGODB_URI` | Yes | MongoDB Atlas connection string | `mongodb+srv://...` |
| `JWT_SECRET` | Yes | Secret key for JWT tokens | `your-secret-key` |
| `GEMINI_API_KEY` | Yes | Google Gemini API key | `AIzaSy...` |
| `PORT` | No | Server port (auto-set by Railway) | `5050` |
| `FRONTEND_URL` | Yes | Netlify frontend URL (for CORS) | `https://your-app.netlify.app` |
| `CORS_ORIGIN` | No | Alternative to FRONTEND_URL | `https://your-app.netlify.app` |

## Monitoring

Railway provides:
- **Logs**: Real-time application logs
- **Metrics**: CPU, Memory, Network usage
- **Deployments**: Deployment history and rollback

## Cost

Railway offers:
- **Free Tier**: $5 credit per month
- **Pay-as-you-go**: After free credit is used
- **Hobby Plan**: $5/month for more resources

## Next Steps

1. ✅ Deploy backend to Railway
2. ✅ Get backend URL
3. ✅ Update Netlify `VITE_API_BASE_URL`
4. ✅ Test backend endpoint
5. ✅ Deploy frontend to Netlify
6. ✅ Test full application

## Support

For issues:
1. Check Railway logs
2. Check MongoDB Atlas connection
3. Verify all environment variables
4. Check CORS settings
5. Verify backend URL is accessible

