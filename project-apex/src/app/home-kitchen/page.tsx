import React from 'react';
import { getDepartmentBySlug } from '@/data/departments';
import { mockProducts } from '@/data/mockProducts';
import { DepartmentLanding } from '@/components/catalog/DepartmentLanding';
import { notFound } from 'next/navigation';

export const metadata = {
  title: 'Home & Kitchen - Project Apex',
  description: 'Shop cookware, small kitchen appliances, ambient lighting, and modern home decor.',
};

export default function HomeKitchenPage() {
  const department = getDepartmentBySlug('home-kitchen');
  if (!department) notFound();

  const products = mockProducts.filter((p) => p.department === 'home-kitchen');

  return (
    <DepartmentLanding
      department={department}
      breadcrumbs={[{ label: 'Home & Kitchen' }]}
      products={products}
    />
  );
}
