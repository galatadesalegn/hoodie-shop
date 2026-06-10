import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { useCartStore, openTelegramOrder } from '../contexts/CartStore';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { useNavigate } from 'react-router-dom';

const CheckoutPage: React.FC = () => {
  const { user } = useAuth();
  const { items, totalPrice, clearCart } = useCartStore();
  const navigate = useNavigate();
  const [isOrdering, setIsOrdering] = useState(false);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1, delayChildren: 0.2 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } }
  };

  const handlePlaceOrder = () => {
    const orderInfo = {
      items: items.map(i => ({
        hoodieId: i.hoodie._id,
        size: i.size,
        color: i.color,
        quantity: i.quantity
      })),
      totalPrice: totalPrice()
    };

    navigate('/payment', { state: { orderInfo } });
  };

  if (items.length === 0 && !isOrdering) {
    return (
      <div className="min-h-screen bg-studio dark:bg-noir transition-colors duration-500">
        <Navbar />
        <main className="max-w-screen-xl mx-auto px-6 pt-48 pb-24 flex flex-col items-center justify-center text-center space-y-8">
          <h1 className="text-4xl font-bold tracking-tighter text-noir dark:text-white uppercase opacity-20">
            Empty Bag
          </h1>
          <p className="text-sm text-noir/40 dark:text-white/40 font-mono">
            / No items selected for archive
          </p>
          <a
            href="/shop"
            className="text-[10px] uppercase tracking-[0.3em] font-bold text-noir dark:text-white border-b border-noir dark:border-white pb-1 hover:opacity-50 transition-opacity"
          >
            Back to Shop
          </a>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-studio dark:bg-noir transition-colors duration-500">
      <Navbar />
      
      <main className="max-w-screen-xl mx-auto px-6 pt-32 pb-24">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 lg:grid-cols-12 gap-16"
        >
          {/* Summary Section */}
          <div className="lg:col-span-7 space-y-12">
            <motion.div variants={itemVariants} className="space-y-4">
              <h1 className="text-4xl font-bold tracking-tighter text-noir dark:text-white uppercase">
                Checkout
              </h1>
              <p className="text-sm text-noir/60 dark:text-white/60 font-mono">
                / Order Review
              </p>
            </motion.div>

            <motion.div variants={itemVariants} className="space-y-6">
              {items.map((item, idx) => (
                <div key={`${item.hoodie._id}-${item.size}-${item.color}`} className="flex gap-6 group">
                  <div className="w-24 aspect-[3/4] bg-noir/[0.03] dark:bg-white/[0.03] overflow-hidden">
                    <img
                      src={item.hoodie.images[0]?.url || 'https://images.unsplash.com/photo-1556821840-3a63f15732ce?w=400'}
                      alt={item.hoodie.name}
                      className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1556821840-3a63f15732ce?w=400';
                      }}
                    />
                  </div>
                  <div className="flex-1 py-2 flex flex-col justify-between">
                    <div>
                      <h3 className="text-sm font-bold text-noir dark:text-white uppercase tracking-tight">
                        {item.hoodie.name}
                      </h3>
                      <p className="text-[10px] text-noir/40 dark:text-white/40 uppercase tracking-widest mt-1">
                        Size {item.size} — {item.color}
                      </p>
                    </div>
                    <div className="flex justify-between items-end">
                      <p className="text-xs text-noir/60 dark:text-white/60 font-mono">
                        QTY: {item.quantity}
                      </p>
                      <p className="text-sm font-bold text-noir dark:text-white">
                        ETB {((item.hoodie.discountPrice || item.hoodie.price) * item.quantity).toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </motion.div>
          </div>

          {/* Details & Payment Section */}
          <div className="lg:col-span-5 space-y-12 lg:sticky lg:top-32 h-fit">
            <motion.div variants={itemVariants} className="bg-noir dark:bg-white p-8 space-y-8">
              <div className="space-y-4">
                <h2 className="text-xs font-bold text-white dark:text-noir uppercase tracking-[0.2em]">
                  Shipping To
                </h2>
                <div className="space-y-1">
                  <p className="text-sm text-white/80 dark:text-noir/80">{user?.name}</p>
                  <p className="text-xs text-white/40 dark:text-noir/40 font-mono">{user?.email}</p>
                </div>
              </div>

              <div className="h-px w-full bg-white/10 dark:bg-noir/10" />

              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <p className="text-[10px] text-white/40 dark:text-noir/40 uppercase tracking-widest font-bold">
                    Subtotal
                  </p>
                  <p className="text-sm text-white/80 dark:text-noir/80 font-mono">
                    ETB {totalPrice().toLocaleString()}
                  </p>
                </div>
                <div className="flex justify-between items-center text-white dark:text-noir">
                  <p className="text-xs uppercase tracking-widest font-bold">
                    Total
                  </p>
                  <p className="text-xl font-bold">
                    ETB {totalPrice().toLocaleString()}
                  </p>
                </div>
              </div>

              <button
                onClick={handlePlaceOrder}
                disabled={isOrdering}
                className="w-full bg-white dark:bg-noir text-noir dark:text-white py-4 text-[10px] uppercase tracking-[0.3em] font-bold hover:bg-studio dark:hover:bg-noir/90 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed overflow-hidden relative group"
              >
                <span className={isOrdering ? 'opacity-0' : 'opacity-100 transition-opacity'}>
                  Complete Archive Order
                </span>
                {isOrdering && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-4 h-4 border-2 border-noir dark:border-white border-t-transparent animate-spin rounded-full" />
                  </div>
                )}
                <div className="absolute bottom-0 left-0 h-0.5 bg-noir/10 dark:bg-white/10 w-full transform origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-500" />
              </button>

              <p className="text-[9px] text-white/30 dark:text-noir/30 uppercase tracking-[0.15em] text-center leading-relaxed">
                By completing this order, you will be redirected to Telegram for final processing and delivery details.
              </p>
            </motion.div>

            <motion.div variants={itemVariants} className="px-4">
              <p className="text-[10px] text-noir/40 dark:text-white/40 leading-relaxed italic">
                AXIS Archive ensures the highest quality of service. All orders are processed through our secure internal verification system.
              </p>
            </motion.div>
          </div>
        </motion.div>
      </main>

      <Footer />
    </div>
  );
};

export default CheckoutPage;
