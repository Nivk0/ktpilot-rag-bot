# KTPilot Setup Guide

This guide helps you configure the frontend and backend to work together properly.

## 📋 Quick Setup Checklist

### 1. Backend Setup

**Location:** `server/` directory

1. Copy environment template:
   ```bash
   cd server
   cp env.template .env
   ```

2. Edit `.env` file with your settings:
   ```env
   PORT=5050
   FRONTEND_URL=http://localhost:5173
   JWT_SECRET=your-secret-key-change-in-production
   
   # Email settings (optional - see QUICK_EMAIL_SETUP.md)
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_USER=your-email@gmail.com
   SMTP_PASS=your-app-password
   SMTP_FROM=your-email@gmail.com
   ```

3. Install dependencies:
   ```bash
   npm install
   ```

4. Start server:
   ```bash
   npm start
   # Server runs on http://localhost:5050
   ```

### 2. Frontend Setup

**Location:** `client/` directory

1. Create `.env` file (optional for local development):
   ```bash
   cd client
   # For local dev, .env is optional (Vite proxy handles it)
   # For production, create .env with:
   # VITE_API_BASE_URL=https://your-backend-url.com
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start development server:
   ```bash
   npm run dev
   # Frontend runs on http://localhost:5173
   ```

## 🔗 How Frontend and Backend Connect

### Local Development

**Frontend (Vite):**
- Uses proxy in `vite.config.js` to forward `/api/*` requests to `http://localhost:5050`
- No `.env` file needed for local development
- API calls use relative paths (e.g., `/api/ask`)

**Backend:**
- Listens on `http://localhost:5050`
- CORS configured to allow `http://localhost:5173` (from `.env` or default)
- Handles all `/api/*` routes

### Production Deployment

**Frontend:**
- Set `VITE_API_BASE_URL` environment variable to your backend URL
- Example: `VITE_API_BASE_URL=https://your-backend.railway.app`
- Build command: `npm run build`
- Output: `dist/` directory

**Backend:**
- Set `FRONTEND_URL` environment variable to your frontend URL
- Example: `FRONTEND_URL=https://your-project.vercel.app`
- CORS will automatically allow requests from this URL

## 🌐 Environment Variables Reference

### Frontend (`client/.env`)
```env
# Only needed for production
VITE_API_BASE_URL=https://your-backend-url.com
```

### Backend (`server/.env`)
```env
# Server Configuration
PORT=5050
FRONTEND_URL=http://localhost:5173  # or your production frontend URL
JWT_SECRET=your-secret-key-change-in-production

# Email Configuration (optional)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
SMTP_FROM=your-email@gmail.com
```

## ✅ Verification

1. **Backend is running:**
   - Visit: http://localhost:5050
   - Should see: "✅ KTPilot backend is running!"

2. **Frontend is running:**
   - Visit: http://localhost:5173
   - Should see the login page

3. **Connection works:**
   - Try logging in or signing up
   - If it works, frontend and backend are connected! ✅

## 🚀 Deployment

See `DEPLOYMENT.md` for detailed deployment instructions to:
- Vercel (Frontend)
- Railway/Render (Backend)
- Other platforms

## 🔧 Troubleshooting

**"Network Error" or CORS errors:**
- Check backend is running on port 5050
- Verify `FRONTEND_URL` in backend `.env` matches your frontend URL
- Check browser console for specific error messages

**API calls failing:**
- Verify `VITE_API_BASE_URL` is set correctly (production only)
- For local dev, ensure Vite proxy is working (check `vite.config.js`)
- Check backend logs for errors

**Port already in use:**
- Change `PORT` in backend `.env`
- Update frontend proxy in `vite.config.js` if needed


