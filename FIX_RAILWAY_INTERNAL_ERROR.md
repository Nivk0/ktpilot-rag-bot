# Fix: ERR_NAME_NOT_RESOLVED - railway.internal Error

## Problem

You're seeing this error:
```
POST https://ktpilot-rag-bot.railway.internal/api/auth/signup net::ERR_NAME_NOT_RESOLVED
```

## What This Means

The `.railway.internal` domain is Railway's **internal network domain** that's only accessible from within Railway's infrastructure. It's **not accessible from the public internet** (like your Netlify frontend).

This happens when:
1. `VITE_API_BASE_URL` is not set in Netlify environment variables
2. `VITE_API_BASE_URL` is set to the wrong value (internal URL instead of public URL)
3. Netlify site wasn't rebuilt after setting the environment variable
4. The environment variable is set but not being read during build

## Solution

### Step 1: Get Your Public Railway URL

1. Go to **Railway Dashboard** → Your Service
2. Look for your **Public Domain** (not the internal domain)
3. It should look like: `https://your-app-name.up.railway.app` or `https://your-app-name.railway.app`
4. **Copy this URL** (it should NOT have `.internal` in it)

### Step 2: Set Environment Variable in Netlify

1. Go to **Netlify Dashboard** → Your Site → **Site Settings** → **Environment Variables**
2. Check if `VITE_API_BASE_URL` exists:
   - If it exists and has `.railway.internal` in it: **Delete it and recreate it**
   - If it doesn't exist: **Add it**
3. Set the value:
   - **Key**: `VITE_API_BASE_URL`
   - **Value**: Your **public Railway URL** (e.g., `https://ktpilot-rag-bot.up.railway.app`)
   - **Make sure there's NO trailing slash**
   - **Make sure it's the PUBLIC URL, not the internal one**
4. Click **"Save"**

### Step 3: Trigger a New Deployment

**IMPORTANT**: Environment variables are baked into the build at build time. You MUST trigger a new deployment after setting/changing the environment variable.

1. Go to **Netlify Dashboard** → Your Site → **Deploys**
2. Click **"Trigger deploy"** → **"Deploy site"**
3. Wait for the deployment to complete
4. Test your site again

### Step 4: Verify the Fix

1. Visit your Netlify site
2. Open browser **Developer Tools** (F12) → **Console** tab
3. Try to sign up or log in
4. Check the Network tab - requests should now go to:
   - ✅ `https://your-app.up.railway.app/api/auth/signup` (public URL)
   - ❌ NOT `https://ktpilot-rag-bot.railway.internal/api/auth/signup` (internal URL)

## How to Find Your Public Railway URL

### Method 1: Railway Dashboard
1. Go to Railway Dashboard → Your Service
2. Look at the top of the page for your **Public Domain**
3. It should show: `https://your-app-name.up.railway.app`

### Method 2: Railway Settings
1. Go to Railway Dashboard → Your Service → **Settings** → **Networking**
2. Look for **Public Domain** or **Custom Domain**
3. Copy the public URL

### Method 3: Test the URL
1. Try visiting: `https://your-app-name.up.railway.app/api/health`
2. If it works (returns JSON), that's your public URL
3. If it doesn't work, check Railway Dashboard for the correct URL

## Common Mistakes

### ❌ Wrong: Using Internal URL
```
VITE_API_BASE_URL=https://ktpilot-rag-bot.railway.internal
```

### ✅ Correct: Using Public URL
```
VITE_API_BASE_URL=https://ktpilot-rag-bot.up.railway.app
```

### ❌ Wrong: Trailing Slash
```
VITE_API_BASE_URL=https://ktpilot-rag-bot.up.railway.app/
```

### ✅ Correct: No Trailing Slash
```
VITE_API_BASE_URL=https://ktpilot-rag-bot.up.railway.app
```

### ❌ Wrong: Not Redeploying
- Setting the environment variable but not triggering a new deployment
- The old build still has the old (or missing) value

### ✅ Correct: Redeploy After Setting
- Set the environment variable
- Trigger a new deployment
- Wait for deployment to complete
- Test again

## Verification Checklist

- [ ] Found your public Railway URL (not `.railway.internal`)
- [ ] Set `VITE_API_BASE_URL` in Netlify to your public Railway URL
- [ ] No trailing slash in the URL
- [ ] Triggered a new Netlify deployment
- [ ] Deployment completed successfully
- [ ] Tested the site - requests go to public URL
- [ ] No more `ERR_NAME_NOT_RESOLVED` errors

## How Vite Environment Variables Work

Vite environment variables are **baked into the build** at build time:

1. During build: Vite reads `VITE_API_BASE_URL` from environment variables
2. It replaces `import.meta.env.VITE_API_BASE_URL` in your code with the actual value
3. This value is hardcoded into the built JavaScript files
4. If the environment variable changes, you **must rebuild** for the change to take effect

That's why you need to trigger a new deployment after changing environment variables!

## Debugging

### Check What URL is Being Used

1. Open browser **Developer Tools** (F12)
2. Go to **Console** tab
3. Type: `console.log(import.meta.env.VITE_API_BASE_URL)`
4. This will show what value is actually being used

### Check Netlify Build Logs

1. Go to Netlify Dashboard → Your Site → **Deploys**
2. Click on a deployment
3. Check the build logs for:
   - Environment variables being loaded
   - Any errors during build
   - The build output

### Check Railway Public Domain

1. Go to Railway Dashboard → Your Service
2. Verify your service has a public domain
3. Test the public domain: `https://your-app.up.railway.app/api/health`
4. Should return: `{"status":"ok","server":"running","database":"connected"}`

## Still Having Issues?

1. **Double-check the Railway URL**:
   - Visit `https://your-app.up.railway.app/api/health` in your browser
   - If it doesn't work, that's not your public URL
   - Check Railway Dashboard for the correct public URL

2. **Verify Environment Variable**:
   - Go to Netlify → Site Settings → Environment Variables
   - Make sure `VITE_API_BASE_URL` is set correctly
   - Make sure there's no typo

3. **Clear Browser Cache**:
   - Clear your browser cache
   - Hard refresh (Ctrl+Shift+R or Cmd+Shift+R)
   - Try in incognito/private mode

4. **Check Build Logs**:
   - Check Netlify build logs for any errors
   - Verify the environment variable is being read during build

5. **Verify Railway is Running**:
   - Check Railway Dashboard → Your Service
   - Verify the service is running
   - Check Railway logs for any errors

## Example Configuration

### Netlify Environment Variables
```
VITE_API_BASE_URL=https://ktpilot-rag-bot.up.railway.app
```

### Railway Environment Variables
```
FRONTEND_URL=https://your-app.netlify.app
MONGODB_URI=mongodb+srv://...
JWT_SECRET=your-secret-key
GEMINI_API_KEY=your-gemini-key
```

### Expected Behavior
- Frontend requests go to: `https://ktpilot-rag-bot.up.railway.app/api/...`
- Backend accepts requests from: `https://your-app.netlify.app`
- No `ERR_NAME_NOT_RESOLVED` errors
- No `.railway.internal` domains in network requests

## Quick Fix Summary

1. **Get public Railway URL** (from Railway Dashboard)
2. **Set `VITE_API_BASE_URL` in Netlify** (public URL, no trailing slash)
3. **Trigger new Netlify deployment** (required!)
4. **Test the connection** (should work now)







