# Railway Build Error Fix

## Problem
"Error creating build plan with Railpack/Nixpacks" during Railway deployment.

## Solution: Use RAILPACK Builder

Railway uses RAILPACK to automatically detect Node.js projects from `package.json`. The `railway.json` file helps Railway properly detect your project structure.

### Step 1: railway.json Configuration

The `server/railway.json` file is already configured with:
- **RAILPACK builder** - Auto-detects Node.js projects
- **Runtime V2** - Latest Railway runtime
- **Restart policy** - Automatically restarts on failure

### Step 2: Configure Railway Settings

1. **Go to Railway Dashboard** → Your Service → Settings
2. **Set Root Directory** to: `server` ⚠️ **CRITICAL - This is the most important step!**
3. **Leave Build Command EMPTY** (RAILPACK will auto-detect and run `npm install`)
4. **Leave Start Command EMPTY** (RAILPACK will auto-detect and use `npm start` from package.json)

### Step 3: Verify package.json

Your `package.json` already has:
- ✅ `"start": "node index.js"` script
- ✅ All dependencies listed
- ✅ Node.js compatible

### Step 4: RAILPACK Auto-Detection

RAILPACK (Railway's build system) will automatically:
1. Detect Node.js project from `package.json` in the `server` directory
2. Run `npm install` to install dependencies
3. Run `npm start` which executes `node index.js`
4. Set `PORT` environment variable automatically

**Note**: RAILPACK is Railway's build system (not Docker). It automatically detects your project type and builds it accordingly.

### Manual Build Commands (Only if auto-detect fails)

If auto-detect still fails, manually set in Railway Settings:
- **Root Directory**: `server`
- **Build Command**: `npm install`
- **Start Command**: `node index.js`

## Important: Root Directory

⚠️ **CRITICAL**: Make sure the Root Directory is set to `server` in Railway settings!

Railway needs to know which directory contains your Node.js project. Since your repo has:
- `/client` - Frontend (for Netlify)
- `/server` - Backend (for Railway)

Railway must be configured to use `/server` as the root.

## Verification Steps

1. ✅ Root Directory set to `server`
2. ✅ `package.json` exists in `server/` directory
3. ✅ `package.json` has `start` script: `"start": "node index.js"`
4. ✅ `index.js` exists in `server/` directory
5. ✅ Environment variables are set in Railway

## Current Configuration

- ✅ `server/railway.json` - RAILPACK configuration (helps Railway detect Node.js)
- ✅ `server/package.json` - Has `start` script (`node index.js`)
- ✅ `server/Procfile` - Backup process file (optional, Railway uses package.json)
- ✅ `server/index.js` - Uses `process.env.PORT` (Railway sets this automatically)
- ✅ RAILPACK builder - Railway's build system (auto-detects Node.js, not Docker)

## Next Steps

1. Go to Railway Dashboard
2. Check Settings → Root Directory is `server`
3. Remove any custom build/start commands (let Railway auto-detect)
4. Redeploy
5. Check build logs for any errors

## If Still Failing

1. **Check Railway build logs** for specific errors
2. **Verify Root Directory** is set to `server` (most common issue)
3. **Verify all dependencies** in `package.json` are correct
4. **Check if MongoDB connection string** is valid
5. **Verify Node.js version** (Railway uses Node 18 by default)
6. **Try manual build commands**:
   - Build Command: `npm install`
   - Start Command: `node index.js`
7. **Check that package.json exists** in the `server` directory
8. **Verify index.js exists** in the `server` directory

