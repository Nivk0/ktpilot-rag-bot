const express = require("express");
const cors = require("cors");
const multer = require("multer");
const dotenv = require("dotenv");
const fs = require("fs");
const path = require("path");
const pdf = require("pdf-parse");
const mammoth = require("mammoth");
const cheerio = require("cheerio");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const { GoogleGenerativeAI } = require("@google/generative-ai");
const mongoose = require("mongoose");

// Import MongoDB models
const User = require("./models/User");
const Document = require("./models/Document");
const Message = require("./models/Message");
const Contact = require("./models/Contact");
const ResetCode = require("./models/ResetCode");

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key-change-in-production";

// MongoDB Connection
const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/ktpilot";

mongoose.connect(MONGODB_URI)
.then(() => {
    console.log("✅ Connected to MongoDB Atlas");
    const dbName = MONGODB_URI.includes('@') 
        ? MONGODB_URI.split('@')[1].split('/')[1].split('?')[0] 
        : MONGODB_URI.split('/').pop().split('?')[0];
    console.log(`   Database: ${dbName || 'ktpilot'}`);
    console.log("   All data will be shared across all computers connected to this database");
})
.catch((error) => {
    console.error("❌ MongoDB connection error:", error.message);
    console.log("⚠️  Server will continue but database operations may fail");
    console.log("   Please check your MONGODB_URI in .env file");
    console.log("   Make sure your IP is whitelisted in MongoDB Atlas");
});

// Initialize Google Gemini AI
// Load API key from .env file
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
let genAI = null;
let geminiModel = null;

if (GEMINI_API_KEY && GEMINI_API_KEY !== "your-gemini-api-key-here") {
    try {
        genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
        // Use gemini-2.5-flash model (fast and efficient)
        geminiModel = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
        console.log("✅ Gemini AI initialized successfully (using gemini-2.5-flash model)");
        console.log("   API Key loaded from .env file");
    } catch (error) {
        console.error("❌ Failed to initialize Gemini AI:", error.message);
        console.log("⚠️  Falling back to rule-based responses");
    }
} else {
    console.log("⚠️  GEMINI_API_KEY not set, using rule-based responses");
}

const app = express();
const PORT = process.env.PORT || 5050;

// CORS configuration for production
const corsOptions = {
    origin: process.env.FRONTEND_URL || process.env.CORS_ORIGIN || "http://localhost:5173",
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
};
app.use(cors(corsOptions));
app.use(express.json());

const uploadsDir = path.join(__dirname, "uploads");
const documentsDir = path.join(__dirname, "documents");
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir);
if (!fs.existsSync(documentsDir)) fs.mkdirSync(documentsDir);

// File paths are no longer needed - using MongoDB instead
// Keeping for backward compatibility if needed

// RAG Model: Chunk documents for better retrieval (defined early for use in document loading)
function chunkDocument(content, docId, title) {
  const chunks = [];
  const chunkSize = 500; // Characters per chunk
  const overlap = 100; // Overlap between chunks for context preservation
  
  // Split by paragraphs first (better semantic boundaries)
  const paragraphs = content.split(/\n\s*\n/).filter(p => p.trim().length > 0);
  
  let currentChunk = "";
  let chunkIndex = 0;
  
  paragraphs.forEach((paragraph) => {
    const paraTrimmed = paragraph.trim();
    
    // If paragraph fits in current chunk, add it
    if (currentChunk.length + paraTrimmed.length < chunkSize) {
      currentChunk += (currentChunk ? "\n\n" : "") + paraTrimmed;
    } else {
      // Save current chunk if it has content
      if (currentChunk.trim().length > 0) {
        chunks.push({
          id: `${docId}_chunk_${chunkIndex}`,
          docId: docId,
          docTitle: title,
          content: currentChunk.trim(),
          chunkIndex: chunkIndex++,
        });
      }
      
      // Start new chunk with overlap from previous
      const overlapText = currentChunk.slice(-overlap);
      currentChunk = overlapText + "\n\n" + paraTrimmed;
    }
  });
  
  // Add final chunk
  if (currentChunk.trim().length > 0) {
    chunks.push({
      id: `${docId}_chunk_${chunkIndex}`,
      docId: docId,
      docTitle: title,
      content: currentChunk.trim(),
      chunkIndex: chunkIndex,
    });
  }
  
  // If no paragraphs found, split by sentences
  if (chunks.length === 0) {
    const sentences = content.match(/[^.!?]+[.!?]+/g) || [content];
    let sentenceChunk = "";
    
    sentences.forEach((sentence) => {
      if (sentenceChunk.length + sentence.length < chunkSize) {
        sentenceChunk += sentence;
      } else {
        if (sentenceChunk.trim().length > 0) {
          chunks.push({
            id: `${docId}_chunk_${chunkIndex}`,
            docId: docId,
            docTitle: title,
            content: sentenceChunk.trim(),
            chunkIndex: chunkIndex++,
          });
        }
        sentenceChunk = sentence;
      }
    });
    
    if (sentenceChunk.trim().length > 0) {
      chunks.push({
        id: `${docId}_chunk_${chunkIndex}`,
        docId: docId,
        docTitle: title,
        content: sentenceChunk.trim(),
        chunkIndex: chunkIndex,
      });
    }
  }
  
  return chunks;
}

// MongoDB Helper Functions
// Load documents from MongoDB
async function loadDocuments() {
  try {
    const docs = await Document.find({});
    console.log(`✅ Loaded ${docs.length} document(s) from MongoDB`);
    
    let validDocs = 0;
    let totalChunks = 0;
    let needsSaving = false;
    
    for (const doc of docs) {
      if (!doc.content || doc.content.trim().length === 0) {
        console.warn(`⚠️  Document "${doc.title || doc.filename || 'Unknown'}" has no content`);
      } else {
        validDocs++;
        // RAG: Ensure documents are chunked
        if (!doc.chunks || doc.chunks.length === 0) {
          console.log(`🔪 Chunking existing document: "${doc.title}"`);
          doc.chunks = chunkDocument(doc.content, doc.id, doc.title);
          await doc.save();
          needsSaving = true;
        }
        totalChunks += doc.chunks ? doc.chunks.length : 0;
      }
    }
    
    console.log(`📄 ${validDocs} document(s) have searchable content`);
    console.log(`🔪 RAG: ${totalChunks} total chunks available for retrieval`);
    
    if (needsSaving) {
      console.log(`💾 Saved documents with RAG chunks to MongoDB`);
    }
    
    return docs;
  } catch (error) {
    console.error("❌ Error loading documents from MongoDB:", error.message);
    return [];
  }
}

// Initialize data on startup
let documents = [];
let isDataLoaded = false;

// Load all data when MongoDB is connected
mongoose.connection.once('open', async () => {
  console.log("📦 Loading data from MongoDB...");
  documents = await loadDocuments();
  isDataLoaded = true;
  console.log("✅ Data loading complete");
  console.log("🌐 Database is ready - all computers can now share data!");
});

// Also handle reconnection
mongoose.connection.on('connected', () => {
  console.log("✅ MongoDB connected");
});

mongoose.connection.on('error', (err) => {
  console.error("❌ MongoDB connection error:", err);
});

mongoose.connection.on('disconnected', () => {
  console.log("⚠️  MongoDB disconnected");
});

// Generate a random reset code
function generateResetCode() {
  return Math.floor(100000 + Math.random() * 900000).toString(); // 6-digit code
}

// Authentication middleware
function authenticateToken(req, res, next) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({ error: "Access token required" });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: "Invalid or expired token" });
    }
    req.user = user;
    next();
  });
}

// Middleware to check if user is an executive
async function isExecutive(req, res, next) {
  if (!req.user) {
    return res.status(401).json({ error: "Authentication required" });
  }
  
  // Check if user has executive role in token
  if (req.user.role === "executive") {
    return next();
  }
  
  // Check in MongoDB for executive role
  try {
    const user = await User.findOne({ id: req.user.id });
    if (user && user.role === "executive") {
      req.user.role = "executive";
      return next();
    }
  } catch (error) {
    console.error("Error checking executive role:", error);
  }
  
  return res.status(403).json({ error: "Executive access required" });
}

const upload = multer({ dest: uploadsDir });

// Extract text from different file types
async function extractText(filePath, mimetype) {
  const ext = path.extname(filePath).toLowerCase();
  
  if (mimetype === "application/pdf" || ext === ".pdf") {
    const dataBuffer = fs.readFileSync(filePath);
    const data = await pdf(dataBuffer);
    return data.text;
  } else if (
    mimetype === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
    ext === ".docx"
  ) {
    const result = await mammoth.extractRawText({ path: filePath });
    return result.value;
  } else if (mimetype === "text/plain" || ext === ".txt") {
    return fs.readFileSync(filePath, "utf8");
  } else if (mimetype === "text/html" || ext === ".html") {
    const html = fs.readFileSync(filePath, "utf8");
    const $ = cheerio.load(html);
    return $("body").text();
  } else {
    // Try to read as text
    try {
      return fs.readFileSync(filePath, "utf8");
    } catch (e) {
      throw new Error("Unsupported file type");
    }
  }
}

// RAG Model: Enhanced semantic search with chunk-based retrieval
function searchDocuments(query) {
  const queryLower = query.toLowerCase().trim();
  const results = [];
  
  // Early return if no documents
  if (!documents || documents.length === 0) {
    return results;
  }
  
  // Extract important words (remove common stop words)
  const stopWords = new Set(['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'is', 'are', 'was', 'were', 'be', 'been', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'should', 'could', 'may', 'might', 'must', 'can', 'this', 'that', 'these', 'those', 'i', 'you', 'he', 'she', 'it', 'we', 'they']);
  const queryWords = queryLower.split(/\s+/).filter(word => word.length > 2 && !stopWords.has(word));
  
  // If no meaningful words, use all words
  const searchTerms = queryWords.length > 0 ? queryWords : queryLower.split(/\s+/).filter(w => w.length > 0);
  
  // RAG: Search through document chunks
  documents.forEach((doc) => {
    // Skip documents without content
    if (!doc.content || typeof doc.content !== 'string' || doc.content.trim().length === 0) {
      return;
    }
    
    // Create chunks if not already chunked
    if (!doc.chunks || doc.chunks.length === 0) {
      doc.chunks = chunkDocument(doc.content, doc.id, doc.title);
      // Save updated document with chunks
      saveDocuments();
    }
    
    const titleLower = (doc.title || "").toLowerCase();
    const filenameLower = (doc.filename || "").toLowerCase();
    
    // Search through chunks
    doc.chunks.forEach((chunk) => {
      const chunkContentLower = chunk.content.toLowerCase();
      let score = 0;
      
      // Exact phrase match (highest priority)
      if (chunkContentLower.includes(queryLower)) {
        const exactMatches = (chunkContentLower.match(new RegExp(queryLower.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), "g")) || []).length;
        score += exactMatches * 100; // Very high weight for exact phrase in chunk
      }
      
      // Title matches boost
      if (titleLower.includes(queryLower)) {
        score += 50; // Boost for title match
      }
      
      // Filename matches
      if (filenameLower.includes(queryLower)) {
        score += 30;
      }
      
      // Word-level matching in chunk
      let chunkWordMatches = 0;
      searchTerms.forEach((word) => {
        const wordRegex = new RegExp(`\\b${word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, "gi");
        const matches = (chunkContentLower.match(wordRegex) || []).length;
        chunkWordMatches += matches;
        score += matches * 5; // Higher weight per match in smaller chunks
      });
      
      // Bonus for multiple terms matching in same chunk
      if (searchTerms.length > 1) {
        const matchedTerms = searchTerms.filter(term => chunkContentLower.includes(term)).length;
        score += (matchedTerms / searchTerms.length) * 40; // Higher bonus for chunk matches
      }
      
      // Proximity bonus: if multiple query terms appear close together
      if (searchTerms.length > 1) {
        const firstTermPos = chunkContentLower.indexOf(searchTerms[0]);
        if (firstTermPos !== -1) {
          let nearbyTerms = 0;
          searchTerms.slice(1).forEach(term => {
            const termPos = chunkContentLower.indexOf(term);
            if (termPos !== -1 && Math.abs(termPos - firstTermPos) < 200) {
              nearbyTerms++;
            }
          });
          score += nearbyTerms * 20; // Bonus for terms appearing close together
        }
      }
      
      // Balanced: Only include chunks with meaningful relevance
      // Require score > 8 to filter out completely irrelevant chunks, but allow more relevant content
      if (score > 8) {
        results.push({
          id: chunk.id,
          docId: doc.id,
          title: doc.title,
          filename: doc.filename,
          uploadedAt: doc.uploadedAt,
          score,
          chunk: chunk.content,
          chunkIndex: chunk.chunkIndex,
          contentLength: chunk.content.length,
        });
      }
    });
  });
  
  // Sort by relevance score
  results.sort((a, b) => b.score - a.score);
  
  // Return top chunks for answer generation
  // Retrieve top 12 most relevant chunks - we'll process 5-6 for balanced answers
  const topK = 12;
  return results.slice(0, topK);
}

// RAG: Extract relevant chunks for answer generation (ensures diversity across relevant documents only)
function extractRelevantChunks(chunkResults, maxChunks = 5) {
  // Group chunks by document to ensure diversity
  const chunksByDoc = {};
  chunkResults.forEach(result => {
    if (!chunksByDoc[result.docId]) {
      chunksByDoc[result.docId] = [];
    }
    chunksByDoc[result.docId].push(result);
  });
  
  const numDocs = Object.keys(chunksByDoc).length;
  
  // Select top chunks, prioritizing high-scoring chunks from relevant documents
  const selectedChunks = [];
  
  // Strategy: Get top chunks from each document, prioritizing highest scores
  // This ensures information comes from all relevant documents, not just one
  
  // First pass: Get top chunk from each document (ensures all relevant documents are represented)
  Object.values(chunksByDoc).forEach(docChunks => {
    docChunks.sort((a, b) => b.score - a.score);
    if (docChunks.length > 0 && docChunks[0].score > 8) { // Only include if score is high enough
      selectedChunks.push(docChunks[0]);
    }
  });
  
  // Second pass: Add more high-scoring chunks from each document
  const remainingSlots = maxChunks - selectedChunks.length;
  if (remainingSlots > 0 && numDocs > 0) {
    const maxPerDoc = Math.max(2, Math.ceil(remainingSlots / numDocs) + 1);
    
    Object.values(chunksByDoc).forEach(docChunks => {
      docChunks.sort((a, b) => b.score - a.score);
      // Add additional high-scoring chunks from this document
      const additional = docChunks.slice(1, maxPerDoc).filter(c => c.score > 8);
      selectedChunks.push(...additional);
    });
  }
  
  // Sort all selected chunks by score (highest first) and return top maxChunks
  selectedChunks.sort((a, b) => b.score - a.score);
  return selectedChunks.slice(0, maxChunks);
}

app.get("/", (req, res) => {
    res.send("✅ KTPilot backend is running!");
});

// Authentication Routes

// Sign up
app.post("/api/auth/signup", async (req, res) => {
    try {
        let { email, password, name } = req.body;

        if (!email || !password) {
            return res.status(400).json({ error: "Email and password are required" });
        }

        // Normalize email to lowercase and trim
        email = email.toLowerCase().trim();

        // Check if user already exists in MongoDB
        const existingUser = await User.findOne({ email: email });
        if (existingUser) {
            return res.status(400).json({ error: "User with this email already exists" });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create user in MongoDB
        const user = new User({
            id: Date.now().toString(),
            email: email,
            name: name || email.split("@")[0],
            password: hashedPassword,
            role: "user", // Default role, can be changed to "executive" manually
        });

        await user.save();

        // Generate JWT token
        const token = jwt.sign(
            { id: user.id, email: user.email, name: user.name, role: user.role },
            JWT_SECRET,
            { expiresIn: "7d" }
        );

        console.log(`✅ New user registered: ${user.email}`);

        res.status(201).json({
            message: "User created successfully",
            token,
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                role: user.role,
            },
        });
    } catch (error) {
        console.error("Signup error:", error);
        res.status(500).json({ 
            error: error.message || "Failed to create user",
            details: process.env.NODE_ENV === "development" ? error.stack : undefined
        });
    }
});

// Login
app.post("/api/auth/login", async (req, res) => {
    try {
        let { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ error: "Email and password are required" });
        }

        // Normalize email to lowercase and trim
        email = email.toLowerCase().trim();

        // Find user in MongoDB
        const user = await User.findOne({ email: email });
        if (!user) {
            return res.status(404).json({ 
                error: "Account not found",
                message: "You don't have an account. Please create an account to continue.",
                code: "USER_NOT_FOUND"
            });
        }

        // Check password
        const validPassword = await bcrypt.compare(password, user.password);
        if (!validPassword) {
            return res.status(401).json({ error: "Invalid password" });
        }

        // Generate JWT token
        const token = jwt.sign(
            { id: user.id, email: user.email, name: user.name, role: user.role || "user" },
            JWT_SECRET,
            { expiresIn: "7d" }
        );

        console.log(`✅ User logged in: ${user.email}`);

        res.json({
            message: "Login successful",
            token,
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                role: user.role || "user",
            },
        });
    } catch (error) {
        console.error("Login error:", error);
        res.status(500).json({ error: "Failed to login" });
    }
});

// Verify token
app.get("/api/auth/verify", authenticateToken, async (req, res) => {
    try {
        // Get full user data including role from MongoDB
        const user = await User.findOne({ id: req.user.id });
        const userRole = user ? (user.role || "user") : (req.user.role || "user");
        
        res.json({
            valid: true,
            user: {
                id: req.user.id,
                email: req.user.email,
                name: req.user.name,
                role: userRole,
            },
        });
    } catch (error) {
        console.error("Error verifying token:", error);
        res.status(500).json({ error: "Failed to verify token" });
    }
});

// Email configuration (for password reset)
const createEmailTransporter = () => {
    // If email is configured, use it. Otherwise, return null
    if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
        try {
            return nodemailer.createTransport({
                host: process.env.SMTP_HOST,
                port: parseInt(process.env.SMTP_PORT) || 587,
                secure: process.env.SMTP_SECURE === "true",
                auth: {
                    user: process.env.SMTP_USER?.trim(),
                    pass: process.env.SMTP_PASS?.trim().replace(/\s/g, ''), // Remove spaces (Gmail app passwords)
                },
                // Add timeout and connection options
                connectionTimeout: 10000,
                greetingTimeout: 10000,
            });
        } catch (error) {
            console.error("Failed to create email transporter:", error);
            return null;
        }
    }
    return null;
};

// Send reset code via email
async function sendResetCodeEmail(email, code) {
    const transporter = createEmailTransporter();
    
    if (!transporter) {
        console.error("❌ Email not configured!");
        console.error("   Quick setup: See QUICK_EMAIL_SETUP.md for step-by-step instructions");
        console.error("   1. Create .env file in server/ directory");
        console.error("   2. Configure SMTP settings (Gmail recommended)");
        console.error("   3. Restart the server");
        throw new Error("Email service not configured. Please set up SMTP in server/.env file (see QUICK_EMAIL_SETUP.md).");
    }

    try {
        // Verify connection first
        await transporter.verify();
        console.log("✅ SMTP connection verified");

        const mailOptions = {
            from: process.env.SMTP_FROM || process.env.SMTP_USER,
            to: email,
            subject: "KTPilot Password Reset Code",
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #ffffff; color: #000000;">
                    <div style="border-bottom: 2px solid #000000; padding-bottom: 10px; margin-bottom: 20px;">
                        <h2 style="color: #000000; margin: 0; font-size: 24px;">KTPilot Password Reset</h2>
                    </div>
                    <p style="color: #000000; font-size: 16px; line-height: 1.6;">You requested to reset your password for your KTPilot account.</p>
                    <p style="color: #000000; font-size: 16px; line-height: 1.6;">Your reset code is:</p>
                    <div style="background-color: #f5f5f5; border: 2px solid #000000; padding: 20px; text-align: center; font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #000000; margin: 20px 0; border-radius: 8px; font-family: monospace;">
                        ${code}
                    </div>
                    <p style="color: #000000; font-size: 14px; font-weight: bold;">⚠️ This code will expire in 30 minutes.</p>
                    <p style="color: #666666; font-size: 14px; line-height: 1.6;">If you didn't request this password reset, please ignore this email. Your password will not be changed.</p>
                    <hr style="border: none; border-top: 1px solid #cccccc; margin: 30px 0;">
                    <p style="color: #666666; font-size: 12px; margin: 0;">This is an automated message from KTPilot. Please do not reply to this email.</p>
                </div>
            `,
            text: `KTPilot Password Reset

You requested to reset your password for your KTPilot account.

Your reset code is: ${code}

This code will expire in 30 minutes.

If you didn't request this password reset, please ignore this email.

---
This is an automated message from KTPilot.`,
        };

        const info = await transporter.sendMail(mailOptions);
        console.log(`✅ Password reset email sent to ${email}`);
        console.log(`   Message ID: ${info.messageId}`);
        return { sent: true };
    } catch (error) {
        console.error("❌ Email send error details:", {
            message: error.message,
            code: error.code,
            command: error.command,
            response: error.response,
        });
        
        // Provide specific error messages matching QUICK_EMAIL_SETUP.md troubleshooting
        let errorMessage = "Failed to send email. ";
        if (error.code === "EAUTH") {
            errorMessage += "Email authentication failed. ";
            errorMessage += "For Gmail: Make sure you're using an App Password (not your regular password). ";
            errorMessage += "See QUICK_EMAIL_SETUP.md for instructions.";
        } else if (error.code === "ECONNECTION") {
            errorMessage += "Could not connect to email server. ";
            errorMessage += "Check SMTP_HOST and SMTP_PORT in your .env file. ";
            errorMessage += "Make sure you restarted the server after creating/updating .env.";
        } else if (error.response) {
            errorMessage += `Server error: ${error.response}. `;
            errorMessage += "Check backend console for details. Verify all SMTP variables are set correctly.";
        } else {
            errorMessage += error.message || "Please check your email configuration. ";
            errorMessage += "See QUICK_EMAIL_SETUP.md for troubleshooting tips.";
        }
        
        console.error("   Troubleshooting:");
        console.error("   - Verify .env file is in server/ directory");
        console.error("   - Make sure you restarted the server after creating .env");
        console.error("   - For Gmail: Use App Password, NOT your regular password");
        console.error("   - Check that all SMTP variables are set correctly");
        console.error("   - See QUICK_EMAIL_SETUP.md for detailed instructions");
        
        throw new Error(errorMessage);
    }
}

// Password Reset Routes

// Request reset code (user requests it themselves)
app.post("/api/auth/request-reset-code", async (req, res) => {
    try {
        let { email } = req.body;
        
        if (!email) {
            return res.status(400).json({ error: "Email is required" });
        }

        // Normalize email to lowercase and trim
        email = email.toLowerCase().trim();

        // Find user in MongoDB
        const user = await User.findOne({ email: email });
        if (!user) {
            // Don't reveal if user exists or not for security
            // But still return a generic message
            return res.json({
                message: "If an account exists with this email, a reset code has been sent.",
                expiresIn: "30 minutes",
            });
        }

        // Generate reset code
        const code = generateResetCode();
        const expiresAt = new Date(Date.now() + 30 * 60 * 1000); // 30 minutes

        // Remove any existing codes for this email from MongoDB
        await ResetCode.deleteMany({ email: email });

        // Add new reset code to MongoDB
        await ResetCode.create({
            email: email,
            code: code,
            expiresAt: expiresAt,
        });

        console.log(`🔑 Reset code generated for ${email}: ${code}`);

        // Check if email is configured before trying to send
        const transporter = createEmailTransporter();
        const isEmailConfigured = !!transporter;
        
        // Try to send email if configured
        let emailSent = false;
        if (isEmailConfigured) {
            try {
                await sendResetCodeEmail(email, code);
                console.log(`✅ Password reset email sent to ${email}`);
                emailSent = true;
            } catch (emailError) {
                console.error("❌ Email sending failed:", emailError.message);
                // Even if sending fails, don't show code if email is configured
                // User should check email or contact support
                return res.status(500).json({
                    error: "Failed to send email. Please try again later or contact support.",
                    message: "We encountered an issue sending the reset code to your email. Please try again in a few moments.",
                });
            }
        }

        // Return response based on email configuration
        if (emailSent) {
            // Email sent successfully - don't return code for security (user should check email)
            res.json({
                message: "Reset code has been sent to your email address. Please check your inbox (and spam folder) for the 6-digit code.",
                expiresIn: "30 minutes",
                emailSent: true,
            });
        } else if (!isEmailConfigured) {
            // Email not configured - return code in response as fallback (development only)
            console.log(`⚠️ Email service not configured. Code displayed as fallback: ${code}`);
            res.json({
                message: "Reset code generated. Email service is not configured, so your code is shown below. Please configure SMTP settings to receive codes via email (see QUICK_EMAIL_SETUP.md).",
                code: code,
                expiresIn: "30 minutes",
                emailSent: false,
            });
        } else {
            // Should not reach here, but just in case
            res.status(500).json({
                error: "Unable to send reset code. Please try again later.",
            });
        }
    } catch (error) {
        console.error("Request reset code error:", error);
        res.status(500).json({ error: error.message || "Failed to request reset code" });
    }
});

// Verify reset code and reset password
app.post("/api/auth/reset-password", async (req, res) => {
    try {
        let { email, code, newPassword } = req.body;

        if (!email || !code || !newPassword) {
            return res.status(400).json({ error: "Email, code, and new password are required" });
        }

        // Normalize email to lowercase and trim
        email = email.toLowerCase().trim();
        code = code.toString().trim();

        if (code.length !== 6) {
            return res.status(400).json({ error: "Reset code must be 6 digits" });
        }

        if (newPassword.length < 6) {
            return res.status(400).json({ error: "Password must be at least 6 characters" });
        }

        // Find reset code in MongoDB
        const resetCode = await ResetCode.findOne({
            email: email,
            code: code
        });

        if (!resetCode) {
            console.log(`❌ Invalid reset code attempt for ${email} with code ${code}`);
            // Check if there are any codes for this email to give better error message
            const codesForEmail = await ResetCode.find({ email: email });
            if (codesForEmail.length > 0) {
                return res.status(400).json({ error: "Invalid reset code. Please check the code and try again." });
            }
            return res.status(400).json({ error: "Invalid reset code. Please request a new code." });
        }

        // Check if code is expired
        const now = new Date();
        if (resetCode.expiresAt < now) {
            // Remove expired code
            await ResetCode.deleteOne({ _id: resetCode._id });
            console.log(`❌ Expired reset code used for ${email}`);
            return res.status(400).json({ error: "Reset code has expired. Please request a new code." });
        }

        // Find user in MongoDB
        const user = await User.findOne({ email: email });
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        // Hash new password
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        // Update user password in MongoDB
        user.password = hashedPassword;
        await user.save();

        // Remove used reset code
        await ResetCode.deleteOne({ _id: resetCode._id });

        console.log(`✅ Password reset successful for ${email}`);

        res.json({
            message: "Password reset successfully! You can now login with your new password.",
        });
    } catch (error) {
        console.error("Reset password error:", error);
        res.status(500).json({ error: error.message || "Failed to reset password. Please try again." });
    }
});

// Executive Routes - Generate reset code for any user
app.post("/api/auth/executive/generate-reset-code", authenticateToken, isExecutive, async (req, res) => {
    try {
        let { email } = req.body;
        
        if (!email) {
            return res.status(400).json({ error: "Email is required" });
        }

        // Normalize email to lowercase and trim
        email = email.toLowerCase().trim();

        // Find user in MongoDB
        const user = await User.findOne({ email: email });
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        // Generate reset code
        const code = generateResetCode();
        const expiresAt = new Date(Date.now() + 30 * 60 * 1000); // 30 minutes

        // Remove any existing codes for this email from MongoDB
        await ResetCode.deleteMany({ email: email });

        // Add new reset code to MongoDB
        await ResetCode.create({
            email: email,
            code: code,
            expiresAt: expiresAt,
            generatedBy: req.user.email, // Track which executive generated it
        });

        console.log(`🔑 Executive ${req.user.email} generated reset code for ${email}`);

        res.json({
            message: "Reset code generated successfully",
            code: code,
            email: email,
            userName: user.name,
            expiresIn: "30 minutes",
            expiresAt: expiresAt.toISOString(),
        });
    } catch (error) {
        console.error("Executive generate reset code error:", error);
        res.status(500).json({ error: error.message || "Failed to generate reset code" });
    }
});

// Executive Routes - List all users (for executives to see who needs help)
app.get("/api/auth/executive/users", authenticateToken, isExecutive, async (req, res) => {
    try {
        const userList = users.map((u) => ({
            id: u.id,
            email: u.email,
            name: u.name,
            role: u.role || "user",
            createdAt: u.createdAt,
        }));

        res.json({
            users: userList,
            count: userList.length,
        });
    } catch (error) {
        console.error("Executive list users error:", error);
        res.status(500).json({ error: "Failed to list users" });
    }
});

// Protected Routes - require authentication

// Upload and process document
app.post("/api/upload", authenticateToken, upload.single("file"), async (req, res) => {
    if (!req.file) return res.status(400).json({ error: "No file uploaded" });
    
    try {
        console.log("📄 Processing file:", req.file.originalname);
        
        // Extract text from file
        const content = await extractText(req.file.path, req.file.mimetype);
        
        if (!content || content.trim().length === 0) {
            if (fs.existsSync(req.file.path)) {
                fs.unlinkSync(req.file.path);
            }
            return res.status(400).json({ error: "Could not extract text from file. The file may be empty, corrupted, or in an unsupported format." });
        }
        
        // Create document entry
        const doc = {
            id: Date.now().toString(),
            title: req.file.originalname,
            filename: req.file.originalname,
            content: content.trim(), // Ensure content is trimmed and stored properly
            uploadedAt: new Date().toISOString(),
            filePath: req.file.path,
            chunks: [], // RAG: Will be populated with chunks
        };
        
        // Validate content before saving
        if (!doc.content || doc.content.length === 0) {
            if (fs.existsSync(req.file.path)) {
                fs.unlinkSync(req.file.path);
            }
            return res.status(400).json({ error: "Document appears to be empty after processing" });
        }
        
        // RAG: Chunk the document for better retrieval
        console.log("🔪 Chunking document for RAG retrieval...");
        const chunks = chunkDocument(doc.content, doc.id, doc.title);
        console.log(`✅ Created ${chunks.length} chunks from document`);
        
        // Move file to documents directory
        const destPath = path.join(documentsDir, `${doc.id}_${req.file.originalname}`);
        if (fs.existsSync(req.file.path)) {
            try {
                fs.renameSync(req.file.path, destPath);
                doc.filePath = destPath;
            } catch (err) {
                console.warn(`⚠️  Could not move file to documents directory: ${err.message}`);
            }
        }
        
        // Save to MongoDB
        const document = new Document({
            id: doc.id,
            title: doc.title,
            filename: doc.filename,
            content: doc.content,
            uploadedAt: doc.uploadedAt,
            filePath: doc.filePath,
            chunks: chunks
        });
        
        await document.save();
        
        // Update in-memory cache
        documents.push(document.toObject());
        
        const wordCount = doc.content.split(/\s+/).length;
        console.log(`✅ Document processed and saved to MongoDB: ${doc.title}`);
        console.log(`   Content: ${content.length} chars, ${wordCount} words`);
        console.log(`📚 Total documents now: ${documents.length}`);
        
        res.json({
            message: `File '${req.file.originalname}' uploaded and processed successfully. Extracted ${content.length} characters (${wordCount} words).`,
            document: {
                id: doc.id,
                title: doc.title,
                uploadedAt: doc.uploadedAt,
                contentLength: content.length,
                wordCount: wordCount,
            },
        });
    } catch (error) {
        console.error("Error processing file:", error);
        if (fs.existsSync(req.file.path)) {
            fs.unlinkSync(req.file.path);
        }
        res.status(500).json({ error: error.message || "Failed to process file" });
    }
});

// List all documents
app.get("/api/documents", authenticateToken, async (req, res) => {
    try {
        // Get from MongoDB to ensure latest data
        const docs = await Document.find({}).select('id title filename uploadedAt content');
        const docList = docs.map((doc) => ({
            id: doc.id,
            title: doc.title,
            filename: doc.filename,
            uploadedAt: doc.uploadedAt,
            contentLength: doc.content ? doc.content.length : 0,
        }));
        // Update in-memory cache
        documents = docs.map(d => d.toObject());
        res.json({ documents: docList });
    } catch (error) {
        console.error("Error listing documents:", error);
        res.status(500).json({ error: "Failed to list documents" });
    }
});

// Get a specific document
app.get("/api/documents/:id", authenticateToken, async (req, res) => {
    try {
        const doc = await Document.findOne({ id: req.params.id });
        if (!doc) return res.status(404).json({ error: "Document not found" });
        
        res.json({
            id: doc.id,
            title: doc.title,
            filename: doc.filename,
            content: doc.content,
            uploadedAt: doc.uploadedAt,
        });
    } catch (error) {
        console.error("Error getting document:", error);
        res.status(500).json({ error: "Failed to get document" });
    }
});

// Search documents
app.post("/api/search", authenticateToken, async (req, res) => {
    try {
        const { query } = req.body || {};
        if (!query) return res.status(400).json({ error: "Query required" });
        
        // Refresh documents from MongoDB to ensure we have latest data
        const docs = await Document.find({});
        documents = docs.map(d => d.toObject());
        
        console.log("🔍 Searching for:", query);
        const results = searchDocuments(query);
        res.json({ results, query });
    } catch (error) {
        console.error("Error searching documents:", error);
        res.status(500).json({ error: "Failed to search documents" });
    }
});

// Generate general knowledge answer for any question
function generateGeneralAnswer(query) {
    const queryLower = query.toLowerCase().trim();
    const questionType = detectQuestionType(query);
    
    // Math calculations - check if query looks like a math expression
    // Handle patterns like "2+2", "what is 2+2", "calculate 10*5", etc.
    let mathExpression = query;
    
    // Extract math from "what is X" or "calculate X" patterns
    const whatIsMatch = queryLower.match(/(?:what is|calculate|compute|solve|evaluate)\s+(.+)/i);
    if (whatIsMatch) {
        mathExpression = whatIsMatch[1].trim();
    }
    
    const mathPattern = /^[\d\+\-\*\/\(\)\.\s]+$/;
    const cleanQuery = mathExpression.replace(/\s/g, '');
    if (mathPattern.test(cleanQuery) && cleanQuery.length > 0) {
        try {
            // Only allow numbers, operators, and parentheses
            const sanitized = cleanQuery.replace(/[^0-9+\-*/().]/g, '');
            if (sanitized.length > 0 && sanitized.length < 100) { // Limit length for safety
                // Use eval in a safe way for simple math
                const result = eval(sanitized);
                if (typeof result === 'number' && !isNaN(result) && isFinite(result)) {
                    return `${result}`;
                }
            }
        } catch (e) {
            // Not a valid math expression, continue to other handlers
        }
    }
    
    // Greetings and conversational - direct responses
    if (/^(hi|hello|hey|greetings|good morning|good afternoon|good evening)/i.test(queryLower)) {
        return "Hello! How can I help you?";
    }
    
    if (/^(how are you|how's it going|what's up)/i.test(queryLower)) {
        return "I'm doing well. How can I help you?";
    }
    
    if (/^(thanks|thank you|thx)/i.test(queryLower)) {
        return "You're welcome.";
    }
    
    // What questions - definitions and explanations
    if (questionType === 'what') {
        const whatMatch = queryLower.match(/what (is|are|was|were) (.+)/i);
        if (whatMatch) {
            const topic = whatMatch[2].trim();
            return generateWhatAnswer(topic, query);
        }
    }
    
    // Who questions
    if (questionType === 'who') {
        const whoMatch = queryLower.match(/who (is|are|was|were) (.+)/i);
        if (whoMatch) {
            const topic = whoMatch[2].trim();
            return generateWhoAnswer(topic, query);
        }
    }
    
    // When questions
    if (questionType === 'when') {
        return generateWhenAnswer(query);
    }
    
    // Where questions
    if (questionType === 'where') {
        return generateWhereAnswer(query);
    }
    
    // Why questions
    if (questionType === 'why') {
        return generateWhyAnswer(query);
    }
    
    // How questions
    if (questionType === 'how') {
        return generateHowAnswer(query);
    }
    
    // General knowledge patterns
    if (queryLower.includes('capital of')) {
        const countryMatch = queryLower.match(/capital of (.+)/i);
        if (countryMatch) {
            return generateCapitalAnswer(countryMatch[1].trim());
        }
    }
    
    if (queryLower.includes('population of') || queryLower.includes('population in')) {
        const locationMatch = queryLower.match(/population (of|in) (.+)/i);
        if (locationMatch) {
            return generatePopulationAnswer(locationMatch[2].trim());
        }
    }
    
    // Time and date questions
    if (queryLower.includes('time') || queryLower.includes('date') || queryLower.includes('what day')) {
        const now = new Date();
        const timeString = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
        const dateString = now.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
        return `${dateString}, ${timeString}`;
    }
    
    // Weather (general response)
    if (queryLower.includes('weather')) {
        return "I don't have access to real-time weather data.";
    }
    
    // Default helpful response
    return generateDefaultAnswer(query);
}

// Helper functions for different question types
function generateWhatAnswer(topic, originalQuery) {
    const topicLower = topic.toLowerCase();
    
    // Common definitions - direct and concise
    const definitions = {
        'ai': 'Artificial Intelligence (AI) refers to computer systems designed to perform tasks that typically require human intelligence, such as learning, pattern recognition, and decision-making.',
        'machine learning': 'Machine Learning is a subset of AI where computers learn from experience without being explicitly programmed for every scenario.',
        'python': 'Python is a high-level programming language known for its simplicity and readability, widely used in web development, data science, and AI.',
        'javascript': 'JavaScript is a programming language primarily used for web development to create interactive web pages.',
        'html': 'HTML (HyperText Markup Language) is the standard markup language used to create and structure content on the web.',
        'css': 'CSS (Cascading Style Sheets) is a stylesheet language used to style HTML documents.',
        'api': 'An API (Application Programming Interface) is a set of protocols that allows different software applications to communicate with each other.',
        'react': 'React is a JavaScript library for building user interfaces, particularly web applications, using a component-based architecture.',
        'node.js': 'Node.js is a JavaScript runtime environment that allows JavaScript to run on servers.',
    };
    
    for (const [key, value] of Object.entries(definitions)) {
        if (topicLower.includes(key)) {
            return value;
        }
    }
    
    // For unknown topics, provide a direct response
    return `I don't have specific information about "${topic}" in my knowledge base.`;
}

function generateWhoAnswer(topic, originalQuery) {
    const topicLower = topic.toLowerCase();
    
    // Famous people - direct and concise
    const people = {
        'einstein': 'Albert Einstein (1879-1955) was a German-born theoretical physicist known for developing the theory of relativity and the equation E=mc².',
        'newton': 'Isaac Newton (1643-1727) was an English mathematician and physicist who formulated the three laws of motion and the universal law of gravitation.',
        'darwin': 'Charles Darwin (1809-1882) was an English naturalist who developed the theory of evolution by natural selection.',
        'jobs': 'Steve Jobs (1955-2011) was an American entrepreneur who co-founded Apple Inc. and led the development of products like the iPhone and Mac.',
        'gates': 'Bill Gates (born 1955) is an American business magnate who co-founded Microsoft Corporation and is known for his philanthropy.',
        'musk': 'Elon Musk (born 1971) is a South African-born entrepreneur who founded SpaceX and leads Tesla.',
    };
    
    for (const [key, value] of Object.entries(people)) {
        if (topicLower.includes(key)) {
            return value;
        }
    }
    
    // For unknown people, provide a direct response
    return `I don't have specific information about "${topic}" in my knowledge base.`;
}

function generateWhenAnswer(query) {
    const queryLower = query.toLowerCase();
    
    if (queryLower.includes('world war')) {
        if (queryLower.includes('1') || queryLower.includes('one') || queryLower.includes('first')) {
            return 'World War I occurred from 1914 to 1918.';
        }
        if (queryLower.includes('2') || queryLower.includes('two') || queryLower.includes('second')) {
            return 'World War II occurred from 1939 to 1945.';
        }
    }
    
    // For unknown events, provide direct response
    return `I don't have specific information about "${query}" in my knowledge base.`;
}

function generateWhereAnswer(query) {
    const queryLower = query.toLowerCase();
    
    // Famous locations - direct and concise
    const locations = {
        'mount everest': 'Mount Everest is the world\'s highest mountain at 8,848 meters (29,029 feet), located on the border between Nepal and Tibet.',
        'amazon rainforest': 'The Amazon Rainforest is the world\'s largest tropical rainforest, covering approximately 5.5 million square kilometers across nine South American countries.',
        'great wall of china': 'The Great Wall of China is an ancient fortification system in northern China, stretching approximately 21,196 kilometers (13,171 miles).',
        'eiffel tower': 'The Eiffel Tower is an iron lattice tower in Paris, France, standing 330 meters (1,083 feet) tall, completed in 1889.',
    };
    
    for (const [key, value] of Object.entries(locations)) {
        if (queryLower.includes(key)) {
            return value;
        }
    }
    
    // For unknown locations, provide direct response
    return `I don't have specific information about "${query}" in my knowledge base.`;
}

function generateWhyAnswer(query) {
    return `I don't have specific information to answer "${query}" in my knowledge base.`;
}

function generateHowAnswer(query) {
    const queryLower = query.toLowerCase();
    
    if (queryLower.includes('to code') || queryLower.includes('programming')) {
        return 'Start by choosing a language (Python or JavaScript are good for beginners), practice daily, build small projects, and study existing code.';
    }
    
    if (queryLower.includes('to learn') || queryLower.includes('study')) {
        return 'Set clear goals, use active learning techniques, space out practice, and apply knowledge through projects.';
    }
    
    // For unknown "how" questions, provide direct response
    return `I don't have specific information to answer "${query}" in my knowledge base.`;
}

function generateCapitalAnswer(place) {
    const capitals = {
        'france': 'The capital of France is Paris.',
        'germany': 'The capital of Germany is Berlin.',
        'italy': 'The capital of Italy is Rome.',
        'spain': 'The capital of Spain is Madrid.',
        'uk': 'The capital of the United Kingdom is London.',
        'united kingdom': 'The capital of the United Kingdom is London.',
        'japan': 'The capital of Japan is Tokyo.',
        'china': 'The capital of China is Beijing.',
        'india': 'The capital of India is New Delhi.',
        'brazil': 'The capital of Brazil is Brasília.',
        'australia': 'The capital of Australia is Canberra.',
        'canada': 'The capital of Canada is Ottawa.',
        'usa': 'The capital of the United States is Washington, D.C.',
        'united states': 'The capital of the United States is Washington, D.C.',
    };
    
    const placeLower = place.toLowerCase();
    for (const [key, value] of Object.entries(capitals)) {
        if (placeLower.includes(key)) {
            return value;
        }
    }
    
    // Provide direct response for unknown capitals
    return `I don't have the capital city information for "${place}" in my knowledge base.`;
}

function generatePopulationAnswer(location) {
    return `I don't have access to current population data for "${location}".`;
}

function generateDefaultAnswer(query) {
    // Provide a direct response
    const queryLower = query.toLowerCase();
    
    // Try to provide a basic answer even for unknown topics
    if (queryLower.includes('about')) {
        const topic = query.split('about')[1]?.trim() || query;
        return `I don't have specific information about "${topic}" in my knowledge base.`;
    }
    
    // For general questions, provide a direct response
    return `I don't have specific information about "${query}" in my knowledge base.`;
}

// Ask question (searches documents and returns answer)
app.post("/api/ask", authenticateToken, async (req, res) => {
    const { query } = req.body || {};
    if (!query) return res.status(400).json({ error: "Query required" });
    
    console.log("💬 User asked:", query);
    
    // Refresh documents from MongoDB to ensure we have latest data
    try {
        const docs = await Document.find({});
        documents = docs.map(d => d.toObject());
    } catch (error) {
        console.error("Error loading documents:", error);
    }
    
    console.log(`📚 Total documents available: ${documents.length}`);
    
    let answer = "";
    let sources = [];
    
    const queryLower = query.toLowerCase().trim();
    const isMath = /^[\d\+\-\*\/\(\)\.\s]+$/.test(queryLower.replace(/\s/g, '')) || /(?:what is|calculate|compute|solve|evaluate)\s+[\d\+\-\*\/\(\)\.\s]+/i.test(queryLower);
    
    // Always use Gemini AI with general knowledge
    // If documents are available and relevant, include them as context
    if (geminiModel && !isMath) {
        // Search documents for relevant content (if documents exist)
        let documentContext = '';
        let relevantChunks = [];
        
        if (documents.length > 0) {
            const searchResults = searchDocuments(query);
            console.log(`🔍 Found ${searchResults.length} relevant document chunk(s) for query: "${query}"`);
            
            if (searchResults.length > 0 && searchResults[0].score > 3) {
                // Include relevant document chunks as context (lower threshold to include more context)
                const chunksToUse = searchResults.filter(r => r.score > 3).slice(0, 8);
                relevantChunks = extractRelevantChunks(chunksToUse, 8);
                
                // Format document context
                const contextByDoc = {};
                relevantChunks.forEach(chunk => {
                    const docTitle = chunk.title || 'Document';
                    if (!contextByDoc[docTitle]) {
                        contextByDoc[docTitle] = [];
                    }
                    contextByDoc[docTitle].push(chunk.chunk.substring(0, 500)); // Limit chunk size
                });
                
                documentContext = Object.entries(contextByDoc)
                    .map(([title, chunks]) => {
                        return `[From: ${title}]\n${chunks.join('\n\n')}`;
                    })
                    .join('\n\n---\n\n');
                
                // Include sources
                sources = relevantChunks.slice(0, 3).map((r) => ({
                    id: r.docId,
                    title: r.title,
                    filename: r.filename,
                    snippet: r.chunk.substring(0, 150) + '...',
                    score: r.score,
                }));
                
                console.log(`📄 Including ${relevantChunks.length} document chunk(s) as context`);
            }
        }
        
        // Generate answer using Gemini with document context (if available) + general knowledge
        const geminiAnswer = await generateAnswerWithGemini(query, documentContext, documentContext.length > 0);
        
        if (geminiAnswer) {
            answer = geminiAnswer;
            if (documentContext.length > 0) {
                console.log(`✅ Used Gemini AI with document context + general knowledge`);
            } else {
                console.log(`✅ Used Gemini AI with general knowledge`);
            }
        } else {
            // Fallback to rule-based if Gemini fails
            console.log(`⚠️  Gemini failed, using rule-based fallback`);
            answer = generateGeneralAnswer(query);
        }
    } else {
        // Math calculations or Gemini not available - use rule-based
        if (isMath) {
            answer = generateGeneralAnswer(query);
            console.log(`🔢 Using rule-based math calculation`);
        } else {
            answer = generateGeneralAnswer(query);
            console.log(`⚠️  Gemini not available, using rule-based answer`);
        }
    }
    
    res.json({
        answer,
        sources,
    });
});

// Extract person name from query (for filtering person-specific info)
function extractPersonName(query) {
    const queryLower = query.toLowerCase().trim();
    
    // Patterns for person queries: "tell me about John", "John's info", "who is John", "info about John", etc.
    const patterns = [
        /(?:tell me about|info about|information about|about|who is|who was|details about|tell me|what is|what's)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)/,
        /([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)\s+(?:info|information|details|profile|bio|biography)/i,
        /([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)'s\s+(?:info|information|details|profile|bio|biography|contact|email|phone|address)/i,
    ];
    
    for (const pattern of patterns) {
        const match = query.match(pattern);
        if (match && match[1]) {
            return match[1].trim();
        }
    }
    
    // If query starts with a capitalized word (likely a name), extract it
    const words = query.split(/\s+/);
    if (words.length > 0 && /^[A-Z][a-z]+$/.test(words[0])) {
        // Check if it's followed by common question words (likely a name)
        if (words.length === 1 || !/^(is|was|are|were|has|have|had|does|did|will|would|should|could|may|might|can|the|a|an)$/i.test(words[1])) {
            return words[0];
        }
    }
    
    return null;
}

// Filter text to only include sentences about a specific person
function filterByPersonName(text, personName) {
    if (!personName || !text) return text;
    
    const personNameLower = personName.toLowerCase();
    const nameParts = personName.split(/\s+/);
    const firstName = nameParts[0].toLowerCase();
    const lastName = nameParts.length > 1 ? nameParts[nameParts.length - 1].toLowerCase() : null;
    
    // Split into sentences
    const sentences = text.split(/([.!?]+)/);
    const filteredSentences = [];
    
    for (let i = 0; i < sentences.length; i += 2) {
        const sentence = sentences[i];
        if (!sentence || sentence.trim().length < 5) continue;
        
        const sentenceLower = sentence.toLowerCase();
        
        // Check if sentence mentions the person
        const mentionsPerson = 
            sentenceLower.includes(personNameLower) ||
            sentenceLower.includes(firstName) ||
            (lastName && sentenceLower.includes(lastName)) ||
            // Check for pronouns that might refer to the person (he, she, his, her, him)
            (i > 0 && (sentenceLower.includes(' he ') || sentenceLower.includes(' she ') || 
                      sentenceLower.includes(' his ') || sentenceLower.includes(' her ') ||
                      sentenceLower.includes(' him ') || sentenceLower.includes(' her ')));
        
        // Also check if sentence is about the person by checking for possessive
        const hasPossessive = sentenceLower.includes(firstName + "'s") || 
                             (lastName && sentenceLower.includes(lastName + "'s"));
        
        if (mentionsPerson || hasPossessive) {
            const punctuation = sentences[i + 1] || '.';
            filteredSentences.push(sentence.trim() + punctuation);
        }
    }
    
    // If we found filtered sentences, return them; otherwise return original if it mentions the person
    if (filteredSentences.length > 0) {
        return filteredSentences.join(' ').trim();
    }
    
    // If no filtered sentences but text mentions person, return original
    const textLower = text.toLowerCase();
    if (textLower.includes(personNameLower) || textLower.includes(firstName) || 
        (lastName && textLower.includes(lastName))) {
        return text;
    }
    
    return "";
}

// Extract key entities/nouns from query (excluding stop words and question words)
function extractKeyEntities(query) {
    const queryLower = query.toLowerCase();
    const stopWords = new Set(['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'is', 'are', 'was', 'were', 'be', 'been', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'should', 'could', 'may', 'might', 'must', 'can', 'this', 'that', 'these', 'those', 'i', 'you', 'he', 'she', 'it', 'we', 'they', 'what', 'who', 'when', 'where', 'why', 'how', 'tell', 'me', 'about', 'give', 'information']);
    
    // Extract words that are likely entities (nouns, proper nouns, etc.)
    const words = queryLower.split(/\s+/).filter(w => w.length > 2 && !stopWords.has(w));
    
    // Also extract quoted phrases and capitalized words (likely proper nouns)
    const quoted = query.match(/"([^"]+)"/gi) || [];
    const capitalized = query.split(/\s+/).filter(w => /^[A-Z]/.test(w) && w.length > 2);
    
    const entities = new Set([
        ...words,
        ...quoted.map(q => q.replace(/"/g, '').toLowerCase()),
        ...capitalized.map(c => c.toLowerCase())
    ]);
    
    return Array.from(entities).filter(e => e.length > 2);
}

// Extract relevant sentences from a chunk that answer the specific query
function extractRelevantSentences(chunkContent, query, queryTerms, questionType, personName = null) {
    if (!chunkContent || chunkContent.trim().length === 0) {
        return [];
    }
    
    // If query is about a person, filter chunk first
    if (personName) {
        chunkContent = filterByPersonName(chunkContent, personName);
        if (!chunkContent || chunkContent.trim().length < 10) {
            return [];
        }
    }
    
    // Split into sentences using simple but effective method
    // Replace sentence endings with a marker, then split
    let normalizedContent = chunkContent
        .replace(/([.!?]+)\s+/g, '$1|SENTENCE_END|')
        .replace(/\s+/g, ' ')
        .trim();
    
    const allSentences = normalizedContent
        .split('|SENTENCE_END|')
        .map(s => s.trim())
        .filter(s => {
            // Filter out very short or empty sentences
            if (s.length < 10) return false;
            // Filter out sentences that are just punctuation
            if (!/[a-zA-Z]/.test(s)) return false;
            return true;
        })
        .map(s => {
            // Ensure sentence ends with punctuation
            if (!/[.!?]$/.test(s)) {
                s += '.';
            }
            return s;
        });
    
    if (allSentences.length === 0) {
        return [];
    }
    
    // Keep sentences with index for context extraction
    const sentences = allSentences.map((s, idx) => ({ text: s, index: idx }));
    
    const queryLower = query.toLowerCase();
    const relevantSentences = [];
    const usedSentences = new Set();
    
    // Extract key entities for scoring (not required, but boosts score)
    const keyEntities = extractKeyEntities(query);
    
    // Score each sentence for relevance - BALANCED approach
    sentences.forEach(sentObj => {
        const sentence = sentObj.text;
        const sentenceLower = sentence.toLowerCase();
        let relevanceScore = 0;
        let hasQueryTerms = false;
        
        // Check for exact query phrase (highest priority)
        if (sentenceLower.includes(queryLower)) {
            relevanceScore += 200;
            hasQueryTerms = true;
        }
        
        // Check for query terms (more flexible - at least one term needed)
        if (queryTerms.length > 0) {
            const matchingTerms = queryTerms.filter(term => {
                // Check for exact word match or partial match for longer words
                return sentenceLower.includes(term) || 
                       (term.length > 4 && sentenceLower.includes(term.substring(0, term.length - 1)));
            }).length;
            const termRatio = matchingTerms / queryTerms.length;
            
            if (matchingTerms > 0) {
                hasQueryTerms = true;
                // Score based on how many terms match (more flexible)
                relevanceScore += matchingTerms * 30; // Score per matching term
                relevanceScore += termRatio * 50; // Bonus for high ratio
            }
        }
        
        // Skip sentences with no query terms at all
        if (!hasQueryTerms && !sentenceLower.includes(queryLower)) {
            return;
        }
        
        // Check for key entities (bonus, not required)
        if (keyEntities.length > 0) {
            const matchingEntities = keyEntities.filter(entity => sentenceLower.includes(entity)).length;
            if (matchingEntities > 0) {
                const entityRatio = matchingEntities / keyEntities.length;
                relevanceScore += entityRatio * 60; // Bonus for entity matches
            }
        }
        
        // Question-type specific bonuses (not required, just bonuses)
        if (questionType === 'what' && (sentenceLower.includes('is') || sentenceLower.includes('are') || sentenceLower.includes('refers') || sentenceLower.includes('means'))) {
            relevanceScore += 25;
        }
        if (questionType === 'who' && (sentenceLower.includes('is') || sentenceLower.includes('are') || /\b(name|person|member|executive|president|director|officer)\b/i.test(sentence))) {
            relevanceScore += 25;
        }
        if (questionType === 'when' && (/\d{4}|\d{1,2}\/\d{1,2}|\d{1,2}-\d{1,2}|(january|february|march|april|may|june|july|august|september|october|november|december|monday|tuesday|wednesday|thursday|friday|saturday|sunday|date|time)\b/i.test(sentence))) {
            relevanceScore += 25;
        }
        if (questionType === 'where' && (/\b(in|at|located|address|venue|place|location)\b/i.test(sentence))) {
            relevanceScore += 25;
        }
        if (questionType === 'how' && (/\b(how|method|process|step|way|procedure|by|through)\b/i.test(sentence))) {
            relevanceScore += 25;
        }
        if (questionType === 'why' && (/\b(because|reason|since|due to|for|because of)\b/i.test(sentence))) {
            relevanceScore += 25;
        }
        
        // Count word frequency in sentence (bonus for multiple mentions)
        queryTerms.forEach(term => {
            const matches = (sentenceLower.match(new RegExp(`\\b${term}\\b`, 'gi')) || []).length;
            relevanceScore += matches * 5;
        });
        
        // Include sentences with meaningful relevance (lower threshold - more flexible)
        // Minimum score of 15 to filter out completely irrelevant sentences
        if (relevanceScore >= 15) {
            const sentenceKey = sentence.substring(0, 100).toLowerCase();
            if (!usedSentences.has(sentenceKey)) {
                relevantSentences.push({
                    sentence: sentence.trim(),
                    score: relevanceScore,
                    index: sentObj.index
                });
                usedSentences.add(sentenceKey);
            }
        }
    });
    
    // Sort by relevance score
    relevantSentences.sort((a, b) => b.score - a.score);
    
    // Include adjacent sentences for context (if a highly relevant sentence is found, include neighbors)
    const finalSentences = new Set();
    const addedIndices = new Set();
    
    // Add top scoring sentences and their neighbors for context
    relevantSentences.slice(0, 3).forEach(sentObj => {
        const idx = sentObj.index;
        
        // Add the sentence itself
        if (!addedIndices.has(idx)) {
            finalSentences.add(sentObj.sentence);
            addedIndices.add(idx);
        }
        
        // Add previous sentence for context (if exists and not too long)
        if (idx > 0 && !addedIndices.has(idx - 1) && idx - 1 < allSentences.length) {
            const prevSentence = allSentences[idx - 1];
            if (prevSentence && prevSentence.length < 200) {
                finalSentences.add(prevSentence);
                addedIndices.add(idx - 1);
            }
        }
        
        // Add next sentence for context (if exists and not too long)
        if (idx < allSentences.length - 1 && !addedIndices.has(idx + 1)) {
            const nextSentence = allSentences[idx + 1];
            if (nextSentence && nextSentence.length < 200) {
                finalSentences.add(nextSentence);
                addedIndices.add(idx + 1);
            }
        }
    });
    
    // Add remaining high-scoring sentences if we don't have enough
    if (finalSentences.size < 3) {
        relevantSentences.forEach(sentObj => {
            if (finalSentences.size >= 5) return;
            if (!addedIndices.has(sentObj.index)) {
                finalSentences.add(sentObj.sentence);
                addedIndices.add(sentObj.index);
            }
        });
    }
    
    // Return sentences - prioritize by score, then maintain order
    // Convert to array and sort by original index to maintain flow
    const sentenceArray = Array.from(finalSentences).map(s => {
        const idx = allSentences.findIndex(orig => orig === s);
        return { text: s, index: idx >= 0 ? idx : 999 };
    });
    sentenceArray.sort((a, b) => a.index - b.index);
    return sentenceArray.slice(0, 5).map(s => s.text); // Return up to 5 sentences
}

// Helper function to detect if question needs paragraph or straightforward answer
function needsParagraphAnswer(query) {
    const queryLower = query.toLowerCase();
    
    // Simple/factual questions that need straightforward answers
    const simplePatterns = [
        /^(what is|what are|what was|what were|who is|who are|when is|when was|where is|where are)\s+/i,
        /^(how much|how many|how old|how long|how tall|how wide|how high)\s+/i,
        /^(yes|no|true|false|correct|incorrect)\s*/i,
        /^(what time|what date|what day|what year)\s+/i,
        /^(which|name|list|tell me one|give me one)\s+/i,
    ];
    
    // Complex questions that need paragraph answers
    const complexPatterns = [
        /^(explain|describe|discuss|tell me about|what do you know about|can you explain|how does|how do|why does|why do|why is|why are)\s+/i,
        /^(what are the|what is the|tell me more about|can you tell me more|elaborate|expand on)\s+/i,
        /^(compare|contrast|difference between|similarities|differences)\s+/i,
        /^(how to|how can|how should|how would|what should|what would|what can)\s+/i,
    ];
    
    // Check for complex patterns first
    for (const pattern of complexPatterns) {
        if (pattern.test(queryLower)) {
            return true; // Needs paragraph
        }
    }
    
    // Check for simple patterns
    for (const pattern of simplePatterns) {
        if (pattern.test(queryLower)) {
            return false; // Needs straightforward answer
        }
    }
    
    // Default: if question is long or has multiple parts, use paragraph
    if (query.split(/\s+/).length > 8 || query.includes('?') && query.split('?').length > 1) {
        return true;
    }
    
    // Default to straightforward for short questions
    return false;
}

// Helper function to generate answer using Gemini AI
async function generateAnswerWithGemini(query, context, isDocumentBased = true) {
    if (!geminiModel) {
        return null; // Gemini not available, return null to use fallback
    }
    
    try {
        let prompt = '';
        const useParagraph = needsParagraphAnswer(query);
        
        if (isDocumentBased && context.length > 0) {
            // For answers with document context, use both documents and general knowledge
            if (useParagraph) {
                prompt = `You are KTPilot, a helpful AI assistant for Kappa Theta Pi. Answer the user's question using BOTH the information from uploaded documents (if relevant) AND your general knowledge.

**USER'S QUESTION:**
${query}

**RELEVANT INFORMATION FROM DOCUMENTS (if applicable):**
${context}

**YOUR TASK:**
Provide a comprehensive, flowing paragraph-style answer that thoroughly addresses the question. Write in natural, conversational paragraphs that connect ideas smoothly. Use the document information when relevant, and supplement with your general knowledge to provide a complete, well-rounded answer.

**RESPONSE FORMAT:**
- Write in flowing paragraphs (3-5 sentences per paragraph)
- Connect ideas naturally with transitions
- Provide context and background information
- Explain concepts thoroughly
- Use natural, conversational language
- Maximum 400 words

**EXAMPLE:**
[Write a flowing paragraph that explains the topic comprehensively, connecting ideas smoothly and providing context...]

Now generate your paragraph-style answer:`;
            } else {
                prompt = `You are KTPilot, a helpful AI assistant for Kappa Theta Pi. Answer the user's question using BOTH the information from uploaded documents (if relevant) AND your general knowledge.

**USER'S QUESTION:**
${query}

**RELEVANT INFORMATION FROM DOCUMENTS (if applicable):**
${context}

**YOUR TASK:**
Provide a direct, straightforward answer to the question. Be concise and to the point. Use the document information when relevant, and supplement with your general knowledge if needed.

**RESPONSE FORMAT:**
- Give a direct answer (1-3 sentences)
- Be specific and factual
- No unnecessary elaboration
- If listing items, use simple bullet points
- Maximum 150 words

**EXAMPLE:**
[Direct, concise answer to the question]

Now generate your straightforward answer:`;
            }
        } else {
            // For general knowledge questions (no document context) - includes greetings
            // Check if it's a greeting for special handling
            const isGreeting = /^(hi|hello|hey|greetings|good morning|good afternoon|good evening|good night|how are you|how's it going|what's up|whats up|sup|yo|hii|helloo|hey there|hi there)/i.test(query.trim());
            
            if (isGreeting) {
                prompt = `You are KTPilot, a friendly and helpful AI assistant for Kappa Theta Pi. The user just greeted you.

**USER'S GREETING:**
${query}

**YOUR TASK:**
Respond warmly and naturally to their greeting. Be friendly, welcoming, and let them know you're ready to help with questions about KTP, events, documents, FAQs, or anything else they need. Keep it concise (1-2 sentences) and conversational.

**EXAMPLE RESPONSES:**
- "Hello! I'm KTPilot, your AI assistant for Kappa Theta Pi. How can I help you today?"
- "Hi there! I'm here to help with KTP-related questions, events, documents, and more. What would you like to know?"
- "Hey! Great to meet you. I'm KTPilot, ready to assist with any KTP questions or information you need."

Now respond warmly:`;
            } else {
                // Determine if question needs paragraph or straightforward answer
                if (useParagraph) {
                    prompt = `You are KTPilot, a helpful AI assistant for Kappa Theta Pi. Answer the user's question using your general knowledge.

**USER'S QUESTION:**
${query}

**YOUR TASK:**
Provide a well-structured, easy-to-read answer that directly addresses the question. Use your general knowledge to provide helpful, accurate information.

**STRUCTURE YOUR RESPONSE:**

1. **Direct Answer**: Start with a clear, direct answer (1-2 sentences)

2. **Detailed Explanation**: 
   - Use bullet points (•) or dashes (-) for lists
   - Use numbered lists (1., 2., 3.) for steps or sequences
   - Organize information logically
   - Use line breaks between different topics

3. **Formatting**:
   - Keep paragraphs short (2-3 sentences)
   - Use bullet points for multiple items
   - Use bold for emphasis: **important point**
   - Make it easy to scan and read

4. **Content**:
   - Be accurate and helpful
   - Be concise but comprehensive (under 300 words)
   - Use natural, conversational language
   - If you don't know, say so honestly

**EXAMPLE FORMAT:**
[Direct answer]

• Key point 1
• Key point 2
• Key point 3

[Additional context if needed]

Now generate your answer:`;
                } else {
                    prompt = `You are KTPilot, a helpful AI assistant for Kappa Theta Pi. Answer the user's question using your general knowledge.

**USER'S QUESTION:**
${query}

**YOUR TASK:**
Provide a direct, straightforward answer to the question. Be concise and to the point.

**RESPONSE FORMAT:**
- Give a direct answer (1-3 sentences)
- Be specific and factual
- No unnecessary elaboration
- If listing items, use simple bullet points
- Maximum 150 words

**EXAMPLE:**
[Direct, concise answer to the question]

Now generate your straightforward answer:`;
                }
            }
        }
        
        console.log("🤖 Calling Gemini API with prompt length:", prompt.length);
        const result = await geminiModel.generateContent(prompt);
        const response = await result.response;
        const answer = response.text();
        
        console.log("✅ Gemini API response received, length:", answer.length);
        return answer.trim();
    } catch (error) {
        console.error("❌ Gemini API error:", error.message);
        console.error("❌ Error details:", error);
        // Don't fail completely - return null to use fallback
        return null;
    }
}

// RAG Model: Generate detailed, specific answer from retrieved chunks (only from relevant documents)
async function generateRAGAnswer(query, chunkResults) {
    if (chunkResults.length === 0) {
        return "I couldn't find any relevant information in the uploaded documents.";
    }
    
    const queryLower = query.toLowerCase();
    const questionType = detectQuestionType(query);
    
    // Extract person name if query is about a person
    const personName = extractPersonName(query);
    
    // Extract important query terms for relevance checking
    const stopWords = new Set(['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'is', 'are', 'was', 'were', 'be', 'been', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'should', 'could', 'may', 'might', 'must', 'can', 'this', 'that', 'these', 'those', 'i', 'you', 'he', 'she', 'it', 'we', 'they', 'what', 'who', 'when', 'where', 'why', 'how']);
    const queryTerms = queryLower.split(/\s+/).filter(w => w.length > 2 && !stopWords.has(w));
    
    // Extract only relevant sentences from chunks, not entire chunks
    const relevantSentences = [];
    const usedSentences = new Set();
    // Process more chunks for better context with Gemini (8-10 chunks)
    const maxChunksToProcess = Math.min(chunkResults.length, personName ? 10 : 8);
    
    // Process chunks in order of relevance
    for (let i = 0; i < maxChunksToProcess && i < chunkResults.length; i++) {
        const chunkResult = chunkResults[i];
        
        // Basic chunk-level relevance check (more lenient)
        const chunkLower = chunkResult.chunk.toLowerCase();
        
        // Check if chunk contains at least some query terms (more flexible)
        if (queryTerms.length > 0) {
            const matchingTerms = queryTerms.filter(term => chunkLower.includes(term)).length;
            // If chunk has very low score and no matching terms, skip it
            if (matchingTerms === 0 && chunkResult.score < 8) {
                continue;
            }
        }
        
        // Extract relevant sentences from this chunk
        const sentences = extractRelevantSentences(
            chunkResult.chunk,
            query,
            queryTerms,
            questionType,
            personName
        );
        
        // Add unique, relevant sentences with document metadata
        sentences.forEach(sentence => {
            const sentenceKey = sentence.substring(0, 150).toLowerCase();
            if (!usedSentences.has(sentenceKey) && sentence.trim().length > 10) {
                relevantSentences.push({
                    text: sentence.trim(),
                    docTitle: chunkResult.title || 'Document',
                    docId: chunkResult.docId,
                    filename: chunkResult.filename || ''
                });
                usedSentences.add(sentenceKey);
                
                // Limit total sentences but allow more context for Gemini (max 12 sentences)
                const maxSentences = 12;
                if (relevantSentences.length >= maxSentences) {
                    return;
                }
            }
        });
        
        // Stop if we have enough relevant information
        if (relevantSentences.length >= 12) {
            break;
        }
    }
    
    // If person query but no info found, return specific message
    if (personName && relevantSentences.length === 0) {
        return `I couldn't find information about ${personName} in your uploaded documents.`;
    }
    
    // If no relevant content found after filtering, return message
    if (relevantSentences.length === 0) {
        return "I couldn't find relevant information in your uploaded documents that specifically addresses this question.";
    }
    
    // Try to use Gemini to generate a better answer
    // Format context with clear separators and document sources for better structure
    const contextByDoc = {};
    relevantSentences.forEach(({ text, docTitle, filename }) => {
        const docKey = docTitle;
        if (!contextByDoc[docKey]) {
            contextByDoc[docKey] = {
                title: docTitle,
                filename: filename,
                sentences: []
            };
        }
        contextByDoc[docKey].sentences.push(text);
    });
    
    // Format context with document sources for better organization
    const context = Object.values(contextByDoc)
        .map(({ title, sentences: docSentences }) => {
            return `[From: ${title}]\n${docSentences.join('\n')}`;
        })
        .join('\n\n---\n\n');
    
    const geminiAnswer = await generateAnswerWithGemini(query, context, true);
    
    if (geminiAnswer) {
        console.log("✅ Used Gemini AI to generate answer from documents");
        return geminiAnswer;
    }
    
    // Fallback to rule-based answer generation
    console.log("⚠️  Using rule-based answer generation (Gemini not available)");
    
    // Combine sentences into a focused answer (extract text from sentence objects)
    const sentenceTexts = relevantSentences.map(s => typeof s === 'string' ? s : s.text);
    let answer = sentenceTexts.join(' ');
    
    // Clean up the answer
    answer = answer.trim();
    
    // Remove duplicate periods/spaces
    answer = answer.replace(/\.{2,}/g, '.');
    answer = answer.replace(/\s{2,}/g, ' ');
    
    // Ensure proper sentence endings
    if (!answer.match(/[.!?]$/)) {
        answer += '.';
    }
    
    // Limit answer length to keep it focused but informative (max 800 characters)
    if (answer.length > 800) {
        // Try to cut at a sentence boundary
        const answerSentences = answer.split(/([.!?]+)\s+/);
        let truncated = '';
        // Take up to 4-5 sentences for better context
        const maxSentencesToKeep = 5;
        for (let i = 0; i < answerSentences.length && truncated.length < 750 && i < maxSentencesToKeep * 2; i++) {
            truncated += answerSentences[i];
        }
        answer = truncated.trim();
        if (!answer.match(/[.!?]$/)) {
            answer += '...';
        }
    }
    
    // Return focused, specific answer
    return answer;
}

// Detect question type to provide better answers
function detectQuestionType(query) {
    const lower = query.toLowerCase();
    if (lower.startsWith('what')) return 'what';
    if (lower.startsWith('who')) return 'who';
    if (lower.startsWith('when')) return 'when';
    if (lower.startsWith('where')) return 'where';
    if (lower.startsWith('why')) return 'why';
    if (lower.startsWith('how')) return 'how';
    if (lower.startsWith('which')) return 'which';
    return 'general';
}

// Extract direct answer for specific question types
function extractDirectAnswer(query, snippet, questionType) {
    if (!snippet) return "";
    
    const queryLower = query.toLowerCase();
    const snippetLower = snippet.toLowerCase();
    
    // Try to find sentence that directly answers the question
    const sentences = snippet.split(/[.!?]+/).filter(s => s.trim().length > 10);
    
    for (const sentence of sentences) {
        const sentenceLower = sentence.toLowerCase();
        
        // Check if sentence contains answer keywords
        const queryWords = queryLower.split(/\s+/).filter(w => w.length > 3);
        const matches = queryWords.filter(word => sentenceLower.includes(word)).length;
        
        if (matches >= queryWords.length * 0.5) { // At least 50% of query words match
            // For "what" questions, look for definitions or explanations
            if (questionType === 'what' && (sentenceLower.includes('is') || sentenceLower.includes('are') || sentenceLower.includes('refers'))) {
                return sentence.trim();
            }
            
            // For "who" questions, look for names or roles
            if (questionType === 'who' && (sentenceLower.includes('is') || sentenceLower.includes('are'))) {
                return sentence.trim();
            }
            
            // For "when" questions, look for dates or time references
            if (questionType === 'when' && /\d{4}|\d{1,2}\/\d{1,2}|(january|february|march|april|may|june|july|august|september|october|november|december)/i.test(sentence)) {
                return sentence.trim();
            }
            
            // For "where" questions, look for locations
            if (questionType === 'where' && (sentenceLower.includes('in') || sentenceLower.includes('at') || sentenceLower.includes('located'))) {
                return sentence.trim();
            }
            
            // General match
            if (matches >= queryWords.length * 0.7) {
                return sentence.trim();
            }
        }
    }
    
    // If no direct answer found, return first meaningful sentence
    if (sentences.length > 0) {
        return sentences[0].trim();
    }
    
    return "";
}

// Delete document
app.delete("/api/documents/:id", authenticateToken, async (req, res) => {
    try {
        const doc = await Document.findOne({ id: req.params.id });
        if (!doc) {
            return res.status(404).json({ error: "Document not found" });
        }
        
        // Delete file if it exists
        if (doc.filePath && fs.existsSync(doc.filePath)) {
            try {
                fs.unlinkSync(doc.filePath);
            } catch (err) {
                console.warn(`⚠️  Could not delete file: ${err.message}`);
            }
        }
        
        // Delete from MongoDB
        await Document.deleteOne({ id: req.params.id });
        
        // Update in-memory cache
        const docIndex = documents.findIndex((d) => d.id === req.params.id);
        if (docIndex !== -1) {
            documents.splice(docIndex, 1);
        }
        
        console.log(`🗑️  Deleted document from MongoDB: ${doc.title}`);
        res.json({ message: "Document deleted successfully" });
    } catch (error) {
        console.error("Error deleting document:", error);
        res.status(500).json({ error: "Failed to delete document" });
    }
});

// Messaging Routes

// Get all users (for adding contacts)
app.get("/api/users", authenticateToken, async (req, res) => {
    try {
        // Get all users from MongoDB
        const allUsers = await User.find({}).select('id email name role');
        
        const userList = allUsers
            .filter(u => u.id !== req.user.id) // Exclude current user
            .map(u => ({
                id: u.id,
                email: u.email,
                name: u.name,
                role: u.role || "user",
            }));
        res.json({ users: userList });
    } catch (error) {
        console.error("Get users error:", error);
        res.status(500).json({ error: "Failed to get users" });
    }
});

// Add contact
app.post("/api/contacts", authenticateToken, async (req, res) => {
    try {
        const { userId } = req.body;
        const currentUserId = req.user.id;

        if (!userId) {
            return res.status(400).json({ error: "User ID is required" });
        }

        if (userId === currentUserId) {
            return res.status(400).json({ error: "Cannot add yourself as a contact" });
        }

        const contactUser = await User.findOne({ id: userId });
        if (!contactUser) {
            return res.status(404).json({ error: "User not found" });
        }

        // Check if contact already exists in MongoDB
        const existingContact = await Contact.findOne({ userId: currentUserId, contactId: userId });
        if (existingContact) {
            return res.status(400).json({ error: "Contact already added" });
        }

        // Add contact to MongoDB
        await Contact.create({
            userId: currentUserId,
            contactId: userId
        });

        console.log(`✅ ${req.user.email} added contact: ${contactUser.email}`);

        res.json({
            message: "Contact added successfully",
            contact: {
                id: contactUser.id,
                email: contactUser.email,
                name: contactUser.name,
            },
        });
    } catch (error) {
        console.error("Add contact error:", error);
        res.status(500).json({ error: "Failed to add contact" });
    }
});

// Get contacts
app.get("/api/contacts", authenticateToken, async (req, res) => {
    try {
        const currentUserId = req.user.id;
        
        // Get contacts from MongoDB
        const userContacts = await Contact.find({ userId: currentUserId });
        const contactIds = userContacts.map(c => c.contactId);
        
        // Get user details for each contact
        const contactUsers = await User.find({ id: { $in: contactIds } }).select('id email name');
        
        const contactList = contactUsers.map(user => ({
            id: user.id,
            email: user.email,
            name: user.name,
        }));

        res.json({ contacts: contactList });
    } catch (error) {
        console.error("Get contacts error:", error);
        res.status(500).json({ error: "Failed to get contacts" });
    }
});

// Send message
app.post("/api/messages", authenticateToken, async (req, res) => {
    try {
        const { recipientId, text } = req.body;
        const senderId = req.user.id;

        if (!recipientId || !text) {
            return res.status(400).json({ error: "Recipient ID and message text are required" });
        }

        if (recipientId === senderId) {
            return res.status(400).json({ error: "Cannot send message to yourself" });
        }

        const recipient = await User.findOne({ id: recipientId });
        if (!recipient) {
            return res.status(404).json({ error: "Recipient not found" });
        }

        // Save message to MongoDB
        const message = new Message({
            id: Date.now().toString(),
            senderId,
            recipientId,
            content: text.trim(),
            timestamp: new Date()
        });

        await message.save();

        console.log(`💬 Message sent from ${req.user.email} to ${recipient.email}`);

        res.json({
            message: "Message sent successfully",
            messageData: message,
        });
    } catch (error) {
        console.error("Send message error:", error);
        res.status(500).json({ error: "Failed to send message" });
    }
});

// Get conversations (list of people you've messaged or received messages from)
app.get("/api/conversations", authenticateToken, async (req, res) => {
    try {
        const currentUserId = req.user.id;

        // Get all messages involving current user from MongoDB
        const allMessages = await Message.find({
            $or: [
                { senderId: currentUserId },
                { recipientId: currentUserId }
            ]
        }).sort({ timestamp: -1 });

        // Get unique conversation partners
        const conversationPartners = new Set();
        allMessages.forEach(msg => {
            if (msg.senderId === currentUserId) {
                conversationPartners.add(msg.recipientId);
            } else if (msg.recipientId === currentUserId) {
                conversationPartners.add(msg.senderId);
            }
        });

        // Build conversation list with last message
        const conversations = await Promise.all(Array.from(conversationPartners).map(async (partnerId) => {
            const partner = await User.findOne({ id: partnerId }).select('id email name');
            if (!partner) return null;

            // Get last message in this conversation
            const conversationMessages = allMessages
                .filter(msg => 
                    (msg.senderId === currentUserId && msg.recipientId === partnerId) ||
                    (msg.senderId === partnerId && msg.recipientId === currentUserId)
                )
                .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

            const lastMessage = conversationMessages[0] || null;
            const unreadCount = allMessages.filter(msg => 
                msg.recipientId === currentUserId && 
                msg.senderId === partnerId
            ).length;

            return {
                userId: partner.id,
                name: partner.name,
                email: partner.email,
                lastMessage: lastMessage ? {
                    text: lastMessage.content,
                    timestamp: lastMessage.timestamp,
                    isFromMe: lastMessage.senderId === currentUserId,
                } : null,
                unreadCount,
            };
        }));

        const validConversations = conversations.filter(Boolean).sort((a, b) => {
            // Sort by last message timestamp
            if (!a.lastMessage) return 1;
            if (!b.lastMessage) return -1;
            return new Date(b.lastMessage.timestamp) - new Date(a.lastMessage.timestamp);
        });

        res.json({ conversations: validConversations });
    } catch (error) {
        console.error("Get conversations error:", error);
        res.status(500).json({ error: "Failed to get conversations" });
    }
});

// Get messages for a specific conversation
app.get("/api/messages/:userId", authenticateToken, async (req, res) => {
    try {
        const currentUserId = req.user.id;
        const otherUserId = req.params.userId;

        if (otherUserId === currentUserId) {
            return res.status(400).json({ error: "Invalid user ID" });
        }

        // Get all messages between current user and other user from MongoDB
        const conversationMessages = await Message.find({
            $or: [
                { senderId: currentUserId, recipientId: otherUserId },
                { senderId: otherUserId, recipientId: currentUserId }
            ]
        }).sort({ timestamp: 1 });

        // Get sender names
        const senderIds = [...new Set(conversationMessages.map(m => m.senderId))];
        const senders = await User.find({ id: { $in: senderIds } }).select('id name');
        const senderMap = {};
        senders.forEach(s => senderMap[s.id] = s.name);

        const formattedMessages = conversationMessages.map(msg => ({
            id: msg.id,
            text: msg.content,
            timestamp: msg.timestamp,
            isFromMe: msg.senderId === currentUserId,
            senderName: senderMap[msg.senderId] || "Unknown",
        }));

        res.json({ messages: conversationMessages });
    } catch (error) {
        console.error("Get messages error:", error);
        res.status(500).json({ error: "Failed to get messages" });
    }
});

// Health check endpoint
app.get("/", (req, res) => {
    res.json({ 
        status: "ok", 
        message: "KTPilot Server is running",
        database: mongoose.connection.readyState === 1 ? "connected" : "disconnected",
        port: PORT
    });
});

// Health check API endpoint
app.get("/api/health", (req, res) => {
    res.json({ 
        status: "ok", 
        server: "running",
        database: mongoose.connection.readyState === 1 ? "connected" : "disconnected",
        timestamp: new Date().toISOString()
    });
});

app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
    console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
    if (mongoose.connection.readyState === 1) {
        console.log(`✅ MongoDB: Connected`);
    } else {
        console.log(`⚠️  MongoDB: Connecting...`);
    }
});
