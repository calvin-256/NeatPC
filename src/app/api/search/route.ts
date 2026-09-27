import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import type { Prisma } from '@prisma/client';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    
    // Pagination
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '20', 10);
    const skip = (page - 1) * limit;

    // Filters
    const query = searchParams.get('q') || '';
    const category = searchParams.get('category');
    const brand = searchParams.get('brand');
    const minPrice = searchParams.get('minPrice') ? parseFloat(searchParams.get('minPrice')!) : undefined;
    const maxPrice = searchParams.get('maxPrice') ? parseFloat(searchParams.get('maxPrice')!) : undefined;
    
    // Sorting
    const sort = searchParams.get('sort') || 'dealScore'; // dealScore, price_asc, price_desc, newest

    // Build Prisma Where Clause
    const where: Prisma.ProductWhereInput = {};

    if (query) {
      where.OR = [
        { name: { contains: query } },
        { brand: { contains: query } },
      ];
    }
    if (category) where.category = category;
    if (brand) where.brand = brand;
    if (minPrice !== undefined || maxPrice !== undefined) {
      where.bestPrice = {};
      if (minPrice !== undefined) where.bestPrice.gte = minPrice;
      if (maxPrice !== undefined) where.bestPrice.lte = maxPrice;
    }

    // Build Prisma OrderBy Clause
    let orderBy: Prisma.ProductOrderByWithRelationInput = {};
    switch (sort) {
      case 'price_asc':
        orderBy = { bestPrice: 'asc' };
        break;
      case 'price_desc':
        orderBy = { bestPrice: 'desc' };
        break;
      case 'newest':
        orderBy = { createdAt: 'desc' };
        break;
      case 'dealScore':
      default:
        orderBy = { dealScore: 'desc' };
        break;
    }

    // Fetch data
    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        orderBy,
        skip,
        take: limit,
        select: {
          id: true,
          name: true,
          brand: true,
          imageUrl: true,
          bestPrice: true,
          dealScore: true,
          slug: true,
          category: true,
        },
      }),
      prisma.product.count({ where }),
    ]);

    // Save search history asynchronously if query exists and user is logged in
    // (Could extract session here using getServerSession, omitted for brevity)

    return NextResponse.json({
      data: products,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Search API Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
