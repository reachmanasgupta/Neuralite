import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

export default function Profile() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  // Profile Form State
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    age: '',
    gender: '',
    bloodGroup: '',
    phone: '',
    address: ''
  });

  // --- FIX: Ironclad Data Loading Logic ---
  useEffect(() => {
    const loadProfileData = async () => {
      const storedUser = localStorage.getItem('user');
      const token = localStorage.getItem('token');

      if (!storedUser || !token) {
        navigate('/login');
        return;
      }

      // 1. Pehle local storage se data dikhayein (Fast loading)
      let parsedUser = JSON.parse(storedUser);
      setUser(parsedUser);
      
      setFormData({
        name: parsedUser.name || '',
        email: parsedUser.email || '',
        age: parsedUser.age || '',
        gender: parsedUser.gender || '',
        bloodGroup: parsedUser.bloodGroup || '',
        phone: parsedUser.phone || '',
        address: parsedUser.address || ''
      });

      // 2. Background mein API se fresh data fetch karne ka try karein (Syncing)
      try {
        const response = await fetch('http://localhost:5000/api/auth/me', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (response.ok) {
          const freshData = await response.json();
          // Purane aur naye data ko jodd dein
          const latestUser = { ...parsedUser, ...freshData };
          
          localStorage.setItem('user', JSON.stringify(latestUser));
          setUser(latestUser);
          
          setFormData(prev => ({
            ...prev,
            name: latestUser.name || prev.name,
            age: latestUser.age || prev.age,
            gender: latestUser.gender || prev.gender,
            bloodGroup: latestUser.bloodGroup || prev.bloodGroup,
            phone: latestUser.phone || prev.phone,
            address: latestUser.address || prev.address
          }));
        }
      } catch (error) {
        // Agar backend error de, toh localStorage wala data toh rahega hi
        console.log("Using local cached data.");
      }
    };

    loadProfileData();
  }, [navigate]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    const token = localStorage.getItem('token');

    try {
      const response = await fetch('http://localhost:5000/api/auth/update-profile', {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      const textData = await response.text();
      let data;
      try { 
        data = JSON.parse(textData); 
      } catch (err) {
        toast.error("Backend API issue! Make sure your server is restarted.");
        setIsLoading(false);
        return;
      }

      if (response.ok) {
        toast.success("Profile updated successfully! 🎉");
        
        // --- FIX: Form ka poora data localStorage mein Force Save karna ---
        const updatedUser = { ...user, ...formData };
        
        // Agar backend se naya object aaya hai toh usko bhi merge karein
        if (data.user) {
           Object.assign(updatedUser, data.user);
        }

        localStorage.setItem('user', JSON.stringify(updatedUser));
        setUser(updatedUser);
      } else {
        toast.error(data.message || "Failed to update profile.");
      }
    } catch (error) {
      console.error("Profile Update Error:", error);
      toast.error("Unable to connect to the server.");
    } finally {
      setIsLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center text-cyan-600 dark:text-cyan-400">
        <div className="w-10 h-10 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="font-bold tracking-widest text-sm uppercase">Loading Profile...</p>
      </div>
    );
  }

  return (
    <div className="min-h-[85vh] bg-[#fafafa] dark:bg-[#030712] transition-colors duration-500 font-sans text-slate-900 dark:text-slate-100 py-12 relative">
      
      {/* Background Ambience */}
      <div className="absolute top-0 left-[50%] -translate-x-1/2 w-[600px] h-[300px] bg-gradient-to-b from-cyan-500/10 to-transparent dark:from-cyan-600/10 rounded-full blur-[100px] pointer-events-none z-0"></div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Header */}
        <div className="mb-8 text-center md:text-left">
          <h1 className="text-3xl md:text-4xl font-black tracking-tight text-slate-900 dark:text-white mb-2">
            My Profile ⚙️
          </h1>
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
            Manage your personal and basic medical details.
          </p>
        </div>

        {/* Profile Card */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-xl ring-1 ring-slate-200 dark:ring-slate-800 overflow-hidden">
          
          <div className="p-6 md:p-10">
            <form onSubmit={handleSubmit} className="space-y-8">
              
              {/* Account Information Section */}
              <div>
                <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-4 border-b border-slate-100 dark:border-slate-800 pb-2">Account Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-widest mb-1.5">Full Name</label>
                    <input type="text" name="name" value={formData.name} onChange={handleChange} className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border-none ring-1 ring-slate-200 dark:ring-slate-700 focus:ring-2 focus:ring-cyan-500 text-slate-900 dark:text-white outline-none" required placeholder="Your full name" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-widest mb-1.5">Email Address</label>
                    <input type="email" name="email" value={formData.email} onChange={handleChange} className="w-full px-4 py-3 rounded-xl bg-slate-100 dark:bg-slate-800/50 border-none ring-1 ring-slate-200 dark:ring-slate-700 text-slate-500 dark:text-slate-400 outline-none cursor-not-allowed" disabled title="Email cannot be changed" />
                  </div>
                </div>
              </div>

              {/* Medical & Personal Details Section */}
              <div>
                <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-4 border-b border-slate-100 dark:border-slate-800 pb-2">Medical & Contact Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-widest mb-1.5">Age</label>
                    <input type="number" name="age" value={formData.age} onChange={handleChange} className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border-none ring-1 ring-slate-200 dark:ring-slate-700 focus:ring-2 focus:ring-cyan-500 text-slate-900 dark:text-white outline-none" placeholder="e.g. 25" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-widest mb-1.5">Gender</label>
                    <select name="gender" value={formData.gender} onChange={handleChange} className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border-none ring-1 ring-slate-200 dark:ring-slate-700 focus:ring-2 focus:ring-cyan-500 text-slate-900 dark:text-white outline-none appearance-none">
                      <option value="">Select Gender</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-widest mb-1.5">Blood Group</label>
                    <select name="bloodGroup" value={formData.bloodGroup} onChange={handleChange} className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border-none ring-1 ring-slate-200 dark:ring-slate-700 focus:ring-2 focus:ring-cyan-500 text-slate-900 dark:text-white outline-none appearance-none">
                      <option value="">Select Group</option>
                      <option value="A+">A+</option>
                      <option value="A-">A-</option>
                      <option value="B+">B+</option>
                      <option value="B-">B-</option>
                      <option value="O+">O+</option>
                      <option value="O-">O-</option>
                      <option value="AB+">AB+</option>
                      <option value="AB-">AB-</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-widest mb-1.5">Phone Number</label>
                    <input type="tel" name="phone" value={formData.phone} onChange={handleChange} className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border-none ring-1 ring-slate-200 dark:ring-slate-700 focus:ring-2 focus:ring-cyan-500 text-slate-900 dark:text-white outline-none" placeholder="+91 9876543210" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-widest mb-1.5">Address</label>
                    <input type="text" name="address" value={formData.address} onChange={handleChange} className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border-none ring-1 ring-slate-200 dark:ring-slate-700 focus:ring-2 focus:ring-cyan-500 text-slate-900 dark:text-white outline-none" placeholder="Your current city/address" />
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 pt-6 mt-6 border-t border-slate-100 dark:border-slate-800">
                <button type="button" onClick={() => navigate(user.role === 'doctor' ? '/doctor-dashboard' : '/dashboard')} className="flex-1 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold py-3.5 rounded-xl transition-colors">
                  Back to Dashboard
                </button>
                <button type="submit" disabled={isLoading} className="flex-1 bg-cyan-600 hover:bg-cyan-700 disabled:bg-cyan-400 text-white font-bold py-3.5 rounded-xl shadow-md transition-colors flex justify-center items-center gap-2">
                  {isLoading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Saving...
                    </>
                  ) : (
                    "Save Changes"
                  )}
                </button>
              </div>

            </form>
          </div>
        </div>
      </div>
    </div>
  );
}