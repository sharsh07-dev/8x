import React, { Suspense } from 'react';
import { getProducts } from '@/lib/catalog.service';
import SearchClient from './SearchClient';

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; category?: string }>;
}) {
  const { q = '', category = '' } = await searchParams;

  // We fetch a larger limit to allow client-side fuzzy search on results
  // Or we could pass 'q' down to getProducts to search in the DB natively.
  const products = await getProducts({ search: q, department: category, limit: 100 });

  return (
    <Suspense
      fallback={
        <div className="min-h-[70vh] flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-500" />
        </div>
      }
    >
      <SearchClient initialProducts={products} query={q} categoryParam={category} />
    </Suspense>
  );
}
