import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, AlertCircle, ArrowRight, RefreshCw } from 'lucide-react';
import api from '../services/api';

const VerifyEmailPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [email, setEmail] = useState(searchParams.get('email') || '');
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);

  useEffect(() => {
    const paramEmail = searchParams.get('email');
    if (paramEmail) setEmail(paramEmail);
  }, [searchParams]);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);
    try {
      await api.post('/auth/verify-email-otp', { email, otp: otp.trim() });
      setSuccess('Email verified! Redirecting to login...');
      setTimeout(() => navigate('/login', { replace: true }), 2000);
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { message?: string } } };
      setError(axiosErr.response?.data?.message || 'Verification failed. Please try again.');
    }
    setLoading(false);
  };

  const handleResend = async () => {
    if (!email) {
      setError('Enter your email address first.');
      return;
    }
    setError('');
    setSuccess('');
    setResending(true);
    try {
      await api.post('/auth/resend-otp', { email });
      setSuccess('A new verification code has been sent to your email.');
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { message?: string } } };
      setError(axiosErr.response?.data?.message || 'Could not resend code. Try again later.');
    }
    setResending(false);
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA] dark:bg-noir flex flex-col transition-colors duration-500">
      <nav className="w-full px-8 py-6 flex justify-between items-center">
        <Link to="/" className="font-bold text-xl tracking-tighter text-[#1A2B88] dark:text-white">
          SecureAuth
        </Link>
        <Link to="/login" className="text-sm font-bold text-[#1A2B88] dark:text-white">Sign In</Link>
      </nav>

      <div className="flex-1 flex flex-col items-center justify-center p-6">
        <div className="w-full max-w-[440px]">
          <div className="text-center mb-10">
            <div className="w-16 h-16 bg-[#1A2B88] rounded-2xl flex items-center justify-center text-white mx-auto mb-6">
              <Mail size={32} />
            </div>
            <h1 className="text-[32px] font-bold text-noir dark:text-white tracking-tight mb-3">Verify your email</h1>
            <p className="text-noir/40 dark:text-white/40 text-sm">
              Enter the 6-digit code we sent to your inbox.
            </p>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-white/5 border border-noir/5 dark:border-white/5 p-10 rounded-[32px] shadow-[0_8px_30px_rgb(0,0,0,0.04)]"
          >
            {error && (
              <div className="flex items-center gap-3 bg-red-50 text-red-500 px-4 py-3 rounded-xl text-xs mb-6 border border-red-100">
                <AlertCircle size={16} className="shrink-0" />
                {error}
              </div>
            )}
            {success && (
              <div className="flex items-center gap-3 bg-green-50 text-green-600 px-4 py-3 rounded-xl text-xs mb-6 border border-green-100">
                {success}
              </div>
            )}

            <form onSubmit={handleVerify} className="space-y-6">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-noir/70 dark:text-white/70 ml-1">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full bg-white dark:bg-white/5 border border-noir/10 dark:border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#1A2B88]/10 text-noir dark:text-white"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-noir/70 dark:text-white/70 ml-1">Verification Code</label>
                <input
                  type="text"
                  inputMode="numeric"
                  pattern="\d{6}"
                  maxLength={6}
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  required
                  placeholder="000000"
                  className="w-full bg-white dark:bg-white/5 border border-noir/10 dark:border-white/10 rounded-xl px-4 py-3 text-sm text-center text-2xl tracking-[0.5em] font-mono focus:outline-none focus:ring-2 focus:ring-[#1A2B88]/10 text-noir dark:text-white"
                />
                <p className="text-[11px] text-noir/40 text-center">Code expires in 15 minutes</p>
              </div>

              <button
                type="submit"
                disabled={loading || otp.length !== 6}
                className="w-full bg-[#1A2B88] text-white text-sm font-bold py-4 rounded-xl hover:bg-[#0E21A0] disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading ? 'Verifying...' : <>Verify Email <ArrowRight size={18} /></>}
              </button>
            </form>

            <button
              type="button"
              onClick={handleResend}
              disabled={resending || !email}
              className="w-full mt-4 text-sm text-[#1A2B88] dark:text-white font-bold flex items-center justify-center gap-2 hover:underline disabled:opacity-50"
            >
              <RefreshCw size={16} className={resending ? 'animate-spin' : ''} />
              {resending ? 'Sending...' : 'Resend code'}
            </button>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default VerifyEmailPage;
