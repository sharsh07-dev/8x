import React from 'react';
import { getDepartmentBySlug, getSubcategoryBySlug } from '@/data/departments';
import { mockProducts } from '@/data/mockProducts';
import { DepartmentLanding } from '@/components/catalog/DepartmentLanding';
import { notFound } from 'next/navigation';

export async function generateMetadata({ params }: { params: Promise<{ subcategory: string }> }) {
  const { subcategory: subSlug } = await params;
  const subcategory = getSubcategoryBySlug('electronics', subSlug);
  return {
    title: `${subcategory?.name || 'Electronics'} - Project Apex`,
    description: subcategory?.description || 'Browse electronics categories.',
  };
}

export default async function ElectronicsSubcategoryPage({
  params,
}: {
  params: Promise<{ subcategory: string }>;
}) {
  const { subcategory: subSlug } = await params;
  const department = getDepartmentBySlug('electronics');
  const subcategory = getSubcategoryBySlug('electronics', subSlug);

  if (!department || !subcategory) notFound();

  const products = mockProducts.filter(
    (p) => p.department === 'electronics' && p.subcategory === subSlug
  );

  return (
    <DepartmentLanding
      department={department}
      currentSubcategory={subcategory}
      breadcrumbs={[
        { label: 'Electronics', href: '/electronics' },
        { label: subcategory.name },
      ]}
      products={products}
    />
  );
}
