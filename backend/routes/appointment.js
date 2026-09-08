const express = require('express');
const router = express.Router();
const multer = require('multer'); 
const path = require('path'); 
const Appointment = require('../models/Appointment'); 
const Razorpay = require('razorpay'); // 👈 NAYA: Razorpay Import

// --- NAYA: Razorpay Setup ---
const razorpay = new Razorpay({
    key_id: 'rzp_test_TQ9KNeUGPNlE6c',
    key_secret: 'xf3gPJKg31zUUfk8bpQRDH0t'
});
// ----------------------------

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/');
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + path.extname(file.originalname)); 
    }
});
const upload = multer({ storage: storage });

const { 
    bookAppointment, 
    getPatientAppointments, 
    cancelAppointment, 
    getDoctorAppointments,
    completeAppointment,
    updateAppointmentStatus
} = require('../controllers/appointmentController');

const authMiddleware = require('../middleware/authMiddleware');

router.post('/book', authMiddleware, bookAppointment);
router.get('/my-appointments', authMiddleware, getPatientAppointments);
router.put('/cancel/:id', authMiddleware, cancelAppointment);
router.put('/update-status/:id', authMiddleware, updateAppointmentStatus);
router.get('/doctor-appointments', authMiddleware, getDoctorAppointments);
router.put('/complete/:id', authMiddleware, upload.single('prescriptionFile'), completeAppointment); 

// ==========================================================
// --- NAYA ROUTE: Razorpay Order Create Karne Ke Liye ---
// ==========================================================
router.post('/create-payment', authMiddleware, async (req, res) => {
    try {
        const { amount } = req.body;
        const options = {
            amount: amount * 100, // Razorpay paise mein amount leta hai (₹1 = 100 paise)
            currency: "INR",
            receipt: `receipt_${Date.now()}`
        };
        const order = await razorpay.orders.create(options);
        res.status(200).json(order);
    } catch (error) {
        console.error("Payment Order Error:", error);
        res.status(500).json({ message: "Unable to create payment order" });
    }
});

// Smart E-Prescription
router.post('/add-prescription/:appointmentId', authMiddleware, async (req, res) => {
  try {
    const { medicines, notes } = req.body;
    const appointmentId = req.params.appointmentId;

    const updatedAppointment = await Appointment.findByIdAndUpdate(
      appointmentId,
      {
        status: 'Completed',
        prescription: {
          medicines: medicines,
          notes: notes,
          issuedAt: new Date()
        }
      },
      { new: true }
    );

    if (!updatedAppointment) {
      return res.status(404).json({ message: "Appointment not found!" });
    }

    res.json({ success: true, message: "E-Prescription saved successfully!", appointment: updatedAppointment });
  } catch (error) {
    console.error("Prescription Error:", error);
    res.status(500).json({ message: "Server error while saving prescription" });
  }
});

module.exports = router;