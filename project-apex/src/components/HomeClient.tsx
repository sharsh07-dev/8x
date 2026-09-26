'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Sparkles, ArrowRight, Home, Shirt, Briefcase, Camera, Heart, Zap, Play, Image as ImageIcon, Search, Mic, ShoppingBag
} from 'lucide-react';
import { useSession } from '@/lib/auth-client';
import ProductCard from '@/components/ProductCard';
import InspiredByHistory from '@/components/InspiredByHistory';

// ── Quick action icons matching PEHNO ────────────────────────
const QUICK_ACTIONS = [
  { label: 'Try-On', icon: Camera, href: '/try-on', bg: 'bg-[#FFF0ED]' },
  { label: 'Shop by Occasion', icon: Home, href: '/departments', bg: 'bg-[#FFF0ED]' },
  { label: 'Build an Outfit', icon: Shirt, href: '/outfit-builder', bg: 'bg-[#FFF0ED]' },
  { label: 'My Wardrobe', icon: Briefcase, href: '/wardrobe', bg: 'bg-[#FFF0ED]' },
  { label: 'Trending', icon: Zap, href: '/trending', bg: 'bg-[#FFF0ED]' },
  { label: 'Offers', icon: Heart, href: '/todays-deals', bg: 'bg-[#FFF0ED]' },
];

// ── Occasion cards ────────────────────────────────────────────────
const OCCASIONS = [
  { label: 'College', img: '/college.jpg', href: '/search?q=college' },
  { label: 'Office', img: '/office.webp', href: '/search?q=office' },
  { label: 'Wedding', img: '/wedding.webp', href: '/search?q=wedding' },
  { label: 'Vacation', img: '/vacation.webp', href: '/search?q=vacation' },
  { label: 'Festive', img: '/festive.avif', href: '/search?q=festive' },
  { label: 'Date Night', img: '/datenight.webp', href: '/search?q=date' },
];

// ── Quad deal cards ──────────────────────────────────────────────
const QUAD_CARDS = [
  {
    "title": "Trending in Fashion",
    "link": "/departments/apparel",
    "items": [
      {
        "img": "https://m.media-amazon.com/images/I/41d84o5-M-L._SY445_SX342_QL70_FMwebp_.jpg",
        "label": "Streetwear",
        "badge": "Min 40% Off"
      },
      {
        "img": "https://m.media-amazon.com/images/I/31J6qGhAL9L._SX300_SY300_QL70_FMwebp_.jpg",
        "label": "Workwear",
        "badge": "Hot"
      },
      {
        "img": "https://m.media-amazon.com/images/I/216Q4FqmZVL._SX300_SY300_QL70_FMwebp_.jpg",
        "label": "Evening",
        "badge": ""
      },
      {
        "img": "https://assets.myntassets.com/f_webp,dpr_1.0,q_60,w_210,c_limit,fl_progressive/assets/images/22895374/2023/4/26/786a2c40-aa45-4a49-adf1-0eb031f482631682533534063Sarees1.jpg",
        "label": "Ethnic Wear",
        "badge": "Up to 50% Off"
      }
    ]
  },
  {
    "title": "Elevate Your Home",
    "link": "/departments/home-kitchen",
    "items": [
      {
        "img": "https://m.media-amazon.com/images/I/41CF6GtnpKL._SX300_SY300_QL70_FMwebp_.jpg",
        "label": "Kitchenware",
        "badge": "Starting ₹299"
      },
      {
        "img": "https://m.media-amazon.com/images/I/41p+lllC3HL._SY300_SX300_.jpg",
        "label": "Living Room",
        "badge": ""
      },
      {
        "img": "https://m.media-amazon.com/images/I/41Bh7qwDUmL._SY445_SX342_QL70_FMwebp_.jpg",
        "label": "Home Decor",
        "badge": ""
      },
      {
        "img": "https://m.media-amazon.com/images/I/41hCikFvL7L._SY300_SX300_QL70_FMwebp_.jpg",
        "label": "Lighting",
        "badge": "Bestsellers"
      }
    ]
  },
  {
    "title": "Tech & Accessories",
    "link": "/departments/computers",
    "items": [
      {
        "img": "https://m.media-amazon.com/images/I/31x3IUfMneL._SX300_SY300_QL70_FMwebp_.jpg",
        "label": "Accessories",
        "badge": "Top Rated"
      },
      {
        "img": "https://m.media-amazon.com/images/I/319bv0gNOeL._SX300_SY300_QL70_FMwebp_.jpg",
        "label": "Smartwatches",
        "badge": ""
      },
      {
        "img": "https://m.media-amazon.com/images/I/31Wb+A3VVdL._SY300_SX300_.jpg",
        "label": "Laptops",
        "badge": "Under ₹499"
      },
      {
        "img": "https://m.media-amazon.com/images/I/51UUmio53PL._SX300_SY300_QL70_FMwebp_.jpg",
        "label": "Gadgets",
        "badge": ""
      }
    ]
  },
  {
    "title": "Beauty & Grooming",
    "link": "/departments/beauty",
    "items": [
      {
        "img": "https://assets.myntassets.com/f_webp,dpr_1.0,q_60,w_210,c_limit,fl_progressive/assets/images/22442022/2023/4/28/7fe0365b-d40a-45fa-a293-285ef72abe371682678608810-Ponds-Bright-Beauty-Foaming-Pump-Face-Wash-with-Vitamin-B3---1.jpg",
        "label": "Skincare",
        "badge": "New"
      },
      {
        "img": "https://m.media-amazon.com/images/I/412CjF5u2iL._SX300_SY300_QL70_FMwebp_.jpg",
        "label": "Makeup",
        "badge": ""
      },
      {
        "img": "https://assets.myntassets.com/f_webp,dpr_1.0,q_60,w_210,c_limit,fl_progressive/assets/images/17950932/2022/5/16/b62dbee3-29a8-4cea-b6e8-6c9f2f717f3f1652680600364-NIVEA-Women-Pearl--Beauty-Radiance-Deodorant-Roll-On---50ml--1.jpg",
        "label": "Fragrances",
        "badge": "Min 30% Off"
      },
      {
        "img": "https://assets.myntassets.com/f_webp,dpr_1.0,q_60,w_210,c_limit,fl_progressive/assets/images/10621894/2023/1/17/211ce05e-b601-4920-9b15-4e233055950b1673936869531-KAMA-AYURVEDA-Sustainable-Kumkumadi-Miraculous-Beauty-Fluid--1.jpg",
        "label": "Haircare",
        "badge": ""
      }
    ]
  },
  {
    "title": "Steal Deals: All Under ₹499",
    "link": "/search?q=under-499",
    "items": [
      {
        "img": "https://m.media-amazon.com/images/I/41+mgWz7knL._SX300_SY300_.jpg",
        "label": "Under ₹99",
        "badge": "Free Del."
      },
      {
        "img": "https://m.media-amazon.com/images/I/41M9BBMSUdL._SX300_SY300_QL70_FMwebp_.jpg",
        "label": "Under ₹199",
        "badge": ""
      },
      {
        "img": "https://m.media-amazon.com/images/I/21rxGo3S7FL._SY445_SX342_QL70_FMwebp_.jpg",
        "label": "Under ₹299",
        "badge": ""
      },
      {
        "img": "https://m.media-amazon.com/images/I/41P2TNMG-hL._SY300_SX300_QL70_FMwebp_.jpg",
        "label": "Under ₹499",
        "badge": "Hot"
      }
    ]
  },
  {
    "title": "Big Savings For You",
    "link": "/search?q=sale",
    "items": [
      {
        "img": "https://m.media-amazon.com/images/I/31kw1RgU5yL._SX300_SY300_QL70_FMwebp_.jpg",
        "label": "Audio",
        "badge": "75% Off"
      },
      {
        "img": "https://m.media-amazon.com/images/I/41jxZkzNcnL._SX300_SY300_QL70_FMwebp_.jpg",
        "label": "Peripherals",
        "badge": "50% Off"
      },
      {
        "img": "https://m.media-amazon.com/images/I/310WOJIrwjL._SX300_SY300_QL70_FMwebp_.jpg",
        "label": "Wearables",
        "badge": "40% Off"
      },
      {
        "img": "https://m.media-amazon.com/images/I/41gztmbiIgL._SX300_SY300_QL70_FMwebp_.jpg",
        "label": "Gadgets",
        "badge": "Sale"
      }
    ]
  },
  {
    "title": "Household Needs",
    "link": "/departments/home-kitchen",
    "items": [
      {
        "img": "https://m.media-amazon.com/images/I/419vF7uEFEL._SX300_SY300_QL70_FMwebp_.jpg",
        "label": "Cleaning",
        "badge": "Up to 60%"
      },
      {
        "img": "https://m.media-amazon.com/images/I/41iEc0hf6TL._SX300_SY300_QL70_ML2_.jpg",
        "label": "Storage",
        "badge": ""
      },
      {
        "img": "https://m.media-amazon.com/images/I/51oN+8Zs5YL._SY300_SX300_.jpg",
        "label": "Decor",
        "badge": ""
      },
      {
        "img": "https://m.media-amazon.com/images/I/418GxB04szL._SY300_SX300_QL70_FMwebp_.jpg",
        "label": "Dining",
        "badge": "New"
      }
    ]
  },
  {
    "title": "Latest Launches",
    "link": "/search?q=new",
    "items": [
      {
        "img": "https://m.media-amazon.com/images/I/41+BBk2fGcL._SX342_SY445_.jpg",
        "label": "Laptops",
        "badge": "Just In"
      },
      {
        "img": "https://m.media-amazon.com/images/I/315GdnF+LcL._SY300_SX300_.jpg",
        "label": "Apparel",
        "badge": ""
      },
      {
        "img": "https://m.media-amazon.com/images/I/512YHGuR4RL._SX300_SY300_QL70_FMwebp_.jpg",
        "label": "Beauty",
        "badge": "Trending"
      },
      {
        "img": "https://m.media-amazon.com/images/I/41Tz1YnJkoL._SY300_SX300_QL70_FMwebp_.jpg",
        "label": "Footwear",
        "badge": ""
      }
    ]
  },
  {
    "title": "Gaming Zone",
    "link": "/departments/computers",
    "items": [
      {
        "img": "https://m.media-amazon.com/images/I/41EnFjIAoaL._SX300_SY300_QL70_ML2_.jpg",
        "label": "Consoles",
        "badge": "Extra ₹50 CB"
      },
      {
        "img": "https://m.media-amazon.com/images/I/41PNVbmQdfL._SX300_SY300_QL70_ML2_.jpg",
        "label": "Laptops",
        "badge": ""
      },
      {
        "img": "https://m.media-amazon.com/images/I/31GUbeFG3FL._SX300_SY300_QL70_FMwebp_.jpg",
        "label": "Headsets",
        "badge": ""
      },
      {
        "img": "https://m.media-amazon.com/images/I/314g1W9h2rL._SX300_SY300_QL70_FMwebp_.jpg",
        "label": "Accessories",
        "badge": "Lowest"
      }
    ]
  },
  {
    "title": "PEHNO Business",
    "link": "/about",
    "items": [
      {
        "img": "https://m.media-amazon.com/images/I/31iE517+NFL._SY300_SX300_.jpg",
        "label": "Office Wear",
        "badge": "Bulk Pricing"
      },
      {
        "img": "https://m.media-amazon.com/images/I/31-q0xhaTAL._SY445_SX342_QL70_FMwebp_.jpg",
        "label": "Tech",
        "badge": "10% Cashback"
      },
      {
        "img": "https://m.media-amazon.com/images/I/41J7JQ+P7WL._SX300_SY300_.jpg",
        "label": "Furniture",
        "badge": ""
      },
      {
        "img": "https://m.media-amazon.com/images/I/41eJqkFjCRL._SY300_SX300_QL70_FMwebp_.jpg",
        "label": "Supplies",
        "badge": "Wholesale"
      }
    ]
  },
  {
    "title": "Starting at ₹129",
    "link": "/search?q=essentials",
    "items": [
      {
        "img": "https://m.media-amazon.com/images/I/317cwpkk1-L._SX300_SY300_QL70_FMwebp_.jpg",
        "label": "Tees",
        "badge": "Sale Price"
      },
      {
        "img": "https://assets.myntassets.com/f_webp,dpr_1.0,q_60,w_210,c_limit,fl_progressive/assets/images/22959014/2023/4/29/97cde5ef-3d34-4bd0-805d-c9765c99aadc1682763243962BRINNSWomenTealShorts1.jpg",
        "label": "Shorts",
        "badge": ""
      },
      {
        "img": "https://assets.myntassets.com/f_webp,dpr_1.0,q_60,w_210,c_limit,fl_progressive/assets/images/22883760/2023/4/25/9a9ef8f1-63bf-42f7-84dc-39d3b06a07721682368842319BalenziaLowcutGymsocksforWomen-2PairPackBlackWhite1.jpg",
        "label": "Socks",
        "badge": ""
      },
      {
        "img": "https://m.media-amazon.com/images/I/41Cdc4mU7RL._SX300_SY300_QL70_FMwebp_.jpg",
        "label": "Accessories",
        "badge": "Live"
      }
    ]
  },
  {
    "title": "Deals You Might Like",
    "link": "/search?mode=ai",
    "items": [
      {
        "img": "https://m.media-amazon.com/images/I/31yHKPd+rsL._SY300_SX300_.jpg",
        "label": "Party Wear",
        "badge": "AI Pick"
      },
      {
        "img": "https://m.media-amazon.com/images/I/4173mQ7F-mL._SX300_SY300_QL70_FMwebp_.jpg",
        "label": "Ethnic",
        "badge": ""
      },
      {
        "img": "https://m.media-amazon.com/images/I/41iec5VPMlL._SX300_SY300_QL70_ML2_.jpg",
        "label": "Perfumes",
        "badge": ""
      },
      {
        "img": "https://m.media-amazon.com/images/I/417k0DCw0GL._SX300_SY300_QL70_ML2_.jpg",
        "label": "Jewelry",
        "badge": "20% Off"
      }
    ]
  },
  {
    "title": "Up to 80% Off on Home",
    "link": "/departments/home-kitchen",
    "items": [
      {
        "img": "https://m.media-amazon.com/images/I/41BnHjRP0ZS._SX300_SY300_QL70_ML2_.jpg",
        "label": "Furnishings",
        "badge": "80% Off"
      },
      {
        "img": "https://m.media-amazon.com/images/I/41iEZV6nKbL._SX300_SY300_QL70_ML2_.jpg",
        "label": "Cookware",
        "badge": ""
      },
      {
        "img": "https://m.media-amazon.com/images/I/41qLZhKF5ZL._SX300_SY300_QL70_ML2_.jpg",
        "label": "Storage",
        "badge": "Clearance"
      },
      {
        "img": "https://m.media-amazon.com/images/I/41iHN9Y07cS._SX300_SY300_QL70_ML2_.jpg",
        "label": "Lighting",
        "badge": ""
      }
    ]
  },
  {
    "title": "Smart Devices",
    "link": "/departments/computers",
    "items": [
      {
        "img": "https://m.media-amazon.com/images/I/31XO-wfGGGL._SX300_SY300_QL70_FMwebp_.jpg",
        "label": "Smart Watches",
        "badge": "Save Big"
      },
      {
        "img": "https://m.media-amazon.com/images/I/41gikeSuhAL._SY300_SX300_QL70_FMwebp_.jpg",
        "label": "Smart Audio",
        "badge": ""
      },
      {
        "img": "https://m.media-amazon.com/images/I/41gFqSHngyL._SX300_SY300_QL70_FMwebp_.jpg",
        "label": "Smart Trackers",
        "badge": ""
      },
      {
        "img": "https://m.media-amazon.com/images/I/51ow6bmLWIL._SY300_SX300_QL70_FMwebp_.jpg",
        "label": "Smart Home",
        "badge": "Deals"
      }
    ]
  },
  {
    "title": "Lowest Prices of the Year",
    "link": "/todays-deals",
    "items": [
      {
        "img": "https://m.media-amazon.com/images/I/41pdZIhY+gL._SY300_SX300_.jpg",
        "label": "Fashion",
        "badge": "Starts ₹99"
      },
      {
        "img": "https://m.media-amazon.com/images/I/31mgo4D-kPL._SX300_SY300_QL70_FMwebp_.jpg",
        "label": "Work",
        "badge": "Starts ₹199"
      },
      {
        "img": "https://m.media-amazon.com/images/I/41bCxnHksnL._SY300_SX300_QL70_FMwebp_.jpg",
        "label": "Tech",
        "badge": "Starts ₹299"
      },
      {
        "img": "https://m.media-amazon.com/images/I/317OoQfs1gL._SX300_SY300_QL70_FMwebp_.jpg",
        "label": "Home",
        "badge": "Starts ₹399"
      }
    ]
  },
  {
    "title": "Curated by Creators",
    "link": "/search?q=creators",
    "items": [
      {
        "img": "https://m.media-amazon.com/images/I/415CYtympZL._SX300_SY300_QL70_FMwebp_.jpg",
        "label": "Street Style",
        "badge": "Exclusive"
      },
      {
        "img": "https://m.media-amazon.com/images/I/51FicDnawaL._SY300_SX300_QL70_FMwebp_.jpg",
        "label": "Resort",
        "badge": ""
      },
      {
        "img": "https://assets.myntassets.com/f_webp,dpr_1.0,q_60,w_210,c_limit,fl_progressive/assets/images/20678602/2022/12/9/6171718f-6e78-464d-bf7c-6ffac80ceb081670563477570-VEGA-All-Glam-4-in-1-Hair-Styler-VHSCC-05---Gold--Black-2401-1.jpg",
        "label": "Glam",
        "badge": ""
      },
      {
        "img": "https://assets.myntassets.com/f_webp,dpr_1.0,q_60,w_210,c_limit,fl_progressive/assets/images/22602944/2023/4/19/7f5a3198-beb8-418d-8933-8fb5132d88a51681886239704InfusionUnisexTrainingShoes1.jpg",
        "label": "Fusion",
        "badge": "Collab"
      }
    ]
  }
];

const SEARCH_HINTS = [
  'Black dress for a wedding under ₹3000',
  'Casual outfits for college',
  'Summer tops',
  'Ethnic wear for festival'
];

export default function HomeClient({ products }: { products: any[] }) {
  const { data: session } = useSession();
  const [searchQuery, setSearchQuery] = useState('');
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      window.location.href = `/search?q=${encodeURIComponent(searchQuery.trim())}`;
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* ══ COUPON BANNER ════════════════════════════════════════ */}
      <section className="max-w-[1280px] mx-auto px-6 pt-6">
        <Link href="/todays-deals" className="w-full relative flex items-stretch bg-gradient-to-r from-[#FF9A85] to-[#E67661] rounded-2xl overflow-hidden shadow-[0_4px_20px_-4px_rgba(230,118,97,0.3)] h-24 md:h-32 group block">
          
          {/* Left Side */}
          <div className="flex-[3] md:flex-[4] flex items-center justify-center p-4 relative overflow-hidden">
            {/* Subtle background pattern/glow */}
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
            <h2 className="text-white text-4xl md:text-[56px] font-black tracking-tight drop-shadow-md relative z-10">
              FLAT ₹300 OFF
            </h2>
          </div>

          {/* Perforated Divider */}
          <div className="relative w-0 h-full border-r-[3px] border-dashed border-white/50 z-20 flex flex-col justify-between shadow-[1px_0_0_rgba(0,0,0,0.05)]">
            {/* Top hole */}
            <div className="absolute top-0 right-0 translate-x-[50%] -translate-y-1/2 w-6 h-6 md:w-8 md:h-8 bg-white rounded-full shadow-inner"></div>
            {/* Bottom hole */}
            <div className="absolute bottom-0 right-0 translate-x-[50%] translate-y-1/2 w-6 h-6 md:w-8 md:h-8 bg-white rounded-full shadow-inner"></div>
          </div>

          {/* Right Side */}
          <div className="flex-[2] md:flex-[3] flex flex-col items-center justify-center p-4 relative overflow-hidden bg-black/5">
            <div className="absolute right-[-10%] bottom-[-20%] opacity-15 group-hover:scale-110 group-hover:opacity-20 transition-all duration-500">
               <Zap className="w-32 h-32 md:w-40 md:h-40 text-white" />
            </div>
            <div className="relative z-10 flex flex-col items-center text-center">
              <span className="text-white/90 text-sm md:text-xl font-medium mb-1 drop-shadow-sm">On Your 1st Purchase</span>
              <div className="flex items-center gap-2">
                <span className="text-white text-lg md:text-[28px] font-bold tracking-tight drop-shadow-sm">Via Pehno App!</span>
              </div>
            </div>
          </div>
        </Link>
      </section>
      {/* ══ PEHNO HERO ══════════════════════════════════════════════ */}
      <section className="relative w-full max-w-[1280px] mx-auto px-6 py-6" aria-label="Hero">
        <div className="flex flex-col lg:flex-row gap-4">
          
          {/* Left: 3 Offer Banners */}
          <div className="w-full lg:w-[32%] flex flex-col gap-4">
            
            {/* Offer 1 */}
            <Link href="/todays-deals" className="flex-1 rounded-3xl bg-gradient-to-br from-[#FFECD2] to-[#FCB69F] p-6 relative overflow-hidden group cursor-pointer flex flex-col justify-center block">
              <div className="relative z-10">
                <h3 className="text-[22px] font-bold text-[#171717] leading-tight mb-1">Mega Bundle</h3>
                <p className="text-xl font-black text-[#E67661] mb-2">Buy 3 Get 4th FREE!</p>
                <p className="text-[11px] text-[#171717]/80 mb-4 max-w-[80%]">Mix & match across all categories. Limited time only.</p>
                <span className="bg-white text-[#171717] text-[11px] font-bold px-4 py-2 rounded-full flex items-center gap-1 group-hover:bg-[#171717] group-hover:text-white transition-colors w-fit shadow-sm">
                  Shop Now <ArrowRight className="w-3 h-3" />
                </span>
              </div>
              <div className="absolute -right-4 -bottom-4 opacity-20 group-hover:opacity-40 transition-opacity">
                <ShoppingBag className="w-32 h-32 text-[#E67661]" />
              </div>
            </Link>

            {/* Offer 2 */}
            <Link href="/search?q=new" className="flex-1 rounded-3xl bg-gradient-to-br from-[#F3E7E9] to-[#E3EEFF] p-6 relative overflow-hidden group cursor-pointer flex flex-col justify-center block">
              <div className="relative z-10">
                <h3 className="text-[22px] font-bold text-[#171717] leading-tight mb-1">New Arrivals</h3>
                <p className="text-xl font-black text-[#6B4CE6] mb-2">Flat 50% OFF</p>
                <p className="text-[11px] text-[#171717]/80 mb-4 max-w-[80%]">Elevate your wardrobe with premium styles & sets.</p>
                <span className="bg-[#171717] text-white text-[11px] font-bold px-4 py-2 rounded-full flex items-center gap-1 group-hover:bg-[#E67661] transition-colors w-fit shadow-sm">
                  Explore Now <ArrowRight className="w-3 h-3" />
                </span>
              </div>
              <div className="absolute -right-2 -bottom-2 opacity-10 group-hover:opacity-20 transition-opacity">
                <Heart className="w-28 h-28 text-[#6B4CE6]" />
              </div>
            </Link>

            {/* Offer 3 */}
            <Link href="/departments" className="flex-1 rounded-3xl bg-[#F9F6F1] border border-[#E3E1DD] p-6 relative overflow-hidden group cursor-pointer flex flex-col justify-center block">
              <div className="relative z-10">
                <h3 className="text-[22px] font-bold text-[#171717] leading-tight mb-1">Top Brands</h3>
                <p className="text-xl font-black text-[#171717] mb-2">Min. 40% OFF</p>
                <p className="text-[11px] text-[#171717]/80 mb-4 max-w-[80%]">From everyday essentials to premium fashion picks.</p>
                <span className="bg-white border border-[#E3E1DD] text-[#171717] text-[11px] font-bold px-4 py-2 rounded-full flex items-center gap-1 group-hover:border-[#171717] transition-colors w-fit shadow-sm">
                  Shop Brands <ArrowRight className="w-3 h-3" />
                </span>
              </div>
              <div className="absolute -right-4 -bottom-4 opacity-10 group-hover:opacity-20 transition-opacity">
                <Zap className="w-28 h-28 text-[#171717]" />
              </div>
            </Link>
            
          </div>

          {/* Right: AI Search Block */}
          <div className="w-full lg:w-[68%] rounded-3xl bg-[#FFF9F5] overflow-hidden flex flex-col md:flex-row items-stretch relative min-h-[480px]">
            
            {/* Left content block */}
            <div className="flex-1 p-8 md:p-10 lg:p-12 flex flex-col justify-center relative z-10 w-full md:w-1/2">
              {/* Trending Items neatly displayed */}
              <div className="w-full max-w-md">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xl font-bold tracking-tight text-[#171717]">Trending Collections</span>
                  <Link href="/trending" className="text-sm font-medium text-[#E67661] hover:underline">View All</Link>
                </div>
                <div className="grid grid-cols-3 gap-x-4 gap-y-6 pt-2">
                  {[
                    { img: "https://images.unsplash.com/photo-1552374196-1ab2a1c593e8?w=300&q=80", label: "Streetwear", link: "/search?q=t-shirt" },
                    { img: "https://images.unsplash.com/photo-1487222477894-8943e31ef7b2?w=300&q=80", label: "Workwear", link: "/search?q=shirt" },
                    { img: "https://images.unsplash.com/photo-1566737236500-c8ac43014a67?w=300&q=80", label: "Evening", link: "/search?q=dress" },
                    { img: "https://assets.myntassets.com/f_webp,dpr_1.0,q_60,w_210,c_limit,fl_progressive/assets/images/22895374/2023/4/26/786a2c40-aa45-4a49-adf1-0eb031f482631682533534063Sarees1.jpg", label: "Ethnic", link: "/search?q=saree" },
                    { img: "https://images.unsplash.com/photo-1509319117193-57bab727e09d?w=300&q=80", label: "Accessories", link: "/search?q=watch" },
                    { img: "https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=300&q=80", label: "Beauty", link: "/search?q=beauty" }
                  ].map((item, idx) => (
                    <Link key={idx} href={item.link || `/search?q=${item.label.toLowerCase()}`} className="group flex flex-col items-center">
                      <div className="w-20 h-20 sm:w-24 sm:h-24 lg:w-[104px] lg:h-[104px] rounded-full overflow-hidden bg-white shadow-sm mb-3 border-4 border-transparent group-hover:border-[#E67661]/40 transition-all duration-300 relative shrink-0">
                        <img src={item.img} alt={item.label} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                        <div className="absolute inset-0 bg-[#E67661]/0 group-hover:bg-[#E67661]/10 transition-colors z-10 pointer-events-none"></div>
                      </div>
                      <span className="text-sm font-semibold text-[#171717] group-hover:text-[#E67661] transition-colors text-center tracking-tight">{item.label}</span>
                    </Link>
                  ))}
                </div>
              </div>
            </div>

            {/* Right image block */}
            <div className="w-full md:w-1/2 relative min-h-[250px] md:min-h-full hidden sm:block">
              {/* Soft blend gradient to make the edge seamless */}
              <div className="absolute inset-y-0 left-0 w-24 bg-gradient-to-r from-[#FFF9F5] via-[#FFF9F5]/90 to-transparent z-10 pointer-events-none"></div>
              <img 
                src="https://images.unsplash.com/photo-1529139574466-a303027c1d8b?w=1000&q=80" 
                alt="Fashion model" 
                className="absolute inset-0 w-full h-full object-cover object-center"
              />
            </div>
          </div>
        </div>
      </section>

      {/* ══ PEHNO STYLIST BANNER ════════════════════════════════════ */}
      <section className="max-w-[1280px] mx-auto px-6">
        <Link
          href="/stylist"
          className="w-full group flex items-center justify-between gap-4 px-7 py-5 rounded-2xl border border-[#E3E1DD] bg-[#F9F6F1] hover:border-[#E67661]/40 hover:bg-[#FFF5F3] transition-all duration-200 relative overflow-hidden"
          aria-label="Open PEHNO Stylist"
        >
          {/* Subtle coral left accent bar */}
          <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#E67661] rounded-l-2xl" />

          {/* Left: icon + text */}
          <div className="flex items-center gap-4 pl-3">
            {/* T-shirt SVG icon in coral */}
            <div className="w-12 h-12 rounded-xl bg-[#FFF0ED] border border-[#F6B7A3]/40 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
              <svg viewBox="0 0 24 24" className="w-6 h-6 fill-none stroke-[#E67661] stroke-[1.6]" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20.38 3.46 16 2a4 4 0 0 1-8 0L3.62 3.46a2 2 0 0 0-1.34 2.23l.58 3.57a1 1 0 0 0 .99.84H6v10a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V10h2.15a1 1 0 0 0 .99-.84l.58-3.57a2 2 0 0 0-1.34-2.23z" />
              </svg>
            </div>
            <div className="text-left">
              <div className="flex items-center gap-2">
                <span className="text-base font-bold text-[#171717] tracking-tight">Pehno Stylist</span>
                <span className="text-[10px] font-semibold bg-[#E67661] text-white px-2 py-0.5 rounded-full uppercase tracking-wide">AI</span>
              </div>
              <p className="text-[12px] text-[#6B7280] mt-0.5">
                Tell us your occasion — we'll build the perfect outfit from our store
              </p>
            </div>
          </div>

          {/* Right: CTA */}
          <div className="flex items-center gap-3 shrink-0">
            <span className="hidden sm:block text-[12px] font-medium text-[#E67661]">Try it free →</span>
            <div className="w-8 h-8 rounded-full border border-[#E3E1DD] bg-white group-hover:border-[#E67661] flex items-center justify-center transition-all duration-200">
              <ArrowRight className="w-3.5 h-3.5 text-[#6B7280] group-hover:text-[#E67661] transition-colors" />
            </div>
          </div>
        </Link>
      </section>

      <section className="max-w-[1280px] mx-auto px-6 py-8">
        <div className="flex flex-wrap justify-between md:justify-center md:gap-16 gap-6">
          {QUICK_ACTIONS.map((action) => (
            <Link key={action.label} href={action.href} className="flex flex-col items-center gap-3 group">
              <div className={`w-14 h-14 rounded-full ${action.bg} flex items-center justify-center text-[#E67661] group-hover:scale-105 transition-transform border border-[#F6B7A3]/20 shadow-sm`}>
                <action.icon className="w-6 h-6 stroke-[1.5]" />
              </div>
              <span className="text-[11px] font-medium text-[#171717] whitespace-nowrap">{action.label}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* ══ RECOMMENDATIONS ════════════════════════════════════════ */}
      <section className="max-w-[1280px] mx-auto px-6 py-12">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-xl font-semibold text-[#171717]">Recommended For You</h2>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-5">
          {products.slice(0, 10).map((product, idx) => (
            <ProductCard
              key={product.id}
              product={{
                id: product.id,
                title: product.title,
                price: product.price,
                originalPrice: product.compareAtPrice || product.originalPrice,
                rating: product.rating || 4,
                reviewCount: product.reviewCount || Math.floor(Math.abs(product.id.charCodeAt(0) * 10)),
                category: product.category?.name || product.subcategory?.name || 'Apparel',
                inStock: product.inStock !== false,
                stock: product.stock || 50,
                image: product.images?.[0]?.url || product.image || '/placeholder.jpg',
                isPrime: product.isPrime !== false,
                badge: idx === 0 ? 'Best Match' : undefined,
              }}
              showAiReason={idx < 4}
              aiReason="Great for college"
            />
          ))}
        </div>
      </section>

      {/* ══ SHOP BY OCCASION ════════════════════════════════════════ */}
      <section className="max-w-[1280px] mx-auto px-6 py-10">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-[#171717]">Shop by Occasion</h2>
          <Link href="/departments" className="text-xs font-semibold text-[#6B7280] hover:text-[#E67661] flex items-center gap-1">
            See all <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
          {OCCASIONS.map((occ) => (
            <Link key={occ.label} href={occ.href} className="group flex flex-col gap-3">
              <div className="aspect-[3/4] rounded-2xl overflow-hidden bg-[#F9F6F1]">
                <img 
                  src={occ.img} 
                  alt={occ.label} 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </div>
              <span className="text-sm font-medium text-[#171717] text-center">{occ.label}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* ══ QUAD CARDS (CATEGORIES & DEALS) ════════════════════════ */}
      <section className="max-w-[1280px] mx-auto px-6 py-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {QUAD_CARDS.map((card, idx) => (
            <div key={idx} className="bg-[#F9F6F1] rounded-3xl p-6 border border-[#E3E1DD] flex flex-col hover:border-[#E67661] transition-colors group">
              <div className="flex items-center justify-between mb-5">
                <h3 className="text-[17px] font-bold text-[#171717]">{card.title}</h3>
                <Link href={card.link} className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-[#171717] shadow-sm group-hover:bg-[#E67661] group-hover:text-white transition-colors">
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
              
              <div className="grid grid-cols-2 gap-3 flex-1">
                {card.items.map((item, i) => (
                  <Link key={i} href={card.link} className="flex flex-col gap-1.5 group/item">
                    <div className="relative aspect-square rounded-2xl overflow-hidden bg-white">
                      <img src={item.img} alt={item.label} className="w-full h-full object-cover group-hover/item:scale-105 transition-transform duration-500" />
                      {item.badge && (
                        <div className="absolute bottom-1.5 left-1.5 bg-[#E67661] text-white text-[9px] font-bold px-2 py-0.5 rounded-full z-10">
                          {item.badge}
                        </div>
                      )}
                    </div>
                    <span className="text-[11px] font-medium text-[#4b5563] group-hover/item:text-[#171717] transition-colors">{item.label}</span>
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ══ INSPIRED BY BROWSING HISTORY ════════════════════════════ */}
      <InspiredByHistory />

      {/* ══ FLOATING STYLIST BUTTON ════════════════════════════════ */}
      <Link
        href="/stylist"
        className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 pl-3 pr-4 py-3 rounded-full bg-white border border-[#E3E1DD] shadow-[0_4px_20px_-4px_rgba(23,23,23,0.14)] hover:border-[#E67661] hover:shadow-[0_8px_28px_-4px_rgba(230,118,97,0.25)] hover:scale-105 transition-all duration-200 group"
        aria-label="Open PEHNO Stylist"
      >
        {/* T-shirt icon circle */}
        <div className="w-8 h-8 rounded-full bg-[#FFF0ED] flex items-center justify-center shrink-0">
          <svg viewBox="0 0 24 24" className="w-4 h-4 fill-none stroke-[#E67661] stroke-[1.7]" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20.38 3.46 16 2a4 4 0 0 1-8 0L3.62 3.46a2 2 0 0 0-1.34 2.23l.58 3.57a1 1 0 0 0 .99.84H6v10a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V10h2.15a1 1 0 0 0 .99-.84l.58-3.57a2 2 0 0 0-1.34-2.23z" />
          </svg>
        </div>
        <span className="text-[13px] font-semibold text-[#171717] group-hover:text-[#E67661] transition-colors">Style me</span>
        {/* Live indicator */}
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#E67661] opacity-60"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-[#E67661]"></span>
        </span>
      </Link>
    </div>
  );
}
