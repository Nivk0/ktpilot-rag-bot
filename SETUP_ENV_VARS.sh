#!/bin/bash

# Environment Variables Setup Helper Script
# This script helps you set up environment variables for Netlify and Railway
# Run this script to get step-by-step instructions and copy-paste commands

echo "=========================================="
echo "KTPilot Environment Variables Setup"
echo "=========================================="
echo ""
echo "This script will help you set up environment variables."
echo "You'll need to manually add them to Netlify and Railway dashboards."
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}=== NETLIFY VARIABLES ===${NC}"
echo ""
echo "1. Go to: https://app.netlify.com"
echo "2. Select your site → Site Settings → Environment Variables"
echo "3. Add the following variable:"
echo ""
echo -e "${YELLOW}Variable Name:${NC} VITE_API_BASE_URL"
echo -e "${YELLOW}Value:${NC} https://YOUR-RAILWAY-URL.up.railway.app"
echo -e "${YELLOW}Example:${NC} https://ktpilot-rag-bot.up.railway.app"
echo ""
echo "⚠️  IMPORTANT:"
echo "   - Use your PUBLIC Railway URL (not .railway.internal)"
echo "   - No trailing slash"
echo "   - Must start with https://"
echo ""
echo "4. After adding, trigger a new deployment:"
echo "   Deploys → Trigger deploy → Deploy site"
echo ""

read -p "Press Enter to continue to Railway variables..."

echo ""
echo -e "${GREEN}=== RAILWAY VARIABLES (REQUIRED) ===${NC}"
echo ""
echo "1. Go to: https://railway.app"
echo "2. Select your service → Variables"
echo "3. Add the following variables one by one:"
echo ""

echo -e "${YELLOW}Variable 1: MONGODB_URI${NC}"
echo "   Value: mongodb+srv://USERNAME:PASSWORD@CLUSTER.mongodb.net/ktpilot?retryWrites=true&w=majority"
echo "   Get from: MongoDB Atlas → Connect → Connect your application"
echo ""

echo -e "${YELLOW}Variable 2: JWT_SECRET${NC}"
echo "   Value: $(openssl rand -base64 32 2>/dev/null || echo 'your-random-secret-key-here')"
echo "   (Generated above, or use your own random string)"
echo ""

echo -e "${YELLOW}Variable 3: GEMINI_API_KEY${NC}"
echo "   Value: YOUR_GEMINI_API_KEY"
echo "   Get from: https://makersuite.google.com/app/apikey"
echo ""

echo -e "${YELLOW}Variable 4: FRONTEND_URL${NC}"
echo "   Value: https://YOUR-NETLIFY-URL.netlify.app"
echo "   Example: https://ktpilot.netlify.app"
echo "   ⚠️  No trailing slash!"
echo ""

read -p "Press Enter to see optional email variables (or Ctrl+C to exit)..."

echo ""
echo -e "${GREEN}=== RAILWAY VARIABLES (OPTIONAL - FOR EMAIL) ===${NC}"
echo ""
echo "Only add these if you want email password reset functionality:"
echo ""

echo -e "${YELLOW}Variable 5: SMTP_HOST${NC}"
echo "   Value: smtp.gmail.com"
echo ""

echo -e "${YELLOW}Variable 6: SMTP_PORT${NC}"
echo "   Value: 587"
echo ""

echo -e "${YELLOW}Variable 7: SMTP_USER${NC}"
echo "   Value: your-email@gmail.com"
echo ""

echo -e "${YELLOW}Variable 8: SMTP_PASS${NC}"
echo "   Value: your-16-character-app-password"
echo "   (Get from: Gmail → Account → Security → App passwords)"
echo ""

echo -e "${YELLOW}Variable 9: SMTP_FROM${NC}"
echo "   Value: your-email@gmail.com"
echo ""

echo -e "${YELLOW}Variable 10: SMTP_SECURE${NC}"
echo "   Value: false"
echo ""

echo ""
echo -e "${GREEN}=== QUICK CHECKLIST ===${NC}"
echo ""
echo "Netlify:"
echo "  [ ] VITE_API_BASE_URL set to public Railway URL"
echo "  [ ] Triggered new deployment"
echo ""
echo "Railway (Required):"
echo "  [ ] MONGODB_URI set"
echo "  [ ] JWT_SECRET set"
echo "  [ ] GEMINI_API_KEY set"
echo "  [ ] FRONTEND_URL set (no trailing slash)"
echo ""
echo "Railway (Optional):"
echo "  [ ] SMTP variables set (if using email)"
echo ""
echo ""
echo -e "${GREEN}=== NEXT STEPS ===${NC}"
echo ""
echo "1. Add all variables to Netlify and Railway"
echo "2. Wait for deployments to complete"
echo "3. Test your application"
echo "4. Check browser console for any errors"
echo ""
echo "For detailed instructions, see: ENVIRONMENT_VARIABLES_CHECKLIST.md"
echo ""







