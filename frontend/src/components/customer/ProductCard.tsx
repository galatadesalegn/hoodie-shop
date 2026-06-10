import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import type { Hoodie } from '../../types';
import { useAuth } from '../../contexts/AuthContext';

interface Props {
  hoodie: Hoodie;
  index?: number;
}

const ProductCard: React.FC<Props> = ({ hoodie, index = 0 }) => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleViewAndOrder = (e: React.MouseEvent) => {
    e.preventDefault();
    if (user) {
      navigate(`/product/${hoodie.slug}`);
    } else {
      navigate('/login', { state: { from: `/product/${hoodie.slug}` } });
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className="group bg-white dark:bg-noir transition-colors duration-300 relative"
    >
      <div 
        onClick={handleViewAndOrder}
        className="block relative aspect-[3/4] overflow-hidden bg-[#F5F5F5] dark:bg-white/5 mb-6 cursor-pointer"
      >
        <img
          src={hoodie.images[0]?.url || 'https://images.unsplash.com/photo-1556821840-3a63f15732ce?w=400'}
          alt={hoodie.name}
          className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
          onError={(e) => {
            (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1556821840-3a63f15732ce?w=400';
          }}
        />
        
        {hoodie.discountPrice && (
          <div className="absolute top-4 left-4">
            <span className="text-[10px] font-bold tracking-[0.2em] uppercase bg-white dark:bg-noir text-noir dark:text-white px-2 py-1 shadow-sm">
              Sale
            </span>
          </div>
        )}
      </div>

      <div className="flex flex-col gap-4 px-1">
        <div className="flex items-center justify-between">
          <div 
            onClick={handleViewAndOrder}
            className="block cursor-pointer"
          >
            <h3 className="text-[13px] font-bold text-noir dark:text-white tracking-tight hover:opacity-60 transition-all uppercase">
              {hoodie.name}
            </h3>
          </div>
          <span className="text-[11px] font-medium text-noir/40 dark:text-white/40">
            ETB {hoodie.price.toLocaleString()}
          </span>
        </div>

        <button 
          onClick={handleViewAndOrder}
          className="w-full bg-noir dark:bg-white text-white dark:text-noir py-4 text-[11px] font-black uppercase tracking-[0.2em] hover:opacity-90 transition-all flex items-center justify-center gap-2 border-2 border-noir dark:border-white"
        >
          View & Order
        </button>
      </div>
    </motion.div>
  );
};

export default ProductCard;
