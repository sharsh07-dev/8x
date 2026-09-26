import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const query = url.searchParams.get('q');
    const category = url.searchParams.get('category');
    const role = url.searchParams.get('role');
    const color = url.searchParams.get('color');
    const minPrice = url.searchParams.get('minPrice');
    const maxPrice = url.searchParams.get('maxPrice');
    const inStock = url.searchParams.get('inStock') !== 'false'; // default true
    const limit = parseInt(url.searchParams.get('limit') || '20');

    const where: any = {
      status: 'ACTIVE'
    };

    if (query) {
      where.title = { contains: query, mode: 'insensitive' };
    }
    if (category) {
      where.category = { slug: category };
    }
    if (role) {
      where.garmentRole = role.toUpperCase();
    }
    if (color) {
      where.colorFamily = { equals: color, mode: 'insensitive' };
    }
    if (minPrice || maxPrice) {
      where.price = {};
      if (minPrice) where.price.gte = parseFloat(minPrice);
      if (maxPrice) where.price.lte = parseFloat(maxPrice);
    }
    if (inStock) {
      where.inventory = { stock: { gt: 0 } };
    }

    const products = await prisma.product.findMany({
      where,
      take: limit,
      include: {
        images: true,
        category: true,
        inventory: true
      },
      orderBy: {
        createdAt: 'desc' // Currently deterministic. Later could sort by rank.
      }
    });

    // Map Prisma objects to frontend-friendly schema
    const formattedProducts = products.map(p => ({
      id: p.id,
      title: p.title,
      price: p.price,
      originalPrice: p.compareAtPrice,
      category: p.category.name,
      garmentRole: p.garmentRole,
      colorFamily: p.colorFamily,
      image: p.images.length > 0 ? p.images[0].url : '',
      stock: p.inventory?.stock || 0,
      inStock: (p.inventory?.stock || 0) > 0,
      styleTags: p.styleTags,
      occasionTags: p.occasionTags
    }));

    return NextResponse.json({
      success: true,
      count: formattedProducts.length,
      products: formattedProducts
    });

  } catch (error: any) {
    console.error('Error fetching products:', error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
