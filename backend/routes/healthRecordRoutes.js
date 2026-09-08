const express = require('express');
const router = express.Router();
const HealthRecord = require('../models/HealthRecord');

// 1. Naya Record Save Karne Ke Liye (POST)
router.post('/save', async (req, res) => {
    try {
        const { userId, recordType, resultData } = req.body;

        // Validation check
        if (!userId || !recordType || !resultData) {
            return res.status(400).json({ success: false, message: "Missing required fields" });
        }

        const newRecord = new HealthRecord({
            userId,
            recordType,
            resultData
        });

        await newRecord.save();
        res.status(201).json({ success: true, message: "Health Record safely saved to MongoDB!" });
    } catch (error) {
        res.status(500).json({ success: false, message: "Error saving record", error: error.message });
    }
});

// 2. User ki purani History dekhne ke liye (GET)
router.get('/my-history/:userId', async (req, res) => {
    try {
        // Latest records pehle dikhane ke liye sort({ createdAt: -1 })
        const records = await HealthRecord.find({ userId: req.params.userId }).sort({ createdAt: -1 });
        res.status(200).json({ success: true, data: records });
    } catch (error) {
        res.status(500).json({ success: false, message: "Error fetching history", error: error.message });
    }
});

module.exports = router;