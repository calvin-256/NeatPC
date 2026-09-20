// ===========================================
// NeatPC — Retailer Adapter Types
// ===========================================
// Every retailer (Amazon, Best Buy, etc.) implements
// this interface so they're all interchangeable.

import type { RetailerSlug, DeviceCategory } from '@/types';

/** Raw product data returned from a retailer API */
export interface RawRetailerProduct {
  externalId: string;          // Retailer's product ID (ASIN, SKU, etc.)
  name: string;
  brand: string;
  price: number;
  originalPrice?: number;      // MSRP / crossed-out price
  currency: string;            // Usually 'USD'
  url: string;                 // Product page URL (affiliate link)
  imageUrl: string;
  description: string;
  category?: string;
  rating?: number;             // 0-5
  reviewCount?: number;
  inStock: boolean;
  specs: Record<string, string | number>;  // Raw specs from the retailer
  upc?: string;                // Universal Product Code (for cross-retailer matching)
  modelNumber?: string;        // Manufacturer model number
}

/** Search options for retailer queries */
export interface RetailerSearchOptions {
  query: string;
  category?: DeviceCategory;
  minPrice?: number;
  maxPrice?: number;
  page?: number;
  limit?: number;
  sortBy?: 'price_asc' | 'price_desc' | 'rating' | 'relevance';
}

/** Result of a retailer search */
export interface RetailerSearchResult {
  products: RawRetailerProduct[];
  totalResults: number;
  page: number;
  hasMore: boolean;
  retailer: RetailerSlug;
}

/**
 * Interface that every retailer adapter must implement.
 * This abstraction lets us swap/add retailers without changing business logic.
 */
export interface IRetailerAdapter {
  /** Unique slug identifier */
  readonly slug: RetailerSlug;
  /** Display name */
  readonly name: string;
  /** Whether the adapter is configured and ready to use */
  readonly isConfigured: boolean;

  /**
   * Search for products matching a query.
   * Returns raw retailer data that will be normalized later.
   */
  searchProducts(options: RetailerSearchOptions): Promise<RetailerSearchResult>;

  /**
   * Get a single product by its retailer-specific ID.
   * Returns null if not found.
   */
  getProduct(externalId: string): Promise<RawRetailerProduct | null>;

  /**
   * Get the current price for a product by its retailer-specific ID.
   * Lighter than getProduct() — only fetches price + availability.
   */
  getPrice(externalId: string): Promise<{
    price: number;
    originalPrice?: number;
    inStock: boolean;
    url: string;
  } | null>;
}
