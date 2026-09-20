import React from 'react';
import { getDepartmentBySlug, getSubcategoryBySlug } from '@/data/departments';
import { mockProducts } from '@/data/mockProducts';
import { DepartmentLanding } from '@/components/catalog/DepartmentLanding';
import { notFound } from 'next/navigation';

export async function generateMetadata({ params }: { params: Promise<{ subcategory: string }> }) {
  const { subcategory: subSlug } = await params;
  const subcategory = getSubcategoryBySlug('home-kitchen', subSlug);
  return {
    title: `${subcategory?.name || 'Home & Kitchen'} - Project Apex`,
    description: subcategory?.description || 'Browse home and kitchen essentials.',
  };
}

export default async function HomeKitchenSubcategoryPage({
  params,
}: {
  params: Promise<{ subcategory: string }>;
}) {
  const { subcategory: subSlug } = await params;
  const department = getDepartmentBySlug('home-kitchen');
  const subcategory = getSubcategoryBySlug('home-kitchen', subSlug);

  if (!department || !subcategory) notFound();

  const products = mockProducts.filter(
    (p) => p.department === 'home-kitchen' && p.subcategory === subSlug
  );

  return (
    <DepartmentLanding
      department={department}
      currentSubcategory={subcategory}
      breadcrumbs={[
        { label: 'Home & Kitchen', href: '/home-kitchen' },
        { label: subcategory.name },
      ]}
      products={products}
    />
  );
}
