'use client';

import { useEffect, useState } from 'react';
import ProductCard from '@/components/ProductCard';
import { ArrowRight } from 'lucide-react';
import Link from 'next/link';

import { usePathname } from 'next/navigation';

export default function InspiredByHistory() {
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasHistory, setHasHistory] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    async function fetchInspired() {
      try {
        const historyStr = localStorage.getItem('pehno_browsing_history');
        const history = historyStr ? JSON.parse(historyStr) : [];
        if (history.length > 0) setHasHistory(true);
        
        const res = await fetch('/api/recommendations', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ history })
        });
        const data = await res.json();
        setRecommendations(data.products || []);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    fetchInspired();
  }, [pathname]);

  if (loading || recommendations.length === 0) return null;

  return (
    <section className="max-w-[1280px] mx-auto px-6 py-12 border-t border-[#E3E1DD]/50">
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-xl font-bold text-[#171717]">
          {hasHistory ? "Inspired by your browsing history" : "Trending & Inspired"}
        </h2>
        <Link href="/search?mode=ai" className="text-sm font-semibold text-[#6B7280] hover:text-[#E67661] flex items-center gap-1">
          Explore more <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

      <div className="flex items-stretch overflow-x-auto gap-6 pb-6 hide-scrollbar -mx-6 px-6 sm:mx-0 sm:px-0">
        {recommendations.map((product, idx) => (
          <div key={product.id} className="min-w-[240px] max-w-[240px] shrink-0 h-full flex">
            <ProductCard
              product={{
                id: product.id,
                title: product.title,
                price: product.price,
                originalPrice: product.compareAtPrice || product.originalPrice,
                rating: product.rating || 4,
                reviewCount: product.reviewCount || Math.floor(Math.abs(product.id.charCodeAt(0) * 10)),
                category: product.category?.name || product.subcategory?.name || product.department || 'Apparel',
                inStock: product.inStock !== false,
                stock: product.stock || 50,
                image: product.images?.[0]?.url || product.image || '/placeholder.jpg',
                isPrime: product.isPrime !== false,
                badge: idx === 0 ? 'AI Pick' : undefined,
              }}
              showAiReason={hasHistory && idx < 3}
              aiReason="Based on recent views"
            />
          </div>
        ))}
      </div>
    </section>
  );
}
