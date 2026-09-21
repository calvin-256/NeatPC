// ===========================================
// NeatPC — Walmart Affiliate API Adapter
// ===========================================
// Integrates with Walmart's Affiliate API for product
// search, pricing, and affiliate link generation.
//
// Setup: Add to .env.local:
//   WALMART_API_KEY=your_key
//
// Sign up at: https://affiliates.walmart.com/

import { BaseRetailerAdapter } from './base';
import type {
  RetailerSearchOptions,
  RetailerSearchResult,
  RawRetailerProduct,
} from './types';
import config from '@/lib/config';

const API_BASE = 'https://developer.api.walmart.com/api-proxy/service/affil/product/v2';

// Category mapping to Walmart category IDs
const CATEGORY_IDS: Record<string, string> = {
  laptop: '3944_3951_1089430_132960',
  desktop: '3944_3951_132982',
  phone: '1105910_7702908',
  tablet: '3944_1078524',
};

export class WalmartAdapter extends BaseRetailerAdapter {
  private apiKey: string;

  constructor() {
    super({
      slug: 'walmart',
      name: 'Walmart',
      isConfigured: config.retailers.walmart.isConfigured,
      rateLimit: 20, // Conservative rate limit
      maxRetries: 2,
    });

    this.apiKey = config.retailers.walmart.apiKey;
  }

  async searchProducts(options: RetailerSearchOptions): Promise<RetailerSearchResult> {
    this.assertConfigured();

    const limit = Math.min(options.limit || 10, 25);
    const start = ((options.page || 1) - 1) * limit;

    const params = new URLSearchParams({
      query: options.query,
      numItems: String(limit),
      start: String(start),
      format: 'json',
    });

    if (options.category && CATEGORY_IDS[options.category]) {
      params.set('categoryId', CATEGORY_IDS[options.category]);
    }

    if (options.sortBy === 'price_asc') params.set('sort', 'price');
    else if (options.sortBy === 'price_desc') params.set('sort', 'price');
    else if (options.sortBy === 'rating') params.set('sort', 'customerRating');
    else params.set('sort', 'relevance');

    return this.withRetry(async () => {
      const response = await fetch(`${API_BASE}/search?${params}`, {
        headers: this.getHeaders(),
      });

      if (!response.ok) {
        throw new Error(`Walmart API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      const items = data.items || [];

      let products = items.map((item: any) => this.parseProduct(item));

      // Client-side price filtering (Walmart API doesn't support it natively)
      if (options.minPrice) {
        products = products.filter((p: RawRetailerProduct) => p.price >= options.minPrice!);
      }
      if (options.maxPrice) {
        products = products.filter((p: RawRetailerProduct) => p.price <= options.maxPrice!);
      }

      return {
        products,
        totalResults: data.totalResults || products.length,
        page: options.page || 1,
        hasMore: start + limit < (data.totalResults || 0),
        retailer: 'walmart' as const,
      };
    }, `searchProducts("${options.query}")`);
  }

  async getProduct(itemId: string): Promise<RawRetailerProduct | null> {
    this.assertConfigured();

    return this.withRetry(async () => {
      const response = await fetch(`${API_BASE}/items/${itemId}?format=json`, {
        headers: this.getHeaders(),
      });

      if (response.status === 404) return null;
      if (!response.ok) throw new Error(`Walmart API error: ${response.status}`);

      const data = await response.json();
      return this.parseProduct(data);
    }, `getProduct("${itemId}")`);
  }

  async getPrice(itemId: string): Promise<{
    price: number;
    originalPrice?: number;
    inStock: boolean;
    url: string;
  } | null> {
    this.assertConfigured();

    return this.withRetry(async () => {
      const response = await fetch(`${API_BASE}/items/${itemId}?format=json`, {
        headers: this.getHeaders(),
      });

      if (response.status === 404) return null;
      if (!response.ok) throw new Error(`Walmart API error: ${response.status}`);

      const data = await response.json();

      return {
        price: data.salePrice || data.msrp || 0,
        originalPrice: data.msrp !== data.salePrice ? data.msrp : undefined,
        inStock: data.stock === 'Available',
        url: this.buildAffiliateUrl(data.productUrl || data.affiliateAddToCartUrl || ''),
      };
    }, `getPrice("${itemId}")`);
  }

  // --- Private ---

  private getHeaders(): Record<string, string> {
    return {
      'WM_SEC.ACCESS_TOKEN': this.apiKey,
      'WM_CONSUMER.CHANNEL.TYPE': '0',
      Accept: 'application/json',
    };
  }

  private parseProduct(item: any): RawRetailerProduct {
    const specs: Record<string, string | number> = {};

    // Parse specs from short/long description
    const desc = `${item.shortDescription || ''} ${item.longDescription || ''}`;

    const ramMatch = desc.match(/(\d+)\s*GB\s*(RAM|memory)/i);
    if (ramMatch) specs.ramGb = parseInt(ramMatch[1], 10);

    const storageMatch = desc.match(/(\d+)\s*(GB|TB)\s*(SSD|storage|hard\s*drive)/i);
    if (storageMatch) {
      specs.storageGb = storageMatch[2] === 'TB'
        ? parseInt(storageMatch[1]) * 1000
        : parseInt(storageMatch[1]);
    }

    const displayMatch = desc.match(/([\d.]+)[\s-]*(?:inch|")/i);
    if (displayMatch) specs.displaySize = parseFloat(displayMatch[1]);

    const cpuMatch = desc.match(/(Intel\s+Core\s+\w+[-\s]\d+\w*|AMD\s+Ryzen\s+\d\s+\d+\w*|Apple\s+M\d\s*\w*|Snapdragon\s+\d+)/i);
    if (cpuMatch) specs.cpu = cpuMatch[1];

    return {
      externalId: String(item.itemId),
      name: item.name || '',
      brand: item.brandName || '',
      price: item.salePrice || item.msrp || 0,
      originalPrice: item.msrp !== item.salePrice ? item.msrp : undefined,
      currency: 'USD',
      url: this.buildAffiliateUrl(item.productUrl || item.affiliateAddToCartUrl || ''),
      imageUrl: item.largeImage || item.mediumImage || item.thumbnailImage || '',
      description: item.shortDescription || '',
      category: item.categoryPath || '',
      rating: item.customerRating ? parseFloat(item.customerRating) : undefined,
      reviewCount: item.numReviews || undefined,
      inStock: item.stock === 'Available',
      specs,
      upc: item.upc,
      modelNumber: item.modelNumber,
    };
  }
}
