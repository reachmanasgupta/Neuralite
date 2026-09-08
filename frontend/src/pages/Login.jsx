import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast'; 

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  // NAYE STATES
  const [showOTP, setShowOTP] = useState(false);
  const [otp, setOtp] = useState('');
  const [verifyEmail, setVerifyEmail] = useState('');
  const [showPassword, setShowPassword] = useState(false); // <-- Eye icon ke liye

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success("Logged in successfully!");
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        
        if (data.user.role === 'doctor') {
          navigate('/doctor-dashboard');
        } else {
          navigate('/dashboard');
        }
      } else {
        if (data.requireOTP) {
          setVerifyEmail(data.email || email);
          setShowOTP(true); 
          toast.success(data.message || "OTP sent to your email!");
        } else {
          toast.error(data.message || "Invalid Email or Password");
        }
      }
    } catch (error) {
      console.error("Login Error:", error);
      toast.error("Unable to connect to the server.");
    }
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:5000/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: verifyEmail, otp }),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success("Account verified and logged in! 🎉");
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        
        if (data.user.role === 'doctor') navigate('/doctor-dashboard');
        else navigate('/dashboard');
      } else {
        toast.error(data.message || "Invalid OTP. Please try again.");
      }
    } catch (error) {
      console.error("OTP Verification Error:", error);
      toast.error("Server error during verification.");
    }
  };

  return (
    <div className="flex justify-center items-center min-h-[75vh] px-4">
      <div className="bg-white dark:bg-gray-800 p-8 md:p-10 rounded-3xl shadow-xl border border-gray-100 dark:border-gray-700 w-full max-w-md transition-all transform hover:-translate-y-1">
        
        <div className="text-center mb-8">
          <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white mb-2">
            {showOTP ? "Verify Your Email" : "Welcome Back"}
          </h2>
          <p className="text-gray-500 dark:text-gray-400">
            {showOTP ? `Enter the 6-digit OTP sent to ${verifyEmail}` : "Sign in to your Neuralite account"}
          </p>
        </div>
        
        {!showOTP ? (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Email Address</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary outline-none" placeholder="name@example.com" required />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Password</label>
              <div className="relative">
                <input 
                  type={showPassword ? "text" : "password"} 
                  value={password} 
                  onChange={(e) => setPassword(e.target.value)} 
                  className="w-full px-4 py-3 pr-12 rounded-xl border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary outline-none" 
                  placeholder="••••••••" 
                  required 
                />
                <button 
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 px-4 flex items-center text-gray-500 hover:text-primary transition-colors focus:outline-none"
                >
                  {showPassword ? (
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.29 3.29m0 0a10.05 10.05 0 015.188-1.57c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0l-3.29-3.29" /></svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                  )}
                </button>
              </div>
              <div className="text-right mt-2">
                <Link to="/forgot-password" className="text-sm font-semibold text-primary dark:text-teal-400 hover:underline">Forgot Password?</Link>
              </div>
            </div>
            <button type="submit" className="w-full bg-primary hover:bg-secondary text-white font-bold py-3 rounded-xl shadow-md mt-2">Sign In</button>
          </form>
        ) : (
          <form onSubmit={handleVerifyOTP} className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">6-Digit OTP</label>
              <input type="text" maxLength="6" value={otp} onChange={(e) => setOtp(e.target.value)} className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white text-center text-xl tracking-widest focus:ring-2 focus:ring-primary outline-none" placeholder="123456" required />
            </div>
            <button type="submit" className="w-full bg-teal-600 hover:bg-teal-700 text-white font-bold py-3 rounded-xl shadow-md">Verify & Login</button>
            <button type="button" onClick={() => setShowOTP(false)} className="w-full bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-3 rounded-xl shadow-sm mt-2">Back to Login</button>
          </form>
        )}
        
        {!showOTP && (
          <p className="mt-8 text-center text-gray-600 dark:text-gray-400 text-sm">
            Don't have an account? <Link to="/register" className="text-primary font-bold hover:underline">Create one now</Link>
          </p>
        )}

      </div>
    </div>
  );
}