import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import ProtectedRoute from './components/common/ProtectedRoute';

// Customer pages
const HomePage = lazy(() => import('./pages/customer/HomePage'));
const ShopPage = lazy(() => import('./pages/customer/ShopPage'));
const ProductDetailPage = lazy(() => import('./pages/customer/ProductDetailPage'));
const CartPage = lazy(() => import('./pages/customer/CartPage'));
const LoginPage = lazy(() => import('./pages/customer/LoginPage'));
const RegisterPage = lazy(() => import('./pages/customer/RegisterPage'));
const AccountPage = lazy(() => import('./pages/customer/AccountPage'));
const CheckoutPage = lazy(() => import('./pages/customer/CheckoutPage'));
const PaymentPage = lazy(() => import('./pages/customer/PaymentPage'));

// Admin pages
const AdminLayout = lazy(() => import('./components/admin/AdminLayout'));
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard'));
const AdminProducts = lazy(() => import('./pages/admin/AdminProducts'));
const AdminOrders = lazy(() => import('./pages/admin/AdminOrders'));
const AdminCustomers = lazy(() => import('./pages/admin/AdminCustomers'));
const AdminSettings = lazy(() => import('./pages/admin/AdminSettings'));
const AdminAdmins = lazy(() => import('./pages/admin/AdminAdmins'));
const AdminSecurityLogs = lazy(() => import('./pages/admin/AdminSecurityLogs'));
const AdminLoginPage = lazy(() => import('./pages/admin/AdminLoginPage'));

const Loader = () => (
  <div className="min-h-screen bg-studio dark:bg-noir flex items-center justify-center transition-colors duration-500">
    <div className="flex flex-col items-center gap-4">
      <div className="w-10 h-10 border-2 border-noir dark:border-white border-t-transparent dark:border-t-transparent rounded-full animate-spin opacity-20" />
      <span className="font-bold text-2xl tracking-tighter text-noir dark:text-white opacity-40">AXIS</span>
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
              {/* Customer Routes */}
              <Route path="/" element={<HomePage />} />
              <Route path="/shop" element={<ShopPage />} />
              <Route path="/product/:slug" element={<ProductDetailPage />} />
              <Route path="/cart" element={<CartPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              
              {/* Admin Login Route */}
              <Route path="/admin/login" element={<AdminLoginPage />} />
              
              <Route path="/account" element={
                <ProtectedRoute>
                  <AccountPage />
                </ProtectedRoute>
              } />

              <Route path="/checkout" element={
                <ProtectedRoute>
                  <CheckoutPage />
                </ProtectedRoute>
              } />

              <Route path="/payment" element={
                <ProtectedRoute>
                  <PaymentPage />
                </ProtectedRoute>
              } />

              {/* Admin Routes */}
              <Route path="/admin" element={
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

              {/* Fallback */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Suspense>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
};

export default App;
