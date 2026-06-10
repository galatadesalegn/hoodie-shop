import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useCartStore } from '../../contexts/CartStore';
import Navbar from '../../components/customer/Navbar';
import Footer from '../../components/customer/Footer';

const CartPage: React.FC = () => {
  const { items, removeItem, updateQuantity, clearCart, totalPrice } = useCartStore();
  const navigate = useNavigate();
  const total = totalPrice();

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } }
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-studio dark:bg-noir transition-colors duration-500">
        <Navbar />
        <main className="max-w-screen-xl mx-auto px-6 pt-48 pb-24 flex flex-col items-center justify-center text-center space-y-8">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-6xl font-bold tracking-tighter text-noir dark:text-white uppercase opacity-20"
          >
            Empty Bag
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-sm text-noir/40 dark:text-white/40 font-mono uppercase tracking-widest"
          >
            / Your archive is currently empty
          </motion.p>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            <Link
              to="/shop"
              className="text-[10px] uppercase tracking-[0.3em] font-bold text-noir dark:text-white border-b border-noir dark:border-white pb-1 hover:opacity-50 transition-opacity"
            >
              Discover Drops
            </Link>
          </motion.div>
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
          {/* Cart Items */}
          <div className="lg:col-span-8 space-y-12">
            <motion.div variants={itemVariants} className="space-y-4">
              <h1 className="text-4xl font-bold tracking-tighter text-noir dark:text-white uppercase">
                Shopping Bag
              </h1>
              <div className="flex justify-between items-end">
                <p className="text-sm text-noir/60 dark:text-white/60 font-mono uppercase tracking-widest">
                  / {items.length} {items.length === 1 ? 'Item' : 'Items'} in Archive
                </p>
                <button 
                  onClick={clearCart}
                  className="text-[10px] uppercase tracking-widest font-bold text-noir/30 hover:text-noir dark:text-white/30 dark:hover:text-white transition-colors"
                >
                  Clear All
                </button>
              </div>
            </motion.div>

            <motion.div variants={itemVariants} className="space-y-8">
              <AnimatePresence mode='popLayout'>
                {items.map((item) => (
                  <motion.div
                    key={`${item.hoodie._id}-${item.size}-${item.color}`}
                    layout
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="group grid grid-cols-12 gap-6 pb-8 border-b border-noir/5 dark:border-white/5"
                  >
                    <div className="col-span-3 aspect-[3/4] bg-noir/[0.03] dark:bg-white/[0.03] overflow-hidden">
                      <img
                        src={item.hoodie.images[0]?.url || 'https://images.unsplash.com/photo-1556821840-3a63f15732ce?w=400'}
                        alt={item.hoodie.name}
                        className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1556821840-3a63f15732ce?w=400';
                        }}
                      />
                    </div>
                    
                    <div className="col-span-9 flex flex-col justify-between py-1">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="text-lg font-bold text-noir dark:text-white uppercase tracking-tight">
                            {item.hoodie.name}
                          </h3>
                          <p className="text-[10px] text-noir/40 dark:text-white/40 uppercase tracking-[0.2em] mt-1 font-bold">
                            {item.hoodie.brand} — {item.size} / {item.color}
                          </p>
                        </div>
                        <button
                          onClick={() => removeItem(item.hoodie._id, item.size, item.color)}
                          className="text-[10px] uppercase tracking-widest font-bold text-noir/20 hover:text-noir dark:text-white/20 dark:hover:text-white transition-colors"
                        >
                          Remove
                        </button>
                      </div>

                      <div className="flex justify-between items-end">
                        <div className="flex items-center gap-4">
                          <div className="flex items-center border border-noir/10 dark:border-white/10 px-3 py-1 gap-4">
                            <button 
                              onClick={() => updateQuantity(item.hoodie._id, item.size, item.color, item.quantity - 1)}
                              className="text-xs hover:opacity-50 transition-opacity"
                            >
                              -
                            </button>
                            <span className="text-xs font-mono font-bold w-4 text-center">{item.quantity}</span>
                            <button 
                              onClick={() => updateQuantity(item.hoodie._id, item.size, item.color, item.quantity + 1)}
                              className="text-xs hover:opacity-50 transition-opacity"
                            >
                              +
                            </button>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-bold text-noir dark:text-white">
                            ETB {((item.hoodie.discountPrice || item.hoodie.price) * item.quantity).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </motion.div>
          </div>

          {/* Summary Sidebar */}
          <div className="lg:col-span-4 space-y-8 lg:sticky lg:top-32 h-fit">
            <motion.div variants={itemVariants} className="space-y-8">
              <div className="space-y-4">
                <h2 className="text-xs font-bold text-noir dark:text-white uppercase tracking-[0.2em]">
                  Order Summary
                </h2>
                <div className="h-px w-full bg-noir/5 dark:bg-white/5" />
              </div>

              <div className="space-y-4">
                <div className="flex justify-between items-center text-noir/40 dark:text-white/40">
                  <p className="text-[10px] uppercase tracking-widest font-bold">Subtotal</p>
                  <p className="text-xs font-mono">ETB {total.toLocaleString()}</p>
                </div>
                <div className="flex justify-between items-center text-noir/40 dark:text-white/40">
                  <p className="text-[10px] uppercase tracking-widest font-bold">Shipping</p>
                  <p className="text-[10px] uppercase font-bold">Calculated at Checkout</p>
                </div>
                <div className="pt-4 flex justify-between items-center text-noir dark:text-white border-t border-noir/5 dark:border-white/5">
                  <p className="text-xs uppercase tracking-widest font-bold">Total</p>
                  <p className="text-2xl font-bold tracking-tighter">ETB {total.toLocaleString()}</p>
                </div>
              </div>

              <button
                onClick={() => navigate('/checkout')}
                className="w-full bg-noir dark:bg-white text-white dark:text-noir py-5 text-[10px] uppercase tracking-[0.4em] font-bold hover:opacity-90 transition-opacity relative group overflow-hidden"
              >
                Proceed to Checkout
                <div className="absolute bottom-0 left-0 h-[1px] bg-white/20 dark:bg-noir/20 w-full transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left" />
              </button>

              <div className="space-y-4 pt-4">
                <p className="text-[9px] text-noir/40 dark:text-white/40 uppercase tracking-widest leading-relaxed text-center italic">
                  Member authentication required for archive orders
                </p>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </main>

      <Footer />
    </div>
  );
};

export default CartPage;
