import React, { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, 
  Pencil, 
  Trash2, 
  Search, 
  ToggleLeft, 
  ToggleRight, 
  X, 
  Download, 
  AlertTriangle, 
  Grid, 
  Truck, 
  Package, 
  MoreVertical, 
  ChevronRight, 
  ArrowRight,
  TrendingUp,
  FileText,
  Upload,
  Image as ImageIcon,
  Palette,
  Maximize2,
  DollarSign
} from 'lucide-react';
import api from '../../services/api';
import type { Hoodie } from '../../types';

const EMPTY_FORM = {
  name: '', brand: 'HoodVault', description: '', price: '', discountPrice: '',
  category: 'oversized', featured: false, newArrival: false, isActive: true,
  sizes: [{ size: 'S', stock: 0 }, { size: 'M', stock: 0 }, { size: 'L', stock: 0 }, { size: 'XL', stock: 0 }],
  colors: [{ name: 'Black', hex: '#000000' }],
};

const AdminProducts: React.FC = () => {
  const [hoodies, setHoodies] = useState<Hoodie[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editHoodie, setEditHoodie] = useState<Hoodie | null>(null);
  const [form, setForm] = useState<any>(EMPTY_FORM);
  const [images, setImages] = useState<File[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const fetchHoodies = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(page), limit: '15' });
      if (search) params.set('search', search);
      const { data } = await api.get(`/hoodies/admin/all?${params}`);
      setHoodies(data.data.hoodies);
      setTotal(data.data.total);
    } catch {}
    setLoading(false);
  }, [page, search]);

  useEffect(() => { fetchHoodies(); }, [fetchHoodies]);

  const openCreate = () => { setEditHoodie(null); setForm(EMPTY_FORM); setImages([]); setError(''); setModalOpen(true); };
  const openEdit = (h: Hoodie) => { setEditHoodie(h); setForm({ ...h, price: h.price, discountPrice: h.discountPrice || '' }); setImages([]); setError(''); setModalOpen(true); };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => {
        if (k === 'sizes' || k === 'colors') fd.append(k, JSON.stringify(v));
        else if (k !== 'images') fd.append(k, String(v));
      });
      images.forEach((img) => fd.append('images', img));

      if (editHoodie) {
        await api.put(`/hoodies/${editHoodie._id}`, fd, { headers: { 'Content-Type': 'multipart/form-data' } });
        setSuccess('Product updated successfully!');
      } else {
        await api.post('/hoodies', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
        setSuccess('New product added to archive!');
      }
      
      setTimeout(() => setSuccess(''), 3000);
      setModalOpen(false);
      fetchHoodies();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to save hoodie.');
    }
    setSubmitting(false);
  };

  const handleDelete = async (id: string) => {
    try {
      await api.delete(`/hoodies/${id}`);
      setDeleteId(null);
      fetchHoodies();
    } catch {}
  };

  const updateSize = (size: string, stock: number) => {
    setForm((f: any) => ({ ...f, sizes: f.sizes.map((s: any) => s.size === size ? { ...s, stock } : s) }));
  };

  const addColor = () => setForm((f: any) => ({ ...f, colors: [...f.colors, { name: '', hex: '#888888' }] }));
  const updateColor = (i: number, field: string, val: string) => {
    setForm((f: any) => ({ ...f, colors: f.colors.map((c: any, ci: number) => ci === i ? { ...c, [field]: val } : c) }));
  };
  const removeColor = (i: number) => setForm((f: any) => ({ ...f, colors: f.colors.filter((_: any, ci: number) => ci !== i) }));

  const pages = Math.ceil(total / 15);

  const StatCard = ({ title, value, icon, color }: { title: string; value: string; icon: React.ReactNode; color: string }) => (
    <div className="bg-white dark:bg-white/5 p-6 rounded-[32px] border border-noir/5 dark:border-white/5 shadow-sm flex items-center gap-6">
      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${color} shadow-sm`}>
        {icon}
      </div>
      <div>
        <p className="text-[10px] font-black uppercase tracking-widest text-noir/30 dark:text-white/30 mb-1">{title}</p>
        <p className="text-2xl font-black text-noir dark:text-white tracking-tight leading-none">{value}</p>
      </div>
    </div>
  );

  return (
    <div className="space-y-10">
      {/* Success Notification */}
      <AnimatePresence>
        {success && (
          <motion.div 
            initial={{ opacity: 0, y: -20, x: '-50%' }}
            animate={{ opacity: 1, y: 0, x: '-50%' }}
            exit={{ opacity: 0, y: -20, x: '-50%' }}
            className="fixed top-10 left-1/2 z-[100] bg-emerald-500 text-white px-8 py-4 rounded-2xl shadow-2xl flex items-center gap-3 font-black uppercase text-[10px] tracking-widest"
          >
            <Package size={18} />
            {success}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
        <div>
          <h1 className="text-[40px] font-black text-noir dark:text-white tracking-tighter uppercase leading-none mb-2">
            Products
          </h1>
          <p className="text-sm text-noir/40 dark:text-white/40 font-medium tracking-tight">Manage your inventory, pricing, and stock status across all categories.</p>
        </div>
        <div className="flex gap-4">
          <button 
            onClick={openCreate} 
            className="bg-[#4F46E5] text-white px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center gap-3 hover:opacity-90 transition-all shadow-xl shadow-indigo-500/20"
          >
            <Plus size={16} />
            Add Product
          </button>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Total Products" 
          value={total.toLocaleString()} 
          icon={<Package size={24} className="text-[#4F46E5]" />} 
          color="bg-indigo-50 dark:bg-indigo-500/10" 
        />
        <StatCard 
          title="Out of Stock" 
          value={hoodies.filter(h => h.totalStock === 0).length.toString()} 
          icon={<AlertTriangle size={24} className="text-red-500" />} 
          color="bg-red-50 dark:bg-red-500/10" 
        />
        <StatCard 
          title="Categories" 
          value="5" 
          icon={<Grid size={24} className="text-amber-500" />} 
          color="bg-amber-50 dark:bg-amber-500/10" 
        />
        <StatCard 
          title="In Transit" 
          value="482" 
          icon={<Truck size={24} className="text-emerald-500" />} 
          color="bg-emerald-50 dark:bg-emerald-500/10" 
        />
      </div>

      {/* Table Section */}
      <div className="bg-white dark:bg-white/5 rounded-[40px] border border-noir/5 dark:border-white/5 shadow-sm overflow-hidden">
        {/* Filters Bar */}
        <div className="px-8 py-6 border-b border-noir/5 dark:border-white/5 flex flex-wrap items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="relative min-w-[180px]">
              <select className="w-full appearance-none bg-[#F3F4F6] dark:bg-white/5 border-none rounded-2xl py-3 pl-6 pr-12 text-[10px] font-black uppercase tracking-widest focus:ring-2 focus:ring-[#4F46E5]/20 transition-all outline-none">
                <option>All Categories</option>
                <option>Oversized</option>
                <option>Streetwear</option>
              </select>
              <ChevronRight className="absolute right-4 top-1/2 -translate-y-1/2 rotate-90 text-noir/30 dark:text-white/30" size={14} />
            </div>
            <div className="relative min-w-[180px]">
              <select className="w-full appearance-none bg-[#F3F4F6] dark:bg-white/5 border-none rounded-2xl py-3 pl-6 pr-12 text-[10px] font-black uppercase tracking-widest focus:ring-2 focus:ring-[#4F46E5]/20 transition-all outline-none">
                <option>Stock Level</option>
                <option>Low Stock</option>
                <option>Out of Stock</option>
              </select>
              <ChevronRight className="absolute right-4 top-1/2 -translate-y-1/2 rotate-90 text-noir/30 dark:text-white/30" size={14} />
            </div>
          </div>
          <div className="text-[10px] font-black text-noir/30 dark:text-white/30 uppercase tracking-widest">
            Showing {Math.min(hoodies.length, 15)} of {total} products
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b border-noir/5 dark:border-white/5">
                {[
                  { label: 'Product Name', align: 'left' },
                  { label: 'SKU', align: 'left' },
                  { label: 'Category', align: 'left' },
                  { label: 'Price', align: 'left' },
                  { label: 'Stock Level', align: 'left' },
                  { label: 'Status', align: 'left' },
                  { label: 'Actions', align: 'right' }
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
                    {[...Array(7)].map((_, j) => (
                      <td key={j} className="px-8 py-8">
                        <div className="h-4 bg-noir/5 dark:bg-white/5 animate-pulse rounded-lg" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : hoodies.map((h) => (
                <motion.tr 
                  key={h._id} 
                  initial={{ opacity: 0 }} 
                  animate={{ opacity: 1 }} 
                  className="group hover:bg-noir/[0.02] dark:hover:bg-white/[0.02] transition-colors"
                >
                  <td className="px-8 py-8">
                    <div className="flex items-center gap-8">
                      <div className="w-20 h-24 rounded-2xl bg-[#F8F9FA] dark:bg-white/5 overflow-hidden shadow-sm flex-shrink-0 border border-noir/5 dark:border-white/5">
                        <img 
                          src={h.images?.[0]?.url || 'https://images.unsplash.com/photo-1556821840-3a63f15732ce?w=200'} 
                          alt={h.name} 
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" 
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1556821840-3a63f15732ce?w=200';
                          }}
                        />
                      </div>
                      <div className="overflow-hidden">
                        <p className="text-base font-black text-noir dark:text-white uppercase tracking-tight truncate mb-1">{h.name}</p>
                        <div className="flex items-center gap-3">
                          <span className="text-[10px] font-black text-noir/20 dark:text-white/20 uppercase tracking-widest">{h.brand}</span>
                          <div className="w-1 h-1 rounded-full bg-noir/10 dark:bg-white/10" />
                          <span className="text-[10px] font-black text-[#4F46E5] uppercase tracking-widest">{h.category}</span>
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <span className="text-[10px] font-black text-noir/40 dark:text-white/40 uppercase tracking-widest">
                      {h.name.substring(0, 3).toUpperCase()}-{h._id.substring(h._id.length - 5).toUpperCase()}
                    </span>
                  </td>
                  <td className="px-8 py-6">
                    <span className="text-[10px] font-black text-noir/40 dark:text-white/40 uppercase tracking-widest">{h.category}</span>
                  </td>
                  <td className="px-8 py-6">
                    <span className="text-sm font-black text-noir dark:text-white tracking-tighter">${h.price.toLocaleString()}</span>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex flex-col gap-2 min-w-[120px]">
                      <div className="w-full h-1.5 bg-noir/5 dark:bg-white/5 rounded-full overflow-hidden">
                        <div 
                          className={`h-full rounded-full transition-all duration-1000 ${
                            h.totalStock > 20 ? 'bg-[#4F46E5]' : h.totalStock > 0 ? 'bg-amber-500' : 'bg-red-500'
                          }`} 
                          style={{ width: `${Math.min((h.totalStock / 100) * 100, 100)}%` }}
                        />
                      </div>
                      <span className="text-[10px] font-black text-noir/40 dark:text-white/40 uppercase tracking-widest">
                        {h.totalStock} in stock
                      </span>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <span className={`text-[8px] font-black uppercase tracking-[0.2em] px-3 py-1.5 rounded-full ${
                      h.totalStock > 20 ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400' :
                      h.totalStock > 0 ? 'bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400' :
                      'bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-400'
                    }`}>
                      {h.totalStock > 20 ? 'In Stock' : h.totalStock > 0 ? 'Low Stock' : 'Out of Stock'}
                    </span>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex items-center justify-end gap-3">
                      {h.isActive && (
                        <a 
                          href={`/shop?search=${encodeURIComponent(h.name)}`} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="w-10 h-10 rounded-xl bg-[#F8F9FA] dark:bg-white/5 flex items-center justify-center text-noir/40 dark:text-white/40 hover:bg-emerald-500 hover:text-white transition-all shadow-sm"
                          title="View on Shop"
                        >
                          <Maximize2 size={16} />
                        </a>
                      )}
                      <button onClick={() => openEdit(h)} className="w-10 h-10 rounded-xl bg-[#F8F9FA] dark:bg-white/5 flex items-center justify-center text-noir/40 dark:text-white/40 hover:bg-[#4F46E5] hover:text-white transition-all shadow-sm">
                        <Pencil size={16} />
                      </button>
                      <button onClick={() => setDeleteId(h._id)} className="w-10 h-10 rounded-xl bg-[#F8F9FA] dark:bg-white/5 flex items-center justify-center text-noir/40 dark:text-white/40 hover:bg-red-500 hover:text-white transition-all shadow-sm">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {!loading && hoodies.length === 0 && (
          <div className="py-20 text-center">
            <p className="text-sm font-black text-noir/20 dark:text-white/20 uppercase tracking-[0.2em]">No products found in archive</p>
          </div>
        )}

        {/* Footer / Pagination */}
        <div className="px-8 py-6 bg-noir/[0.01] dark:bg-white/[0.01] border-t border-noir/5 dark:border-white/5 flex items-center justify-between">
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
          <div className="text-[10px] font-black text-noir/30 dark:text-white/30 uppercase tracking-widest">
            Page {page} of {pages}
          </div>
        </div>
      </div>

      {/* Footer Insight Cards */}
      <div className="grid lg:grid-cols-2 gap-8">
        <div className="bg-white dark:bg-white/5 p-10 rounded-[40px] border border-noir/5 dark:border-white/5 shadow-sm relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-10 opacity-10 group-hover:opacity-20 transition-opacity">
            <TrendingUp size={120} className="text-[#4F46E5]" />
          </div>
          <div className="relative z-10">
            <h2 className="text-xl font-black text-noir dark:text-white tracking-tight uppercase mb-4">Inventory Insight</h2>
            <p className="text-sm text-noir/40 dark:text-white/40 font-medium tracking-tight mb-8 max-w-md">
              Your streetwear category is seeing a 15% increase in velocity. Consider replenishing 'Premium Hoodies' before weekend peak sales.
            </p>
            <button className="flex items-center gap-2 text-[10px] font-black text-[#4F46E5] uppercase tracking-widest hover:gap-4 transition-all">
              View Analytics Report
              <ArrowRight size={14} />
            </button>
          </div>
        </div>

        <div className="bg-[#4F46E5] p-10 rounded-[40px] shadow-xl shadow-indigo-500/20 relative overflow-hidden group">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-white/10 to-transparent" />
          <div className="relative z-10">
            <h2 className="text-xl font-black text-white tracking-tight uppercase mb-4">Bulk Product Update</h2>
            <p className="text-sm text-white/60 font-medium tracking-tight mb-8 max-w-md">
              New CSV import tools are live. You can now update prices and stock levels for up to 5,000 items in a single upload.
            </p>
            <button className="bg-white text-[#4F46E5] px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:scale-105 transition-all shadow-lg">
              Try Bulk Import
            </button>
          </div>
        </div>
      </div>

      {/* Delete Confirm */}
      <AnimatePresence>
        {deleteId && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }} className="bg-background border border-border p-8 max-w-sm w-full">
              <h3 className="font-display text-2xl tracking-widest mb-3">DELETE PRODUCT</h3>
              <p className="text-muted-foreground text-sm mb-6">This action cannot be undone. The product and all its images will be permanently deleted.</p>
              <div className="flex gap-3">
                <button onClick={() => handleDelete(deleteId)} className="flex-1 bg-brand-500 hover:bg-brand-600 text-white font-heading tracking-widest uppercase text-sm py-3 transition-colors">
                  Delete
                </button>
                <button onClick={() => setDeleteId(null)} className="flex-1 border border-border font-heading tracking-widest uppercase text-sm py-3 hover:bg-accent transition-colors">
                  Cancel
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Create/Edit Slide-over */}
      <AnimatePresence>
        {modalOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }} 
              onClick={() => setModalOpen(false)}
              className="fixed inset-0 bg-noir/60 backdrop-blur-sm z-[60]" 
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: '-45%', x: '-50%' }} 
              animate={{ opacity: 1, scale: 1, y: '-50%', x: '-50%' }} 
              exit={{ opacity: 0, scale: 0.9, y: '-45%', x: '-50%' }} 
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="fixed left-1/2 top-1/2 w-[90%] max-w-[700px] max-h-[88vh] bg-white dark:bg-[#0A0A0A] z-[70] shadow-[0_32px_128px_-16px_rgba(0,0,0,0.3)] dark:shadow-[0_32px_128px_-16px_rgba(0,0,0,0.8)] rounded-[40px] flex flex-col overflow-hidden border border-noir/5 dark:border-white/5"
            >
              {/* Modal Header */}
              <div className="px-10 py-8 border-b border-noir/5 dark:border-white/5 flex items-center justify-between bg-noir/[0.01] dark:bg-white/[0.01]">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-lg shadow-indigo-500/20">
                    <Package size={24} />
                  </div>
                  <div>
                    <h2 className="text-2xl font-black text-noir dark:text-white uppercase tracking-tighter leading-none">
                      {editHoodie ? 'Edit Archive' : 'Add New Item'}
                    </h2>
                    <p className="text-[9px] font-bold text-noir/30 dark:text-white/30 uppercase tracking-[0.3em] mt-1.5">
                      System Inventory Configuration
                    </p>
                  </div>
                </div>
                <button 
                  onClick={() => setModalOpen(false)} 
                  className="w-10 h-10 rounded-xl bg-noir/5 dark:bg-white/5 flex items-center justify-center text-noir/40 dark:text-white/40 hover:bg-red-500 hover:text-white transition-all hover:rotate-90"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Modal Content */}
              <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto px-10 py-8 space-y-10 custom-scrollbar bg-white dark:bg-[#0A0A0A]">
                {error && (
                  <div className="bg-red-50 dark:bg-red-500/10 border border-red-100 dark:border-red-500/20 p-3.5 rounded-xl flex items-center gap-3 text-red-600 text-[11px] font-bold">
                    <AlertTriangle size={14} />
                    {error}
                  </div>
                )}

                {/* Primary Info */}
                <div className="space-y-5">
                  <div className="flex items-center gap-2.5 mb-1.5">
                    <FileText size={14} className="text-[#4F46E5]" />
                    <span className="text-[9px] font-black uppercase tracking-[0.2em] text-noir/30 dark:text-white/30">Primary Information</span>
                  </div>
                  
                  <div className="space-y-3.5">
                    <div className="space-y-1.5">
                      <label className="text-[9px] font-black uppercase tracking-widest text-noir/40 dark:text-white/40 ml-1">Product Name</label>
                      <input 
                        required 
                        value={form.name} 
                        onChange={(e) => setForm((f: any) => ({ ...f, name: e.target.value }))} 
                        placeholder="e.g. Urban Shadow Oversized Hoodie"
                        className="w-full bg-noir/5 dark:bg-white/5 border border-noir/5 dark:border-white/5 rounded-xl px-5 py-3.5 text-xs focus:outline-none focus:border-[#4F46E5] transition-colors text-noir dark:text-white" 
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3.5">
                      <div className="space-y-1.5">
                        <label className="text-[9px] font-black uppercase tracking-widest text-noir/40 dark:text-white/40 ml-1">Brand</label>
                        <input 
                          value={form.brand} 
                          onChange={(e) => setForm((f: any) => ({ ...f, brand: e.target.value }))} 
                          className="w-full bg-noir/5 dark:bg-white/5 border border-noir/5 dark:border-white/5 rounded-xl px-5 py-3.5 text-xs focus:outline-none focus:border-[#4F46E5] transition-colors text-noir dark:text-white" 
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[9px] font-black uppercase tracking-widest text-noir/40 dark:text-white/40 ml-1">Category</label>
                        <div className="relative">
                          <select 
                            value={form.category} 
                            onChange={(e) => setForm((f: any) => ({ ...f, category: e.target.value }))} 
                            className="w-full appearance-none bg-noir/5 dark:bg-white/5 border border-noir/5 dark:border-white/5 rounded-xl px-5 py-3.5 text-xs focus:outline-none focus:border-[#4F46E5] transition-colors text-noir dark:text-white"
                          >
                            {['oversized', 'streetwear', 'graphic', 'zip-up', 'winter'].map((c) => <option key={c} value={c}>{c.toUpperCase()}</option>)}
                          </select>
                          <ChevronRight className="absolute right-3.5 top-1/2 -translate-y-1/2 rotate-90 text-noir/20 pointer-events-none" size={12} />
                        </div>
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[9px] font-black uppercase tracking-widest text-noir/40 dark:text-white/40 ml-1">Description</label>
                      <textarea 
                        required 
                        value={form.description} 
                        onChange={(e) => setForm((f: any) => ({ ...f, description: e.target.value }))} 
                        placeholder="Describe the material, fit, and unique features..."
                        rows={3}
                        className="w-full bg-noir/5 dark:bg-white/5 border border-noir/5 dark:border-white/5 rounded-xl px-5 py-3.5 text-xs focus:outline-none focus:border-[#4F46E5] transition-colors text-noir dark:text-white resize-none" 
                      />
                    </div>
                  </div>
                </div>

                {/* Pricing */}
                <div className="space-y-5">
                  <div className="flex items-center gap-2.5 mb-1.5">
                    <DollarSign size={14} className="text-emerald-500" />
                    <span className="text-[9px] font-black uppercase tracking-[0.2em] text-noir/30 dark:text-white/30">Pricing & Commerce</span>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3.5">
                    <div className="space-y-1.5">
                      <label className="text-[9px] font-black uppercase tracking-widest text-noir/40 dark:text-white/40 ml-1">Base Price (ETB)</label>
                      <input 
                        required 
                        type="number" 
                        value={form.price} 
                        onChange={(e) => setForm((f: any) => ({ ...f, price: e.target.value }))} 
                        className="w-full bg-noir/5 dark:bg-white/5 border border-noir/5 dark:border-white/5 rounded-xl px-5 py-3.5 text-xs focus:outline-none focus:border-[#4F46E5] transition-colors text-noir dark:text-white" 
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[9px] font-black uppercase tracking-widest text-noir/40 dark:text-white/40 ml-1">Discount Price (Optional)</label>
                      <input 
                        type="number" 
                        value={form.discountPrice} 
                        onChange={(e) => setForm((f: any) => ({ ...f, discountPrice: e.target.value }))} 
                        className="w-full bg-noir/5 dark:bg-white/5 border border-noir/5 dark:border-white/5 rounded-xl px-5 py-3.5 text-xs focus:outline-none focus:border-[#4F46E5] transition-colors text-noir dark:text-white" 
                      />
                    </div>
                  </div>
                </div>

                {/* Assets */}
                <div className="space-y-5">
                  <div className="flex items-center gap-2.5 mb-1.5">
                    <ImageIcon size={14} className="text-amber-500" />
                    <span className="text-[9px] font-black uppercase tracking-[0.2em] text-noir/30 dark:text-white/30">Visual Assets</span>
                  </div>
                  
                  <div 
                    className="border-2 border-dashed border-noir/10 dark:border-white/10 rounded-[28px] p-8 flex flex-col items-center justify-center gap-3 hover:bg-noir/[0.02] dark:hover:bg-white/[0.02] transition-colors cursor-pointer group relative"
                    onClick={() => document.getElementById('image-upload')?.click()}
                  >
                    <input 
                      id="image-upload"
                      type="file" 
                      accept="image/*" 
                      multiple 
                      onChange={(e) => setImages(Array.from(e.target.files || []))} 
                      className="hidden"
                      required={!editHoodie} 
                    />
                    <div className="w-14 h-14 rounded-full bg-noir/5 dark:bg-white/5 flex items-center justify-center text-noir/20 dark:text-white/20 group-hover:text-[#4F46E5] transition-colors">
                      <Upload size={20} />
                    </div>
                    <div className="text-center">
                      <p className="text-xs font-black text-noir dark:text-white uppercase tracking-tight">Drop images or click to upload</p>
                      <p className="text-[9px] font-bold text-noir/30 dark:text-white/30 uppercase tracking-widest mt-0.5">High resolution JPG or PNG preferred</p>
                    </div>
                    {images.length > 0 && (
                      <div className="absolute inset-0 bg-white/95 dark:bg-[#0A0A0A]/95 p-3.5 rounded-[28px] flex flex-wrap items-center justify-center gap-2 overflow-y-auto">
                        {images.map((img, i) => (
                          <div key={i} className="w-16 h-20 rounded-lg overflow-hidden relative group/img">
                            <img src={URL.createObjectURL(img)} alt="" className="w-full h-full object-cover" />
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center">
                              <X 
                                size={12} 
                                className="text-white cursor-pointer" 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setImages(prev => prev.filter((_, index) => index !== i));
                                }}
                              />
                            </div>
                          </div>
                        ))}
                        <div className="w-full text-center mt-1.5">
                          <span className="text-[9px] font-black text-[#4F46E5] uppercase tracking-widest">{images.length} File(s) Selected</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Inventory Matrix */}
                <div className="space-y-5">
                  <div className="flex items-center gap-2.5 mb-1.5">
                    <Maximize2 size={14} className="text-emerald-500" />
                    <span className="text-[9px] font-black uppercase tracking-[0.2em] text-noir/30 dark:text-white/30">Inventory Matrix</span>
                  </div>
                  
                  <div className="grid grid-cols-4 gap-3.5">
                    {form.sizes.map((s: any) => (
                      <div key={s.size} className="bg-noir/5 dark:bg-white/5 rounded-xl p-3 border border-noir/5 dark:border-white/5">
                        <label className="text-[9px] font-black uppercase tracking-widest text-noir/30 dark:text-white/30 block mb-1.5">{s.size}</label>
                        <input 
                          type="number" 
                          min="0" 
                          value={s.stock} 
                          onChange={(e) => updateSize(s.size, Number(e.target.value))} 
                          className="w-full bg-transparent text-base font-black text-noir dark:text-white focus:outline-none" 
                        />
                      </div>
                    ))}
                  </div>
                </div>

                {/* Color Palette */}
                <div className="space-y-5">
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2.5">
                      <Palette size={14} className="text-pink-500" />
                      <span className="text-[9px] font-black uppercase tracking-[0.2em] text-noir/30 dark:text-white/30">Color Palette</span>
                    </div>
                    <button type="button" onClick={addColor} className="text-[9px] font-black text-[#4F46E5] uppercase tracking-widest">+ Add Color</button>
                  </div>
                  
                  <div className="space-y-2.5">
                    {form.colors.map((c: any, i: number) => (
                      <div key={i} className="flex items-center gap-3.5 bg-noir/5 dark:bg-white/5 rounded-xl p-2.5 border border-noir/5 dark:border-white/5">
                        <div className="relative w-8 h-8 rounded-lg overflow-hidden shadow-sm border border-noir/10">
                          <input 
                            type="color" 
                            value={c.hex} 
                            onChange={(e) => updateColor(i, 'hex', e.target.value)} 
                            className="absolute inset-[-100%] w-[300%] h-[300%] cursor-pointer" 
                          />
                        </div>
                        <input 
                          value={c.name} 
                          onChange={(e) => updateColor(i, 'name', e.target.value)} 
                          placeholder="Color name (e.g. Midnight Black)" 
                          className="flex-1 bg-transparent text-xs font-bold text-noir dark:text-white focus:outline-none" 
                        />
                        {form.colors.length > 1 && (
                          <button type="button" onClick={() => removeColor(i)} className="w-7 h-7 rounded-lg flex items-center justify-center text-noir/20 hover:text-red-500 transition-colors">
                            <X size={14} />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Configuration */}
                <div className="space-y-5">
                  <div className="flex items-center gap-2.5 mb-1.5">
                    <Grid size={14} className="text-indigo-500" />
                    <span className="text-[9px] font-black uppercase tracking-[0.2em] text-noir/30 dark:text-white/30">Item Configuration</span>
                  </div>
                  
                  <div className="flex flex-wrap gap-3.5">
                    {[
                      { key: 'featured', label: 'Featured' },
                      { key: 'newArrival', label: 'New Arrival' },
                      { key: 'isActive', label: 'Published' },
                    ].map(({ key, label }) => (
                      <button 
                        key={key}
                        type="button" 
                        onClick={() => setForm((f: any) => ({ ...f, [key]: !f[key] }))}
                        className={`flex flex-col items-center gap-2 px-5 py-3 rounded-xl border transition-all ${
                          form[key] 
                            ? 'bg-[#4F46E5] border-[#4F46E5] text-white shadow-lg shadow-indigo-500/20' 
                            : 'bg-white dark:bg-white/5 border-noir/10 dark:border-white/10 text-noir/40 dark:text-white/40'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          {form[key] ? <ToggleRight size={18} /> : <ToggleLeft size={18} />}
                          <span className="text-[9px] font-black uppercase tracking-widest">{label}</span>
                        </div>
                        {key === 'isActive' && (
                          <span className={`text-[7px] font-bold uppercase tracking-widest opacity-60`}>
                            {form[key] ? 'Visible to Customers' : 'Hidden from Shop'}
                          </span>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
                
                {/* Spacer for scroll */}
                <div className="h-6" />
              </form>

              {/* Modal Footer */}
              <div className="px-10 py-8 border-t border-noir/5 dark:border-white/5 bg-noir/[0.01] dark:bg-white/[0.01] flex items-center gap-5">
                <button 
                  type="button" 
                  onClick={() => setModalOpen(false)} 
                  className="flex-1 px-6 py-4 rounded-2xl text-[11px] font-black uppercase tracking-widest text-noir/40 dark:text-white/40 hover:text-noir dark:hover:text-white transition-colors"
                >
                  Discard
                </button>
                <button 
                  onClick={handleSubmit}
                  disabled={submitting} 
                  className="flex-[2] bg-noir dark:bg-white text-white dark:text-noir px-6 py-4 rounded-2xl text-[11px] font-black uppercase tracking-[0.2em] hover:opacity-90 transition-all shadow-2xl disabled:opacity-50 flex items-center justify-center gap-2.5 group"
                >
                  {submitting ? 'Processing...' : (
                    <>
                      {editHoodie ? 'Save' : 'Confirm'}
                      <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminProducts;
