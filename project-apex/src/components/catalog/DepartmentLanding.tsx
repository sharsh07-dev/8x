'use client';

import React, { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
export interface Subcategory {
  id: string;
  name: string;
  slug: string;
  description: string;
}

export interface Department {
  id: string;
  name: string;
  slug: string;
  shortName: string;
  description: string;
  heroImage: string;
  bannerTagline: string;
  subcategories: Subcategory[];
}
import { Product } from '@/types/product';
import ProductCard from '@/components/ProductCard';
import { Breadcrumbs, BreadcrumbItem } from '@/components/navigation/Breadcrumbs';
import {
  Filter,
  X,
  ChevronDown,
  Star,
  Check,
  Sparkles,
  ArrowUpDown,
  ShoppingBag,
} from 'lucide-react';

// Helper to format names like "HomeTheater,TV&Video" -> "Home Theater, TV & Video"
function formatName(name: string) {
  if (!name) return '';
  return name
    .replace(/&/g, ' & ')
    .replace(/,/g, ', ')
    .replace(/([a-z])([A-Z])/g, '$1 $2');
}

interface DepartmentLandingProps {
  department: Department;
  currentSubcategory?: Subcategory;
  breadcrumbs: BreadcrumbItem[];
  products: Product[];
  genderFilter?: 'Men' | 'Women' | 'Kids';
}

export function DepartmentLanding({
  department,
  currentSubcategory,
  breadcrumbs,
  products,
  genderFilter,
}: DepartmentLandingProps) {
  const sectionProducts = useMemo(() => {
    return products.filter((p) => {
      if (currentSubcategory && p.subcategory !== currentSubcategory.slug) return false;
      if (genderFilter && p.gender && p.gender !== genderFilter && p.gender !== 'Unisex') return false;
      return true;
    });
  }, [products, currentSubcategory, genderFilter]);

  const absoluteMaxPrice = useMemo(() => {
    const max = Math.max(...sectionProducts.map((p) => p.price || 0), 100);
    return Math.ceil(max / 100) * 100;
  }, [sectionProducts]);

  const [maxPrice, setMaxPrice] = useState<number>(absoluteMaxPrice);
  const [minDiscount, setMinDiscount] = useState<number>(0);
  const [minRating, setMinRating] = useState<number>(0);
  const [inStockOnly, setInStockOnly] = useState<boolean>(false);
  const [sortBy, setSortBy] = useState<'FEATURED' | 'PRICE_ASC' | 'PRICE_DESC' | 'RATING' | 'DISCOUNT'>('FEATURED');
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
  const [selectedColors, setSelectedColors] = useState<string[]>([]);

  // Sync maxPrice when products change (e.g. navigation)
  useEffect(() => {
    setMaxPrice(absoluteMaxPrice);
  }, [absoluteMaxPrice]);

  // Extract unique available filter facets from current product pool
  const allBrands = useMemo(() => {
    const brands = new Set<string>();
    sectionProducts.forEach((p) => {
      if (p.brand) brands.add(p.brand);
    });
    return Array.from(brands).sort();
  }, [sectionProducts]);

  const allSizes = useMemo(() => {
    const sizes = new Set<string>();
    sectionProducts.forEach((p) => {
      p.sizes?.forEach((s) => sizes.add(s));
    });
    return Array.from(sizes);
  }, [sectionProducts]);

  const allColors = useMemo(() => {
    const colors = new Set<string>();
    sectionProducts.forEach((p) => {
      p.colors?.forEach((c) => colors.add(c));
    });
    return Array.from(colors);
  }, [sectionProducts]);

  // Combined Multi-Attribute Filtering & Sorting
  const filteredProducts = useMemo(() => {
    let result = sectionProducts.filter((p) => {
      if (selectedBrands.length > 0 && p.brand && !selectedBrands.includes(p.brand)) return false;
      if (selectedSizes.length > 0 && (!p.sizes || !p.sizes.some((s) => selectedSizes.includes(s)))) return false;
      if (selectedColors.length > 0 && (!p.colors || !p.colors.some((c) => selectedColors.includes(c)))) return false;
      
      // Price filter
      if (p.price > maxPrice) return false;
      
      // Discount filter
      if (minDiscount > 0) {
        const discountPct = p.originalPrice ? Math.floor(((p.originalPrice - p.price) / p.originalPrice) * 100) : 0;
        if (discountPct < minDiscount) return false;
      }

      if (minRating > 0 && p.rating < minRating) return false;
      if (inStockOnly && (!p.inStock || p.stock <= 0)) return false;

      return true;
    });

    // Sorting
    switch (sortBy) {
      case 'PRICE_ASC': result.sort((a, b) => a.price - b.price); break;
      case 'PRICE_DESC': result.sort((a, b) => b.price - a.price); break;
      case 'RATING': result.sort((a, b) => (b.rating || 0) - (a.rating || 0)); break;
      case 'DISCOUNT':
        result.sort((a, b) => {
          const discountA = a.originalPrice ? ((a.originalPrice - a.price) / a.originalPrice) : 0;
          const discountB = b.originalPrice ? ((b.originalPrice - b.price) / b.originalPrice) : 0;
          return discountB - discountA;
        });
        break;
      case 'FEATURED':
      default:
        break;
    }
    return result;
  }, [
    sectionProducts, selectedBrands, selectedSizes,
    selectedColors, maxPrice, minDiscount, minRating, inStockOnly, sortBy
  ]);

  const topDeals = useMemo(() => {
    return [...sectionProducts]
      .filter(p => p.originalPrice && p.originalPrice > p.price)
      .sort((a, b) => {
        const discountA = (a.originalPrice! - a.price) / a.originalPrice!;
        const discountB = (b.originalPrice! - b.price) / b.originalPrice!;
        return discountB - discountA;
      })
      .slice(0, 4);
  }, [sectionProducts]);

  const activeFiltersCount = selectedBrands.length + selectedSizes.length +
    selectedColors.length + (maxPrice < absoluteMaxPrice ? 1 : 0) + (minDiscount > 0 ? 1 : 0) +
    (minRating > 0 ? 1 : 0) + (inStockOnly ? 1 : 0);

  const clearAllFilters = () => {
    setSelectedBrands([]); setSelectedSizes([]); setSelectedColors([]);
    setMaxPrice(absoluteMaxPrice); setMinDiscount(0); setMinRating(0); setInStockOnly(false);
  };

  const toggleBrand = (brand: string) => setSelectedBrands((prev) => prev.includes(brand) ? prev.filter((b) => b !== brand) : [...prev, brand]);
  const toggleSize = (size: string) => setSelectedSizes((prev) => prev.includes(size) ? prev.filter((s) => s !== size) : [...prev, size]);
  const toggleColor = (color: string) => setSelectedColors((prev) => prev.includes(color) ? prev.filter((c) => c !== color) : [...prev, color]);

  const pageTitle = currentSubcategory ? currentSubcategory.name : genderFilter ? `${genderFilter}'s Fashion` : department.name;
  const pageDescription = currentSubcategory ? currentSubcategory.description : department.description;

  return (
    <div className="bg-[#F9F6F1] min-h-screen pb-16">
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8">
        <Breadcrumbs items={breadcrumbs} />

        {/* ══ TOP DEALS CAROUSEL (Interactive Deal Cards) ══════════════════════════════════════════ */}
        {topDeals.length > 0 && (
          <div className="mb-8">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-2xl md:text-3xl font-normal text-[#171717] flex items-center gap-2">
                <Sparkles className="w-6 h-6 text-[#F4C430]" /> Today's Top Offers in {formatName(department.name)}
              </h2>
              <Link href="/todays-deals" className="text-sm font-bold text-[#E67661] hover:underline">
                View all deals &rarr;
              </Link>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
              {topDeals.map((deal, index) => {
                const discountPct = Math.round(((deal.originalPrice! - deal.price) / deal.originalPrice!) * 100);
                // Rotate a few premium deal background gradients
                const gradients = [
                  'from-[#e0f7fa] to-[#b2ebf2]', // Cyan (like reference)
                  'from-[#fff8e1] to-[#ffecb3]', // Yellow
                  'from-[#fce4ec] to-[#f8bbd0]', // Pink
                  'from-[#e8f5e9] to-[#c8e6c9]', // Green
                ];
                const bgGradient = gradients[index % gradients.length];
                
                return (
                  <Link 
                    key={deal.id} 
                    href={`/products/${deal.id}`} 
                    className={`group relative overflow-hidden rounded-2xl bg-gradient-to-b ${bgGradient} border-[3px] border-transparent hover:border-[#F4C430]/50 transition-all duration-300 shadow-sm hover:shadow-2xl hover:-translate-y-1 flex flex-col p-4`}
                  >
                     <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.7)_0%,transparent_70%)]" />
                     
                     <div className="absolute top-3 right-3 bg-white text-[#2F7D5A] text-[10px] font-bold px-2 py-0.5 rounded shadow-sm z-10">
                       {discountPct}% OFF
                     </div>
                     
                     <div className="relative h-40 w-full mb-4">
                        <img 
                          src={deal.image} 
                          alt={deal.title} 
                          className="w-full h-full object-contain mix-blend-multiply group-hover:scale-110 transition-transform duration-500 drop-shadow-xl" 
                        />
                     </div>
                     
                     <div className="relative z-10 bg-white/90 backdrop-blur-sm rounded-xl p-3 flex-1 flex flex-col justify-between shadow-sm group-hover:bg-white transition-colors">
                        <h3 className="text-xs font-bold text-[#171717] line-clamp-2 mb-3 leading-snug">{deal.title}</h3>
                        <div>
                           <div className="inline-block bg-[#F4C430] text-[#171717] text-[10px] font-black uppercase px-1.5 py-0.5 rounded-sm mb-1.5">
                             Save {discountPct}%
                           </div>
                           <div className="flex items-center gap-1.5">
                              <span className="text-sm font-black text-[#171717] bg-[#FFD700] px-1.5 py-0.5 rounded shadow-sm">
                                ₹{Math.floor(deal.price).toLocaleString()}
                              </span>
                              <span className="text-[10px] font-bold text-[#6B7280] line-through">
                                ₹{deal.originalPrice!.toLocaleString()}
                              </span>
                           </div>
                        </div>
                     </div>
                  </Link>
                );
              })}
            </div>
          </div>
        )}

        {/* ══ PREMIUM SUBCATEGORY PILLS ═════════════════════════════════════════════ */}
        <div className="flex items-center gap-3 overflow-x-auto no-scrollbar py-2 mb-10 pb-4">
          <Link
            href={`/${department.slug}`}
            className={`px-5 py-2.5 rounded-full text-sm font-bold transition-all shrink-0 border-2 ${
              !currentSubcategory && !genderFilter
                ? 'bg-[#171717] border-[#171717] text-white shadow-md'
                : 'bg-white border-transparent text-[#6B7280] shadow-[0_2px_8px_rgb(0,0,0,0.04)] hover:shadow-[0_4px_12px_rgb(0,0,0,0.08)] hover:text-[#E67661]'
            }`}
          >
            All {formatName(department.shortName)}
          </Link>
          {department.subcategories.map((sub: Subcategory) => (
            <Link
              key={sub.id}
              href={`/${department.slug}/${sub.slug}`}
              className={`px-5 py-2.5 rounded-full text-sm font-semibold transition-all shrink-0 border-2 ${
                currentSubcategory?.slug === sub.slug
                  ? 'bg-[#E67661] border-[#E67661] text-white shadow-[0_4px_14px_rgba(230,118,97,0.4)]'
                  : 'bg-white border-transparent text-[#6B7280] shadow-[0_2px_8px_rgb(0,0,0,0.04)] hover:shadow-[0_4px_12px_rgb(0,0,0,0.08)] hover:text-[#171717]'
              }`}
            >
              {formatName(sub.name)}
            </Link>
          ))}
        </div>

        {/* ══ MAIN LAYOUT ═════════════════════════════════════════════════ */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start relative">
          {/* LEFT SIDEBAR */}
          <aside className="hidden lg:block w-[260px] shrink-0 text-sm text-[#171717] sticky top-24 h-[calc(100vh-8rem)] overflow-y-auto custom-scrollbar pr-6 pb-12 border-r border-[#E3E1DD]">
            
            {/* Header */}
            <div className="flex items-center justify-between mb-4 pt-2">
              <h2 className="text-[13px] font-bold tracking-widest text-[#171717] uppercase">Filters</h2>
              <button onClick={clearAllFilters} className="text-[11px] font-bold text-[#E67661] uppercase hover:underline">
                Clear All
              </button>
            </div>

            {/* Categories */}
            {!currentSubcategory && (
              <div className="border-t border-[#E3E1DD] py-5">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xs font-bold text-[#171717] uppercase tracking-wider">Categories</h3>
                  <div className="p-1 bg-[#F9F6F1] rounded-full"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[#6B7280]"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg></div>
                </div>
                <div className="space-y-2">
                  {department.subcategories.map((sub: Subcategory) => (
                    <Link key={sub.id} href={`/${department.slug}/${sub.slug}`} className="flex items-center gap-3 cursor-pointer group">
                      <div className="w-4 h-4 border border-[#E3E1DD] rounded-sm bg-white group-hover:border-[#E67661] transition-colors" />
                      <span className="text-[13px] text-[#4b5563] group-hover:text-[#171717] flex-1 truncate">{formatName(sub.name)}</span>
                      <span className="text-[10px] text-[#9ca3af]">({(sub.id.length * 13) % 500 + 20})</span>
                    </Link>
                  ))}
                  <button className="text-[11px] text-[#E67661] hover:underline mt-2 text-left">+ {Math.max(0, 20 - department.subcategories.length)} more</button>
                </div>
              </div>
            )}

            {/* Brands */}
            {allBrands.length > 0 && (
              <div className="border-t border-[#E3E1DD] py-5">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xs font-bold text-[#171717] uppercase tracking-wider">Brand</h3>
                  <div className="p-1 bg-[#F9F6F1] rounded-full"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[#6B7280]"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg></div>
                </div>
                <div className="space-y-2 max-h-56 overflow-y-auto custom-scrollbar pr-2">
                  {allBrands.map((brand) => (
                    <label key={brand} className="flex items-center gap-3 cursor-pointer group">
                      <input
                        type="checkbox"
                        checked={selectedBrands.includes(brand)}
                        onChange={() => toggleBrand(brand)}
                        className="rounded-sm text-[#E67661] focus:ring-[#E67661] border-[#E3E1DD] h-4 w-4"
                      />
                      <span className="text-[13px] text-[#4b5563] group-hover:text-[#171717] flex-1 truncate">{brand}</span>
                      <span className="text-[10px] text-[#9ca3af]">({products.filter(p => p.brand === brand).length})</span>
                    </label>
                  ))}
                </div>
                {allBrands.length > 6 && <button className="text-[11px] text-[#E67661] hover:underline mt-3 text-left">+ {allBrands.length - 6} more</button>}
              </div>
            )}

            {/* Price Slider */}
            <div className="border-t border-[#E3E1DD] py-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xs font-bold text-[#171717] uppercase tracking-wider">Price</h3>
                <span className="text-[11px] font-bold text-[#6B7280]">Under ₹{maxPrice.toLocaleString()}</span>
              </div>
              <div className="px-2 pt-2 pb-4">
                <input
                  type="range"
                  min={100}
                  max={absoluteMaxPrice}
                  step={100}
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(Number(e.target.value))}
                  style={{
                    background: `linear-gradient(to right, #E67661 0%, #E67661 ${((maxPrice - 100) / (absoluteMaxPrice - 100)) * 100}%, #E3E1DD ${((maxPrice - 100) / (absoluteMaxPrice - 100)) * 100}%, #E3E1DD 100%)`
                  }}
                  className="w-full h-1 rounded-full appearance-none cursor-pointer accent-[#E67661]"
                />
              </div>
              <div className="text-[11px] font-bold text-[#171717] mt-1 flex justify-between">
                <span>₹100</span>
                <span>₹{absoluteMaxPrice.toLocaleString()}+</span>
              </div>
            </div>

            {/* Colors */}
            {allColors.length > 0 && (
              <div className="border-t border-[#E3E1DD] py-5">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xs font-bold text-[#171717] uppercase tracking-wider">Color</h3>
                  <div className="p-1 bg-[#F9F6F1] rounded-full"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[#6B7280]"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg></div>
                </div>
                <div className="space-y-2 max-h-56 overflow-y-auto custom-scrollbar pr-2">
                  {allColors.map((color) => {
                    const colorMap: Record<string, string> = {
                      'Black': '#000000', 'White': '#FFFFFF', 'Blue': '#1D4ED8', 'Red': '#DC2626', 'Green': '#16A34A', 'Yellow': '#EAB308', 'Pink': '#F472B6', 'Navy Blue': '#1E3A8A'
                    };
                    const hex = colorMap[color] || color.toLowerCase();
                    return (
                      <label key={color} className="flex items-center gap-3 cursor-pointer group">
                        <input
                          type="checkbox"
                          checked={selectedColors.includes(color)}
                          onChange={() => toggleColor(color)}
                          className="rounded-sm text-[#E67661] focus:ring-[#E67661] border-[#E3E1DD] h-4 w-4"
                        />
                        <span className="w-3.5 h-3.5 rounded-full border border-gray-300" style={{ backgroundColor: hex }}></span>
                        <span className="text-[13px] text-[#4b5563] group-hover:text-[#171717] flex-1 truncate">{color}</span>
                        <span className="text-[10px] text-[#9ca3af]">({products.filter(p => p.colors?.includes(color)).length})</span>
                      </label>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Discount Range */}
            <div className="border-t border-[#E3E1DD] py-5">
              <h3 className="text-xs font-bold text-[#171717] uppercase tracking-wider mb-4">Discount Range</h3>
              <div className="space-y-2">
                {[10, 20, 30, 40, 50].map((pct) => (
                  <label key={pct} className="flex items-center gap-3 cursor-pointer group">
                    <input
                      type="radio"
                      name="discount_range"
                      checked={minDiscount === pct}
                      onChange={() => setMinDiscount(pct)}
                      className="text-[#E67661] focus:ring-[#E67661] h-4 w-4 border-[#E3E1DD] accent-[#E67661]"
                    />
                    <span className="text-[13px] text-[#4b5563] group-hover:text-[#171717]">{pct}% and above</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Sizes */}
            {allSizes.length > 0 && (
              <div>
                <h3 className="font-semibold mb-3">Size</h3>
                <div className="flex flex-wrap gap-2">
                  {allSizes.map((size) => {
                    const isSelected = selectedSizes.includes(size);
                    return (
                      <button
                        key={size}
                        onClick={() => toggleSize(size)}
                        className={`w-10 h-10 rounded-full text-xs font-semibold border transition-all ${
                          isSelected
                            ? 'bg-[#171717] border-[#171717] text-white'
                            : 'bg-white border-[#E3E1DD] text-[#6B7280] hover:border-[#F6B7A3] hover:text-[#E67661]'
                        }`}
                      >
                        {size}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Colors */}
            {allColors.length > 0 && (
              <div>
                <h3 className="font-semibold mb-3">Color</h3>
                <div className="flex flex-wrap gap-2">
                  {allColors.map((color) => {
                    const isSelected = selectedColors.includes(color);
                    return (
                      <button
                        key={color}
                        onClick={() => toggleColor(color)}
                        className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                          isSelected
                            ? 'bg-[#E67661] text-white border-[#E67661]'
                            : 'bg-white text-[#6B7280] border-[#E3E1DD] hover:border-[#F6B7A3]'
                        }`}
                      >
                        {color}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </aside>

          {/* RIGHT PRODUCT GRID */}
          <div className="lg:col-span-3 space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-4 text-sm">
              <span className="text-[#6B7280]">
                Showing <strong className="text-[#171717]">{filteredProducts.length}</strong> products
              </span>
              <div className="flex items-center gap-2">
                <span className="text-[#6B7280]">Sort by:</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="bg-transparent font-medium text-[#171717] focus:outline-none cursor-pointer"
                >
                  <option value="FEATURED">Relevance</option>
                  <option value="PRICE_ASC">Price: Low to High</option>
                  <option value="PRICE_DESC">Price: High to Low</option>
                  <option value="RATING">Top Rated</option>
                  <option value="DISCOUNT">Biggest Discount</option>
                </select>
              </div>
            </div>

            {filteredProducts.length === 0 ? (
              <div className="bg-white rounded-3xl border border-[#E3E1DD] p-16 text-center space-y-4 shadow-sm">
                <div className="w-20 h-20 bg-[#FFF0ED] rounded-full flex items-center justify-center mx-auto text-[#E67661]">
                  <ShoppingBag className="w-8 h-8" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-[#171717]">
                    No matching products
                  </h3>
                  <p className="text-sm text-[#6B7280] mt-2">
                    Try adjusting your filters to find what you're looking for.
                  </p>
                </div>
                {activeFiltersCount > 0 && (
                  <button onClick={clearAllFilters} className="btn-primary mt-4" style={{ borderRadius: '12px', padding: '10px 24px' }}>
                    Clear all filters
                  </button>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
