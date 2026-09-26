import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getProductById, getProducts } from '@/lib/catalog.service';
import ProductGallery from '@/components/products/ProductGallery';
import ProductInfo from '@/components/products/ProductInfo';
import PurchaseSection from '@/components/products/PurchaseSection';
import RelatedProducts from '@/components/products/RelatedProducts';
import { ReviewSection } from '@/components/reviews/ReviewSection';
import ProductHistoryTracker from '@/components/products/ProductHistoryTracker';
import { HelpCircle, ArrowLeft } from 'lucide-react';

interface ProductPageProps {
  params: Promise<{
    id: string;
  }>;
}

export async function generateMetadata({ params }: ProductPageProps) {
  const { id } = await params;
  const product = await getProductById(id);

  if (!product) {
    return {
      title: 'Page Not Found - PEHNO',
    };
  }

  return {
    title: `${product.title} - PEHNO`,
    description: product.description || `Buy ${product.title} on PEHNO.`,
  };
}

export default async function ProductDetailPage({ params }: ProductPageProps) {
  const { id } = await params;
  
  const product = await getProductById(id);

  if (!product) {
    return (
      <div className="min-h-[70vh] bg-[#F9F6F1] flex flex-col items-center justify-center p-6 text-center">
        <div className="max-w-md space-y-4">
          <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto text-[#E67661] shadow-sm">
            <HelpCircle className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-bold text-[#171717]">
            Product not found
          </h1>
          <p className="text-sm text-[#6B7280] leading-relaxed">
            We couldn't find the product you're looking for. It might have been removed or the link is broken.
          </p>
          <div className="pt-2">
            <Link
              href="/"
              className="inline-flex items-center gap-2 bg-[#171717] hover:bg-[#E67661] text-white font-bold text-xs py-2.5 px-6 rounded-full transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Home</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const galleryImages = product.images?.length && product.images.length > 0
    ? product.images
    : [product.image || '/placeholder.jpg'];

  const mappedProduct = {
    id: product.id,
    title: product.title,
    description: product.description || '',
    price: product.price,
    compareAtPrice: product.originalPrice,
    image: galleryImages[0],
    images: galleryImages,
    rating: product.rating || 4.5,
    reviewCount: product.reviewCount || 120,
    category: product.category || product.subcategory || 'Category',
    stock: product.stock || 50,
    isPrime: product.isPrime !== false,
    inStock: product.inStock !== false,
    stockCount: product.stock || 50
  };

  const related = await getProducts({ department: product.department, limit: 6 });
  const filteredRelated = related.filter(p => p.id !== product.id);

  const mappedRelated = filteredRelated.map((p) => ({
    id: p.id,
    title: p.title,
    slug: p.id,
    price: p.price,
    compareAtPrice: p.originalPrice,
    image: p.image || '/placeholder.jpg',
    rating: p.rating || 4.5,
    reviewsCount: p.reviewCount || 42,
    isPrime: p.isPrime !== false
  }));

  return (
    <div className="min-h-screen bg-white py-6 px-4 sm:px-6 lg:px-8 font-sans">
      <ProductHistoryTracker 
        productId={product.id} 
        category={product.department || 'apparel'} 
        title={product.title}
        image={galleryImages[0] || '/placeholder.jpg'}
      />
      <div className="max-w-7xl mx-auto space-y-8">
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
          
          <div className="lg:col-span-5">
            <ProductGallery images={galleryImages} title={product.title} />
          </div>

          <div className="lg:col-span-4">
            <ProductInfo product={mappedProduct} />
          </div>

          <div className="lg:col-span-3">
            <PurchaseSection product={mappedProduct} />
          </div>

        </div>

        <RelatedProducts currentProductId={product.id} allProducts={mappedRelated as any} />

        <ReviewSection productId={product.id} productTitle={product.title} />

      </div>
    </div>
  );
}
