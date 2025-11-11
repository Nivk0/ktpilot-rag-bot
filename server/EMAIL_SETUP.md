# Email Configuration for Password Reset

To enable email sending for password reset codes, configure SMTP settings in your `.env` file.

## Environment Variables

Add these to `server/.env`:

```env
# SMTP Configuration (for sending password reset emails)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
SMTP_FROM=your-email@gmail.com
```

## Gmail Setup

1. Enable 2-Step Verification on your Google account
2. Generate an App Password:
   - Go to Google Account → Security → 2-Step Verification → App passwords
   - Generate a password for "Mail"
   - Use this password as `SMTP_PASS`

## Other Email Providers

### Outlook/Hotmail
```env
SMTP_HOST=smtp-mail.outlook.com
SMTP_PORT=587
SMTP_SECURE=false
```

### SendGrid
```env
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USER=apikey
SMTP_PASS=your-sendgrid-api-key
```

### Mailgun
```env
SMTP_HOST=smtp.mailgun.org
SMTP_PORT=587
SMTP_USER=your-mailgun-username
SMTP_PASS=your-mailgun-password
```

## Development Mode

If SMTP is not configured, the system will:
- Log the reset code to the console
- Return the code in the API response (development only)
- In production, codes are never returned in the API response

## Security Notes

- Never commit `.env` files to version control
- Use app-specific passwords, not your main account password
- In production, always configure email sending
- Reset codes expire after 30 minutes

