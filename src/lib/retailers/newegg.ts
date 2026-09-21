// ===========================================
// NeatPC — Newegg API Adapter
// ===========================================
// Uses Newegg's public search endpoints to find products.
// Newegg doesn't have a traditional affiliate API — we
// use their public product search and generate affiliate
// links via their partner program.
//
// Setup: Add to .env.local:
//   NEWEGG_API_KEY=your_key (optional, falls back to public endpoints)
//
// Affiliate program: https://www.newegg.com/affiliates

import { BaseRetailerAdapter } from './base';
import type {
  RetailerSearchOptions,
  RetailerSearchResult,
  RawRetailerProduct,
} from './types';

const SEARCH_API = 'https://www.newegg.com/product/api/search';

// Newegg sub-category IDs
const NEWEGG_CATEGORIES: Record<string, number> = {
  laptop: 32,      // Laptops / Notebooks
  desktop: 10,     // Desktops
  phone: 42,       // Cell Phones
  tablet: 33,      // Tablets
};

export class NeweggAdapter extends BaseRetailerAdapter {
  constructor() {
    super({
      slug: 'newegg',
      name: 'Newegg',
      isConfigured: true, // Works without API key via public search
      rateLimit: 15,       // Conservative — scraping public endpoints
      maxRetries: 2,
      retryDelayMs: 2000,
    });
  }

  async searchProducts(options: RetailerSearchOptions): Promise<RetailerSearchResult> {
    const limit = Math.min(options.limit || 10, 36);
    const page = options.page || 1;

    // Build search payload
    const payload: any = {
      keyword: options.query,
      pageNumber: page,
      pageSize: limit,
      bestSellerOnly: false,
      storeType: 1, // Newegg direct
    };

    if (options.category && NEWEGG_CATEGORIES[options.category]) {
      payload.subCategoryId = NEWEGG_CATEGORIES[options.category];
    }

    // Sort mapping
    switch (options.sortBy) {
      case 'price_asc':
        payload.sort = 'PRICE_LOW';
        break;
      case 'price_desc':
        payload.sort = 'PRICE_HIGH';
        break;
      case 'rating':
        payload.sort = 'RATING';
        break;
      default:
        payload.sort = 'BESTMATCH';
    }

    return this.withRetry(async () => {
      const response = await fetch(SEARCH_API, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'NeatPC/1.0 (Price Comparison)',
          Accept: 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(`Newegg search error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      const items = data.ProductListItems || data.products || [];

      let products = items.map((item: any) => this.parseProduct(item));

      // Client-side price filtering
      if (options.minPrice) {
        products = products.filter((p: RawRetailerProduct) => p.price >= options.minPrice!);
      }
      if (options.maxPrice) {
        products = products.filter((p: RawRetailerProduct) => p.price <= options.maxPrice!);
      }

      return {
        products,
        totalResults: data.PaginationInfo?.TotalCount || products.length,
        page,
        hasMore: items.length >= limit,
        retailer: 'newegg' as const,
      };
    }, `searchProducts("${options.query}")`);
  }

  async getProduct(itemNumber: string): Promise<RawRetailerProduct | null> {
    // Use search to find by item number since Newegg doesn't have a direct lookup
    return this.withRetry(async () => {
      const result = await this.searchProducts({
        query: itemNumber,
        limit: 1,
      });

      return result.products[0] || null;
    }, `getProduct("${itemNumber}")`);
  }

  async getPrice(itemNumber: string): Promise<{
    price: number;
    originalPrice?: number;
    inStock: boolean;
    url: string;
  } | null> {
    const product = await this.getProduct(itemNumber);
    if (!product) return null;

    return {
      price: product.price,
      originalPrice: product.originalPrice,
      inStock: product.inStock,
      url: product.url,
    };
  }

  // --- Private ---

  private parseProduct(item: any): RawRetailerProduct {
    const specs: Record<string, string | number> = {};

    // Newegg often has specs in title or description
    const text = `${item.Title || item.title || ''} ${item.Description || ''}`;

    const ramMatch = text.match(/(\d+)\s*GB\s*(DDR\d*\s*)?(RAM|memory)/i);
    if (ramMatch) specs.ramGb = parseInt(ramMatch[1], 10);

    const storageMatch = text.match(/(\d+)\s*(GB|TB)\s*(SSD|NVMe|M\.2|storage)/i);
    if (storageMatch) {
      specs.storageGb = storageMatch[2] === 'TB'
        ? parseInt(storageMatch[1]) * 1000
        : parseInt(storageMatch[1]);
      specs.storageType = 'SSD';
    }

    const displayMatch = text.match(/([\d.]+)[\s-]*(?:inch|"|'')/i);
    if (displayMatch) specs.displaySize = parseFloat(displayMatch[1]);

    const cpuMatch = text.match(/(Intel\s+Core\s+(?:Ultra\s+)?\w+[-\s]\d+\w*|AMD\s+Ryzen\s+\d\s+\d+\w*|Apple\s+M\d\s*\w*)/i);
    if (cpuMatch) specs.cpu = cpuMatch[1];

    const gpuMatch = text.match(/(NVIDIA\s+(?:GeForce\s+)?RTX\s+\d+\w*|AMD\s+Radeon\s+RX\s+\d+\w*|Intel\s+(?:Arc\s+)?\w+\s+Graphics)/i);
    if (gpuMatch) specs.gpu = gpuMatch[1];

    const price = item.FinalPrice || item.CurrentPrice || item.price || 0;
    const originalPrice = item.OriginalPrice || item.originalPrice;
    const itemNumber = item.ItemNumber || item.itemNumber || item.id || '';

    return {
      externalId: String(itemNumber),
      name: item.Title || item.title || '',
      brand: item.Brand || item.brand || this.extractBrand(item.Title || item.title || ''),
      price: typeof price === 'string' ? parseFloat(price.replace(/[^0-9.]/g, '')) : price,
      originalPrice: originalPrice && originalPrice !== price
        ? (typeof originalPrice === 'string' ? parseFloat(originalPrice.replace(/[^0-9.]/g, '')) : originalPrice)
        : undefined,
      currency: 'USD',
      url: item.Link || item.link || `https://www.newegg.com/p/${itemNumber}`,
      imageUrl: item.Image || item.image || '',
      description: item.Description || item.description || '',
      category: item.CategoryPath || '',
      rating: item.ReviewSummary?.Rating || item.rating || undefined,
      reviewCount: item.ReviewSummary?.TotalReviews || item.reviewCount || undefined,
      inStock: item.Instock ?? item.instock ?? true,
      specs,
      modelNumber: item.Model || item.model,
    };
  }

  /** Extract brand from product title (first word is usually the brand) */
  private extractBrand(title: string): string {
    const knownBrands = [
      'ASUS', 'Acer', 'Apple', 'Dell', 'Framework', 'Google', 'HP',
      'Lenovo', 'LG', 'MSI', 'Microsoft', 'Motorola', 'OnePlus',
      'Razer', 'Samsung', 'Sony', 'Toshiba', 'Xiaomi',
    ];

    for (const brand of knownBrands) {
      if (title.toLowerCase().includes(brand.toLowerCase())) {
        return brand;
      }
    }

    return title.split(' ')[0] || '';
  }
}
