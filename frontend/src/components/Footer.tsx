import React from 'react';
import { Link } from 'react-router-dom';
import { Facebook, Instagram, Linkedin } from 'lucide-react';

const XIcon = () => (
  <svg
    viewBox="0 0 24 24"
    width="16"
    height="16"
    stroke="currentColor"
    strokeWidth="1.5"
    fill="none"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M4 4l11.733 16h4.267l-11.733 -16z" />
    <path d="M4 20l6.768 -6.768m2.46 -2.46l6.772 -6.772" />
  </svg>
);

const Footer: React.FC = () => {
  return (
    <footer id="footer" className="bg-[#1A1C1E] text-white pt-20 transition-colors duration-300">
      <div className="container-custom">
        {/* Newsletter Section */}
        <div className="flex flex-col lg:flex-row justify-between items-start gap-12 mb-20">
          <div className="max-w-xl">
            <h2 className="text-[40px] md:text-[56px] font-bold leading-[1.1] tracking-tight mb-4">
              Stay Updated, Stay<br />Connected
            </h2>
          </div>
          <div className="w-full lg:w-auto">
            <p className="text-sm font-medium mb-6">Get Our News And Updates</p>
            <form className="flex gap-4 mb-4">
              <input
                type="email"
                placeholder="Enter your email"
                className="bg-transparent border border-white/20 rounded-full px-8 py-4 text-sm w-full md:w-[320px] focus:outline-none focus:border-white transition-colors"
              />
              <button className="bg-[#FF5C00] hover:bg-[#FF5C00]/90 text-white px-10 py-4 rounded-full text-sm font-bold transition-all whitespace-nowrap">
                Subscribe
              </button>
            </form>
            <p className="text-xs text-white/40">
              By subscribing you agree to our <Link to="/privacy" className="underline hover:text-white transition-colors">Privacy Policy</Link>
            </p>
          </div>
        </div>

        <div className="h-px bg-white/10 w-full mb-16" />

        {/* Links Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12 mb-20">
          {/* Brand Column */}
          <div className="lg:col-span-1">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-[#FFD700] rounded-full flex items-center justify-center">
                <div className="w-5 h-5 bg-black rotate-45" style={{ borderRadius: '2px 8px 2px 2px' }} />
              </div>
              <span className="font-bold text-xl tracking-tight">AXIS Archive</span>
            </div>
            <p className="text-white/60 text-sm leading-relaxed mb-8 max-w-[240px]">
              Seamless transactions, personalized insights, and innovative solutions for a smarter tomorrow.
            </p>
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full border border-white/20 flex items-center justify-center hover:bg-white hover:text-black transition-all cursor-pointer">
                <Facebook size={18} />
              </div>
              <div className="w-10 h-10 rounded-full border border-white/20 flex items-center justify-center hover:bg-white hover:text-black transition-all cursor-pointer">
                <XIcon />
              </div>
              <div className="w-10 h-10 rounded-full border border-white/20 flex items-center justify-center hover:bg-white hover:text-black transition-all cursor-pointer">
                <Instagram size={18} />
              </div>
              <div className="w-10 h-10 rounded-full border border-white/20 flex items-center justify-center hover:bg-white hover:text-black transition-all cursor-pointer">
                <Linkedin size={18} />
              </div>
            </div>
          </div>

          {/* About Column */}
          <div>
            <h4 className="font-bold text-lg mb-8">About</h4>
            <ul className="flex flex-col gap-4">
              {['Company', 'Leadership', 'Press', 'Careers'].map((item) => (
                <li key={item}>
                  <Link to="#" className="text-white/60 hover:text-white transition-colors text-sm">{item}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Help Column */}
          <div>
            <h4 className="font-bold text-lg mb-8">Help</h4>
            <ul className="flex flex-col gap-4">
              {['Help Center', 'Support team', 'Community', 'FAQs'].map((item) => (
                <li key={item}>
                  <Link to="#" className="text-white/60 hover:text-white transition-colors text-sm">{item}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Product Column */}
          <div>
            <h4 className="font-bold text-lg mb-8">Product</h4>
            <ul className="flex flex-col gap-4">
              {['Overview', 'Business Account', 'Credit Card', 'Financial Modeling'].map((item) => (
                <li key={item}>
                  <Link to="#" className="text-white/60 hover:text-white transition-colors text-sm">{item}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company Column */}
          <div>
            <h4 className="font-bold text-lg mb-8">Company</h4>
            <ul className="flex flex-col gap-4">
              {['About Fanwise', 'Contact', 'News & Blogs'].map((item) => (
                <li key={item}>
                  <Link to="#" className="text-white/60 hover:text-white transition-colors text-sm">{item}</Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Final Bottom Bar */}
      <div className="bg-[#141618] py-8">
        <div className="container-custom flex flex-col md:flex-row justify-between items-center gap-4 text-white/40 text-sm">
          <p>© AXIS Archive Copyright 2026. All Rights Reserved.</p>
          <Link to="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
