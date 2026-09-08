const User = require('../models/User');
const Doctor = require('../models/Doctor'); 
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken'); 
const sendEmail = require('../utils/sendEmail'); 

// ==========================================
// 1. User Registration Logic (With OTP)
// ==========================================
exports.registerUser = async (req, res) => {
    try {
        const { name, email, password, role, phone } = req.body;

        let user = await User.findOne({ email });
        if (user) {
            return res.status(400).json({ message: 'User already exists with this email' });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const otpExpires = new Date(Date.now() + 10 * 60 * 1000); 

        user = new User({
            name,
            email,
            password: hashedPassword, 
            role: role || 'patient', 
            phone,
            otp,
            otpExpires,
            isVerified: false 
        });

        await user.save();

        await sendEmail({
            email: user.email,
            subject: 'Neuralite - Verify Your Account (OTP)',
            message: `Hello ${user.name},\n\nWelcome to Neuralite! Your OTP for account verification is: ${otp}\n\nThis OTP is valid for 10 minutes. Please do not share this with anyone.\n\nThank You!`
        });

        res.status(201).json({ 
            message: 'User registered! Please check your email for OTP.',
            requireOTP: true,
            email: user.email
        });

    } catch (error) {
        console.error("Registration Error: ", error.message);
        res.status(500).json({ message: 'Server Error' });
    }
};

// ==========================================
// 2. User Login Logic (With Verification Check & Full Profile Send)
// ==========================================
exports.loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: 'Invalid Email or Password' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid Email or Password' });
        }

        if (!user.isVerified) {
            const otp = Math.floor(100000 + Math.random() * 900000).toString();
            user.otp = otp;
            user.otpExpires = new Date(Date.now() + 10 * 60 * 1000);
            await user.save();

            await sendEmail({
                email: user.email,
                subject: 'Neuralite - Verify Your Account (OTP)',
                message: `Hello ${user.name},\n\nYou tried to login but your account is not verified. Your new OTP is: ${otp}\n\nThis OTP is valid for 10 minutes.\n\nThank You!`
            });

            return res.status(403).json({ 
                message: 'Account not verified. A new OTP has been sent to your email.',
                requireOTP: true,
                email: user.email
            });
        }

        const token = jwt.sign(
            { id: user._id, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: '1d' }
        );

        // --- NAYA LOGIC: Pura user object bhejna frontend ko ---
        res.status(200).json({
            message: 'Login successful!',
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                age: user.age,           // NEW
                gender: user.gender,     // NEW
                bloodGroup: user.bloodGroup, // NEW
                phone: user.phone,       // NEW
                address: user.address    // NEW
            }
        });

    } catch (error) {
        console.error("Login Error: ", error.message);
        res.status(500).json({ message: 'Server Error' });
    }
};

// ==========================================
// 3. Verify OTP Logic
// ==========================================
exports.verifyOTP = async (req, res) => {
    try {
        const { email, otp } = req.body;

        const user = await User.findOne({ email });
        if (!user) return res.status(400).json({ message: 'User not found' });
        if (user.isVerified) return res.status(400).json({ message: 'User is already verified. Please login.' });

        if (user.otp !== otp) {
            return res.status(400).json({ message: 'Invalid OTP. Please try again.' });
        }

        if (user.otpExpires < new Date()) {
            return res.status(400).json({ message: 'OTP has expired. Please request a new one.' });
        }

        user.isVerified = true;
        user.otp = undefined; 
        user.otpExpires = undefined;
        await user.save();

        const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1d' });

        res.status(200).json({
            message: 'Account verified successfully!',
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role
            }
        });

    } catch (error) {
        console.error("OTP Verification Error: ", error.message);
        res.status(500).json({ message: 'Server Error' });
    }
};

// ==========================================
// 4. Get User Profile Logic 
// ==========================================
exports.getProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password');
        
        if (!user) {
            return res.status(404).json({ message: 'User nahi mila!' });
        }

        // --- NAYA LOGIC: Seedha user data return karein frontend caching ke liye ---
        // (Sirf 'user' property bypass karke directly send karna better hai frontend sync ke liye)
        res.status(200).json({
            id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            age: user.age,
            gender: user.gender,
            bloodGroup: user.bloodGroup,
            phone: user.phone,
            address: user.address
        });
    } catch (error) {
        console.error("Profile Fetch Error: ", error.message);
        res.status(500).json({ message: 'Server Error' });
    }
};

// ==========================================
// 5. Update Profile (NAYA FUNCTION 🚀)
// ==========================================
exports.updateProfile = async (req, res) => {
    try {
        const { name, age, gender, bloodGroup, phone, address } = req.body;
        const userId = req.user.id; // Yeh authMiddleware se aayega

        // User dhoondo aur update karo
        const updatedUser = await User.findByIdAndUpdate(
            userId,
            { name, age, gender, bloodGroup, phone, address },
            { new: true, runValidators: true } // naya object return karega
        ).select('-password'); // password nahi chahiye

        if (!updatedUser) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.status(200).json({ 
            message: "Profile updated successfully!", 
            user: {
                id: updatedUser._id,
                name: updatedUser.name,
                email: updatedUser.email,
                role: updatedUser.role,
                age: updatedUser.age,
                gender: updatedUser.gender,
                bloodGroup: updatedUser.bloodGroup,
                phone: updatedUser.phone,
                address: updatedUser.address
            }
        });

    } catch (error) {
        console.error("Profile Update Error: ", error);
        res.status(500).json({ message: 'Server error while updating profile' });
    }
};

// ==========================================
// 6. Forgot Password Logic
// ==========================================
exports.forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: "User not found with this email" });
        }

        const resetToken = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '15m' });
        const resetUrl = `http://localhost:5173/reset-password/${resetToken}`;

        await sendEmail({
            email: user.email,
            subject: 'Neuralite - Password Reset Request',
            message: `You recently requested to reset your password. Click the link below to reset it (valid for 15 minutes):\n\n${resetUrl}\n\nIf you didn't request a password reset, please ignore this email.`
        });

        res.status(200).json({ message: "Password reset link sent to your email!" });

    } catch (error) {
        console.error("Forgot Password Error:", error);
        res.status(500).json({ message: "Server error while sending email. Please try again later." });
    }
};

// ==========================================
// 7. Reset Password Logic 
// ==========================================
exports.resetPassword = async (req, res) => {
    try {
        const { token } = req.params;
        const { password } = req.body;

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        await User.findByIdAndUpdate(decoded.id, { password: hashedPassword });
        res.status(200).json({ message: "Password updated successfully!" });
    } catch (error) {
        console.error("Reset Password Error:", error);
        res.status(400).json({ message: "Invalid or expired reset link." });
    }
};