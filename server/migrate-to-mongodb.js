/**
 * Migration script to move data from JSON files to MongoDB
 * Run this once: node migrate-to-mongodb.js
 */

const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/ktpilot";

// Import models
const User = require('./models/User');
const Document = require('./models/Document');
const Message = require('./models/Message');
const Contact = require('./models/Contact');
const ResetCode = require('./models/ResetCode');

async function migrate() {
    try {
        console.log("🔄 Connecting to MongoDB...");
        await mongoose.connect(MONGODB_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log("✅ Connected to MongoDB");

        // Migrate Documents
        const documentsFile = path.join(__dirname, "documents.json");
        if (fs.existsSync(documentsFile)) {
            console.log("\n📄 Migrating documents...");
            const documents = JSON.parse(fs.readFileSync(documentsFile, "utf8"));
            let migrated = 0;
            for (const doc of documents) {
                try {
                    const existing = await Document.findOne({ id: doc.id });
                    if (!existing) {
                        await Document.create(doc);
                        migrated++;
                    }
                } catch (error) {
                    console.error(`   ⚠️  Error migrating document ${doc.id}:`, error.message);
                }
            }
            console.log(`   ✅ Migrated ${migrated} document(s)`);
        }

        // Migrate Users
        const usersFile = path.join(__dirname, "users.json");
        if (fs.existsSync(usersFile)) {
            console.log("\n👥 Migrating users...");
            const users = JSON.parse(fs.readFileSync(usersFile, "utf8"));
            let migrated = 0;
            for (const user of users) {
                try {
                    const existing = await User.findOne({ id: user.id });
                    if (!existing) {
                        await User.create(user);
                        migrated++;
                    }
                } catch (error) {
                    console.error(`   ⚠️  Error migrating user ${user.id}:`, error.message);
                }
            }
            console.log(`   ✅ Migrated ${migrated} user(s)`);
        }

        // Migrate Messages
        const messagesFile = path.join(__dirname, "messages.json");
        if (fs.existsSync(messagesFile)) {
            console.log("\n💬 Migrating messages...");
            const messages = JSON.parse(fs.readFileSync(messagesFile, "utf8"));
            let migrated = 0;
            for (const msg of messages) {
                try {
                    const existing = await Message.findOne({ id: msg.id });
                    if (!existing) {
                        await Message.create(msg);
                        migrated++;
                    }
                } catch (error) {
                    console.error(`   ⚠️  Error migrating message ${msg.id}:`, error.message);
                }
            }
            console.log(`   ✅ Migrated ${migrated} message(s)`);
        }

        // Migrate Contacts
        const contactsFile = path.join(__dirname, "contacts.json");
        if (fs.existsSync(contactsFile)) {
            console.log("\n📇 Migrating contacts...");
            const contacts = JSON.parse(fs.readFileSync(contactsFile, "utf8"));
            let migrated = 0;
            for (const [userId, contactIds] of Object.entries(contacts)) {
                for (const contactId of contactIds) {
                    try {
                        const existing = await Contact.findOne({ userId, contactId });
                        if (!existing) {
                            await Contact.create({ userId, contactId });
                            migrated++;
                        }
                    } catch (error) {
                        console.error(`   ⚠️  Error migrating contact:`, error.message);
                    }
                }
            }
            console.log(`   ✅ Migrated ${migrated} contact(s)`);
        }

        // Migrate Reset Codes
        const resetCodesFile = path.join(__dirname, "resetCodes.json");
        if (fs.existsSync(resetCodesFile)) {
            console.log("\n🔐 Migrating reset codes...");
            const resetCodes = JSON.parse(fs.readFileSync(resetCodesFile, "utf8"));
            let migrated = 0;
            for (const code of resetCodes) {
                try {
                    const existing = await ResetCode.findOne({ email: code.email, code: code.code });
                    if (!existing) {
                        await ResetCode.create(code);
                        migrated++;
                    }
                } catch (error) {
                    console.error(`   ⚠️  Error migrating reset code:`, error.message);
                }
            }
            console.log(`   ✅ Migrated ${migrated} reset code(s)`);
        }

        console.log("\n✅ Migration complete!");
        console.log("   You can now delete the JSON files if you want:");
        console.log("   - documents.json");
        console.log("   - users.json");
        console.log("   - messages.json");
        console.log("   - contacts.json");
        console.log("   - resetCodes.json");

        await mongoose.connection.close();
        process.exit(0);
    } catch (error) {
        console.error("❌ Migration error:", error);
        process.exit(1);
    }
}

migrate();

