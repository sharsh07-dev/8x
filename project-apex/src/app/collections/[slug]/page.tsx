import React from 'react';
import { getCollectionBySlug, COLLECTIONS } from '@/data/collections';
import { getProductsByIds } from '@/lib/catalog.service';
import ProductCard from '@/components/ProductCard';
import { Breadcrumbs } from '@/components/navigation/Breadcrumbs';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import { Sparkles, ShoppingBag } from 'lucide-react';

export async function generateStaticParams() {
  return COLLECTIONS.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const collection = getCollectionBySlug(slug);
  return {
    title: `${collection?.name || 'Collection'} - Project Apex`,
    description: collection?.description || 'Browse curated collection.',
  };
}

export default async function CollectionDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const collection = getCollectionBySlug(slug);

  if (!collection) notFound();

  const products = await getProductsByIds(collection.productIds);

  return (
    <div className="bg-gray-50 min-h-screen pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Breadcrumbs
          items={[
            { label: 'Collections', href: '/departments' },
            { label: collection.name },
          ]}
        />

        {/* Collection Hero */}
        <div className="relative rounded-2xl overflow-hidden bg-slate-900 text-white mb-8 shadow-md">
          <div className="relative z-10 p-8 md:p-12 max-w-2xl">
            <span className="inline-flex items-center gap-1.5 bg-amber-400 text-slate-950 px-3 py-1 rounded-full text-xs font-black tracking-wider uppercase mb-3">
              <Sparkles className="w-3.5 h-3.5 text-slate-950" /> {collection.tag}
            </span>
            <h1 className="text-3xl sm:text-4xl font-black tracking-tight mb-2">
              {collection.name}
            </h1>
            <p className="text-amber-300 font-semibold text-sm mb-3">{collection.subtitle}</p>
            <p className="text-gray-300 text-xs sm:text-sm leading-relaxed max-w-xl">
              {collection.description}
            </p>
          </div>

          <div className="absolute right-0 top-0 bottom-0 w-1/2 opacity-30 hidden md:block">
            <Image
              src={collection.heroImage}
              alt={collection.name}
              fill
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-slate-900 via-slate-900/60 to-transparent" />
          </div>
        </div>

        {/* Collection Products Grid */}
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs text-gray-600 bg-white p-3.5 rounded-lg border border-gray-200">
            <span>
              Curated selection: <strong className="text-gray-900">{products.length} products</strong>
            </span>
          </div>

          {products.length === 0 ? (
            <div className="bg-white rounded-xl border border-gray-200 p-12 text-center space-y-3">
              <ShoppingBag className="w-10 h-10 text-gray-400 mx-auto" />
              <h3 className="font-bold text-gray-900">No items currently in this collection</h3>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
