import React from 'react';
import HomeClient from '@/components/HomeClient';
import CouponToggle from '@/components/CouponToggle';
import { prisma } from '@/lib/prisma';

import { getProducts } from '@/lib/catalog.service';

export const metadata = {
  title: 'Online Shopping site in India | PEHNO',
  description: 'Shop top deals on electronics, clothing, and home essentials with Prime delivery.',
};

export const revalidate = 60; // Revalidate cache every 60 seconds

export default async function Home() {
  const products = await getProducts({ limit: 8 });

  return (
    <>
      <HomeClient products={products} />
      <CouponToggle />
    </>
  );
}
