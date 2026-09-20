import React from 'react';
import { getDepartmentBySlug } from '@/data/departments';
import { mockProducts } from '@/data/mockProducts';
import { DepartmentLanding } from '@/components/catalog/DepartmentLanding';
import { notFound } from 'next/navigation';

export const metadata = {
  title: 'Beauty & Personal Care - Project Apex',
  description: 'Shop premium dermatologist skincare, nourishing haircare, and grooming essentials.',
};

export default function BeautyPage() {
  const department = getDepartmentBySlug('beauty');
  if (!department) notFound();

  const products = mockProducts.filter((p) => p.department === 'beauty');

  return (
    <DepartmentLanding
      department={department}
      breadcrumbs={[{ label: 'Beauty & Personal Care' }]}
      products={products}
    />
  );
}
