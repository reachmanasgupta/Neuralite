const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const healthRecordRoutes = require('./routes/healthRecordRoutes');
const adminRoutes = require('./routes/admin');

// .env file se variables load karna
dotenv.config();

// Express app initialize karna
const app = express();

// Middleware (JSON data aur frontend connection handle karne ke liye)
app.use(cors()); 
app.use(express.json()); 

// Ek basic route server check karne ke liye
app.get('/', (req, res) => {
    res.send('Doctor Appointment Backend API is running perfectly!');
});

// Routes import karna
const authRoutes = require('./routes/auth');
const doctorRoutes = require('./routes/doctor');
const appointmentRoutes = require('./routes/appointment');

app.use('/api/auth', authRoutes);
app.use('/api/doctor', doctorRoutes);
app.use('/api/appointment', appointmentRoutes);
app.use('/api/health-records', healthRecordRoutes);
app.use('/api/doctor', require('./routes/doctor'));
app.use('/uploads', express.static('uploads'));
app.use('/api/admin', adminRoutes);

// MongoDB Database Connection
mongoose.connect(process.env.MONGO_URI)
    .then(() => {
        console.log('MongoDB Connected Successfully!');
    })
    .catch((error) => {
        console.log('MongoDB Connection Error:', error);
    });

// Server Start Karna
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});