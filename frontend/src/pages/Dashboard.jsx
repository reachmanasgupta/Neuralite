import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom'; 
import { useTranslation } from 'react-i18next';

import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';

const loadRazorpay = () => {
  return new Promise((resolve) => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

export default function Dashboard() {
  const { t } = useTranslation(); 
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  // Basic States
  const [doctors, setDoctors] = useState([]); 
  const [myAppointments, setMyAppointments] = useState([]); 
  const [healthRecords, setHealthRecords] = useState([]);
  const [currentDate, setCurrentDate] = useState('');

  // Booking States
  const [showModal, setShowModal] = useState(false);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [selectedDateTime, setSelectedDateTime] = useState(null);
  const [isBooking, setIsBooking] = useState(false);
  const [paymentMode, setPaymentMode] = useState('Online'); 
  const [isOrdering, setIsOrdering] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [specialtyFilter, setSpecialtyFilter] = useState('');
  const [viewPrescriptionData, setViewPrescriptionData] = useState(null);
  const [recommendedSpecialty, setRecommendedSpecialty] = useState(null); 

  // Parchi Scanner States
  const [showParchiModal, setShowParchiModal] = useState(false);
  const [selectedParchi, setSelectedParchi] = useState(null);
  const [parchiResult, setParchiResult] = useState(null);
  const [isParchiLoading, setIsParchiLoading] = useState(false);
  const parchiInputRef = useRef(null);

  // Chat AI States
  const [showChatModal, setShowChatModal] = useState(false);
  const [chatMessages, setChatMessages] = useState([
    { role: 'bot', text: 'Hello! I am Neuralite AI, your Smart Health Assistant. You can describe your symptoms, and I will guide you.' }
  ]);
  const [chatInput, setChatInput] = useState('');
  const [isChatLoading, setIsChatLoading] = useState(false);
  const chatEndRef = useRef(null);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const speechSynthRef = useRef(null);

  // Risk Predictor States
  const [showRiskModal, setShowRiskModal] = useState(false);
  const [riskData, setRiskData] = useState({ age: '', bmi: '', glucose: '', bp: '' });
  const [riskResult, setRiskResult] = useState(null);
  const [isRiskLoading, setIsRiskLoading] = useState(false);

  // X-Ray Scanner States
  const [showXrayModal, setShowXrayModal] = useState(false);
  const [selectedXray, setSelectedXray] = useState(null);
  const [xrayResult, setXrayResult] = useState(null);
  const [isXrayLoading, setIsXrayLoading] = useState(false);
  const xrayInputRef = useRef(null);

  // Wellness Coach States
  const [showWellnessModal, setShowWellnessModal] = useState(false);
  const [wellnessInput, setWellnessInput] = useState('');
  const [wellnessResult, setWellnessResult] = useState(null);
  const [isWellnessLoading, setIsWellnessLoading] = useState(false);

  // Mental Health (Stress) States
  const [showStressModal, setShowStressModal] = useState(false);
  const [stressAnswers, setStressAnswers] = useState({ q1: '', q2: '', q3: '', q4: '', q5: '' });
  const [stressResult, setStressResult] = useState(null);
  const [isStressLoading, setIsStressLoading] = useState(false);

  // Skin Analyzer States
  const [showSkinModal, setShowSkinModal] = useState(false);
  const [selectedSkinImage, setSelectedSkinImage] = useState(null);
  const [skinResult, setSkinResult] = useState(null);
  const [isSkinLoading, setIsSkinLoading] = useState(false);
  const skinInputRef = useRef(null);

  // Lab Report Analyzer States
  const [showLabModal, setShowLabModal] = useState(false);
  const [selectedLabImage, setSelectedLabImage] = useState(null);
  const [labResult, setLabResult] = useState(null);
  const [isLabLoading, setIsLabLoading] = useState(false);
  const labInputRef = useRef(null);

  // Food Scanner States
  const [showFoodModal, setShowFoodModal] = useState(false);
  const [selectedFoodImage, setSelectedFoodImage] = useState(null);
  const [foodResult, setFoodResult] = useState(null);
  const [isFoodLoading, setIsFoodLoading] = useState(false);
  const foodInputRef = useRef(null);

  // Helpers
  const getFileUrl = (url) => {
    if (!url) return null;
    if (url.startsWith('http') || url.startsWith('data:')) return url;
    const cleanUrl = url.replace(/\\/g, '/').replace(/^\//, '');
    return `http://localhost:5000/${cleanUrl}`;
  };

  const isFilePath = (str) => {
    if(!str || typeof str !== 'string') return false;
    const lowerStr = str.toLowerCase();
    return lowerStr.startsWith('http') || lowerStr.startsWith('data:') || lowerStr.includes('uploads/') || lowerStr.includes('uploads\\') || /\.(jpg|jpeg|png|pdf|gif)$/i.test(lowerStr);
  };

  // ==========================================================
  // --- UNIVERSAL AI TEXT FORMATTER (CRASH PROTECTOR) ---
  // ==========================================================
  const formatAIText = (data) => {
    if (!data) return null;
    if (typeof data === 'object' && !Array.isArray(data)) {
      return (
        <ul className="space-y-3">
          {Object.entries(data).map(([key, val], idx) => (
            <li key={idx} className="flex flex-col sm:flex-row sm:items-start gap-2 border-b border-slate-100 pb-2 last:border-0 last:pb-0">
              <span className="font-black text-slate-800 capitalize bg-slate-200/50 px-2 py-1 rounded text-xs shrink-0 whitespace-nowrap">
                {key.replace(/_/g, ' ')}:
              </span>
              <span className="text-slate-700 text-sm font-medium pt-0.5">
                {Array.isArray(val) ? val.join(', ') : typeof val === 'object' ? JSON.stringify(val) : String(val)}
              </span>
            </li>
          ))}
        </ul>
      );
    }
    if (Array.isArray(data)) {
      return (
        <ul className="space-y-2">
          {data.map((item, i) => (
            <li key={i} className="flex items-start gap-2 text-sm font-medium text-slate-700">
              <span className="text-cyan-500 mt-0.5">▹</span> <span>{String(item).replace(/\*\*/g, '')}</span>
            </li>
          ))}
        </ul>
      );
    }
    let textStr = String(data).replace(/\*\*/g, ''); 
    return (
      <div className="space-y-2">
        {textStr.split('\n').map((line, i) => {
          if (!line.trim()) return null;
          const cleanLine = line.replace(/^-/, '').trim(); 
          return (
            <p key={i} className="flex items-start gap-2 text-sm font-medium text-slate-700">
              <span className="text-cyan-500 mt-0.5">▹</span> <span>{cleanLine}</span>
            </p>
          );
        })}
      </div>
    );
  };

  // 10 MINUTE AUTO-LOGOUT LOGIC
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
      timeoutId = setTimeout(logoutUser, 600000); 
    };
    const events = ['mousemove', 'keydown', 'click', 'scroll', 'touchstart'];
    events.forEach(event => window.addEventListener(event, resetTimer));
    resetTimer();
    return () => {
      clearTimeout(timeoutId);
      events.forEach(event => window.removeEventListener(event, resetTimer));
    };
  }, [navigate]);

  useEffect(() => {
    if (chatEndRef.current) chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages, isChatLoading, showChatModal]);

  useEffect(() => {
    if ('speechSynthesis' in window) speechSynthRef.current = window.speechSynthesis;
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    setCurrentDate(new Date().toLocaleDateString('en-US', options));
    return () => { if (speechSynthRef.current) speechSynthRef.current.cancel(); };
  }, []);

  useEffect(() => {
    const checkAuthAndFetchData = async () => {
      const token = localStorage.getItem('token');
      const storedUser = localStorage.getItem('user');

      if (!token || !storedUser) {
        navigate('/login');
        return;
      }

      try {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser); 
        const currentUserId = parsedUser?._id || parsedUser?.id;

        const docsResponse = await fetch('http://localhost:5000/api/doctor/all');
        if (docsResponse.ok) {
          const docsData = await docsResponse.json();
          setDoctors(docsData || []); 
        }

        const apptResponse = await fetch('http://localhost:5000/api/appointment/my-appointments', {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (apptResponse.ok) {
            const apptData = await apptResponse.json();
            setMyAppointments(apptData || []); 
        }

        if (currentUserId) {
            const historyResponse = await fetch(`http://localhost:5000/api/health-records/my-history/${currentUserId}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (historyResponse.ok) {
                const historyData = await historyResponse.json();
                setHealthRecords(historyData.data || []);
            }
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };
    checkAuthAndFetchData();
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const openModal = (doc) => { setSelectedDoctor(doc); setShowModal(true); };
  const closeModal = () => { 
    setShowModal(false); 
    setSelectedDoctor(null); 
    setSelectedDateTime(null); 
    setIsBooking(false); 
    setPaymentMode('Online');
  };

  // --- Core Action Handlers ---
  const handleBook = async (e) => {
    e.preventDefault();
    if (!selectedDateTime) return alert("Please select both date and time.");

    setIsBooking(true);
    const token = localStorage.getItem('token'); 
    const formattedDate = selectedDateTime.toISOString().split('T')[0]; 
    const formattedTime = selectedDateTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });

    if (paymentMode === 'Offline') {
        try {
            const apptRes = await fetch('http://localhost:5000/api/appointment/book', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({ 
                    doctorId: selectedDoctor?._id,
                    appointmentDate: formattedDate,        
                    timeSlot: formattedTime,                
                    symptoms: recommendedSpecialty ? `AI Recommended for: ${recommendedSpecialty}` : "General Checkup"   
                }),
            });
            const apptData = await apptRes.json();
            if (apptRes.ok) {
                alert(`Appointment Confirmed!\n\n${apptData.message}`);
                closeModal();
                window.location.reload(); 
            } else {
                alert('Error booking appointment: ' + apptData.message);
            }
        } catch (err) {
            alert('Error confirming booking with server.');
        }
        setIsBooking(false);
        return;
    }

    const res = await loadRazorpay();
    if (!res) {
        alert('Razorpay SDK failed to load. Are you online?');
        setIsBooking(false);
        return;
    }

    const fee = selectedDoctor?.consultationFee || 500;
    try {
        const orderResponse = await fetch('http://localhost:5000/api/appointment/create-payment', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            body: JSON.stringify({ amount: fee })
        });
        const orderData = await orderResponse.json();

        const options = {
            key: import.meta.env.VITE_RAZORPAY_KEY_ID, 
            amount: orderData.amount,
            currency: "INR",
            name: "Neuralite Healthcare",
            description: `Consultation Fee for Dr. ${selectedDoctor?.name || 'Specialist'}`,
            image: "https://cdn-icons-png.flaticon.com/512/2966/2966327.png", 
            order_id: orderData.id,
            handler: async function (response) {
                try {
                    const apptRes = await fetch('http://localhost:5000/api/appointment/book', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                        body: JSON.stringify({ 
                            doctorId: selectedDoctor?._id,
                            appointmentDate: formattedDate,        
                            timeSlot: formattedTime,                
                            symptoms: recommendedSpecialty ? `AI Recommended for: ${recommendedSpecialty}` : "General Checkup"   
                        }),
                    });
                    const apptData = await apptRes.json();
                    if (apptRes.ok) {
                        alert(`Payment Successful!\n\n${apptData.message}`);
                        closeModal();
                        window.location.reload(); 
                    } else {
                        alert('Error booking appointment: ' + apptData.message);
                    }
                } catch (err) {
                    alert('Error confirming booking with server.');
                }
            },
            prefill: {
                name: user?.name || "Patient",
                email: user?.email || "patient@example.com",
                contact: user?.phone || "9999999999" 
            },
            theme: { color: "#0891b2" } 
        };
        const rzp = new window.Razorpay(options);
        rzp.on('payment.failed', function (response){
            alert("Payment Failed! " + response.error.description);
            setIsBooking(false);
        });
        rzp.open();
    } catch (error) {
        alert('Server issue while creating payment order.');
        setIsBooking(false);
    }
  };

  const handlePharmacyOrder = async (medicines) => {
    setIsOrdering(true);
    const token = localStorage.getItem('token'); 
    const res = await loadRazorpay();
    if (!res) { alert('Razorpay SDK failed to load.'); setIsOrdering(false); return; }

    const totalCost = medicines.length * 150; 
    try {
        const orderResponse = await fetch('http://localhost:5000/api/appointment/create-payment', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            body: JSON.stringify({ amount: totalCost })
        });
        const orderData = await orderResponse.json();

        const options = {
            key: import.meta.env.VITE_RAZORPAY_KEY_ID, 
            amount: orderData.amount,
            currency: "INR",
            name: "Neuralite Pharmacy",
            description: `Order for ${medicines.length} Medicines`,
            image: "https://cdn-icons-png.flaticon.com/512/3004/3004011.png", 
            order_id: orderData.id,
            handler: function (response) {
                alert(`✅ Payment Successful!\n\nYour medicines have been ordered successfully. They will be delivered within 2 hours!`);
                setViewPrescriptionData(null); 
            },
            prefill: {
                name: user?.name || "Patient",
                email: user?.email || "patient@example.com",
                contact: user?.phone || "9999999999" 
            },
            theme: { color: "#10b981" } 
        };
        const rzp = new window.Razorpay(options);
        rzp.on('payment.failed', function (response){ alert("Payment Failed!"); });
        rzp.open();
    } catch (error) {
        alert('Server issue while creating pharmacy order.');
    } finally {
        setIsOrdering(false);
    }
  };

  const handleCancel = async (appointmentId) => {
    if (!window.confirm("Are you sure you want to cancel this appointment?")) return;
    const token = localStorage.getItem('token');
    try {
      const response = await fetch(`http://localhost:5000/api/appointment/cancel/${appointmentId}`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        window.location.reload(); 
      }
    } catch (error) {
      alert('Unable to connect to the server!');
    }
  };

  // --- AI Handlers ---
  const handleParchiChange = (e) => {
    const file = e.target.files[0];
    if (file) { setSelectedParchi(file); setParchiPreview(URL.createObjectURL(file)); setParchiResult(null); setRecommendedSpecialty(null); }
  };
  const submitParchi = async () => {
    if (!selectedParchi) return;
    setIsParchiLoading(true); setParchiResult(null);
    const formData = new FormData(); formData.append('file', selectedParchi);
    try {
      const response = await fetch('http://localhost:8000/api/analyze-prescription', { method: 'POST', body: formData });
      const data = await response.json();
      if (response.ok) {
        setParchiResult(data.message);
        if (data.recommended_specialty && data.recommended_specialty !== "None") setRecommendedSpecialty(data.recommended_specialty);
      } else { setParchiResult("Error: " + data.error); }
    } catch (error) { setParchiResult("Could not connect to AI server."); } 
    finally { setIsParchiLoading(false); }
  };
  const closeParchiModal = () => { setShowParchiModal(false); setSelectedParchi(null); setParchiPreview(null); setParchiResult(null); };

  const handleXrayChange = (e) => {
    const file = e.target.files[0];
    if (file) { setSelectedXray(file); setXrayResult(null); }
  };
  const submitXray = async () => {
    if (!selectedXray) return;
    setIsXrayLoading(true); setXrayResult(null);
    const formData = new FormData(); formData.append('file', selectedXray);
    try {
      const response = await fetch('http://127.0.0.1:8000/api/analyze-xray', { method: 'POST', body: formData });
      const data = await response.json();
      if (response.ok) { setXrayResult(data); } 
      else { setXrayResult({ error: data.error }); }
    } catch (error) { setXrayResult({ error: "Server connection failed." }); } 
    finally { setIsXrayLoading(false); }
  };
  const closeXrayModal = () => { setShowXrayModal(false); setSelectedXray(null); setXrayResult(null); };

  const handleWellnessSubmit = async (e) => {
    e.preventDefault();
    if (!wellnessInput.trim()) return;
    setIsWellnessLoading(true); setWellnessResult(null);
    try {
      const response = await fetch('http://localhost:8000/api/wellness-plan', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ problem: wellnessInput })
      });
      const data = await response.json();
      if (response.ok) { setWellnessResult(data.data); } 
      else { setWellnessResult({ error: data.error }); }
    } catch (error) { setWellnessResult({ error: "Cannot connect to AI Server." }); } 
    finally { setIsWellnessLoading(false); }
  };

  const handleStressSubmit = async (e) => {
    e.preventDefault();
    setIsStressLoading(true); setStressResult(null);
    try {
      const response = await fetch('http://localhost:8000/api/analyze-stress', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(stressAnswers)
      });
      const data = await response.json();
      if (response.ok) { setStressResult(data.data); } 
      else { setStressResult({ error: data.error }); }
    } catch (error) { setStressResult({ error: "Cannot connect to AI Server." }); } 
    finally { setIsStressLoading(false); }
  };
  const handleStressChange = (e) => { setStressAnswers({ ...stressAnswers, [e.target.name]: e.target.value }); };

  const handleSkinChange = (e) => {
    const file = e.target.files[0];
    if (file) { setSelectedSkinImage(file); setSkinResult(null); }
  };
  const submitSkin = async () => {
    if (!selectedSkinImage) return;
    setIsSkinLoading(true); setSkinResult(null);
    const formData = new FormData(); formData.append('file', selectedSkinImage);
    try {
      const response = await fetch('http://localhost:8000/api/analyze-skin', { method: 'POST', body: formData });
      const data = await response.json();
      if (response.ok) { setSkinResult(data.data); } 
      else { setSkinResult({ error: data.error }); }
    } catch (error) { setSkinResult({ error: "Cannot connect to AI server." }); } 
    finally { setIsSkinLoading(false); }
  };

  const handleLabChange = (e) => {
    const file = e.target.files[0];
    if (file) { setSelectedLabImage(file); setLabResult(null); }
  };
  const submitLab = async () => {
    if (!selectedLabImage) return;
    setIsLabLoading(true); setLabResult(null);
    const formData = new FormData(); formData.append('file', selectedLabImage);
    try {
      const response = await fetch('http://localhost:8000/api/analyze-lab', { method: 'POST', body: formData });
      const data = await response.json();
      if (response.ok) { setLabResult(data.data); } 
      else { setLabResult({ error: data.error }); }
    } catch (error) { setLabResult({ error: "Cannot connect to AI server." }); } 
    finally { setIsLabLoading(false); }
  };

  const handleFoodChange = (e) => {
    const file = e.target.files[0];
    if (file) { setSelectedFoodImage(file); setFoodResult(null); }
  };
  const submitFood = async () => {
    if (!selectedFoodImage) return;
    setIsFoodLoading(true); setFoodResult(null);
    const formData = new FormData(); formData.append('file', selectedFoodImage);
    try {
      const response = await fetch('http://localhost:8000/api/analyze-food', { method: 'POST', body: formData });
      const data = await response.json();
      if (response.ok) { setFoodResult(data.data); } 
      else { setFoodResult({ error: data.error }); }
    } catch (error) { setFoodResult({ error: "Cannot connect to AI server." }); } 
    finally { setIsFoodLoading(false); }
  };

  const handleRiskSubmit = async (e) => {
    e.preventDefault();
    setIsRiskLoading(true); setRiskResult(null);
    try {
      const response = await fetch('http://localhost:8000/api/predict-health', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(riskData)
      });
      const data = await response.json();
      if (response.ok) {
        setRiskResult(data);
        if (data.recommended_specialty) setRecommendedSpecialty(data.recommended_specialty);
        
        const token = localStorage.getItem('token');
        if (user?._id || user?.id) {
            await fetch('http://localhost:5000/api/health-records/save', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({ userId: user._id || user.id, recordType: 'ML Risk Prediction', resultData: { inputs: riskData, prediction: data } })
            });
            const histRes = await fetch(`http://localhost:5000/api/health-records/my-history/${user._id || user.id}`, { headers: { 'Authorization': `Bearer ${token}` } });
            if (histRes.ok) { const hd = await histRes.json(); setHealthRecords(hd.data || []); }
        }
      } else { setRiskResult({ error: data.error }); }
    } catch (error) { setRiskResult({ error: "Server connection failed!" }); } 
    finally { setIsRiskLoading(false); }
  };
  const handleRiskChange = (e) => { setRiskData({ ...riskData, [e.target.name]: Number(e.target.value) }); };
  const closeRiskModal = () => { setShowRiskModal(false); setRiskResult(null); setRiskData({ age: '', bmi: '', glucose: '', bp: '' }); };

  // Speech & Voice Handlers
  const speakText = (text) => {
    if (!speechSynthRef.current) return;
    speechSynthRef.current.cancel();
    let cleanText = text.replace(/[*#_]/g, '').replace(/\n/g, ', ').replace(/([\u2700-\u27BF]|[\uE000-\uF8FF]|\uD83C[\uDC00-\uDFFF]|\uD83D[\uDC00-\uDFFF]|[\u2011-\u26FF]|\uD83E[\uDD10-\uDDFF])/g, '');
    const utterance = new SpeechSynthesisUtterance(cleanText);
    const hasHindiChars = /[\u0900-\u097F]/.test(cleanText); 
    utterance.lang = hasHindiChars ? 'hi-IN' : 'en-IN'; 
    const voices = speechSynthRef.current.getVoices();
    utterance.voice = hasHindiChars ? (voices.find(v => v.lang === 'hi-IN' && v.name.includes('Google')) || voices.find(v => v.lang === 'hi-IN')) : (voices.find(v => v.lang === 'en-IN' && v.name.includes('Google')) || voices.find(v => v.lang === 'en-IN'));
    utterance.rate = 0.95; utterance.pitch = 1.0;
    utterance.onstart = () => setIsSpeaking(true); utterance.onend = () => setIsSpeaking(false); utterance.onerror = () => setIsSpeaking(false);
    speechSynthRef.current.speak(utterance);
  };
  const stopSpeaking = () => { if (speechSynthRef.current) { speechSynthRef.current.cancel(); setIsSpeaking(false); } };
  const startListening = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) return alert("Your browser does not support voice input. Please use Chrome.");
    const recognition = new SpeechRecognition();
    recognition.lang = 'en-IN'; recognition.interimResults = false; recognition.maxAlternatives = 1;
    recognition.onstart = () => setIsListening(true);
    recognition.onresult = (event) => setChatInput(prev => prev + (prev ? " " : "") + event.results[0][0].transcript);
    recognition.onerror = () => setIsListening(false);
    recognition.onend = () => setIsListening(false);
    recognition.start();
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!chatInput.trim()) return;
    const userMsg = chatInput.trim();
    setChatMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setChatInput(''); setIsChatLoading(true); stopSpeaking(); 
    try {
      const response = await fetch('http://localhost:8000/api/chat-text', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ message: userMsg }) });
      const data = await response.json();
      if (response.ok) { setChatMessages(prev => [...prev, { role: 'bot', text: data.message }]); speakText(data.message); } 
      else { setChatMessages(prev => [...prev, { role: 'bot', text: 'Error: ' + data.message }]); }
    } catch (error) { setChatMessages(prev => [...prev, { role: 'bot', text: 'Could not connect to the AI server.' }]); } 
    finally { setIsChatLoading(false); }
  };

  // Filters & Derived Data
  const filteredDoctors = recommendedSpecialty
    ? doctors.filter(doc => doc.specialty && (doc.specialty.toLowerCase().includes(recommendedSpecialty.toLowerCase()) || recommendedSpecialty.toLowerCase().includes(doc.specialty.toLowerCase())))
    : doctors.filter(doc => {
        const matchesSearch = doc.name?.toLowerCase().includes(searchQuery.toLowerCase()) || doc.specialty?.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesSpecialty = specialtyFilter ? doc.specialty === specialtyFilter : true;
        return matchesSearch && matchesSpecialty;
      });

  const chartData = healthRecords.filter(r => r.recordType === 'ML Risk Prediction' && r.resultData?.inputs).map(r => ({
      date: new Date(r.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }),
      glucose: Number(r.resultData.inputs.glucose) || 0, bmi: Number(r.resultData.inputs.bmi) || 0, bp: Number(r.resultData.inputs.bp) || 0,
    })).reverse(); 

  const latestPrescriptionAppt = myAppointments.slice().reverse().find(appt => appt.status === 'Completed' && appt.prescription && typeof appt.prescription === 'object' && Array.isArray(appt.prescription.medicines) && appt.prescription.medicines.length > 0 && appt.prescription.medicines[0].name !== '');

  if (!user) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center text-[#06b6d4]">
        <div className="w-10 h-10 border-4 border-[#06b6d4] border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="font-bold tracking-widest text-sm uppercase">Loading Dashboard...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fafafa] font-sans text-slate-900 pt-24 pb-20 relative">
      <div className="absolute top-0 left-[50%] -translate-x-1/2 w-[800px] h-[400px] bg-gradient-to-b from-cyan-500/10 to-transparent rounded-full blur-[120px] pointer-events-none z-0"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* HEADER SECTION */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10">
          <div>
            <p className="text-xs font-bold text-cyan-600 uppercase tracking-widest mb-1.5">Patient Dashboard</p>
            <h1 className="text-3xl md:text-5xl font-black tracking-tight">Welcome back, {user.name ? user.name.split(' ')[0] : 'Patient'} 👋</h1>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm font-semibold text-slate-500 bg-white px-4 py-2 rounded-full ring-1 ring-slate-200 shadow-sm hidden md:block">{currentDate}</span>
            <button onClick={() => navigate('/profile')} className="text-sm font-bold text-cyan-600 bg-cyan-50 hover:bg-cyan-100 px-5 py-2 rounded-full ring-1 ring-cyan-100">My Profile</button>
            <button onClick={handleLogout} className="text-sm font-bold text-red-600 bg-red-50 hover:bg-red-100 px-5 py-2 rounded-full ring-1 ring-red-100">{t('logout')}</button>
          </div>
        </div>

        {/* OVERVIEW STAT CARDS */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
          <div className="bg-white p-5 rounded-2xl ring-1 ring-slate-200 shadow-sm flex flex-col justify-center">
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Appointments</p>
            <h4 className="text-3xl font-black text-slate-900">{myAppointments.length}</h4>
          </div>
          <div className="bg-white p-5 rounded-2xl ring-1 ring-slate-200 shadow-sm flex flex-col justify-center">
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Health Records</p>
            <h4 className="text-3xl font-black text-slate-900">{healthRecords.length}</h4>
          </div>
          <div className="bg-white p-5 rounded-2xl ring-1 ring-slate-200 shadow-sm flex flex-col justify-center">
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">AI Insights</p>
            <h4 className="text-sm font-bold text-emerald-600 flex items-center gap-1.5 mt-1"><span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span> Active</h4>
          </div>
          <div className="bg-white p-5 rounded-2xl ring-1 ring-slate-200 shadow-sm flex flex-col justify-center">
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Vault</p>
            <h4 className="text-sm font-bold text-slate-900 flex items-center gap-1.5 mt-1">🔒 Secured</h4>
          </div>
        </div>

        {/* PILL REMINDER SECTION */}
        {latestPrescriptionAppt && (
          <div className="mb-14">
            <h2 className="text-xl font-bold text-slate-900 mb-5 flex items-center gap-2">Today's Pill Reminder ⏰</h2>
            <div className="bg-white p-6 rounded-3xl ring-1 ring-slate-200 shadow-sm">
              <p className="text-sm text-slate-500 mb-4 font-medium">From your latest consultation with Dr. {latestPrescriptionAppt.doctorId?.name || 'Specialist'}</p>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {latestPrescriptionAppt.prescription.medicines.map((med, idx) => (
                  <label key={idx} className="flex items-start gap-4 p-4 rounded-2xl border-2 border-slate-100 cursor-pointer hover:border-cyan-300 transition-all bg-slate-50 group">
                    <div className="relative flex items-center justify-center w-6 h-6 mt-0.5 shrink-0">
                      <input type="checkbox" className="peer w-6 h-6 opacity-0 absolute cursor-pointer" />
                      <div className="w-6 h-6 rounded border-2 border-slate-300 peer-checked:bg-cyan-500 peer-checked:border-cyan-500 flex items-center justify-center">
                        <svg className="w-4 h-4 text-white opacity-0 peer-checked:opacity-100" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                      </div>
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900 group-hover:text-cyan-600">{med.name}</h4>
                      <p className="text-xs font-semibold text-cyan-600 mt-1">{med.dosage}</p>
                      <p className="text-xs text-slate-500 mt-0.5">{med.duration}</p>
                    </div>
                  </label>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* HEALTH ANALYTICS CHARTS SECTION */}
        {chartData.length > 0 && (
          <div className="mb-14">
            <h2 className="text-xl font-bold text-slate-900 mb-5">Health Analytics 📈</h2>
            <div className="bg-white p-6 sm:p-8 rounded-3xl ring-1 ring-slate-200 shadow-sm">
              <h3 className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-6">Vitals Trend Over Time</h3>
              <div className="h-72 sm:h-80 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.2} />
                    <XAxis dataKey="date" tick={{fontSize: 12}} stroke="#64748b" />
                    <YAxis tick={{fontSize: 12}} stroke="#64748b" />
                    <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} itemStyle={{ fontWeight: 'bold' }} />
                    <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '20px', fontWeight: 'bold' }} />
                    <Line type="monotone" name="Glucose" dataKey="glucose" stroke="#06b6d4" strokeWidth={3} activeDot={{ r: 8 }} />
                    <Line type="monotone" name="BMI" dataKey="bmi" stroke="#10b981" strokeWidth={3} />
                    <Line type="monotone" name="Blood Pressure" dataKey="bp" stroke="#f59e0b" strokeWidth={3} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        )}

        {/* 9 MEGA SMART AI FEATURES */}
        <div className="mb-14">
          <h2 className="text-xl font-bold mb-5 flex items-center gap-2 text-slate-900">
            Smart AI Features ✨ <span className="text-xs font-medium text-slate-500 font-normal">Informational support only</span>
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            
            <button onClick={() => setShowChatModal(true)} className="bg-white p-5 rounded-3xl ring-1 ring-slate-200 shadow-sm hover:ring-cyan-500/50 text-left flex flex-col transition-all group">
              <div className="w-10 h-10 rounded-xl bg-cyan-50 text-cyan-600 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform"><svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" /></svg></div>
              <h3 className="font-bold text-sm text-slate-900">Chat AI</h3>
              <p className="text-[10px] text-slate-500 mt-1">Discuss symptoms</p>
            </button>

            <button onClick={() => setShowParchiModal(true)} className="bg-white p-5 rounded-3xl ring-1 ring-slate-200 shadow-sm hover:ring-purple-500/50 text-left flex flex-col transition-all group">
              <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform"><svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg></div>
              <h3 className="font-bold text-sm text-slate-900">Scan Parchi</h3>
              <p className="text-[10px] text-slate-500 mt-1">Digitize handwritten meds</p>
            </button>

            <button onClick={() => setShowXrayModal(true)} className="bg-white p-5 rounded-3xl ring-1 ring-slate-200 shadow-sm hover:ring-indigo-500/50 text-left flex flex-col transition-all group">
              <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform"><svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg></div>
              <h3 className="font-bold text-sm text-slate-900">X-Ray Scan</h3>
              <p className="text-[10px] text-slate-500 mt-1">Pneumonia detection</p>
            </button>

            <button onClick={() => setShowRiskModal(true)} className="bg-white p-5 rounded-3xl ring-1 ring-slate-200 shadow-sm hover:ring-emerald-500/50 text-left flex flex-col transition-all group">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform"><svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg></div>
              <h3 className="font-bold text-sm text-slate-900">Risk Predictor</h3>
              <p className="text-[10px] text-slate-500 mt-1">ML health analysis</p>
            </button>

            <button onClick={() => setShowWellnessModal(true)} className="bg-white p-5 rounded-3xl ring-1 ring-slate-200 shadow-sm hover:ring-orange-500/50 text-left flex flex-col transition-all group">
              <div className="w-10 h-10 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform"><svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg></div>
              <h3 className="font-bold text-sm text-slate-900">Wellness Coach</h3>
              <p className="text-[10px] text-slate-500 mt-1">Diet & fitness plans</p>
            </button>

            <button onClick={() => setShowStressModal(true)} className="bg-white p-5 rounded-3xl ring-1 ring-slate-200 shadow-sm hover:ring-pink-500/50 text-left flex flex-col transition-all group">
              <div className="w-10 h-10 rounded-xl bg-pink-50 text-pink-600 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform"><svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg></div>
              <h3 className="font-bold text-sm text-slate-900">Mental Health</h3>
              <p className="text-[10px] text-slate-500 mt-1">Stress & Anxiety Check</p>
            </button>

            <button onClick={() => setShowSkinModal(true)} className="bg-white p-5 rounded-3xl ring-1 ring-slate-200 shadow-sm hover:ring-rose-500/50 text-left flex flex-col transition-all group">
              <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform"><svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 21h7a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v11m0 5l4.879-4.879m0 0a3 3 0 104.243-4.242 3 3 0 00-4.243 4.242z" /></svg></div>
              <h3 className="font-bold text-sm text-slate-900">Skin Analyzer</h3>
              <p className="text-[10px] text-slate-500 mt-1">Dermatology check</p>
            </button>

            {/* --- Lab Report Analyzer --- */}
            <button onClick={() => setShowLabModal(true)} className="bg-white p-5 rounded-3xl ring-1 ring-slate-200 shadow-sm hover:ring-blue-500/50 text-left flex flex-col transition-all group">
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform"><svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg></div>
              <h3 className="font-bold text-sm text-slate-900">Lab Analyzer</h3>
              <p className="text-[10px] text-slate-500 mt-1">Scan Blood Reports</p>
            </button>

            {/* --- Food Calorie Scanner --- */}
            <button onClick={() => setShowFoodModal(true)} className="bg-white p-5 rounded-3xl ring-1 ring-slate-200 shadow-sm hover:ring-yellow-500/50 text-left flex flex-col transition-all group">
              <div className="w-10 h-10 rounded-xl bg-yellow-50 text-yellow-600 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform"><svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 15.546c-.523 0-1.046.151-1.5.454a2.704 2.704 0 01-3 0 2.704 2.704 0 00-3 0 2.704 2.704 0 01-3 0 2.704 2.704 0 00-3 0 2.704 2.704 0 01-3 0 2.701 2.701 0 00-1.5-.454M9 6v2m3-2v2m3-2v2M9 3h.01M12 3h.01M15 3h.01M21 21v-7a2 2 0 00-2-2H5a2 2 0 00-2 2v7h18zm-3-9v-2a2 2 0 00-2-2H8a2 2 0 00-2 2v2h12z" /></svg></div>
              <h3 className="font-bold text-sm text-slate-900">Food Scanner</h3>
              <p className="text-[10px] text-slate-500 mt-1">Calorie & Macro Tracker</p>
            </button>

          </div>
        </div>

        {/* MY APPOINTMENTS */}
        <div className="mb-14">
          <h2 className="text-xl font-bold text-slate-900 mb-5">{t('my_appointments')}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {myAppointments.length > 0 ? (
              myAppointments.map((appt) => (
                <div key={appt._id} className="bg-white p-6 rounded-3xl ring-1 ring-slate-200 shadow-sm flex flex-col relative overflow-hidden">
                  <div className={`absolute top-0 left-0 w-1.5 h-full ${appt.status === 'Confirmed' ? 'bg-cyan-500' : appt.status === 'Completed' ? 'bg-emerald-500' : 'bg-slate-300'}`}></div>
                  <div className="flex justify-between items-start mb-4 pl-2">
                    <div>
                      <h4 className="font-bold text-slate-900">{appt.doctorId?.name ? `Dr. ${appt.doctorId.name}` : `Dr. ${appt.doctorId?.specialty || 'Specialist'}`}</h4>
                      <p className="text-xs font-medium text-slate-500">{appt.doctorId?.clinicAddress || 'Neuralite Clinic'}</p>
                    </div>
                    <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${appt.status === 'Cancelled' ? 'bg-red-50 text-red-600' : appt.status === 'Completed' ? 'bg-emerald-50 text-emerald-600' : 'bg-cyan-50 text-cyan-700'}`}>{appt.status}</span>
                  </div>
                  <div className="bg-slate-50 rounded-xl p-4 flex justify-between items-center mb-5 ring-1 ring-slate-100">
                    <div><p className="text-[10px] font-bold text-slate-400 uppercase mb-0.5">Date</p><p className="text-sm font-bold text-slate-700">{new Date(appt.appointmentDate).toLocaleDateString('en-IN')}</p></div>
                    <div className="text-right"><p className="text-[10px] font-bold text-slate-400 uppercase mb-0.5">Time</p><p className="text-sm font-bold text-slate-700">{appt.timeSlot}</p></div>
                  </div>
                  <div className="mt-auto flex flex-col gap-2">
                    {appt.status === 'Confirmed' && (
                      <button onClick={() => window.location.href = `/room/${appt._id}`} className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold py-2.5 rounded-xl transition">
                        Join Video Call
                      </button>
                    )}
                    {appt.status === 'Confirmed' && (
                      <button onClick={() => handleCancel(appt._id)} className="w-full bg-white ring-1 ring-red-200 text-red-600 hover:bg-red-50 text-xs font-bold py-2.5 rounded-xl transition">Cancel Appointment</button>
                    )}
                    {appt.status === 'Completed' && appt.prescription && (
                      <button onClick={() => setViewPrescriptionData(appt)} className="w-full flex items-center justify-center gap-2 bg-teal-50 text-teal-700 hover:bg-teal-100 text-xs font-bold py-2.5 rounded-xl transition">
                        View Prescription
                      </button>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-full bg-white p-8 rounded-3xl ring-1 ring-slate-200 text-center"><p className="text-slate-500 font-medium">No appointments.</p></div>
            )}
          </div>
        </div>

        {/* AVAILABLE DOCTORS */}
        <div className="mb-14">
          <div className="flex flex-col md:flex-row justify-between gap-4 mb-6">
            <h2 className="text-xl font-bold text-slate-900">Available Doctors</h2>
            <div className="flex gap-2 w-full md:w-auto">
              <input type="text" placeholder="Search..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="px-4 py-2 bg-white ring-1 ring-slate-200 rounded-xl text-sm w-full sm:w-64" />
              <select value={specialtyFilter} onChange={(e) => setSpecialtyFilter(e.target.value)} className="px-4 py-2 bg-white ring-1 ring-slate-200 rounded-xl text-sm">
                <option value="">All</option><option value="Cardiologist">Cardiologist</option><option value="Dermatologist">Dermatologist</option><option value="General Physician">General</option>
              </select>
            </div>
          </div>
          {recommendedSpecialty && (
            <div className="mb-6 flex justify-between bg-teal-50 p-3 rounded-xl ring-1 ring-teal-200">
              <span className="text-teal-700 text-sm font-medium">AI Match: <strong className="font-bold">{recommendedSpecialty}</strong></span>
              <button onClick={() => setRecommendedSpecialty(null)} className="text-slate-400 hover:text-slate-600 font-bold">X</button>
            </div>
          )}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredDoctors.length > 0 ? (
              filteredDoctors.map((doc, i) => (
                <div key={i} className="bg-white p-6 rounded-2xl ring-1 ring-slate-200 flex flex-col">
                  <div className="flex items-center gap-4 mb-5">
                    <div className="w-14 h-14 bg-slate-100 rounded-full flex items-center justify-center text-slate-400 shrink-0">👨‍⚕️</div>
                    <div className="min-w-0">
                      <h4 className="text-lg font-bold text-slate-900 truncate">{doc.name}</h4>
                      <p className="text-xs font-semibold text-cyan-600">{doc.specialty}</p>
                    </div>
                  </div>
                  <div className="space-y-2 mb-6 flex-1 text-sm text-slate-600 bg-slate-50 p-4 rounded-xl">
                    <p>⏱ {doc.experience} Years Exp.</p>
                    <p className="truncate">🏥 {doc.clinicAddress}</p>
                    <p className="font-bold text-slate-800">₹ {doc.consultationFee} Fee</p>
                  </div>
                  <button onClick={() => openModal(doc)} className="w-full bg-slate-900 text-white font-bold py-2.5 rounded-xl text-sm transition">Book Appointment</button>
                </div>
              ))
            ) : (
              <div className="col-span-full text-center p-8"><p className="text-slate-500">No doctors found.</p></div>
            )}
          </div>
        </div>

      </div>

      {/* ================= MODALS ================= */}

      {/* 1. View Prescription */}
      {viewPrescriptionData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white p-6 md:p-8 rounded-[24px] w-full max-w-2xl max-h-[90vh] overflow-y-auto flex flex-col relative">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-black text-[#0f172a]">Digital Prescription</h3>
              <button onClick={() => setViewPrescriptionData(null)} className="text-slate-400 hover:text-slate-600 font-bold text-xl leading-none">&times;</button>
            </div>
            
            {(() => {
              const appt = viewPrescriptionData;
              const isSmartObject = appt.prescription && typeof appt.prescription === 'object' && Array.isArray(appt.prescription.medicines) && appt.prescription.medicines.length > 0 && appt.prescription.medicines[0].name !== '';

              if (isSmartObject) {
                return (
                  <div className="space-y-6">
                    <div className="bg-[#ecfdf5] p-5 rounded-2xl ring-1 ring-emerald-100">
                      <h4 className="text-[11px] font-extrabold text-[#059669] uppercase tracking-widest mb-4">Prescribed Medicines</h4>
                      <div className="w-full overflow-hidden">
                        <table className="w-full text-left border-collapse">
                          <thead>
                            <tr className="border-b border-[#a7f3d0]">
                              <th className="pb-2 text-[11px] font-extrabold text-[#047857]">Name</th>
                              <th className="pb-2 text-[11px] font-extrabold text-[#047857]">Dosage</th>
                              <th className="pb-2 text-[11px] font-extrabold text-[#047857]">Duration</th>
                            </tr>
                          </thead>
                          <tbody>
                            {appt.prescription.medicines.map((m, i) => (
                              <tr key={i} className="border-b border-emerald-100/50 last:border-0">
                                <td className="py-3 text-sm font-bold text-slate-800">{m.name}</td>
                                <td className="py-3 text-sm font-medium text-slate-600">{m.dosage}</td>
                                <td className="py-3 text-sm font-medium text-slate-600">{m.duration}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                      <button onClick={() => handlePharmacyOrder(appt.prescription.medicines)} disabled={isOrdering} className="w-full mt-5 bg-[#059669] hover:bg-emerald-700 text-white font-bold py-3.5 rounded-xl shadow-md transition-all">
                        {isOrdering ? 'Processing...' : 'Buy Medicines'}
                      </button>
                    </div>
                    {appt.prescription.notes && (
                      <div>
                        <label className="block text-[11px] font-extrabold text-slate-500 uppercase tracking-widest mb-2">Doctor's Advice / Notes</label>
                        <div className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-sm font-medium text-slate-700 whitespace-pre-wrap">
                          {appt.prescription.notes}
                        </div>
                      </div>
                    )}
                  </div>
                );
              }

              // Manual Mode
              let textNotes = null;
              if (typeof appt.prescription === 'string' && !isFilePath(appt.prescription)) textNotes = appt.prescription;
              else if (typeof appt.prescription === 'object' && appt.prescription.notes) textNotes = appt.prescription.notes;
              else if (appt.notes && !isFilePath(appt.notes)) textNotes = appt.notes;
              
              const potentialFiles = [appt.prescriptionFile, appt.prescriptionUrl, appt.documentUrl, appt.document, appt.fileUrl, appt.file, appt.attachment];
              if (typeof appt.prescription === 'string' && isFilePath(appt.prescription)) potentialFiles.push(appt.prescription);
              const fileUrl = potentialFiles.find(val => isFilePath(val));

              return (
                <div className="space-y-6">
                  {textNotes && (
                    <div>
                      <label className="block text-[11px] font-extrabold text-slate-500 uppercase tracking-widest mb-2">Doctor's Notes</label>
                      <div className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-sm font-medium text-slate-700 whitespace-pre-wrap">
                        {textNotes}
                      </div>
                    </div>
                  )}
                  {fileUrl && (
                    <div>
                      <label className="block text-[11px] font-extrabold text-slate-500 uppercase tracking-widest mb-2">Attached Document</label>
                      <div className="w-full p-4 rounded-xl border border-slate-200 bg-slate-50 flex flex-col items-center justify-center">
                        {fileUrl.toLowerCase().endsWith('.pdf') ? (
                          <iframe src={getFileUrl(fileUrl)} title="Prescription" className="w-full h-96 rounded-lg border border-slate-200"></iframe>
                        ) : (
                          <img src={getFileUrl(fileUrl)} alt="Prescription" className="max-w-full rounded-lg shadow-sm mb-4" style={{ maxHeight: '300px', objectFit: 'contain' }} />
                        )}
                        <a href={getFileUrl(fileUrl)} target="_blank" rel="noopener noreferrer" className="text-[13px] font-bold text-[#0284c7] hover:underline">
                          {fileUrl.toLowerCase().endsWith('.pdf') ? 'Open PDF in New Tab' : 'Open Full Image in New Tab'}
                        </a>
                      </div>
                    </div>
                  )}
                  {!textNotes && !fileUrl && <p className="text-sm text-slate-500 text-center py-4">No prescription details available.</p>}
                </div>
              );
            })()}
            
            <div className="mt-8 flex justify-center w-full">
              <button onClick={() => setViewPrescriptionData(null)} className="w-full md:w-auto px-8 py-3 bg-[#f1f5f9] hover:bg-slate-200 text-[#334155] text-sm font-bold rounded-xl transition-all">Close Details</button>
            </div>
          </div>
        </div>
      )}

      {/* 2. Book Appointment */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white p-6 md:p-8 rounded-[24px] w-full max-w-md shadow-2xl relative">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h3 className="text-2xl font-black text-[#0f172a] mb-1">Book Appointment</h3>
                <p className="text-sm font-medium text-[#64748b]">Scheduling with Dr. {selectedDoctor?.name || selectedDoctor?.specialty}</p>
              </div>
              <button onClick={closeModal} className="text-slate-400 hover:text-slate-600 font-bold text-xl leading-none">&times;</button>
            </div>
            
            <form onSubmit={handleBook} className="space-y-6">
              <div className="relative z-50">
                <label className="block text-[11px] font-extrabold text-slate-500 uppercase tracking-widest mb-2">Select Date & Time</label>
                <DatePicker 
                  selected={selectedDateTime} 
                  onChange={(d) => setSelectedDateTime(d)} 
                  showTimeSelect 
                  timeFormat="HH:mm" 
                  timeIntervals={15} 
                  timeCaption="Time"
                  dateFormat="MMMM d, yyyy h:mm aa" 
                  minDate={new Date()} 
                  placeholderText="Tap to choose date & time..."
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-[#f8fafc] text-sm font-bold text-slate-800 focus:outline-none focus:border-[#06b6d4] focus:ring-1 focus:ring-[#06b6d4] transition-colors shadow-sm" 
                  wrapperClassName="w-full"
                  required 
                />
              </div>
              
              <div>
                <label className="block text-[11px] font-extrabold text-slate-500 uppercase tracking-widest mb-2">Payment Mode</label>
                <div className="flex gap-3">
                  <button type="button" onClick={() => setPaymentMode('Online')} className={`flex-1 py-3 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all ${paymentMode === 'Online' ? 'border-2 border-[#06b6d4] bg-[#ecfeff] text-[#0e7490]' : 'border border-slate-200 bg-white text-slate-600 hover:bg-slate-50'}`}>💳 Pay Online</button>
                  <button type="button" onClick={() => setPaymentMode('Offline')} className={`flex-1 py-3 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all ${paymentMode === 'Offline' ? 'border-2 border-[#10b981] bg-[#ecfdf5] text-[#047857]' : 'border border-slate-200 bg-white text-slate-600 hover:bg-slate-50'}`}>🏥 Pay at Clinic</button>
                </div>
              </div>
              
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={closeModal} className="flex-1 bg-[#f1f5f9] hover:bg-slate-200 text-[#334155] text-sm font-bold py-3.5 rounded-xl transition-all">Cancel</button>
                <button type="submit" disabled={isBooking} className="flex-1 bg-[#06b6d4] hover:bg-[#0891b2] text-white text-sm font-bold py-3.5 rounded-xl shadow-md transition-all disabled:opacity-70">{isBooking ? 'Processing...' : paymentMode === 'Online' ? 'Pay & Book' : 'Confirm Booking'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 3. AI Chat */}
      {showChatModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg h-[600px] flex flex-col overflow-hidden">
            <div className="bg-cyan-600 p-4 flex justify-between items-center">
              <h3 className="font-bold text-white">Neuralite Assistant</h3>
              <button onClick={() => { setShowChatModal(false); stopSpeaking(); }} className="text-cyan-100 hover:text-white font-bold">X</button>
            </div>
            <div className="flex-1 overflow-y-auto p-5 space-y-4 bg-slate-50">
              {chatMessages.map((msg, i) => (
                <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[85%] p-3 text-sm font-medium rounded-2xl ${msg.role === 'user' ? 'bg-cyan-600 text-white' : 'bg-white ring-1 ring-slate-200 text-slate-800 whitespace-pre-wrap'}`}>{msg.text}</div>
                </div>
              ))}
              {isChatLoading && <div className="text-sm font-bold text-slate-400">Typing...</div>}
              <div ref={chatEndRef} />
            </div>
            <form onSubmit={handleSendMessage} className="p-3 flex gap-2 border-t">
              <button type="button" onClick={startListening} className={`w-10 h-10 rounded-full flex justify-center items-center ${isListening ? 'bg-red-100 text-red-500' : 'bg-slate-100'}`}>🎤</button>
              <input type="text" value={chatInput} onChange={(e) => setChatInput(e.target.value)} placeholder="Type a message..." className="flex-1 px-4 py-2 rounded-full ring-1 ring-slate-200 outline-none text-sm" />
              <button type="submit" disabled={isChatLoading || !chatInput.trim()} className="w-10 h-10 rounded-full bg-cyan-600 text-white font-bold">→</button>
            </form>
          </div>
        </div>
      )}

      {/* 4. Parchi Scanner */}
      {showParchiModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white p-8 rounded-3xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between mb-6"><h3 className="text-2xl font-black text-purple-600">AI Parchi Scanner</h3><button onClick={closeParchiModal} className="font-bold text-slate-400">X</button></div>
            <div className="border-2 border-dashed border-purple-300 bg-purple-50 p-8 text-center rounded-2xl cursor-pointer" onClick={() => parchiInputRef.current.click()}>
              <span className="font-bold text-purple-700">Click to Upload Prescription</span>
              <input type="file" accept="image/*" className="hidden" ref={parchiInputRef} onChange={handleParchiChange} />
            </div>
            {selectedParchi && <p className="text-center text-xs mt-2">{selectedParchi.name}</p>}
            {parchiResult && <div className="mt-4 p-4 bg-slate-50 text-sm whitespace-pre-wrap rounded-xl">{formatAIText(parchiResult)}</div>}
            <button onClick={submitParchi} disabled={!selectedParchi || isParchiLoading} className="w-full mt-4 bg-purple-600 text-white font-bold py-3 rounded-xl">{isParchiLoading ? 'Analyzing...' : 'Analyze'}</button>
          </div>
        </div>
      )}

      {/* 5. X-Ray Scanner */}
      {showXrayModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white p-8 rounded-3xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between mb-6"><h3 className="text-2xl font-black text-indigo-600">Pneumonia X-Ray</h3><button onClick={closeXrayModal} className="font-bold text-slate-400">X</button></div>
            <div className="border-2 border-dashed border-indigo-300 bg-indigo-50 p-8 text-center rounded-2xl cursor-pointer" onClick={() => xrayInputRef.current.click()}>
              <span className="font-bold text-indigo-700">Upload Chest X-Ray</span>
              <input type="file" accept="image/*" className="hidden" ref={xrayInputRef} onChange={handleXrayChange} />
            </div>
            {selectedXray && <p className="text-center text-xs mt-2">{selectedXray.name}</p>}
            {xrayResult && !xrayResult.error && (
              <div className="mt-4 p-4 bg-slate-50 text-sm font-bold text-center rounded-xl">
                {String(xrayResult.result)} ({String(xrayResult.confidence)}%)
                <div className="text-xs font-normal mt-2 text-slate-500">{formatAIText(xrayResult.message)}</div>
              </div>
            )}
            {xrayResult && xrayResult.error && (
              <div className="mt-4 p-4 bg-red-50 text-red-600 rounded-xl text-sm text-center font-bold ring-1 ring-red-200">
                {String(xrayResult.error)}
              </div>
            )}
            <button onClick={submitXray} disabled={!selectedXray || isXrayLoading} className="w-full mt-4 bg-indigo-600 text-white font-bold py-3 rounded-xl">{isXrayLoading ? 'Scanning...' : 'Run Scan'}</button>
          </div>
        </div>
      )}

      {/* 6. Wellness Coach */}
      {showWellnessModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white p-8 rounded-3xl w-full max-w-3xl overflow-y-auto max-h-[90vh]">
            <div className="flex justify-between mb-6"><h3 className="text-2xl font-black text-orange-600">Wellness Coach</h3><button onClick={() => {setShowWellnessModal(false); setWellnessResult(null); setWellnessInput('');}} className="font-bold text-slate-400">X</button></div>
            {!wellnessResult ? (
              <form onSubmit={handleWellnessSubmit}>
                <textarea value={wellnessInput} onChange={e=>setWellnessInput(e.target.value)} className="w-full px-4 py-3 bg-slate-50 ring-1 ring-slate-200 rounded-xl outline-none" rows="4" placeholder="Apni health problem batayein..."></textarea>
                <button type="submit" disabled={isWellnessLoading} className="w-full mt-4 bg-orange-600 text-white font-bold py-3 rounded-xl">{isWellnessLoading ? 'Creating Plan...' : 'Get Plan'}</button>
              </form>
            ) : wellnessResult.error ? (
              <p className="text-red-500 font-bold">{wellnessResult.error}</p>
            ) : (
              <div className="space-y-4">
                <div className="p-4 bg-slate-50 rounded-xl"><h4 className="font-bold text-slate-500 mb-2">Root Cause</h4>{formatAIText(wellnessResult.root_cause)}</div>
                <div className="p-4 bg-emerald-50 rounded-xl"><h4 className="font-bold text-emerald-600 mb-2">Diet Plan</h4>{formatAIText(wellnessResult.diet_plan)}</div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-cyan-50 rounded-xl"><h4 className="font-bold text-cyan-600 mb-2">Lifestyle</h4>{formatAIText(wellnessResult.lifestyle_changes)}</div>
                  <div className="p-4 bg-amber-50 rounded-xl"><h4 className="font-bold text-amber-600 mb-2">Do's & Don'ts</h4>{formatAIText(wellnessResult.dos_and_donts)}</div>
                </div>
                <button onClick={()=>{setWellnessResult(null); setWellnessInput('');}} className="w-full mt-4 bg-slate-900 text-white font-bold py-3 rounded-xl">Ask Another Question</button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 7. Mental Health (Stress) */}
      {showStressModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white p-8 rounded-3xl w-full max-w-xl overflow-y-auto max-h-[90vh]">
            <div className="flex justify-between mb-6"><h3 className="text-2xl font-black text-pink-600">Mental Health Assessment</h3><button onClick={() => {setShowStressModal(false); setStressResult(null);}} className="font-bold text-slate-400">X</button></div>
            {!stressResult ? (
              <form onSubmit={handleStressSubmit} className="space-y-4">
                {[
                  {k: 'q1', l: '1. Neend kaisi aati hai?', opts: ['Bohat achhi', 'Baar-baar toot ti hai', 'Neend nahi aati']},
                  {k: 'q2', l: '2. Bina wajah darr/bechaini hoti hai?', opts: ['Nahi bilkul nahi', 'Kabhi-kabhi', 'Haan bohat zyada']},
                  {k: 'q3', l: '3. Kaam mein focus kaisa rehta hai?', opts: ['Poora dhyan lagta hai', 'Dhyan bhatakta hai', 'Bilkul focus nahi hota']},
                  {k: 'q4', l: '4. Daily activities mein interest?', opts: ['Bohat maza aata hai', 'Pehle se kam hai', 'Mann nahi lagta']},
                  {k: 'q5', l: '5. Jaldi thak jaate hain?', opts: ['Energetic rehta hu', 'Kabhi-kabhi thakan', 'Hamesha thakan rehti hai']}
                ].map(q => (
                  <div key={q.k}>
                    <label className="block text-xs font-bold text-slate-700 mb-1">{q.l}</label>
                    <select name={q.k} value={stressAnswers[q.k]} onChange={handleStressChange} className="w-full p-2.5 bg-slate-50 rounded-lg ring-1 ring-slate-200 text-sm" required>
                      <option value="">Select...</option>{q.opts.map(o=><option key={o} value={o}>{o}</option>)}
                    </select>
                  </div>
                ))}
                <button type="submit" disabled={isStressLoading} className="w-full bg-pink-600 text-white font-bold py-3 rounded-xl mt-4">{isStressLoading ? 'Analyzing...' : 'Submit Answers'}</button>
              </form>
            ) : stressResult.error ? (
              <p className="text-red-500 font-bold">{stressResult.error}</p>
            ) : (
              <div className="text-center">
                <h4 className={`text-2xl font-black mb-4 ${String(stressResult.stress_level).includes('High')?'text-red-600':'text-emerald-600'}`}>{String(stressResult.stress_level)} Stress</h4>
                <div className="bg-slate-50 p-4 rounded-xl text-left mb-4"><h5 className="font-bold text-slate-500 text-xs mb-1">Analysis</h5>{formatAIText(stressResult.analysis)}</div>
                <div className="bg-slate-50 p-4 rounded-xl text-left"><h5 className="font-bold text-slate-500 text-xs mb-1">Recommendation</h5>{formatAIText(stressResult.recommendation)}</div>
                <button onClick={()=>{setShowStressModal(false); setStressResult(null);}} className="w-full mt-6 bg-slate-900 text-white font-bold py-3 rounded-xl">Close</button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 8. Skin Analyzer */}
      {showSkinModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white p-8 rounded-3xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between mb-6"><h3 className="text-2xl font-black text-rose-600">Skin Analyzer</h3><button onClick={()=>{setShowSkinModal(false); setSkinResult(null);}} className="font-bold text-slate-400">X</button></div>
            <div className="border-2 border-dashed border-rose-300 bg-rose-50 p-8 text-center rounded-2xl cursor-pointer" onClick={() => skinInputRef.current.click()}>
              <span className="font-bold text-rose-700">Upload Skin/Rash Image</span>
              <input type="file" accept="image/*" className="hidden" ref={skinInputRef} onChange={handleSkinChange} />
            </div>
            {selectedSkinImage && <p className="text-center text-xs mt-2">{selectedSkinImage.name}</p>}
            {skinResult && !skinResult.error && (
              <div className="mt-4 p-4 bg-slate-50 rounded-xl text-left">
                <h4 className="font-black text-lg text-rose-600 border-b pb-2 mb-2">{String(skinResult.possible_condition)}</h4>
                <div className="mb-3">{formatAIText(skinResult.description)}</div>
                <div className="bg-white p-3 rounded-lg"><h5 className="font-bold text-xs text-slate-500 mb-1">Advice</h5>{formatAIText(skinResult.advice)}</div>
              </div>
            )}
            <button onClick={submitSkin} disabled={!selectedSkinImage || isSkinLoading} className="w-full mt-4 bg-rose-600 text-white font-bold py-3 rounded-xl">{isSkinLoading ? 'Analyzing...' : 'Analyze Skin'}</button>
          </div>
        </div>
      )}

      {/* 9. Lab Report Analyzer */}
      {showLabModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white p-8 rounded-3xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between mb-6"><h3 className="text-2xl font-black text-blue-600">Lab Report Analyzer</h3><button onClick={()=>{setShowLabModal(false); setLabResult(null);}} className="font-bold text-slate-400">X</button></div>
            <div className="border-2 border-dashed border-blue-300 bg-blue-50 p-8 text-center rounded-2xl cursor-pointer" onClick={() => labInputRef.current.click()}>
              <span className="font-bold text-blue-700">Upload Blood Test Image</span>
              <input type="file" accept="image/*" className="hidden" ref={labInputRef} onChange={handleLabChange} />
            </div>
            <p className="text-xs text-center text-slate-400 mt-2">Currently, only image files (JPG/PNG) are supported.</p>
            {selectedLabImage && <p className="text-center text-xs mt-2 font-medium">{selectedLabImage.name}</p>}
            {labResult && !labResult.error && (
              <div className="mt-4 space-y-3 text-left">
                <div className="bg-slate-50 p-4 rounded-xl"><h5 className="font-bold text-xs text-slate-500 mb-1">Summary</h5>{formatAIText(labResult.summary)}</div>
                <div className="bg-blue-50 p-4 rounded-xl"><h5 className="font-bold text-xs text-blue-600 mb-1">Abnormal Values</h5>{formatAIText(labResult.abnormal_values)}</div>
                <div className="bg-white ring-1 ring-slate-200 p-4 rounded-xl"><h5 className="font-bold text-xs text-slate-500 mb-1">Advice</h5>{formatAIText(labResult.advice)}</div>
              </div>
            )}
            <button onClick={submitLab} disabled={!selectedLabImage || isLabLoading} className="w-full mt-4 bg-blue-600 text-white font-bold py-3 rounded-xl">{isLabLoading ? 'Analyzing Report...' : 'Analyze Report'}</button>
          </div>
        </div>
      )}

      {/* 10. Food Scanner */}
      {showFoodModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white p-8 rounded-3xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between mb-6"><h3 className="text-2xl font-black text-yellow-600">AI Food Scanner</h3><button onClick={()=>{setShowFoodModal(false); setFoodResult(null);}} className="font-bold text-slate-400">X</button></div>
            <div className="border-2 border-dashed border-yellow-300 bg-yellow-50 p-8 text-center rounded-2xl cursor-pointer" onClick={() => foodInputRef.current.click()}>
              <span className="font-bold text-yellow-700">Upload Food Plate Image</span>
              <input type="file" accept="image/*" className="hidden" ref={foodInputRef} onChange={handleFoodChange} />
            </div>
            {selectedFoodImage && <p className="text-center text-xs mt-2">{selectedFoodImage.name}</p>}
            {foodResult && !foodResult.error && (
              <div className="mt-4 space-y-3 text-left">
                <div className="flex gap-4">
                  <div className="flex-1 bg-yellow-50 p-4 rounded-xl text-center"><p className="text-xs font-bold text-yellow-600 uppercase">Calories</p><p className="text-xl font-black">{foodResult.estimated_calories}</p></div>
                  <div className="flex-1 bg-emerald-50 p-4 rounded-xl text-center"><p className="text-xs font-bold text-emerald-600 uppercase">Protein</p><p className="text-xl font-black">{foodResult.protein_content}</p></div>
                  <div className="flex-1 bg-cyan-50 p-4 rounded-xl text-center"><p className="text-xs font-bold text-cyan-600 uppercase">Score</p><p className="text-xl font-black">{foodResult.health_score}/10</p></div>
                </div>
                <div className="bg-slate-50 p-4 rounded-xl"><h5 className="font-bold text-xs text-slate-500 mb-1">Detected Items</h5>{formatAIText(foodResult.food_items)}</div>
              </div>
            )}
            <button onClick={submitFood} disabled={!selectedFoodImage || isFoodLoading} className="w-full mt-4 bg-yellow-500 text-white font-bold py-3 rounded-xl">{isFoodLoading ? 'Scanning Plate...' : 'Scan Food'}</button>
          </div>
        </div>
      )}

      {/* RISK PREDICTOR MODAL (FIXED) */}
      {showRiskModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white p-8 rounded-3xl w-full max-w-md overflow-y-auto max-h-[90vh]">
            <div className="flex justify-between mb-6">
              <h3 className="text-2xl font-black text-emerald-600">Risk Predictor</h3>
              <button onClick={closeRiskModal} className="font-bold text-slate-400">X</button>
            </div>
            
            {!riskResult ? (
              <form onSubmit={handleRiskSubmit} className="space-y-5">
                <p className="text-sm text-slate-600 font-medium mb-6">Input vital metrics to receive an ML-based health risk analysis.</p>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">Age</label>
                    <input type="number" name="age" value={riskData.age} onChange={handleRiskChange} className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border-none ring-1 ring-slate-200 outline-none" required placeholder="45" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">BMI</label>
                    <input type="number" step="0.1" name="bmi" value={riskData.bmi} onChange={handleRiskChange} className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border-none ring-1 ring-slate-200 outline-none" required placeholder="24.5" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">Glucose</label>
                    <input type="number" name="glucose" value={riskData.glucose} onChange={handleRiskChange} className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border-none ring-1 ring-slate-200 outline-none" required placeholder="110" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">Blood Pres.</label>
                    <input type="number" name="bp" value={riskData.bp} onChange={handleRiskChange} className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border-none ring-1 ring-slate-200 outline-none" required placeholder="80" />
                  </div>
                </div>
                <button type="submit" disabled={isRiskLoading} className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 mt-4 rounded-xl transition-colors">
                  {isRiskLoading ? "Analyzing Vitals..." : "Calculate Risk"}
                </button>
              </form>
            ) : riskResult.error ? (
              <div className="text-center">
                <div className="mt-4 p-4 bg-red-50 text-red-600 rounded-xl text-sm font-bold ring-1 ring-red-200">
                  {String(riskResult.error)}
                </div>
                <button onClick={() => setRiskResult(null)} className="mt-4 w-full bg-slate-100 font-bold py-3 rounded-xl">Try Again</button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className={`p-6 rounded-2xl ring-1 ${String(riskResult.risk_level).includes('High') ? 'bg-red-50 ring-red-200' : 'bg-emerald-50 ring-emerald-200'}`}>
                  <h4 className={`text-2xl font-black text-center mb-2 ${String(riskResult.risk_level).includes('High') ? 'text-red-600' : 'text-emerald-600'}`}>
                    {String(riskResult.risk_level).includes('High') ? 'High Risk Detected' : 'Low Risk'}
                  </h4>
                  <div className="text-sm text-center text-slate-700 font-medium pb-2 border-b border-slate-200 mb-3">
                    {formatAIText(riskResult.message)}
                  </div>
                  
                  {riskResult.diet_plan && (
                    <div className="mt-3 p-3 bg-white rounded-xl ring-1 ring-slate-100">
                      <h5 className="font-bold text-xs uppercase tracking-widest text-slate-500 mb-2">AI Recommendation</h5>
                      <div className="text-sm font-medium text-slate-800 leading-relaxed">
                        {formatAIText(riskResult.diet_plan)}
                      </div>
                    </div>
                  )}
                  
                  {riskResult.recommended_specialty && (
                    <div className="mt-3 p-3 bg-white rounded-xl ring-1 ring-slate-100 flex items-center justify-between">
                      <span className="font-bold text-xs uppercase tracking-widest text-slate-500">Match Specialist</span>
                      <span className="text-sm font-black text-cyan-600">{String(riskResult.recommended_specialty)}</span>
                    </div>
                  )}
                </div>

                <div className="flex gap-3 mt-4">
                  <button type="button" onClick={closeRiskModal} className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 font-medium py-3 rounded-xl transition">
                    Close
                  </button>
                  <button type="button" onClick={() => { closeRiskModal(); }} className="flex-1 bg-slate-900 hover:bg-slate-800 text-white font-bold py-3 rounded-xl shadow-md transition-colors">
                    Find Doctor
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
}