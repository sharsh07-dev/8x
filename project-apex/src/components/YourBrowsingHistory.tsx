'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

import { usePathname } from 'next/navigation';

export default function YourBrowsingHistory() {
  const [history, setHistory] = useState<any[]>([]);
  const pathname = usePathname();

  useEffect(() => {
    try {
      const historyStr = localStorage.getItem('pehno_browsing_history');
      if (historyStr) {
        setHistory(JSON.parse(historyStr));
      }
    } catch (e) {}
  }, [pathname]);

  return (
    <div className="w-full bg-white border-t border-b border-[#E3E1DD] mt-8">
      <div className="max-w-[1280px] mx-auto px-6 py-6">
        <div className="flex items-baseline gap-4 mb-6">
          <h2 className="text-[22px] font-bold text-[#171717]">Your browsing history</h2>
          <Link href="#" className="text-sm font-semibold text-[#6B7280] hover:text-[#E67661] transition-colors">
            View or edit your browsing history
          </Link>
        </div>
        
        {history.length === 0 ? (
          <div className="py-8 text-center">
            <p className="text-[#6B7280] text-sm">You haven't viewed any items recently.</p>
            <Link href="/departments" className="text-[#E67661] font-semibold text-sm hover:underline mt-2 inline-block">
              Continue shopping
            </Link>
          </div>
        ) : (
          <div className="flex items-center gap-6 overflow-x-auto hide-scrollbar pb-2">
            {history.map((item, idx) => (
              <Link key={`${item.id}-${idx}`} href={`/products/${item.id}`} className="shrink-0 flex flex-col items-center justify-center w-36 h-36 bg-white border border-transparent hover:border-[#E3E1DD] rounded-xl transition-all p-2">
                <img 
                  src={item.image || '/placeholder.jpg'} 
                  alt={item.title || 'Product'} 
                  className="max-h-full max-w-full object-contain"
                />
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
