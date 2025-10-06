import React from 'react';
import { Navigate } from 'react-router-dom';
import AdminLayout from '../layout/AdminLayout';

// --- FIX: Add the 'withLayout' prop ---
const AdminProtectedRoute = ({ children, withLayout = true }) => {
  const token = localStorage.getItem('adminToken');

  if (!token) {
    return <Navigate to="/login" />;
  }

  // If withLayout is false, it renders the page on its own
  if (!withLayout) {
    return children;
  }

  // Otherwise, it wraps the page in the main layout with the admin sidebar
  return <AdminLayout>{children}</AdminLayout>;
};

export default AdminProtectedRoute;