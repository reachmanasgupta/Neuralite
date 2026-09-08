const mongoose = require('mongoose');

const healthRecordSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User', // Aapke User model ka reference
        required: true
    },
    recordType: {
        type: String,
        // NAYA: 'X-Ray Scan' ko enum mein add kiya gaya hai
        enum: ['Parchi Analysis', 'ML Risk Prediction', 'Symptom Chat', 'X-Ray Scan'], 
        required: true
    },
    resultData: {
        type: Object, // Isme AI ka Risk Score, Diet Plan, aur Doctor Specialty sab automatically save ho jayega
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('HealthRecord', healthRecordSchema);