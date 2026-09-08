import React, { useState } from 'react';
import { Link } from 'react-router-dom';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      // Backend ke API route par POST request bhej rahe hain
      const response = await fetch('http://localhost:5000/api/auth/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok) {
        console.log("Reset link sent to:", email);
        setIsSubmitted(true); // Success hone par UI change hoga
      } else {
        alert(data.message); // Agar user nahi mila toh error message dikhayega
      }
    } catch (error) {
      console.error("Error connecting to server:", error);
      alert("Server se connect nahi ho paya. Please check your backend.");
    }
  };

  return (
    <div className="flex justify-center items-center min-h-[75vh] px-4">
      <div className="bg-white dark:bg-gray-800 p-8 md:p-10 rounded-3xl shadow-xl border border-gray-100 dark:border-gray-700 w-full max-w-md transition-all transform hover:-translate-y-1">
        
        <div className="text-center mb-8">
          <div className="text-5xl mb-4">🔐</div>
          <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white mb-2">Reset Password</h2>
          <p className="text-gray-500 dark:text-gray-400">
            {isSubmitted 
              ? "Check your email for the reset link!" 
              : "Enter your email to receive a reset link"}
          </p>
        </div>
        
        {!isSubmitted ? (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Email Address</label>
              <input 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent transition-all outline-none"
                placeholder="name@example.com"
                required
              />
            </div>
            
            <button 
              type="submit" 
              className="w-full bg-primary hover:bg-secondary text-white font-bold py-3 rounded-xl transition-all shadow-md transform hover:-translate-y-0.5"
            >
              Send Reset Link
            </button>
          </form>
        ) : (
          <div className="bg-teal-50 dark:bg-teal-900/30 border border-teal-200 dark:border-teal-800 rounded-xl p-4 text-center">
            <p className="text-teal-700 dark:text-teal-400 font-medium">
              We've sent a password reset link to <strong>{email}</strong>. Please check your inbox.
            </p>
          </div>
        )}
        
        <p className="mt-8 text-center text-gray-600 dark:text-gray-400 text-sm">
          Remembered your password?{' '}
          <Link to="/login" className="text-primary dark:text-teal-400 font-bold hover:underline">
            Back to Login
          </Link>
        </p>

      </div>
    </div>
  );
}