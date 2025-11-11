const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
    id: { type: String, required: true, unique: true },
    senderId: { type: String, required: true },
    recipientId: { type: String, required: true },
    content: { type: String, required: true },
    timestamp: { type: Date, default: Date.now }
});

// Index for faster queries
messageSchema.index({ senderId: 1, recipientId: 1, timestamp: -1 });
messageSchema.index({ id: 1 });

module.exports = mongoose.model('Message', messageSchema);

