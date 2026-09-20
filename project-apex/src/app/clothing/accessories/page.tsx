import React from 'react';
import { getDepartmentBySlug, getSubcategoryBySlug } from '@/data/departments';
import { mockProducts } from '@/data/mockProducts';
import { DepartmentLanding } from '@/components/catalog/DepartmentLanding';
import { notFound } from 'next/navigation';

export const metadata = {
  title: 'Bags & Accessories - Project Apex',
  description: 'Shop everyday carry backpacks, leather wallets, and contemporary accessories.',
};

export default function AccessoriesClothingPage() {
  const department = getDepartmentBySlug('clothing');
  const subcategory = getSubcategoryBySlug('clothing', 'accessories');
  if (!department || !subcategory) notFound();

  const products = mockProducts.filter(
    (p) => p.department === 'clothing' && p.subcategory === 'accessories'
  );

  return (
    <DepartmentLanding
      department={department}
      currentSubcategory={subcategory}
      breadcrumbs={[
        { label: 'Clothing & Fashion', href: '/clothing' },
        { label: 'Bags & Accessories' },
      ]}
      products={products}
    />
  );
}
