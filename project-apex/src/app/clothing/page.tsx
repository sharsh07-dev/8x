import React from 'react';
import { getDepartmentBySlug } from '@/data/departments';
import { mockProducts } from '@/data/mockProducts';
import { DepartmentLanding } from '@/components/catalog/DepartmentLanding';
import { notFound } from 'next/navigation';

export const metadata = {
  title: 'Clothing & Fashion - Project Apex',
  description: 'Shop clothing, footwear, and accessories for men, women, and kids with fast, free delivery on eligible orders.',
};

export default function ClothingDepartmentPage() {
  const department = getDepartmentBySlug('clothing');
  if (!department) notFound();

  const clothingProducts = mockProducts.filter((p) => p.department === 'clothing');

  return (
    <DepartmentLanding
      department={department}
      breadcrumbs={[{ label: 'Clothing & Fashion' }]}
      products={clothingProducts}
    />
  );
}
