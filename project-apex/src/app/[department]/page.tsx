import React from 'react';
import { notFound } from 'next/navigation';
import { getDepartmentBySlug } from '@/data/departments';
import { getProducts } from '@/lib/catalog.service';
import { DepartmentLanding } from '@/components/catalog/DepartmentLanding';

type Params = Promise<{ department: string }>;

export async function generateMetadata({ params }: { params: Params }) {
  const { department: deptSlug } = await params;
  const dept = getDepartmentBySlug(deptSlug);
  if (!dept) return { title: 'Not Found' };
  return {
    title: `${dept.name} - PEHNO`,
    description: dept.description,
  };
}

export default async function DepartmentPage({ params }: { params: Params }) {
  const { department: deptSlug } = await params;
  const department = getDepartmentBySlug(deptSlug);
  if (!department) {
    notFound();
  }

  // Find products that match this department
  const products = await getProducts({ department: department.slug });

  return (
    <DepartmentLanding
      department={department}
      breadcrumbs={[{ label: department.name }]}
      products={products}
    />
  );
}
