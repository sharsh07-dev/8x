'use client';

import React, { useState } from 'react';

interface ProductGalleryProps {
  images: string[];
  title: string;
}

export default function ProductGallery({ images, title }: ProductGalleryProps) {
  const [selectedImage, setSelectedImage] = useState(images[0] || '');

  return (
    <div className="flex flex-col-reverse md:flex-row gap-4 items-start sticky top-24">
      {/* Thumbnails list */}
      <div className="flex md:flex-col gap-2.5 overflow-x-auto md:overflow-visible pb-2 md:pb-0 w-full md:w-16 shrink-0 select-none">
        {images.map((img, idx) => {
          const isSelected = selectedImage === img;
          return (
            <button
              key={idx}
              type="button"
              onClick={() => setSelectedImage(img)}
              onMouseEnter={() => setSelectedImage(img)}
              className={`w-14 h-14 rounded-md border-2 p-1 bg-white flex items-center justify-center transition-all cursor-pointer ${
                isSelected 
                  ? 'border-[#e77600] shadow-sm ring-2 ring-[#e77600]/30' 
                  : 'border-gray-200 hover:border-gray-400'
              }`}
              aria-label={`Select product image ${idx + 1}`}
            >
              <img
                src={img}
                alt={`${title} thumbnail ${idx + 1}`}
                className="w-full h-full object-contain mix-blend-multiply"
              />
            </button>
          );
        })}
      </div>

      {/* Main Image Display */}
      <div className="w-full bg-white rounded-lg border border-gray-200 p-6 flex items-center justify-center min-h-[380px] sm:min-h-[440px] md:min-h-[480px] relative overflow-hidden group">
        <img
          src={selectedImage}
          alt={title}
          className="w-full h-auto max-h-[420px] object-contain mix-blend-multiply group-hover:scale-105 transition-transform duration-300 select-none"
        />
        <span className="absolute bottom-3 right-3 text-[11px] text-gray-400 bg-gray-50 px-2 py-0.5 rounded border border-gray-200 opacity-80 pointer-events-none">
          Roll over image to zoom
        </span>
      </div>
    </div>
  );
}
