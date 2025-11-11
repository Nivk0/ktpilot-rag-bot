# MongoDB Integration Guide

## Overview
KTPilot now uses MongoDB to store all data, allowing multiple computers to share the same database. This means:
- ✅ Users can sign up on any computer and be visible to everyone
- ✅ Documents uploaded on one computer are available on all computers
- ✅ Messages and contacts are shared across all instances
- ✅ All data is centralized in MongoDB

## Setup Instructions

### 1. Install MongoDB

**Option A: Local MongoDB (for development)**
```bash
# macOS
brew install mongodb-community

# Start MongoDB
brew services start mongodb-community
```

**Option B: MongoDB Atlas (Cloud - Recommended for production)**
1. Go to https://www.mongodb.com/cloud/atlas
2. Create a free account
3. Create a new cluster (free tier available)
4. Get your connection string (mongodb+srv://...)

### 2. Configure Connection String

Edit `server/.env` and add:
```bash
# For local MongoDB
MONGODB_URI=mongodb://localhost:27017/ktpilot

# For MongoDB Atlas (cloud)
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/ktpilot?retryWrites=true&w=majority
```

### 3. Migrate Existing Data (Optional)

If you have existing JSON files, run the migration script:
```bash
cd server
node migrate-to-mongodb.js
```

This will migrate:
- documents.json → MongoDB documents collection
- users.json → MongoDB users collection
- messages.json → MongoDB messages collection
- contacts.json → MongoDB contacts collection
- resetCodes.json → MongoDB resetcodes collection

### 4. Start the Server

```bash
cd server
node index.js
```

You should see:
```
✅ Connected to MongoDB
   Database: ktpilot
📦 Loading data from MongoDB...
✅ Loaded X document(s) from MongoDB
✅ Data loading complete
```

## What's Changed

### Data Storage
- **Before**: JSON files (documents.json, users.json, etc.)
- **After**: MongoDB collections (documents, users, messages, contacts, resetcodes)

### Multi-Computer Support
- All computers connect to the same MongoDB database
- Data is automatically synchronized
- No need to manually share files

### Models Created
- `User` - User accounts
- `Document` - Uploaded documents with chunks
- `Message` - Direct messages between users
- `Contact` - User contacts
- `ResetCode` - Password reset codes

## Troubleshooting

### MongoDB Connection Failed
1. Check if MongoDB is running: `mongosh` or `mongo`
2. Verify MONGODB_URI in `.env` file
3. For Atlas: Check IP whitelist and credentials

### Data Not Showing
1. Run migration script if you have existing JSON files
2. Check MongoDB connection logs
3. Verify data exists in MongoDB: `mongosh ktpilot` then `db.documents.find()`

### Port Already in Use
If MongoDB is already running on port 27017, either:
- Stop the existing instance
- Use a different port in MONGODB_URI

## Next Steps

After setup:
1. ✅ MongoDB connection established
2. ✅ Models created
3. ✅ Migration script ready
4. ⏳ Update remaining endpoints (in progress)

The following endpoints have been updated:
- ✅ Document upload
- ✅ Document delete
- ✅ User signup
- ✅ User login
- ✅ Token verification

Remaining endpoints to update:
- Document list/get
- Message operations
- Contact operations
- Reset code operations
- User list operations

