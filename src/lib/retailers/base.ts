// ===========================================
// NeatPC — Base Retailer Adapter
// ===========================================
// Shared logic that all retailer adapters inherit.
// Handles rate limiting, retries, and error logging.

import type { RetailerSlug } from '@/types';
import type {
  IRetailerAdapter,
  RetailerSearchOptions,
  RetailerSearchResult,
  RawRetailerProduct,
} from './types';

/** Configuration for the base adapter */
interface BaseAdapterConfig {
  slug: RetailerSlug;
  name: string;
  isConfigured: boolean;
  /** Max requests per minute */
  rateLimit?: number;
  /** Max retries on failure */
  maxRetries?: number;
  /** Base delay between retries (ms), doubled each retry */
  retryDelayMs?: number;
}

export abstract class BaseRetailerAdapter implements IRetailerAdapter {
  readonly slug: RetailerSlug;
  readonly name: string;
  readonly isConfigured: boolean;

  private rateLimit: number;
  private maxRetries: number;
  private retryDelayMs: number;
  private requestTimestamps: number[] = [];

  constructor(config: BaseAdapterConfig) {
    this.slug = config.slug;
    this.name = config.name;
    this.isConfigured = config.isConfigured;
    this.rateLimit = config.rateLimit ?? 30;
    this.maxRetries = config.maxRetries ?? 3;
    this.retryDelayMs = config.retryDelayMs ?? 1000;
  }

  // --- Rate Limiting ---

  /** Wait if we've exceeded the rate limit */
  protected async throttle(): Promise<void> {
    const now = Date.now();
    const windowMs = 60_000; // 1 minute window

    // Remove timestamps older than the window
    this.requestTimestamps = this.requestTimestamps.filter(
      (ts) => now - ts < windowMs
    );

    if (this.requestTimestamps.length >= this.rateLimit) {
      const oldestInWindow = this.requestTimestamps[0];
      const waitMs = windowMs - (now - oldestInWindow) + 100;
      console.log(`[${this.slug}] Rate limit reached, waiting ${waitMs}ms`);
      await new Promise((resolve) => setTimeout(resolve, waitMs));
    }

    this.requestTimestamps.push(Date.now());
  }

  // --- Retry Logic ---

  /** Execute a function with retries and exponential backoff */
  protected async withRetry<T>(
    operation: () => Promise<T>,
    context: string
  ): Promise<T> {
    let lastError: Error | null = null;

    for (let attempt = 0; attempt <= this.maxRetries; attempt++) {
      try {
        await this.throttle();
        return await operation();
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));

        if (attempt < this.maxRetries) {
          const delay = this.retryDelayMs * Math.pow(2, attempt);
          console.warn(
            `[${this.slug}] ${context} failed (attempt ${attempt + 1}/${this.maxRetries + 1}), retrying in ${delay}ms:`,
            lastError.message
          );
          await new Promise((resolve) => setTimeout(resolve, delay));
        }
      }
    }

    console.error(`[${this.slug}] ${context} failed after ${this.maxRetries + 1} attempts`);
    throw lastError;
  }

  // --- Helpers ---

  /** Build an affiliate URL with tracking parameters */
  protected buildAffiliateUrl(baseUrl: string, params?: Record<string, string>): string {
    try {
      const url = new URL(baseUrl);
      if (params) {
        Object.entries(params).forEach(([key, value]) => {
          url.searchParams.set(key, value);
        });
      }
      return url.toString();
    } catch {
      return baseUrl;
    }
  }

  /** Ensure the adapter is configured before making API calls */
  protected assertConfigured(): void {
    if (!this.isConfigured) {
      throw new Error(
        `${this.name} adapter is not configured. Add the required API keys to .env.local`
      );
    }
  }

  // --- Abstract methods (implemented by each retailer) ---

  abstract searchProducts(options: RetailerSearchOptions): Promise<RetailerSearchResult>;
  abstract getProduct(externalId: string): Promise<RawRetailerProduct | null>;
  abstract getPrice(externalId: string): Promise<{
    price: number;
    originalPrice?: number;
    inStock: boolean;
    url: string;
  } | null>;
}
