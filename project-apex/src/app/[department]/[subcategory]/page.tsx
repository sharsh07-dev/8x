import React from 'react';
import { notFound } from 'next/navigation';
import { getDepartmentBySlug } from '@/data/departments';
import { getProducts } from '@/lib/catalog.service';
import { DepartmentLanding } from '@/components/catalog/DepartmentLanding';

type Params = Promise<{ department: string; subcategory: string }>;

export async function generateMetadata({ params }: { params: Params }) {
  const { department, subcategory } = await params;
  const dept = getDepartmentBySlug(department);
  if (!dept) return { title: 'Not Found' };
  const sub = dept.subcategories.find((s) => s.slug === subcategory);
  if (!sub) return { title: 'Not Found' };
  
  return {
    title: `${sub.name} - ${dept.name} | PEHNO`,
    description: sub.description,
  };
}

export default async function SubcategoryPage({ params }: { params: Params }) {
  const { department: deptSlug, subcategory: subSlug } = await params;
  const department = getDepartmentBySlug(deptSlug);
  if (!department) {
    notFound();
  }

  const subcategory = department.subcategories.find((s) => s.slug === subSlug);
  if (!subcategory) {
    notFound();
  }

  const products = await getProducts({ department: department.slug, subcategory: subcategory.slug });

  return (
    <DepartmentLanding
      department={department}
      currentSubcategory={subcategory}
      breadcrumbs={[
        { label: department.name, href: `/${department.slug}` },
        { label: subcategory.name },
      ]}
      products={products}
    />
  );
}
