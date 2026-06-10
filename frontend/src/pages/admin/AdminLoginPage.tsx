import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Shield, Eye, EyeOff, AlertCircle, ArrowRight, Lock, Command } from 'lucide-react';
import api from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import { Link } from 'react-router-dom';

const AdminLoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      // The login service returns the user data
      const { data } = await api.post('/auth/login', { email, password });
      const loggedUser = data.data.user;

      if (loggedUser.role !== 'admin' && loggedUser.role !== 'superadmin') {
        setError('Access denied. This terminal is for administrators only.');
        await api.post('/auth/logout'); // Log them out immediately
        setLoading(false);
        return;
      }

      // If they are admin, proceed to store tokens and update state
      localStorage.setItem('accessToken', data.data.accessToken);
      // We manually trigger a refresh or let the context handle it, but navigate is safe here
      window.location.href = '/admin'; // Hard redirect to ensure clean admin state
    } catch (err: any) {
      setError(err.response?.data?.message || 'Invalid administrator credentials.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA] dark:bg-noir flex flex-col transition-colors duration-500 overflow-x-hidden">
      {/* Admin Navbar */}
      <nav className="w-full px-8 py-6 flex justify-between items-center bg-transparent relative z-20">
        <div className="flex items-center gap-3">
          <Link to="/" className="font-bold text-xl tracking-tighter text-[#1A2B88] dark:text-white">
            SecureAuth
          </Link>
          <span className="bg-noir/5 dark:bg-white/10 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-widest text-noir/40 dark:text-white/40">
            Admin Terminal
          </span>
        </div>
        <div className="flex items-center gap-8">
          <Link to="#" className="text-sm text-noir/40 dark:text-white/40 hover:text-noir transition-colors">Documentation</Link>
          <Link to="/" className="text-sm font-bold text-[#1A2B88] dark:text-white border-b-2 border-[#1A2B88] pb-1">Storefront</Link>
        </div>
      </nav>

      <div className="flex-1 flex flex-col items-center justify-center p-6 pb-20">
        <div className="w-full max-w-[440px]">
          {/* Header */}
          <div className="text-center mb-10">
            <div className="w-16 h-16 bg-[#1A2B88] rounded-2xl flex items-center justify-center text-white mx-auto mb-6 shadow-xl shadow-[#1A2B88]/20">
              <Shield size={32} />
            </div>
            <h1 className="text-[32px] font-bold text-noir dark:text-white tracking-tight mb-3">System Access</h1>
            <p className="text-noir/40 dark:text-white/40 text-sm">
              Enter your administrative credentials to manage the platform.
            </p>
          </div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-white/5 border border-noir/5 dark:border-white/5 p-10 rounded-[32px] shadow-[0_8px_30px_rgb(0,0,0,0.04)]"
          >
            {error && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex items-center gap-3 bg-red-50 text-red-500 px-4 py-3 rounded-xl text-xs mb-6 border border-red-100"
              >
                <AlertCircle size={16} className="shrink-0" />
                {error}
              </motion.div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-noir/70 dark:text-white/70 ml-1">Admin Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="admin@enterprise.com"
                  className="w-full bg-white dark:bg-white/5 border border-noir/10 dark:border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#1A2B88]/10 transition-all text-noir dark:text-white placeholder:text-noir/20"
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between ml-1">
                  <label className="block text-sm font-medium text-noir/70 dark:text-white/70">Security Key</label>
                </div>
                <div className="relative">
                  <input
                    type={showPass ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    placeholder="••••••••"
                    className="w-full bg-white dark:bg-white/5 border border-noir/10 dark:border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#1A2B88]/10 transition-all text-noir dark:text-white placeholder:text-noir/20"
                  />
                  <button type="button" onClick={() => setShowPass((s) => !s)} className="absolute right-4 top-1/2 -translate-y-1/2 text-noir/20 dark:text-white/20 hover:text-noir transition-colors">
                    {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#1A2B88] text-white text-sm font-bold py-4 rounded-xl transition-all hover:bg-[#0E21A0] shadow-lg shadow-[#1A2B88]/10 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading ? 'Authenticating...' : (
                  <>
                    Initialize Session <ArrowRight size={18} />
                  </>
                )}
              </button>

              <div className="pt-4 flex items-center justify-center gap-2 text-[10px] font-bold text-noir/20 dark:text-white/20 uppercase tracking-[0.2em]">
                <Command size={12} /> Secure Environment
              </div>
            </form>
          </motion.div>
        </div>
      </div>

      {/* Footer */}
      <footer className="w-full px-8 py-8 flex flex-wrap justify-center items-center gap-6 text-[11px] text-noir/30 dark:text-white/30 border-t border-noir/5 dark:border-white/5">
        <span className="font-bold">SecureAuth Terminal v2.4</span>
        <Link to="#" className="hover:text-noir transition-colors">Security Policy</Link>
        <Link to="#" className="hover:text-noir transition-colors">Audit Logs</Link>
        <span>© 2026 SecureAuth Inc. Enterprise Edition.</span>
      </footer>
    </div>
  );
};

export default AdminLoginPage;
