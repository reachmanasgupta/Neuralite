import React from 'react';
import { Navigate } from 'react-router-dom';

function ProtectedRoute({ children, allowedRole }) {
  const token = localStorage.getItem('token');
  const userStr = localStorage.getItem('user');

  if (!token || !userStr) return <Navigate to="/login" replace />;

  try {
    const user = JSON.parse(userStr);

    if (allowedRole && user.role !== allowedRole) {
      if (user.role === 'admin') return <Navigate to="/admin-dashboard" replace />;
      return user.role === 'doctor' ? <Navigate to="/doctor-dashboard" replace /> : <Navigate to="/dashboard" replace />;
    }

    return children;
  } catch (error) {
    localStorage.clear();
    return <Navigate to="/login" replace />;
  }
}
export default ProtectedRoute;