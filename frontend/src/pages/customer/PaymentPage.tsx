import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Smartphone, 
  Upload, 
  CheckCircle2, 
  ArrowLeft, 
  ShieldCheck, 
  Info, 
  Copy,
  Check,
  Image as ImageIcon,
  X,
  Loader2,
  MapPin,
  Phone,
  User as UserIcon,
  ChevronRight
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../services/api';

const PaymentPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  
  const [screenshot, setScreenshot] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [step, setStep] = useState(1);
  const [error, setError] = useState('');

  // Customer Form State
  const [customerForm, setCustomerForm] = useState({
    name: user?.name || '',
    phone: '',
    address: ''
  });

  const telebirrNumber = "0940506070"; 
  const orderInfo = location.state?.orderInfo;

  useEffect(() => {
    if (!orderInfo) {
      navigate('/cart');
    }
  }, [orderInfo, navigate]);

  const handleCopy = () => {
    navigator.clipboard.writeText(telebirrNumber);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 3 * 1024 * 1024) {
        setError('Image must be less than 3MB');
        return;
      }
      setScreenshot(file);
      setPreviewUrl(URL.createObjectURL(file));
      setError('');
    }
  };

  const handleSubmitOrder = async () => {
    if (!screenshot || !orderInfo || !customerForm.name || !customerForm.phone || !customerForm.address) {
      setError('Please complete all information including the payment screenshot.');
      return;
    }

    setIsUploading(true);
    setError('');

    try {
      const formData = new FormData();
      formData.append('screenshot', screenshot);
      formData.append('items', JSON.stringify(orderInfo.items));
      formData.append('customer', JSON.stringify({
        name: customerForm.name,
        phone: customerForm.phone,
        address: customerForm.address,
        email: user?.email || 'not-provided@axis.com',
      }));
      formData.append('notes', 'Payment via Telebirr');

      await api.post('/orders', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      setStep(4);
    } catch (err: any) {
      console.error('Payment upload failed:', err);
      setError(err.response?.data?.message || 'Failed to submit order. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-studio dark:bg-noir transition-colors duration-500 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        <button 
          onClick={() => navigate(-1)}
          className="mb-8 flex items-center gap-2 text-noir/40 dark:text-white/40 hover:text-noir dark:hover:text-white transition-colors group"
        >
          <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
          <span className="text-[10px] font-black uppercase tracking-widest">Return</span>
        </button>

        <div className="bg-white dark:bg-white/[0.03] rounded-[40px] p-8 sm:p-12 shadow-sm border border-noir/5 dark:border-white/5 relative overflow-hidden">
          {/* Progress Indicator */}
          <div className="flex items-center gap-3 mb-12">
            {[1, 2, 3, 4].map((s) => (
              <div 
                key={s} 
                className={`h-1.5 rounded-full transition-all duration-500 ${
                  step >= s ? 'w-8 bg-noir dark:bg-white' : 'w-4 bg-noir/10 dark:bg-white/10'
                }`} 
              />
            ))}
          </div>

          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-8"
              >
                <div>
                  <h1 className="text-3xl font-black text-noir dark:text-white tracking-tighter uppercase mb-3">Delivery Info</h1>
                  <p className="text-sm text-noir/40 dark:text-white/40 leading-relaxed">
                    Please provide your delivery details so we can get your archive items to you.
                  </p>
                </div>

                <div className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-noir/40 dark:text-white/40 ml-1 flex items-center gap-2">
                      <UserIcon size={12} /> Full Name
                    </label>
                    <input 
                      type="text"
                      value={customerForm.name}
                      onChange={(e) => setCustomerForm({...customerForm, name: e.target.value})}
                      placeholder="Enter your full name"
                      className="w-full bg-noir/5 dark:bg-white/5 border border-noir/5 dark:border-white/5 rounded-xl px-5 py-4 text-sm focus:outline-none focus:border-noir dark:focus:border-white transition-colors text-noir dark:text-white"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-noir/40 dark:text-white/40 ml-1 flex items-center gap-2">
                      <Phone size={12} /> Phone Number
                    </label>
                    <input 
                      type="tel"
                      value={customerForm.phone}
                      onChange={(e) => setCustomerForm({...customerForm, phone: e.target.value})}
                      placeholder="e.g. 0911223344"
                      className="w-full bg-noir/5 dark:bg-white/5 border border-noir/5 dark:border-white/5 rounded-xl px-5 py-4 text-sm focus:outline-none focus:border-noir dark:focus:border-white transition-colors text-noir dark:text-white"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-noir/40 dark:text-white/40 ml-1 flex items-center gap-2">
                      <MapPin size={12} /> Delivery Address
                    </label>
                    <textarea 
                      value={customerForm.address}
                      onChange={(e) => setCustomerForm({...customerForm, address: e.target.value})}
                      placeholder="House No, Street, Area name..."
                      rows={3}
                      className="w-full bg-noir/5 dark:bg-white/5 border border-noir/5 dark:border-white/5 rounded-xl px-5 py-4 text-sm focus:outline-none focus:border-noir dark:focus:border-white transition-colors text-noir dark:text-white resize-none"
                    />
                  </div>

                  <button 
                    disabled={!customerForm.name || !customerForm.phone || !customerForm.address}
                    onClick={() => setStep(2)}
                    className="w-full bg-noir dark:bg-white text-white dark:text-noir py-6 rounded-2xl text-[11px] font-black uppercase tracking-[0.2em] hover:opacity-90 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
                  >
                    Continue to Payment
                    <ChevronRight size={18} />
                  </button>
                </div>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-8"
              >
                <div>
                  <h1 className="text-3xl font-black text-noir dark:text-white tracking-tighter uppercase mb-3">Telebirr Payment</h1>
                  <p className="text-sm text-noir/40 dark:text-white/40 leading-relaxed">
                    To complete your archive collection, please make the payment through Telebirr.
                  </p>
                </div>

                <div className="bg-noir/5 dark:bg-white/5 rounded-3xl p-8 border border-noir/5 dark:border-white/5">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-[#00AEEF]/10 flex items-center justify-center text-[#00AEEF]">
                        <Smartphone size={20} />
                      </div>
                      <span className="text-[10px] font-black uppercase tracking-widest text-noir/40 dark:text-white/40">Recipient Number</span>
                    </div>
                    <button 
                      onClick={handleCopy}
                      className="w-10 h-10 rounded-xl bg-white dark:bg-white/5 flex items-center justify-center text-noir/40 dark:text-white/40 hover:bg-noir hover:text-white dark:hover:bg-white dark:hover:text-noir transition-all"
                    >
                      {isCopied ? <Check size={18} /> : <Copy size={18} />}
                    </button>
                  </div>
                  <p className="text-4xl font-black tracking-tighter text-noir dark:text-white">{telebirrNumber}</p>
                </div>

                <div className="space-y-4">
                  <div className="flex gap-4 p-5 rounded-2xl bg-orange-500/5 border border-orange-500/10">
                    <Info size={20} className="text-orange-500 shrink-0" />
                    <p className="text-[11px] text-orange-800 dark:text-orange-200 leading-relaxed font-medium">
                      Total Amount: <span className="font-black">ETB {orderInfo?.totalPrice?.toLocaleString()}</span>. Please ensure you pay the exact amount.
                    </p>
                  </div>
                  
                  <div className="flex gap-4">
                    <button 
                      onClick={() => setStep(1)}
                      className="flex-1 py-6 rounded-2xl text-[11px] font-black uppercase tracking-widest text-noir/40 dark:text-white/40 hover:text-noir dark:hover:text-white transition-colors"
                    >
                      Back
                    </button>
                    <button 
                      onClick={() => setStep(3)}
                      className="flex-[2] bg-noir dark:bg-white text-white dark:text-noir py-6 rounded-2xl text-[11px] font-black uppercase tracking-[0.2em] hover:opacity-90 transition-all flex items-center justify-center gap-3"
                    >
                      I've Paid
                      <CheckCircle2 size={18} />
                    </button>
                  </div>
                </div>
              </motion.div>
            )}

            {step === 3 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-8"
              >
                <div>
                  <h2 className="text-3xl font-black text-noir dark:text-white tracking-tighter uppercase mb-3">Upload Receipt</h2>
                  <p className="text-sm text-noir/40 dark:text-white/40 leading-relaxed">
                    Please upload a screenshot of your Telebirr transaction for verification.
                  </p>
                </div>

                <div 
                  className={`border-2 border-dashed rounded-[32px] p-12 transition-all cursor-pointer group relative flex flex-col items-center justify-center text-center ${
                    previewUrl ? 'border-emerald-500/50 bg-emerald-500/5' : 'border-noir/10 dark:border-white/10 hover:border-noir dark:hover:border-white bg-noir/[0.02] dark:bg-white/[0.02]'
                  }`}
                  onClick={() => !previewUrl && document.getElementById('screenshot-upload')?.click()}
                >
                  <input 
                    id="screenshot-upload"
                    type="file" 
                    accept="image/*" 
                    onChange={handleFileChange} 
                    className="hidden" 
                  />
                  
                  {previewUrl ? (
                    <div className="relative w-full max-w-[200px] aspect-[9/16] rounded-2xl overflow-hidden shadow-2xl">
                      <img src={previewUrl} alt="Receipt preview" className="w-full h-full object-cover" />
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          setScreenshot(null);
                          setPreviewUrl(null);
                        }}
                        className="absolute top-2 right-2 w-8 h-8 rounded-full bg-black/50 text-white flex items-center justify-center hover:bg-black transition-colors"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ) : (
                    <>
                      <div className="w-16 h-16 rounded-full bg-noir/5 dark:bg-white/5 flex items-center justify-center text-noir/20 dark:text-white/20 group-hover:text-noir dark:group-hover:text-white transition-colors mb-4">
                        <Upload size={24} />
                      </div>
                      <p className="text-sm font-black text-noir dark:text-white uppercase tracking-tight">Select Screenshot</p>
                      <p className="text-[10px] font-bold text-noir/30 dark:text-white/30 uppercase tracking-widest mt-1">PNG, JPG up to 3MB</p>
                    </>
                  )}
                </div>

                {error && (
                  <p className="text-red-500 text-[10px] font-black uppercase tracking-widest text-center">{error}</p>
                )}

                <div className="flex gap-4">
                  <button 
                    onClick={() => setStep(2)}
                    className="flex-1 py-6 rounded-2xl text-[11px] font-black uppercase tracking-widest text-noir/40 dark:text-white/40 hover:text-noir dark:hover:text-white transition-colors"
                  >
                    Back
                  </button>
                  <button 
                    onClick={handleSubmitOrder}
                    disabled={!screenshot || isUploading}
                    className="flex-[2] bg-noir dark:bg-white text-white dark:text-noir py-6 rounded-2xl text-[11px] font-black uppercase tracking-[0.2em] hover:opacity-90 transition-all shadow-2xl disabled:opacity-50 flex items-center justify-center gap-3"
                  >
                    {isUploading ? (
                      <>
                        <Loader2 size={18} className="animate-spin" />
                        Finalizing...
                      </>
                    ) : (
                      <>
                        Confirm Order
                        <ShieldCheck size={18} />
                      </>
                    )}
                  </button>
                </div>
              </motion.div>
            )}

            {step === 4 && (
              <motion.div
                key="step4"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-8"
              >
                <div className="w-24 h-24 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-500 mx-auto mb-8">
                  <CheckCircle2 size={48} />
                </div>
                <h2 className="text-3xl font-black text-noir dark:text-white tracking-tighter uppercase mb-4">Order Received</h2>
                <p className="text-sm text-noir/40 dark:text-white/40 leading-relaxed max-w-sm mx-auto mb-12">
                  Your payment receipt has been submitted for verification. We'll notify you once your order is confirmed and ready for delivery.
                </p>
                <button 
                  onClick={() => navigate('/account')}
                  className="bg-noir dark:bg-white text-white dark:text-noir px-12 py-6 rounded-2xl text-[11px] font-black uppercase tracking-[0.2em] hover:opacity-90 transition-all shadow-2xl"
                >
                  View My Archive
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default PaymentPage;
