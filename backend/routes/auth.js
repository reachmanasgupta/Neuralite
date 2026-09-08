const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken'); // Naya import Profile update ke liye
const User = require('../models/User'); // Naya import Profile update ke liye

const { 
    registerUser, 
    loginUser, 
    getProfile, 
    forgotPassword, 
    resetPassword,
    verifyOTP // 👈 Naya function yahan import kiya
} = require('../controllers/authController');

// Routes
router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/verify-otp', verifyOTP); // 👈 Naya route add kiya

// router.get('/profile', getProfile); 
router.post('/forgot-password', forgotPassword);
router.post('/reset-password/:token', resetPassword);

// ==========================================
// --- NAYA ROUTE: UPDATE PATIENT PROFILE ---
// ==========================================
router.put('/update-profile', async (req, res) => {
  try {
    // 1. Token Check
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ message: "No token provided" });

    // 2. Token Verify
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your_secret_key');
    
    // 3. Frontend se data receive karna
    const { name, age, gender, bloodGroup, phone, address } = req.body;

    // 4. Database mein user update karna
    const updatedUser = await User.findByIdAndUpdate(
      decoded.id, // Token se id nikali
      { name, age, gender, bloodGroup, phone, address },
      { new: true, runValidators: true }
    ).select('-password'); // Password hide kar diya

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json(updatedUser);
  } catch (error) {
    console.error("Profile update error:", error);
    res.status(500).json({ message: "Server error while updating profile" });
  }
});

module.exports = router;