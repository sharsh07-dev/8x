'use client';

import React, { useState } from 'react';
import Link from 'next/link';

export default function CouponToggle() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="fixed right-0 top-1/2 -translate-y-1/2 z-50 flex items-center transition-transform duration-500 shadow-2xl" style={{ transform: isOpen ? 'translateX(0)' : 'translateX(100%)' }}>
      
      {/* The Tab Handle */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="absolute right-full top-0 bottom-0 w-12 bg-[#4b5563] text-white flex flex-col items-center justify-center cursor-pointer hover:bg-[#374151] transition-colors rounded-l-md overflow-hidden border border-r-0 border-white/10"
        style={{ height: '320px' }}
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={`mb-4 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}>
          <path d="M15 18l-6-6 6-6" />
        </svg>
        <span className="font-bold tracking-widest uppercase whitespace-nowrap -rotate-90 origin-center text-sm absolute top-[60%] w-[200px]">
          UPTO ₹300 OFF
        </span>
      </button>

      {/* The Expanded Panel */}
      <div className="w-[450px] bg-gradient-to-br from-[#fdf2f8] to-[#fef3c7] flex flex-col h-[320px] rounded-bl-xl border border-[#E3E1DD] shadow-[-10px_0_30px_rgba(0,0,0,0.1)]">
        
        {/* Main Content */}
        <div className="flex-1 p-8 relative overflow-hidden">
          <div className="relative z-10">
            <p className="text-[#374151] font-bold text-sm mb-1">Avail Upto</p>
            <h2 className="text-[#374151] text-5xl font-black tracking-tighter mb-8">300 OFF</h2>
            
            <div className="flex items-center gap-3 mb-1">
              <span className="text-[#374151] font-bold text-lg">Coupon Code:</span>
              <span className="text-[#374151] font-black text-xl tracking-wide bg-white/50 px-2 py-0.5 rounded">PEHNO300</span>
            </div>
            <p className="text-[#6b7280] text-sm mb-8">Applicable on your first order</p>
            
            <Link href="/register" className="inline-block bg-[#f43f5e] hover:bg-[#e11d48] text-white font-bold py-3 px-8 rounded shadow-lg hover:shadow-xl transition-all uppercase tracking-wider text-sm">
              Sign Up Now &gt;
            </Link>
          </div>
          
          {/* Decorative graphic similar to screenshot */}
          <div className="absolute right-0 top-4 w-40 h-40 opacity-90 pointer-events-none">
             {/* A CSS art mimicking the graphic */}
             <div className="absolute right-4 top-8 bg-gradient-to-tr from-[#fb923c] to-[#f43f5e] w-32 h-20 rounded-md shadow-lg flex items-center justify-center p-3 text-white font-bold text-center leading-tight transform rotate-3">
               FLAT ✨<br/>₹300 OFF
             </div>
             <div className="absolute left-0 bottom-0 w-24 h-24 bg-white rounded-full border-4 border-[#f43f5e] overflow-hidden">
                <img src="https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=200&q=80" alt="Fashion" className="w-full h-full object-cover" />
             </div>
          </div>
        </div>

        {/* Footer Trust Badges */}
        <div className="bg-white/60 border-t border-[#E3E1DD] px-4 py-3 flex justify-between items-center text-[10px] font-bold text-[#374151] uppercase tracking-wider">
           <div className="flex items-center gap-1.5">
              <svg className="w-4 h-4 text-[#10b981]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              <span>Genuine Products</span>
           </div>
           <div className="flex items-center gap-1.5">
              <svg className="w-4 h-4 text-[#10b981]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" /></svg>
              <span>Try & Buy</span>
           </div>
           <div className="flex items-center gap-1.5">
              <svg className="w-4 h-4 text-[#10b981]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" /></svg>
              <span>Easy Returns</span>
           </div>
        </div>
      </div>
    </div>
  );
}
