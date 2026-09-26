'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Search, ShoppingBag, User, Heart, Sparkles, Menu,
  ChevronDown, LogOut, Package, Settings, Star
} from 'lucide-react';
import { useSession, signOut } from '@/lib/auth-client';
import { useCartStore } from '@/store/useCartStore';
import { DEPARTMENTS } from '@/data/departments';
import MobileNavDrawer from '@/components/navigation/MobileNavDrawer';

import Fuse from 'fuse.js';

export default function Header() {
  const router = useRouter();
  const { data: session } = useSession();
  const totalItems = useCartStore((s) => s.items.reduce((sum, i) => sum + i.quantity, 0));

  const [showAccount, setShowAccount]   = useState(false);
  const [navOpen, setNavOpen]           = useState(false);
  const [mounted, setMounted]           = useState(false);
  const [scrolled, setScrolled]         = useState(false);
  const [searchOpen, setSearchOpen]     = useState(false);
  const [query, setQuery]               = useState('');
  const [suggestions, setSuggestions]   = useState<string[]>([]);

  React.useEffect(() => {
    if (query.trim().length > 1) {
      const delay = setTimeout(() => {
        fetch(`/api/search/suggestions?q=${encodeURIComponent(query)}`)
          .then(res => res.json())
          .then(data => setSuggestions(data))
          .catch(() => setSuggestions([]));
      }, 300);
      return () => clearTimeout(delay);
    } else {
      setSuggestions([]);
    }
  }, [query]);

  const accountRef = useRef<HTMLDivElement>(null);

  useEffect(() => { 
    setMounted(true); 
    useCartStore.getState().syncCart();
  }, [session]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (accountRef.current && !accountRef.current.contains(e.target as Node)) {
        setShowAccount(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query.trim())}`);
      setSearchOpen(false);
    }
  };

  return (
    <>
      <header
        className={`sticky top-0 z-40 bg-white transition-all duration-220 ${
          scrolled ? 'shadow-[0_2px_16px_-4px_rgba(23,23,23,0.06)]' : 'border-b border-[#E3E1DD]/60'
        }`}
      >
        <div className="max-w-[1280px] mx-auto px-6 h-16 flex items-center justify-between">
          
          {/* ── Left: Logo ────────────────────────────────────────── */}
          <Link
            href="/"
            className="flex-shrink-0 flex items-center group w-40"
            aria-label="PEHNO Home"
          >
            <span
              className="text-2xl font-bold tracking-tight text-[#171717] group-hover:text-[#E67661] transition-colors"
             
            >
              PEHNO
            </span>
          </Link>

          {/* ── Middle: Navigation Links (Desktop) ───────────────── */}
          <nav className="hidden lg:flex flex-1 justify-center items-stretch gap-8 px-4 static">
            {/* Hand-pick the 4 most shopped departments */}
            {['clothing-fashion', 'home-kitchen', 'electronics', 'health-personalcare']
              .map(slug => DEPARTMENTS.find(d => d.slug === slug))
              .filter(Boolean)
              .map((dept) => {
              if (!dept) return null;
              // Add spaces around & and separate camelCase if needed for long Amazon categories
              const cleanName = dept!.shortName.replace(/&/g, ' & ').replace(/([a-z])([A-Z])/g, '$1 $2');
              
              // Chunk subcategories into columns of 8
              const columns: typeof dept.subcategories[] = [];
              for (let i = 0; i < dept!.subcategories.length; i += 8) {
                columns.push(dept!.subcategories.slice(i, i + 8));
              }

              return (
                <div key={dept.id} className="group relative flex items-center h-full">
                  <Link
                    href={`/${dept.slug}`}
                    className="text-sm font-bold text-[#171717] group-hover:text-[#E67661] transition-colors whitespace-nowrap py-5 border-b-2 border-transparent group-hover:border-[#E67661]"
                    title={cleanName}
                  >
                    {cleanName}
                  </Link>

                  {/* Compact Mega Menu Dropdown */}
                  <div className="absolute top-full left-0 bg-white border border-[#E3E1DD] shadow-[0_16px_40px_-12px_rgba(0,0,0,0.15)] hidden group-hover:block transition-all duration-300 z-50 rounded-b-xl overflow-hidden mt-0">
                    <div className="p-6 w-max min-w-[240px]">
                      <div className="flex gap-10">
                        {columns.slice(0, 5).map((col, colIndex) => (
                          <div key={colIndex} className="flex-1">
                            {colIndex === 0 && (
                               <h3 className="text-xs font-bold text-[#E67661] mb-4 uppercase tracking-wider">{cleanName}</h3>
                            )}
                            {colIndex > 0 && (
                               <h3 className="text-xs font-bold text-transparent mb-4 select-none">Spacer</h3>
                            )}
                            <ul className="space-y-3">
                              {col.map(sub => {
                                const cleanSubName = sub.name.replace(/&/g, ' & ').replace(/([a-z])([A-Z])/g, '$1 $2');
                                return (
                                  <li key={sub.id}>
                                    <Link 
                                      href={`/${dept.slug}/${sub.slug}`} 
                                      className="text-sm text-[#4b5563] hover:text-[#171717] hover:font-bold transition-all inline-block hover:translate-x-1"
                                    >
                                      {cleanSubName}
                                    </Link>
                                  </li>
                                );
                              })}
                            </ul>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
            <div className="flex items-center h-full">
               <Link
                 href={`/departments`}
                 className="text-sm font-bold text-[#171717] hover:text-[#E67661] transition-colors whitespace-nowrap py-5 border-b-2 border-transparent hover:border-[#E67661]"
               >
                 All Departments
               </Link>
            </div>
          </nav>

          {/* ── Right: Icons & Actions ───────────────────────────── */}
          <div className="flex items-center gap-4 justify-end w-40 lg:w-auto">
            
            {/* Search Icon */}
            <div className="relative">
              {searchOpen ? (
                <div className="absolute right-0 top-full mt-5 z-50">
                  <form onSubmit={handleSearch} className="flex items-center bg-white rounded-lg px-2 w-[300px] shadow-[0_16px_40px_-12px_rgba(0,0,0,0.15)] border border-[#E3E1DD] h-12">
                    <input
                      type="text"
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      placeholder="Search for products, brands and more"
                      autoFocus
                      onBlur={() => setTimeout(() => setSearchOpen(false), 200)}
                      className="flex-1 bg-transparent border-none text-[13px] h-10 pl-3 focus:outline-none text-[#171717]"
                    />
                    <button type="submit" className="p-1.5 text-[#171717] hover:text-[#E67661]">
                      <Search className="w-4 h-4" />
                    </button>
                  </form>
                  {/* Search Suggestions Dropdown */}
                  {query.length > 0 && (
                    <div className="absolute top-full left-0 w-full bg-white border border-t-0 border-[#E3E1DD] shadow-lg py-2 rounded-b-lg overflow-hidden">
                      <div className="px-4 py-1.5 text-[11px] font-bold text-[#6B7280] bg-[#f3f4f6]">All Others</div>
                      <div className="max-h-64 overflow-y-auto custom-scrollbar">
                        {suggestions.length === 0 ? (
                          <div className="px-4 py-2.5 text-[13px] text-[#4b5563]">No matches found</div>
                        ) : (
                          suggestions.map((suggestion, idx) => (
                            <div 
                              key={idx} 
                              onMouseDown={() => { setQuery(suggestion); router.push(`/search?q=${suggestion}`); }}
                              className="px-4 py-2.5 text-[13px] text-[#4b5563] hover:bg-[#F9F6F1] cursor-pointer transition-colors truncate"
                            >
                              {suggestion}
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setSearchOpen(true)}
                  className="text-[#171717] hover:text-[#E67661] transition-colors"
                >
                  <Search className="w-5 h-5 stroke-[1.5]" />
                </button>
              )}
            </div>


            {/* Wishlist */}
            <Link
              href="/account/wishlist"
              className="text-[#171717] hover:text-[#E67661] transition-colors"
            >
              <Heart className="w-5 h-5 stroke-[1.5]" />
            </Link>

            {/* Account */}
            <div className="relative" ref={accountRef}>
              <button
                type="button"
                onClick={() => setShowAccount((v) => !v)}
                className="flex items-center gap-1 text-[#171717] hover:text-[#E67661] transition-colors"
              >
                {session?.user ? (
                  <div className="w-7 h-7 rounded-full bg-[#E67661] flex items-center justify-center text-white text-xs font-bold shadow-sm">
                    {session.user.name?.charAt(0).toUpperCase() ?? 'U'}
                  </div>
                ) : (
                  <User className="w-5 h-5 stroke-[1.5]" />
                )}
              </button>

              {/* Account Dropdown */}
              {showAccount && (
                <div className="absolute right-0 top-full mt-3 w-72 bg-white border border-[#E3E1DD] shadow-[0_16px_40px_-12px_rgba(0,0,0,0.1)] z-50 overflow-hidden">
                  {!session?.user ? (
                    <>
                      <div className="p-5">
                        <h3 className="font-bold text-[#171717] text-sm mb-1">Welcome</h3>
                        <p className="text-xs text-[#6B7280] mb-4">To access account and manage orders</p>
                        <Link
                          href="/login"
                          onClick={() => setShowAccount(false)}
                          className="inline-block px-5 py-2 border border-[#E67661] text-[#E67661] font-bold text-sm hover:bg-[#FFF0ED] transition-colors"
                        >
                          LOGIN / SIGNUP
                        </Link>
                      </div>
                      <div className="border-t border-[#E3E1DD]/60"></div>
                      <nav className="py-2">
                        {[
                          { href: '/account/orders', label: 'Orders' },
                          { href: '/account/wishlist', label: 'Wishlist' },
                          { href: '/account/gift-cards', label: 'Gift Cards' },
                          { href: '/contact', label: 'Contact Us' },
                          { href: '/insider', label: 'PEHNO Insider', isNew: true },
                        ].map(({ href, label, isNew }) => (
                          <Link
                            key={href}
                            href={href}
                            onClick={() => setShowAccount(false)}
                            className="flex items-center gap-2 px-5 py-2 text-sm text-[#4b5563] hover:font-bold transition-all"
                          >
                            {label}
                            {isNew && <span className="bg-[#E67661] text-white text-[10px] font-bold px-1.5 py-0.5 rounded-sm">New</span>}
                          </Link>
                        ))}
                      </nav>
                      <div className="border-t border-[#E3E1DD]/60"></div>
                      <nav className="py-2">
                        {[
                          { href: '/account/credit', label: 'PEHNO Credit' },
                          { href: '/account/coupons', label: 'Coupons' },
                          { href: '/account/cards', label: 'Saved Cards' },
                          { href: '/account/vpa', label: 'Saved VPA' },
                          { href: '/account/addresses', label: 'Saved Addresses' },
                        ].map(({ href, label }) => (
                          <Link
                            key={href}
                            href={href}
                            onClick={() => setShowAccount(false)}
                            className="block px-5 py-2 text-sm text-[#4b5563] hover:font-bold transition-all"
                          >
                            {label}
                          </Link>
                        ))}
                      </nav>
                    </>
                  ) : (
                    <>
                      <div className="px-5 py-4 border-b border-[#E3E1DD]/60 bg-[#F9F6F1]/50">
                        <p className="font-semibold text-sm text-[#171717] truncate">{session.user.name}</p>
                        <p className="text-xs text-[#6B7280] truncate mt-0.5">{session.user.email}</p>
                      </div>
                      <nav className="py-2">
                        {[
                          { href: '/account', icon: User, label: 'Your Profile' },
                          { href: '/account/orders', icon: Package, label: 'Orders & Returns' },
                          { href: '/account/reviews', icon: Star, label: 'Your Reviews' },
                          { href: '/account/security', icon: Settings, label: 'Settings' },
                        ].map(({ href, icon: Icon, label }) => (
                          <Link
                            key={href}
                            href={href}
                            onClick={() => setShowAccount(false)}
                            className="flex items-center gap-3 px-5 py-2.5 text-sm font-medium text-[#171717] hover:bg-[#FFF0ED] hover:text-[#E67661] transition-colors"
                          >
                            <Icon className="w-4 h-4 opacity-70" />
                            {label}
                          </Link>
                        ))}
                      </nav>
                      <div className="border-t border-[#E3E1DD]/60 p-2">
                        <button
                          onClick={async () => {
                            await signOut();
                            setShowAccount(false);
                            router.push('/');
                            router.refresh();
                          }}
                          className="flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-[#C2413A] hover:bg-[rgba(194,65,58,0.06)] rounded-lg w-full transition-colors"
                        >
                          <LogOut className="w-4 h-4 opacity-70" />
                          Sign out
                        </button>
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>

            {/* Cart */}
            <Link
              href="/cart"
              className="relative text-[#171717] hover:text-[#E67661] transition-colors"
            >
              <ShoppingBag className="w-5 h-5 stroke-[1.5]" />
              {mounted && totalItems > 0 && (
                <span className="absolute -top-1.5 -right-2 bg-[#E67661] text-white text-[10px] font-bold rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1 border-2 border-white leading-none">
                  {totalItems}
                </span>
              )}
            </Link>

            {/* Mobile menu button */}
            <button
              type="button"
              onClick={() => setNavOpen(true)}
              className="lg:hidden text-[#171717] hover:text-[#E67661]"
            >
              <Menu className="w-5 h-5 stroke-[1.5]" />
            </button>
            
          </div>
        </div>
      </header>

      {/* Drawers */}
      <MobileNavDrawer isOpen={navOpen} onClose={() => setNavOpen(false)} />
    </>
  );
}
