const mongoose = require('mongoose');

const doctorSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    specialty: { type: String, required: true },
    experience: { type: Number, required: true },
    clinicAddress: { type: String, required: true },
    consultationFee: { type: Number, required: true },
    availability: [{
        day: { type: String },
        timeSlots: [{ type: String }]
    }]
}, { timestamps: true });

// BULLETPROOF EXPORT: Agar model pehle se bana hai toh wahi use karo, warna naya banao
module.exports = mongoose.models.Doctor || mongoose.model('Doctor', doctorSchema);