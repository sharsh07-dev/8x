'use server';

import { getProductById } from '@/lib/catalog.service';
import { Product } from '@/types/product';

export async function fetchProductAction(id: string): Promise<Product | null> {
  return await getProductById(id);
}
