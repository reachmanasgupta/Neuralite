const User = require('../models/User');
const Appointment = require('../models/Appointment');

// 1. Get Dashboard Stats (Totals)
exports.getAdminStats = async (req, res) => {
  try {
    const totalPatients = await User.countDocuments({ role: 'patient' });
    const totalDoctors = await User.countDocuments({ role: 'doctor' });
    const totalAppointments = await Appointment.countDocuments();
    
    // Agar aapke paas HealthRecord model hai toh uska count bhi le sakte hain, warna ye 3 kafi hain
    
    res.json({
      success: true,
      stats: {
        totalPatients,
        totalDoctors,
        totalAppointments
      }
    });
  } catch (error) {
    console.error("Admin Stats Error:", error);
    res.status(500).json({ message: "Server error while fetching stats" });
  }
};

// 2. Get All Users (For Table)
exports.getAllUsers = async (req, res) => {
  try {
    // Password hide karke baaki details nikalenge
    const users = await User.find({ role: { $ne: 'admin' } }).select('-password').sort({ createdAt: -1 });
    res.json({ success: true, users });
  } catch (error) {
    console.error("Fetch Users Error:", error);
    res.status(500).json({ message: "Server error while fetching users" });
  }
};

// 3. Delete/Remove a User (Fake accounts hatane ke liye)
exports.deleteUser = async (req, res) => {
  try {
    const userId = req.params.id;
    await User.findByIdAndDelete(userId);
    res.json({ success: true, message: "User deleted successfully" });
  } catch (error) {
    console.error("Delete User Error:", error);
    res.status(500).json({ message: "Server error while deleting user" });
  }
};