import React from 'react';
import { getDepartmentBySlug, getSubcategoryBySlug } from '@/data/departments';
import { mockProducts } from '@/data/mockProducts';
import { DepartmentLanding } from '@/components/catalog/DepartmentLanding';
import { notFound } from 'next/navigation';

export async function generateMetadata({ params }: { params: Promise<{ subcategory: string }> }) {
  const { subcategory: subSlug } = await params;
  const subcategory = getSubcategoryBySlug('books', subSlug);
  return {
    title: `${subcategory?.name || 'Books'} - Project Apex`,
    description: subcategory?.description || 'Browse books and stationery.',
  };
}

export default async function BooksSubcategoryPage({
  params,
}: {
  params: Promise<{ subcategory: string }>;
}) {
  const { subcategory: subSlug } = await params;
  const department = getDepartmentBySlug('books');
  const subcategory = getSubcategoryBySlug('books', subSlug);

  if (!department || !subcategory) notFound();

  const products = mockProducts.filter(
    (p) => p.department === 'books' && p.subcategory === subSlug
  );

  return (
    <DepartmentLanding
      department={department}
      currentSubcategory={subcategory}
      breadcrumbs={[
        { label: 'Books', href: '/books' },
        { label: subcategory.name },
      ]}
      products={products}
    />
  );
}
