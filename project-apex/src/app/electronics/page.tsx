import React from 'react';
import { getDepartmentBySlug } from '@/data/departments';
import { mockProducts } from '@/data/mockProducts';
import { DepartmentLanding } from '@/components/catalog/DepartmentLanding';
import { notFound } from 'next/navigation';

export const metadata = {
  title: 'Electronics & Audio - Project Apex',
  description: 'Shop headphones, wireless earbuds, smartwatches, smartphones, and high-performance digital gear with fast Prime delivery.',
};

export default function ElectronicsPage() {
  const department = getDepartmentBySlug('electronics');
  if (!department) notFound();

  const products = mockProducts.filter((p) => p.department === 'electronics');

  return (
    <DepartmentLanding
      department={department}
      breadcrumbs={[{ label: 'Electronics & Audio' }]}
      products={products}
    />
  );
}
