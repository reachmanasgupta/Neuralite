const Appointment = require('../models/Appointment');

// --- SMART IMPORT LOGIC ---
let Doctor = require('../models/Doctor');
if (Doctor.Doctor) {
    Doctor = Doctor.Doctor;
}
// --------------------------

exports.bookAppointment = async (req, res) => {
    try {
        if (req.user.role !== 'patient') {
            return res.status(403).json({ message: 'Access denied! Only patients can book appointments.' });
        }

        const { doctorId, appointmentDate, timeSlot, symptoms } = req.body;
        const patientId = req.user.id || req.user._id;

        const appointment = new Appointment({
            patientId: patientId,
            doctorId,
            appointmentDate,
            timeSlot,
            symptoms,
            status: 'Confirmed',
            paymentStatus: 'Pay_at_Venue'
        });

        await appointment.save();
        res.status(201).json({ message: 'Appointment booked successfully!', appointment });

    } catch (error) {
        console.error("Booking Error: ", error.message); 
        res.status(500).json({ message: 'Server Error' });
    }
};

exports.getPatientAppointments = async (req, res) => {
    try {
        const patientId = req.user.id || req.user._id;
        const appointments = await Appointment.find({ patientId: patientId })
                                              .populate('doctorId', 'specialty clinicAddress consultationFee');
        res.status(200).json(appointments);
    } catch (error) {
        console.error("Error fetching appointments: ", error.message);
        res.status(500).json({ message: 'Server Error' });
    }
};

exports.cancelAppointment = async (req, res) => {
    try {
        const appointmentId = req.params.id;
        const patientId = req.user.id || req.user._id;
        
        const appointment = await Appointment.findById(appointmentId);

        if (!appointment) return res.status(404).json({ message: 'Appointment nahi mili!' });
        if (appointment.patientId.toString() !== patientId.toString()) {
            return res.status(401).json({ message: 'Aap is appointment ko cancel nahi kar sakte.' });
        }

        appointment.status = 'Cancelled';
        await appointment.save();

        res.status(200).json({ message: 'Appointment successfully cancelled!' });
    } catch (error) {
        console.error("Error cancelling appointment: ", error.message);
        res.status(500).json({ message: 'Server Error' });
    }
};

exports.getDoctorAppointments = async (req, res) => {
    try {
        const userId = req.user.id || req.user._id;
        const doctorProfile = await Doctor.findOne({ userId: userId });
        
        if (!doctorProfile) return res.status(404).json({ message: 'Doctor profile nahi mili. Pehle profile banayein.' });

        let appointments = await Appointment.find({ doctorId: doctorProfile._id }).populate('patientId', 'name email');
        
        if (appointments.length === 0) {
            const fallbackAppointments = await Appointment.find({ doctorId: userId }).populate('patientId', 'name email');
            if (fallbackAppointments.length > 0) appointments = fallbackAppointments;
        }
        
        res.status(200).json(appointments);
    } catch (error) {
        console.error("Error fetching doctor appointments: ", error.message);
        res.status(500).json({ message: 'Server Error' });
    }
};

exports.completeAppointment = async (req, res) => {
    try {
        const appointmentId = req.params.id;
        const { prescription } = req.body; 
        const userId = req.user.id || req.user._id;

        const appointment = await Appointment.findById(appointmentId);

        if (!appointment) return res.status(404).json({ message: 'Appointment nahi mili!' });

        const doctorProfile = await Doctor.findOne({ userId: userId });
        const isMatch = appointment.doctorId.toString() === doctorProfile._id.toString() || 
                        appointment.doctorId.toString() === userId.toString();

        if (!isMatch) return res.status(401).json({ message: 'Aap is appointment ko update nahi kar sakte.' });

        appointment.status = 'Completed';
        
        // --- NAYA FIX: String (Text) ko Model Object me convert karna ---
        if (prescription) {
            appointment.prescription = {
                medicines: [], // Manual parchi me medicines array khali rakhenge
                notes: prescription, // Type kiya hua text notes me jayega
                issuedAt: new Date()
            };
        }
        
        if (req.file) {
            appointment.prescriptionFile = `/uploads/${req.file.filename}`;
        }
        // ----------------------------------------------------------------

        await appointment.save();
        res.status(200).json({ message: 'Appointment marked as completed aur E-Parchi save ho gayi!' });

    } catch (error) {
        console.error("Error updating status: ", error.message);
        res.status(500).json({ message: 'Server Error' });
    }
};

exports.updateAppointmentStatus = async (req, res) => {
    try {
        const appointmentId = req.params.id;
        const { status } = req.body; 

        const appointment = await Appointment.findById(appointmentId);
        if (!appointment) return res.status(404).json({ message: 'Appointment nahi mili!' });

        appointment.status = status;
        await appointment.save();

        res.status(200).json({ message: 'Status successfully updated!' });
    } catch (error) {
        console.error("Status Update Error: ", error.message);
        res.status(500).json({ message: 'Server Error' });
    }
};