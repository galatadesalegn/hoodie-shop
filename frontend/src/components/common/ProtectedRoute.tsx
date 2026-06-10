import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  roles?: string[];
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, roles }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-studio dark:bg-noir">
        <div className="w-8 h-8 border-2 border-noir/10 dark:border-white/10 border-t-noir dark:border-t-white rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    // Check if we are trying to access /admin and redirect to admin login if so
    if (location.pathname.startsWith('/admin')) {
      return <Navigate to="/admin/login" state={{ from: location }} replace />;
    }
    // Redirect to login but save the current location to redirect back after login
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (roles && !roles.includes(user.role)) {
    console.log('Role mismatch redirecting to /:', { userRole: user.role, requiredRoles: roles });
    // Role not authorized
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
