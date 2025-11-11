# Quick Email Setup - Follow These Steps

## ✅ Step 1: Get Your Gmail App Password

1. **Go to Google App Passwords:**
   - Open: https://myaccount.google.com/apppasswords
   - Or go to: https://myaccount.google.com/security → App passwords

2. **If you see "2-Step Verification is off":**
   - Click "2-Step Verification" and enable it first
   - Then come back to App passwords

3. **Generate App Password:**
   - Select "Mail" from the dropdown
   - Select "Other (Custom name)"
   - Type: "KTPilot"
   - Click "Generate"
   - **Copy the 16-character password** (looks like: `abcd efgh ijkl mnop`)

## ✅ Step 2: Edit the .env File

1. **Open the .env file:**
   ```bash
   cd server
   nano .env
   ```
   (Or use any text editor like VS Code, TextEdit, etc.)

2. **Find these lines:**
   ```env
   SMTP_USER=your-email@gmail.com
   SMTP_PASS=your-16-character-app-password
   SMTP_FROM=your-email@gmail.com
   ```

3. **Replace with YOUR information:**
   - Replace `your-email@gmail.com` with YOUR Gmail address (in all 3 places)
   - Replace `your-16-character-app-password` with the app password from Step 1
   - **Remove spaces** from the app password (it should be 16 characters with no spaces)

4. **Save the file** (Ctrl+X, then Y, then Enter if using nano)

## ✅ Step 3: Restart the Server

```bash
# Stop the current server (Ctrl+C if running in terminal)
# Then restart:
cd server
npm start
```

## ✅ Step 4: Test It!

1. Go to http://localhost:5173
2. Click "Forgot password?"
3. Enter your email
4. Check your email inbox! 📧

## 🎉 Done!

Your email should now work. If you see "Reset code sent to your email" instead of the code on screen, it's working!

## ❌ Still having issues?

- Check the server console for error messages
- Make sure you're using an **App Password**, not your regular Gmail password
- Verify the .env file is in the `server/` directory
- Make sure you restarted the server after editing .env
- Check QUICK_EMAIL_SETUP.md for troubleshooting tips




