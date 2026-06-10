import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Package, 
  ShoppingCart, 
  Users, 
  TrendingUp, 
  Eye, 
  Calendar, 
  Download, 
  Search, 
  Bell, 
  HelpCircle,
  MoreHorizontal,
  ArrowUpRight,
  ArrowDownRight,
  CreditCard,
  Truck
} from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from 'recharts';
import api from '../../services/api';
import type { DashboardStats, Order } from '../../types';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';

const STATUS_COLORS: Record<string, string> = {
  pending: '#F59E0B',
  confirmed: '#3B82F6',
  processing: '#8B5CF6',
  delivered: '#10B981',
  cancelled: '#EF4444',
};

const DUMMY_REVENUE_DATA = [
  { _id: 'Jan', revenue: 45000, orders: 320 },
  { _id: 'Feb', revenue: 52000, orders: 410 },
  { _id: 'Mar', revenue: 48000, orders: 380 },
  { _id: 'Apr', revenue: 61000, orders: 520 },
  { _id: 'May', revenue: 55000, orders: 480 },
  { _id: 'Jun', revenue: 67000, orders: 590 },
  { _id: 'Jul', revenue: 72000, orders: 650 },
];

const AdminDashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { isDark } = useTheme();

  useEffect(() => {
    api.get('/hoodies/admin/dashboard')
      .then(({ data }) => setStats(data.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const StatCard = ({ title, value, icon, trend, trendValue }: { title: string; value: string; icon: React.ReactNode; trend: 'up' | 'down'; trendValue: string }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white dark:bg-white/5 p-8 rounded-[32px] border border-noir/5 dark:border-white/5 shadow-sm group hover:shadow-xl transition-all duration-500"
    >
      <div className="flex items-start justify-between mb-6">
        <div className="w-12 h-12 rounded-2xl bg-[#F8F9FA] dark:bg-white/10 flex items-center justify-center text-[#4F46E5] dark:text-white group-hover:bg-[#4F46E5] group-hover:text-white transition-all duration-500 shadow-sm">
          {icon}
        </div>
        <div className={`flex items-center gap-1 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${trend === 'up' ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}`}>
          {trend === 'up' ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
          {trendValue}
        </div>
      </div>
      <p className="text-[10px] font-black uppercase tracking-[0.2em] text-noir/30 dark:text-white/30 mb-2">{title}</p>
      <p className="text-3xl font-black text-noir dark:text-white tracking-tight leading-none">
        {loading ? '—' : value}
      </p>
    </motion.div>
  );

  return (
    <div className="space-y-10">
      {/* Header / Top Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-noir/5 dark:border-white/5">
        <div className="flex-1 max-w-xl relative group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-noir/20 dark:text-white/20 group-focus-within:text-[#4F46E5] transition-colors" size={18} />
          <input 
            type="text" 
            placeholder="Search orders, customers..." 
            className="w-full bg-[#F3F4F6] dark:bg-white/5 border-none rounded-2xl py-4 pl-12 pr-6 text-sm focus:ring-2 focus:ring-[#4F46E5]/20 transition-all outline-none"
          />
        </div>
        <div className="flex items-center gap-6">
          <button className="w-12 h-12 rounded-2xl bg-white dark:bg-white/5 border border-noir/5 dark:border-white/5 flex items-center justify-center text-noir/40 dark:text-white/40 hover:text-noir dark:hover:text-white transition-all relative shadow-sm">
            <Bell size={20} />
            <span className="absolute top-3 right-3 w-2 h-2 bg-red-500 rounded-full border-2 border-white dark:border-noir" />
          </button>
          <button className="w-12 h-12 rounded-2xl bg-white dark:bg-white/5 border border-noir/5 dark:border-white/5 flex items-center justify-center text-noir/40 dark:text-white/40 hover:text-noir dark:hover:text-white transition-all shadow-sm">
            <HelpCircle size={20} />
          </button>
          <div className="h-10 w-px bg-noir/10 dark:bg-white/10" />
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-xs font-black text-noir dark:text-white uppercase tracking-tight">{user?.name || 'Admin User'}</p>
              <p className="text-[10px] font-bold text-noir/30 dark:text-white/30 uppercase tracking-widest">Administrator</p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-[#0F172A] flex items-center justify-center text-white font-black shadow-lg">
              {user?.name?.[0] || 'A'}
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-[40px] font-black text-noir dark:text-white tracking-tighter uppercase leading-none mb-2">
            Dashboard Overview
          </h1>
          <p className="text-sm text-noir/40 dark:text-white/40 font-medium tracking-tight">Real-time performance metrics for your store.</p>
        </div>
        <div className="flex gap-4">
          <button className="bg-white dark:bg-white/5 border border-noir/5 dark:border-white/5 px-6 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center gap-3 hover:bg-noir hover:text-white dark:hover:bg-white dark:hover:text-noir transition-all shadow-sm">
            <Calendar size={16} />
            Last 30 Days
          </button>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Total Sales" value={`$${(stats?.revenueData?.reduce((s, d) => s + d.revenue, 0) || 128430).toLocaleString()}`} icon={<CreditCard size={20} />} trend="up" trendValue="+12%" />
        <StatCard title="Total Orders" value={(stats?.totalOrders || 1420).toLocaleString()} icon={<ShoppingCart size={20} />} trend="up" trendValue="+5%" />
        <StatCard title="Conversion Rate" value="3.2%" icon={<TrendingUp size={20} />} trend="down" trendValue="-1%" />
        <StatCard title="Avg. Order Value" value="$90" icon={<Package size={20} />} trend="up" trendValue="+2%" />
      </div>

      {/* Charts Section */}
      <div className="grid lg:grid-cols-12 gap-8">
        {/* Main Area Chart */}
        <div className="lg:col-span-8 bg-white dark:bg-white/5 p-10 rounded-[40px] border border-noir/5 dark:border-white/5 shadow-sm">
          <div className="flex items-center justify-between mb-12">
            <div>
              <h2 className="text-xl font-black text-noir dark:text-white tracking-tight uppercase mb-1">Revenue vs Orders</h2>
              <p className="text-xs text-noir/30 dark:text-white/30 font-bold uppercase tracking-widest">Monthly growth comparison</p>
            </div>
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-[#4F46E5]" />
                <span className="text-[10px] font-black uppercase tracking-widest text-noir/40 dark:text-white/40">Revenue</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-[#818CF8]" />
                <span className="text-[10px] font-black uppercase tracking-widest text-noir/40 dark:text-white/40">Orders</span>
              </div>
            </div>
          </div>
          <div className="h-[320px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={stats?.revenueData?.length ? stats.revenueData : DUMMY_REVENUE_DATA}>
                <defs>
                  <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4F46E5" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#4F46E5" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorOrders" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#818CF8" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#818CF8" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#00000008" />
                <XAxis 
                  dataKey="_id" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 10, fontWeight: 700, fill: '#9CA3AF' }} 
                  dy={10}
                />
                <YAxis hide />
                <Tooltip 
                  contentStyle={{ 
                    borderRadius: '16px', 
                    border: 'none', 
                    boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)',
                    backgroundColor: isDark ? '#1F2937' : 'rgba(255, 255, 255, 0.9)',
                    backdropFilter: 'blur(8px)',
                    color: isDark ? '#F9FAFB' : '#111827'
                  }}
                  itemStyle={{
                    color: isDark ? '#F9FAFB' : '#111827'
                  }}
                />
                <Area type="monotone" dataKey="revenue" stroke="#4F46E5" strokeWidth={4} fillOpacity={1} fill="url(#colorRev)" />
                <Area type="monotone" dataKey="orders" stroke="#818CF8" strokeWidth={4} fillOpacity={1} fill="url(#colorOrders)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Sales by Category Pie */}
        <div className="lg:col-span-4 bg-white dark:bg-white/5 p-10 rounded-[40px] border border-noir/5 dark:border-white/5 shadow-sm">
          <h2 className="text-xl font-black text-noir dark:text-white tracking-tight uppercase mb-10">Sales by Category</h2>
          <div className="h-[240px] relative mb-10">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie 
                  data={stats?.categoryStats?.length ? stats.categoryStats : [
                    {_id: 'Streetwear', count: 45}, 
                    {_id: 'Winter Wear', count: 30}, 
                    {_id: 'Oversized', count: 25}
                  ]} 
                  dataKey="count" 
                  innerRadius={70} 
                  outerRadius={90} 
                  paddingAngle={8}
                >
                  <Cell fill="#4F46E5" />
                  <Cell fill="#818CF8" />
                  <Cell fill="#312E81" />
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <p className="text-2xl font-black text-noir dark:text-white leading-none">100%</p>
              <p className="text-[10px] font-black text-noir/20 dark:text-white/20 uppercase tracking-widest mt-1">Total</p>
            </div>
          </div>
          <div className="space-y-4">
            {[
              { label: 'Streetwear', value: '45%', color: 'bg-[#4F46E5]' },
              { label: 'Winter Wear', value: '30%', color: 'bg-[#818CF8]' },
              { label: 'Oversized', value: '25%', color: 'bg-[#312E81]' }
            ].map((cat, i) => (
              <div key={i} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-2 h-2 rounded-full ${cat.color}`} />
                  <span className="text-[11px] font-black text-noir/40 dark:text-white/40 uppercase tracking-widest">{cat.label}</span>
                </div>
                <span className="text-[11px] font-black text-noir dark:text-white uppercase tracking-widest">{cat.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Section */}
      <div className="grid lg:grid-cols-2 gap-8">
        {/* Recent Activity */}
        <div className="bg-white dark:bg-white/5 p-10 rounded-[40px] border border-noir/5 dark:border-white/5 shadow-sm">
          <div className="flex items-center justify-between mb-10">
            <h2 className="text-xl font-black text-noir dark:text-white tracking-tight uppercase">Recent Activity</h2>
            <button className="text-[10px] font-black text-[#4F46E5] uppercase tracking-[0.2em] border-b-2 border-indigo-500/20 pb-1">View All</button>
          </div>
          <div className="space-y-8">
            {[
              { icon: <ShoppingCart size={18} />, title: 'New Order #8920', sub: '2 minutes ago • $124.00', color: 'text-indigo-500 bg-indigo-50' },
              { icon: <Users size={18} />, title: 'New Customer registered', sub: '45 minutes ago • Los Angeles, CA', color: 'text-violet-500 bg-violet-50' },
              { icon: <Package size={18} />, title: 'Inventory Alert', sub: '2 hours ago • 5 units remaining', color: 'text-amber-500 bg-amber-50' },
              { icon: <Truck size={18} />, title: 'Order #8915 has been shipped', sub: '5 hours ago • DHL Express', color: 'text-emerald-500 bg-emerald-50' }
            ].map((item, i) => (
              <div key={i} className="flex items-start gap-6 group cursor-pointer">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-sm transition-transform group-hover:scale-110 ${item.color}`}>
                  {item.icon}
                </div>
                <div>
                  <h4 className="text-sm font-black text-noir dark:text-white uppercase tracking-tight mb-1">{item.title}</h4>
                  <p className="text-xs text-noir/30 dark:text-white/30 font-medium tracking-tight">{item.sub}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Products */}
        <div className="bg-white dark:bg-white/5 p-10 rounded-[40px] border border-noir/5 dark:border-white/5 shadow-sm">
          <div className="flex items-center justify-between mb-10">
            <h2 className="text-xl font-black text-noir dark:text-white tracking-tight uppercase">Top Products</h2>
            <button className="text-noir/20 dark:text-white/20 hover:text-noir transition-colors">
              <MoreHorizontal size={24} />
            </button>
          </div>
          <div className="space-y-6">
            <div className="grid grid-cols-12 text-[10px] font-black uppercase tracking-widest text-noir/20 dark:text-white/20 pb-4 border-b border-noir/5 dark:border-white/5">
              <div className="col-span-6">Product</div>
              <div className="col-span-2 text-center">Sales</div>
              <div className="col-span-2 text-center">Revenue</div>
              <div className="col-span-2 text-center">Stock</div>
            </div>
            {(stats?.mostViewed?.slice(0, 3) || [1, 2, 3]).map((p: any, i) => (
              <div key={i} className="grid grid-cols-12 items-center group cursor-pointer hover:bg-noir/[0.01] dark:hover:bg-white/[0.01] p-2 rounded-2xl transition-colors">
                <div className="col-span-6 flex items-center gap-6">
                  <div className="w-16 h-20 rounded-2xl bg-[#F8F9FA] dark:bg-white/5 overflow-hidden shadow-sm border border-noir/5 dark:border-white/5">
                    <img src={p.images?.[0]?.url || "https://images.unsplash.com/photo-1556821840-3a63f15732ce?w=200"} alt="" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                  </div>
                  <div className="overflow-hidden">
                    <h4 className="text-base font-black text-noir dark:text-white uppercase tracking-tight truncate mb-1">{p.name || 'Premium Hoodie'}</h4>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-black text-noir/20 dark:text-white/20 uppercase tracking-widest">Archive Item</span>
                      <div className="w-1 h-1 rounded-full bg-indigo-500" />
                      <span className="text-[10px] font-black text-[#4F46E5] uppercase tracking-widest">Streetwear</span>
                    </div>
                  </div>
                </div>
                <div className="col-span-2 text-center text-xs font-black text-noir dark:text-white tracking-tighter">412</div>
                <div className="col-span-2 text-center text-xs font-black text-noir dark:text-white tracking-tighter">$32,540</div>
                <div className="col-span-2 flex justify-center">
                  <span className="text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full bg-emerald-50 text-emerald-600">In Stock</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
