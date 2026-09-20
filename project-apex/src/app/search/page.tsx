'use client';

import React, { useState, useMemo, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { mockProducts } from '@/data/mockProducts';
import ProductCard from '@/components/ProductCard';
import { Breadcrumbs } from '@/components/navigation/Breadcrumbs';
import { Search, Filter, ShoppingBag, ArrowRight } from 'lucide-react';

function SearchResultsContent() {
  const searchParams = useSearchParams();
  const query = searchParams.get('q') || '';
  const categoryParam = searchParams.get('category') || '';

  const [sortBy, setSortBy] = useState<'RELEVANCE' | 'PRICE_ASC' | 'PRICE_DESC' | 'RATING'>('RELEVANCE');
  const [selectedBrand, setSelectedBrand] = useState<string>('ALL');
  const [primeOnly, setPrimeOnly] = useState<boolean>(false);

  // Filter products matching search keywords and category
  const searchResults = useMemo(() => {
    const q = query.trim().toLowerCase();

    return mockProducts.filter((p) => {
      // Keyword matching across title, brand, description, and category
      if (q) {
        const titleMatch = p.title.toLowerCase().includes(q);
        const descMatch = p.description?.toLowerCase().includes(q);
        const brandMatch = p.brand?.toLowerCase().includes(q);
        const catMatch = p.category.toLowerCase().includes(q);
        const deptMatch = p.department?.toLowerCase().includes(q);

        if (!titleMatch && !descMatch && !brandMatch && !catMatch && !deptMatch) {
          return false;
        }
      }

      // Category / Department matching
      if (categoryParam && categoryParam !== 'All' && categoryParam !== 'All Departments') {
        const catLower = categoryParam.toLowerCase();
        const matchesCategory = p.category.toLowerCase().includes(catLower);
        const matchesDept = p.department?.toLowerCase().includes(catLower);
        if (!matchesCategory && !matchesDept) return false;
      }

      // Brand filter
      if (selectedBrand !== 'ALL' && p.brand !== selectedBrand) {
        return false;
      }

      // Prime only
      if (primeOnly && !p.isPrime) {
        return false;
      }

      return true;
    }).sort((a, b) => {
      switch (sortBy) {
        case 'PRICE_ASC':
          return a.price - b.price;
        case 'PRICE_DESC':
          return b.price - a.price;
        case 'RATING':
          return b.rating - a.rating;
        case 'RELEVANCE':
        default:
          return 0;
      }
    });
  }, [query, categoryParam, selectedBrand, primeOnly, sortBy]);

  // Extract unique brands for filtering
  const brands = useMemo(() => {
    const b = new Set<string>();
    mockProducts.forEach((p) => {
      if (p.brand) b.add(p.brand);
    });
    return Array.from(b).sort();
  }, []);

  return (
    <div className="bg-gray-50 min-h-screen pb-16 font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Breadcrumbs
          items={[
            { label: 'Search Results' },
            ...(query ? [{ label: `"${query}"` }] : []),
          ]}
        />

        {/* Search Results Summary Header */}
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-xs mb-6 flex flex-wrap items-center justify-between gap-4 text-xs">
          <div>
            <span className="text-gray-500">Search results for </span>
            <strong className="text-gray-900 text-sm">{query ? `"${query}"` : 'All Products'}</strong>
            {categoryParam && categoryParam !== 'All' && (
              <span className="text-gray-500"> in <strong className="text-gray-800">{categoryParam}</strong></span>
            )}
            <span className="text-gray-400 ml-2">({searchResults.length} items found)</span>
          </div>

          <div className="flex items-center gap-3">
            <label className="flex items-center gap-1.5 cursor-pointer">
              <input
                type="checkbox"
                checked={primeOnly}
                onChange={(e) => setPrimeOnly(e.target.checked)}
                className="rounded border-gray-300 text-amber-600 focus:ring-amber-500 h-3.5 w-3.5"
              />
              <span className="text-[11px] bg-[#f08804] text-[#131921] font-black px-1.5 py-0.5 rounded tracking-wider uppercase">
                Prime
              </span>
            </label>

            <div className="flex items-center gap-1.5">
              <span className="text-gray-500">Sort by:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="border border-gray-300 rounded px-2.5 py-1.5 text-xs font-semibold bg-white text-gray-800 outline-none cursor-pointer"
              >
                <option value="RELEVANCE">Featured &amp; Relevance</option>
                <option value="PRICE_ASC">Price: Low to High</option>
                <option value="PRICE_DESC">Price: High to Low</option>
                <option value="RATING">Avg. Customer Review</option>
              </select>
            </div>
          </div>
        </div>

        {/* Results Grid or Empty State */}
        {searchResults.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 p-12 text-center space-y-4 max-w-xl mx-auto">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto text-gray-400">
              <Search className="w-8 h-8" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900">
                No results found for "{query}"
              </h2>
              <p className="text-xs text-gray-500 mt-1">
                Try checking your spelling, using more general terms, or explore our curated departments.
              </p>
            </div>

            <div className="pt-2 flex flex-wrap justify-center gap-2">
              <Link
                href="/clothing"
                className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-full text-xs font-semibold"
              >
                Clothing &amp; Fashion
              </Link>
              <Link
                href="/electronics"
                className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-full text-xs font-semibold"
              >
                Electronics
              </Link>
              <Link
                href="/todays-deals"
                className="px-3 py-1.5 bg-amber-100 hover:bg-amber-200 text-amber-900 rounded-full text-xs font-bold"
              >
                Today's Deals
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {searchResults.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[70vh] flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-500" />
        </div>
      }
    >
      <SearchResultsContent />
    </Suspense>
  );
}
