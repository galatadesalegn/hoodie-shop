import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingBag, User, Sun, Moon } from 'lucide-react';
import { useCartStore } from '../../contexts/CartStore';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { sanitizeText } from '../../utils/sanitize';

const NAV_LINKS = [
  { href: '/shop', label: 'Shop' },
  { href: '/#services', label: 'Services' },
  { href: '/#the-archive', label: 'About' },
  { href: '/#footer', label: 'Contact' },
];

const Navbar: React.FC = () => {
  const [scrolled, setScrolled] = useState(false);
  const totalItems = useCartStore((s) => s.totalItems());
  const { user } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const location = useLocation();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      scrolled ? 'bg-white dark:bg-noir border-b border-gray-100 dark:border-white/5 py-4' : 'bg-transparent py-8'
    }`}>
      <div className="container-custom">
        <div className="flex items-center justify-between gap-12">
          {/* Logo & Links */}
          <div className="flex items-center gap-12">
            <Link to="/" className="font-bold text-xl tracking-tight text-noir dark:text-white shrink-0">
              AXIS
            </Link>

            <nav className="hidden md:flex items-center gap-8">
              {NAV_LINKS.map((link) => (
                link.href.startsWith('/#') ? (
                  <a
                    key={link.href}
                    href={link.href}
                    className="text-[13px] font-medium text-noir/60 dark:text-white/60 hover:text-noir dark:hover:text-white transition-colors uppercase tracking-widest"
                  >
                    {link.label}
                  </a>
                ) : (
                  <Link
                    key={link.href}
                    to={link.href}
                    className="text-[13px] font-medium text-noir/60 dark:text-white/60 hover:text-noir dark:hover:text-white transition-colors uppercase tracking-widest"
                  >
                    {link.label}
                  </Link>
                )
              ))}
            </nav>
          </div>

          {/* Icons */}
          <div className="flex items-center gap-6">
            <button
              onClick={toggleTheme}
              className="text-noir/60 dark:text-white/60 hover:text-noir dark:hover:text-white transition-colors"
              aria-label="Toggle theme"
            >
              {isDark ? <Sun size={18} strokeWidth={1.5} /> : <Moon size={18} strokeWidth={1.5} />}
            </button>

            <Link to="/cart" className="relative text-noir/60 dark:text-white/60 hover:text-noir dark:hover:text-white transition-colors">
              <ShoppingBag size={20} strokeWidth={1.5} />
              {totalItems > 0 && (
                <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-noir dark:bg-white text-white dark:text-noir text-[8px] flex items-center justify-center rounded-full font-bold">
                  {totalItems}
                </span>
              )}
            </Link>
            
            <Link to={user ? '/account' : '/login'} className="text-noir/60 dark:text-white/60 hover:text-noir dark:hover:text-white transition-colors">
              {user ? (
                <span className="w-8 h-8 flex items-center justify-center text-[12px] font-bold uppercase text-white dark:text-noir bg-noir dark:bg-white rounded-full shadow-sm">
                  {sanitizeText(user.name).charAt(0)}
                </span>
              ) : (
                <User size={20} strokeWidth={1.5} />
              )}
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
