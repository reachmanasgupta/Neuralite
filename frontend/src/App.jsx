import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast'; 
import Navbar from './components/Navbar'; 
import Chatbot from './components/Chatbot'; 
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register'; 
import Dashboard from './pages/Dashboard';
import DoctorDashboard from './pages/DoctorDashboard'; 
import Profile from './pages/Profile'; 
import ProtectedRoute from './components/ProtectedRoute'; 
import PublicRoute from './components/PublicRoute'; 
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import AdminDashboard from './pages/AdminDashboard';
import VideoCall from './pages/VideoCall';

function App() {

  // --- GLOBAL TRANSLATE ENGINE ---
  useEffect(() => {
    window.googleTranslateElementInit = () => {
      new window.google.translate.TranslateElement(
        { 
          pageLanguage: 'en', 
          // NAYA: includedLanguages line hata di gayi hai. Ab ALL languages support karega!
          layout: window.google.translate.TranslateElement.InlineLayout.SIMPLE 
        },
        'google_translate_element'
      );
    };

    const scriptId = 'google-translate-script';
    if (!document.getElementById(scriptId)) {
      const script = document.createElement('script');
      script.id = scriptId;
      script.src = '//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit';
      script.async = true;
      document.body.appendChild(script);
    }
  }, []);

  return (
    <BrowserRouter>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white transition-colors duration-300">
        
        <Toaster 
          position="top-center" 
          reverseOrder={false}
          toastOptions={{
            duration: 3000,
            style: {
              background: '#1e293b', 
              color: '#fff',
              borderRadius: '12px',
              padding: '16px',
              fontWeight: 'bold',
            },
            success: { iconTheme: { primary: '#10b981', secondary: '#fff' } },
            error: { iconTheme: { primary: '#ef4444', secondary: '#fff' } },
          }} 
        />
        
        <Navbar /> 
        <Chatbot /> 
        
        <main className="max-w-7xl mx-auto p-4 pt-8">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
            <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />
            <Route path="/forgot-password" element={<PublicRoute><ForgotPassword /></PublicRoute>} />
            <Route path="/reset-password/:token" element={<PublicRoute><ResetPassword /></PublicRoute>} />
            <Route path="/dashboard" element={<ProtectedRoute allowedRole="patient"><Dashboard /></ProtectedRoute>} />
            <Route path="/doctor-dashboard" element={<ProtectedRoute allowedRole="doctor"><DoctorDashboard /></ProtectedRoute>} />
            <Route path="/admin-dashboard" element={<ProtectedRoute allowedRole="admin"><AdminDashboard /></ProtectedRoute>} />
            <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
            <Route path="/room/:roomID" element={<VideoCall />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}

export default App;