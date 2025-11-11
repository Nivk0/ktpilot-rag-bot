# Fix Gmail Email Authentication Error

## ❌ Problem
You're getting: "Invalid login: Username and Password not accepted"

This means Gmail is rejecting your app password.

## ✅ Solution - Regenerate Gmail App Password

### Step 1: Verify 2-Step Verification is Enabled
1. Go to: https://myaccount.google.com/security
2. Check if "2-Step Verification" is **ON**
3. If it's OFF, enable it first (this is required for app passwords)

### Step 2: Generate a NEW App Password
1. Go to: https://myaccount.google.com/apppasswords
2. Make sure you're logged into: **epsilonktpilot@gmail.com**
3. Select "Mail" from the dropdown
4. Select "Other (Custom name)" → Type "KTPilot"
5. Click "Generate"
6. **Copy the NEW 16-character password** (looks like: `abcd efgh ijkl mnop`)
7. **Important:** Copy it immediately - you can't see it again!

### Step 3: Update .env File
1. Open: `server/.env`
2. Find the line: `SMTP_PASS=xckwxzbjbwkfkccb`
3. Replace it with your NEW app password (remove spaces)
4. Save the file

### Step 4: Restart Server
```bash
cd server
# Stop the server (Ctrl+C if running)
npm start
```

## 🔍 Common Issues

### Issue 1: Wrong Gmail Account
- Make sure you're generating the app password for **epsilonktpilot@gmail.com**
- Not for a different Gmail account

### Issue 2: 2-Step Verification Not Enabled
- App passwords only work if 2-Step Verification is enabled
- Enable it at: https://myaccount.google.com/security

### Issue 3: App Password Expired or Revoked
- App passwords can be revoked if you change your Google account password
- Generate a new one if this happens

### Issue 4: Copy/Paste Error
- Make sure you copied the entire 16-character password
- Remove all spaces when pasting into .env file
- Check for extra characters or missing characters

## 🧪 Test the Connection

After updating, test with:
```bash
cd server
node -e "require('dotenv').config(); const nodemailer = require('nodemailer'); const t = nodemailer.createTransport({host: process.env.SMTP_HOST, port: 587, secure: false, auth: {user: process.env.SMTP_USER, pass: process.env.SMTP_PASS.replace(/\s/g,'')}}); t.verify((e,s) => console.log(e ? '❌ Error: ' + e.message : '✅ Success! Email is configured correctly.'));"
```

## ✅ Expected Result

You should see:
- ✅ "SMTP server is ready to send emails!"
- Or: ✅ "Success! Email is configured correctly."

If you still see errors, the app password is incorrect or doesn't match the email account.




