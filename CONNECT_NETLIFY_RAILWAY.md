# How to Connect Netlify Frontend to Railway Backend

## Overview

This guide walks you through connecting your Netlify frontend to your Railway backend. The connection requires:
1. Setting the backend URL in Netlify (environment variable)
2. Setting the frontend URL in Railway (for CORS)
3. Testing the connection

## Step-by-Step Instructions

### Step 1: Deploy Backend to Railway (If Not Already Done)

1. Go to [railway.app](https://railway.app)
2. Create new project → Deploy from GitHub
3. Select your repository
4. **Set Root Directory to:** `server` ⚠️ **CRITICAL**
5. Add environment variables:
   - `MONGODB_URI`: Your MongoDB Atlas connection string
   - `JWT_SECRET`: Your JWT secret key
   - `GEMINI_API_KEY`: Your Gemini API key
   - `PORT`: (Railway sets this automatically)
6. Deploy and **copy your Railway URL** (e.g., `https://your-app.railway.app`)

### Step 2: Deploy Frontend to Netlify (If Not Already Done)

1. Go to [netlify.com](https://www.netlify.com)
2. Add new site → Import from GitHub
3. Select your repository
4. Configure build settings:
   - **Base directory**: `client`
   - **Build command**: `npm install && npm run build`
   - **Publish directory**: `dist`
5. Deploy and **copy your Netlify URL** (e.g., `https://your-app.netlify.app`)

### Step 3: Connect Frontend to Backend

#### 3.1 Set Backend URL in Netlify

1. Go to **Netlify Dashboard** → Your Site → **Site Settings** → **Environment Variables**
2. Click **"Add a variable"**
3. Add the following:
   - **Key**: `VITE_API_BASE_URL`
   - **Value**: Your Railway backend URL (e.g., `https://your-app.railway.app`)
   - **Scopes**: Select "All scopes" (or specific scopes as needed)
4. Click **"Save"**
5. **Redeploy your site** (Netlify → Deploys → Trigger deploy → Deploy site)

#### 3.2 Set Frontend URL in Railway (For CORS)

1. Go to **Railway Dashboard** → Your Service → **Variables**
2. Add the following environment variable:
   - **Key**: `FRONTEND_URL`
   - **Value**: Your Netlify frontend URL (e.g., `https://your-app.netlify.app`)
3. Railway will automatically redeploy with the new environment variable

### Step 4: Verify the Connection

#### 4.1 Test Backend Health

1. Visit your Railway backend health endpoint:
   ```
   https://your-app.railway.app/api/health
   ```
2. You should see:
   ```json
   {
     "status": "ok",
     "server": "running",
     "database": "connected"
   }
   ```

#### 4.2 Test Frontend Connection

1. Visit your Netlify frontend URL:
   ```
   https://your-app.netlify.app
   ```
2. Open browser Developer Tools (F12) → Console tab
3. Try to sign up or log in
4. Check the console for any CORS or network errors

#### 4.3 Check Network Requests

1. Open browser Developer Tools (F12) → Network tab
2. Try to log in or sign up
3. Look for API requests to your Railway backend
4. Verify:
   - Requests are going to: `https://your-app.railway.app/api/...`
   - Requests return status 200 (success) or appropriate status codes
   - No CORS errors in the console

## How It Works

### Frontend Configuration

The frontend uses the `VITE_API_BASE_URL` environment variable to determine the backend URL:

```javascript
// In client/src/AuthContext.jsx and client/src/App.jsx
const API_BASE = import.meta.env.VITE_API_BASE_URL || "";
const getApiUrl = (endpoint) => {
  const base = API_BASE.endsWith("/") ? API_BASE.slice(0, -1) : API_BASE;
  const path = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;
  return base ? `${base}${path}` : path;
};
```

- **Development**: Empty string uses Vite proxy (localhost:5173 → localhost:5050)
- **Production**: Uses `VITE_API_BASE_URL` from Netlify environment variables

### Backend Configuration

The backend uses the `FRONTEND_URL` environment variable for CORS:

```javascript
// In server/index.js
const allowedOrigins = [
    "http://localhost:5173", // Local development
    process.env.FRONTEND_URL,
    process.env.CORS_ORIGIN,
].filter(Boolean);

const corsOptions = {
    origin: function (origin, callback) {
        if (!origin) return callback(null, true);
        if (allowedOrigins.length === 0 || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            // Allow all in development, strict in production
            if (!process.env.FRONTEND_URL && !process.env.CORS_ORIGIN) {
                callback(null, true);
            } else {
                callback(new Error('Not allowed by CORS'));
            }
        }
    },
    credentials: true,
    // ... other options
};
```

## Environment Variables Summary

**📋 See `ENVIRONMENT_VARIABLES_CHECKLIST.md` for complete list with detailed instructions and examples.**

### Netlify (Frontend) - Required (1 variable)
| Variable | Required | Description | Example |
|----------|----------|-------------|---------|
| `VITE_API_BASE_URL` | ✅ Yes | Backend API URL (public Railway URL, no trailing slash) | `https://your-app.railway.app` |

### Railway (Backend) - Required (4 variables)
| Variable | Required | Description | Example |
|----------|----------|-------------|---------|
| `MONGODB_URI` | ✅ Yes | MongoDB Atlas connection string | `mongodb+srv://user:pass@cluster.mongodb.net/ktpilot?retryWrites=true&w=majority` |
| `JWT_SECRET` | ✅ Yes | JWT secret for authentication | `your-random-secret-key` |
| `GEMINI_API_KEY` | ✅ Yes | Google Gemini API key | `AIzaSy...` |
| `FRONTEND_URL` | ✅ Yes | Netlify frontend URL (for CORS, no trailing slash) | `https://your-app.netlify.app` |

### Railway (Backend) - Optional (6 variables for email)
| Variable | Required | Description | Example |
|----------|----------|-------------|---------|
| `PORT` | ❌ No | Server port (Railway sets automatically) | `5050` |
| `SMTP_HOST` | ❌ No | SMTP server host (for email password reset) | `smtp.gmail.com` |
| `SMTP_PORT` | ❌ No | SMTP server port | `587` |
| `SMTP_USER` | ❌ No | SMTP username | `your-email@gmail.com` |
| `SMTP_PASS` | ❌ No | SMTP password/app password | `your-app-password` |
| `SMTP_FROM` | ❌ No | Email sender address | `your-email@gmail.com` |
| `SMTP_SECURE` | ❌ No | Use TLS/SSL | `false` |

## Troubleshooting

### Issue: Frontend Can't Connect to Backend

**Symptoms:**
- Network errors in browser console
- "Failed to fetch" errors
- API calls fail
- `ERR_NAME_NOT_RESOLVED` errors
- Requests going to `.railway.internal` domain

**Solutions:**
1. **Verify `VITE_API_BASE_URL` in Netlify:**
   - Go to Netlify → Site Settings → Environment Variables
   - Check that `VITE_API_BASE_URL` is set correctly
   - **IMPORTANT**: Make sure it's the **PUBLIC Railway URL**, not the internal URL
   - Public URL format: `https://your-app.up.railway.app` or `https://your-app.railway.app`
   - Internal URL (WRONG): `https://your-app.railway.internal` ❌
   - Make sure there's no trailing slash (e.g., `https://your-app.railway.app` not `https://your-app.railway.app/`)
   - **Redeploy after changing environment variables** (trigger a new deployment)

2. **If you see `.railway.internal` in errors:**
   - This means `VITE_API_BASE_URL` is either not set or set to the internal URL
   - Delete the environment variable and recreate it with the public URL
   - Trigger a new deployment
   - See `FIX_RAILWAY_INTERNAL_ERROR.md` for detailed instructions

2. **Verify backend is running:**
   - Visit `https://your-app.railway.app/api/health`
   - Should return `{"status":"ok","server":"running","database":"connected"}`

3. **Check browser console:**
   - Open Developer Tools → Console
   - Look for specific error messages
   - Check Network tab for failed requests

### Issue: CORS Errors

**Symptoms:**
- Browser console shows CORS errors
- "Access-Control-Allow-Origin" errors
- Requests fail with CORS policy errors

**Solutions:**
1. **Verify `FRONTEND_URL` in Railway:**
   - Go to Railway → Variables
   - Check that `FRONTEND_URL` is set to your Netlify URL
   - Make sure there's no trailing slash
   - Railway will auto-redeploy after adding variables

2. **Check CORS configuration:**
   - Verify backend code allows your Netlify origin
   - Check that `credentials: true` is set in CORS options

3. **Verify URLs match exactly:**
   - Frontend URL in Railway: `https://your-app.netlify.app`
   - Actual Netlify URL: `https://your-app.netlify.app`
   - They must match exactly (including `https://`)

### Issue: Authentication Not Working

**Symptoms:**
- Login/signup fails
- Tokens not being saved
- 401 Unauthorized errors

**Solutions:**
1. **Check backend logs:**
   - Go to Railway → Deployments → View logs
   - Look for authentication errors

2. **Verify JWT_SECRET is set:**
   - Check Railway → Variables
   - Ensure `JWT_SECRET` is set

3. **Check browser storage:**
   - Open Developer Tools → Application → Local Storage
   - Verify tokens are being saved

### Issue: Environment Variables Not Updating

**Symptoms:**
- Changes to environment variables don't take effect
- Frontend still uses old backend URL

**Solutions:**
1. **Netlify:**
   - After changing environment variables, **trigger a new deployment**
   - Go to Netlify → Deploys → Trigger deploy → Deploy site
   - Environment variables are baked into the build, so a new build is required

2. **Railway:**
   - Railway automatically redeploys when you add/change variables
   - Check Railway → Deployments to see if a new deployment started
   - Wait for deployment to complete

## Quick Checklist

- [ ] Backend deployed to Railway
- [ ] Frontend deployed to Netlify
- [ ] `VITE_API_BASE_URL` set in Netlify (points to Railway backend)
- [ ] `FRONTEND_URL` set in Railway (points to Netlify frontend)
- [ ] Netlify site redeployed after setting environment variables
- [ ] Backend health check works: `https://your-app.railway.app/api/health`
- [ ] Frontend can connect to backend (test login/signup)
- [ ] No CORS errors in browser console
- [ ] All features working (upload, chat, etc.)

## Testing the Connection

### Test 1: Health Check
```bash
curl https://your-app.railway.app/api/health
```
Should return: `{"status":"ok","server":"running","database":"connected"}`

### Test 2: Frontend to Backend
1. Visit your Netlify URL
2. Open browser Developer Tools → Network tab
3. Try to sign up or log in
4. Verify requests go to: `https://your-app.railway.app/api/auth/...`
5. Verify requests return 200 (success) or appropriate status codes

### Test 3: CORS
1. Visit your Netlify URL
2. Open browser Developer Tools → Console tab
3. Try to make an API request (login, signup, etc.)
4. Verify no CORS errors appear

## Next Steps

After connecting Netlify to Railway:
1. ✅ Test all features (login, signup, upload, chat)
2. ✅ Verify data persists (documents, users, messages)
3. ✅ Set up custom domains (optional)
4. ✅ Configure monitoring and alerts
5. ✅ Set up continuous deployment

## Support

If you're still having issues:
1. Check Railway deployment logs
2. Check Netlify build logs
3. Check browser console for errors
4. Verify all environment variables are set correctly
5. Verify URLs match exactly (no trailing slashes, correct protocol)
6. **If you see `.railway.internal` errors**: See `FIX_RAILWAY_INTERNAL_ERROR.md` for detailed troubleshooting

## Example Configuration

### Netlify Environment Variables
```
VITE_API_BASE_URL=https://ktpilot-backend.railway.app
```

### Railway Environment Variables
```
FRONTEND_URL=https://ktpilot-frontend.netlify.app
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/ktpilot
JWT_SECRET=your-secret-key-here
GEMINI_API_KEY=your-gemini-api-key
PORT=5050
```

### URLs
- **Frontend**: `https://ktpilot-frontend.netlify.app`
- **Backend**: `https://ktpilot-backend.railway.app`
- **Health Check**: `https://ktpilot-backend.railway.app/api/health`

