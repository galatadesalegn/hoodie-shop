import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  User, 
  Package, 
  Settings, 
  LogOut, 
  ChevronRight, 
  ShieldCheck, 
  MapPin, 
  CreditCard, 
  Bell,
  ExternalLink,
  Clock,
  CheckCircle2,
  AlertCircle,
  Eye,
  X,
  RefreshCcw
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';
import Navbar from '../../components/customer/Navbar';
import Footer from '../../components/customer/Footer';
import type { Order } from '../../types';

const AccountPage: React.FC = () => {
  const { user, logout, refreshUser } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'profile' | 'orders' | 'settings'>('profile');
  const [isEditing, setIsEditing] = useState(false);
  const [newName, setNewName] = useState(user?.name || '');
  const [isSaving, setIsSaving] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  
  // Orders State
  const [orders, setOrders] = useState<Order[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const fetchOrders = useCallback(async () => {
    if (activeTab !== 'orders') return;
    setLoadingOrders(true);
    try {
      const api = (await import('../../services/api')).default;
      const { data } = await api.get('/orders/my-orders');
      setOrders(data.data.orders);
    } catch (err) {
      console.error('Failed to fetch orders:', err);
    }
    setLoadingOrders(false);
  }, [activeTab]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const handleSaveName = async () => {
    if (!newName.trim() || newName === user?.name) {
      setIsEditing(false);
      return;
    }
    
    setIsSaving(true);
    try {
      const api = (await import('../../services/api')).default;
      await api.patch('/auth/profile', { name: newName });
      await refreshUser();
      setIsSaved(true);
      setTimeout(() => {
        setIsSaved(false);
        setIsEditing(false);
      }, 1500);
    } catch (err) {
      console.error('Failed to update name:', err);
    }
    setIsSaving(false);
  };

  const menuItems = [
    { id: 'profile', label: 'Member Profile', icon: <User size={18} /> },
    { id: 'orders', label: 'Order History', icon: <Package size={18} /> },
    { id: 'settings', label: 'Account Settings', icon: <Settings size={18} /> },
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'confirmed': return <CheckCircle2 size={14} className="text-blue-500" />;
      case 'delivered': return <CheckCircle2 size={14} className="text-emerald-500" />;
      case 'cancelled': return <AlertCircle size={14} className="text-red-500" />;
      case 'pending': return <Clock size={14} className="text-amber-500" />;
      case 'processing': return <RefreshCcw size={14} className="text-indigo-500 animate-spin-slow" />;
      default: return <Package size={14} className="text-indigo-500" />;
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA] dark:bg-noir transition-colors duration-500">
      <Navbar />
      
      <main className="container-custom pt-32 pb-24">
        <div className="grid lg:grid-cols-12 gap-12">
          
          {/* Left Sidebar */}
          <div className="lg:col-span-4 space-y-6">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white dark:bg-white/[0.03] rounded-3xl p-8 shadow-sm border border-noir/5 dark:border-white/5"
            >
              <div className="flex items-center gap-5 mb-8">
                <div className="w-16 h-16 rounded-full bg-noir dark:bg-white flex items-center justify-center text-white dark:text-noir text-xl font-black shadow-lg shadow-noir/10 dark:shadow-white/10">
                  {user?.name?.[0]}
                </div>
                <div>
                  <h1 className="text-xl font-black text-noir dark:text-white tracking-tight uppercase leading-none mb-1.5">
                    {user?.name}
                  </h1>
                  <p className="text-[9px] font-bold text-noir/30 dark:text-white/30 uppercase tracking-[0.2em]">
                    Premium Member
                  </p>
                </div>
              </div>

              <nav className="space-y-1">
                {menuItems.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id as any)}
                    className={`w-full flex items-center justify-between px-4 py-4 rounded-xl transition-all group relative ${
                      activeTab === item.id 
                        ? 'bg-noir/5 dark:bg-white/5 text-noir dark:text-white' 
                        : 'text-noir/40 dark:text-white/40 hover:bg-noir/[0.02] dark:hover:bg-white/[0.02]'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className={`${activeTab === item.id ? 'text-noir dark:text-white' : 'text-noir/30 dark:text-white/30 group-hover:text-noir/60 dark:group-hover:text-white/60'} transition-colors`}>
                        {item.icon}
                      </span>
                      <span className="text-[10px] font-black uppercase tracking-widest">{item.label}</span>
                    </div>
                    {activeTab === item.id && (
                      <motion.div 
                        layoutId="activeTab"
                        className="absolute left-0 w-1 h-4 bg-noir dark:bg-white rounded-full"
                      />
                    )}
                    <ChevronRight size={12} className={`${activeTab === item.id ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0'} transition-all duration-300`} />
                  </button>
                ))}
                
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-4 py-4 rounded-xl text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-all mt-6"
                >
                  <LogOut size={18} />
                  <span className="text-[10px] font-black uppercase tracking-widest">Sign Out</span>
                </button>
              </nav>
            </motion.div>

            {/* Quick Stats */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white dark:bg-white/[0.03] rounded-3xl p-8 shadow-sm border border-noir/5 dark:border-white/5 overflow-hidden relative group"
            >
              <div className="absolute top-0 right-0 p-8 opacity-[0.03] dark:opacity-[0.05] group-hover:scale-110 transition-transform duration-700">
                <ShieldCheck size={120} />
              </div>
              
              <div className="relative">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-8 h-8 rounded-lg bg-orange-500/10 flex items-center justify-center text-orange-500">
                    <ShieldCheck size={18} />
                  </div>
                  <h3 className="text-[9px] font-black uppercase tracking-widest text-noir/40 dark:text-white/40">Archive Status</h3>
                </div>
                <p className="text-2xl font-black tracking-tighter uppercase text-noir dark:text-white mb-1">Verified</p>
                <p className="text-[9px] font-bold text-noir/30 dark:text-white/30 uppercase tracking-widest">Member since {new Date(user?.createdAt || '').toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</p>
              </div>
            </motion.div>
          </div>

          {/* Right Content Area */}
          <div className="lg:col-span-8">
            <AnimatePresence mode="wait">
              {activeTab === 'profile' && (
                <motion.div
                  key="profile"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="bg-white dark:bg-white/[0.03] rounded-3xl p-10 shadow-sm border border-noir/5 dark:border-white/5 min-h-[600px]"
                >
                  <div className="flex items-center justify-between mb-12">
                    <div>
                      <h2 className="text-2xl font-black text-noir dark:text-white tracking-tight uppercase">Personal Information</h2>
                      <p className="text-[10px] font-bold text-noir/30 dark:text-white/30 uppercase tracking-widest mt-1">Manage your archive identity</p>
                    </div>
                    {!isEditing ? (
                      <button 
                        onClick={() => setIsEditing(true)}
                        className="px-5 py-2.5 rounded-xl border border-noir/10 dark:border-white/10 text-[10px] font-black uppercase tracking-widest hover:bg-noir hover:text-white dark:hover:bg-white dark:hover:text-noir transition-all"
                      >
                        Edit Name
                      </button>
                    ) : (
                      <div className="flex gap-2">
                        <button 
                          onClick={() => setIsEditing(false)}
                          className="px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest text-noir/40 dark:text-white/40 hover:text-noir dark:hover:text-white transition-all"
                        >
                          Cancel
                        </button>
                        <button 
                          onClick={handleSaveName}
                          disabled={isSaving || isSaved}
                          className={`px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all disabled:opacity-50 ${
                            isSaved ? 'bg-green-500 text-white' : 'bg-noir dark:bg-white text-white dark:text-noir hover:opacity-90'
                          }`}
                        >
                          {isSaving ? 'Saving...' : isSaved ? 'Saved' : 'Save Changes'}
                        </button>
                      </div>
                    )}
                  </div>
                  
                  <div className="grid md:grid-cols-2 gap-10">
                    <div className="space-y-1.5 p-5 rounded-2xl bg-noir/[0.02] dark:bg-white/[0.02] border border-noir/5 dark:border-white/5">
                      <p className="text-[9px] font-bold text-noir/30 dark:text-white/30 uppercase tracking-widest">Full Name</p>
                      {isEditing ? (
                        <input
                          type="text"
                          value={newName}
                          onChange={(e) => setNewName(e.target.value)}
                          autoFocus
                          className="w-full bg-transparent border-b border-noir/10 dark:border-white/10 py-1 text-base font-bold text-noir dark:text-white focus:outline-none focus:border-noir dark:focus:border-white transition-colors"
                        />
                      ) : (
                        <p className="text-base font-bold text-noir dark:text-white">{user?.name}</p>
                      )}
                    </div>
                    <div className="space-y-1.5 p-5 rounded-2xl bg-noir/[0.02] dark:bg-white/[0.02] border border-noir/5 dark:border-white/5 opacity-60">
                      <p className="text-[9px] font-bold text-noir/30 dark:text-white/30 uppercase tracking-widest">Email Address</p>
                      <p className="text-base font-bold text-noir dark:text-white">{user?.email}</p>
                    </div>
                  </div>

                  <div className="mt-16 pt-10 border-t border-noir/5 dark:border-white/5 grid md:grid-cols-3 gap-6">
                    {[
                      { icon: <MapPin size={18} />, label: 'Shipping', value: 'Default Address' },
                      { icon: <CreditCard size={18} />, label: 'Payment', value: 'Saved Methods' },
                      { icon: <Bell size={18} />, label: 'Alerts', value: 'Notifications' }
                    ].map((card, i) => (
                      <div key={i} className="p-6 rounded-2xl bg-white dark:bg-white/[0.02] border border-noir/5 dark:border-white/5 hover:border-noir/20 dark:hover:border-white/20 transition-all cursor-pointer group">
                        <div className="w-10 h-10 rounded-xl bg-noir/[0.03] dark:bg-white/[0.03] flex items-center justify-center text-noir/40 dark:text-white/40 mb-4 group-hover:bg-noir group-hover:text-white dark:group-hover:bg-white dark:group-hover:text-noir transition-all duration-500">
                          {card.icon}
                        </div>
                        <p className="text-[9px] font-bold text-noir/30 dark:text-white/30 uppercase tracking-widest mb-1">{card.label}</p>
                        <p className="text-[11px] font-black text-noir dark:text-white uppercase">{card.value}</p>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}

              {activeTab === 'orders' && (
                <motion.div
                  key="orders"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="bg-white dark:bg-white/[0.03] rounded-3xl p-10 shadow-sm border border-noir/5 dark:border-white/5 min-h-[600px]"
                >
                  <div className="flex items-center justify-between mb-10">
                    <div>
                      <h2 className="text-2xl font-black text-noir dark:text-white tracking-tight uppercase">Order History</h2>
                      <p className="text-[10px] font-bold text-noir/30 dark:text-white/30 uppercase tracking-widest mt-1">Track your archive collection</p>
                    </div>
                  </div>

                  {loadingOrders ? (
                    <div className="flex flex-col items-center justify-center py-20">
                      <div className="w-10 h-10 border-2 border-noir/10 dark:border-white/10 border-t-noir dark:border-t-white rounded-full animate-spin" />
                    </div>
                  ) : orders.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 text-center">
                      <div className="w-20 h-20 rounded-full bg-noir/[0.03] dark:bg-white/[0.03] flex items-center justify-center text-noir/10 dark:text-white/10 mb-8">
                        <Package size={40} />
                      </div>
                      <h3 className="text-xl font-black text-noir dark:text-white tracking-tight uppercase mb-3">No orders yet</h3>
                      <p className="text-noir/40 dark:text-white/40 text-[13px] max-w-xs mb-10 leading-relaxed">
                        Your archive is currently empty. Start your collection by browsing our latest drops.
                      </p>
                      <button 
                        onClick={() => navigate('/shop')}
                        className="bg-noir dark:bg-white text-white dark:text-noir px-10 py-4 rounded-xl text-[10px] font-black uppercase tracking-[0.3em] hover:opacity-90 transition-all flex items-center gap-3"
                      >
                        Explore Archive
                        <ExternalLink size={14} />
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {orders.map((order) => (
                        <div 
                          key={order._id}
                          className="group bg-noir/[0.02] dark:bg-white/[0.02] border border-noir/5 dark:border-white/5 rounded-2xl p-6 hover:border-noir/20 dark:hover:border-white/20 transition-all"
                        >
                          <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
                            <div className="flex items-center gap-4">
                              <div className="w-12 h-12 rounded-xl bg-white dark:bg-white/5 flex items-center justify-center shadow-sm">
                                <Package size={20} className="text-noir/40 dark:text-white/40" />
                              </div>
                              <div>
                                <p className="text-[10px] font-black text-noir/30 dark:text-white/30 uppercase tracking-widest mb-1">Order ID</p>
                                <p className="text-sm font-black text-noir dark:text-white uppercase tracking-tighter">#{order.orderNumber}</p>
                              </div>
                            </div>
                            
                            <div className="flex items-center gap-8">
                              <div className="text-right hidden sm:block">
                                <p className="text-[10px] font-black text-noir/30 dark:text-white/30 uppercase tracking-widest mb-1">Placed On</p>
                                <p className="text-sm font-bold text-noir dark:text-white">{new Date(order.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</p>
                              </div>
                              <div className="text-right">
                                <p className="text-[10px] font-black text-noir/30 dark:text-white/30 uppercase tracking-widest mb-1">Total</p>
                                <p className="text-sm font-black text-noir dark:text-white tracking-tighter">ETB {order.totalAmount?.toLocaleString()}</p>
                              </div>
                              <div className={`flex items-center gap-2 px-4 py-2 rounded-full border ${
                                order.status === 'delivered' ? 'bg-emerald-500/5 border-emerald-500/10 text-emerald-500' :
                                order.status === 'confirmed' ? 'bg-blue-500/5 border-blue-500/10 text-blue-500' :
                                order.status === 'pending' ? 'bg-amber-500/5 border-amber-500/10 text-amber-500' :
                                order.status === 'processing' ? 'bg-indigo-500/5 border-indigo-500/10 text-indigo-500' :
                                'bg-red-500/5 border-red-500/10 text-red-500'
                              }`}>
                                {getStatusIcon(order.status)}
                                <span className="text-[9px] font-black uppercase tracking-[0.2em]">{order.status}</span>
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center justify-between pt-6 border-t border-noir/5 dark:border-white/5">
                            <div className="flex -space-x-3 overflow-hidden">
                              {order.items.slice(0, 4).map((item, i) => (
                                <div key={i} className="w-10 h-10 rounded-lg border-2 border-white dark:border-[#0A0A0A] bg-studio overflow-hidden shadow-sm">
                                  <img src={item.hoodieImage} alt="" className="w-full h-full object-cover" />
                                </div>
                              ))}
                              {order.items.length > 4 && (
                                <div className="w-10 h-10 rounded-lg border-2 border-white dark:border-[#0A0A0A] bg-noir dark:bg-white flex items-center justify-center text-[10px] font-black text-white dark:text-noir shadow-sm">
                                  +{order.items.length - 4}
                                </div>
                              )}
                            </div>
                            <button 
                              onClick={() => setSelectedOrder(order)}
                              className="flex items-center gap-2 text-[9px] font-black text-noir/40 dark:text-white/40 hover:text-noir dark:hover:text-white uppercase tracking-widest transition-colors group/btn"
                            >
                              Details
                              <ChevronRight size={14} className="group-hover/btn:translate-x-1 transition-transform" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </motion.div>
              )}

              {activeTab === 'settings' && (
                <motion.div
                  key="settings"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="bg-white dark:bg-white/[0.03] rounded-3xl p-10 shadow-sm border border-noir/5 dark:border-white/5 min-h-[600px]"
                >
                  <h2 className="text-2xl font-black text-noir dark:text-white tracking-tight uppercase mb-10">Account Settings</h2>
                  
                  <div className="space-y-4">
                    {[
                      { label: 'Two-Factor Authentication', desc: 'Add an extra layer of security to your account.', status: 'Disabled' },
                      { label: 'Connected Devices', desc: 'Manage your active sessions and devices.', status: '1 Active' }
                    ].map((setting, i) => (
                      <div key={i} className="p-6 rounded-2xl bg-noir/[0.02] dark:bg-white/[0.02] border border-noir/5 dark:border-white/5 flex items-center justify-between group hover:bg-white dark:hover:bg-white/5 transition-all">
                        <div className="max-w-md">
                          <h4 className="text-xs font-black text-noir dark:text-white uppercase tracking-tight mb-1">{setting.label}</h4>
                          <p className="text-[11px] text-noir/40 dark:text-white/40 leading-relaxed">{setting.desc}</p>
                        </div>
                        <button className="text-[9px] font-bold text-noir dark:text-white border border-noir/10 dark:border-white/10 px-5 py-2.5 rounded-full hover:bg-noir hover:text-white dark:hover:bg-white dark:hover:text-noir transition-all uppercase tracking-widest">
                          {setting.status}
                        </button>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </main>
      
      <Footer />

      {/* Order Detail Modal */}
      <AnimatePresence>
        {selectedOrder && (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }} 
            className="fixed inset-0 bg-noir/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 sm:p-6"
          >
            <motion.div 
              initial={{ scale: 0.95, opacity: 0, y: 20 }} 
              animate={{ scale: 1, opacity: 1, y: 0 }} 
              exit={{ scale: 0.95, opacity: 0, y: 20 }} 
              className="bg-white dark:bg-[#0A0A0A] border border-noir/10 dark:border-white/10 w-full max-w-2xl max-h-[90vh] overflow-hidden rounded-[40px] shadow-2xl flex flex-col"
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between p-8 sm:p-10 border-b border-noir/5 dark:border-white/5 bg-noir/[0.01] dark:bg-white/[0.01]">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-indigo-600 flex items-center justify-center text-white shadow-lg shadow-indigo-500/20">
                    <Package size={24} />
                  </div>
                  <div>
                    <h2 className="text-2xl font-black text-noir dark:text-white tracking-tighter uppercase leading-none mb-1.5">
                      Order #{selectedOrder.orderNumber}
                    </h2>
                    <p className="text-[9px] font-bold text-noir/30 dark:text-white/30 uppercase tracking-[0.3em]">
                      {new Date(selectedOrder.createdAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                    </p>
                  </div>
                </div>
                <button 
                  onClick={() => setSelectedOrder(null)}
                  className="w-10 h-10 rounded-xl bg-noir/5 dark:bg-white/5 flex items-center justify-center text-noir/40 dark:text-white/40 hover:bg-red-500 hover:text-white transition-all"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Modal Content */}
              <div className="flex-1 overflow-y-auto p-8 sm:p-10 space-y-10 custom-scrollbar">
                {/* Status and Summary */}
                <div className="grid sm:grid-cols-2 gap-6">
                  <div className="p-6 rounded-3xl bg-noir/[0.02] dark:bg-white/[0.02] border border-noir/5 dark:border-white/5">
                    <p className="text-[10px] font-black text-noir/30 dark:text-white/30 uppercase tracking-widest mb-3">Status</p>
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                        selectedOrder.status === 'delivered' ? 'bg-emerald-500/10 text-emerald-500' :
                        selectedOrder.status === 'confirmed' ? 'bg-blue-500/10 text-blue-500' :
                        selectedOrder.status === 'pending' ? 'bg-amber-500/10 text-amber-500' :
                        'bg-indigo-500/10 text-indigo-500'
                      }`}>
                        {getStatusIcon(selectedOrder.status)}
                      </div>
                      <div>
                        <p className={`text-sm font-black uppercase tracking-tight ${
                          selectedOrder.status === 'confirmed' ? 'text-blue-500' :
                          selectedOrder.status === 'delivered' ? 'text-emerald-500' :
                          selectedOrder.status === 'pending' ? 'text-amber-500' :
                          'text-noir dark:text-white'
                        }`}>{selectedOrder.status}</p>
                        <p className="text-[10px] font-bold text-noir/30 dark:text-white/30 uppercase tracking-widest">
                          {selectedOrder.status === 'confirmed' ? 'Order Verified' : 'Fulfillment Phase'}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="p-6 rounded-3xl bg-noir/[0.02] dark:bg-white/[0.02] border border-noir/5 dark:border-white/5">
                    <p className="text-[10px] font-black text-noir/30 dark:text-white/30 uppercase tracking-widest mb-3">Total Amount</p>
                    <p className="text-2xl font-black text-noir dark:text-white tracking-tighter leading-none">ETB {selectedOrder.totalAmount?.toLocaleString()}</p>
                    <p className="text-[10px] font-bold text-noir/30 dark:text-white/30 uppercase tracking-widest mt-2">Paid via Telebirr</p>
                  </div>
                </div>

                {/* Items */}
                <div className="space-y-4">
                  <p className="text-[10px] font-black text-noir/30 dark:text-white/30 uppercase tracking-widest ml-1">Archive Items</p>
                  <div className="space-y-3">
                    {selectedOrder.items.map((item, i) => (
                      <div key={i} className="flex items-center gap-4 p-4 rounded-2xl bg-noir/[0.02] dark:bg-white/[0.02] border border-noir/5 dark:border-white/5">
                        <div className="w-16 h-20 rounded-xl bg-studio overflow-hidden shadow-sm flex-shrink-0">
                          <img src={item.hoodieImage} alt={item.hoodieName} className="w-full h-full object-cover" />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-black text-noir dark:text-white uppercase tracking-tight mb-1">{item.hoodieName}</p>
                          <div className="flex items-center gap-3">
                            <span className="text-[10px] font-bold text-noir/40 dark:text-white/40 uppercase tracking-widest">{item.size}</span>
                            <div className="w-1 h-1 rounded-full bg-noir/10 dark:bg-white/10" />
                            <span className="text-[10px] font-bold text-noir/40 dark:text-white/40 uppercase tracking-widest">{item.color}</span>
                            <div className="w-1 h-1 rounded-full bg-noir/10 dark:bg-white/10" />
                            <span className="text-[10px] font-bold text-noir/40 dark:text-white/40 uppercase tracking-widest">Qty: {item.quantity}</span>
                          </div>
                        </div>
                        <p className="text-sm font-black text-noir dark:text-white tracking-tighter">ETB {item.subtotal?.toLocaleString()}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Payment Receipt */}
                {selectedOrder.paymentScreenshot?.url && (
                  <div className="space-y-4">
                    <p className="text-[10px] font-black text-noir/30 dark:text-white/30 uppercase tracking-widest ml-1">Payment Verification</p>
                    <div 
                      className="w-full aspect-video rounded-3xl overflow-hidden border border-noir/5 dark:border-white/5 group relative cursor-pointer"
                      onClick={() => window.open(selectedOrder.paymentScreenshot?.url, '_blank')}
                    >
                      <img src={selectedOrder.paymentScreenshot.url} alt="Receipt" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                      <div className="absolute inset-0 bg-noir/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <div className="px-5 py-2.5 bg-white rounded-full text-[9px] font-black uppercase tracking-widest text-noir shadow-xl">
                          View Full Receipt
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Modal Footer */}
              <div className="p-8 border-t border-noir/5 dark:border-white/5 bg-noir/[0.01] dark:bg-white/[0.01]">
                <button 
                  onClick={() => setSelectedOrder(null)}
                  className="w-full bg-noir dark:bg-white text-white dark:text-noir py-5 rounded-2xl text-[11px] font-black uppercase tracking-[0.2em] hover:opacity-90 transition-all shadow-xl"
                >
                  Close Details
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AccountPage;
