# Quick Deployment Guide

## ⚠️ Important: Shared Users

**To make users visible to everyone across different computers, you MUST deploy the backend to a shared server (Railway, Render, etc.).**

If you run the backend locally, each computer will have its own separate user database. See `SHARED_USERS_GUIDE.md` for details.

## 🚀 Quick Deploy Options

### Option 1: Local Testing (Immediate)

**Frontend:** http://localhost:5173  
**Backend:** http://localhost:5050

**Setup Steps:**

1. **Backend Setup:**
   ```bash
   cd server
   cp env.template .env
   # Edit .env with your settings (see SETUP.md)
   npm install
   npm start
   ```

2. **Frontend Setup (new terminal):**
   ```bash
   cd client
   npm install
   npm run dev
   ```

3. **Verify:**
   - Backend: http://localhost:5050 (should show "✅ KTPilot backend is running!")
   - Frontend: http://localhost:5173 (should show login page)

**Note:** For local development, no frontend `.env` file is needed - Vite proxy handles API routing automatically.

### Option 2: Vercel (Frontend) + Railway/Render (Backend) - Recommended

#### Deploy Frontend to Vercel:
1. Go to https://vercel.com and sign in
2. Click "Add New" → "Project"
3. Import your GitHub repository
4. **Important Settings:**
   - **Root Directory:** Set to `client`
   - **Framework Preset:** Vite
   - **Build Command:** `npm run build` (auto-detected)
   - **Output Directory:** `dist` (auto-detected)
5. **Environment Variables:**
   - Add `VITE_API_BASE_URL` = `https://your-backend.railway.app` (get this from Railway step below)
6. Click "Deploy"

#### Deploy Backend to Railway:
1. Go to https://railway.app and sign in
2. Click "New Project" → "Deploy from GitHub repo"
3. Select your repository
4. **Important Settings:**
   - **Root Directory:** Set to `server`
   - **Start Command:** `node index.js` (or `npm start`)
5. **Environment Variables** (in Railway dashboard → Variables tab):
   - `PORT` = `5050` (or leave Railway's auto-assigned port)
   - `FRONTEND_URL` = `https://your-project.vercel.app` (your Vercel URL from above)
   - `JWT_SECRET` = `your-secret-key-change-this` (generate a random string)
   - (Optional) Email settings: `SMTP_HOST`, `SMTP_USER`, `SMTP_PASS`, etc.
6. **Get your Railway URL:**
   - Railway will provide a URL like `https://your-project.railway.app`
   - Copy this URL
7. **Update Vercel:**
   - Go back to Vercel → Your Project → Settings → Environment Variables
   - Update `VITE_API_BASE_URL` with your Railway URL
   - Redeploy if needed

**Your links will be:**
- Frontend: `https://your-project.vercel.app`
- Backend: `https://your-project.railway.app`

### Option 3: Render (Full Stack)

1. Go to https://render.com
2. Create two services:
   - **Web Service** (Backend): Root = `server`, Build = `npm install`, Start = `node index.js`
   - **Static Site** (Frontend): Root = `client`, Build = `npm run build`, Publish = `dist`
3. Set environment variables as needed

### Option 4: Netlify (Frontend) + Fly.io (Backend)

#### Netlify:
1. Go to https://netlify.com
2. Deploy from GitHub, set base directory to `client`
3. Build command: `npm run build`
4. Publish directory: `dist`

#### Fly.io:
1. Install flyctl: `curl -L https://fly.io/install.sh | sh`
2. In `server/` directory: `fly launch`
3. Set environment variables in fly.toml

## 📝 Environment Variables Needed

### Frontend Environment Variables

**For Local Development:**
- No `.env` file needed (Vite proxy handles it automatically)

**For Production (Vercel/Netlify/etc.):**
- `VITE_API_BASE_URL` = `https://your-backend-url.com`

### Backend Environment Variables

**Required:**
```env
PORT=5050
FRONTEND_URL=https://your-frontend-url.com
JWT_SECRET=your-secret-key-change-in-production
```

**Optional (for email password reset):**
```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
SMTP_FROM=your-email@gmail.com
```

**See `SETUP.md` for detailed configuration instructions.**

## 🔗 Getting Your Product Link

After deployment, you'll get:
- **Frontend URL**: Where users access your app (e.g., `https://your-project.vercel.app`)
- **Backend URL**: API endpoint (e.g., `https://your-project.railway.app`) - keep this private

**Share the Frontend URL as your product link!**

## ✅ Post-Deployment Checklist

1. ✅ Frontend deployed and accessible
2. ✅ Backend deployed and accessible
3. ✅ `VITE_API_BASE_URL` set in frontend environment variables
4. ✅ `FRONTEND_URL` set in backend environment variables
5. ✅ Test login/signup functionality
6. ✅ Test document upload
7. ✅ Test chatbot questions
8. ✅ (Optional) Test password reset email

## 🔧 Troubleshooting Deployment

**Frontend can't connect to backend:**
- Verify `VITE_API_BASE_URL` is set correctly in Vercel
- Check backend is running and accessible
- Verify CORS settings in backend allow your frontend URL

**CORS errors:**
- Ensure `FRONTEND_URL` in backend matches your exact frontend URL (including https://)
- Check backend logs for CORS errors
- Verify backend is allowing credentials: `credentials: true`

**Build failures:**
- Check that all dependencies are in `package.json`
- Verify Node.js version compatibility
- Check build logs for specific errors

For more help, see `SETUP.md` or check the deployment platform's documentation.

