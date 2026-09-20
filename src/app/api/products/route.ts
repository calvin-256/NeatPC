// ===========================================
// NeatPC — Products API
// ===========================================
// GET /api/products — search & filter products from the database
// Query params: q, category, minPrice, maxPrice, brand, sort, page, limit

import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    // Parse query params
    const query = searchParams.get('q') || '';
    const category = searchParams.get('category');
    const minPrice = searchParams.get('minPrice') ? Number(searchParams.get('minPrice')) : undefined;
    const maxPrice = searchParams.get('maxPrice') ? Number(searchParams.get('maxPrice')) : undefined;
    const brand = searchParams.get('brand');
    const sortBy = searchParams.get('sort') || 'dealScore';
    const page = Math.max(1, Number(searchParams.get('page')) || 1);
    const limit = Math.min(50, Math.max(1, Number(searchParams.get('limit')) || 20));

    // Build Prisma where clause
    const where: any = {};

    if (query) {
      where.OR = [
        { name: { contains: query } },
        { brand: { contains: query } },
        { description: { contains: query } },
      ];
    }

    if (category) {
      where.category = category;
    }

    if (brand) {
      where.brand = { contains: brand };
    }

    if (minPrice !== undefined || maxPrice !== undefined) {
      where.bestPrice = {};
      if (minPrice !== undefined) where.bestPrice.gte = minPrice;
      if (maxPrice !== undefined) where.bestPrice.lte = maxPrice;
    }

    // Build sort order
    const orderBy: any = {};
    switch (sortBy) {
      case 'price_asc':
        orderBy.bestPrice = 'asc';
        break;
      case 'price_desc':
        orderBy.bestPrice = 'desc';
        break;
      case 'rating':
        orderBy.rating = 'desc';
        break;
      case 'newest':
        orderBy.createdAt = 'desc';
        break;
      case 'dealScore':
      default:
        orderBy.dealScore = 'desc';
        break;
    }

    // Query database
    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        orderBy,
        skip: (page - 1) * limit,
        take: limit,
        include: {
          prices: true,
        },
      }),
      prisma.product.count({ where }),
    ]);

    // Format response
    const formatted = products.map((p) => ({
      id: p.id,
      name: p.name,
      brand: p.brand,
      category: p.category,
      slug: p.slug,
      imageUrl: p.imageUrl,
      description: p.description,
      specs: JSON.parse(p.specsJson),
      bestPrice: p.bestPrice,
      dealScore: p.dealScore,
      rating: p.rating,
      reviewCount: p.reviewCount,
      prices: p.prices.map((pr) => ({
        retailer: pr.retailer,
        price: pr.price,
        originalPrice: pr.originalPrice,
        url: pr.url,
        inStock: pr.inStock,
        lastChecked: pr.lastChecked,
      })),
    }));

    return NextResponse.json({
      success: true,
      data: {
        products: formatted,
        total,
        page,
        totalPages: Math.ceil(total / limit),
        limit,
      },
    });
  } catch (error) {
    console.error('Products API error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch products' },
      { status: 500 }
    );
  }
}
