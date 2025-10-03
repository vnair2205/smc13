import React from 'react';
import { Navigate } from 'react-router-dom';
import AdminLayout from '../layout/AdminLayout';

const AdminProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('adminToken');

  if (!token) {
    // If no token, redirect to the login page
    return <Navigate to="/login" />;
  }

  // If there is a token, render the requested page within the admin layout
  return <AdminLayout>{children}</AdminLayout>;
};

export default AdminProtectedRoute;