import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, Package, ShoppingCart, Users, Settings,
  Shield, ChevronLeft, ChevronRight, LogOut, Moon, Sun, Menu, X
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';

const NAV = [
  { href: '/admin', label: 'Dashboard', icon: <LayoutDashboard size={18} />, exact: true },
  { href: '/admin/products', label: 'Products', icon: <Package size={18} /> },
  { href: '/admin/orders', label: 'Orders', icon: <ShoppingCart size={18} /> },
  { href: '/admin/customers', label: 'Customers', icon: <Users size={18} /> },
  { href: '/admin/settings', label: 'Settings', icon: <Settings size={18} /> },
];

const SUPER_NAV = [
  { href: '/admin/admins', label: 'Admin Users', icon: <Shield size={18} /> },
  { href: '/admin/security-logs', label: 'Security Logs', icon: <Shield size={18} /> },
];

const AdminSidebar: React.FC = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user, logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();

  const isActive = (href: string, exact = false) =>
    exact ? location.pathname === href : location.pathname.startsWith(href);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className={`p-8 ${collapsed ? 'px-4 text-center' : ''}`}>
        {!collapsed && (
          <div className="space-y-1">
            <h2 className="text-xl font-black tracking-tighter text-[#4F46E5] dark:text-white uppercase leading-none">
              Store Manager
            </h2>
            <p className="text-[10px] font-bold text-noir/20 dark:text-white/20 uppercase tracking-widest">
              Enterprise Suite
            </p>
          </div>
        )}
        {collapsed && <span className="font-black text-xl text-[#4F46E5]">SM</span>}
      </div>

      {/* Nav */}
      <nav className="flex-1 px-4 space-y-1 overflow-y-auto mt-4">
        {NAV.map((item) => (
          <Link
            key={item.href}
            to={item.href}
            onClick={() => setMobileOpen(false)}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all group ${
              isActive(item.href, item.exact)
                ? 'bg-[#4F46E5] text-white shadow-lg shadow-indigo-500/20'
                : 'text-noir/40 dark:text-white/40 hover:bg-noir/5 dark:hover:bg-white/5'
            } ${collapsed ? 'justify-center px-0' : ''}`}
          >
            <span className={`flex-shrink-0 ${isActive(item.href, item.exact) ? 'text-white' : 'group-hover:text-noir dark:group-hover:text-white'}`}>
              {item.icon}
            </span>
            {!collapsed && <span className="font-bold text-sm tracking-tight">{item.label}</span>}
          </Link>
        ))}
      </nav>

      {/* Outlet Footer */}
      {!collapsed && (
        <div className="p-4 mx-4 mb-8 bg-[#F9FAFB] dark:bg-white/5 rounded-2xl border border-noir/5 dark:border-white/5 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#0F172A] flex items-center justify-center text-white font-bold shadow-sm">
            <Package size={18} />
          </div>
          <div className="overflow-hidden">
            <p className="text-xs font-black text-noir dark:text-white truncate">Main Outlet</p>
            <p className="text-[10px] font-bold text-noir/30 dark:text-white/30 uppercase tracking-widest">Premium Plan</p>
          </div>
        </div>
      )}

      {/* User */}
      <div className={`p-6 mt-auto border-t border-noir/5 dark:border-white/5 ${collapsed ? 'items-center' : ''}`}>
        <div className="space-y-2">
          <button 
            onClick={toggleTheme} 
            className={`flex items-center gap-3 w-full px-4 py-3 rounded-xl text-noir/40 dark:text-white/40 hover:bg-noir/5 dark:hover:bg-white/5 transition-all ${collapsed ? 'justify-center' : ''}`}
          >
            {isDark ? <Sun size={18} /> : <Moon size={18} />}
            {!collapsed && <span className="font-bold text-sm tracking-tight">Toggle Theme</span>}
          </button>
          <button 
            onClick={handleLogout} 
            className={`flex items-center gap-3 w-full px-4 py-3 rounded-xl text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-all ${collapsed ? 'justify-center' : ''}`}
          >
            <LogOut size={18} />
            {!collapsed && <span className="font-bold text-sm tracking-tight">Logout</span>}
          </button>
        </div>
        
        {!collapsed && (
          <div className="mt-6 flex items-center gap-3 px-2">
            <div className="w-10 h-10 rounded-full bg-[#0F172A] flex items-center justify-center text-white font-black shadow-sm">
              {user?.name?.[0] || 'A'}
            </div>
            <div className="overflow-hidden">
              <p className="text-xs font-black text-noir dark:text-white truncate uppercase tracking-tight">{user?.name || 'Admin'}</p>
              <p className="text-[10px] font-bold text-noir/30 dark:text-white/30 uppercase tracking-widest">{user?.role || 'Administrator'}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile Toggle */}
      <button
        className="fixed top-4 left-4 z-50 lg:hidden w-10 h-10 bg-background border border-border flex items-center justify-center"
        onClick={() => setMobileOpen((o) => !o)}
      >
        {mobileOpen ? <X size={18} /> : <Menu size={18} />}
      </button>

      {/* Mobile Sidebar */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileOpen(false)}
              className="fixed inset-0 bg-noir/60 backdrop-blur-sm z-40 lg:hidden"
            />
            <motion.div
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className="fixed left-0 top-0 bottom-0 w-72 bg-white dark:bg-[#0A0A0A] border-r border-noir/5 dark:border-white/5 z-50 lg:hidden"
            >
              <SidebarContent />
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Desktop Sidebar */}
      <motion.aside
        animate={{ width: collapsed ? 80 : 240 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        className="hidden lg:flex flex-col fixed left-0 top-0 bottom-0 bg-white dark:bg-[#0A0A0A] border-r border-noir/5 dark:border-white/5 z-40 overflow-hidden shadow-sm"
      >
        <SidebarContent />
      </motion.aside>
    </>
  );
};

export default AdminSidebar;
