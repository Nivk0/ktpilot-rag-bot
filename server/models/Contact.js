const mongoose = require('mongoose');

const contactSchema = new mongoose.Schema({
    userId: { type: String, required: true },
    contactId: { type: String, required: true },
    addedAt: { type: Date, default: Date.now }
}, {
    unique: true // Ensure no duplicate contacts
});

// Index for faster lookups
contactSchema.index({ userId: 1, contactId: 1 });
contactSchema.index({ userId: 1 });

module.exports = mongoose.model('Contact', contactSchema);

