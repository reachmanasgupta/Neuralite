const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');

// Smart Import
let Doctor = require('../models/Doctor');
if (Doctor.Doctor) {
    Doctor = Doctor.Doctor;
}

const verifyToken = (req, res, next) => {
    try {
        const authHeader = req.header('Authorization');
        if (!authHeader) {
            return res.status(401).json({ success: false, message: 'Access Denied: No token provided' });
        }
        const token = authHeader.split(' ')[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret');
        req.user = decoded.user || decoded; 
        next();
    } catch (error) {
        res.status(400).json({ success: false, message: 'Invalid Token' });
    }
};

// 1. NAYA ROUTE: Logged-in doctor ki details mangwane ke liye
router.get('/me', verifyToken, async (req, res) => {
    try {
        const userId = req.user.id || req.user._id;
        const doctorProfile = await Doctor.findOne({ userId: userId });
        res.status(200).json(doctorProfile || {});
    } catch (error) {
        res.status(500).json({ success: false, message: "Server Error" });
    }
});

// 2. Doctor Profile Update Route (PUT)
router.put('/update-profile', verifyToken, async (req, res) => {
    try {
        const { specialty, experience, consultationFee, clinicAddress } = req.body;
        const userId = req.user.id || req.user._id; 

        const doctorRecord = await Doctor.findOneAndUpdate(
            { userId: userId },
            { specialty, experience, consultationFee, clinicAddress },
            { new: true, upsert: true } 
        );

        res.status(200).json({ 
            success: true, 
            message: "Profile updated successfully!", 
            doctor: doctorRecord 
        });
    } catch (error) {
        console.error("Profile Update Error:", error);
        res.status(500).json({ success: false, message: "Server error", error: error.message });
    }
});

// 3. BUG FIX: Patient Dashboard ke liye saare doctors fetch karna
router.get('/all', async (req, res) => {
    try {
        const doctors = await Doctor.find().populate('userId', 'name email');
        
        const formattedDoctors = doctors.map(doc => ({
            _id: doc._id,  // BUG FIX: Yahan pehle doc.userId._id tha, ab actual Doctor ID jayegi
            userId: doc.userId?._id,
            name: doc.userId?.name || "Unknown Doctor",
            specialty: doc.specialty,
            experience: doc.experience,
            consultationFee: doc.consultationFee,
            clinicAddress: doc.clinicAddress
        }));

        res.status(200).json(formattedDoctors);
    } catch (error) {
        console.error("Fetch Doctors Error:", error);
        res.status(500).json({ success: false, message: "Server Error", error: error.message });
    }
});

module.exports = router;