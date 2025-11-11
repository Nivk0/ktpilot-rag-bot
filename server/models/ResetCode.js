const mongoose = require('mongoose');

const resetCodeSchema = new mongoose.Schema({
    email: { type: String, required: true, lowercase: true, trim: true },
    code: { type: String, required: true },
    expiresAt: { type: Date, required: true },
    createdAt: { type: Date, default: Date.now },
    generatedBy: { type: String } // Track which executive generated it (optional)
});

// Index for faster lookups
resetCodeSchema.index({ email: 1 });
resetCodeSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 }); // Auto-delete expired codes

module.exports = mongoose.model('ResetCode', resetCodeSchema);

