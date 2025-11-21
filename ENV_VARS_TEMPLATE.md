# Environment Variables Template

Copy and paste these into Netlify and Railway dashboards.

## 🔵 Netlify Environment Variables

### Add This Variable:

```
Variable Name: VITE_API_BASE_URL
Value: https://YOUR-RAILWAY-URL.up.railway.app
```

**Replace `YOUR-RAILWAY-URL` with your actual Railway public URL.**

Example:
```
VITE_API_BASE_URL=https://ktpilot-rag-bot.up.railway.app
```

---

## 🟢 Railway Environment Variables

### Required Variables (Copy each one):

#### 1. MONGODB_URI
```
Variable Name: MONGODB_URI
Value: mongodb+srv://USERNAME:PASSWORD@CLUSTER.mongodb.net/ktpilot?retryWrites=true&w=majority
```
**Replace `USERNAME`, `PASSWORD`, and `CLUSTER` with your MongoDB Atlas credentials.**

#### 2. JWT_SECRET
```
Variable Name: JWT_SECRET
Value: GENERATE_A_RANDOM_SECRET_KEY_HERE
```
**Generate a random secret key (use `openssl rand -base64 32` or any random string)**

#### 3. GEMINI_API_KEY
```
Variable Name: GEMINI_API_KEY
Value: YOUR_GEMINI_API_KEY
```
**Get from: https://makersuite.google.com/app/apikey**

#### 4. FRONTEND_URL
```
Variable Name: FRONTEND_URL
Value: https://YOUR-NETLIFY-URL.netlify.app
```
**Replace `YOUR-NETLIFY-URL` with your actual Netlify URL. No trailing slash!**

Example:
```
FRONTEND_URL=https://ktpilot.netlify.app
```

### Optional Variables (Only if you want email password reset):

#### 5. SMTP_HOST
```
Variable Name: SMTP_HOST
Value: smtp.gmail.com
```

#### 6. SMTP_PORT
```
Variable Name: SMTP_PORT
Value: 587
```

#### 7. SMTP_USER
```
Variable Name: SMTP_USER
Value: your-email@gmail.com
```

#### 8. SMTP_PASS
```
Variable Name: SMTP_PASS
Value: your-16-character-app-password
```

#### 9. SMTP_FROM
```
Variable Name: SMTP_FROM
Value: your-email@gmail.com
```

#### 10. SMTP_SECURE
```
Variable Name: SMTP_SECURE
Value: false
```

---

## 📋 Quick Copy-Paste (Replace placeholders)

### Netlify:
```
VITE_API_BASE_URL=https://YOUR-RAILWAY-URL.up.railway.app
```

### Railway (Minimum Required):
```
MONGODB_URI=mongodb+srv://USERNAME:PASSWORD@CLUSTER.mongodb.net/ktpilot?retryWrites=true&w=majority
JWT_SECRET=YOUR_RANDOM_SECRET_KEY
GEMINI_API_KEY=YOUR_GEMINI_API_KEY
FRONTEND_URL=https://YOUR-NETLIFY-URL.netlify.app
```

---

## 🎯 Steps to Add Variables

### Netlify:
1. Go to https://app.netlify.com
2. Select your site
3. Go to Site Settings → Environment Variables
4. Click "Add a variable"
5. Paste variable name and value
6. Click "Save"
7. **Trigger a new deployment** (Deploys → Trigger deploy)

### Railway:
1. Go to https://railway.app
2. Select your service
3. Go to Variables tab
4. Click "New Variable"
5. Paste variable name and value
6. Click "Save"
7. Railway will auto-redeploy

---

## ⚠️ Important Notes

1. **Netlify**: Must redeploy after adding/changing environment variables
2. **Railway**: Auto-redeploys when you add/change variables
3. **No trailing slashes** in URLs
4. **Public URLs only** (not `.railway.internal`)
5. **Case sensitive** variable names

---

## ✅ Verification

After adding all variables:
1. Check Netlify deployment completed
2. Check Railway deployment completed
3. Test your application
4. Check browser console for errors
5. Verify API calls work

---

For detailed instructions, see: `ENVIRONMENT_VARIABLES_CHECKLIST.md`







