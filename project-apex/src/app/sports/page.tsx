import React from 'react';
import { getDepartmentBySlug } from '@/data/departments';
import { mockProducts } from '@/data/mockProducts';
import { DepartmentLanding } from '@/components/catalog/DepartmentLanding';
import { notFound } from 'next/navigation';

export const metadata = {
  title: 'Sports & Fitness - Project Apex',
  description: 'Shop workout gear, yoga mats, resistance bands, hydration bottles, and outdoor equipment.',
};

export default function SportsPage() {
  const department = getDepartmentBySlug('sports');
  if (!department) notFound();

  const products = mockProducts.filter((p) => p.department === 'sports');

  return (
    <DepartmentLanding
      department={department}
      breadcrumbs={[{ label: 'Sports & Fitness' }]}
      products={products}
    />
  );
}
