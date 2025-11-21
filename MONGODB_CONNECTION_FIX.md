# MongoDB Connection Fix Guide

## Problem
You're seeing the error: `Operation users.findOne() buffering timed out after 10000ms`

This means your MongoDB connection is failing, usually because your IP address is not whitelisted in MongoDB Atlas.

## Solution: Whitelist Your IP Address

### Step 1: Get Your Current IP Address
1. Visit: https://www.whatismyip.com/
2. Copy your public IP address (e.g., `123.45.67.89`)

### Step 2: Whitelist Your IP in MongoDB Atlas

1. **Login to MongoDB Atlas**
   - Go to: https://cloud.mongodb.com/
   - Sign in with your MongoDB Atlas account

2. **Navigate to Network Access**
   - Click on **"Network Access"** in the left sidebar
   - Or go directly to: https://cloud.mongodb.com/v2#/security/network/whitelist

3. **Add IP Address**
   - Click the **"Add IP Address"** button (green button)
   - Choose one of these options:
     
     **Option A: Add Your Current IP (Recommended for Security)**
     - Click **"Add Current IP Address"** button
     - Or manually enter your IP: `YOUR_IP_ADDRESS/32`
     - Click **"Confirm"**
     
     **Option B: Allow All IPs (Less Secure, but Works Everywhere)**
     - Enter: `0.0.0.0/0`
     - Click **"Confirm"**
     - ⚠️ **Warning**: This allows access from any IP address. Only use this for development/testing.

4. **Wait for Changes to Apply**
   - It may take 1-2 minutes for the IP whitelist to take effect
   - The status will change from "Pending" to "Active"

### Step 3: Verify Your Connection String

Make sure your `.env` file has the correct connection string:

```env
MONGODB_URI=mongodb+srv://dal198705_db_user:4IVNQ3Y1sY1LuMmF@cluster0.a9eohzp.mongodb.net/ktpilot?retryWrites=true&w=majority
```

### Step 4: Restart Your Server

After whitelisting your IP:

1. Stop the server (Ctrl+C)
2. Wait 1-2 minutes for MongoDB Atlas to update
3. Restart the server: `npm start`
4. You should see: `✅ Connected to MongoDB Atlas`

## Troubleshooting

### Still Not Connecting?

1. **Check Your IP Address Changed**
   - If you're on a dynamic IP, your IP may have changed
   - Get your current IP again and add it to the whitelist

2. **Verify Username and Password**
   - Make sure your MongoDB username and password are correct
   - If you forgot your password, reset it in MongoDB Atlas:
     - Go to: Database Access → Edit User → Reset Password

3. **Check Database Name**
   - Make sure the database name in your connection string exists
   - Default database name: `ktpilot`
   - You can create it automatically by connecting

4. **Check Firewall/VPN**
   - If you're behind a corporate firewall or VPN, you may need to whitelist MongoDB's IP ranges
   - Or use a different network

5. **Test Connection Manually**
   ```bash
   cd server
   node -e "const mongoose = require('mongoose'); mongoose.connect(process.env.MONGODB_URI || 'your-connection-string').then(() => {console.log('✅ Connected!'); process.exit(0);}).catch(err => {console.error('❌ Error:', err.message); process.exit(1);});"
   ```

### Common Error Messages

- **"IP not whitelisted"**: Add your IP to MongoDB Atlas Network Access
- **"Authentication failed"**: Check your username and password
- **"Timeout"**: Check your internet connection and firewall settings
- **"Server selection timed out"**: MongoDB Atlas cluster may be paused (free tier) or your IP is not whitelisted

## Quick Fix for Development

If you want to allow access from anywhere (for development only):

1. Go to MongoDB Atlas → Network Access
2. Click "Add IP Address"
3. Enter: `0.0.0.0/0`
4. Click "Confirm"
5. Wait 1-2 minutes
6. Restart your server

⚠️ **Security Warning**: `0.0.0.0/0` allows access from any IP address. Only use this for development/testing, not production.

## Still Having Issues?

1. Check MongoDB Atlas status: https://status.mongodb.com/
2. Review MongoDB Atlas logs: https://cloud.mongodb.com/v2#/metrics
3. Check your server logs for detailed error messages
4. Verify your connection string format is correct

## Connection String Format

```
mongodb+srv://USERNAME:PASSWORD@CLUSTER.mongodb.net/DATABASE?retryWrites=true&w=majority
```

Example:
```
mongodb+srv://dal198705_db_user:4IVNQ3Y1sY1LuMmF@cluster0.a9eohzp.mongodb.net/ktpilot?retryWrites=true&w=majority
```

Make sure to:
- Replace `USERNAME` with your MongoDB username
- Replace `PASSWORD` with your MongoDB password (URL-encoded if it has special characters)
- Replace `CLUSTER` with your cluster address
- Replace `DATABASE` with your database name (e.g., `ktpilot`)






