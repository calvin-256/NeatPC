// ===========================================
// NeatPC — Background Price Sync Engine
// ===========================================
// Engine for synchronizing prices across all configured retailers,
// updating database records, and recording price history.

import prisma from '@/lib/db';
import { getAdapter, getConfiguredAdapters } from './index';
import { updateProductDealScore } from '@/lib/scoring';

export interface SyncStats {
  productsChecked: number;
  pricesUpdated: number;
  pricesFailed: number;
  durationMs: number;
}

/**
 * Synchronize prices for a list of product IDs.
 * Queries each retailer the product is linked to.
 */
export async function syncPrices(productIds: string[]): Promise<SyncStats> {
  const startTime = Date.now();
  let pricesUpdated = 0;
  let pricesFailed = 0;

  // 1. Fetch products with their current retailer links
  const products = await prisma.product.findMany({
    where: { id: { in: productIds } },
    include: { prices: true },
  });

  // 2. Iterate through products
  for (const product of products) {
    let bestPrice = product.bestPrice;
    let priceUpdated = false;

    // Iterate through linked retailers
    for (const retailerPrice of product.prices) {
      const adapter = getAdapter(retailerPrice.retailer as any);
      
      if (!adapter || !adapter.isConfigured) {
        continue;
      }

      try {
        // Fetch fresh price
        const freshData = await adapter.getPrice(retailerPrice.productId);
        
        if (freshData) {
          // Update RetailerPrice
          await prisma.retailerPrice.update({
            where: { id: retailerPrice.id },
            data: {
              price: freshData.price,
              originalPrice: freshData.originalPrice,
              inStock: freshData.inStock,
              url: freshData.url,
              lastChecked: new Date(),
            },
          });

          // Record PriceHistory
          await prisma.priceHistory.create({
            data: {
              productId: product.id,
              retailer: retailerPrice.retailer,
              price: freshData.price,
            },
          });

          // Update Best Price
          if (freshData.inStock && (bestPrice === 0 || freshData.price < bestPrice)) {
            bestPrice = freshData.price;
          }

          pricesUpdated++;
          priceUpdated = true;
        } else {
          // Product not found or out of stock at retailer
          await prisma.retailerPrice.update({
            where: { id: retailerPrice.id },
            data: {
              inStock: false,
              lastChecked: new Date(),
            },
          });
        }
      } catch (error) {
        console.error(`[Sync] Failed to fetch price for ${product.name} from ${retailerPrice.retailer}:`, error);
        pricesFailed++;
      }
    }

    // 3. Update Product bestPrice if changed
    if (priceUpdated && bestPrice !== product.bestPrice) {
      await prisma.product.update({
        where: { id: product.id },
        data: { bestPrice },
      });
    }

    // 4. Always recalculate the deal score for this product
    if (priceUpdated) {
      await updateProductDealScore(product.id);
    }
  }

  return {
    productsChecked: products.length,
    pricesUpdated,
    pricesFailed,
    durationMs: Date.now() - startTime,
  };
}

/**
 * Perform a full synchronization of all products in the database.
 * Used by the background cron job.
 */
export async function syncAllPrices(batchSize = 50): Promise<SyncStats> {
  const startTime = Date.now();
  let totalUpdated = 0;
  let totalFailed = 0;
  
  // Get all product IDs
  const allProducts = await prisma.product.findMany({
    select: { id: true },
  });
  
  const productIds = allProducts.map(p => p.id);
  
  // Process in batches
  for (let i = 0; i < productIds.length; i += batchSize) {
    const batch = productIds.slice(i, i + batchSize);
    const stats = await syncPrices(batch);
    
    totalUpdated += stats.pricesUpdated;
    totalFailed += stats.pricesFailed;
  }
  
  return {
    productsChecked: productIds.length,
    pricesUpdated: totalUpdated,
    pricesFailed: totalFailed,
    durationMs: Date.now() - startTime,
  };
}
