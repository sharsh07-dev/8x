import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { DEPARTMENTS } from '@/data/departments';
import { Breadcrumbs } from '@/components/navigation/Breadcrumbs';
import { Layers, ArrowRight, Sparkles, ChevronRight } from 'lucide-react';

export const metadata = {
  title: 'All Shopping Departments - Project Apex',
  description: 'Explore the complete directory of shopping departments in Project Apex: Clothing, Electronics, Home, Beauty, Books, and Sports.',
};

export default function DepartmentsDirectoryPage() {
  return (
    <div className="bg-gray-50 min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Breadcrumbs items={[{ label: 'All Departments' }]} />

        {/* Directory Header Banner */}
        <div className="relative rounded-2xl overflow-hidden bg-slate-900 text-white p-8 md:p-12 mb-10 shadow-md">
          <div className="relative z-10 max-w-2xl">
            <div className="inline-flex items-center gap-1.5 bg-amber-400/20 text-amber-300 px-3 py-1 rounded-full text-xs font-bold mb-4 border border-amber-400/30">
              <Layers className="w-3.5 h-3.5" /> Department Directory
            </div>
            <h1 className="text-3xl sm:text-4xl font-black tracking-tight mb-3">
              Explore Every Department in Project Apex
            </h1>
            <p className="text-gray-300 text-sm md:text-base leading-relaxed mb-6">
              Browse curated fashion, high-performance electronics, living essentials, dermatologist skincare, and bestselling titles with instant Prime delivery.
            </p>
            <Link
              href="/todays-deals"
              className="inline-flex items-center gap-2 bg-amber-400 hover:bg-amber-500 text-slate-950 font-bold px-5 py-2.5 rounded-lg text-sm transition shadow-sm"
            >
              <Sparkles className="w-4 h-4 text-slate-900" />
              <span>Shop Today's Deals</span>
            </Link>
          </div>
          <div className="absolute right-0 top-0 bottom-0 w-1/3 opacity-20 hidden md:block">
            <div className="w-full h-full bg-gradient-to-l from-amber-500/30 to-transparent" />
          </div>
        </div>

        {/* Departments Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {DEPARTMENTS.map((dept) => (
            <div
              key={dept.id}
              className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow flex flex-col"
            >
              {/* Department Image & Title Banner */}
              <div className="relative h-48 w-full bg-gray-100 overflow-hidden group">
                <Image
                  src={dept.heroImage}
                  alt={dept.name}
                  fill
                  className="object-cover group-hover:scale-105 transition duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent flex flex-col justify-end p-5 text-white">
                  <h2 className="text-xl font-bold text-white tracking-tight">{dept.name}</h2>
                  <p className="text-xs text-amber-300 font-medium line-clamp-1 mt-0.5">
                    {dept.bannerTagline}
                  </p>
                </div>
              </div>

              {/* Subcategories Links */}
              <div className="p-6 flex-1 flex flex-col justify-between">
                <div>
                  <p className="text-xs text-gray-600 mb-4 line-clamp-2 leading-relaxed">
                    {dept.description}
                  </p>

                  <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wider mb-2">
                    Subcategories
                  </h3>
                  <div className="space-y-1.5 mb-6">
                    {dept.subcategories.map((sub) => (
                      <Link
                        key={sub.id}
                        href={`/${dept.slug}/${sub.slug}`}
                        className="flex items-center justify-between py-1.5 px-2 rounded hover:bg-gray-50 text-xs text-gray-700 hover:text-amber-700 font-medium transition"
                      >
                        <span>{sub.name}</span>
                        <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
                      </Link>
                    ))}
                  </div>
                </div>

                <Link
                  href={`/${dept.slug}`}
                  className="w-full py-2.5 bg-gray-50 hover:bg-amber-50 text-slate-900 hover:text-amber-800 border border-gray-200 hover:border-amber-300 text-xs font-bold rounded-lg transition flex items-center justify-center gap-1.5"
                >
                  <span>Explore All {dept.shortName}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
