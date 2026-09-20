import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { mockProducts } from '@/data/mockProducts';
import ProductGallery from '@/components/products/ProductGallery';
import ProductInfo from '@/components/products/ProductInfo';
import PurchaseSection from '@/components/products/PurchaseSection';
import RelatedProducts from '@/components/products/RelatedProducts';
import { HelpCircle, ArrowLeft } from 'lucide-react';

interface ProductPageProps {
  params: Promise<{
    id: string;
  }>;
}

export async function generateMetadata({ params }: ProductPageProps) {
  const { id } = await params;
  const product = mockProducts.find((p) => p.id === id);

  if (!product) {
    return {
      title: 'Page Not Found - Project Apex',
    };
  }

  return {
    title: `${product.title} - Project Apex`,
    description: product.description || `Buy ${product.title} on Project Apex. Fast, free delivery with Prime.`,
  };
}

export default async function ProductDetailPage({ params }: ProductPageProps) {
  const { id } = await params;
  const product = mockProducts.find((p) => p.id === id);

  // Requirement: "Invalid product IDs display a suitable not-found state."
  if (!product) {
    return (
      <div className="min-h-[70vh] bg-white flex flex-col items-center justify-center p-6 text-center">
        <div className="max-w-md space-y-4">
          <div className="w-16 h-16 bg-amber-50 rounded-full flex items-center justify-center mx-auto text-[#f08804]">
            <HelpCircle className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">
            Looking for something?
          </h1>
          <p className="text-sm text-gray-600 leading-relaxed">
            We're sorry. The Web address you entered is not a functioning page on our site.
          </p>
          <div className="pt-2">
            <Link
              href="/"
              className="inline-flex items-center gap-2 bg-[#ffd814] hover:bg-[#f7ca00] text-[#0f1111] font-bold text-xs py-2.5 px-6 rounded-full shadow-sm transition-all"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Go to Apex's Home Page</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const galleryImages = product.images && product.images.length > 0
    ? product.images
    : [product.image];

  return (
    <div className="min-h-screen bg-white py-6 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Main 3-column PDP Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
          
          {/* Column 1: Image Gallery (5 cols on lg) */}
          <div className="lg:col-span-5">
            <ProductGallery images={galleryImages} title={product.title} />
          </div>

          {/* Column 2: Product Info & Specs (4 cols on lg) */}
          <div className="lg:col-span-4">
            <ProductInfo product={product} />
          </div>

          {/* Column 3: Buy Box Purchase Section (3 cols on lg) */}
          <div className="lg:col-span-3">
            <PurchaseSection product={product} />
          </div>

        </div>

        {/* Related Products Recommendations */}
        <RelatedProducts currentProductId={product.id} allProducts={mockProducts} />

      </div>
    </div>
  );
}
