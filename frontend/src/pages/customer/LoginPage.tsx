import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Eye, EyeOff, AlertCircle, ArrowRight, Shield, Star, Truck, ArrowLeft } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as any)?.from || '/shop';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      // Security check: Do not allow superadmin login from public login page
      if (email.toLowerCase().includes('superadmin') || email.toLowerCase() === 'superadmin@axis.com') {
        setError('Administrators must use the dedicated Admin Login portal.');
        setLoading(false);
        return;
      }

      await login(email, password);
      
      // Get the fresh user state to check role
      // Note: Since login updates state, we might need a small delay or use the returned data if login returned it
      // For now, we'll check the role and redirect accordingly
      // We can also check localStorage if needed, but the state should be updated
    } catch (err: any) {
      setError(err.response?.data?.message || 'Authentication failed. Please check your credentials.');
      setLoading(false);
    }
  };

  // Add an effect to handle redirection after user state is updated
  React.useEffect(() => {
    if (user) {
      if (user.role === 'admin' || user.role === 'superadmin') {
        navigate('/admin', { replace: true });
      } else {
        navigate(from, { replace: true });
      }
    }
  }, [user, navigate, from]);

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
          <Link to="/register" className="text-sm font-bold text-[#1A2B88] dark:text-white border-b-2 border-[#1A2B88] pb-1">Sign Up</Link>
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
            <h1 className="text-[32px] font-bold text-noir dark:text-white tracking-tight mb-3">Welcome back</h1>
            <p className="text-noir/40 dark:text-white/40 text-sm">
              Log in to your account to continue your workflow.
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
                <label className="block text-sm font-medium text-noir/70 dark:text-white/70 ml-1">Email Address</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="name@company.com"
                  className="w-full bg-white dark:bg-white/5 border border-noir/10 dark:border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#1A2B88]/10 transition-all text-noir dark:text-white placeholder:text-noir/20"
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between ml-1">
                  <label className="block text-sm font-medium text-noir/70 dark:text-white/70">Password</label>
                  <button type="button" className="text-xs font-bold text-[#1A2B88] hover:underline">Forgot?</button>
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
                className="w-full bg-[#0E21A0] text-white text-sm font-bold py-4 rounded-xl transition-all hover:bg-[#081878] shadow-lg shadow-[#0E21A0]/10 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading ? 'Verifying...' : 'Log In'}
              </button>

              <div className="text-center pt-4">
                <p className="text-xs text-noir/40 dark:text-white/40">
                  Don't have an account?{' '}
                  <Link to="/register" className="text-[#1A2B88] font-bold hover:underline">Sign up</Link>
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

export default LoginPage;
