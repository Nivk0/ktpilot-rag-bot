const mongoose = require('mongoose');

const chunkSchema = new mongoose.Schema({
    id: String,
    docId: String,
    docTitle: String,
    content: String,
    chunkIndex: Number
}, { _id: false });

const documentSchema = new mongoose.Schema({
    id: { type: String, required: true, unique: true },
    title: { type: String, required: true },
    filename: { type: String, required: true },
    content: { type: String, required: true },
    uploadedAt: { type: Date, default: Date.now },
    filePath: String,
    chunks: [chunkSchema]
});

// Index for faster searches
documentSchema.index({ id: 1 });
documentSchema.index({ title: 'text', content: 'text' });

module.exports = mongoose.model('Document', documentSchema);

