# Email Setup Instructions

To enable email sending for password reset codes, you need to configure SMTP settings.

## Quick Setup (Gmail - Recommended)

### Step 1: Enable 2-Step Verification
1. Go to your Google Account: https://myaccount.google.com
2. Click **Security** → **2-Step Verification**
3. Follow the prompts to enable it

### Step 2: Generate App Password
1. Go to: https://myaccount.google.com/apppasswords
2. Select **Mail** and your device
3. Click **Generate**
4. Copy the 16-character password (it will look like: `abcd efgh ijkl mnop`)

### Step 3: Create .env File
Create a file named `.env` in the `server/` directory with:

```env
PORT=5050
FRONTEND_URL=http://localhost:5173
JWT_SECRET=your-secret-key-change-in-production

# Gmail SMTP Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-16-character-app-password
SMTP_FROM=your-email@gmail.com
```

**Replace:**
- `your-email@gmail.com` with your actual Gmail address
- `your-16-character-app-password` with the app password from Step 2

### Step 4: Restart Backend
```bash
cd server
npm start
```

## Alternative Email Providers

### Outlook/Hotmail
```env
SMTP_HOST=smtp-mail.outlook.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@outlook.com
SMTP_PASS=your-password
SMTP_FROM=your-email@outlook.com
```

### SendGrid (Free tier available)
1. Sign up at https://sendgrid.com
2. Create API key
3. Use these settings:
```env
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USER=apikey
SMTP_PASS=your-sendgrid-api-key
SMTP_FROM=your-verified-email@domain.com
```

## Testing

After setup, test by:
1. Go to http://localhost:5173
2. Click "Forgot password?"
3. Enter your email
4. Check your email inbox for the reset code

## Troubleshooting

**Email not sending?**
- Check that `.env` file exists in `server/` directory
- Verify all SMTP variables are set correctly
- Check backend console for error messages
- For Gmail: Make sure you're using an App Password, not your regular password

**Getting "Email service not configured" error?**
- Make sure `.env` file is in the `server/` directory
- Restart the backend server after creating/updating `.env`
- Check that all SMTP variables start with `SMTP_`

