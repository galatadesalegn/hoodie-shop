import React, { useEffect, useState, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { SlidersHorizontal, X, ChevronDown } from 'lucide-react';
import api from '../../services/api';
import { Hoodie, HoodieCategory } from '../../types';
import { FALLBACK_HOODIES } from '../../constants';
import ProductCard from '../../components/customer/ProductCard';
import Navbar from '../../components/customer/Navbar';
import Footer from '../../components/customer/Footer';

const CATEGORIES: { value: string; label: string }[] = [
  { value: '', label: 'All' },
  { value: 'oversized', label: 'Oversized' },
  { value: 'streetwear', label: 'Streetwear' },
  { value: 'graphic', label: 'Graphic' },
  { value: 'zip-up', label: 'Zip-Up' },
  { value: 'winter', label: 'Winter' },
];

const SORT_OPTIONS = [
  { value: '-createdAt', label: 'Newest First' },
  { value: 'price', label: 'Price: Low to High' },
  { value: '-price', label: 'Price: High to Low' },
  { value: '-viewCount', label: 'Most Popular' },
];

const ShopPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [hoodies, setHoodies] = useState<Hoodie[]>([]);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [filtersOpen, setFiltersOpen] = useState(false);

  const category = searchParams.get('category') || '';
  const sort = searchParams.get('sort') || '-createdAt';
  const page = Number(searchParams.get('page') || 1);
  const search = searchParams.get('search') || '';
  const featured = searchParams.get('featured') || '';
  const newArrival = searchParams.get('newArrival') || '';

  const fetchHoodies = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (category) params.set('category', category);
      if (sort) params.set('sort', sort);
      if (page) params.set('page', String(page));
      if (search) params.set('search', search);
      if (featured) params.set('featured', featured);
      if (newArrival) params.set('newArrival', newArrival);
      params.set('limit', '12');

      const { data } = await api.get(`/hoodies?${params}`);
      setHoodies(data.data.hoodies);
      setTotal(data.data.total);
      setPages(data.data.pages);
    } catch (err) {
      console.warn("Shop API failed, using fallback data");
      let filtered = [...FALLBACK_HOODIES];
      if (category) filtered = filtered.filter(h => h.category === category);
      if (search) filtered = filtered.filter(h => 
        h.name.toLowerCase().includes(search.toLowerCase()) || 
        h.description.toLowerCase().includes(search.toLowerCase())
      );
      setHoodies(filtered);
      setTotal(filtered.length);
      setPages(1);
    }
    setLoading(false);
  }, [category, sort, page, search, featured, newArrival]);

  useEffect(() => { fetchHoodies(); }, [fetchHoodies]);

  const updateParam = (key: string, value: string) => {
    const p = new URLSearchParams(searchParams);
    if (value) p.set(key, value); else p.delete(key);
    p.delete('page');
    setSearchParams(p);
  };

  return (
    <div className="min-h-screen bg-studio dark:bg-noir transition-colors duration-500">
      <Navbar />

      {/* Header */}
      <div className="pt-32 pb-12 border-b border-noir/5 dark:border-white/5">
        <div className="container-custom">
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
            <p className="text-[10px] text-noir/40 dark:text-white/40 uppercase tracking-[0.3em] font-bold mb-3">Collection</p>
            <h1 className="font-medium text-5xl md:text-7xl tracking-tighter text-noir dark:text-white uppercase leading-[0.9]">
              {category ? CATEGORIES.find(c => c.value === category)?.label : 'Archive'}
            </h1>
            <p className="text-noir/40 dark:text-white/40 mt-4 text-xs font-mono">/ {total} artifacts indexed</p>
          </motion.div>
        </div>
      </div>

      <div className="container-custom py-12">
        {/* Filters Bar */}
        <div className="flex flex-wrap items-center gap-8 mb-16">
          {/* Category Pills */}
          <div className="flex flex-wrap gap-4">
            {CATEGORIES.map((c) => (
              <button
                key={c.value}
                onClick={() => updateParam('category', c.value)}
                className={`font-bold text-[10px] tracking-widest uppercase pb-1 border-b-2 transition-all ${
                  category === c.value
                    ? 'text-noir dark:text-white border-noir dark:border-white'
                    : 'text-noir/20 dark:text-white/20 border-transparent hover:text-noir/60 dark:hover:text-white/60'
                }`}
              >
                {c.label}
              </button>
            ))}
          </div>

          <div className="ml-auto flex items-center gap-6">
            {/* Sort */}
            <div className="relative group">
              <select
                value={sort}
                onChange={(e) => updateParam('sort', e.target.value)}
                className="appearance-none bg-transparent text-[10px] font-bold uppercase tracking-[0.2em] pr-8 py-2 cursor-pointer text-noir/40 dark:text-white/40 hover:text-noir dark:hover:text-white transition-colors focus:outline-none"
              >
                {SORT_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value} className="bg-studio dark:bg-noir">{o.label}</option>
                ))}
              </select>
              <ChevronDown size={12} className="absolute right-0 top-1/2 -translate-y-1/2 pointer-events-none text-noir/20 dark:text-white/20 group-hover:text-noir dark:group-hover:text-white transition-colors" />
            </div>
          </div>
        </div>

        {/* Grid */}
        {loading ? (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-16">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="aspect-[3/4] bg-noir/[0.03] dark:bg-white/[0.03] animate-pulse" />
            ))}
          </div>
        ) : hoodies.length === 0 ? (
          <div className="text-center py-32 space-y-8">
            <p className="text-4xl font-bold text-noir/10 dark:text-white/10 tracking-tighter uppercase">No Results</p>
            <button onClick={() => setSearchParams({})} className="text-[10px] uppercase tracking-widest font-bold border-b border-noir dark:border-white pb-1">
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-16">
            {hoodies.map((h, i) => <ProductCard key={h._id} hoodie={h} index={i} />)}
          </div>
        )}

        {/* Pagination */}
        {pages > 1 && (
          <div className="flex justify-center gap-8 mt-24 pt-12 border-t border-noir/5 dark:border-white/5">
            {[...Array(pages)].map((_, i) => (
              <button
                key={i}
                onClick={() => updateParam('page', String(i + 1))}
                className={`text-xs font-bold transition-all ${
                  page === i + 1
                    ? 'text-noir dark:text-white underline underline-offset-8'
                    : 'text-noir/20 dark:text-white/20 hover:text-noir/60 dark:hover:text-white/60'
                }`}
              >
                {String(i + 1).padStart(2, '0')}
              </button>
            ))}
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
};

export default ShopPage;
