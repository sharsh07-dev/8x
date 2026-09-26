'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { Product } from '@/types/product';
import { DEPARTMENTS } from '@/data/departments';
import ProductCard from '@/components/ProductCard';
import { Breadcrumbs } from '@/components/navigation/Breadcrumbs';
import { Search } from 'lucide-react';
import Fuse from 'fuse.js';

export default function SearchClient({ 
  initialProducts, 
  query, 
  categoryParam 
}: { 
  initialProducts: Product[]; 
  query: string; 
  categoryParam: string;
}) {
  const [sortBy, setSortBy] = useState<'RELEVANCE' | 'PRICE_ASC' | 'PRICE_DESC' | 'RATING'>('RELEVANCE');
  const [selectedBrand, setSelectedBrand] = useState<string>('ALL');
  const [primeOnly, setPrimeOnly] = useState<boolean>(false);

  const searchResults = useMemo(() => {
    let results = initialProducts;

    // Fuzzy search client side if server didn't do a perfect job or we want extra local filtering
    if (query.trim()) {
      const fuse = new Fuse(results, {
        keys: ['title', 'description', 'brand', 'subcategory', 'department'],
        threshold: 0.4,
        ignoreLocation: true,
      });
      // Try fuzzy search, if it returns empty, fallback to server results
      const fuzzyResults = fuse.search(query.trim()).map(res => res.item);
      if (fuzzyResults.length > 0) results = fuzzyResults;
    }

    return results.filter((p) => {
      if (categoryParam && categoryParam !== 'All' && categoryParam !== 'All Departments') {
        const catLower = categoryParam.toLowerCase();
        const matchesCategory = p.category.toLowerCase().includes(catLower);
        const matchesDept = p.department?.toLowerCase().includes(catLower);
        if (!matchesCategory && !matchesDept) return false;
      }
      if (selectedBrand !== 'ALL' && p.brand !== selectedBrand) return false;
      if (primeOnly && !p.isPrime) return false;
      return true;
    }).sort((a, b) => {
      switch (sortBy) {
        case 'PRICE_ASC': return a.price - b.price;
        case 'PRICE_DESC': return b.price - a.price;
        case 'RATING': return b.rating - a.rating;
        case 'RELEVANCE': default: return 0;
      }
    });
  }, [initialProducts, query, categoryParam, selectedBrand, primeOnly, sortBy]);

  const brands = useMemo(() => {
    const b = new Set<string>();
    initialProducts.forEach((p) => { if (p.brand) b.add(p.brand); });
    return Array.from(b).sort();
  }, [initialProducts]);

  return (
    <div className="bg-gray-50 min-h-screen pb-16 font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Breadcrumbs
          items={[
            { label: 'Search Results' },
            ...(query ? [{ label: `"${query}"` }] : []),
          ]}
        />

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
                <option value="RELEVANCE">Featured & Relevance</option>
                <option value="PRICE_ASC">Price: Low to High</option>
                <option value="PRICE_DESC">Price: High to Low</option>
                <option value="RATING">Avg. Customer Review</option>
              </select>
            </div>
          </div>
        </div>

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
              {DEPARTMENTS.slice(0, 3).map((dept) => (
                <Link
                  key={dept.id}
                  href={`/${dept.slug}`}
                  className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-full text-xs font-semibold"
                >
                  {dept.shortName.replace(/&/g, ' & ').replace(/([a-z])([A-Z])/g, '$1 $2')}
                </Link>
              ))}
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
