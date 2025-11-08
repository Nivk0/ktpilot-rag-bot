const express = require("express");
const cors = require("cors");
const multer = require("multer");
const dotenv = require("dotenv");
const fs = require("fs");
const path = require("path");

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5050;

app.use(cors());
app.use(express.json());

const uploadsDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir);

const upload = multer({ dest: uploadsDir });

app.get("/", (req, res) => {
    res.send("✅ KTPilot backend is running!");
});

app.post("/api/upload", upload.single("file"), (req, res) => {
    if (!req.file) return res.status(400).json({ error: "No file uploaded" });
    console.log("📄 Uploaded file:", req.file.originalname);
    res.json({ message: `File '${req.file.originalname}' uploaded successfully.` });
});

app.post("/api/ask", (req, res) => {
    const { query } = req.body || {};
    if (!query) return res.status(400).json({ error: "Query required" });
    console.log("💬 User asked:", query);
    res.json({ answer: `Mock answer for: "${query}"` });
});

app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));
