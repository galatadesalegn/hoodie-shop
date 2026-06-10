import React, { useEffect, useState, useCallback } from 'react';
import api from '../../services/api';
import type { User } from '../../types';

import { motion } from 'framer-motion';
import { 
  Search, 
  User as UserIcon, 
  ChevronRight, 
  Download, 
  UserPlus, 
  TrendingUp, 
  Activity, 
  Award, 
  ArrowRight,
  ShieldCheck
} from 'lucide-react';

const AdminCustomers: React.FC = () => {
  const [customers, setCustomers] = useState<User[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

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
          <button className="bg-white dark:bg-white/5 border border-noir/5 dark:border-white/5 px-6 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center gap-3 hover:bg-noir hover:text-white dark:hover:bg-white dark:hover:text-noir transition-all shadow-sm">
            <Download size={16} />
            Export CSV
          </button>
          <button 
            className="bg-[#4F46E5] text-white px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center gap-3 hover:opacity-90 transition-all shadow-xl shadow-indigo-500/20"
          >
            <UserPlus size={16} />
            Add Customer
          </button>
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

      {/* Insight Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Retention Health */}
        <div className="bg-white dark:bg-white/5 p-10 rounded-[40px] border border-noir/5 dark:border-white/5 shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-xl font-black text-noir dark:text-white tracking-tight uppercase">Retention Rate</h2>
            <TrendingUp size={20} className="text-emerald-500" />
          </div>
          <div className="flex items-end gap-4 mb-4">
            <p className="text-[40px] font-black text-noir dark:text-white tracking-tighter leading-none">84.2%</p>
            <span className="text-[10px] font-black text-emerald-600 bg-emerald-50 px-2 py-1 rounded-lg uppercase">+2.1%</span>
          </div>
          <p className="text-sm text-noir/40 dark:text-white/40 font-medium tracking-tight mb-8">
            Active customer retention is trending upwards this quarter.
          </p>
          <div className="w-full h-1.5 bg-noir/5 dark:bg-white/5 rounded-full overflow-hidden">
            <div className="w-[84.2%] h-full bg-[#4F46E5] rounded-full" />
          </div>
        </div>

        {/* Engagement */}
        <div className="bg-white dark:bg-white/5 p-10 rounded-[40px] border border-noir/5 dark:border-white/5 shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-xl font-black text-noir dark:text-white tracking-tight uppercase">Engagement</h2>
            <Activity size={20} className="text-[#4F46E5]" />
          </div>
          <div className="flex items-end gap-4 mb-4">
            <p className="text-[40px] font-black text-noir dark:text-white tracking-tighter leading-none">4.2</p>
            <span className="text-[10px] font-black text-noir/20 dark:text-white/20 uppercase tracking-widest ml-1">Orders/Avg</span>
          </div>
          <p className="text-sm text-noir/40 dark:text-white/40 font-medium tracking-tight mb-8">
            Average transaction frequency per registered member.
          </p>
          <div className="flex items-end gap-2 h-10">
            {[30, 50, 40, 70, 60, 80, 100].map((h, i) => (
              <div key={i} className={`flex-1 rounded-t-sm ${i === 6 ? 'bg-[#4F46E5]' : 'bg-indigo-100 dark:bg-indigo-900/20'}`} style={{ height: `${h}%` }} />
            ))}
          </div>
        </div>

        {/* VIP Insights */}
        <div className="bg-white dark:bg-white/5 p-10 rounded-[40px] border border-noir/5 dark:border-white/5 shadow-sm relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
            <Award size={120} className="text-noir dark:text-white" />
          </div>
          <div className="relative z-10 h-full flex flex-col">
            <h2 className="text-xl font-black text-noir dark:text-white tracking-tight uppercase mb-8">VIP Segments</h2>
            <div className="flex items-center gap-4 mb-8">
              <div className="w-12 h-12 rounded-2xl bg-amber-50 dark:bg-amber-500/10 flex items-center justify-center text-amber-500">
                <ShieldCheck size={24} />
              </div>
              <div>
                <p className="text-sm font-black text-noir dark:text-white uppercase tracking-tight">156 Elite Clients</p>
                <p className="text-[10px] font-black text-noir/20 dark:text-white/20 uppercase tracking-widest">Revenue share: 42%</p>
              </div>
            </div>
            <p className="text-sm text-noir/40 dark:text-white/40 font-medium tracking-tight mb-auto">
              Your VIP members contribute nearly half of total revenue this month.
            </p>
            <button className="mt-8 flex items-center gap-2 text-[10px] font-black text-[#4F46E5] uppercase tracking-widest hover:gap-4 transition-all">
              Analyze Segments
              <ArrowRight size={14} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminCustomers;
