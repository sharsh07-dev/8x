import React from 'react';
import { Product } from '@/types/product';
import ProductCard from '@/components/ProductCard';

interface RelatedProductsProps {
  currentProductId: string;
  allProducts: Product[];
}

export default function RelatedProducts({ currentProductId, allProducts }: RelatedProductsProps) {
  const related = allProducts
    .filter((p) => p.id !== currentProductId)
    .slice(0, 4);

  return (
    <div className="border-t border-gray-200 pt-8 mt-12 space-y-4">
      <h2 className="text-xl font-bold text-gray-900 tracking-tight">
        Customers who viewed this item also viewed
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
        {related.map((prod) => (
          <ProductCard key={prod.id} product={prod} />
        ))}
      </div>
    </div>
  );
}
