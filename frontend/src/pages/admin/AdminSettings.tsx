import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Settings, User, Bell, Shield, CreditCard, 
  Search, HelpCircle, Upload, 
  CheckCircle, AlertCircle, Trash2, Power,
  Globe, Mail, DollarSign, Clock, MapPin,
  Database, Zap, Beaker, ChevronRight,
  Instagram, Twitter, Facebook, Youtube
} from 'lucide-react';
import api from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';

const TABS = [
  { id: 'general', label: 'General', icon: <Settings size={18} /> },
  { id: 'profile', label: 'Profile', icon: <User size={18} /> },
];

const AdminSettings: React.FC = () => {
  const { user, refreshUser } = useAuth();
  const [activeTab, setActiveTab] = useState('general');
  const [searchQuery, setSearchQuery] = useState('');

  // General Form State
  const [generalForm, setGeneralForm] = useState({
    storeName: 'Enterprise Suite Manager',
    storeEmail: 'admin@enterprise.com',
    currency: 'USD - United States Dollar',
    timezone: '(GMT-05:00) Eastern Time',
    address: {
      street: '',
      city: '',
      state: '',
      zip: ''
    }
  });

  // Toggles
  const [toggles, setToggles] = useState({
    backups: true,
    apiAccess: false,
    betaFeatures: false
  });

  // Profile Form State (Existing)
  const [profileForm, setProfileForm] = useState({
    name: user?.name || '',
    email: user?.email || '',
  });
  const [passForm, setPassForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  
  const [msg, setMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [saving, setSaving] = useState(false);

  // Social Media State
  const [socialForm, setSocialForm] = useState({
    instagram: 'https://instagram.com/enterprise',
    twitter: 'https://twitter.com/enterprise',
    facebook: 'https://facebook.com/enterprise',
    youtube: 'https://youtube.com/c/enterprise',
    website: 'https://enterprise.com'
  });

  const saveSocial = async () => {
    setSaving(true);
    try {
      // API call would go here
      setMsg({ type: 'success', text: 'Social media settings updated.' });
      setTimeout(() => setMsg(null), 3000);
    } catch (err: any) {
      setMsg({ type: 'error', text: 'Failed to update social media settings.' });
    }
    setSaving(false);
  };

  const saveGeneral = async () => {
    setSaving(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    setMsg({ type: 'success', text: 'General settings updated.' });
    setSaving(false);
  };

  const saveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMsg(null);
    try {
      await api.patch('/admin/profile', { name: profileForm.name });
      await refreshUser();
      setMsg({ type: 'success', text: 'Name updated successfully.' });
    } catch (err: any) {
      setMsg({ type: 'error', text: err.response?.data?.message || 'Failed to update name.' });
    }
    setSaving(false);
  };

  const savePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passForm.newPassword !== passForm.confirmPassword) {
      setMsg({ type: 'error', text: 'New passwords do not match.' });
      return;
    }
    setSaving(true);
    setMsg(null);
    try {
      await api.patch('/admin/change-password', { 
        currentPassword: passForm.currentPassword, 
        newPassword: passForm.newPassword 
      });
      setPassForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setMsg({ type: 'success', text: 'Password changed successfully.' });
    } catch (err: any) {
      setMsg({ type: 'error', text: err.response?.data?.message || 'Failed to change password.' });
    }
    setSaving(false);
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const fd = new FormData();
    fd.append('avatar', file);
    try {
      await api.post('/admin/avatar', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      await refreshUser();
      setMsg({ type: 'success', text: 'Avatar updated.' });
    } catch (err: any) {
      setMsg({ type: 'error', text: err.response?.data?.message || 'Upload failed.' });
    }
  };

  const Toggle = ({ enabled, onChange, label, description, icon, statusLabel }: any) => (
    <div className="bg-white dark:bg-white/5 border border-noir/5 dark:border-white/5 rounded-[32px] p-8 flex items-start justify-between shadow-sm">
      <div className="flex gap-6">
        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${enabled ? 'bg-indigo-50 text-indigo-600' : 'bg-gray-50 text-gray-400'}`}>
          {icon}
        </div>
        <div>
          <h4 className="text-base font-black text-noir dark:text-white uppercase tracking-tight">{label}</h4>
          <p className="text-sm text-noir/40 dark:text-white/40 mt-1 max-w-[240px] font-medium tracking-tight">{description}</p>
          <div className="mt-6 flex items-center gap-2">
            <span className={`text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-lg ${enabled ? 'bg-indigo-100 text-indigo-700' : 'bg-gray-100 text-gray-500'}`}>
              {statusLabel || (enabled ? 'ACTIVE' : 'DISABLED')}
            </span>
          </div>
        </div>
      </div>
      <button 
        onClick={() => onChange(!enabled)}
        className={`w-14 h-7 rounded-full transition-colors relative ${enabled ? 'bg-indigo-600' : 'bg-gray-200 dark:bg-white/10'}`}
      >
        <div className={`absolute top-1 left-1 w-5 h-5 bg-white rounded-full transition-transform ${enabled ? 'translate-x-7' : 'translate-x-0'} shadow-sm`} />
      </button>
    </div>
  );

  return (
    <div className="flex flex-col gap-6">
      {/* Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-white/5 border border-noir/5 dark:border-white/5 p-4 rounded-2xl shadow-sm">
        <div className="flex items-center gap-3 px-2">
          <h1 className="text-xl font-black text-noir dark:text-white uppercase tracking-tight">Settings</h1>
        </div>
        <div className="flex items-center gap-2">
          <button className="p-2 text-noir/40 dark:text-white/40 hover:text-noir dark:hover:text-white transition-colors">
            <Bell size={20} />
          </button>
          <button className="p-2 text-noir/40 dark:text-white/40 hover:text-noir dark:hover:text-white transition-colors">
            <HelpCircle size={20} />
          </button>
          <div className="w-8 h-8 rounded-full bg-noir/5 dark:bg-white/5 flex items-center justify-center overflow-hidden ml-2 border border-noir/5 dark:border-white/5">
            {user?.avatar?.url ? (
              <img src={user.avatar.url} className="w-full h-full object-cover" alt="" />
            ) : (
              <span className="text-xs font-bold text-noir/40 dark:text-white/40">{user?.name?.[0] || 'A'}</span>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-8 items-start">
        {/* Settings Sidebar */}
        <div className="bg-white dark:bg-white/5 border border-noir/5 dark:border-white/5 rounded-3xl p-4 shadow-sm">
          <nav className="space-y-1">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl transition-all ${
                  activeTab === tab.id
                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20'
                    : 'text-noir/40 dark:text-white/40 hover:bg-noir/5 dark:hover:bg-white/5'
                }`}
              >
                {tab.icon}
                <span className="font-bold text-sm">{tab.label}</span>
              </button>
            ))}
          </nav>
        </div>

        {/* Content Area */}
        <div className="space-y-8">
          <AnimatePresence mode="wait">
            {activeTab === 'general' && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-8"
              >
                {/* Social Media Form */}
                <section className="bg-white dark:bg-white/5 border border-noir/5 dark:border-white/5 rounded-[40px] p-10 shadow-sm">
                  <div className="flex flex-col gap-1 mb-10">
                    <h2 className="text-xl font-black text-noir dark:text-white uppercase tracking-tight">Social Media</h2>
                    <p className="text-sm text-noir/40 dark:text-white/40 font-medium tracking-tight">Manage your store's social media links and online presence.</p>
                  </div>

                  <div className="space-y-6">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-noir/40 dark:text-white/40 ml-1 flex items-center gap-2">
                        <Instagram size={14} /> Instagram
                      </label>
                      <input 
                        type="text" 
                        value={socialForm.instagram}
                        onChange={(e) => setSocialForm({...socialForm, instagram: e.target.value})}
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
                        value={socialForm.twitter}
                        onChange={(e) => setSocialForm({...socialForm, twitter: e.target.value})}
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
                        value={socialForm.facebook}
                        onChange={(e) => setSocialForm({...socialForm, facebook: e.target.value})}
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
                        value={socialForm.youtube}
                        onChange={(e) => setSocialForm({...socialForm, youtube: e.target.value})}
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
                        value={socialForm.website}
                        onChange={(e) => setSocialForm({...socialForm, website: e.target.value})}
                        className="w-full bg-[#F8F9FA] dark:bg-white/5 border border-noir/5 dark:border-white/5 rounded-2xl px-6 py-4 text-sm font-bold focus:outline-none focus:border-indigo-500 transition-colors"
                        placeholder="https://yourstore.com"
                      />
                    </div>
                  </div>
                </section>
              </motion.div>
            )}

            {activeTab === 'profile' && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-8"
              >
                {/* Profile Information */}
                <section className="bg-white dark:bg-white/5 border border-noir/5 dark:border-white/5 rounded-3xl p-8 shadow-sm">
                  <div className="flex flex-col gap-1 mb-8">
                    <h2 className="text-lg font-black text-noir dark:text-white uppercase tracking-tight">Profile Information</h2>
                    <p className="text-sm text-noir/40 dark:text-white/40">Update your personal details and avatar.</p>
                  </div>

                  <div className="flex items-center gap-6 mb-8 p-6 bg-noir/5 dark:bg-white/5 rounded-2xl border border-noir/5 dark:border-white/5">
                    <div className="w-20 h-20 rounded-full bg-indigo-600 overflow-hidden flex items-center justify-center text-white text-2xl font-black shadow-lg shadow-indigo-500/20">
                      {user?.avatar?.url ? (
                        <img src={user.avatar.url} alt={user.name} className="w-full h-full object-cover" />
                      ) : (
                        user?.name?.[0]?.toUpperCase()
                      )}
                    </div>
                    <div>
                      <label className="cursor-pointer flex items-center gap-2 bg-white dark:bg-white/10 border border-noir/5 dark:border-white/5 text-noir dark:text-white font-bold text-xs px-4 py-2 rounded-xl hover:bg-noir/5 dark:hover:bg-white/20 transition-all">
                        <Upload size={14} /> Upload New Photo
                        <input type="file" accept="image/jpeg,image/png,image/webp" onChange={handleAvatarUpload} className="hidden" />
                      </label>
                      <p className="text-[10px] text-noir/40 dark:text-white/40 mt-2 font-bold uppercase tracking-widest">JPG, PNG, WEBP. Max 2MB.</p>
                    </div>
                  </div>

                  <form onSubmit={saveProfile} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-noir/40 dark:text-white/40 ml-1">Full Name</label>
                        <input
                          type="text"
                          value={profileForm.name}
                          onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                          className="w-full bg-noir/5 dark:bg-white/5 border border-noir/5 dark:border-white/5 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-indigo-500 transition-colors"
                          placeholder="Enter your full name"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-noir/40 dark:text-white/40 ml-1">Email Address</label>
                        <input
                          type="email"
                          value={profileForm.email}
                          onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
                          className="w-full bg-noir/5 dark:bg-white/5 border border-noir/5 dark:border-white/5 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-indigo-500 transition-colors"
                          placeholder="Enter your email address"
                        />
                      </div>
                    </div>
                    <div className="flex items-center justify-between mt-4">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-black uppercase tracking-widest text-noir/40 dark:text-white/40">Current Role:</span>
                        <span className="text-[10px] font-black uppercase tracking-widest bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-md">{user?.role}</span>
                      </div>
                    </div>
                  </form>
                </section>

                {/* Password Security */}
                <section className="bg-white dark:bg-white/5 border border-noir/5 dark:border-white/5 rounded-3xl p-8 shadow-sm">
                  <div className="flex flex-col gap-1 mb-8">
                    <h2 className="text-lg font-black text-noir dark:text-white uppercase tracking-tight">Password Security</h2>
                    <p className="text-sm text-noir/40 dark:text-white/40">Update your account password to stay secure.</p>
                  </div>

                  <form onSubmit={savePassword} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-noir/40 dark:text-white/40 ml-1">Current Password</label>
                        <input
                          type="password"
                          value={passForm.currentPassword}
                          onChange={(e) => setPassForm({ ...passForm, currentPassword: e.target.value })}
                          className="w-full bg-noir/5 dark:bg-white/5 border border-noir/5 dark:border-white/5 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-indigo-500 transition-colors"
                          placeholder="••••••••"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-noir/40 dark:text-white/40 ml-1">New Password</label>
                        <input
                          type="password"
                          value={passForm.newPassword}
                          onChange={(e) => setPassForm({ ...passForm, newPassword: e.target.value })}
                          className="w-full bg-noir/5 dark:bg-white/5 border border-noir/5 dark:border-white/5 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-indigo-500 transition-colors"
                          placeholder="••••••••"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-noir/40 dark:text-white/40 ml-1">Confirm New Password</label>
                        <input
                          type="password"
                          value={passForm.confirmPassword}
                          onChange={(e) => setPassForm({ ...passForm, confirmPassword: e.target.value })}
                          className="w-full bg-noir/5 dark:bg-white/5 border border-noir/5 dark:border-white/5 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-indigo-500 transition-colors"
                          placeholder="••••••••"
                        />
                      </div>
                    </div>
                  </form>
                </section>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Messages */}
          <AnimatePresence>
            {msg && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                className={`fixed bottom-10 right-10 flex items-center gap-3 px-6 py-4 rounded-2xl shadow-2xl z-50 border ${
                  msg.type === 'success' 
                    ? 'bg-green-600 text-white border-green-500' 
                    : 'bg-red-600 text-white border-red-500'
                }`}
              >
                {msg.type === 'success' ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
                <span className="font-bold text-sm">{msg.text}</span>
                <button onClick={() => setMsg(null)} className="ml-4 opacity-50 hover:opacity-100">
                  <Power size={16} className="rotate-45" />
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-6 bg-white dark:bg-white/5 border border-noir/5 dark:border-white/5 p-6 rounded-[32px] shadow-sm">
            <button 
              onClick={() => window.location.reload()}
              className="px-6 py-3 text-noir/40 dark:text-white/40 font-black uppercase text-[10px] tracking-widest hover:text-noir dark:hover:text-white transition-colors"
            >
              Discard Changes
            </button>
            <button 
              onClick={async () => {
                if (activeTab === 'general') await saveSocial();
                if (activeTab === 'profile') {
                  await saveProfile({ preventDefault: () => {} } as any);
                }
              }}
              disabled={saving}
              className="px-10 py-4 bg-indigo-600 text-white rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-500/20 disabled:opacity-50"
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminSettings;

