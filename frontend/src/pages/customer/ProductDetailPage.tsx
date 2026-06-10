import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ShoppingBag, 
  Zap, 
  MessageCircle, 
  Phone, 
  Globe, 
  Star, 
  ChevronRight 
} from 'lucide-react';
import DOMPurify from 'dompurify';
import api from '../../services/api';
import { Hoodie } from '../../types';
import { FALLBACK_HOODIES } from '../../constants';
import { useCartStore } from '../../contexts/CartStore';
import { useAuth } from '../../contexts/AuthContext';
import Navbar from '../../components/customer/Navbar';
import Footer from '../../components/customer/Footer';

const ProductDetailPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [hoodie, setHoodie] = useState<Hoodie | null>(null);
  const [loading, setLoading] = useState(true);
  const [imgIdx, setImgIdx] = useState(0);
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [selectedColorHex, setSelectedColorHex] = useState('');
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);
  const addItem = useCartStore((s) => s.addItem);

  useEffect(() => {
    const fetch = async () => {
      setLoading(true);
      try {
        const { data } = await api.get(`/hoodies/slug/${slug}`);
        setHoodie(data.data.hoodie);
        const firstAvailableSize = data.data.hoodie.sizes.find((s: any) => s.stock > 0)?.size;
        if (firstAvailableSize) setSelectedSize(firstAvailableSize);
        if (data.data.hoodie.colors[0]) {
          setSelectedColor(data.data.hoodie.colors[0].name);
          setSelectedColorHex(data.data.hoodie.colors[0].hex);
        }
      } catch (err) {
        console.warn("API failed, using fallback data for slug:", slug);
        const fallback = FALLBACK_HOODIES.find(h => h.slug === slug);
        if (fallback) {
          setHoodie(fallback);
          const firstAvailableSize = fallback.sizes.find((s: any) => s.stock > 0)?.size;
          if (firstAvailableSize) setSelectedSize(firstAvailableSize);
          if (fallback.colors[0]) {
            setSelectedColor(fallback.colors[0].name);
            setSelectedColorHex(fallback.colors[0].hex);
          }
        }
      }
      setLoading(false);
    };
    if (slug) fetch();
  }, [slug]);

  const handleAddToCart = () => {
    if (!hoodie || !selectedSize || !selectedColor) return;
    addItem(hoodie, selectedSize, selectedColor, selectedColorHex, qty);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  const handleBuyNow = () => {
    if (!hoodie || !selectedSize || !selectedColor) return;
    
    const price = hoodie.discountPrice || hoodie.price;
    const orderInfo = {
      items: [{
        hoodieId: hoodie._id,
        size: selectedSize,
        color: selectedColor,
        quantity: qty
      }],
      totalPrice: price * qty
    };

    navigate('/payment', { state: { orderInfo } });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-studio dark:bg-noir flex items-center justify-center">
        <div className="w-10 h-10 border-2 border-noir dark:border-white border-t-transparent rounded-full animate-spin opacity-20" />
      </div>
    );
  }

  if (!hoodie) {
    return (
      <div className="min-h-screen bg-studio dark:bg-noir flex flex-col items-center justify-center space-y-8">
        <h1 className="text-4xl font-bold tracking-tighter text-noir dark:text-white uppercase opacity-20">Archive Not Found</h1>
        <Link to="/shop" className="text-[10px] uppercase tracking-widest font-bold border-b border-noir dark:border-white pb-1">Back to Shop</Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8F9FA] dark:bg-noir transition-colors duration-500">
      <Navbar />
      
      <main className="max-w-screen-xl mx-auto px-6 pt-32 pb-24">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 mb-8 text-[11px] font-bold uppercase tracking-widest text-noir/30 dark:text-white/30">
          <Link to="/" className="hover:text-noir dark:hover:text-white transition-colors">Store</Link>
          <ChevronRight size={12} />
          <Link to="/shop" className="hover:text-noir dark:hover:text-white transition-colors">{hoodie.category}</Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
          {/* Left: Image Gallery */}
          <div className="space-y-6">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="aspect-square bg-white dark:bg-white/5 rounded-[40px] overflow-hidden shadow-sm border border-noir/5 dark:border-white/5"
            >
              <img
                src={hoodie.images[imgIdx]?.url}
                alt={hoodie.name}
                className="w-full h-full object-cover"
              />
            </motion.div>
            
            <div className="flex gap-4 px-2">
              {hoodie.images.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setImgIdx(i)}
                  className={`w-20 h-20 rounded-2xl overflow-hidden border-2 transition-all duration-300 ${
                    i === imgIdx ? 'border-accent-orange scale-105' : 'border-transparent opacity-60 hover:opacity-100'
                  }`}
                >
                  <img src={img.url} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          </div>

          {/* Right: Info */}
          <div className="space-y-8 py-4">
            <div className="flex justify-between items-start">
              <span className="text-[10px] font-bold text-accent-orange uppercase tracking-[0.2em]">In Stock</span>
            </div>

            <div className="space-y-4">
              <h1 className="text-6xl font-black text-noir dark:text-white lowercase tracking-tight">
                {hoodie.name.split(' ')[0].toLowerCase()}
              </h1>
              <div 
                className="text-sm text-noir/60 dark:text-white/60 leading-relaxed max-w-lg font-medium"
                dangerouslySetInnerHTML={{ 
                  __html: `* ${DOMPurify.sanitize(hoodie.description)} * Perfect for any occasion, combining comfort with a sleek modern design.` 
                }}
              />
              <div className="text-4xl font-black text-noir dark:text-white tracking-tight">
                ETB {(hoodie.discountPrice || hoodie.price).toLocaleString()}
              </div>
            </div>

            {/* Sizes Selection */}
            <div className="space-y-4">
              <div className="space-y-3">
                <p className="text-[10px] font-bold uppercase tracking-widest text-noir/30">Size</p>
                <div className="flex flex-wrap gap-2">
                  {hoodie.sizes.map((s) => (
                    <button
                      key={s.size}
                      onClick={() => setSelectedSize(s.size)}
                      className={`px-4 py-2 text-[10px] font-bold rounded-lg border transition-all ${
                        selectedSize === s.size 
                          ? 'bg-noir text-white border-noir' 
                          : 'border-noir/10 text-noir/40 hover:border-noir'
                      }`}
                    >
                      {s.size}
                    </button>
                  ))}
                </div>
              </div>
              <div className="space-y-3">
                <p className="text-[10px] font-bold uppercase tracking-widest text-noir/30">Color</p>
                <div className="flex gap-3">
                  {hoodie.colors.map((c) => (
                    <button
                      key={c.name}
                      onClick={() => { setSelectedColor(c.name); setSelectedColorHex(c.hex); }}
                      className={`w-8 h-8 rounded-full border-2 transition-all ${
                        selectedColor === c.name ? 'border-noir scale-110' : 'border-transparent'
                      }`}
                      style={{ backgroundColor: c.hex }}
                      title={c.name}
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-wrap gap-4 pt-8">
              <button
                onClick={handleAddToCart}
                className="flex-1 min-w-[160px] bg-white dark:bg-white/5 border-2 border-noir dark:border-white text-noir dark:text-white py-5 rounded-2xl text-[14px] font-black uppercase tracking-widest hover:bg-noir hover:text-white dark:hover:bg-white dark:hover:text-noir transition-all flex items-center justify-center gap-3 shadow-lg"
              >
                <ShoppingBag size={22} />
                {added ? 'Added' : 'Add to Bag'}
              </button>

              <button
                onClick={handleBuyNow}
                className="flex-1 min-w-[160px] bg-noir dark:bg-accent-orange text-white py-5 rounded-2xl text-[14px] font-black uppercase tracking-[0.2em] hover:opacity-90 transition-all flex items-center justify-center gap-3 shadow-2xl shadow-noir/40 dark:shadow-accent-orange/40 animate-pulse-subtle border-2 border-noir dark:border-accent-orange"
              >
                <Zap size={22} fill="white" className="text-white" />
                <span className="text-white">Order Now</span>
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* Mobile Sticky Order Bar */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white/90 dark:bg-noir/90 backdrop-blur-2xl border-t-2 border-noir dark:border-white p-4 z-40 pb-safe">
        <div className="flex gap-4">
          <button
            onClick={handleAddToCart}
            className="flex-1 bg-white dark:bg-white/5 border-2 border-noir dark:border-white text-noir dark:text-white py-4 rounded-xl text-[12px] font-black uppercase tracking-widest flex items-center justify-center gap-2"
          >
            <ShoppingBag size={18} />
            {added ? 'Added' : 'Add'}
          </button>
          <button
            onClick={handleBuyNow}
            className="flex-[2] bg-noir dark:bg-accent-orange text-white py-4 rounded-xl text-[14px] font-black uppercase tracking-[0.1em] flex items-center justify-center gap-2 shadow-2xl border-2 border-noir dark:border-accent-orange"
          >
            <Zap size={20} fill="white" />
            <span>Order Now</span>
          </button>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default ProductDetailPage;
