import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import ProtectedRoute from './components/ProtectedRoute';

const AdminLayout = lazy(() => import('./components/AdminLayout'));
const AdminDashboard = lazy(() => import('./pages/AdminDashboard'));
const AdminProducts = lazy(() => import('./pages/AdminProducts'));
const AdminOrders = lazy(() => import('./pages/AdminOrders'));
const AdminCustomers = lazy(() => import('./pages/AdminCustomers'));
const AdminSettings = lazy(() => import('./pages/AdminSettings'));
const AdminAdmins = lazy(() => import('./pages/AdminAdmins'));
const AdminSecurityLogs = lazy(() => import('./pages/AdminSecurityLogs'));
const VerifyEmailChangePage = lazy(() => import('./pages/VerifyEmailChangePage'));
const AdminLoginPage = lazy(() => import('./pages/AdminLoginPage'));

const Loader = () => (
  <div className="min-h-screen bg-studio dark:bg-noir flex items-center justify-center transition-colors duration-500">
    <div className="flex flex-col items-center gap-4">
      <div className="w-10 h-10 border-2 border-noir dark:border-white border-t-transparent rounded-full animate-spin opacity-20" />
      <span className="font-bold text-2xl tracking-tighter text-noir dark:text-white opacity-40">AXIS Admin</span>
    </div>
  </div>
);

const App: React.FC = () => {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <Suspense fallback={<Loader />}>
            <Routes>
              <Route path="/login" element={<AdminLoginPage />} />
              <Route path="/verify-email-change" element={<VerifyEmailChangePage />} />

              <Route path="/" element={
                <ProtectedRoute roles={['admin', 'superadmin']}>
                  <AdminLayout />
                </ProtectedRoute>
              }>
                <Route index element={<AdminDashboard />} />
                <Route path="products" element={<AdminProducts />} />
                <Route path="orders" element={<AdminOrders />} />
                <Route path="customers" element={<AdminCustomers />} />
                <Route path="settings" element={<AdminSettings />} />
                <Route path="admins" element={<AdminAdmins />} />
                <Route path="security-logs" element={<AdminSecurityLogs />} />
              </Route>

              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Suspense>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
};

export default App;
