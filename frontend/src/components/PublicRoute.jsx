import React from 'react';
import { Navigate } from 'react-router-dom';

function PublicRoute({ children }) {
  const token = localStorage.getItem('token');
  const userStr = localStorage.getItem('user');

  if (token && userStr) {
    try {
      const user = JSON.parse(userStr);
      if (user.role === 'admin') return <Navigate to="/admin-dashboard" replace />;
      return user.role === 'doctor' ? <Navigate to="/doctor-dashboard" replace /> : <Navigate to="/dashboard" replace />;
    } catch (error) {
      localStorage.clear();
    }
  }
  return children;
}
export default PublicRoute;