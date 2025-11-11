const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    id: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true },
    name: { type: String, required: true },
    role: { type: String, default: 'member' }, // member or executive
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

// Index for faster lookups
userSchema.index({ email: 1 });
userSchema.index({ id: 1 });

module.exports = mongoose.model('User', userSchema);

