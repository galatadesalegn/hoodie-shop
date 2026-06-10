import React, { useEffect, useState, useCallback } from 'react';
import api from '../../services/api';
import type { User } from '../../types';

import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, 
  User as UserIcon, 
  ChevronRight, 
  Download, 
  UserPlus, 
  X,
  Mail,
  Calendar,
  ShieldCheck,
  Instagram,
  Twitter,
  Facebook,
  Youtube,
  Globe
} from 'lucide-react';

const AdminCustomers: React.FC = () => {
  const [customers, setCustomers] = useState<User[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState<User | null>(null);

  const fetchCustomers = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(page), limit: '20' });
      if (search) params.set('search', search);
      if (statusFilter) params.set('status', statusFilter);
      const { data } = await api.get(`/admin/customers?${params}`);
      setCustomers(data.data.customers);
      setTotal(data.data.total);
    } catch {}
    setLoading(false);
  }, [page, search, statusFilter]);

  useEffect(() => { fetchCustomers(); }, [fetchCustomers]);

  const pages = Math.ceil(total / 20);

  return (
    <div className="space-y-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-noir/20 dark:text-white/20 mb-4">
            <span>Dashboard</span>
            <ChevronRight size={10} />
            <span className="text-[#4F46E5]">Customers</span>
          </div>
          <h1 className="text-[40px] font-black text-noir dark:text-white tracking-tighter uppercase leading-none mb-2">
            Client Directory
          </h1>
          <p className="text-sm text-noir/40 dark:text-white/40 font-medium tracking-tight max-w-2xl">
            Manage your community and customer base, track user engagement, and oversee account security protocols.
          </p>
        </div>
        <div className="flex gap-4">
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-8 border-b border-noir/5 dark:border-white/5 pb-1">
        {[
          { id: '', label: 'All Customers', count: total },
          { id: 'active', label: 'Active', count: 1240 },
          { id: 'pending', label: 'Pending', count: 42 },
          { id: 'vip', label: 'VIP Members', count: 156 },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => { setStatusFilter(tab.id); setPage(1); }}
            className={`pb-4 text-[11px] font-black uppercase tracking-widest transition-all relative ${
              statusFilter === tab.id 
                ? 'text-[#4F46E5]' 
                : 'text-noir/30 dark:text-white/30 hover:text-noir dark:hover:text-white'
            }`}
          >
            {tab.label} <span className="opacity-50 ml-1">({tab.count})</span>
            {statusFilter === tab.id && (
              <motion.div 
                layoutId="activeTab"
                className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#4F46E5]"
              />
            )}
          </button>
        ))}
      </div>

      {/* Table Section */}
      <div className="bg-white dark:bg-white/5 rounded-[40px] border border-noir/5 dark:border-white/5 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-[#F8F9FA] dark:bg-white/5 border-b border-noir/5 dark:border-white/5">
                {[
                  { label: 'Customer', align: 'left' },
                  { label: 'Email Address', align: 'left' },
                  { label: 'Join Date', align: 'left' },
                  { label: 'Total Spent', align: 'left' },
                  { label: 'Verification', align: 'left' },
                  { label: 'Action', align: 'right' }
                ].map((h) => (
                  <th key={h.label} className={`px-8 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-noir/30 dark:text-white/30 ${h.align === 'right' ? 'text-right' : 'text-left'}`}>
                    {h.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-noir/5 dark:divide-white/5">
              {loading ? (
                [...Array(6)].map((_, i) => (
                  <tr key={i}>
                    {[...Array(6)].map((_, j) => (
                      <td key={j} className="px-8 py-8">
                        <div className="h-4 bg-noir/5 dark:bg-white/5 animate-pulse rounded-lg" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : customers.map((c) => (
                <motion.tr 
                  key={c.id} 
                  initial={{ opacity: 0 }} 
                  animate={{ opacity: 1 }} 
                  className="group hover:bg-noir/[0.02] dark:hover:bg-white/[0.02] transition-colors"
                >
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-[#0F172A] flex items-center justify-center text-white text-xs font-black shadow-sm flex-shrink-0">
                        {c.avatar?.url ? (
                          <img src={c.avatar.url} alt={c.name} className="w-full h-full object-cover rounded-xl" />
                        ) : (
                          c.name?.split(' ').map(n => n[0]).join('') || <UserIcon size={18} />
                        )}
                      </div>
                      <div className="flex flex-col">
                        <span className="text-sm font-black text-noir dark:text-white uppercase tracking-tight">{c.name}</span>
                        <span className="text-[10px] font-black text-noir/20 dark:text-white/20 uppercase tracking-widest">@{c.username}</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <span className="text-sm font-bold text-noir/40 dark:text-white/40 tracking-tight">{c.email}</span>
                  </td>
                  <td className="px-8 py-6">
                    <span className="text-[10px] font-black text-noir/40 dark:text-white/40 uppercase tracking-widest">
                      {new Date(c.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </span>
                  </td>
                  <td className="px-8 py-6">
                    <span className="text-sm font-black text-noir dark:text-white tracking-tighter">ETB 12,450</span>
                  </td>
                  <td className="px-8 py-6">
                    <span className={`text-[8px] font-black uppercase tracking-[0.2em] px-3 py-1.5 rounded-full flex items-center gap-2 w-fit ${
                      c.isEmailVerified 
                        ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400' 
                        : 'bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400'
                    }`}>
                      <div className={`w-1 h-1 rounded-full ${c.isEmailVerified ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                      {c.isEmailVerified ? 'Verified' : 'Pending'}
                    </span>
                  </td>
                  <td className="px-8 py-6 text-right">
                    <button 
                      onClick={() => setSelectedCustomer(c)}
                      className="text-[10px] font-black text-[#4F46E5] uppercase tracking-widest hover:border-b border-[#4F46E5] transition-all"
                    >
                      View Profile
                    </button>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {/* Footer / Pagination */}
        <div className="px-8 py-6 bg-noir/[0.01] dark:bg-white/[0.01] border-t border-noir/5 dark:border-white/5 flex items-center justify-between">
          <p className="text-[10px] font-black text-noir/30 dark:text-white/30 uppercase tracking-widest">
            Showing 1 to {Math.min(customers.length, 20)} of {total} members
          </p>
          {pages > 1 && (
            <div className="flex gap-2">
              <button className="w-10 h-10 rounded-xl bg-white dark:bg-white/5 border border-noir/5 dark:border-white/5 text-noir/40 dark:text-white/40 flex items-center justify-center hover:border-noir transition-all shadow-sm">
                <ChevronRight size={16} className="rotate-180" />
              </button>
              {[...Array(Math.min(pages, 5))].map((_, i) => (
                <button 
                  key={i} 
                  onClick={() => setPage(i + 1)} 
                  className={`w-10 h-10 rounded-xl text-[10px] font-black transition-all ${
                    page === i + 1 
                      ? 'bg-[#4F46E5] text-white shadow-lg shadow-indigo-500/20' 
                      : 'bg-white dark:bg-white/5 border border-noir/5 dark:border-white/5 text-noir/40 dark:text-white/40 hover:border-noir dark:hover:border-white'
                  }`}
                >
                  {i + 1}
                </button>
              ))}
              <button className="w-10 h-10 rounded-xl bg-white dark:bg-white/5 border border-noir/5 dark:border-white/5 text-noir/40 dark:text-white/40 flex items-center justify-center hover:border-noir transition-all shadow-sm">
                <ChevronRight size={16} />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Customer Detail Modal */}
      <AnimatePresence>
        {selectedCustomer && (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }} 
            className="fixed inset-0 bg-noir/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4 sm:p-6"
          >
            <motion.div 
              initial={{ scale: 0.95, opacity: 0, y: 20 }} 
              animate={{ scale: 1, opacity: 1, y: 0 }} 
              exit={{ scale: 0.95, opacity: 0, y: 20 }} 
              className="bg-white dark:bg-[#0A0A0A] border border-noir/10 dark:border-white/10 w-full max-w-[550px] max-h-[88vh] overflow-hidden rounded-[32px] shadow-2xl flex flex-col relative"
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between p-6 sm:p-8 border-b border-noir/5 dark:border-white/5 bg-noir/[0.01] dark:bg-white/[0.01]">
                <div className="flex items-center gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-[#0F172A] flex items-center justify-center text-white shadow-lg shadow-indigo-500/20">
                    <UserIcon size={20} />
                  </div>
                  <div>
                    <h2 className="text-lg font-black text-noir dark:text-white uppercase tracking-tighter leading-none mb-1">
                      {selectedCustomer.name}
                    </h2>
                    <p className="text-[8px] font-bold text-noir/30 dark:text-white/30 uppercase tracking-[0.3em]">
                      @{selectedCustomer.username}
                    </p>
                  </div>
                </div>
                <button 
                  onClick={() => setSelectedCustomer(null)}
                  className="w-9 h-9 rounded-lg bg-noir/5 dark:bg-white/5 flex items-center justify-center text-noir/40 dark:text-white/40 hover:bg-red-500 hover:text-white transition-all"
                >
                  <X size={16} />
                </button>
              </div>

              {/* Modal Content */}
              <div className="flex-1 overflow-y-auto p-6 sm:p-8 space-y-6">
                {/* Profile Information */}
                <section className="bg-white dark:bg-white/5 border border-noir/5 dark:border-white/5 rounded-[40px] p-10 shadow-sm">
                  <div className="flex flex-col gap-1 mb-10">
                    <h2 className="text-xl font-black text-noir dark:text-white uppercase tracking-tight">Social Media Profiles</h2>
                    <p className="text-sm text-noir/40 dark:text-white/40 font-medium tracking-tight">Manage your store's social media links and online presence.</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-noir/40 dark:text-white/40 ml-1 flex items-center gap-2">
                        <Instagram size={14} /> Instagram
                      </label>
                      <input 
                        type="text" 
                        className="w-full bg-[#F8F9FA] dark:bg-white/5 border border-noir/5 dark:border-white/5 rounded-2xl px-6 py-4 text-sm font-bold focus:outline-none focus:border-indigo-500 transition-colors"
                        placeholder="https://instagram.com/yourstore"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-noir/40 dark:text-white/40 ml-1 flex items-center gap-2">
                        <Twitter size={14} /> Twitter (X)
                      </label>
                      <input 
                        type="text" 
                        className="w-full bg-[#F8F9FA] dark:bg-white/5 border border-noir/5 dark:border-white/5 rounded-2xl px-6 py-4 text-sm font-bold focus:outline-none focus:border-indigo-500 transition-colors"
                        placeholder="https://twitter.com/yourstore"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-noir/40 dark:text-white/40 ml-1 flex items-center gap-2">
                        <Facebook size={14} /> Facebook
                      </label>
                      <input 
                        type="text" 
                        className="w-full bg-[#F8F9FA] dark:bg-white/5 border border-noir/5 dark:border-white/5 rounded-2xl px-6 py-4 text-sm font-bold focus:outline-none focus:border-indigo-500 transition-colors"
                        placeholder="https://facebook.com/yourstore"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-noir/40 dark:text-white/40 ml-1 flex items-center gap-2">
                        <Youtube size={14} /> YouTube
                      </label>
                      <input 
                        type="text" 
                        className="w-full bg-[#F8F9FA] dark:bg-white/5 border border-noir/5 dark:border-white/5 rounded-2xl px-6 py-4 text-sm font-bold focus:outline-none focus:border-indigo-500 transition-colors"
                        placeholder="https://youtube.com/c/yourstore"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-noir/40 dark:text-white/40 ml-1 flex items-center gap-2">
                        <Globe size={14} /> Website
                      </label>
                      <input 
                        type="text" 
                        className="w-full bg-[#F8F9FA] dark:bg-white/5 border border-noir/5 dark:border-white/5 rounded-2xl px-6 py-4 text-sm font-bold focus:outline-none focus:border-indigo-500 transition-colors"
                        placeholder="https://yourstore.com"
                      />
                    </div>
                  </div>
                </section>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminCustomers;
