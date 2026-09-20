import React from 'react';
import { getDepartmentBySlug, getSubcategoryBySlug } from '@/data/departments';
import { mockProducts } from '@/data/mockProducts';
import { DepartmentLanding } from '@/components/catalog/DepartmentLanding';
import { notFound } from 'next/navigation';

export const metadata = {
  title: "Men's Fashion - Project Apex",
  description: "Shop men's t-shirts, shirts, denim, outerwear, and casual essentials.",
};

export default function MensClothingPage() {
  const department = getDepartmentBySlug('clothing');
  const subcategory = getSubcategoryBySlug('clothing', 'men');
  if (!department || !subcategory) notFound();

  const products = mockProducts.filter(
    (p) => p.department === 'clothing' && (p.subcategory === 'men' || p.gender === 'Men')
  );

  return (
    <DepartmentLanding
      department={department}
      currentSubcategory={subcategory}
      genderFilter="Men"
      breadcrumbs={[
        { label: 'Clothing & Fashion', href: '/clothing' },
        { label: "Men's Fashion" },
      ]}
      products={products}
    />
  );
}
