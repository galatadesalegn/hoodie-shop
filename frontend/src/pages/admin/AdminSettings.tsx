import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Settings, User, Bell, Shield, CreditCard, 
  Search, HelpCircle, Upload, 
  CheckCircle, AlertCircle, Trash2, Power,
  Globe, Mail, DollarSign, Clock, MapPin,
  Database, Zap, Beaker, ChevronRight
} from 'lucide-react';
import api from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';

const TABS = [
  { id: 'general', label: 'General', icon: <Settings size={18} /> },
  { id: 'profile', label: 'Profile', icon: <User size={18} /> },
  { id: 'notifications', label: 'Notifications', icon: <Bell size={18} /> },
  { id: 'security', label: 'Security', icon: <Shield size={18} /> },
  { id: 'billing', label: 'Billing', icon: <CreditCard size={18} /> },
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
    name: user?.name || ''
  });
  const [passForm, setPassForm] = useState({ 
    currentPassword: '', 
    newPassword: '', 
    confirmPassword: '' 
  });
  
  const [msg, setMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [saving, setSaving] = useState(false);

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
    <div className="bg-white dark:bg-white/5 border border-noir/5 dark:border-white/5 rounded-2xl p-6 flex items-start justify-between">
      <div className="flex gap-4">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${enabled ? 'bg-indigo-50 text-indigo-600' : 'bg-gray-50 text-gray-400'}`}>
          {icon}
        </div>
        <div>
          <h4 className="text-sm font-bold text-noir dark:text-white">{label}</h4>
          <p className="text-xs text-noir/40 dark:text-white/40 mt-1 max-w-[200px]">{description}</p>
          <div className="mt-4 flex items-center gap-2">
            <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md ${enabled ? 'bg-indigo-100 text-indigo-700' : 'bg-gray-100 text-gray-500'}`}>
              {statusLabel || (enabled ? 'ACTIVE' : 'DISABLED')}
            </span>
          </div>
        </div>
      </div>
      <button 
        onClick={() => onChange(!enabled)}
        className={`w-12 h-6 rounded-full transition-colors relative ${enabled ? 'bg-indigo-600' : 'bg-gray-200 dark:bg-white/10'}`}
      >
        <div className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${enabled ? 'translate-x-6' : 'translate-x-0'}`} />
      </button>
    </div>
  );

  return (
    <div className="flex flex-col gap-6">
      {/* Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-white/5 border border-noir/5 dark:border-white/5 p-4 rounded-2xl shadow-sm">
        <div className="flex items-center gap-3 px-2">
          <h1 className="text-xl font-black text-noir dark:text-white uppercase tracking-tight">Settings</h1>
          <div className="h-6 w-px bg-noir/10 dark:bg-white/10 hidden md:block" />
          <div className="relative hidden md:block">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-noir/20 dark:text-white/20" size={16} />
            <input 
              type="text" 
              placeholder="Search settings..." 
              className="pl-10 pr-4 py-2 bg-transparent text-sm focus:outline-none w-64"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
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
                {/* General Configuration */}
                <section className="bg-white dark:bg-white/5 border border-noir/5 dark:border-white/5 rounded-3xl p-8 shadow-sm">
                  <div className="flex flex-col gap-1 mb-8">
                    <h2 className="text-lg font-black text-noir dark:text-white uppercase tracking-tight">General Configuration</h2>
                    <p className="text-sm text-noir/40 dark:text-white/40">Update your store's basic information and localization preferences.</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-noir/40 dark:text-white/40 ml-1">Store Name</label>
                      <input 
                        type="text" 
                        value={generalForm.storeName}
                        onChange={(e) => setGeneralForm({...generalForm, storeName: e.target.value})}
                        className="w-full bg-noir/5 dark:bg-white/5 border border-noir/5 dark:border-white/5 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-indigo-500 transition-colors"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-noir/40 dark:text-white/40 ml-1">Store Email</label>
                      <input 
                        type="email" 
                        value={generalForm.storeEmail}
                        onChange={(e) => setGeneralForm({...generalForm, storeEmail: e.target.value})}
                        className="w-full bg-noir/5 dark:bg-white/5 border border-noir/5 dark:border-white/5 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-indigo-500 transition-colors"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-noir/40 dark:text-white/40 ml-1">Currency</label>
                      <select 
                        value={generalForm.currency}
                        onChange={(e) => setGeneralForm({...generalForm, currency: e.target.value})}
                        className="w-full bg-noir/5 dark:bg-white/5 border border-noir/5 dark:border-white/5 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-indigo-500 transition-colors appearance-none"
                      >
                        <option>USD - United States Dollar</option>
                        <option>EUR - Euro</option>
                        <option>GBP - British Pound</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-noir/40 dark:text-white/40 ml-1">Timezone</label>
                      <select 
                        value={generalForm.timezone}
                        onChange={(e) => setGeneralForm({...generalForm, timezone: e.target.value})}
                        className="w-full bg-noir/5 dark:bg-white/5 border border-noir/5 dark:border-white/5 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-indigo-500 transition-colors appearance-none"
                      >
                        <option>(GMT-05:00) Eastern Time</option>
                        <option>(GMT+00:00) London</option>
                        <option>(GMT+01:00) Paris</option>
                      </select>
                    </div>
                  </div>
                </section>

                {/* Store Profile */}
                <section className="bg-white dark:bg-white/5 border border-noir/5 dark:border-white/5 rounded-3xl p-8 shadow-sm">
                  <div className="flex flex-col gap-1 mb-8">
                    <h2 className="text-lg font-black text-noir dark:text-white uppercase tracking-tight">Store Profile</h2>
                    <p className="text-sm text-noir/40 dark:text-white/40">Manage your public brand identity and physical location.</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-[160px_1fr] gap-10">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-noir/40 dark:text-white/40 ml-1">Store Logo</label>
                      <div className="aspect-square bg-noir/5 dark:bg-white/5 border-2 border-dashed border-noir/10 dark:border-white/10 rounded-2xl flex flex-col items-center justify-center gap-2 cursor-pointer hover:bg-noir/10 dark:hover:bg-white/10 transition-colors group">
                        <Upload size={24} className="text-noir/20 dark:text-white/20 group-hover:text-indigo-600 transition-colors" />
                        <span className="text-[10px] font-bold text-noir/40 dark:text-white/40 text-center px-4">Click to upload (PNG, JPG)</span>
                      </div>
                    </div>

                    <div className="space-y-6">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-noir/40 dark:text-white/40 ml-1">Business Address</label>
                        <input 
                          type="text" 
                          placeholder="Street Address"
                          className="w-full bg-noir/5 dark:bg-white/5 border border-noir/5 dark:border-white/5 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-indigo-500 transition-colors"
                        />
                      </div>
                      <div className="grid grid-cols-3 gap-4">
                        <input 
                          type="text" 
                          placeholder="City"
                          className="w-full bg-noir/5 dark:bg-white/5 border border-noir/5 dark:border-white/5 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-indigo-500 transition-colors"
                        />
                        <input 
                          type="text" 
                          placeholder="State/Province"
                          className="w-full bg-noir/5 dark:bg-white/5 border border-noir/5 dark:border-white/5 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-indigo-500 transition-colors"
                        />
                        <input 
                          type="text" 
                          placeholder="Postal Code"
                          className="w-full bg-noir/5 dark:bg-white/5 border border-noir/5 dark:border-white/5 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-indigo-500 transition-colors"
                        />
                      </div>
                    </div>
                  </div>
                </section>

                {/* Features Toggles */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <Toggle 
                    enabled={toggles.backups}
                    onChange={(v: boolean) => setToggles({...toggles, backups: v})}
                    label="Automated Backups"
                    description="Daily system snapshots of your inventory and logs."
                    icon={<Database size={20} />}
                  />
                  <Toggle 
                    enabled={toggles.apiAccess}
                    onChange={(v: boolean) => setToggles({...toggles, apiAccess: v})}
                    label="API Access"
                    description="Allow third-party integrations to access your data."
                    icon={<Zap size={20} />}
                  />
                  <Toggle 
                    enabled={toggles.betaFeatures}
                    onChange={(v: boolean) => setToggles({...toggles, betaFeatures: v})}
                    label="Beta Features"
                    description="Opt-in to test new dashboard widgets before release."
                    icon={<Beaker size={20} />}
                    statusLabel={toggles.betaFeatures ? 'ON' : 'OFF'}
                  />
                </div>

                {/* Danger Zone */}
                <section className="bg-red-50/50 dark:bg-red-500/5 border border-red-100 dark:border-red-500/20 rounded-3xl p-8 shadow-sm">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-xl bg-red-100 dark:bg-red-500/20 flex items-center justify-center text-red-600">
                      <AlertCircle size={20} />
                    </div>
                    <div>
                      <h2 className="text-lg font-black text-red-600 uppercase tracking-tight leading-none">Danger Zone</h2>
                      <p className="text-xs text-red-600/60 mt-1">These actions are permanent and cannot be undone.</p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-white dark:bg-white/5 border border-red-100 dark:border-red-500/20 rounded-2xl">
                      <div>
                        <h4 className="text-sm font-bold text-noir dark:text-white">Deactivate Store</h4>
                        <p className="text-xs text-noir/40 dark:text-white/40">Temporarily disable your storefront and admin access.</p>
                      </div>
                      <button className="px-4 py-2 border border-red-200 text-red-600 rounded-xl text-xs font-bold hover:bg-red-50 transition-colors">
                        Deactivate
                      </button>
                    </div>
                    <div className="flex items-center justify-between p-4 bg-white dark:bg-white/5 border border-red-100 dark:border-red-500/20 rounded-2xl">
                      <div>
                        <h4 className="text-sm font-bold text-noir dark:text-white">Delete Account</h4>
                        <p className="text-xs text-noir/40 dark:text-white/40">Permanently remove all data, products, and customer history.</p>
                      </div>
                      <button className="px-4 py-2 bg-red-600 text-white rounded-xl text-xs font-bold hover:bg-red-700 transition-colors shadow-lg shadow-red-600/20">
                        Delete Permanently
                      </button>
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
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-noir/40 dark:text-white/40 ml-1">Full Name</label>
                      <input
                        type="text"
                        value={profileForm.name}
                        onChange={(e) => setProfileForm({ name: e.target.value })}
                        className="w-full bg-noir/5 dark:bg-white/5 border border-noir/5 dark:border-white/5 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-indigo-500 transition-colors"
                        placeholder="Enter your full name"
                      />
                    </div>
                    <div className="flex items-center justify-between mt-4">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-black uppercase tracking-widest text-noir/40 dark:text-white/40">Current Role:</span>
                        <span className="text-[10px] font-black uppercase tracking-widest bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-md">{user?.role}</span>
                      </div>
                    </div>
                  </form>
                </section>
              </motion.div>
            )}

            {['notifications', 'security', 'billing'].includes(activeTab) && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-white dark:bg-white/5 border border-noir/5 dark:border-white/5 rounded-3xl p-20 flex flex-col items-center justify-center text-center shadow-sm"
              >
                <div className="w-20 h-20 rounded-3xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-6">
                  {TABS.find(t => t.id === activeTab)?.icon}
                </div>
                <h2 className="text-2xl font-black text-noir dark:text-white uppercase tracking-tight">{activeTab} Settings</h2>
                <p className="text-noir/40 dark:text-white/40 mt-2 max-w-sm">
                  This section is currently under development. Check back soon for more enterprise management features.
                </p>
                <button 
                  onClick={() => setActiveTab('general')}
                  className="mt-8 flex items-center gap-2 text-indigo-600 font-bold text-sm hover:gap-3 transition-all"
                >
                  Back to General <ChevronRight size={16} />
                </button>
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
          <div className="flex items-center justify-end gap-4 bg-white dark:bg-white/5 border border-noir/5 dark:border-white/5 p-6 rounded-3xl shadow-sm">
            <button 
              onClick={() => window.location.reload()}
              className="px-6 py-3 text-noir/40 dark:text-white/40 font-bold text-sm hover:text-noir dark:hover:text-white transition-colors"
            >
              Discard Changes
            </button>
            <button 
              onClick={async (e) => {
                if (activeTab === 'general') await saveGeneral();
                if (activeTab === 'profile') {
                  await saveProfile(e as any);
                  if (passForm.newPassword) await savePassword(e as any);
                }
              }}
              disabled={saving || !['general', 'profile'].includes(activeTab)}
              className="px-8 py-3 bg-indigo-600 text-white rounded-2xl font-bold text-sm hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-500/20 disabled:opacity-50"
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

