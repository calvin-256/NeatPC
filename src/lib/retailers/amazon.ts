// ===========================================
// NeatPC — Amazon Product Advertising API Adapter
// ===========================================
// Integrates with Amazon PA-API 5.0 to search products,
// get prices, and generate affiliate links.
//
// Setup: Add these to .env.local:
//   AMAZON_ACCESS_KEY=your_key
//   AMAZON_SECRET_KEY=your_secret
//   AMAZON_PARTNER_TAG=your_associate_tag
//
// Sign up at: https://affiliate-program.amazon.com/

import { BaseRetailerAdapter } from './base';
import type {
  RetailerSearchOptions,
  RetailerSearchResult,
  RawRetailerProduct,
} from './types';
import config from '@/lib/config';
import crypto from 'crypto';

// PA-API 5.0 endpoint
const PAAPI_HOST = 'webservices.amazon.com';
const PAAPI_REGION = 'us-east-1';
const PAAPI_SERVICE = 'ProductAdvertisingAPI';

// Category mapping to Amazon search indices
const CATEGORY_TO_SEARCH_INDEX: Record<string, string> = {
  laptop: 'Computers',
  desktop: 'Computers',
  phone: 'Wireless',
  tablet: 'Computers',
};

export class AmazonAdapter extends BaseRetailerAdapter {
  private accessKey: string;
  private secretKey: string;
  private partnerTag: string;

  constructor() {
    super({
      slug: 'amazon',
      name: 'Amazon',
      isConfigured: config.retailers.amazon.isConfigured,
      rateLimit: 10, // PA-API allows 1 req/sec, we limit to 10/min to be safe
      maxRetries: 2,
    });

    this.accessKey = config.retailers.amazon.accessKey;
    this.secretKey = config.retailers.amazon.secretKey;
    this.partnerTag = config.retailers.amazon.partnerTag;
  }

  // --- Public Methods ---

  async searchProducts(options: RetailerSearchOptions): Promise<RetailerSearchResult> {
    this.assertConfigured();

    const searchIndex = options.category
      ? CATEGORY_TO_SEARCH_INDEX[options.category] || 'All'
      : 'All';

    const payload = {
      Keywords: options.query,
      SearchIndex: searchIndex,
      ItemCount: Math.min(options.limit || 10, 10), // PA-API max is 10
      PartnerTag: this.partnerTag,
      PartnerType: 'Associates',
      Resources: [
        'Images.Primary.Large',
        'ItemInfo.Title',
        'ItemInfo.ByLineInfo',
        'ItemInfo.Features',
        'ItemInfo.ProductInfo',
        'ItemInfo.TechnicalInfo',
        'ItemInfo.Classifications',
        'Offers.Listings.Price',
        'Offers.Listings.SavingBasis',
        'Offers.Listings.Availability.Type',
        'Offers.Listings.DeliveryInfo.IsAmazonFulfilled',
      ],
    };

    // Apply price filter
    if (options.minPrice || options.maxPrice) {
      (payload as any).MinPrice = options.minPrice ? Math.round(options.minPrice * 100) : undefined;
      (payload as any).MaxPrice = options.maxPrice ? Math.round(options.maxPrice * 100) : undefined;
    }

    // Apply sorting
    if (options.sortBy === 'price_asc') {
      (payload as any).SortBy = 'Price:LowToHigh';
    } else if (options.sortBy === 'price_desc') {
      (payload as any).SortBy = 'Price:HighToLow';
    } else if (options.sortBy === 'rating') {
      (payload as any).SortBy = 'AvgCustomerReviews';
    }

    return this.withRetry(async () => {
      const response = await this.signedRequest('SearchItems', payload);
      const data = await response.json();

      if (!data.SearchResult?.Items) {
        return {
          products: [],
          totalResults: 0,
          page: options.page || 1,
          hasMore: false,
          retailer: 'amazon',
        };
      }

      const products = data.SearchResult.Items.map((item: any) =>
        this.parseItem(item)
      );

      return {
        products,
        totalResults: data.SearchResult.TotalResultCount || products.length,
        page: options.page || 1,
        hasMore: data.SearchResult.TotalResultCount > (options.limit || 10),
        retailer: 'amazon' as const,
      };
    }, `searchProducts("${options.query}")`);
  }

  async getProduct(asin: string): Promise<RawRetailerProduct | null> {
    this.assertConfigured();

    const payload = {
      ItemIds: [asin],
      PartnerTag: this.partnerTag,
      PartnerType: 'Associates',
      Resources: [
        'Images.Primary.Large',
        'ItemInfo.Title',
        'ItemInfo.ByLineInfo',
        'ItemInfo.Features',
        'ItemInfo.ProductInfo',
        'ItemInfo.TechnicalInfo',
        'ItemInfo.Classifications',
        'ItemInfo.ExternalIds',
        'Offers.Listings.Price',
        'Offers.Listings.SavingBasis',
        'Offers.Listings.Availability.Type',
        'CustomerReviews.Count',
        'CustomerReviews.StarRating',
      ],
    };

    return this.withRetry(async () => {
      const response = await this.signedRequest('GetItems', payload);
      const data = await response.json();

      if (!data.ItemsResult?.Items?.[0]) {
        return null;
      }

      return this.parseItem(data.ItemsResult.Items[0]);
    }, `getProduct("${asin}")`);
  }

  async getPrice(asin: string): Promise<{
    price: number;
    originalPrice?: number;
    inStock: boolean;
    url: string;
  } | null> {
    this.assertConfigured();

    const payload = {
      ItemIds: [asin],
      PartnerTag: this.partnerTag,
      PartnerType: 'Associates',
      Resources: [
        'Offers.Listings.Price',
        'Offers.Listings.SavingBasis',
        'Offers.Listings.Availability.Type',
      ],
    };

    return this.withRetry(async () => {
      const response = await this.signedRequest('GetItems', payload);
      const data = await response.json();

      const item = data.ItemsResult?.Items?.[0];
      if (!item) return null;

      const listing = item.Offers?.Listings?.[0];
      if (!listing) return null;

      return {
        price: listing.Price?.Amount || 0,
        originalPrice: listing.SavingBasis?.Amount,
        inStock: listing.Availability?.Type === 'Now',
        url: this.buildAffiliateUrl(item.DetailPageURL || '', {
          tag: this.partnerTag,
        }),
      };
    }, `getPrice("${asin}")`);
  }

  // --- Private Helpers ---

  /** Parse a PA-API item response into our RawRetailerProduct format */
  private parseItem(item: any): RawRetailerProduct {
    const listing = item.Offers?.Listings?.[0];
    const info = item.ItemInfo || {};

    // Extract specs from features and technical info
    const specs: Record<string, string | number> = {};
    const features = info.Features?.DisplayValues || [];
    for (const feature of features) {
      // Try to parse key specs from feature bullets
      const lower = feature.toLowerCase();
      if (lower.includes('ram') || lower.includes('memory')) {
        const match = feature.match(/(\d+)\s*GB\s*(RAM|memory)/i);
        if (match) specs.ramGb = parseInt(match[1], 10);
      }
      if (lower.includes('ssd') || lower.includes('storage')) {
        const match = feature.match(/(\d+)\s*(GB|TB)\s*(SSD|storage)/i);
        if (match) {
          specs.storageGb = match[2] === 'TB' ? parseInt(match[1]) * 1000 : parseInt(match[1]);
          specs.storageType = 'SSD';
        }
      }
      if (lower.includes('display') || lower.includes('screen') || lower.includes('inch')) {
        const match = feature.match(/([\d.]+)[\s-]*(inch|")/i);
        if (match) specs.displaySize = parseFloat(match[1]);
      }
    }

    // Technical info
    if (info.TechnicalInfo?.DisplayValues) {
      for (const tech of info.TechnicalInfo.DisplayValues) {
        if (tech.Type === 'OperatingSystem') specs.os = tech.DisplayValue;
        if (tech.Type === 'ProcessorBrand') specs.cpu = tech.DisplayValue;
      }
    }

    return {
      externalId: item.ASIN,
      name: info.Title?.DisplayValue || '',
      brand: info.ByLineInfo?.Brand?.DisplayValue || info.ByLineInfo?.Manufacturer?.DisplayValue || '',
      price: listing?.Price?.Amount || 0,
      originalPrice: listing?.SavingBasis?.Amount,
      currency: listing?.Price?.Currency || 'USD',
      url: this.buildAffiliateUrl(item.DetailPageURL || '', {
        tag: this.partnerTag,
      }),
      imageUrl: item.Images?.Primary?.Large?.URL || '',
      description: features.join(' '),
      category: info.Classifications?.Binding?.DisplayValue || '',
      rating: item.CustomerReviews?.StarRating?.Value,
      reviewCount: item.CustomerReviews?.Count,
      inStock: listing?.Availability?.Type === 'Now',
      specs,
      upc: info.ExternalIds?.UPCs?.DisplayValues?.[0],
      modelNumber: info.ProductInfo?.ModelNumber?.DisplayValue,
    };
  }

  // --- AWS Signature V4 ---

  /** Make a signed request to the PA-API */
  private async signedRequest(operation: string, payload: any): Promise<Response> {
    const target = `com.amazon.paapi5.v1.ProductAdvertisingAPIv1.${operation}`;
    const path = `/paapi5/${operation.toLowerCase()}`;
    const body = JSON.stringify(payload);
    const now = new Date();

    const dateStamp = now.toISOString().replace(/[-:T]/g, '').slice(0, 8);
    const amzDate = now.toISOString().replace(/[-:]/g, '').replace(/\.\d+/, '');
    const credentialScope = `${dateStamp}/${PAAPI_REGION}/${PAAPI_SERVICE}/aws4_request`;

    // Headers
    const headers: Record<string, string> = {
      'content-type': 'application/json; charset=utf-8',
      'content-encoding': 'amz-1.0',
      host: PAAPI_HOST,
      'x-amz-date': amzDate,
      'x-amz-target': target,
    };

    // Canonical request
    const signedHeaders = Object.keys(headers).sort().join(';');
    const canonicalHeaders = Object.keys(headers)
      .sort()
      .map((k) => `${k}:${headers[k]}`)
      .join('\n');
    const payloadHash = crypto.createHash('sha256').update(body).digest('hex');

    const canonicalRequest = [
      'POST',
      path,
      '', // query string (empty)
      canonicalHeaders + '\n',
      signedHeaders,
      payloadHash,
    ].join('\n');

    // String to sign
    const canonicalRequestHash = crypto
      .createHash('sha256')
      .update(canonicalRequest)
      .digest('hex');

    const stringToSign = [
      'AWS4-HMAC-SHA256',
      amzDate,
      credentialScope,
      canonicalRequestHash,
    ].join('\n');

    // Signing key
    const kDate = this.hmac(`AWS4${this.secretKey}`, dateStamp);
    const kRegion = this.hmac(kDate, PAAPI_REGION);
    const kService = this.hmac(kRegion, PAAPI_SERVICE);
    const kSigning = this.hmac(kService, 'aws4_request');

    // Signature
    const signature = crypto
      .createHmac('sha256', kSigning)
      .update(stringToSign)
      .digest('hex');

    // Authorization header
    headers['authorization'] = [
      `AWS4-HMAC-SHA256 Credential=${this.accessKey}/${credentialScope}`,
      `SignedHeaders=${signedHeaders}`,
      `Signature=${signature}`,
    ].join(', ');

    const url = `https://${PAAPI_HOST}${path}`;
    return fetch(url, {
      method: 'POST',
      headers,
      body,
    });
  }

  private hmac(key: string | Buffer, data: string): Buffer {
    return crypto.createHmac('sha256', key).update(data).digest();
  }
}
