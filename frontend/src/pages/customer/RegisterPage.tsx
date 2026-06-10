import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Eye, EyeOff, AlertCircle, Zap, ArrowLeft } from 'lucide-react';
import api from '../../services/api';

const RegisterPage: React.FC = () => {
  const [form, setForm] = useState({ name: '', username: '', email: '', password: '', confirmPassword: '' });
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    // Security check: Do not allow superadmin email registration from public website
    if (form.email.toLowerCase().includes('superadmin') || form.email.toLowerCase() === 'superadmin@axis.com') {
      setError('Unauthorized email address.');
      return;
    }

    setLoading(true);
    try {
      // Automatically generate a username if not provided, or use email prefix
      const generatedUsername = form.username || form.email.split('@')[0].replace(/[^a-zA-Z0-9_]/g, '_');
      
      await api.post('/auth/register', {
        name: form.name,
        username: generatedUsername,
        email: form.email,
        password: form.password
      });
      // Redirect to shop section as requested
      navigate('/shop');
    } catch (err: any) {
      const errors = err.response?.data?.errors;
      setError(errors ? errors[0].message : err.response?.data?.message || 'Registration failed.');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA] dark:bg-noir flex flex-col transition-colors duration-500 overflow-x-hidden">
      {/* Navbar Placeholder from Screenshot */}
      <nav className="w-full px-8 py-6 flex justify-between items-center bg-transparent relative z-20">
        <Link to="/" className="font-bold text-xl tracking-tighter text-[#1A2B88] dark:text-white">
          SecureAuth
        </Link>
        <div className="flex items-center gap-8">
          <Link to="#" className="text-sm text-noir/40 dark:text-white/40 hover:text-noir transition-colors">Help</Link>
          <Link to="#" className="text-sm text-noir/40 dark:text-white/40 hover:text-noir transition-colors">Support</Link>
          <Link to="/login" className="text-sm font-bold text-[#1A2B88] dark:text-white border-b-2 border-[#1A2B88] pb-1">Sign In</Link>
        </div>
      </nav>

      <div className="flex-1 flex flex-col items-center justify-center p-6 pb-20 relative">
        <div className="w-full max-w-[440px] relative">
          {/* Back Arrow */}
          <Link 
            to="/" 
            className="absolute -left-20 top-2 hidden md:flex items-center gap-2 group px-4 py-2 rounded-full hover:bg-noir/5 dark:hover:bg-white/5 transition-all"
            title="Go back"
          >
            <ArrowLeft size={18} className="text-noir/40 dark:text-white/40 group-hover:text-noir dark:group-hover:text-white transition-colors" />
            <span className="text-[11px] font-black uppercase tracking-widest text-noir/40 dark:text-white/40 group-hover:text-noir dark:group-hover:text-white transition-colors">Back</span>
          </Link>

          {/* Header */}
          <div className="text-center mb-10 relative">
            <Link 
              to="/" 
              className="md:hidden absolute left-0 top-1/2 -translate-y-1/2 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-noir/5 dark:bg-white/5"
            >
              <ArrowLeft size={14} className="text-noir/40 dark:text-white/40" />
              <span className="text-[10px] font-black uppercase tracking-widest text-noir/40 dark:text-white/40">Back</span>
            </Link>
            <h1 className="text-[32px] font-bold text-noir dark:text-white tracking-tight mb-3">Create your account</h1>
            <p className="text-noir/40 dark:text-white/40 text-sm">
              Join thousands of professionals securing their workflow.
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
                <label className="block text-sm font-medium text-noir/70 dark:text-white/70 ml-1">Full Name</label>
                <input
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  required
                  placeholder="Enter your full name"
                  className="w-full bg-white dark:bg-white/5 border border-noir/10 dark:border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#1A2B88]/10 transition-all text-noir dark:text-white placeholder:text-noir/20"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-noir/70 dark:text-white/70 ml-1">Email Address</label>
                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  required
                  placeholder="name@company.com"
                  className="w-full bg-white dark:bg-white/5 border border-noir/10 dark:border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#1A2B88]/10 transition-all text-noir dark:text-white placeholder:text-noir/20"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-noir/70 dark:text-white/70 ml-1">Password</label>
                <div className="relative">
                  <input
                    type={showPass ? 'text' : 'password'}
                    name="password"
                    value={form.password}
                    onChange={handleChange}
                    required
                    placeholder="••••••••"
                    className="w-full bg-white dark:bg-white/5 border border-noir/10 dark:border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#1A2B88]/10 transition-all text-noir dark:text-white placeholder:text-noir/20"
                  />
                  <button type="button" onClick={() => setShowPass((s) => !s)} className="absolute right-4 top-1/2 -translate-y-1/2 text-noir/20 dark:text-white/20 hover:text-noir transition-colors">
                    {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                {form.password && form.password.length < 8 && (
                  <p className="text-[11px] text-noir/40 mt-1 ml-1 italic">Password is too short</p>
                )}
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#0E21A0] text-white text-sm font-bold py-4 rounded-xl transition-all hover:bg-[#081878] shadow-lg shadow-[#0E21A0]/10 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading ? 'Processing...' : 'Create Account'}
              </button>

              <div className="text-center pt-4">
                <p className="text-xs text-noir/40 dark:text-white/40">
                  Already have an account?{' '}
                  <Link to="/login" className="text-[#1A2B88] font-bold hover:underline">Log in</Link>
                </p>
              </div>
            </form>
          </motion.div>
        </div>
      </div>

      {/* Footer from Screenshot */}
      <footer className="w-full px-8 py-8 flex flex-wrap justify-center items-center gap-6 text-[11px] text-noir/30 dark:text-white/30 border-t border-noir/5 dark:border-white/5">
        <span className="font-bold">SecureAuth Inc.</span>
        <Link to="#" className="hover:text-noir transition-colors">Terms of Service</Link>
        <Link to="#" className="hover:text-noir transition-colors">Privacy Policy</Link>
        <Link to="#" className="hover:text-noir transition-colors">Cookie Settings</Link>
        <span>© 2026 SecureAuth Inc. All rights reserved.</span>
      </footer>
    </div>
  );
};

export default RegisterPage;
