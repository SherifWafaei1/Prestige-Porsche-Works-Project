const mongoose = require('mongoose');

const pendingVerificationSchema = new mongoose.Schema({
    firstName: { type: String, required: true, trim: true },
    lastName: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, trim: true },
    password: { type: String, required: true },
    phoneNumber: { type: String, required: true },
    address: { type: String, required: true },
    role: { type: String, enum: ['user', 'admin'], default: 'user' },
    pin: { type: String, required: true },
    pinExpires: { type: Date, required: true },
    createdAt: { type: Date, default: Date.now }
});

const PendingVerification = mongoose.model('PendingVerification', pendingVerificationSchema);

module.exports = PendingVerification; 