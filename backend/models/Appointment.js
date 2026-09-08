const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema({
    patientId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    doctorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Doctor', required: true },
    appointmentDate: { type: Date, required: true },
    timeSlot: { type: String, required: true },
    symptoms: { type: String }, // User jo bimari ki details dalega
    status: { type: String, enum: ['Pending', 'Confirmed', 'Completed', 'Cancelled'], default: 'Confirmed' },
    paymentStatus: { type: String, default: 'Pay_at_Venue' }, // Free/Dummy workflow ke liye
    
    // --- NAYA FEATURE: Smart E-Prescription Data ---
    prescription: {
        medicines: [
            {
                name: { type: String },     // Dawai ka naam (e.g., Paracetamol)
                dosage: { type: String },   // Khane ka tarika (e.g., 1-0-1)
                duration: { type: String }  // Kitne din (e.g., 5 Days)
            }
        ],
        notes: { type: String }, // Doctor ki extra advice
        issuedAt: { type: Date }
    },
    
    // Purana file upload wala field waisa hi rahega
    prescriptionFile: { type: String } 
}, { timestamps: true });

module.exports = mongoose.model('Appointment', appointmentSchema);