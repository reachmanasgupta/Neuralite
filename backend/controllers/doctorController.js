const Doctor = require('../models/Doctor');

// Doctor Profile Create Karne Ka Logic
exports.createDoctorProfile = async (req, res) => {
    try {
        // 1. Security Check: Kya yeh user sach mein ek doctor hai?
        if (req.user.role !== 'doctor') {
            return res.status(403).json({ message: 'Access denied! Only doctors can create a profile.' });
        }

        const { specialty, experience, clinicAddress, consultationFee, availability } = req.body;

        // 2. Check karein ki is user ne pehle se profile toh nahi bana rakhi
        let doctor = await Doctor.findOne({ userId: req.user.id });
        if (doctor) {
            return res.status(400).json({ message: 'Doctor profile already exists!' });
        }

        // 3. Nayi Doctor profile banayein
        doctor = new Doctor({
            userId: req.user.id, // Yeh ID humein middleware (token) se mil rahi hai
            specialty,
            experience,
            clinicAddress,
            consultationFee,
            availability
        });

        // 4. Database me save karein
        await doctor.save();
        res.status(201).json({ message: 'Doctor profile created successfully!', doctor });

    } catch (error) {
        console.error(error.message);
        res.status(500).json({ message: 'Server Error' });
    }
};

// Saare doctors ki list nikalne ka logic
exports.getAllDoctors = async (req, res) => {
    try {
        const doctors = await Doctor.find(); // Database se sabhi doctors ko dhoondhna
        res.status(200).json(doctors);
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ message: 'Server Error' });
    }
};