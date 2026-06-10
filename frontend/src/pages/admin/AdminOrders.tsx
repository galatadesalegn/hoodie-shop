import React, { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  ChevronDown, 
  Search, 
  ChevronRight, 
  TrendingUp, 
  BarChart2, 
  Star, 
  RefreshCcw,
  ArrowRight,
  Package,
  CheckCircle2
} from 'lucide-react';
import api from '../../services/api';
import type { Order } from '../../types';

const STATUS_COLORS: Record<string, string> = {
  pending: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  confirmed: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  processing: 'bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400',
  delivered: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  cancelled: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
};

const STATUSES = ['pending', 'confirmed', 'processing', 'delivered', 'cancelled'];

const AdminOrders: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState('');
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<Order | null>(null);
  const [newStatus, setNewStatus] = useState<string>('');
  const [statusNote, setStatusNote] = useState('');
  const [updating, setUpdating] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(page), limit: '20' });
      if (statusFilter) params.set('status', statusFilter);
      if (search) params.set('search', search);
      const { data } = await api.get(`/orders?${params}`);
      setOrders(data.data.orders);
      setTotal(data.data.total);
    } catch {}
    setLoading(false);
  }, [page, statusFilter, search]);

  useEffect(() => { fetchOrders(); }, [fetchOrders]);

  const handleStatusUpdate = async () => {
    if (!selected || !newStatus) return;
    setUpdating(true);
    try {
      await api.patch(`/orders/${selected._id}/status`, { status: newStatus, note: statusNote });
      await fetchOrders();
      setSuccessMsg(`Order #${selected.orderNumber} updated to ${newStatus}`);
      setTimeout(() => setSuccessMsg(''), 3000);
      setSelected(null);
    } catch (err) {}
    setUpdating(false);
  };

  const pages = Math.ceil(total / 20);

  return (
    <div className="space-y-10">
      {/* Success Notification */}
      <AnimatePresence>
        {successMsg && (
          <motion.div 
            initial={{ opacity: 0, y: -20, x: '-50%' }}
            animate={{ opacity: 1, y: 0, x: '-50%' }}
            exit={{ opacity: 0, y: -20, x: '-50%' }}
            className="fixed top-10 left-1/2 z-[150] bg-emerald-500 text-white px-8 py-4 rounded-2xl shadow-2xl flex items-center gap-3 font-black uppercase text-[10px] tracking-widest"
          >
            <CheckCircle2 size={18} />
            {successMsg}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-noir/20 dark:text-white/20 mb-4">
            <span>Dashboard</span>
            <ChevronRight size={10} />
            <span className="text-[#4F46E5]">Orders</span>
          </div>
          <h1 className="text-[40px] font-black text-noir dark:text-white tracking-tighter uppercase leading-none mb-2">
            Order Tracking
          </h1>
          <p className="text-sm text-noir/40 dark:text-white/40 font-medium tracking-tight max-w-2xl">
            Manage fulfillment workflows, track shipments, and oversee customer transaction lifecycles from a centralized interface.
          </p>
        </div>

      </div>

      {/* Tabs */}
      <div className="flex items-center gap-8 border-b border-noir/5 dark:border-white/5 pb-1">
        {[
          { id: '', label: 'All Orders', count: total },
          { id: 'pending', label: 'Pending', count: 42 },
          { id: 'shipped', label: 'Shipped', count: 156 },
          { id: 'delivered', label: 'Delivered', count: 1086 },
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
      <div className="bg-white dark:bg-[#080808] rounded-[40px] border border-noir/5 dark:border-white/[0.08] shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-[#F8F9FA] dark:bg-white/[0.03] border-b border-noir/5 dark:border-white/[0.08]">
                {[
                  { label: 'Order ID', align: 'left' },
                  { label: 'Customer', align: 'left' },
                  { label: 'Date', align: 'left' },
                  { label: 'Amount', align: 'left' },
                  { label: 'Status', align: 'left' },
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
              ) : orders.map((o) => (
                <motion.tr 
                  key={o._id} 
                  initial={{ opacity: 0 }} 
                  animate={{ opacity: 1 }} 
                  className="group hover:bg-noir/[0.02] dark:hover:bg-white/[0.02] transition-colors"
                >
                  <td className="px-8 py-6">
                    <span className="text-sm font-black text-[#4F46E5] tracking-tighter">#{o.orderNumber}</span>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-[#F3F4F6] dark:bg-white/10 flex items-center justify-center text-[10px] font-black text-noir/40 dark:text-white/40 shadow-sm uppercase">
                        {o.customer?.name?.split(' ').map(n => n[0]).join('') || 'CU'}
                      </div>
                      <span className="text-sm font-black text-noir dark:text-white uppercase tracking-tight">{o.customer?.name}</span>
                    </div>
                  </td>
                  <td className="px-8 py-6 text-sm font-bold text-noir/40 dark:text-white/40 tracking-tight">
                    {new Date(o.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </td>
                  <td className="px-8 py-6">
                    <span className="text-sm font-black text-noir dark:text-white tracking-tighter">${o.totalAmount?.toLocaleString()}</span>
                  </td>
                  <td className="px-8 py-6">
                    <span className={`text-[8px] font-black uppercase tracking-[0.2em] px-3 py-1.5 rounded-full flex items-center gap-2 w-fit ${
                      o.status === 'delivered' ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400' :
                      o.status === 'cancelled' ? 'bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-400' :
                      o.status === 'pending' ? 'bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400' :
                      'bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400'
                    }`}>
                      <div className={`w-1 h-1 rounded-full ${
                        o.status === 'delivered' ? 'bg-emerald-500' :
                        o.status === 'cancelled' ? 'bg-red-500' :
                        o.status === 'pending' ? 'bg-amber-500' :
                        'bg-indigo-500'
                      }`} />
                      {o.status}
                    </span>
                  </td>
                  <td className="px-8 py-6 text-right">
                    <button 
                      onClick={() => { setSelected(o); setNewStatus(o.status); setStatusNote(''); }} 
                      className="text-[10px] font-black text-[#4F46E5] uppercase tracking-widest hover:border-b border-[#4F46E5] transition-all"
                    >
                      View Details
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
            Showing 1 to {Math.min(orders.length, 20)} of {total} results
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
                      : 'bg-white dark:bg-white/5 border border-noir/5 dark:border-white/5 text-noir/40 dark:text-white/40 hover:border-noir transition-all'
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
        {/* Fulfillment Health */}
        <div className="bg-white dark:bg-[#080808] p-10 rounded-[40px] border border-noir/5 dark:border-white/[0.08] shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-xl font-black text-noir dark:text-white tracking-tight uppercase">Fulfillment Health</h2>
            <TrendingUp size={20} className="text-emerald-500" />
          </div>
          <div className="flex items-end gap-4 mb-4">
            <p className="text-[40px] font-black text-noir dark:text-white tracking-tighter leading-none">98.2%</p>
            <span className="text-[10px] font-black text-emerald-600 bg-emerald-50 px-2 py-1 rounded-lg uppercase">+1.4%</span>
          </div>
          <p className="text-sm text-noir/40 dark:text-white/40 font-medium tracking-tight mb-8">
            On-time fulfillment rate for the last 30 days is exceeding targets.
          </p>
          <div className="w-full h-1.5 bg-noir/5 dark:bg-white/[0.05] rounded-full overflow-hidden">
            <div className="w-[98.2%] h-full bg-[#4F46E5] rounded-full" />
          </div>
        </div>

        {/* Avg. Ship Time */}
        <div className="bg-white dark:bg-[#080808] p-10 rounded-[40px] border border-noir/5 dark:border-white/[0.08] shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-xl font-black text-noir dark:text-white tracking-tight uppercase">Avg. Ship Time</h2>
            <RefreshCcw size={20} className="text-[#4F46E5]" />
          </div>
          <div className="flex items-end gap-4 mb-4">
            <p className="text-[40px] font-black text-noir dark:text-white tracking-tighter leading-none">1.8d</p>
            <span className="text-[10px] font-black text-indigo-600 bg-indigo-50 px-2 py-1 rounded-lg uppercase">-0.2d</span>
          </div>
          <p className="text-sm text-noir/40 dark:text-white/40 font-medium tracking-tight mb-8">
            Average time from order placement to shipping departure.
          </p>
          <div className="flex items-end gap-2 h-10">
            {[40, 60, 30, 80, 50, 90, 100].map((h, i) => (
              <div key={i} className={`flex-1 rounded-t-sm ${i === 6 ? 'bg-[#4F46E5]' : 'bg-indigo-100 dark:bg-indigo-900/10'}`} style={{ height: `${h}%` }} />
            ))}
          </div>
        </div>

        {/* Customer Satisfaction */}
        <div className="bg-white dark:bg-[#080808] p-10 rounded-[40px] border border-noir/5 dark:border-white/[0.08] shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-xl font-black text-noir dark:text-white tracking-tight uppercase">Satisfaction</h2>
            <Star size={20} className="text-amber-500" />
          </div>
          <div className="flex items-end gap-4 mb-4">
            <p className="text-[40px] font-black text-noir dark:text-white tracking-tighter leading-none">4.9</p>
            <span className="text-[10px] font-black text-amber-600 bg-amber-50 px-2 py-1 rounded-lg uppercase">/ 5.0</span>
          </div>
          <p className="text-sm text-noir/40 dark:text-white/40 font-medium tracking-tight mb-8">
            Based on post-delivery customer feedback surveys.
          </p>
          <div className="flex gap-1.5">
            {[1, 2, 3, 4, 5].map((s) => (
              <Star key={s} size={18} className={s <= 4 ? 'fill-amber-400 text-amber-400' : 'text-noir/10 dark:text-white/10'} />
            ))}
          </div>
        </div>
      </div>

      {/* Order Detail Modal */}
      <AnimatePresence>
        {selected && (
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
                  <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-lg shadow-indigo-500/20">
                    <Package size={20} />
                  </div>
                  <div>
                    <h2 className="text-lg font-black text-noir dark:text-white uppercase tracking-tighter leading-none mb-1">
                      Order #{selected.orderNumber}
                    </h2>
                    <p className="text-[8px] font-bold text-noir/30 dark:text-white/30 uppercase tracking-[0.3em]">
                      {new Date(selected.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </p>
                  </div>
                </div>
                <button 
                  onClick={() => setSelected(null)}
                  className="w-9 h-9 rounded-lg bg-noir/5 dark:bg-white/5 flex items-center justify-center text-noir/40 dark:text-white/40 hover:bg-red-500 hover:text-white transition-all"
                >
                  <X size={16} />
                </button>
              </div>

              {/* Modal Content */}
              <div className="flex-1 overflow-y-auto p-6 sm:p-8 space-y-8 custom-scrollbar">
                {/* Payment Screenshot */}
                {selected.paymentScreenshot?.url && (
                  <div>
                    <p className="text-[9px] font-black text-noir/30 dark:text-white/30 uppercase tracking-widest mb-3 ml-1">Payment Verification</p>
                    <div 
                      className="w-full aspect-[16/9] rounded-2xl overflow-hidden border border-noir/10 dark:border-white/10 group relative cursor-pointer shadow-sm bg-noir/[0.02] dark:bg-white/[0.02]"
                      onClick={() => window.open(selected.paymentScreenshot?.url, '_blank')}
                    >
                      <img src={selected.paymentScreenshot.url} alt="Telebirr Receipt" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                      <div className="absolute inset-0 bg-noir/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <div className="px-4 py-2 bg-white rounded-full text-[8px] font-black uppercase tracking-widest text-noir shadow-xl">
                          Full View
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Customer Info Cards (Dynamic Grid) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-4 rounded-2xl bg-noir/[0.02] dark:bg-white/[0.02] border border-noir/5 dark:border-white/5">
                    <p className="text-[8px] font-black text-noir/30 dark:text-white/30 uppercase tracking-widest mb-2">Customer</p>
                    <p className="text-xs font-black text-noir dark:text-white uppercase truncate">{selected.customer?.name}</p>
                    <p className="text-[10px] font-bold text-noir/40 dark:text-white/40 truncate">{selected.customer?.email}</p>
                    <p className="text-[10px] font-bold text-noir/40 dark:text-white/40">{selected.customer?.phone}</p>
                  </div>
                  <div className="p-4 rounded-2xl bg-noir/[0.02] dark:bg-white/[0.02] border border-noir/5 dark:border-white/5">
                    <p className="text-[8px] font-black text-noir/30 dark:text-white/30 uppercase tracking-widest mb-2">Destination</p>
                    <p className="text-[10px] font-bold text-noir/60 dark:text-white/60 leading-tight uppercase line-clamp-2">
                      {selected.customer?.address || 'Not provided'}
                    </p>
                  </div>
                </div>

                {/* Items */}
                <div className="space-y-3">
                  <p className="text-[9px] font-black text-noir/30 dark:text-white/30 uppercase tracking-widest ml-1">Items Summary</p>
                  <div className="space-y-2">
                    {selected.items?.map((item, i) => (
                      <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-noir/[0.02] dark:bg-white/[0.02] border border-noir/5 dark:border-white/5">
                        <div className="w-12 h-14 rounded-lg bg-noir/5 dark:bg-white/5 overflow-hidden flex-shrink-0">
                          <img src={item.hoodieImage} alt="" className="w-full h-full object-cover" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-[11px] font-black text-noir dark:text-white uppercase truncate">{item.hoodieName}</p>
                          <p className="text-[9px] font-bold text-noir/40 dark:text-white/40 uppercase tracking-widest">
                            {item.size} / {item.color} · Qty {item.quantity}
                          </p>
                        </div>
                        <p className="text-[11px] font-black text-noir dark:text-white">ETB {item.subtotal?.toLocaleString()}</p>
                      </div>
                    ))}
                  </div>
                  <div className="flex justify-between items-center p-4 rounded-2xl bg-noir dark:bg-white mt-4">
                    <span className="text-[9px] font-black uppercase tracking-widest text-white/40 dark:text-noir/40">Grand Total</span>
                    <span className="text-base font-black text-white dark:text-noir tracking-tight">ETB {selected.totalAmount?.toLocaleString()}</span>
                  </div>
                </div>

                {/* Status Update (Compact) */}
                <div className="space-y-4 pt-2">
                  <div className="grid grid-cols-3 gap-2">
                    {STATUSES.map((s) => (
                      <button
                        key={s}
                        onClick={() => setNewStatus(s)}
                        className={`text-[8px] font-black uppercase tracking-widest py-2.5 rounded-lg border transition-all ${
                          newStatus === s 
                            ? 'bg-[#4F46E5] border-[#4F46E5] text-white shadow-lg shadow-indigo-500/10' 
                            : 'bg-white dark:bg-white/5 border-noir/10 dark:border-white/10 text-noir/40 dark:text-white/40 hover:border-noir/20'
                        }`}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <input
                      placeholder="Add fulfillment note..."
                      value={statusNote}
                      onChange={(e) => setStatusNote(e.target.value)}
                      className="flex-1 bg-noir/5 dark:bg-white/5 border border-noir/5 dark:border-white/5 rounded-xl px-4 py-3 text-[10px] focus:outline-none focus:border-[#4F46E5] transition-colors text-noir dark:text-white"
                    />
                    <button 
                      onClick={handleStatusUpdate} 
                      disabled={updating || newStatus === selected.status} 
                      className="px-6 rounded-xl bg-noir dark:bg-white text-white dark:text-noir text-[9px] font-black uppercase tracking-widest hover:opacity-90 transition-all disabled:opacity-50 flex items-center gap-2"
                    >
                      {updating ? '...' : 'Update'}
                      <ArrowRight size={12} />
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminOrders;
