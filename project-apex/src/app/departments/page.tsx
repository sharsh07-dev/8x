import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { DEPARTMENTS } from '@/data/departments';
import { Crosshair } from 'lucide-react';

export const metadata = {
  title: 'All Departments - PEHNO',
  description: 'Explore our edgy, curated collections.',
};

export default function DepartmentsDirectoryPage() {
  return (
    <div className="bg-[#F9F6F1] min-h-screen pb-20 pt-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Simple Page Header */}
        <div className="mb-12">
           <h1 className="text-4xl md:text-5xl font-black text-[#171717] tracking-tighter uppercase">
             The Directory
           </h1>
           <p className="text-[#6B7280] text-sm mt-2 font-mono uppercase tracking-widest">
             // Select your aesthetic
           </p>
        </div>

        {/* ── EDGY Y2K GRID ──────────────────────────────────── */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-12">
          {DEPARTMENTS.map((dept) => {
            const fallbackImage = "https://images.unsplash.com/photo-1512436991641-6745cdb1723f?w=600&q=80";
            
            return (
              <Link 
                key={dept.id}
                href={`/${dept.slug}`} 
                className="block relative w-full aspect-[4/5] bg-[#29A0EA] rounded-2xl p-4 sm:p-6 overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 group"
              >
                {/* 1. Grid Background */}
                <div className="absolute inset-0" style={{ 
                  backgroundImage: 'linear-gradient(rgba(255,255,255,0.25) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.25) 1px, transparent 1px)', 
                  backgroundSize: '12% 12%' 
                }} />
                
                {/* 2. Crop Marks (White lines and nodes) */}
                <div className="absolute inset-5 sm:inset-8 border border-white/40 pointer-events-none z-0">
                   {/* Corners */}
                   <div className="absolute -top-1 -left-1 w-2 h-2 bg-white" />
                   <div className="absolute -top-1 -right-1 w-2 h-2 bg-white" />
                   <div className="absolute -bottom-1 -left-1 w-2 h-2 bg-white" />
                   <div className="absolute -bottom-1 -right-1 w-2 h-2 bg-white" />
                   {/* Midpoints */}
                   <div className="absolute top-1/2 -left-1 w-2 h-2 bg-white -translate-y-1/2" />
                   <div className="absolute top-1/2 -right-1 w-2 h-2 bg-white -translate-y-1/2" />
                </div>

                {/* 3. Main Content Container */}
                <div className="relative w-full h-full flex flex-col px-3 py-6 sm:px-6 sm:py-10 z-10">
                   
                   {/* Image Container with black borders */}
                   <div className="relative flex-1 w-full flex flex-col shadow-2xl transition-transform duration-500 group-hover:-translate-y-2">
                      
                      {/* Top Black Bar */}
                      <div className="bg-[#09090b] text-white px-3 py-2 flex justify-between items-center z-20">
                         <span className="font-mono text-[9px] sm:text-[10px] font-bold tracking-[0.2em] uppercase truncate pr-4">
                           {dept.bannerTagline || "MATCHING ENERGY. ALWAYS"}
                         </span>
                         <Crosshair className="w-4 h-4 text-white/80 shrink-0" />
                      </div>

                      {/* Main Image */}
                      <div className="relative flex-1 w-full bg-zinc-800 overflow-hidden">
                         <Image 
                           unoptimized={true}
                           src={dept.heroImage || fallbackImage} 
                           alt={dept.name} 
                           fill 
                           className="object-cover group-hover:scale-110 transition-transform duration-700 ease-out" 
                         />
                      </div>
                   </div>



                   {/* 5. Bottom Title Label */}
                   <div className="absolute -bottom-3 -left-3 sm:-bottom-4 sm:-left-4 max-w-[calc(100%+12px)] bg-white border-[3px] border-[#09090b] p-1 sm:p-2 z-30 shadow-[4px_4px_0_0_#09090b] group-hover:shadow-[6px_6px_0_0_#09090b] transition-shadow duration-300">
                      <div className="bg-[#09090b] text-white text-[8px] sm:text-[10px] font-mono px-2 py-0.5 flex justify-between items-center mb-1">
                         <span>pehno.com</span>
                         <span className="text-[8px]">x</span>
                      </div>
                      <h2 className="text-xl sm:text-2xl lg:text-3xl font-black uppercase tracking-tighter leading-none text-[#09090b] px-1 sm:px-2 py-1 font-sans break-words text-wrap">
                         {dept.shortName.replace(/&/g, ' & ').replace(/([a-z])([A-Z])/g, '$1 $2')}
                      </h2>
                   </div>
                </div>
              </Link>
            );
          })}
        </div>

      </div>
    </div>
  );
}
