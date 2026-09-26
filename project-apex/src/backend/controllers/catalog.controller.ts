import { Request, Response } from 'express';
import { prisma } from '../../lib/prisma';
import { AppError } from '../middlewares/errorHandler';

export class CatalogController {
  
  static async getProducts(req: Request, res: Response) {
    const { 
      page = '1', 
      limit = '20', 
      category,
      subcategory,
      search,
      sort = 'newest'
    } = req.query;

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    // Build Where Clause
    const where: any = {
      status: 'ACTIVE',
    };

    if (category) {
      where.category = { slug: category as string };
    }

    if (subcategory) {
      where.subcategory = { slug: subcategory as string };
    }

    if (search) {
      where.title = { contains: search as string, mode: 'insensitive' };
    }

    // Build OrderBy
    let orderBy: any = { createdAt: 'desc' };
    if (sort === 'price_asc') orderBy = { price: 'asc' };
    if (sort === 'price_desc') orderBy = { price: 'desc' };

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        skip,
        take: limitNum,
        orderBy,
        include: {
          images: {
            orderBy: { position: 'asc' }
          },
          inventory: {
            select: { stock: true }
          },
          category: {
            select: { name: true, slug: true }
          }
        }
      }),
      prisma.product.count({ where })
    ]);

    res.status(200).json({
      success: true,
      data: {
        products,
        pagination: {
          total,
          page: pageNum,
          limit: limitNum,
          pages: Math.ceil(total / limitNum)
        }
      }
    });
  }

  static async getProductBySlug(req: Request, res: Response) {
    const slug = req.params.slug as string;

    const product = await prisma.product.findUnique({
      where: { slug },
      include: {
        images: {
          orderBy: { position: 'asc' }
        },
        variants: true,
        inventory: true,
        category: true,
        subcategory: true,
      }
    });

    if (!product || product.status !== 'ACTIVE') {
      throw new AppError('Product not found', 404);
    }

    res.status(200).json({
      success: true,
      data: { product }
    });
  }

  static async getCategories(req: Request, res: Response) {
    const categories = await prisma.category.findMany({
      include: {
        subcategories: true
      },
      orderBy: { name: 'asc' }
    });

    res.status(200).json({
      success: true,
      data: { categories }
    });
  }
}
