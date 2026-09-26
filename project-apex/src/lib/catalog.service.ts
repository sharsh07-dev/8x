import { prisma } from './prisma';
import { Product as UIProduct } from '@/types/product';

// Helper to map Prisma product to UI product
export function mapToUIProduct(dbProduct: any): UIProduct {
  const images = dbProduct.images?.map((i: any) => i.url) || [];
  const mainImage = images.length > 0 ? images[0] : 'https://placehold.co/600x400/png?text=No+Image';

  // Compute stock
  const stock = dbProduct.inventory?.stock || 0;
  const inStock = stock > 0 && dbProduct.status === 'ACTIVE';

  return {
    id: dbProduct.id,
    title: dbProduct.title,
    description: dbProduct.description,
    price: dbProduct.price,
    originalPrice: dbProduct.compareAtPrice || undefined,
    rating: 4.5, // Mocked rating for now unless computed from reviews
    reviewCount: dbProduct.reviews?.length || Math.floor(Math.random() * 500) + 10,
    image: mainImage,
    images: images,
    category: dbProduct.category?.name || 'Uncategorized',
    department: dbProduct.category?.slug || 'all',
    subcategory: dbProduct.subcategory?.slug || undefined,
    brand: dbProduct.brand || 'Apex',
    inStock: inStock,
    stock: stock,
    isPrime: true,
  };
}

export async function getProducts(options?: {
  department?: string;
  subcategory?: string;
  search?: string;
  limit?: number;
}): Promise<UIProduct[]> {
  const where: any = { status: 'ACTIVE' };

  if (options?.department && options.department !== 'all') {
    where.category = { slug: options.department };
  }

  if (options?.subcategory) {
    where.subcategory = { slug: options.subcategory };
  }

  if (options?.search) {
    where.title = { contains: options.search, mode: 'insensitive' };
  }

  const dbProducts = await prisma.product.findMany({
    where,
    take: options?.limit || 50,
    include: {
      images: { orderBy: { position: 'asc' } },
      inventory: true,
      category: true,
      subcategory: true,
    },
    orderBy: { createdAt: 'desc' }
  });

  return dbProducts.map(mapToUIProduct);
}

export async function getProductsByIds(ids: string[]): Promise<UIProduct[]> {
  const dbProducts = await prisma.product.findMany({
    where: { id: { in: ids } },
    include: {
      images: { orderBy: { position: 'asc' } },
      inventory: true,
      category: true,
      subcategory: true,
    }
  });
  return dbProducts.map(mapToUIProduct);
}

export async function getProductById(id: string): Promise<UIProduct | null> {
  const dbProduct = await prisma.product.findUnique({
    where: { id },
    include: {
      images: { orderBy: { position: 'asc' } },
      inventory: true,
      category: true,
      subcategory: true,
    }
  });

  if (!dbProduct) return null;
  return mapToUIProduct(dbProduct);
}
