import React, { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Pencil, Trash2, X, AlertCircle, Shield, User as UserIcon } from 'lucide-react';
import api from '../services/api';
import type { User } from '../types';
import { useAuth } from '../contexts/AuthContext';

const AdminAdmins: React.FC = () => {
  const [admins, setAdmins] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editAdmin, setEditAdmin] = useState<User | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [form, setForm] = useState({ name: '', username: '', email: '', password: '', role: 'admin' });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const { user } = useAuth();

  const fetchAdmins = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/admin/admins');
      setAdmins(data.data.admins);
    } catch {}
    setLoading(false);
  }, []);

  useEffect(() => { fetchAdmins(); }, [fetchAdmins]);

  const openCreate = () => { setEditAdmin(null); setForm({ name: '', username: '', email: '', password: '', role: 'admin' }); setError(''); setModalOpen(true); };
  const openEdit = (a: User) => { setEditAdmin(a); setForm({ name: a.name, username: a.username, email: a.email, password: '', role: a.role }); setError(''); setModalOpen(true); };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      const payload: any = { name: form.name, username: form.username, email: form.email, role: form.role };
      if (form.password) payload.password = form.password;
      if (editAdmin) {
        await api.put(`/admin/admins/${editAdmin.id}`, payload);
      } else {
        if (!form.password) { setError('Password is required'); setSaving(false); return; }
        await api.post('/admin/admins', { ...payload, password: form.password });
      }
      setModalOpen(false);
      fetchAdmins();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to save admin.');
    }
    setSaving(false);
  };

  const handleDelete = async (id: string) => {
    try {
      await api.delete(`/admin/admins/${id}`);
      setDeleteId(null);
      fetchAdmins();
    } catch {}
  };

  return (
    <div className="space-y-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-[40px] font-black text-noir dark:text-white tracking-tighter uppercase leading-none mb-2">
            Admin Access
          </h1>
          <p className="text-sm text-noir/40 dark:text-white/40 font-medium tracking-tight">Manage administrative roles and permissions.</p>
        </div>
        <button 
          onClick={openCreate} 
          className="bg-[#4F46E5] text-white px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center gap-3 hover:opacity-90 transition-all shadow-xl shadow-indigo-500/20"
        >
          <Plus size={16} />
          Add Admin
        </button>
      </div>

      {/* Table Section */}
      <div className="bg-white dark:bg-white/5 rounded-[40px] border border-noir/5 dark:border-white/5 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b border-noir/5 dark:border-white/5">
                {[
                  { label: 'Administrator', align: 'left' },
                  { label: 'Username', align: 'left' },
                  { label: 'Email', align: 'left' },
                  { label: 'Role', align: 'left' },
                  { label: 'Joined', align: 'left' },
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
                [...Array(4)].map((_, i) => (
                  <tr key={i}>
                    {[...Array(6)].map((_, j) => (
                      <td key={j} className="px-8 py-8">
                        <div className="h-4 bg-noir/5 dark:bg-white/5 animate-pulse rounded-lg" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : admins.map((a) => (
                <motion.tr 
                  key={a.id} 
                  initial={{ opacity: 0 }} 
                  animate={{ opacity: 1 }} 
                  className="group hover:bg-noir/[0.02] dark:hover:bg-white/[0.02] transition-colors"
                >
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-[#0F172A] flex items-center justify-center text-white text-xs font-black shadow-sm flex-shrink-0">
                        {a.name?.[0]?.toUpperCase()}
                      </div>
                      <div className="flex flex-col">
                        <span className="text-sm font-black text-noir dark:text-white uppercase tracking-tight">{a.name}</span>
                        {a.id === user?.id && <span className="text-[8px] font-black uppercase tracking-widest text-[#4F46E5] mt-0.5">Active Session</span>}
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <span className="text-[10px] font-black text-noir/40 dark:text-white/40 uppercase tracking-widest">@{a.username}</span>
                  </td>
                  <td className="px-8 py-6">
                    <span className="text-sm font-bold text-noir/60 dark:text-white/60 tracking-tight">{a.email}</span>
                  </td>
                  <td className="px-8 py-6">
                    <span className={`text-[8px] font-black uppercase tracking-[0.2em] px-3 py-1.5 rounded-full ${
                      a.role === 'superadmin' 
                        ? 'bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400' 
                        : 'bg-noir/5 text-noir/60 dark:bg-white/5 dark:text-white/60'
                    }`}>
                      {a.role}
                    </span>
                  </td>
                  <td className="px-8 py-6">
                    <span className="text-[10px] font-black text-noir/40 dark:text-white/40 uppercase tracking-widest">
                      {new Date(a.createdAt).toLocaleDateString()}
                    </span>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex items-center justify-end gap-3">
                      <button onClick={() => openEdit(a)} className="w-10 h-10 rounded-xl bg-[#F8F9FA] dark:bg-white/5 flex items-center justify-center text-noir/40 dark:text-white/40 hover:bg-[#4F46E5] hover:text-white transition-all shadow-sm">
                        <Pencil size={16} />
                      </button>
                      {a.id !== user?.id && (
                        <button onClick={() => setDeleteId(a.id)} className="w-10 h-10 rounded-xl bg-[#F8F9FA] dark:bg-white/5 flex items-center justify-center text-noir/40 dark:text-white/40 hover:bg-red-500 hover:text-white transition-all shadow-sm">
                          <Trash2 size={16} />
                        </button>
                      )}
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Delete Confirm */}
      <AnimatePresence>
        {deleteId && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} className="bg-background border border-border p-8 max-w-sm w-full">
              <h3 className="font-display text-2xl tracking-widest mb-3">REMOVE ADMIN</h3>
              <p className="text-muted-foreground text-sm mb-6">This will permanently remove this admin's access. Are you sure?</p>
              <div className="flex gap-3">
                <button onClick={() => handleDelete(deleteId)} className="flex-1 bg-brand-500 hover:bg-brand-600 text-white font-heading uppercase tracking-widest text-sm py-3 transition-colors">Remove</button>
                <button onClick={() => setDeleteId(null)} className="flex-1 border border-border font-heading uppercase tracking-widest text-sm py-3 hover:bg-accent transition-colors">Cancel</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Create/Edit Modal */}
      <AnimatePresence>
        {modalOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} className="bg-background border border-border w-full max-w-md">
              <div className="flex items-center justify-between p-6 border-b border-border">
                <h2 className="font-display text-2xl tracking-widest">{editAdmin ? 'EDIT' : 'ADD'} ADMIN</h2>
                <button onClick={() => setModalOpen(false)}><X size={20} className="text-muted-foreground" /></button>
              </div>
              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                {error && (
                  <div className="flex items-center gap-2 text-sm bg-brand-500/10 border border-brand-500/30 text-brand-600 dark:text-brand-400 px-4 py-3">
                    <AlertCircle size={16} />{error}
                  </div>
                )}
                {[
                  { name: 'name', label: 'Full Name', type: 'text', required: true },
                  { name: 'username', label: 'Username', type: 'text', required: true },
                  { name: 'email', label: 'Email', type: 'email', required: true },
                  { name: 'password', label: editAdmin ? 'New Password (leave blank to keep)' : 'Password *', type: 'password', required: !editAdmin },
                ].map((f) => (
                  <div key={f.name}>
                    <label className="block text-xs font-heading uppercase tracking-widest text-muted-foreground mb-2">{f.label}</label>
                    <input type={f.type} value={(form as any)[f.name]} onChange={(e) => setForm((pf) => ({ ...pf, [f.name]: e.target.value }))} required={f.required} className="w-full bg-background border border-border px-4 py-2.5 text-sm focus:outline-none focus:border-brand-500" />
                  </div>
                ))}
                <div>
                  <label className="block text-xs font-heading uppercase tracking-widest text-muted-foreground mb-2">Role</label>
                  <select value={form.role} onChange={(e) => setForm((f) => ({ ...f, role: e.target.value }))} className="w-full bg-background border border-border px-4 py-2.5 text-sm focus:outline-none focus:border-brand-500">
                    <option value="admin">Admin</option>
                    <option value="superadmin">Super Admin</option>
                  </select>
                </div>
                <div className="flex gap-3 pt-2">
                  <button type="submit" disabled={saving} className="flex-1 btn-primary disabled:opacity-60">{saving ? 'Saving...' : editAdmin ? 'Save Changes' : 'Create Admin'}</button>
                  <button type="button" onClick={() => setModalOpen(false)} className="px-6 py-3 border border-border font-heading uppercase tracking-widest text-sm hover:bg-accent">Cancel</button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminAdmins;
