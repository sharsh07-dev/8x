import React from 'react';
import { getProducts } from '@/lib/catalog.service';
import WishlistClient from './WishlistClient';

export default async function WishlistPage() {
  const initialWishlist = await getProducts({ limit: 6 });
  return <WishlistClient initialWishlist={initialWishlist} />;
}
