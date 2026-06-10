import React, { useEffect, useState, useCallback } from 'react';
import { ChevronDown } from 'lucide-react';
import api from '../services/api';
import type { SecurityLog } from '../types';

const SEVERITY_COLORS: Record<string, string> = {
  low: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  medium: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  high: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
  critical: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
};

import { motion } from 'framer-motion';

const AdminSecurityLogs: React.FC = () => {
  const [logs, setLogs] = useState<SecurityLog[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [severity, setSeverity] = useState('');
  const [event, setEvent] = useState('');

  const fetchLogs = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(page), limit: '50' });
      if (severity) params.set('severity', severity);
      if (event) params.set('event', event);
      const { data } = await api.get(`/admin/security-logs?${params}`);
      setLogs(data.data.logs);
      setTotal(data.data.total);
    } catch {}
    setLoading(false);
  }, [page, severity, event]);

  useEffect(() => { fetchLogs(); }, [fetchLogs]);

  const pages = Math.ceil(total / 50);

  return (
    <div className="space-y-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-[40px] font-black text-noir dark:text-white tracking-tighter uppercase leading-none mb-2">
            Security Protocol
          </h1>
          <p className="text-sm text-noir/40 dark:text-white/40 font-medium tracking-tight">System audits and access logs.</p>
        </div>
        <div className="flex gap-4">
          <div className="relative min-w-[180px]">
            <select 
              value={severity} 
              onChange={(e) => { setSeverity(e.target.value); setPage(1); }} 
              className="w-full appearance-none bg-white dark:bg-white/5 border border-noir/5 dark:border-white/5 rounded-2xl py-4 pl-6 pr-12 text-[10px] font-black uppercase tracking-widest focus:ring-2 focus:ring-[#4F46E5]/20 transition-all outline-none shadow-sm"
            >
              <option value="">All Severities</option>
              {['low', 'medium', 'high', 'critical'].map((s) => <option key={s} value={s}>{s.toUpperCase()}</option>)}
            </select>
            <ChevronDown size={14} className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-noir/30 dark:text-white/30" />
          </div>
          <div className="relative min-w-[220px]">
            <select 
              value={event} 
              onChange={(e) => { setEvent(e.target.value); setPage(1); }} 
              className="w-full appearance-none bg-white dark:bg-white/5 border border-noir/5 dark:border-white/5 rounded-2xl py-4 pl-6 pr-12 text-[10px] font-black uppercase tracking-widest focus:ring-2 focus:ring-[#4F46E5]/20 transition-all outline-none shadow-sm"
            >
              <option value="">All Events</option>
              {['login_success', 'login_failed', 'login_blocked', 'logout', 'password_changed', 'admin_created', 'admin_deleted', 'role_changed', 'product_deleted', 'suspicious_activity'].map((e) => <option key={e} value={e}>{e.replace(/_/g, ' ').toUpperCase()}</option>)}
            </select>
            <ChevronDown size={14} className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-noir/30 dark:text-white/30" />
          </div>
        </div>
      </div>

      {/* Table Section */}
      <div className="bg-white dark:bg-white/5 rounded-[40px] border border-noir/5 dark:border-white/5 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b border-noir/5 dark:border-white/5">
                {[
                  { label: 'Event', align: 'left' },
                  { label: 'Administrator', align: 'left' },
                  { label: 'IP Address', align: 'left' },
                  { label: 'Severity', align: 'left' },
                  { label: 'Details', align: 'left' },
                  { label: 'Timestamp', align: 'right' }
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
              ) : logs.map((log) => (
                <motion.tr 
                  key={log._id} 
                  initial={{ opacity: 0 }} 
                  animate={{ opacity: 1 }} 
                  className="group hover:bg-noir/[0.02] dark:hover:bg-white/[0.02] transition-colors"
                >
                  <td className="px-8 py-6">
                    <span className="text-[10px] font-black text-noir dark:text-white uppercase tracking-widest bg-noir/5 dark:bg-white/5 px-3 py-1.5 rounded-lg">{log.event.replace(/_/g, ' ')}</span>
                  </td>
                  <td className="px-8 py-6">
                    {log.userId ? (
                      <div className="flex flex-col">
                        <span className="text-sm font-black text-noir dark:text-white uppercase tracking-tight">{(log.userId as any).name}</span>
                        <span className="text-[10px] font-black text-noir/20 dark:text-white/20 uppercase tracking-widest">{(log.userId as any).email}</span>
                      </div>
                    ) : <span className="text-noir/20 dark:text-white/20 text-[10px] font-black uppercase tracking-widest">—</span>}
                  </td>
                  <td className="px-8 py-6">
                    <span className="text-[10px] font-black text-noir/40 dark:text-white/40 uppercase tracking-widest">{log.ip || 'Unknown'}</span>
                  </td>
                  <td className="px-8 py-6">
                    <span className={`text-[8px] font-black uppercase tracking-[0.2em] px-3 py-1.5 rounded-full ${
                      log.severity === 'critical' ? 'bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-400' :
                      log.severity === 'high' ? 'bg-orange-50 text-orange-600 dark:bg-orange-500/10 dark:text-orange-400' :
                      log.severity === 'medium' ? 'bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400' :
                      'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400'
                    }`}>
                      {log.severity}
                    </span>
                  </td>
                  <td className="px-8 py-6">
                    <span className="text-[10px] font-bold text-noir/40 dark:text-white/40 tracking-tight max-w-xs block truncate">
                      {log.details ? JSON.stringify(log.details) : '—'}
                    </span>
                  </td>
                  <td className="px-8 py-6 text-right">
                    <span className="text-[10px] font-black text-noir/40 dark:text-white/40 uppercase tracking-widest whitespace-nowrap">
                      {new Date(log.createdAt).toLocaleString()}
                    </span>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {!loading && logs.length === 0 && (
          <div className="py-20 text-center">
            <p className="text-sm font-black text-noir/20 dark:text-white/20 uppercase tracking-[0.2em]">No security events logged</p>
          </div>
        )}

        {/* Footer / Pagination */}
        <div className="px-8 py-6 bg-noir/[0.01] dark:bg-white/[0.01] border-t border-noir/5 dark:border-white/5 flex items-center justify-between">
          <p className="text-[10px] font-black text-noir/30 dark:text-white/30 uppercase tracking-widest">
            Total {total} system events
          </p>
          {pages > 1 && (
            <div className="flex gap-2">
              {[...Array(Math.min(pages, 10))].map((_, i) => (
                <button 
                  key={i} 
                  onClick={() => setPage(i + 1)} 
                  className={`w-10 h-10 rounded-xl text-[10px] font-black transition-all ${
                    page === i + 1 
                      ? 'bg-noir text-white dark:bg-white dark:text-noir shadow-lg' 
                      : 'bg-white dark:bg-white/5 border border-noir/5 dark:border-white/5 text-noir/40 dark:text-white/40 hover:border-noir dark:hover:border-white'
                  }`}
                >
                  {i + 1}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminSecurityLogs;
