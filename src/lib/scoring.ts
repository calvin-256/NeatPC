// ===========================================
// NeatPC — Deal Score Algorithm
// ===========================================
// Calculates a 0-100 score indicating how good a deal is.
// Considers: discount from MSRP, drop from 30-day average,
// and current market context.

import prisma from '@/lib/db';

interface DealScoreContext {
  currentPrice: number;
  originalPrice?: number;
  history: { price: number; recordedAt: Date }[];
}

/**
 * Calculate the deal score for a single product.
 * @returns Score from 0 to 100.
 *  - 0-20: Overpriced / Terrible deal
 *  - 21-40: Normal retail / Average
 *  - 41-70: Good deal (solid discount)
 *  - 71-90: Great deal (all-time low or massive discount)
 *  - 91-100: Insane deal (pricing error or clearance)
 */
export function calculateDealScore(context: DealScoreContext): number {
  const { currentPrice, originalPrice, history } = context;
  
  if (currentPrice <= 0) return 0;

  let score = 30; // Baseline score for an average product at retail price

  // 1. MSRP Discount Factor (up to +40 points)
  if (originalPrice && originalPrice > currentPrice) {
    const discountPercent = (originalPrice - currentPrice) / originalPrice;
    // Map a 50% discount to 40 points
    const discountPoints = Math.min(40, discountPercent * 80);
    score += discountPoints;
  } else if (originalPrice && originalPrice < currentPrice) {
    // Selling above MSRP (scalpers) - heavy penalty
    score -= 20;
  }

  // 2. Historical Context Factor (up to +30 points)
  if (history.length > 0) {
    // Only look at the last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const recentHistory = history.filter(h => h.recordedAt >= thirtyDaysAgo);
    
    if (recentHistory.length > 0) {
      const avg30DayPrice = recentHistory.reduce((sum, h) => sum + h.price, 0) / recentHistory.length;
      const min30DayPrice = Math.min(...recentHistory.map(h => h.price));

      // If current price is below the 30-day average, add points
      if (currentPrice < avg30DayPrice) {
        const dropPercent = (avg30DayPrice - currentPrice) / avg30DayPrice;
        // Map a 20% drop from 30-day average to 30 points
        const dropPoints = Math.min(30, dropPercent * 150);
        score += dropPoints;
      } else if (currentPrice > avg30DayPrice) {
        // Price increased recently
        score -= 10;
      }

      // Bonus points if it's hitting a 30-day low (+10 points)
      if (currentPrice <= min30DayPrice) {
        score += 10;
      }
    }
  }

  // Cap between 0 and 100
  return Math.max(0, Math.min(100, Math.round(score)));
}

/**
 * Recalculate and update the deal score for a specific product in the database.
 */
export async function updateProductDealScore(productId: string): Promise<void> {
  const product = await prisma.product.findUnique({
    where: { id: productId },
    include: {
      prices: true,
      priceHistory: {
        orderBy: { recordedAt: 'desc' },
        take: 30, // Just need enough for a 30-day window
      }
    }
  });

  if (!product) return;

  // Find the lowest MSRP/Original Price across retailers
  const originalPrices = product.prices
    .map(p => p.originalPrice)
    .filter((p): p is number => p !== null && p > 0);
  
  const bestOriginalPrice = originalPrices.length > 0 
    ? Math.max(...originalPrices) // Use the highest MSRP as baseline for discounts
    : undefined;

  const score = calculateDealScore({
    currentPrice: product.bestPrice,
    originalPrice: bestOriginalPrice,
    history: product.priceHistory.map(h => ({
      price: h.price,
      recordedAt: h.recordedAt,
    })),
  });

  if (score !== product.dealScore) {
    await prisma.product.update({
      where: { id: productId },
      data: { dealScore: score },
    });
  }
}
