import React from 'react';
import { getDepartmentBySlug, getSubcategoryBySlug } from '@/data/departments';
import { mockProducts } from '@/data/mockProducts';
import { DepartmentLanding } from '@/components/catalog/DepartmentLanding';
import { notFound } from 'next/navigation';

export async function generateMetadata({ params }: { params: Promise<{ subcategory: string }> }) {
  const { subcategory: subSlug } = await params;
  const subcategory = getSubcategoryBySlug('sports', subSlug);
  return {
    title: `${subcategory?.name || 'Sports'} - Project Apex`,
    description: subcategory?.description || 'Browse sports and workout gear.',
  };
}

export default async function SportsSubcategoryPage({
  params,
}: {
  params: Promise<{ subcategory: string }>;
}) {
  const { subcategory: subSlug } = await params;
  const department = getDepartmentBySlug('sports');
  const subcategory = getSubcategoryBySlug('sports', subSlug);

  if (!department || !subcategory) notFound();

  const products = mockProducts.filter(
    (p) => p.department === 'sports' && p.subcategory === subSlug
  );

  return (
    <DepartmentLanding
      department={department}
      currentSubcategory={subcategory}
      breadcrumbs={[
        { label: 'Sports', href: '/sports' },
        { label: subcategory.name },
      ]}
      products={products}
    />
  );
}
