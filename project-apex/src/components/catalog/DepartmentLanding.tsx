'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Department, Subcategory } from '@/data/departments';
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
  // Filter States
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
  const [selectedColors, setSelectedColors] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState<'ALL' | 'UNDER_25' | '25_50' | '50_100' | 'OVER_100'>('ALL');
  const [minRating, setMinRating] = useState<number>(0);
  const [primeOnly, setPrimeOnly] = useState<boolean>(false);
  const [inStockOnly, setInStockOnly] = useState<boolean>(false);
  const [sortBy, setSortBy] = useState<'FEATURED' | 'PRICE_ASC' | 'PRICE_DESC' | 'RATING' | 'DISCOUNT'>('FEATURED');
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  // Extract unique available filter facets from current product pool
  const allBrands = useMemo(() => {
    const brands = new Set<string>();
    products.forEach((p) => {
      if (p.brand) brands.add(p.brand);
    });
    return Array.from(brands).sort();
  }, [products]);

  const allSizes = useMemo(() => {
    const sizes = new Set<string>();
    products.forEach((p) => {
      p.sizes?.forEach((s) => sizes.add(s));
    });
    return Array.from(sizes);
  }, [products]);

  const allColors = useMemo(() => {
    const colors = new Set<string>();
    products.forEach((p) => {
      p.colors?.forEach((c) => colors.add(c));
    });
    return Array.from(colors);
  }, [products]);

  // Combined Multi-Attribute Filtering & Sorting
  const filteredProducts = useMemo(() => {
    let result = products.filter((p) => {
      // Subcategory check if provided
      if (currentSubcategory && p.subcategory !== currentSubcategory.slug) {
        return false;
      }

      // Gender check if specified
      if (genderFilter && p.gender && p.gender !== genderFilter && p.gender !== 'Unisex') {
        return false;
      }

      // Brand filter
      if (selectedBrands.length > 0 && p.brand && !selectedBrands.includes(p.brand)) {
        return false;
      }

      // Size filter
      if (selectedSizes.length > 0 && (!p.sizes || !p.sizes.some((s) => selectedSizes.includes(s)))) {
        return false;
      }

      // Color filter
      if (selectedColors.length > 0 && (!p.colors || !p.colors.some((c) => selectedColors.includes(c)))) {
        return false;
      }

      // Price filter
      if (priceRange === 'UNDER_25' && p.price >= 25) return false;
      if (priceRange === '25_50' && (p.price < 25 || p.price > 50)) return false;
      if (priceRange === '50_100' && (p.price < 50 || p.price > 100)) return false;
      if (priceRange === 'OVER_100' && p.price <= 100) return false;

      // Rating filter
      if (minRating > 0 && p.rating < minRating) return false;

      // Prime only
      if (primeOnly && !p.isPrime) return false;

      // In Stock only
      if (inStockOnly && (!p.inStock || p.stock <= 0)) return false;

      return true;
    });

    // Sorting
    switch (sortBy) {
      case 'PRICE_ASC':
        result.sort((a, b) => a.price - b.price);
        break;
      case 'PRICE_DESC':
        result.sort((a, b) => b.price - a.price);
        break;
      case 'RATING':
        result.sort((a, b) => b.rating - a.rating);
        break;
      case 'DISCOUNT':
        result.sort((a, b) => {
          const discountA = a.originalPrice ? ((a.originalPrice - a.price) / a.originalPrice) : 0;
          const discountB = b.originalPrice ? ((b.originalPrice - b.price) / b.originalPrice) : 0;
          return discountB - discountA;
        });
        break;
      case 'FEATURED':
      default:
        // Keep catalog order or bestsellers first
        break;
    }

    return result;
  }, [
    products,
    currentSubcategory,
    genderFilter,
    selectedBrands,
    selectedSizes,
    selectedColors,
    priceRange,
    minRating,
    primeOnly,
    inStockOnly,
    sortBy,
  ]);

  const activeFiltersCount =
    selectedBrands.length +
    selectedSizes.length +
    selectedColors.length +
    (priceRange !== 'ALL' ? 1 : 0) +
    (minRating > 0 ? 1 : 0) +
    (primeOnly ? 1 : 0) +
    (inStockOnly ? 1 : 0);

  const clearAllFilters = () => {
    setSelectedBrands([]);
    setSelectedSizes([]);
    setSelectedColors([]);
    setPriceRange('ALL');
    setMinRating(0);
    setPrimeOnly(false);
    setInStockOnly(false);
  };

  const toggleBrand = (brand: string) => {
    setSelectedBrands((prev) =>
      prev.includes(brand) ? prev.filter((b) => b !== brand) : [...prev, brand]
    );
  };

  const toggleSize = (size: string) => {
    setSelectedSizes((prev) =>
      prev.includes(size) ? prev.filter((s) => s !== size) : [...prev, size]
    );
  };

  const toggleColor = (color: string) => {
    setSelectedColors((prev) =>
      prev.includes(color) ? prev.filter((c) => c !== color) : [...prev, color]
    );
  };

  const pageTitle = currentSubcategory
    ? currentSubcategory.name
    : genderFilter
    ? `${genderFilter}'s Fashion`
    : department.name;

  const pageDescription = currentSubcategory
    ? currentSubcategory.description
    : department.description;

  return (
    <div className="bg-gray-50 min-h-screen pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb Navigation */}
        <Breadcrumbs items={breadcrumbs} />

        {/* Department / Category Hero Header */}
        <div className="relative rounded-xl overflow-hidden bg-slate-900 text-white mb-6 shadow-sm">
          <div className="relative z-10 p-6 md:p-8 max-w-2xl">
            <span className="text-[11px] font-bold text-amber-400 uppercase tracking-wider mb-1.5 block">
              {department.name}
            </span>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white mb-2">
              {pageTitle}
            </h1>
            <p className="text-xs sm:text-sm text-gray-300 leading-relaxed max-w-xl">
              {pageDescription}
            </p>
          </div>

          <div className="absolute right-0 top-0 bottom-0 w-1/2 opacity-35 hidden sm:block">
            <Image
              src={department.heroImage}
              alt={department.name}
              fill
              priority
              className="object-cover object-center"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-slate-900 via-slate-900/60 to-transparent" />
          </div>
        </div>

        {/* Subcategories Horizontal Tag Bar */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-2 mb-6">
          <Link
            href={`/${department.slug}`}
            className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition shrink-0 ${
              !currentSubcategory && !genderFilter
                ? 'bg-amber-400 text-slate-950 shadow-xs'
                : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
            }`}
          >
            All {department.shortName}
          </Link>

          {department.subcategories.map((sub) => {
            const isActive = currentSubcategory?.slug === sub.slug;
            return (
              <Link
                key={sub.id}
                href={`/${department.slug}/${sub.slug}`}
                className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition shrink-0 ${
                  isActive
                    ? 'bg-amber-400 text-slate-950 shadow-xs'
                    : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
                }`}
              >
                {sub.name}
              </Link>
            );
          })}
        </div>

        {/* Main 2-Column Catalog Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Left Sidebar Filters (Desktop) */}
          <aside className="hidden lg:block space-y-6 text-xs text-gray-700 font-sans">
            {/* Active filters badge & clear */}
            {activeFiltersCount > 0 && (
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg flex items-center justify-between">
                <span className="font-bold text-amber-900">
                  {activeFiltersCount} filter{activeFiltersCount > 1 ? 's' : ''} active
                </span>
                <button
                  type="button"
                  onClick={clearAllFilters}
                  className="text-xs font-bold text-cyan-800 hover:underline cursor-pointer"
                >
                  Clear all
                </button>
              </div>
            )}

            {/* Department Subcategories Tree */}
            <div>
              <h3 className="font-bold text-sm text-gray-900 mb-2">Category</h3>
              <ul className="space-y-1.5 pl-1">
                <li>
                  <Link
                    href={`/${department.slug}`}
                    className={`block hover:text-amber-600 transition ${
                      !currentSubcategory ? 'font-bold text-amber-700' : 'text-gray-600'
                    }`}
                  >
                    All {department.name}
                  </Link>
                </li>
                {department.subcategories.map((sub) => (
                  <li key={sub.id}>
                    <Link
                      href={`/${department.slug}/${sub.slug}`}
                      className={`block hover:text-amber-600 transition ${
                        currentSubcategory?.slug === sub.slug
                          ? 'font-bold text-amber-700'
                          : 'text-gray-600'
                      }`}
                    >
                      {sub.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Prime Eligibility Toggle */}
            <div className="border-t border-gray-200 pt-4">
              <h3 className="font-bold text-sm text-gray-900 mb-2">Apex Prime</h3>
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={primeOnly}
                  onChange={(e) => setPrimeOnly(e.target.checked)}
                  className="rounded border-gray-300 text-amber-600 focus:ring-amber-500 h-4 w-4"
                />
                <span className="text-[11px] bg-[#f08804] text-[#131921] font-black px-1.5 py-0.5 rounded tracking-wider uppercase">
                  Prime
                </span>
                <span className="text-gray-700 font-medium">Eligible for Free Delivery</span>
              </label>
            </div>

            {/* Price Filter */}
            <div className="border-t border-gray-200 pt-4">
              <h3 className="font-bold text-sm text-gray-900 mb-2">Price</h3>
              <div className="space-y-1.5">
                {[
                  { id: 'ALL', label: 'All Prices' },
                  { id: 'UNDER_25', label: 'Under $25' },
                  { id: '25_50', label: '$25 to $50' },
                  { id: '50_100', label: '$50 to $100' },
                  { id: 'OVER_100', label: '$100 & Above' },
                ].map((range) => (
                  <label key={range.id} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="price_range"
                      checked={priceRange === range.id}
                      onChange={() => setPriceRange(range.id as any)}
                      className="text-amber-600 focus:ring-amber-500 h-3.5 w-3.5"
                    />
                    <span className="text-gray-700">{range.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Customer Reviews Rating */}
            <div className="border-t border-gray-200 pt-4">
              <h3 className="font-bold text-sm text-gray-900 mb-2">Customer Reviews</h3>
              <div className="space-y-1">
                {[4, 3, 2].map((stars) => (
                  <button
                    key={stars}
                    type="button"
                    onClick={() => setMinRating(minRating === stars ? 0 : stars)}
                    className={`flex items-center gap-1.5 w-full text-left py-1 px-1 rounded transition ${
                      minRating === stars ? 'bg-amber-50 font-bold' : 'hover:bg-gray-100'
                    }`}
                  >
                    <div className="flex text-amber-500">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-3.5 h-3.5 ${
                            i < stars ? 'fill-current text-amber-500' : 'text-gray-300'
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-gray-600 text-[11px]">&amp; Up</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Brand Filter */}
            {allBrands.length > 0 && (
              <div className="border-t border-gray-200 pt-4">
                <h3 className="font-bold text-sm text-gray-900 mb-2">Brand</h3>
                <div className="space-y-1 max-h-48 overflow-y-auto pr-1">
                  {allBrands.map((brand) => (
                    <label key={brand} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedBrands.includes(brand)}
                        onChange={() => toggleBrand(brand)}
                        className="rounded border-gray-300 text-amber-600 focus:ring-amber-500 h-3.5 w-3.5"
                      />
                      <span className="text-gray-700">{brand}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}

            {/* Sizes (Clothing & Shoes) */}
            {allSizes.length > 0 && (
              <div className="border-t border-gray-200 pt-4">
                <h3 className="font-bold text-sm text-gray-900 mb-2">Size</h3>
                <div className="flex flex-wrap gap-1.5">
                  {allSizes.map((size) => {
                    const isSelected = selectedSizes.includes(size);
                    return (
                      <button
                        key={size}
                        type="button"
                        onClick={() => toggleSize(size)}
                        className={`px-2.5 py-1 rounded text-xs font-semibold border transition ${
                          isSelected
                            ? 'bg-amber-400 border-amber-500 text-slate-950 font-bold'
                            : 'bg-white border-gray-300 text-gray-700 hover:border-gray-400'
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
              <div className="border-t border-gray-200 pt-4">
                <h3 className="font-bold text-sm text-gray-900 mb-2">Color</h3>
                <div className="flex flex-wrap gap-1.5">
                  {allColors.map((color) => {
                    const isSelected = selectedColors.includes(color);
                    return (
                      <button
                        key={color}
                        type="button"
                        onClick={() => toggleColor(color)}
                        className={`px-2.5 py-1 rounded text-[11px] font-medium border transition ${
                          isSelected
                            ? 'bg-slate-900 text-white border-slate-900'
                            : 'bg-white text-gray-700 border-gray-300 hover:border-gray-400'
                        }`}
                      >
                        {color}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Availability */}
            <div className="border-t border-gray-200 pt-4">
              <h3 className="font-bold text-sm text-gray-900 mb-2">Availability</h3>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={inStockOnly}
                  onChange={(e) => setInStockOnly(e.target.checked)}
                  className="rounded border-gray-300 text-amber-600 focus:ring-amber-500 h-3.5 w-3.5"
                />
                <span className="text-gray-700">In Stock Items Only</span>
              </label>
            </div>
          </aside>

          {/* Right Product Grid Area */}
          <div className="lg:col-span-3 space-y-5">
            {/* Catalog Toolbar */}
            <div className="bg-white p-3.5 rounded-lg border border-gray-200 shadow-xs flex flex-wrap items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2">
                {/* Mobile Filters Toggle Button */}
                <button
                  type="button"
                  onClick={() => setMobileFiltersOpen(!mobileFiltersOpen)}
                  className="lg:hidden flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 rounded font-bold text-gray-800 transition"
                >
                  <Filter className="w-3.5 h-3.5" />
                  <span>Filters {activeFiltersCount > 0 ? `(${activeFiltersCount})` : ''}</span>
                </button>

                <span className="text-gray-600">
                  Showing <strong className="text-gray-900">{filteredProducts.length}</strong> {filteredProducts.length === 1 ? 'item' : 'items'}
                </span>
              </div>

              {/* Sort By Dropdown */}
              <div className="flex items-center gap-2">
                <span className="text-gray-500 hidden sm:inline">Sort by:</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="border border-gray-300 rounded px-2.5 py-1.5 text-xs font-semibold bg-white text-gray-800 focus:ring-1 focus:ring-amber-500 outline-none cursor-pointer"
                >
                  <option value="FEATURED">Featured</option>
                  <option value="PRICE_ASC">Price: Low to High</option>
                  <option value="PRICE_DESC">Price: High to Low</option>
                  <option value="RATING">Avg. Customer Review</option>
                  <option value="DISCOUNT">Biggest Discount %</option>
                </select>
              </div>
            </div>

            {/* Mobile Filters Accordion Panel */}
            {mobileFiltersOpen && (
              <div className="lg:hidden bg-white p-5 rounded-lg border border-gray-200 shadow-sm space-y-4 text-xs">
                <div className="flex items-center justify-between pb-2 border-b">
                  <h3 className="font-bold text-sm text-gray-900">Filters</h3>
                  {activeFiltersCount > 0 && (
                    <button
                      type="button"
                      onClick={clearAllFilters}
                      className="text-xs text-cyan-700 font-bold"
                    >
                      Reset all
                    </button>
                  )}
                </div>

                <div>
                  <h4 className="font-bold text-gray-800 mb-2">Price</h4>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { id: 'ALL', label: 'All' },
                      { id: 'UNDER_25', label: '< $25' },
                      { id: '25_50', label: '$25 - $50' },
                      { id: '50_100', label: '$50 - $100' },
                      { id: 'OVER_100', label: '$100+' },
                    ].map((r) => (
                      <button
                        key={r.id}
                        type="button"
                        onClick={() => setPriceRange(r.id as any)}
                        className={`py-1.5 px-2 rounded border text-center font-medium ${
                          priceRange === r.id
                            ? 'bg-amber-400 border-amber-500 font-bold text-slate-950'
                            : 'bg-white border-gray-200 text-gray-700'
                        }`}
                      >
                        {r.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    type="button"
                    onClick={() => setMobileFiltersOpen(false)}
                    className="w-full py-2 bg-amber-400 text-slate-950 font-bold rounded-lg"
                  >
                    Apply Filters ({filteredProducts.length} results)
                  </button>
                </div>
              </div>
            )}

            {/* Product Grid or Empty State */}
            {filteredProducts.length === 0 ? (
              <div className="bg-white rounded-xl border border-gray-200 p-12 text-center space-y-4">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto text-gray-400">
                  <ShoppingBag className="w-8 h-8" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900">No matching products found</h3>
                  <p className="text-xs text-gray-500 max-w-sm mx-auto mt-1">
                    Try adjusting or clearing your filters to see more results from this department.
                  </p>
                </div>
                {activeFiltersCount > 0 && (
                  <div>
                    <button
                      type="button"
                      onClick={clearAllFilters}
                      className="px-4 py-2 bg-amber-400 hover:bg-amber-500 text-slate-950 font-bold text-xs rounded-lg transition"
                    >
                      Clear all filters
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
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
