# Email Authentication Troubleshooting

## ❌ Current Issue
Gmail is rejecting the app password authentication.

## ✅ Step-by-Step Verification

### 1. Verify You're Logged Into the Correct Account
- Go to: https://myaccount.google.com
- Check the email address in the top right
- **Must be:** epsilonktpilot@gmail.com
- If it's a different account, sign out and sign in with epsilonktpilot@gmail.com

### 2. Verify 2-Step Verification is Enabled
1. Go to: https://myaccount.google.com/security
2. Scroll to "2-Step Verification"
3. **Must show:** "On" (green)
4. If it's "Off", click it and enable it first
5. You cannot generate app passwords without 2-Step Verification

### 3. Generate App Password Correctly
1. Go to: https://myaccount.google.com/apppasswords
2. **While logged into epsilonktpilot@gmail.com**
3. Select "Mail" from the "Select app" dropdown
4. Select "Other (Custom name)" from the "Select device" dropdown
5. Type: "KTPilot"
6. Click "Generate"
7. **Copy the 16-character password immediately**
8. It will look like: `yazs vdwo cczl trac` (with spaces)
9. **Remove spaces** when pasting into .env file: `yazsvdwocczltrac`

### 4. Common Mistakes to Avoid
- ❌ Generating password for wrong Gmail account
- ❌ Not enabling 2-Step Verification first
- ❌ Copying password with spaces (remove them!)
- ❌ Using regular Gmail password instead of app password
- ❌ App password expired/revoked (generate new one)

### 5. Alternative: Check Gmail Security Settings
1. Go to: https://myaccount.google.com/security
2. Check "Recent security activity" for any blocked login attempts
3. Make sure "Less secure app access" is NOT the issue (it's deprecated anyway)
4. App passwords are the correct method

### 6. Test with a Simple Script
After updating .env, test with:
```bash
cd server
node -e "require('dotenv').config(); const nodemailer = require('nodemailer'); const t = nodemailer.createTransport({host: 'smtp.gmail.com', port: 587, secure: false, auth: {user: process.env.SMTP_USER, pass: process.env.SMTP_PASS.replace(/\s/g,'')}}); t.verify((e,s) => console.log(e ? '❌ ' + e.message : '✅ Success!'));"
```

## 🔄 If Still Not Working

### Option 1: Try Generating Another App Password
- Delete the old app password
- Generate a completely new one
- Make sure you're copying it correctly

### Option 2: Verify Account Status
- Check if epsilonktpilot@gmail.com account is active
- Make sure the account hasn't been suspended
- Try logging into Gmail normally to verify account works

### Option 3: Use a Different Email Service
If Gmail continues to have issues, consider:
- **Outlook/Hotmail:** Use your UTDallas email with Outlook SMTP
- **SendGrid:** Free tier (100 emails/day)
- **Mailgun:** Free tier available

## 📝 Current Configuration
- Email: epsilonktpilot@gmail.com
- SMTP Host: smtp.gmail.com
- Port: 587
- Security: TLS

## ✅ Expected Result
When working correctly, you should see:
```
✅ SUCCESS! SMTP server is ready to send emails!
```




