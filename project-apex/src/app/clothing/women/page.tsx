import React from 'react';
import { getDepartmentBySlug, getSubcategoryBySlug } from '@/data/departments';
import { mockProducts } from '@/data/mockProducts';
import { DepartmentLanding } from '@/components/catalog/DepartmentLanding';
import { notFound } from 'next/navigation';

export const metadata = {
  title: "Women's Fashion - Project Apex",
  description: "Explore women's contemporary dresses, knitwear, jackets, and wardrobe essentials.",
};

export default function WomensClothingPage() {
  const department = getDepartmentBySlug('clothing');
  const subcategory = getSubcategoryBySlug('clothing', 'women');
  if (!department || !subcategory) notFound();

  const products = mockProducts.filter(
    (p) => p.department === 'clothing' && (p.subcategory === 'women' || p.gender === 'Women')
  );

  return (
    <DepartmentLanding
      department={department}
      currentSubcategory={subcategory}
      genderFilter="Women"
      breadcrumbs={[
        { label: 'Clothing & Fashion', href: '/clothing' },
        { label: "Women's Fashion" },
      ]}
      products={products}
    />
  );
}
