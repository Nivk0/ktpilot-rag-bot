# Quick Email Setup Guide

## The Problem
You're seeing "Failed to send email" because SMTP (email server) is not configured.

## Quick Fix - Gmail (5 minutes)

### Step 1: Get Gmail App Password
1. Go to: https://myaccount.google.com/apppasswords
2. If you don't see this page, enable 2-Step Verification first:
   - Go to: https://myaccount.google.com/security
   - Enable "2-Step Verification"
   - Then go back to app passwords

3. Generate App Password:
   - Select "Mail" 
   - Select "Other (Custom name)" → Type "KTPilot"
   - Click "Generate"
   - Copy the 16-character password (looks like: `abcd efgh ijkl mnop`)

### Step 2: Create .env File
Create a file named `.env` in the `server/` folder:

```bash
cd server
nano .env
```

Paste this (replace with YOUR email and app password):

```env
PORT=5050
FRONTEND_URL=http://localhost:5173
JWT_SECRET=your-secret-key-change-in-production

SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASS=abcd efgh ijkl mnop
SMTP_FROM=your-email@gmail.com
```

**Important:** 
- Replace `your-email@gmail.com` with YOUR Gmail address
- Replace `abcd efgh ijkl mnop` with the app password from Step 1
- Remove spaces from the app password (it should be 16 characters with no spaces)

### Step 3: Restart Backend
```bash
# Stop the current server (Ctrl+C if running in terminal)
# Then restart:
cd server
npm start
```

### Step 4: Test
1. Go to http://localhost:5173
2. Click "Forgot password?"
3. Enter your email
4. Check your email inbox!

## Alternative: Use a Different Email Service

### Outlook
```env
SMTP_HOST=smtp-mail.outlook.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@outlook.com
SMTP_PASS=your-password
SMTP_FROM=your-email@outlook.com
```

### SendGrid (Free - 100 emails/day)
1. Sign up: https://sendgrid.com
2. Create API key
3. Use:
```env
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USER=apikey
SMTP_PASS=your-sendgrid-api-key
SMTP_FROM=your-verified-email@domain.com
```

## Troubleshooting

**Still getting errors?**
- Check backend console for detailed error messages
- Verify `.env` file is in `server/` directory
- Make sure you restarted the backend after creating `.env`
- For Gmail: Use App Password, NOT your regular password
- Check that all SMTP variables are set correctly

