import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';

export default function ResetPassword() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  
  // URL se token nikal rahe hain
  const { token } = useParams();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      alert("Passwords match nahi ho rahe hain!");
      return;
    }

    try {
      const response = await fetch(`http://localhost:5000/api/auth/reset-password/${token}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ password }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage("Password successfully reset ho gaya hai! Ab aap login kar sakte hain.");
        setTimeout(() => {
          navigate('/login');
        }, 2000);
      } else {
        alert(data.message || "Kuch galat ho gaya.");
      }
    } catch (error) {
      console.error("Reset Error:", error);
      alert("Server se connect nahi ho paya.");
    }
  };

  return (
    <div className="flex justify-center items-center min-h-[75vh] px-4">
      <div className="bg-white dark:bg-gray-800 p-8 md:p-10 rounded-3xl shadow-xl border border-gray-100 dark:border-gray-700 w-full max-w-md transition-all">
        
        <div className="text-center mb-8">
          <div className="text-5xl mb-4">🔑</div>
          <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white mb-2">New Password</h2>
          <p className="text-gray-500 dark:text-gray-400">Enter your new secure password below</p>
        </div>

        {message ? (
          <div className="bg-teal-50 dark:bg-teal-900/30 border border-teal-200 dark:border-teal-800 rounded-xl p-4 text-center">
            <p className="text-teal-700 dark:text-teal-400 font-medium">{message}</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">New Password</label>
              <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary outline-none"
                placeholder="••••••••"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Confirm New Password</label>
              <input 
                type="password" 
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary outline-none"
                placeholder="••••••••"
                required
              />
            </div>
            
            <button 
              type="submit" 
              className="w-full bg-primary hover:bg-secondary text-white font-bold py-3 rounded-xl transition-all shadow-md"
            >
              Update Password
            </button>
          </form>
        )}

      </div>
    </div>
  );
}