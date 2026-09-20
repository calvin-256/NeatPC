// ===========================================
// NeatPC — Retailer Registry
// ===========================================
// Central registry of all retailer adapters.
// Import from here to access any retailer.

import type { RetailerSlug } from '@/types';
import type { IRetailerAdapter } from './types';

// Re-export types
export type { IRetailerAdapter, RawRetailerProduct, RetailerSearchOptions, RetailerSearchResult } from './types';
export { BaseRetailerAdapter } from './base';
export { normalizeSpecs, getMatchingKey, detectCategory, generateProductSlug } from './normalizer';

// Import adapters
import { AmazonAdapter } from './amazon';
import { BestBuyAdapter } from './bestbuy';

// --- Adapter Registry ---

const adapters = new Map<RetailerSlug, IRetailerAdapter>();

/** Register a retailer adapter */
export function registerAdapter(adapter: IRetailerAdapter): void {
  adapters.set(adapter.slug, adapter);
}

/** Get a specific retailer adapter */
export function getAdapter(slug: RetailerSlug): IRetailerAdapter | undefined {
  return adapters.get(slug);
}

/** Get all registered adapters */
export function getAllAdapters(): IRetailerAdapter[] {
  return Array.from(adapters.values());
}

/** Get only configured (ready-to-use) adapters */
export function getConfiguredAdapters(): IRetailerAdapter[] {
  return getAllAdapters().filter((a) => a.isConfigured);
}

/**
 * Search across all configured retailers simultaneously.
 * Returns merged results from every available adapter.
 */
export async function searchAllRetailers(
  query: string,
  options?: { category?: string; maxPrice?: number; limit?: number }
) {
  const configured = getConfiguredAdapters();

  if (configured.length === 0) {
    console.warn('No retailer adapters are configured. Add API keys to .env.local');
    return [];
  }

  const results = await Promise.allSettled(
    configured.map((adapter) =>
      adapter.searchProducts({
        query,
        category: options?.category as any,
        maxPrice: options?.maxPrice,
        limit: options?.limit ?? 10,
      })
    )
  );

  // Collect successful results, log failures
  const allProducts = [];
  for (let i = 0; i < results.length; i++) {
    const result = results[i];
    if (result.status === 'fulfilled') {
      allProducts.push(...result.value.products);
    } else {
      console.error(
        `[${configured[i].slug}] Search failed:`,
        result.reason?.message || result.reason
      );
    }
  }

  return allProducts;
}

// --- Auto-register all adapters ---
registerAdapter(new AmazonAdapter());
registerAdapter(new BestBuyAdapter());
// Future: registerAdapter(new NeweggAdapter());
