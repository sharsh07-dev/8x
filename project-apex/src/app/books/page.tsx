import React from 'react';
import { getDepartmentBySlug } from '@/data/departments';
import { mockProducts } from '@/data/mockProducts';
import { DepartmentLanding } from '@/components/catalog/DepartmentLanding';
import { notFound } from 'next/navigation';

export const metadata = {
  title: 'Books & Stationery - Project Apex',
  description: 'Shop bestselling books, study guides, and workspace stationery with fast Prime delivery.',
};

export default function BooksPage() {
  const department = getDepartmentBySlug('books');
  if (!department) notFound();

  const products = mockProducts.filter((p) => p.department === 'books');

  return (
    <DepartmentLanding
      department={department}
      breadcrumbs={[{ label: 'Books & Stationery' }]}
      products={products}
    />
  );
}
