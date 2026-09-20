import React from 'react';
import { getDepartmentBySlug, getSubcategoryBySlug } from '@/data/departments';
import { mockProducts } from '@/data/mockProducts';
import { DepartmentLanding } from '@/components/catalog/DepartmentLanding';
import { notFound } from 'next/navigation';

export async function generateMetadata({ params }: { params: Promise<{ subcategory: string }> }) {
  const { subcategory: subSlug } = await params;
  const subcategory = getSubcategoryBySlug('beauty', subSlug);
  return {
    title: `${subcategory?.name || 'Beauty & Care'} - Project Apex`,
    description: subcategory?.description || 'Browse beauty and grooming products.',
  };
}

export default async function BeautySubcategoryPage({
  params,
}: {
  params: Promise<{ subcategory: string }>;
}) {
  const { subcategory: subSlug } = await params;
  const department = getDepartmentBySlug('beauty');
  const subcategory = getSubcategoryBySlug('beauty', subSlug);

  if (!department || !subcategory) notFound();

  const products = mockProducts.filter(
    (p) => p.department === 'beauty' && p.subcategory === subSlug
  );

  return (
    <DepartmentLanding
      department={department}
      currentSubcategory={subcategory}
      breadcrumbs={[
        { label: 'Beauty & Personal Care', href: '/beauty' },
        { label: subcategory.name },
      ]}
      products={products}
    />
  );
}
