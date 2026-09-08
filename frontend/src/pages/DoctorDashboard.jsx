import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function DoctorDashboard() {
  const [doctor, setDoctor] = useState(null);
  const [appointments, setAppointments] = useState([]);
  
  // --- Profile & History States ---
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [selectedPatientHistory, setSelectedPatientHistory] = useState([]);
  const [isHistoryLoading, setIsHistoryLoading] = useState(false);
  const [currentPatientName, setCurrentPatientName] = useState("");

  const [showProfileModal, setShowProfileModal] = useState(false);
  const [profileData, setProfileData] = useState({
    specialty: '',
    experience: '',
    consultationFee: '',
    clinicAddress: ''
  });

  // --- DUAL PRESCRIPTION MODAL STATES ---
  const [showPrescriptionModal, setShowPrescriptionModal] = useState(false);
  const [selectedAppointmentId, setSelectedAppointmentId] = useState(null);
  const [currentPatientObj, setCurrentPatientObj] = useState(null);
  
  // Tab State: 'smart' or 'manual'
  const [prescriptionMode, setPrescriptionMode] = useState('smart');

  // Smart Mode States
  const [medicines, setMedicines] = useState([
    { name: '', dosage: '', duration: '' }
  ]);
  const [prescriptionNotes, setPrescriptionNotes] = useState('');
  
  // Manual Mode States
  const [prescriptionText, setPrescriptionText] = useState('');
  const [prescriptionFile, setPrescriptionFile] = useState(null);

  const navigate = useNavigate();
  const [currentDate, setCurrentDate] = useState('');

  // ==========================================================
  // --- NAYA: 10 MINUTE AUTO-LOGOUT LOGIC ---
  // ==========================================================
  useEffect(() => {
    let timeoutId;

    const logoutUser = () => {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      alert('Session expired due to inactivity. Please login again.');
      navigate('/login');
    };

    const resetTimer = () => {
      clearTimeout(timeoutId);
      // 10 minutes = 10 * 60 * 1000 = 600000 milliseconds
      timeoutId = setTimeout(logoutUser, 600000); 
    };

    // User ki har harkat (activity) par nazar rakhna
    const events = ['mousemove', 'keydown', 'click', 'scroll', 'touchstart'];
    events.forEach(event => window.addEventListener(event, resetTimer));

    // Pehli baar timer start karna
    resetTimer();

    // Jab component close ho toh events hatana (Cleanup)
    return () => {
      clearTimeout(timeoutId);
      events.forEach(event => window.removeEventListener(event, resetTimer));
    };
  }, [navigate]);

  // --- Initialization & Fetch Data ---
  useEffect(() => {
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    setCurrentDate(new Date().toLocaleDateString('en-US', options));

    const checkAuthAndFetchData = async () => {
      const token = localStorage.getItem('token');
      const storedUser = localStorage.getItem('user');

      if (!token || !storedUser) {
        navigate('/login');
        return;
      }

      const parsedDoctor = JSON.parse(storedUser);
      if (parsedDoctor.role !== 'doctor') {
        alert("Sirf Doctors is page ko access kar sakte hain!");
        navigate('/dashboard');
        return;
      }
      
      setDoctor(parsedDoctor);

      // Fetch Profile
      try {
        const profileRes = await fetch('http://localhost:5000/api/doctor/me', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (profileRes.ok) {
          const dbProfile = await profileRes.json();
          if (dbProfile && dbProfile.specialty) {
            const mergedDoctor = { ...parsedDoctor, ...dbProfile };
            setDoctor(mergedDoctor);
            setProfileData({
              specialty: dbProfile.specialty || '',
              experience: dbProfile.experience || '',
              consultationFee: dbProfile.consultationFee || '',
              clinicAddress: dbProfile.clinicAddress || ''
            });
            localStorage.setItem('user', JSON.stringify(mergedDoctor));
          }
        }
      } catch (error) {
        console.error("Profile fetch error:", error);
      }

      // Fetch Appointments
      try {
        const response = await fetch('http://localhost:5000/api/appointment/doctor-appointments', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (response.ok) {
          const data = await response.json();
          setAppointments(data);
        }
      } catch (error) {
        console.error('Appointments fetch error:', error);
      }
    };
    
    checkAuthAndFetchData();
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const handleStatusChange = async (appointmentId, newStatus) => {
    const token = localStorage.getItem('token');
    try {
      const response = await fetch(`http://localhost:5000/api/appointment/update-status/${appointmentId}`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify({ status: newStatus })
      });
      
      if (response.ok) {
        window.location.reload();
      } else {
        alert("Status update fail ho gaya!");
      }
    } catch (error) {
      console.error("Error updating status:", error);
    }
  };

  // --- Profile Functions ---
  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    try {
      const response = await fetch('http://localhost:5000/api/doctor/update-profile', {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify(profileData)
      });
      
      const textData = await response.text();
      let data;
      try { 
        data = JSON.parse(textData); 
      } catch (err) { 
        alert(`Backend Error: ${textData.substring(0, 100)}`);
        return; 
      }

      if (response.ok) {
        alert("Profile Successfully Updated!");
        const updatedDoctor = { ...doctor, ...profileData };
        localStorage.setItem('user', JSON.stringify(updatedDoctor));
        setDoctor(updatedDoctor);
        setShowProfileModal(false);
      } else {
        alert(data.message || "Profile update fail ho gaya.");
      }
    } catch (error) {
      alert("Server error. Please ensure backend is running.");
    }
  };

  const handleProfileChange = (e) => {
    setProfileData({ ...profileData, [e.target.name]: e.target.value });
  };

  // --- Patient History Functions ---
  const fetchPatientHistory = async (patientId, patientName) => {
    if (!patientId) {
      alert("Patient ID missing hai. Kripya page refresh karein.");
      return;
    }
    
    setIsHistoryLoading(true);
    setCurrentPatientName(patientName);
    setShowHistoryModal(true);
    
    const token = localStorage.getItem('token');
    try {
      const response = await fetch(`http://localhost:5000/api/health-records/my-history/${patientId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setSelectedPatientHistory(data.data || []);
      } else {
        setSelectedPatientHistory([]);
      }
    } catch (error) {
      setSelectedPatientHistory([]);
    } finally {
      setIsHistoryLoading(false);
    }
  };

  const closeHistoryModal = () => {
    setShowHistoryModal(false);
    setSelectedPatientHistory([]);
    setCurrentPatientName("");
  };

  // --- PRESCRIPTION FUNCTIONS ---
  const openPrescriptionModal = (appt) => {
    setSelectedAppointmentId(appt._id);
    setCurrentPatientObj(appt.patientId);
    
    // Reset all states
    setPrescriptionMode('smart');
    setMedicines([{ name: '', dosage: '', duration: '' }]);
    setPrescriptionNotes('');
    setPrescriptionText(''); 
    setPrescriptionFile(null);
    
    setShowPrescriptionModal(true);
  };

  const handleAddMedicineRow = () => {
    setMedicines([...medicines, { name: '', dosage: '', duration: '' }]);
  };

  const handleMedicineChange = (index, field, value) => {
    const updated = [...medicines];
    updated[index][field] = value;
    setMedicines(updated);
  };

  const handleRemoveMedicineRow = (index) => {
    if (medicines.length === 1) return;
    setMedicines(medicines.filter((_, i) => i !== index));
  };

  const generatePrescriptionPDF = () => {
    const printWindow = window.open('', '_blank');
    const docDate = new Date().toLocaleDateString('en-IN');
    
    const medsHtml = medicines.map((m, idx) => `
      <tr>
        <td style="padding: 10px; border-bottom: 1px solid #e2e8f0; text-align: center;">${idx + 1}</td>
        <td style="padding: 10px; border-bottom: 1px solid #e2e8f0; font-weight: bold;">${m.name || '-'}</td>
        <td style="padding: 10px; border-bottom: 1px solid #e2e8f0;">${m.dosage || '-'}</td>
        <td style="padding: 10px; border-bottom: 1px solid #e2e8f0;">${m.duration || '-'}</td>
      </tr>
    `).join('');

    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>E-Prescription - Dr. ${doctor.name}</title>
          <style>
            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; color: #1e293b; margin: 0; padding: 40px; }
            .header { display: flex; justify-content: space-between; border-bottom: 2px solid #0f766e; padding-bottom: 20px; margin-bottom: 30px; }
            .clinic-info h1 { margin: 0; color: #0f766e; font-size: 26px; }
            .clinic-info p { margin: 4px 0; color: #64748b; font-size: 14px; }
            .doctor-info { text-align: right; }
            .doctor-info h2 { margin: 0; font-size: 20px; }
            .doctor-info p { margin: 4px 0; color: #64748b; font-size: 13px; }
            .patient-box { background: #f8fafc; border: 1px solid #e2e8f0; padding: 15px 20px; border-radius: 8px; margin-bottom: 30px; display: flex; justify-content: space-between; }
            .patient-box div p { margin: 4px 0; font-size: 14px; }
            table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
            th { background: #0f766e; color: white; text-align: left; padding: 12px 10px; font-size: 13px; text-transform: uppercase; }
            .notes-box { background: #fffbeb; border-left: 4px solid #f59e0b; padding: 15px; margin-bottom: 40px; font-size: 14px; border-radius: 4px; }
            .footer { display: flex; justify-content: space-between; align-items: flex-end; margin-top: 60px; border-top: 1px solid #e2e8f0; padding-top: 20px; }
            .signature { text-align: right; font-weight: bold; color: #0f766e; }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="clinic-info">
              <h1>🏥 NEURALITE CLINIC</h1>
              <p>${doctor.clinicAddress || 'Advanced Healthcare Centre'}</p>
              <p>Ph: +91 98765 43210</p>
            </div>
            <div class="doctor-info">
              <h2>Dr. ${doctor.name}</h2>
              <p><strong>${doctor.specialty || 'General Physician'}</strong></p>
            </div>
          </div>
          <div class="patient-box">
            <div><p><strong>Patient Name:</strong> ${currentPatientObj?.name || 'Valued Patient'}</p></div>
            <div style="text-align: right;"><p><strong>Date:</strong> ${docDate}</p></div>
          </div>
          <h3 style="color: #0f766e; margin-bottom: 10px; text-transform: uppercase; font-size: 14px;">Rx (Medicines)</h3>
          <table>
            <thead>
              <tr>
                <th style="width:10%; text-align:center;">#</th>
                <th style="width:45%;">Medicine Name</th>
                <th style="width:25%;">Dosage</th>
                <th style="width:20%;">Duration</th>
              </tr>
            </thead>
            <tbody>
              ${medsHtml}
            </tbody>
          </table>
          ${prescriptionNotes ? `<div class="notes-box"><strong>Doctor's Advice:</strong><br/>${prescriptionNotes}</div>` : ''}
          <div class="footer">
            <p style="font-size: 12px; color: #94a3b8;">Computer-generated prescription powered by Neuralite.</p>
            <div class="signature"><p>Dr. ${doctor.name}</p></div>
          </div>
          <script>window.onload = function() { window.print(); }</script>
        </body>
      </html>
    `;
    printWindow.document.write(htmlContent);
    printWindow.document.close();
  };

  const handleSmartSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    try {
      const response = await fetch(`http://localhost:5000/api/appointment/add-prescription/${selectedAppointmentId}`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify({ medicines, notes: prescriptionNotes })
      });
      if (response.ok) {
        alert("E-Prescription saved aur Appointment complete ho gayi! ✅");
        window.location.reload(); 
      } else {
        alert("Failed to save prescription.");
      }
    } catch (error) {
      alert("Server error.");
    }
  };

  const handleManualSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    const formData = new FormData();
    
    // Fallback: If text is empty, send a space to avoid validation crash
    formData.append('prescription', prescriptionText || ' ');
    if (prescriptionFile) {
      formData.append('prescriptionFile', prescriptionFile);
    }

    try {
      const response = await fetch(`http://localhost:5000/api/appointment/complete/${selectedAppointmentId}`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData 
      });
      if (response.ok) {
        alert("Manual Parchi saved aur Appointment complete ho gayi! ✅");
        window.location.reload(); 
      } else {
        alert("Failed to complete appointment.");
      }
    } catch (error) {
      alert("Server error. Check your backend.");
    }
  };

  if (!doctor) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center text-indigo-600 dark:text-indigo-400">
        <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="font-bold tracking-widest text-sm uppercase">Loading Workspace...</p>
      </div>
    );
  }

  const pendingCount = appointments.filter(a => a.status === 'Pending').length;
  const confirmedCount = appointments.filter(a => a.status === 'Confirmed').length;
  const completedCount = appointments.filter(a => a.status === 'Completed').length;

  return (
    <div className="min-h-screen bg-[#fafafa] dark:bg-[#030712] transition-colors duration-500 font-sans text-slate-900 dark:text-slate-100 pt-24 pb-20 relative">
      
      {/* Background Ambience */}
      <div className="absolute top-0 left-[50%] -translate-x-1/2 w-[800px] h-[400px] bg-gradient-to-b from-indigo-500/10 to-transparent dark:from-indigo-600/10 rounded-full blur-[120px] pointer-events-none z-0"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* HEADER SECTION */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10">
          <div>
            <p className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-widest mb-1.5">
              Doctor Workspace
            </p>
            <h1 className="text-3xl md:text-5xl font-black tracking-tight">
              Welcome, Dr. {doctor.name.split(' ')[0]} 🩺
            </h1>
          </div>
          <div className="flex flex-wrap items-center gap-3 mt-4 md:mt-0">
            <span className="text-sm font-semibold text-slate-500 dark:text-slate-400 bg-white dark:bg-slate-900 px-4 py-2 rounded-full ring-1 ring-slate-200 dark:ring-slate-800 shadow-sm hidden md:block">
               {currentDate}
            </span>
            <button 
              onClick={() => setShowProfileModal(true)} 
              className="text-sm font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-900/20 dark:hover:bg-indigo-900/40 px-5 py-2 rounded-full transition-colors ring-1 ring-indigo-100 dark:ring-indigo-900/50"
            >
              Update Profile
            </button>
            <button 
              onClick={handleLogout}
              className="text-sm font-bold text-red-600 dark:text-red-400 bg-red-50 hover:bg-red-100 dark:bg-red-900/20 dark:hover:bg-red-900/40 px-5 py-2 rounded-full transition-colors ring-1 ring-red-100 dark:ring-red-900/50"
            >
              Logout
            </button>
          </div>
        </div>

        {/* PROFILE INFO STRIP */}
        {doctor.specialty && (
          <div className="mb-10 flex flex-wrap gap-4 items-center bg-white dark:bg-slate-900/60 p-4 rounded-2xl ring-1 ring-slate-200 dark:ring-slate-800 shadow-sm">
            <div className="flex items-center gap-2 px-3 py-1 bg-slate-50 dark:bg-slate-800 rounded-lg">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Specialty</span>
              <span className="text-sm font-bold text-slate-800 dark:text-slate-200">{doctor.specialty}</span>
            </div>
            <div className="flex items-center gap-2 px-3 py-1 bg-slate-50 dark:bg-slate-800 rounded-lg">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Experience</span>
              <span className="text-sm font-bold text-slate-800 dark:text-slate-200">{doctor.experience} Years</span>
            </div>
            <div className="flex items-center gap-2 px-3 py-1 bg-slate-50 dark:bg-slate-800 rounded-lg">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Fee</span>
              <span className="text-sm font-bold text-slate-800 dark:text-slate-200">₹{doctor.consultationFee}</span>
            </div>
          </div>
        )}

        {/* OVERVIEW STAT CARDS */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
          <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl ring-1 ring-slate-200 dark:ring-slate-800 shadow-sm flex flex-col justify-center transition-transform hover:-translate-y-1">
            <p className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-1">Total Appointments</p>
            <h4 className="text-3xl font-black text-slate-900 dark:text-white">{appointments.length}</h4>
          </div>
          <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl ring-1 ring-slate-200 dark:ring-slate-800 shadow-sm flex flex-col justify-center transition-transform hover:-translate-y-1">
            <p className="text-[10px] font-bold text-amber-500 dark:text-amber-400 uppercase tracking-widest mb-1">Pending Requests</p>
            <h4 className="text-3xl font-black text-amber-600 dark:text-amber-500">{pendingCount}</h4>
          </div>
          <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl ring-1 ring-slate-200 dark:ring-slate-800 shadow-sm flex flex-col justify-center transition-transform hover:-translate-y-1">
            <p className="text-[10px] font-bold text-cyan-500 dark:text-cyan-400 uppercase tracking-widest mb-1">Upcoming (Confirmed)</p>
            <h4 className="text-3xl font-black text-cyan-600 dark:text-cyan-500">{confirmedCount}</h4>
          </div>
          <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl ring-1 ring-slate-200 dark:ring-slate-800 shadow-sm flex flex-col justify-center transition-transform hover:-translate-y-1">
            <p className="text-[10px] font-bold text-emerald-500 dark:text-emerald-400 uppercase tracking-widest mb-1">Completed</p>
            <h4 className="text-3xl font-black text-emerald-600 dark:text-emerald-500">{completedCount}</h4>
          </div>
        </div>

        {/* APPOINTMENTS LIST */}
        <div className="mb-14">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-5">Patient Appointments</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {appointments.length > 0 ? (
              appointments.map((appt) => (
                <div key={appt._id} className="bg-white dark:bg-slate-900 p-6 rounded-3xl ring-1 ring-slate-200 dark:ring-slate-800 shadow-sm hover:shadow-md transition flex flex-col relative overflow-hidden">
                  
                  <div className={`absolute top-0 left-0 w-1.5 h-full ${
                    appt.status === 'Pending' ? 'bg-amber-500' :
                    appt.status === 'Confirmed' ? 'bg-cyan-500' : 
                    appt.status === 'Completed' ? 'bg-emerald-500' : 'bg-red-500'
                  }`}></div>
                  
                  <div className="flex justify-between items-start mb-4 pl-2">
                    <div className="min-w-0 pr-2">
                      <h4 className="font-bold text-lg text-slate-900 dark:text-white leading-tight truncate">
                        {appt.patientId?.name || 'Unknown Patient'}
                      </h4>
                      <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mt-0.5 truncate">
                        {appt.patientId?.email || 'No email provided'}
                      </p>
                    </div>
                    <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider shrink-0 ${
                      appt.status === 'Pending' ? 'bg-amber-50 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400 ring-1 ring-amber-200 dark:ring-amber-800/50' : 
                      appt.status === 'Confirmed' ? 'bg-cyan-50 text-cyan-700 dark:bg-cyan-900/20 dark:text-cyan-400 ring-1 ring-cyan-200 dark:ring-cyan-800/50' : 
                      appt.status === 'Completed' ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400 ring-1 ring-emerald-200 dark:ring-emerald-800/50' : 
                      'bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400 ring-1 ring-red-200 dark:ring-red-800/50'
                    }`}>
                      {appt.status}
                    </span>
                  </div>

                  <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-3 flex justify-between items-center mb-4 ring-1 ring-slate-100 dark:ring-slate-700/50">
                    <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">Date</p>
                      <p className="text-sm font-bold text-slate-700 dark:text-slate-200">{new Date(appt.appointmentDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">Time</p>
                      <p className="text-sm font-bold text-slate-700 dark:text-slate-200">{appt.timeSlot}</p>
                    </div>
                  </div>

                  <div className="mb-5">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Symptoms / Notes</p>
                    <div className="p-3 bg-slate-50 dark:bg-[#0b1221] rounded-xl text-sm font-medium text-slate-700 dark:text-slate-300 ring-1 ring-slate-100 dark:ring-slate-800/50 line-clamp-2">
                      {appt.symptoms || "No specific symptoms provided."}
                    </div>
                  </div>

                  <div className="mt-auto space-y-2">
                    <button 
                      onClick={() => fetchPatientHistory(appt.patientId?._id, appt.patientId?.name)}
                      className="w-full bg-purple-50 hover:bg-purple-100 dark:bg-purple-900/20 dark:hover:bg-purple-900/40 text-purple-700 dark:text-purple-400 font-bold py-2.5 rounded-xl transition-colors ring-1 ring-purple-200 dark:ring-purple-800/50 text-xs flex items-center justify-center gap-1.5"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                      View AI Pre-Diagnosis
                    </button>
                    
                    {/* --- NAYA: START VIDEO CALL BUTTON --- */}
                    {appt.status === 'Confirmed' && (
                      <button 
                        onClick={() => navigate(`/room/${appt._id}`)} 
                        className="w-full mb-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold py-2.5 rounded-xl transition shadow-sm flex items-center justify-center gap-1.5"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                        Start Video Call
                      </button>
                    )}

                    <div className="flex gap-2">
                      {appt.status === 'Pending' && (
                        <button onClick={() => handleStatusChange(appt._id, 'Confirmed')} className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold py-2.5 rounded-xl transition shadow-sm">
                          Accept
                        </button>
                      )}
                      
                      {appt.status === 'Confirmed' && (
                        <button onClick={() => openPrescriptionModal(appt)} className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold py-2.5 rounded-xl transition shadow-sm">
                          Write E-Prescription
                        </button>
                      )}

                      {(appt.status === 'Pending' || appt.status === 'Confirmed') && (
                        <button onClick={() => handleStatusChange(appt._id, 'Cancelled')} className="flex-1 bg-white dark:bg-slate-800 ring-1 ring-red-200 dark:ring-red-900/50 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-slate-700 text-xs font-bold py-2.5 rounded-xl transition-colors">
                          Cancel
                        </button>
                      )}
                    </div>
                  </div>

                </div>
              ))
            ) : (
              <div className="col-span-full bg-white dark:bg-slate-900 p-10 rounded-3xl ring-1 ring-slate-200 dark:ring-slate-800 text-center">
                <p className="text-slate-500 dark:text-slate-400 font-medium">You have no appointments currently.</p>
              </div>
            )}
          </div>
        </div>

      </div>

      {/* --- MODALS SECTION --- */}
      
      {/* UPDATE PROFILE MODAL */}
      {showProfileModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl shadow-2xl w-full max-w-lg border border-slate-200 dark:border-slate-800">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-black text-slate-900 dark:text-white">Update Profile</h3>
              <button onClick={() => setShowProfileModal(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-white p-1">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            
            <form onSubmit={handleProfileUpdate} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-widest mb-1.5">Specialty</label>
                  <input type="text" name="specialty" value={profileData.specialty} onChange={handleProfileChange} className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border-none ring-1 ring-slate-200 dark:ring-slate-700 focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-white outline-none" required placeholder="e.g. Cardiologist" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-widest mb-1.5">Experience (Yrs)</label>
                  <input type="number" name="experience" value={profileData.experience} onChange={handleProfileChange} className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border-none ring-1 ring-slate-200 dark:ring-slate-700 focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-white outline-none" required placeholder="e.g. 10" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-widest mb-1.5">Consultation Fee (₹)</label>
                <input type="number" name="consultationFee" value={profileData.consultationFee} onChange={handleProfileChange} className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border-none ring-1 ring-slate-200 dark:ring-slate-700 focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-white outline-none" required placeholder="e.g. 500" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-widest mb-1.5">Clinic Address</label>
                <textarea name="clinicAddress" value={profileData.clinicAddress} onChange={handleProfileChange} className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border-none ring-1 ring-slate-200 dark:ring-slate-700 focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-white outline-none" rows="2" required placeholder="Full clinic address..."></textarea>
              </div>
              <div className="flex gap-3 mt-8">
                <button type="button" onClick={() => setShowProfileModal(false)} className="flex-1 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold py-3 rounded-xl transition">Cancel</button>
                <button type="submit" className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-xl shadow-md transition">Save Details</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* AI HISTORY MODAL */}
      {showHistoryModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl shadow-2xl w-full max-w-2xl border border-slate-200 dark:border-slate-800 max-h-[85vh] overflow-hidden flex flex-col">
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-2xl font-black text-slate-900 dark:text-white">AI Pre-Diagnosis Report</h3>
              <button onClick={closeHistoryModal} className="text-slate-400 hover:text-slate-600 dark:hover:text-white p-1">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <p className="text-sm text-slate-500 dark:text-slate-400 font-medium mb-6 pb-4 border-b border-slate-100 dark:border-slate-800">
              Patient: <strong className="text-slate-900 dark:text-white">{currentPatientName || "Unknown"}</strong>
            </p>

            <div className="flex-1 overflow-y-auto pr-2 space-y-4">
              {isHistoryLoading ? (
                <div className="text-center py-10">
                  <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                  <p className="text-slate-500 font-medium">Fetching AI Records...</p>
                </div>
              ) : selectedPatientHistory.length > 0 ? (
                selectedPatientHistory.map((record) => (
                  <div key={record._id} className="bg-slate-50 dark:bg-[#0b1221] p-5 rounded-2xl ring-1 ring-slate-200 dark:ring-slate-800/50">
                    <div className="flex justify-between items-start mb-3">
                      <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider ${record.recordType === 'ML Risk Prediction' ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400' : 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-400'}`}>
                        {record.recordType}
                      </span>
                      <span className="text-xs text-slate-500 font-bold uppercase tracking-widest">{new Date(record.createdAt).toLocaleDateString('en-IN')}</span>
                    </div>
                    
                    {record.recordType === 'ML Risk Prediction' && record.resultData?.prediction && (
                      <div className="mt-2">
                        <p className={`text-sm font-black mb-1 ${record.resultData.prediction.risk_level === 'High Risk' ? 'text-red-600 dark:text-red-400' : 'text-emerald-600 dark:text-emerald-400'}`}>
                          {record.resultData.prediction.risk_level} ({record.resultData.prediction.risk_probability}%)
                        </p>
                        <p className="text-sm text-slate-700 dark:text-slate-300 font-medium leading-relaxed">{record.resultData.prediction.message}</p>
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <div className="text-center py-12 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-700">
                  <p className="text-slate-500 dark:text-slate-400 font-medium">No AI test or scan records found for this patient.</p>
                </div>
              )}
            </div>
            
            <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800">
              <button onClick={closeHistoryModal} className="w-full bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold py-3 rounded-xl transition text-sm">Close Report</button>
            </div>
          </div>
        </div>
      )}

      {/* DUAL PRESCRIPTION MODAL (Smart + Manual) */}
      {showPrescriptionModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 p-6 md:p-8 rounded-3xl shadow-2xl w-full max-w-2xl border border-slate-200 dark:border-slate-800 max-h-[90vh] overflow-y-auto">
            
            <div className="flex justify-between items-center mb-6">
              <div>
                <h3 className="text-2xl font-black text-emerald-600 dark:text-emerald-400">Write Prescription</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Patient: <strong>{currentPatientObj?.name}</strong></p>
              </div>
              <button onClick={() => setShowPrescriptionModal(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-white p-1 transition-colors">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>

            {/* TABS TOGGLE */}
            <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl mb-6">
              <button 
                onClick={() => setPrescriptionMode('smart')} 
                className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${prescriptionMode === 'smart' ? 'bg-white dark:bg-slate-700 text-emerald-600 dark:text-emerald-400 shadow-sm' : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'}`}
              >
                Smart E-Parchi
              </button>
              <button 
                onClick={() => setPrescriptionMode('manual')} 
                className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${prescriptionMode === 'manual' ? 'bg-white dark:bg-slate-700 text-emerald-600 dark:text-emerald-400 shadow-sm' : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'}`}
              >
                Manual & Upload
              </button>
            </div>
            
            {/* TAB 1: SMART E-PRESCRIPTION */}
            {prescriptionMode === 'smart' && (
              <form onSubmit={handleSmartSubmit} className="space-y-6">
                <div>
                  <div className="flex justify-between items-center mb-3">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-widest">Medicines (Rx)</label>
                    <button type="button" onClick={handleAddMedicineRow} className="px-3 py-1.5 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 rounded-lg text-xs font-bold ring-1 ring-emerald-200 dark:ring-emerald-800/50 transition-colors hover:bg-emerald-100 dark:hover:bg-emerald-900/40">
                      + Add
                    </button>
                  </div>
                  <div className="space-y-3">
                    {medicines.map((med, index) => (
                      <div key={index} className="flex flex-col sm:flex-row gap-2 items-start sm:items-center bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl ring-1 ring-slate-200 dark:ring-slate-700/50">
                        <span className="text-xs font-bold text-slate-400 w-6 text-center shrink-0 hidden sm:block">{index + 1}.</span>
                        <input 
                          type="text" 
                          placeholder="Medicine (e.g. Omee)" 
                          value={med.name} 
                          onChange={(e) => handleMedicineChange(index, 'name', e.target.value)} 
                          className="w-full sm:flex-[2] px-3 py-2 bg-white dark:bg-slate-800 rounded-lg text-sm font-medium border-none outline-none ring-1 ring-slate-200 dark:ring-slate-700 text-slate-900 dark:text-white" 
                          required={true}
                        />
                        <input 
                          type="text" 
                          placeholder="Dosage (1-0-1)" 
                          value={med.dosage} 
                          onChange={(e) => handleMedicineChange(index, 'dosage', e.target.value)} 
                          className="w-full sm:flex-1 px-3 py-2 bg-white dark:bg-slate-800 rounded-lg text-sm font-medium border-none outline-none ring-1 ring-slate-200 dark:ring-slate-700 text-slate-900 dark:text-white" 
                          required={false}
                        />
                        <input 
                          type="text" 
                          placeholder="Duration (5 Days)" 
                          value={med.duration} 
                          onChange={(e) => handleMedicineChange(index, 'duration', e.target.value)} 
                          className="w-full sm:flex-1 px-3 py-2 bg-white dark:bg-slate-800 rounded-lg text-sm font-medium border-none outline-none ring-1 ring-slate-200 dark:ring-slate-700 text-slate-900 dark:text-white" 
                          required={false}
                        />
                        {medicines.length > 1 && (
                          <button type="button" onClick={() => handleRemoveMedicineRow(index)} className="p-2 w-full sm:w-auto text-center sm:text-left text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors mt-2 sm:mt-0">
                            <svg className="w-5 h-5 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-widest mb-2">Doctor's Advice & Notes</label>
                  <textarea value={prescriptionNotes} onChange={(e) => setPrescriptionNotes(e.target.value)} className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 ring-1 ring-slate-200 dark:ring-slate-700 text-slate-900 dark:text-white outline-none text-sm border-none" rows="3" placeholder="Drink warm water..."></textarea>
                </div>
                <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                  <button type="button" onClick={generatePrescriptionPDF} className="flex-1 bg-cyan-600 hover:bg-cyan-700 text-white font-bold py-3 rounded-xl shadow-md text-sm transition">
                    Preview PDF
                  </button>
                  <button type="submit" className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 rounded-xl shadow-md text-sm transition">
                    Save Smart Parchi
                  </button>
                </div>
              </form>
            )}

            {/* TAB 2: MANUAL UPLOAD / TYPE */}
            {prescriptionMode === 'manual' && (
              <form onSubmit={handleManualSubmit} className="space-y-5">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-widest mb-2">Manual Prescription Text</label>
                  <textarea value={prescriptionText} onChange={(e) => setPrescriptionText(e.target.value)} className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 ring-1 ring-slate-200 dark:ring-slate-700 text-slate-900 dark:text-white outline-none text-sm border-none" rows="4" placeholder="Type medicines here manually..."></textarea>
                </div>
                <div className="mt-2 p-5 border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-2xl bg-slate-50 dark:bg-slate-800/50 text-center">
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-widest mb-3 cursor-pointer">Or Upload Handwritten Parchi 📸</label>
                  <input type="file" accept="image/*,.pdf" onChange={(e) => setPrescriptionFile(e.target.files[0])} className="w-full text-xs text-slate-500 dark:text-slate-400 file:mr-4 file:py-2.5 file:px-5 file:rounded-full file:border-0 file:text-xs file:font-bold file:bg-emerald-50 file:text-emerald-700 dark:file:bg-emerald-900/30 dark:file:text-emerald-400 hover:file:bg-emerald-100 transition-colors cursor-pointer" />
                </div>
                <div className="flex gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                  <button type="button" onClick={() => setShowPrescriptionModal(false)} className="flex-1 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold py-3 rounded-xl text-sm transition">Cancel</button>
                  <button type="submit" className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 rounded-xl shadow-md text-sm transition">Save Manual Parchi</button>
                </div>
              </form>
            )}
            
          </div>
        </div>
      )}

    </div>
  );
}