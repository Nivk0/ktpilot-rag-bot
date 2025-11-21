# Quick Fix: Environment Variables

## Issues Found

### Issue 1: Netlify - Wrong URL (Internal URL)
❌ **Current**: `VITE_API_BASE_URL=https://ktpilot-rag-bot.railway.internal`
✅ **Should be**: `VITE_API_BASE_URL=https://ktpilot-rag-bot.up.railway.app` (or your public Railway URL)

### Issue 2: Railway - Trailing Slash
❌ **Current**: `FRONTEND_URL=https://ktpilot.netlify.app/.` (has trailing slash)
✅ **Should be**: `FRONTEND_URL=https://ktpilot.netlify.app` (no trailing slash)

## How to Fix

### Step 1: Find Your Public Railway URL

1. Go to **Railway Dashboard** → Your Service
2. Look for **"Public Domain"** or check the top of the service page
3. It should look like one of these:
   - `https://ktpilot-rag-bot.up.railway.app`
   - `https://ktpilot-rag-bot.railway.app`
   - Or a custom domain you set up
4. **Test it**: Visit `https://your-public-url.up.railway.app/api/health`
   - Should return: `{"status":"ok","server":"running","database":"connected"}`
5. **Copy this URL** (make sure it does NOT have `.internal` in it)

### Step 2: Fix Netlify Environment Variable

1. Go to **Netlify Dashboard** → Your Site → **Site Settings** → **Environment Variables**
2. Find `VITE_API_BASE_URL`
3. Click on it to edit
4. Change the value from:
   - ❌ `https://ktpilot-rag-bot.railway.internal`
   - ✅ To: `https://ktpilot-rag-bot.up.railway.app` (your public Railway URL)
5. **Make sure there's NO trailing slash**
6. Click **"Save"**
7. **IMPORTANT**: Go to **Deploys** → **Trigger deploy** → **Deploy site** (redeploy is required!)

### Step 3: Fix Railway Environment Variable

1. Go to **Railway Dashboard** → Your Service → **Variables**
2. Find `FRONTEND_URL`
3. Click to edit
4. Change the value from:
   - ❌ `https://ktpilot.netlify.app/.` (has trailing slash)
   - ✅ To: `https://ktpilot.netlify.app` (no trailing slash)
5. Click **"Save"**
6. Railway will automatically redeploy

### Step 4: Verify the Fix

1. **Wait for both deployments to complete**
2. **Test Netlify**: Visit your Netlify site
3. **Open browser Developer Tools** (F12) → **Console** tab
4. **Try to sign up or log in**
5. **Check Network tab**: Requests should go to:
   - ✅ `https://ktpilot-rag-bot.up.railway.app/api/auth/signup` (public URL)
   - ❌ NOT `https://ktpilot-rag-bot.railway.internal/...` (internal URL)
6. **Verify no errors**: Should work now!

## Correct Configuration

### Netlify Environment Variables
```
VITE_API_BASE_URL=https://ktpilot-rag-bot.up.railway.app
```
- ✅ Public Railway URL (not `.internal`)
- ✅ No trailing slash
- ✅ Must start with `https://`

### Railway Environment Variables
```
FRONTEND_URL=https://ktpilot.netlify.app
```
- ✅ Your Netlify URL
- ✅ No trailing slash
- ✅ Must start with `https://`

## How to Find Your Public Railway URL

### Method 1: Railway Dashboard
1. Go to Railway Dashboard → Your Service
2. Look at the service overview page
3. Find **"Public Domain"** or **"Domains"** section
4. Copy the public URL (should NOT have `.internal`)

### Method 2: Railway Settings
1. Go to Railway Dashboard → Your Service → **Settings** → **Networking**
2. Look for **"Public Domain"**
3. Copy the URL

### Method 3: Test URLs
Try these common formats:
- `https://ktpilot-rag-bot.up.railway.app`
- `https://ktpilot-rag-bot.railway.app`
- Visit the URL and check if `/api/health` works

## Why These Changes Are Needed

### Why Public URL (Not Internal)?
- `.railway.internal` is only accessible from within Railway's network
- Your Netlify frontend is on the public internet
- It needs the public Railway URL to connect

### Why No Trailing Slash?
- Trailing slashes can cause URL construction issues
- The code handles paths by adding `/` when needed
- Having a trailing slash can create double slashes: `https://url.com//api/...`

## After Making Changes

1. ✅ **Netlify**: Changed `VITE_API_BASE_URL` to public Railway URL
2. ✅ **Netlify**: Triggered new deployment
3. ✅ **Railway**: Changed `FRONTEND_URL` to remove trailing slash
4. ✅ **Wait**: For both deployments to complete
5. ✅ **Test**: Try signing up/logging in
6. ✅ **Verify**: No more `.railway.internal` errors

## Troubleshooting

### Still seeing `.railway.internal` errors?
- **Check**: Did you trigger a new Netlify deployment after changing the env var?
- **Check**: Is the environment variable value correct in Netlify dashboard?
- **Check**: Clear browser cache and hard refresh (Ctrl+Shift+R)

### Still having CORS errors?
- **Check**: Is `FRONTEND_URL` in Railway set correctly (no trailing slash)?
- **Check**: Does the Railway URL match your actual Netlify URL exactly?
- **Check**: Wait for Railway to finish redeploying after changing variables

### Can't find public Railway URL?
- **Check**: Railway Dashboard → Your Service → Settings → Networking
- **Check**: Railway might need to generate a public domain (some services don't have one by default)
- **Check**: You might need to enable public domain in Railway settings

## Quick Checklist

- [ ] Found public Railway URL (not `.internal`)
- [ ] Updated Netlify `VITE_API_BASE_URL` to public Railway URL
- [ ] Removed trailing slash from Netlify URL
- [ ] Triggered new Netlify deployment
- [ ] Updated Railway `FRONTEND_URL` to remove trailing slash
- [ ] Waited for both deployments to complete
- [ ] Tested the connection
- [ ] Verified no more errors

## Summary

**What to change:**
1. **Netlify**: `VITE_API_BASE_URL` → Change from `.railway.internal` to public Railway URL
2. **Railway**: `FRONTEND_URL` → Remove trailing slash
3. **Both**: Redeploy after making changes

**Expected result:**
- Frontend connects to backend successfully
- No more `.railway.internal` errors
- No more CORS errors
- Sign up/login works







