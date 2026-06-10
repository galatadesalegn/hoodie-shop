import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import api from '../services/api';

const VerifyEmailChangePage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [message, setMessage] = useState<string>('Verifying your new email address...');
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = searchParams.get('token');
    if (!token) {
      setMessage('Verification token is missing.');
      setLoading(false);
      return;
    }

    const verify = async () => {
      try {
        const { data } = await api.get(`/admin/verify-email-change/${token}`);
        setMessage(data.message || 'Email verified successfully.');
      } catch (err: any) {
        setError(err.response?.data?.message || 'Verification failed. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    verify();
  }, [searchParams]);

  return (
    <div className="min-h-screen bg-studio dark:bg-noir flex items-center justify-center p-6">
      <div className="w-full max-w-xl bg-white dark:bg-white/5 border border-noir/10 dark:border-white/10 rounded-3xl p-10 shadow-xl">
        <h1 className="text-2xl font-black text-noir dark:text-white mb-4">Email Change Verification</h1>
        <p className="text-sm text-noir/60 dark:text-white/60 mb-8">
          {loading ? 'Please wait while we verify your new email address.' : 'Below is the status of your request.'}
        </p>
        {error ? (
          <div className="rounded-2xl bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-400 p-4 text-sm text-red-700 dark:text-red-200 mb-6">
            {error}
          </div>
        ) : (
          <div className="rounded-2xl bg-green-50 dark:bg-green-500/10 border border-green-200 dark:border-green-400 p-4 text-sm text-green-700 dark:text-green-200 mb-6">
            {message}
          </div>
        )}
        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={() => navigate('/login')}
            className="px-6 py-3 bg-indigo-600 text-white rounded-2xl uppercase text-xs tracking-widest hover:bg-indigo-700 transition"
          >
            Go to Login
          </button>
        </div>
      </div>
    </div>
  );
};

export default VerifyEmailChangePage;
