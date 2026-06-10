import React from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import AdminSidebar from './AdminSidebar';
import { useAuth } from '../contexts/AuthContext';

const AdminLayout: React.FC = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (user.role !== 'admin' && user.role !== 'superadmin') {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="min-h-screen bg-[#F8F9FA] dark:bg-noir transition-colors">
      <AdminSidebar />
      <main className="lg:pl-[240px] transition-all duration-300 min-h-screen">
        <div className="max-w-[1600px] mx-auto p-6 lg:p-10 pt-20 lg:pt-10">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;
