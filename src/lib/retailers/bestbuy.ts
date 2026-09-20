// ===========================================
// NeatPC — Best Buy Products API Adapter
// ===========================================
// Integrates with the Best Buy Products API to search,
// get product details, and check prices.
//
// Setup: Add to .env.local:
//   BESTBUY_API_KEY=your_key
//
// Get a key at: https://developer.bestbuy.com/

import { BaseRetailerAdapter } from './base';
import type {
  RetailerSearchOptions,
  RetailerSearchResult,
  RawRetailerProduct,
} from './types';
import config from '@/lib/config';

const API_BASE = 'https://api.bestbuy.com/v1';

// Category mapping to Best Buy category path IDs
const CATEGORY_FILTERS: Record<string, string> = {
  laptop: '(categoryPath.id=abcat0502000)', // Laptops
  desktop: '(categoryPath.id=abcat0501000)', // Desktops
  phone: '(categoryPath.id=pcmcat209400050001)', // Cell Phones
  tablet: '(categoryPath.id=pcmcat209000050006)', // Tablets
};

// Fields to request from the API
const PRODUCT_FIELDS = [
  'sku',
  'name',
  'manufacturer',
  'salePrice',
  'regularPrice',
  'onSale',
  'url',
  'addToCartUrl',
  'image',
  'largeFrontImage',
  'mediumImage',
  'shortDescription',
  'longDescription',
  'categoryPath',
  'customerReviewAverage',
  'customerReviewCount',
  'onlineAvailability',
  'inStoreAvailability',
  'upc',
  'modelNumber',
  'details.name',
  'details.value',
  'features.feature',
].join(',');

export class BestBuyAdapter extends BaseRetailerAdapter {
  private apiKey: string;

  constructor() {
    super({
      slug: 'bestbuy',
      name: 'Best Buy',
      isConfigured: config.retailers.bestbuy.isConfigured,
      rateLimit: 50, // Best Buy allows 50 req/sec but we cap at 50/min
      maxRetries: 2,
    });

    this.apiKey = config.retailers.bestbuy.apiKey;
  }

  // --- Public Methods ---

  async searchProducts(options: RetailerSearchOptions): Promise<RetailerSearchResult> {
    this.assertConfigured();

    const limit = Math.min(options.limit || 10, 100);
    const page = options.page || 1;

    // Build search query
    let searchQuery = `(search=${encodeURIComponent(options.query)})`;

    // Add category filter
    if (options.category && CATEGORY_FILTERS[options.category]) {
      searchQuery += `&${CATEGORY_FILTERS[options.category]}`;
    }

    // Add price filters
    if (options.minPrice) {
      searchQuery += `&(salePrice>=${options.minPrice})`;
    }
    if (options.maxPrice) {
      searchQuery += `&(salePrice<=${options.maxPrice})`;
    }

    // Only show available products
    searchQuery += '&(onlineAvailability=true)';

    // Build sort
    let sort = 'bestSellingRank.asc';
    switch (options.sortBy) {
      case 'price_asc':
        sort = 'salePrice.asc';
        break;
      case 'price_desc':
        sort = 'salePrice.desc';
        break;
      case 'rating':
        sort = 'customerReviewAverage.desc';
        break;
      case 'relevance':
      default:
        sort = 'bestSellingRank.asc';
    }

    return this.withRetry(async () => {
      const url = `${API_BASE}/products${searchQuery}?apiKey=${this.apiKey}&format=json&show=${PRODUCT_FIELDS}&sort=${sort}&pageSize=${limit}&page=${page}`;

      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`Best Buy API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();

      const products = (data.products || []).map((item: any) =>
        this.parseProduct(item)
      );

      return {
        products,
        totalResults: data.totalPages ? data.totalPages * limit : products.length,
        page,
        hasMore: page < (data.totalPages || 1),
        retailer: 'bestbuy' as const,
      };
    }, `searchProducts("${options.query}")`);
  }

  async getProduct(sku: string): Promise<RawRetailerProduct | null> {
    this.assertConfigured();

    return this.withRetry(async () => {
      const url = `${API_BASE}/products/${sku}.json?apiKey=${this.apiKey}&show=${PRODUCT_FIELDS}`;

      const response = await fetch(url);

      if (response.status === 404) return null;
      if (!response.ok) {
        throw new Error(`Best Buy API error: ${response.status}`);
      }

      const data = await response.json();
      return this.parseProduct(data);
    }, `getProduct("${sku}")`);
  }

  async getPrice(sku: string): Promise<{
    price: number;
    originalPrice?: number;
    inStock: boolean;
    url: string;
  } | null> {
    this.assertConfigured();

    return this.withRetry(async () => {
      const url = `${API_BASE}/products/${sku}.json?apiKey=${this.apiKey}&show=sku,salePrice,regularPrice,onlineAvailability,url`;

      const response = await fetch(url);

      if (response.status === 404) return null;
      if (!response.ok) {
        throw new Error(`Best Buy API error: ${response.status}`);
      }

      const data = await response.json();

      return {
        price: data.salePrice || 0,
        originalPrice: data.regularPrice !== data.salePrice ? data.regularPrice : undefined,
        inStock: data.onlineAvailability || false,
        url: this.buildAffiliateUrl(data.url || ''),
      };
    }, `getPrice("${sku}")`);
  }

  // --- Private Helpers ---

  /** Parse a Best Buy product response into our format */
  private parseProduct(item: any): RawRetailerProduct {
    const specs: Record<string, string | number> = {};

    // Extract specs from the 'details' array
    if (item.details && Array.isArray(item.details)) {
      for (const detail of item.details) {
        const name = (detail.name || '').toLowerCase();
        const value = detail.value || '';

        // Map Best Buy detail names to our spec keys
        if (name.includes('processor') && name.includes('model')) {
          specs.cpu = value;
        } else if (name.includes('system memory') || name === 'ram') {
          const num = parseFloat(value);
          if (num) specs.ramGb = num;
        } else if (name.includes('total storage') || name.includes('hard drive capacity')) {
          const num = parseFloat(value);
          if (num) specs.storageGb = value.toLowerCase().includes('tb') ? num * 1000 : num;
        } else if (name.includes('storage type')) {
          specs.storageType = value;
        } else if (name.includes('screen size')) {
          const num = parseFloat(value);
          if (num) specs.displaySize = num;
        } else if (name.includes('screen resolution')) {
          specs.displayResolution = value;
        } else if (name.includes('graphics')) {
          specs.gpu = value;
        } else if (name.includes('operating system')) {
          specs.os = value;
        } else if (name.includes('battery life')) {
          const num = parseFloat(value);
          if (num) specs.batteryHours = num;
        } else if (name.includes('weight')) {
          specs.weight = value;
        } else if (name.includes('refresh rate')) {
          const num = parseInt(value, 10);
          if (num) specs.refreshRate = num;
        } else if (name.includes('front-facing camera') || name.includes('rear camera')) {
          const num = parseFloat(value);
          if (num) specs.cameraMp = num;
        }
      }
    }

    // Determine description from features or short description
    let description = item.shortDescription || '';
    if (item.features && Array.isArray(item.features)) {
      const featureTexts = item.features
        .map((f: any) => f.feature || '')
        .filter(Boolean);
      if (featureTexts.length > 0) {
        description = featureTexts.join(' ');
      }
    }

    return {
      externalId: String(item.sku),
      name: item.name || '',
      brand: item.manufacturer || '',
      price: item.salePrice || 0,
      originalPrice: item.regularPrice !== item.salePrice ? item.regularPrice : undefined,
      currency: 'USD',
      url: this.buildAffiliateUrl(item.url || ''),
      imageUrl: item.largeFrontImage || item.mediumImage || item.image || '',
      description,
      category: item.categoryPath?.map((c: any) => c.name).join(' > ') || '',
      rating: item.customerReviewAverage || undefined,
      reviewCount: item.customerReviewCount || undefined,
      inStock: item.onlineAvailability || false,
      specs,
      upc: item.upc,
      modelNumber: item.modelNumber,
    };
  }
}
