import React from 'react';
import { getDepartmentBySlug, getSubcategoryBySlug } from '@/data/departments';
import { mockProducts } from '@/data/mockProducts';
import { DepartmentLanding } from '@/components/catalog/DepartmentLanding';
import { notFound } from 'next/navigation';

export const metadata = {
  title: "Kids' Fashion - Project Apex",
  description: "Shop kids' clothing sets, jackets, and everyday playwear.",
};

export default function KidsClothingPage() {
  const department = getDepartmentBySlug('clothing');
  const subcategory = getSubcategoryBySlug('clothing', 'kids');
  if (!department || !subcategory) notFound();

  const products = mockProducts.filter(
    (p) => p.department === 'clothing' && (p.subcategory === 'kids' || p.gender === 'Kids')
  );

  return (
    <DepartmentLanding
      department={department}
      currentSubcategory={subcategory}
      genderFilter="Kids"
      breadcrumbs={[
        { label: 'Clothing & Fashion', href: '/clothing' },
        { label: "Kids' Fashion" },
      ]}
      products={products}
    />
  );
}
