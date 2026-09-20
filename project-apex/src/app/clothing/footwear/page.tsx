import React from 'react';
import { getDepartmentBySlug, getSubcategoryBySlug } from '@/data/departments';
import { mockProducts } from '@/data/mockProducts';
import { DepartmentLanding } from '@/components/catalog/DepartmentLanding';
import { notFound } from 'next/navigation';

export const metadata = {
  title: 'Footwear & Sneakers - Project Apex',
  description: 'Shop premium sneakers, running shoes, and casual footwear.',
};

export default function FootwearClothingPage() {
  const department = getDepartmentBySlug('clothing');
  const subcategory = getSubcategoryBySlug('clothing', 'footwear');
  if (!department || !subcategory) notFound();

  const products = mockProducts.filter(
    (p) => p.department === 'clothing' && p.subcategory === 'footwear'
  );

  return (
    <DepartmentLanding
      department={department}
      currentSubcategory={subcategory}
      breadcrumbs={[
        { label: 'Clothing & Fashion', href: '/clothing' },
        { label: 'Footwear & Sneakers' },
      ]}
      products={products}
    />
  );
}
