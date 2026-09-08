const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { getAdminStats, getAllUsers, deleteUser } = require('../controllers/adminController');

// --- SMART MIDDLEWARE: Verify if user is strictly an ADMIN ---
const isAdmin = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ message: "No token provided" });

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your_secret_key');
    const user = await User.findById(decoded.id);

    if (!user || user.role !== 'admin') {
      return res.status(403).json({ message: "Access Denied! Admins only." });
    }

    req.user = user; // Agle function ke liye user pass kar diya
    next();
  } catch (error) {
    res.status(401).json({ message: "Invalid or expired token" });
  }
};

// --- ADMIN ROUTES ---
// In sab routes se pehle 'isAdmin' chalega security ke liye
router.get('/stats', isAdmin, getAdminStats);
router.get('/users', isAdmin, getAllUsers);
router.delete('/user/:id', isAdmin, deleteUser);

module.exports = router;