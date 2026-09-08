const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, enum: ['patient', 'doctor'], default: 'patient' },

    // ============================================
    // --- NAYE FIELDS PROFILE DETAILS KE LIYE ---
    // ============================================
    age: { type: Number },
    gender: { type: String },
    bloodGroup: { type: String },
    phone: { type: String },
    address: { type: String },
    // ============================================

    // --- FIELDS OTP VERIFICATION KE LIYE ---
    isVerified: { type: Boolean, default: false }, 
    otp: { type: String },                         
    otpExpires: { type: Date }                     
    // --------------------------------------------

}, { timestamps: true });

module.exports = mongoose.models.User || mongoose.model('User', userSchema);