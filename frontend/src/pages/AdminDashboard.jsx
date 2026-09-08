import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

export default function AdminDashboard() {
  const [stats, setStats] = useState({ totalPatients: 0, totalDoctors: 0, totalAppointments: 0 });
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchAdminData = async () => {
      const token = localStorage.getItem('token');
      const userStr = localStorage.getItem('user');

      if (!token || !userStr) {
        navigate('/login');
        return;
      }

      try {
        const parsedUser = JSON.parse(userStr);
        if (parsedUser.role !== 'admin') {
          navigate(parsedUser.role === 'doctor' ? '/doctor-dashboard' : '/dashboard');
          return;
        }

        // Fetch Stats
        const statsRes = await fetch('http://localhost:5000/api/admin/stats', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const statsData = await statsRes.json();
        if (statsRes.ok) setStats(statsData.stats);

        // Fetch Users
        const usersRes = await fetch('http://localhost:5000/api/admin/users', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const usersData = await usersRes.json();
        if (usersRes.ok) setUsers(usersData.users);

      } catch (error) {
        console.error("Admin Fetch Error:", error);
        toast.error("Failed to load admin data.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchAdminData();
  }, [navigate]);

  const handleDeleteUser = async (userId, userName) => {
    if (!window.confirm(`Are you sure you want to delete user: ${userName}? This action cannot be undone.`)) return;

    const token = localStorage.getItem('token');
    try {
      const response = await fetch(`http://localhost:5000/api/admin/user/${userId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      const data = await response.json();
      if (response.ok) {
        toast.success("User deleted successfully!");
        setUsers(users.filter(user => user._id !== userId)); // UI se turant hatao
      } else {
        toast.error(data.message || "Failed to delete user.");
      }
    } catch (error) {
      console.error("Delete Error:", error);
      toast.error("Server error while deleting user.");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center text-indigo-600 dark:text-indigo-400">
        <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="font-bold tracking-widest text-sm uppercase">Loading Control Room...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fafafa] dark:bg-[#030712] transition-colors duration-500 font-sans text-slate-900 dark:text-slate-100 pt-24 pb-20 relative">
      
      {/* Background Ambience */}
      <div className="absolute top-0 left-[50%] -translate-x-1/2 w-[800px] h-[400px] bg-gradient-to-b from-indigo-500/10 to-transparent dark:from-indigo-600/10 rounded-full blur-[120px] pointer-events-none z-0"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* HEADER */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10">
          <div>
            <p className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-widest mb-1.5">
              System Control Room
            </p>
            <h1 className="text-3xl md:text-5xl font-black tracking-tight">
              Admin Dashboard 👑
            </h1>
          </div>
          <div className="flex items-center gap-3">
            <button 
              onClick={handleLogout}
              className="text-sm font-bold text-red-600 dark:text-red-400 bg-red-50 hover:bg-red-100 dark:bg-red-900/20 dark:hover:bg-red-900/40 px-6 py-2.5 rounded-full transition-colors ring-1 ring-red-100 dark:ring-red-900/50 shadow-sm"
            >
              Secure Logout
            </button>
          </div>
        </div>

        {/* OVERVIEW STATS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl ring-1 ring-slate-200 dark:ring-slate-800 shadow-sm flex flex-col justify-center">
            <div className="flex justify-between items-start mb-2">
              <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">Total Patients</p>
              <span className="p-2 bg-cyan-50 dark:bg-cyan-900/20 text-cyan-600 dark:text-cyan-400 rounded-lg"><svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg></span>
            </div>
            <h4 className="text-4xl font-black text-slate-900 dark:text-white">{stats.totalPatients}</h4>
          </div>

          <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl ring-1 ring-slate-200 dark:ring-slate-800 shadow-sm flex flex-col justify-center">
            <div className="flex justify-between items-start mb-2">
              <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">Total Doctors</p>
              <span className="p-2 bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 rounded-lg"><svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg></span>
            </div>
            <h4 className="text-4xl font-black text-slate-900 dark:text-white">{stats.totalDoctors}</h4>
          </div>

          <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl ring-1 ring-slate-200 dark:ring-slate-800 shadow-sm flex flex-col justify-center">
            <div className="flex justify-between items-start mb-2">
              <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">Total Appointments</p>
              <span className="p-2 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 rounded-lg"><svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg></span>
            </div>
            <h4 className="text-4xl font-black text-slate-900 dark:text-white">{stats.totalAppointments}</h4>
          </div>
        </div>

        {/* USERS MANAGEMENT TABLE */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl ring-1 ring-slate-200 dark:ring-slate-800 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-100 dark:border-slate-800">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">User Management</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">View and manage all registered patients and doctors.</p>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-800/50 text-xs uppercase tracking-widest text-slate-500 dark:text-slate-400">
                  <th className="p-5 font-bold">User Details</th>
                  <th className="p-5 font-bold">Role</th>
                  <th className="p-5 font-bold">Joined On</th>
                  <th className="p-5 font-bold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50">
                {users.length > 0 ? (
                  users.map((user) => (
                    <tr key={user._id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                      <td className="p-5">
                        <p className="text-sm font-bold text-slate-900 dark:text-white">{user.name}</p>
                        <p className="text-xs font-medium text-slate-500 dark:text-slate-400">{user.email}</p>
                      </td>
                      <td className="p-5">
                        <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider ${
                          user.role === 'doctor' 
                            ? 'bg-purple-50 text-purple-600 dark:bg-purple-900/20 dark:text-purple-400 ring-1 ring-purple-200 dark:ring-purple-800/50' 
                            : 'bg-cyan-50 text-cyan-600 dark:bg-cyan-900/20 dark:text-cyan-400 ring-1 ring-cyan-200 dark:ring-cyan-800/50'
                        }`}>
                          {user.role}
                        </span>
                      </td>
                      <td className="p-5 text-sm text-slate-600 dark:text-slate-300 font-medium">
                        {new Date(user.createdAt).toLocaleDateString('en-IN')}
                      </td>
                      <td className="p-5 text-right">
                        <button 
                          onClick={() => handleDeleteUser(user._id, user.name)}
                          className="px-4 py-2 bg-red-50 hover:bg-red-100 dark:bg-red-900/20 dark:hover:bg-red-900/40 text-red-600 dark:text-red-400 text-xs font-bold rounded-xl transition-colors ring-1 ring-red-100 dark:ring-red-900/50"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="4" className="p-10 text-center text-slate-500 font-medium">No users found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
}