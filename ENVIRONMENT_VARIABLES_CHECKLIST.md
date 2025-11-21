# Environment Variables Checklist

## Complete List of Environment Variables for Netlify and Railway

### 🔵 Netlify (Frontend) - Required Variables

#### Required (1 variable)

| Variable Name | Value | Description | Example |
|--------------|-------|-------------|---------|
| `VITE_API_BASE_URL` | Your Railway backend public URL | Backend API URL (no trailing slash) | `https://ktpilot-rag-bot.up.railway.app` |

**⚠️ Important:**
- ✅ Must be the **public Railway URL** (NOT `.railway.internal`)
- ✅ No trailing slash
- ✅ Must start with `https://`
- ✅ Must redeploy Netlify after setting/changing this variable

---

### 🟢 Railway (Backend) - Required and Optional Variables

#### Required Variables (4 variables)

| Variable Name | Value | Description | Example |
|--------------|-------|-------------|---------|
| `MONGODB_URI` | MongoDB Atlas connection string | Database connection URL | `mongodb+srv://user:pass@cluster.mongodb.net/ktpilot?retryWrites=true&w=majority` |
| `JWT_SECRET` | Random secret key | Secret for JWT token signing | `your-random-secret-key-here` |
| `GEMINI_API_KEY` | Google Gemini API key | API key for Gemini AI | `AIzaSyBPfhJB5vXrk2IR4YZ4H7x0GxOO6MEEVM` |
| `FRONTEND_URL` | Your Netlify frontend URL | Frontend URL for CORS (no trailing slash) | `https://ktpilot.netlify.app` |

#### Optional Variables (6 variables)

| Variable Name | Value | Description | Example | Required? |
|--------------|-------|-------------|---------|-----------|
| `PORT` | Server port | Server port number | `5050` | ❌ No (Railway sets automatically) |
| `CORS_ORIGIN` | Alternative CORS origin | Alternative frontend URL for CORS | `https://ktpilot.netlify.app` | ❌ No (use FRONTEND_URL instead) |
| `SMTP_HOST` | SMTP server host | Email server hostname | `smtp.gmail.com` | ❌ No (for email password reset) |
| `SMTP_PORT` | SMTP server port | Email server port | `587` | ❌ No (for email password reset) |
| `SMTP_USER` | SMTP username | Email account username | `your-email@gmail.com` | ❌ No (for email password reset) |
| `SMTP_PASS` | SMTP password | Email account password/app password | `your-app-password` | ❌ No (for email password reset) |
| `SMTP_FROM` | From email address | Email sender address | `your-email@gmail.com` | ❌ No (for email password reset) |
| `SMTP_SECURE` | SMTP secure connection | Use TLS/SSL | `false` | ❌ No (for email password reset) |

---

## 📋 Step-by-Step Setup

### Netlify Environment Variables Setup

1. Go to **Netlify Dashboard** → Your Site → **Site Settings** → **Environment Variables**
2. Click **"Add a variable"**
3. Add the following:

```
Key: VITE_API_BASE_URL
Value: https://ktpilot-rag-bot.up.railway.app
Scopes: All scopes (or Production, Deploy Previews, Branch deploys)
```

4. Click **"Save"**
5. **Trigger a new deployment** (Deploys → Trigger deploy → Deploy site)

### Railway Environment Variables Setup

1. Go to **Railway Dashboard** → Your Service → **Variables**
2. Click **"New Variable"** for each variable
3. Add the following **required** variables:

#### Required Variables

```
MONGODB_URI=mongodb+srv://user:password@cluster.mongodb.net/ktpilot?retryWrites=true&w=majority
JWT_SECRET=your-random-secret-key-change-this
GEMINI_API_KEY=AIzaSyBPfhJB5vXrk2IR4YZ4H7x0GxOO6MEEVM
FRONTEND_URL=https://ktpilot.netlify.app
```

#### Optional Variables (Only if needed)

```
PORT=5050
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
SMTP_FROM=your-email@gmail.com
```

4. Railway will automatically redeploy after adding variables

---

## 🔍 How to Get Each Value

### Netlify Variables

#### `VITE_API_BASE_URL`
1. Go to **Railway Dashboard** → Your Service
2. Find **"Public Domain"** or check the service overview
3. Copy the public URL (should be `https://your-app.up.railway.app`)
4. **Test it**: Visit `https://your-app.up.railway.app/api/health`
5. Should return: `{"status":"ok","server":"running","database":"connected"}`

### Railway Variables

#### `MONGODB_URI`
1. Go to **MongoDB Atlas** → Your Cluster → **Connect**
2. Choose **"Connect your application"**
3. Copy the connection string
4. Replace `<password>` with your database password
5. Replace `<dbname>` with `ktpilot` (or your database name)
6. Example: `mongodb+srv://username:password@cluster.mongodb.net/ktpilot?retryWrites=true&w=majority`

#### `JWT_SECRET`
1. Generate a random secret key
2. You can use: `openssl rand -base64 32` (in terminal)
3. Or use any random string (at least 32 characters)
4. Example: `my-super-secret-jwt-key-12345-change-this-in-production`

#### `GEMINI_API_KEY`
1. Go to **Google AI Studio** (https://makersuite.google.com/app/apikey)
2. Create a new API key
3. Copy the API key
4. Example: `AIzaSyBPfhJB5vXrk2IR4YZ4H7x0GxOO6MEEVM`

#### `FRONTEND_URL`
1. Go to **Netlify Dashboard** → Your Site
2. Copy your site URL
3. Should be: `https://your-app.netlify.app`
4. **No trailing slash!**

#### `SMTP_*` Variables (Optional - for email password reset)
1. **Gmail**: Use App Password (see `QUICK_EMAIL_SETUP.md`)
2. **Outlook**: Use your account password
3. **SendGrid**: Use SendGrid API key
4. See `EMAIL_SETUP.md` for detailed instructions

---

## ✅ Complete Checklist

### Netlify Checklist
- [ ] `VITE_API_BASE_URL` set to public Railway URL
- [ ] No trailing slash in URL
- [ ] URL starts with `https://`
- [ ] URL does NOT have `.railway.internal`
- [ ] Triggered new deployment after setting variable

### Railway Checklist - Required
- [ ] `MONGODB_URI` set to MongoDB Atlas connection string
- [ ] `JWT_SECRET` set to random secret key
- [ ] `GEMINI_API_KEY` set to Google Gemini API key
- [ ] `FRONTEND_URL` set to Netlify URL (no trailing slash)

### Railway Checklist - Optional
- [ ] `PORT` set (usually not needed, Railway sets automatically)
- [ ] `SMTP_HOST` set (if using email password reset)
- [ ] `SMTP_PORT` set (if using email password reset)
- [ ] `SMTP_USER` set (if using email password reset)
- [ ] `SMTP_PASS` set (if using email password reset)
- [ ] `SMTP_FROM` set (if using email password reset)
- [ ] `SMTP_SECURE` set (if using email password reset)

---

## 📝 Example Configuration

### Netlify Environment Variables
```env
VITE_API_BASE_URL=https://ktpilot-rag-bot.up.railway.app
```

### Railway Environment Variables - Minimal (Required Only)
```env
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/ktpilot?retryWrites=true&w=majority
JWT_SECRET=my-super-secret-jwt-key-change-this-in-production
GEMINI_API_KEY=AIzaSyBPfhJB5vXrk2IR4YZ4H7x0GxOO6MEEVM
FRONTEND_URL=https://ktpilot.netlify.app
```

### Railway Environment Variables - With Email (Optional)
```env
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/ktpilot?retryWrites=true&w=majority
JWT_SECRET=my-super-secret-jwt-key-change-this-in-production
GEMINI_API_KEY=AIzaSyBPfhJB5vXrk2IR4YZ4H7x0GxOO6MEEVM
FRONTEND_URL=https://ktpilot.netlify.app
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-16-character-app-password
SMTP_FROM=your-email@gmail.com
```

---

## ⚠️ Important Notes

### Netlify
1. **Environment variables are baked into the build** - You MUST redeploy after changing them
2. **No trailing slashes** - Remove any trailing slashes from URLs
3. **Public URLs only** - Never use `.railway.internal` URLs
4. **Case sensitive** - Variable names are case-sensitive (`VITE_API_BASE_URL` not `vite_api_base_url`)

### Railway
1. **Automatic redeploy** - Railway automatically redeploys when you add/change variables
2. **No trailing slashes** - Remove any trailing slashes from URLs
3. **Case sensitive** - Variable names are case-sensitive
4. **PORT is automatic** - Railway sets `PORT` automatically, you usually don't need to set it
5. **MongoDB URI** - Make sure your MongoDB Atlas IP whitelist allows all IPs (`0.0.0.0/0`) or Railway's IPs

### Security
1. **Never commit secrets** - Don't commit `.env` files or secrets to GitHub
2. **Use strong JWT_SECRET** - Generate a random, long secret key
3. **Protect API keys** - Keep your API keys secure
4. **Rotate secrets** - Change secrets regularly in production

---

## 🔧 Troubleshooting

### Netlify: Variable not working
- **Check**: Did you trigger a new deployment after setting the variable?
- **Check**: Is the variable name exactly `VITE_API_BASE_URL`?
- **Check**: Is the value correct (public Railway URL, no trailing slash)?

### Railway: Variable not working
- **Check**: Did Railway finish redeploying after adding the variable?
- **Check**: Is the variable name correct (case-sensitive)?
- **Check**: Are there any typos in the variable value?

### MongoDB: Connection fails
- **Check**: Is `MONGODB_URI` correct?
- **Check**: Is your MongoDB Atlas IP whitelist set to `0.0.0.0/0`?
- **Check**: Are the username and password correct?

### CORS: Errors
- **Check**: Is `FRONTEND_URL` set correctly in Railway?
- **Check**: Does `FRONTEND_URL` match your Netlify URL exactly?
- **Check**: Is there a trailing slash in `FRONTEND_URL`? (Remove it!)

---

## 📚 Related Documentation

- **CONNECT_NETLIFY_RAILWAY.md** - How to connect Netlify to Railway
- **FIX_RAILWAY_INTERNAL_ERROR.md** - Fix for `.railway.internal` errors
- **QUICK_FIX_ENV_VARS.md** - Quick fix for environment variable issues
- **EMAIL_SETUP.md** - How to set up email (SMTP variables)
- **MONGODB_SETUP.md** - How to set up MongoDB Atlas

---

## 🎯 Quick Reference

### Minimum Required (To Get Started)
**Netlify:**
- `VITE_API_BASE_URL`

**Railway:**
- `MONGODB_URI`
- `JWT_SECRET`
- `GEMINI_API_KEY`
- `FRONTEND_URL`

### Recommended (For Production)
**Netlify:**
- `VITE_API_BASE_URL`

**Railway:**
- `MONGODB_URI`
- `JWT_SECRET`
- `GEMINI_API_KEY`
- `FRONTEND_URL`
- `SMTP_HOST` (for email password reset)
- `SMTP_PORT` (for email password reset)
- `SMTP_USER` (for email password reset)
- `SMTP_PASS` (for email password reset)
- `SMTP_FROM` (for email password reset)

---

## Summary

**Netlify needs:** 1 variable (`VITE_API_BASE_URL`)
**Railway needs:** 4 required variables + 6 optional variables (for email)

Set these up, redeploy Netlify, and your application should work!







