import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  ArrowRight, 
  Star, 
  Shield, 
  Zap, 
  Heart, 
  Check, 
  CreditCard, 
  RotateCcw, 
  Headphones, 
  Truck,
  Users,
  Globe,
  ChevronLeft,
  Grid,
  Shirt,
  Box,
  Smile,
  Plus
} from 'lucide-react';
import api from '../../services/api';
import { Hoodie } from '../../types';
import { FALLBACK_HOODIES } from '../../constants';
import ProductCard from '../../components/customer/ProductCard';
import Navbar from '../../components/customer/Navbar';
import Footer from '../../components/customer/Footer';
import { useAuth } from '../../contexts/AuthContext';
import heroImage from '../../assets/yes.jpg';
import hoodiesImage from '../../assets/hoodies.png';

const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [featured, setFeatured] = useState<Hoodie[]>(FALLBACK_HOODIES.slice(0, 4));
  const [newArrivals, setNewArrivals] = useState<Hoodie[]>(FALLBACK_HOODIES.slice(0, 4));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [f, n] = await Promise.all([
          api.get('/hoodies?featured=true&limit=4'),
          api.get('/hoodies?newArrival=true&limit=4'),
        ]);
        if (f.data?.data?.hoodies?.length > 0) setFeatured(f.data.data.hoodies);
        if (n.data?.data?.hoodies?.length > 0) setNewArrivals(n.data.data.hoodies);
      } catch (err) {
        console.warn('Backend connection failed, using fallback data');
      }
      setLoading(false);
    };
    fetchData();
  }, []);

  return (
    <div className="min-h-screen bg-white dark:bg-noir transition-colors duration-500">
      <Navbar />

      {/* ——— HERO ——— */}
      <section className="relative h-screen w-full bg-[#F2F2F2] dark:bg-noir transition-colors duration-500 overflow-hidden">
        {/* Background Large Text */}
        <div className="absolute inset-0 z-0 flex items-center justify-center select-none pointer-events-none overflow-hidden">
          <h2 className="text-[25vw] font-black text-black/[0.02] dark:text-white/[0.02] tracking-tighter leading-none uppercase -translate-x-1/4">
            Archive
          </h2>
        </div>

        {/* Background Hoodie Image Container (Constrained & Shifted Right) */}
        <div className="absolute top-0 right-0 w-[60vw] h-screen z-0">
          <img
            src={heroImage}
            alt="Premium Archive"
            className="w-full h-full object-cover"
          />
          {/* Light Overlay for Text Contrast - Only on the left side of the image */}
          <div className="absolute inset-0 bg-gradient-to-r from-[#F2F2F2] via-[#F2F2F2]/20 to-transparent dark:from-noir dark:via-noir/20" />
        </div>

        <div className="container-custom relative z-10 h-full flex items-center">
          <div className="grid lg:grid-cols-2 gap-12 items-center w-full">
            {/* Left Content */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
            >
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="flex items-center gap-4 mb-8"
              >
                <div className="h-px w-8 bg-noir/20 dark:bg-white/20" />
                <span className="text-[11px] font-bold tracking-[0.3em] uppercase text-noir/40 dark:text-white/40">Archive Collection 2026</span>
              </motion.div>

              <h1 className="font-black text-[72px] md:text-[96px] leading-[0.9] text-noir dark:text-white tracking-[-0.04em] mb-8 uppercase">
                Premium<br />
                Hoodies
              </h1>
              
              <p className="text-[14px] font-mono uppercase tracking-[0.2em] text-noir/40 dark:text-white/40 mb-10">
                modern streetwear essentials
              </p>

              <p className="text-noir/60 dark:text-white/60 text-lg mb-12 max-w-md leading-relaxed font-light">
                Luxury comfort meets timeless silhouette. Meticulously engineered for the modern archive.
              </p>
              
              <div className="flex flex-wrap gap-4 mb-16">
                <button 
                  onClick={() => navigate('/shop')}
                  className="bg-noir dark:bg-white text-white dark:text-noir px-10 py-5 text-[11px] font-bold tracking-[0.2em] uppercase flex items-center gap-3 hover:opacity-90 transition-all group"
                >
                  Shop Collection
                  <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                </button>
                <button 
                  onClick={() => navigate(user ? '/shop' : '/register')}
                  className="bg-white/10 dark:bg-white/5 text-noir dark:text-white px-10 py-5 text-[11px] font-bold tracking-[0.2em] uppercase flex items-center gap-3 border border-noir/5 dark:border-white/5 hover:bg-noir/5 transition-all group"
                >
                  Join the Archive
                  <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                </button>
              </div>

              {/* Stats Bar (Re-added) */}
              <div className="flex flex-wrap gap-8 pt-8 border-t border-noir/5 dark:border-white/5">
                {[
                  { icon: <Users size={16} />, n: '10k+', l: 'Customers' },
                  { icon: <Star size={16} />, n: '4.9', l: 'Rating' },
                  { icon: <Globe size={16} />, n: '50+', l: 'Countries' },
                  { icon: <Shield size={16} />, n: 'Premium', l: 'Quality' }
                ].map((s) => (
                  <div key={s.l} className="flex items-center gap-3">
                    <div className="text-noir/40 dark:text-white/40">{s.icon}</div>
                    <div>
                      <p className="font-black text-sm text-noir dark:text-white leading-none mb-1">{s.n}</p>
                      <p className="text-[9px] text-noir/30 dark:text-white/30 uppercase tracking-widest font-bold">{s.l}</p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ——— POPULAR ARCHIVE ——— */}
      <section id="popular-archive" className="section-padding bg-studio dark:bg-noir transition-colors duration-500">
        <div className="container-custom">
          <div className="flex items-center justify-between mb-16">
            <div>
              <p className="text-[10px] text-noir/40 dark:text-white/40 uppercase tracking-[0.3em] font-bold mb-3">Selection</p>
              <h2 className="font-medium text-4xl text-noir dark:text-white tracking-tight">Popular Archive</h2>
            </div>
            <Link to="/shop" className="text-[11px] font-bold tracking-[0.2em] uppercase text-noir/60 dark:text-white/60 hover:text-noir dark:hover:text-white transition-colors border-b border-transparent hover:border-noir dark:hover:border-white pb-1">
              View All
            </Link>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-16">
            {featured.map((h, i) => <ProductCard key={h._id} hoodie={h} index={i} />)}
          </div>
        </div>
      </section>

      {/* ——— PREMIUM SERVICES ——— */}
      <section id="services" className="section-padding bg-[#F9F9F9] dark:bg-white/[0.02] border-y border-noir/5 dark:border-white/5 transition-colors duration-500 overflow-hidden">
        <div className="container-custom">
          <div className="text-center mb-24">
            <p className="text-[10px] text-noir/30 dark:text-white/30 uppercase tracking-[0.4em] font-black mb-4">Excellence</p>
            <h2 className="font-black text-[40px] md:text-[56px] text-noir dark:text-white tracking-tighter uppercase leading-none">
              Premium Services
            </h2>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { 
                icon: <Truck size={32} strokeWidth={1} />, 
                title: 'Global Priority Shipping', 
                desc: 'Expedited international logistics ensuring your archive pieces arrive with speed and security.' 
              },
              { 
                icon: <Shield size={32} strokeWidth={1} />, 
                title: 'Bespoke Tailoring', 
                desc: 'Custom adjustments and silhouette refinements available for our signature heavyweight collections.' 
              },
              { 
                icon: <RotateCcw size={32} strokeWidth={1} />, 
                title: 'Exclusive Archive Access', 
                desc: 'Priority availability for limited-run releases and historic silhouette restocks for members.' 
              },
            ].map((s, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: i * 0.2 }}
                viewport={{ once: true }}
                className="group p-12 bg-white dark:bg-white/[0.02] border border-noir/5 dark:border-white/5 rounded-[40px] flex flex-col items-center text-center hover:bg-noir hover:border-noir dark:hover:bg-white dark:hover:border-white transition-all duration-700 cursor-default shadow-sm"
              >
                <div className="w-20 h-20 bg-[#F9F9F9] dark:bg-noir rounded-full flex items-center justify-center text-noir dark:text-white shadow-sm mb-10 group-hover:scale-110 group-hover:bg-accent-orange group-hover:text-white transition-all duration-500">
                  {s.icon}
                </div>
                <h3 className="font-black text-lg text-noir dark:text-white tracking-tight mb-6 uppercase group-hover:text-white dark:group-hover:text-noir transition-colors">
                  {s.title}
                </h3>
                <p className="text-noir/50 dark:text-white/40 text-sm leading-relaxed font-medium max-w-[280px] group-hover:text-white/70 dark:group-hover:text-noir/60 transition-colors">
                  {s.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ——— THE ARCHIVE (ABOUT SECTION) ——— */}
      <section id="the-archive" className="section-padding bg-white dark:bg-noir transition-colors duration-500 overflow-hidden">
        <div className="container-custom">
          <div className="grid lg:grid-cols-2 gap-20 items-center">
            {/* Left Content */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 1 }}
              viewport={{ once: true }}
            >
              <h2 className="text-[48px] md:text-[64px] font-light leading-[1.1] text-noir dark:text-white mb-10 uppercase tracking-tighter">
                Built for <br />
                <span className="font-black">More Than</span> <br />
                Fashion.
              </h2>
              
              <p className="text-noir/60 dark:text-white/60 text-lg mb-12 leading-relaxed max-w-lg">
                AXIS was founded with a vision to redefine everyday essentials through premium craftsmanship, modern design, and lasting comfort. We believe great clothing should do more than look good—it should inspire confidence, express individuality, and fit seamlessly into your lifestyle. Every hoodie is carefully crafted using high-quality materials and attention to detail, creating timeless pieces designed to be worn, loved, and remembered for years to come.
              </p>
            </motion.div>

            {/* Right Visuals */}
            <div className="relative flex justify-center lg:justify-end">
              <motion.div 
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 1 }}
                viewport={{ once: true }}
                className="w-full max-w-[500px] relative z-10"
              >
                <div className="aspect-[3/4] rounded-[40px] overflow-hidden shadow-2xl relative">
                  <img 
                    src="https://images.unsplash.com/photo-1578932750294-f5075e85f44a?w=1200" 
                    alt="AXIS Hoodie" 
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/5" />
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* ——— NEWSLETTER ——— */}
      <section className="section-padding bg-studio dark:bg-noir border-t border-gray-100 dark:border-white/5 transition-colors duration-500">
        <div className="container-custom max-w-4xl">
          <div className="text-center">
            <h2 className="font-medium text-4xl text-noir dark:text-white tracking-tight mb-4">Join the Inner Circle</h2>
            <p className="text-noir/40 dark:text-white/40 text-sm mb-12 max-w-lg mx-auto font-light leading-relaxed">
              Get early access to exclusive drops, archive restocks, and curated editorial content. No noise, just essentials.
            </p>
            <form className="flex flex-col md:flex-row gap-4 max-w-2xl mx-auto">
              <input
                type="email"
                placeholder="Email Address"
                className="flex-1 bg-gray-50 dark:bg-white/5 border-none px-6 py-4 text-sm focus:ring-1 focus:ring-noir dark:focus:ring-white transition-all text-noir dark:text-white"
              />
              <button type="submit" className="bg-noir dark:bg-white text-white dark:text-noir text-[11px] font-bold tracking-[0.2em] uppercase px-12 py-4 hover:opacity-90 transition-all">
                Subscribe
              </button>
            </form>
            <p className="text-[10px] text-noir/30 dark:text-white/30 mt-6 font-light">
              By subscribing, you agree to our Privacy Policy and Terms of Service.
            </p>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default HomePage;
