/**
 * Migration script to copy data from local MongoDB to MongoDB Atlas
 * 
 * Usage:
 * 1. Set MONGODB_URI_LOCAL in environment (or uses default localhost)
 * 2. Set MONGODB_URI_ATLAS in environment (your Atlas connection string)
 * 3. Run: node migrate-local-to-atlas.js
 */

const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

// Local MongoDB (source)
const MONGODB_URI_LOCAL = process.env.MONGODB_URI_LOCAL || "mongodb://localhost:27017/ktpilot";

// MongoDB Atlas (destination)
const MONGODB_URI_ATLAS = process.env.MONGODB_URI_ATLAS;

if (!MONGODB_URI_ATLAS) {
    console.error("❌ Error: MONGODB_URI_ATLAS environment variable is required!");
    console.log("");
    console.log("Usage:");
    console.log("  export MONGODB_URI_ATLAS='mongodb+srv://username:password@cluster.mongodb.net/ktpilot?retryWrites=true&w=majority'");
    console.log("  node migrate-local-to-atlas.js");
    console.log("");
    console.log("Or create a .env file with:");
    console.log("  MONGODB_URI_ATLAS=mongodb+srv://username:password@cluster.mongodb.net/ktpilot?retryWrites=true&w=majority");
    process.exit(1);
}

// Import models
const User = require('./models/User');
const Document = require('./models/Document');
const Message = require('./models/Message');
const Contact = require('./models/Contact');
const ResetCode = require('./models/ResetCode');

async function migrate() {
    let localConnection, atlasConnection;
    
    try {
        console.log("🔄 Starting migration from local MongoDB to MongoDB Atlas...\n");
        
        // Connect to local MongoDB (source)
        console.log("📥 Connecting to local MongoDB...");
        localConnection = await mongoose.createConnection(MONGODB_URI_LOCAL, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        }).asPromise();
        console.log("✅ Connected to local MongoDB");
        
        // Connect to MongoDB Atlas (destination)
        console.log("☁️  Connecting to MongoDB Atlas...");
        atlasConnection = await mongoose.createConnection(MONGODB_URI_ATLAS, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        }).asPromise();
        console.log("✅ Connected to MongoDB Atlas\n");
        
        // Get models for both connections
        const LocalUser = localConnection.model('User', User.schema);
        const LocalDocument = localConnection.model('Document', Document.schema);
        const LocalMessage = localConnection.model('Message', Message.schema);
        const LocalContact = localConnection.model('Contact', Contact.schema);
        const LocalResetCode = localConnection.model('ResetCode', ResetCode.schema);
        
        const AtlasUser = atlasConnection.model('User', User.schema);
        const AtlasDocument = atlasConnection.model('Document', Document.schema);
        const AtlasMessage = atlasConnection.model('Message', Message.schema);
        const AtlasContact = atlasConnection.model('Contact', Contact.schema);
        const AtlasResetCode = atlasConnection.model('ResetCode', ResetCode.schema);
        
        let totalMigrated = 0;
        let usersMigrated = 0, documentsMigrated = 0, messagesMigrated = 0, contactsMigrated = 0, resetCodesMigrated = 0;
        
        // Migrate Users
        console.log("👥 Migrating users...");
        const users = await LocalUser.find({});
        let migrated = 0;
        for (const user of users) {
            try {
                const userData = user.toObject();
                delete userData._id;
                const existing = await AtlasUser.findOne({ email: userData.email });
                if (!existing) {
                    await AtlasUser.create(userData);
                    migrated++;
                }
            } catch (error) {
                console.error(`   ⚠️  Error migrating user ${user.email}:`, error.message);
            }
        }
        console.log(`   ✅ Migrated ${migrated} user(s) (${users.length} total in local DB)`);
        usersMigrated = migrated;
        totalMigrated += migrated;
        
        // Migrate Documents
        console.log("📄 Migrating documents...");
        const documents = await LocalDocument.find({});
        migrated = 0;
        for (const doc of documents) {
            try {
                const docData = doc.toObject();
                delete docData._id;
                const existing = await AtlasDocument.findOne({ id: docData.id });
                if (!existing) {
                    await AtlasDocument.create(docData);
                    migrated++;
                }
            } catch (error) {
                console.error(`   ⚠️  Error migrating document ${doc.id}:`, error.message);
            }
        }
        console.log(`   ✅ Migrated ${migrated} document(s) (${documents.length} total in local DB)`);
        documentsMigrated = migrated;
        totalMigrated += migrated;
        
        // Migrate Messages
        console.log("💬 Migrating messages...");
        const messages = await LocalMessage.find({});
        migrated = 0;
        for (const msg of messages) {
            try {
                const msgData = msg.toObject();
                delete msgData._id;
                const existing = await AtlasMessage.findOne({ id: msgData.id });
                if (!existing) {
                    await AtlasMessage.create(msgData);
                    migrated++;
                }
            } catch (error) {
                console.error(`   ⚠️  Error migrating message ${msg.id}:`, error.message);
            }
        }
        console.log(`   ✅ Migrated ${migrated} message(s) (${messages.length} total in local DB)`);
        messagesMigrated = migrated;
        totalMigrated += migrated;
        
        // Migrate Contacts
        console.log("📇 Migrating contacts...");
        const contacts = await LocalContact.find({});
        migrated = 0;
        for (const contact of contacts) {
            try {
                const contactData = contact.toObject();
                delete contactData._id;
                const existing = await AtlasContact.findOne({ 
                    userId: contactData.userId, 
                    contactId: contactData.contactId 
                });
                if (!existing) {
                    await AtlasContact.create(contactData);
                    migrated++;
                }
            } catch (error) {
                console.error(`   ⚠️  Error migrating contact:`, error.message);
            }
        }
        console.log(`   ✅ Migrated ${migrated} contact(s) (${contacts.length} total in local DB)`);
        contactsMigrated = migrated;
        totalMigrated += migrated;
        
        // Migrate Reset Codes
        console.log("🔐 Migrating reset codes...");
        const resetCodes = await LocalResetCode.find({});
        migrated = 0;
        for (const code of resetCodes) {
            try {
                const codeData = code.toObject();
                delete codeData._id;
                const existing = await AtlasResetCode.findOne({ 
                    email: codeData.email, 
                    code: codeData.code 
                });
                if (!existing) {
                    await AtlasResetCode.create(codeData);
                    migrated++;
                }
            } catch (error) {
                console.error(`   ⚠️  Error migrating reset code:`, error.message);
            }
        }
        console.log(`   ✅ Migrated ${migrated} reset code(s) (${resetCodes.length} total in local DB)`);
        resetCodesMigrated = migrated;
        totalMigrated += migrated;
        
        console.log("\n✅ Migration complete!");
        console.log(`   Total items migrated: ${totalMigrated}`);
        console.log("\n📋 Summary:");
        console.log(`   - Users: ${users.length} in local, ${usersMigrated} migrated`);
        console.log(`   - Documents: ${documents.length} in local, ${documentsMigrated} migrated`);
        console.log(`   - Messages: ${messages.length} in local, ${messagesMigrated} migrated`);
        console.log(`   - Contacts: ${contacts.length} in local, ${contactsMigrated} migrated`);
        console.log(`   - Reset Codes: ${resetCodes.length} in local, ${resetCodesMigrated} migrated`);
        console.log("\n✨ Your data is now in MongoDB Atlas!");
        console.log("   You can now use MongoDB Atlas for both local dev and Railway.");
        
        // Close connections
        await localConnection.close();
        await atlasConnection.close();
        process.exit(0);
        
    } catch (error) {
        console.error("❌ Migration error:", error.message);
        if (error.stack) {
            console.error(error.stack);
        }
        
        // Close connections on error
        try {
            if (localConnection) await localConnection.close();
            if (atlasConnection) await atlasConnection.close();
        } catch (closeError) {
            // Ignore close errors
        }
        
        process.exit(1);
    }
}

migrate();

