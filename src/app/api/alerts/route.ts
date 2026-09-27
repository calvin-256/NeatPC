// ===========================================
// NeatPC — Price Alerts API
// ===========================================
// GET: Fetch all active alerts for the current user
// POST: Create a new price alert

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/db';
import { z } from 'zod';

const createAlertSchema = z.object({
  productId: z.string(),
  targetPrice: z.number().positive(),
});

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const alerts = await prisma.priceAlert.findMany({
      where: { userId: session.user.id },
      include: {
        product: {
          select: { name: true, slug: true, imageUrl: true, bestPrice: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ success: true, alerts });
  } catch (error) {
    console.error('Failed to fetch alerts:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const result = createAlertSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json({ error: 'Invalid data' }, { status: 400 });
    }

    const { productId, targetPrice } = result.data;

    // Check if product exists
    const product = await prisma.product.findUnique({ where: { id: productId } });
    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    // Upsert the alert (if they already have one for this product, update it)
    // Prisma doesn't have a unique constraint on userId+productId for alerts right now,
    // so we'll do a findFirst + update/create logic.

    const existingAlert = await prisma.priceAlert.findFirst({
      where: { userId: session.user.id, productId, isActive: true },
    });

    if (existingAlert) {
      const updated = await prisma.priceAlert.update({
        where: { id: existingAlert.id },
        data: { targetPrice },
      });
      return NextResponse.json({ success: true, alert: updated });
    }

    const newAlert = await prisma.priceAlert.create({
      data: {
        userId: session.user.id,
        productId,
        targetPrice,
        isActive: true,
      },
    });

    return NextResponse.json({ success: true, alert: newAlert }, { status: 201 });
  } catch (error) {
    console.error('Failed to create alert:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
