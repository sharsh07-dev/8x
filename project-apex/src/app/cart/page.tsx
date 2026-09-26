import React from 'react';
import { getProducts } from '@/lib/catalog.service';
import CartClient from './CartClient';

export default async function CartPage() {
  const recommendedProducts = await getProducts({ limit: 5 });
  return <CartClient recommendedProducts={recommendedProducts} />;
}
