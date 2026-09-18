// ===========================================
// NeatPC — Core Type Definitions
// ===========================================

/** Supported device categories */
export type DeviceCategory = 'laptop' | 'phone' | 'desktop' | 'tablet';

/** Supported operating systems */
export type OperatingSystem = 'windows' | 'macos' | 'chromeos' | 'linux' | 'ios' | 'android';

/** Retailer identifiers */
export type RetailerSlug = 'amazon' | 'bestbuy' | 'newegg' | 'bh' | 'walmart';

// -------------------------------------------
// Product & Pricing
// -------------------------------------------

export interface Product {
  id: string;
  name: string;
  brand: string;
  category: DeviceCategory;
  slug: string;
  imageUrl: string;
  specs: ProductSpecs;
  prices: RetailerPrice[];
  bestPrice: number;
  dealScore: number; // 0-100, calculated by our AI
  rating: number; // average user rating (0-5)
  reviewCount: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface ProductSpecs {
  cpu?: string;
  gpu?: string;
  ramGb?: number;
  storageGb?: number;
  storageType?: 'SSD' | 'HDD' | 'eMMC';
  displaySize?: number; // inches
  displayResolution?: string; // e.g. "1920x1080"
  batteryWh?: number;
  weightKg?: number;
  os?: OperatingSystem;
  // Phone-specific
  cameraMp?: number;
  refreshRate?: number; // Hz
  [key: string]: string | number | undefined; // allow extra specs
}

export interface RetailerPrice {
  retailer: RetailerSlug;
  price: number;
  originalPrice?: number; // MSRP or crossed-out price
  url: string; // affiliate link
  inStock: boolean;
  lastChecked: Date;
}

export interface PriceHistory {
  productId: string;
  retailer: RetailerSlug;
  price: number;
  recordedAt: Date;
}

// -------------------------------------------
// Retailer Adapter Interface
// -------------------------------------------

export interface RetailerAdapter {
  slug: RetailerSlug;
  name: string;
  searchProducts(query: string, category?: DeviceCategory): Promise<Product[]>;
  getPrice(productId: string): Promise<RetailerPrice | null>;
  getProductDetails(productId: string): Promise<Product | null>;
}

// -------------------------------------------
// Quiz & User Preferences
// -------------------------------------------

export interface QuizAnswers {
  useCase: string;
  budget: number;
  category?: DeviceCategory;
  preferredOs?: OperatingSystem;
  screenSize?: 'small' | 'medium' | 'large';
  portability?: 'very' | 'somewhat' | 'not-important';
  gaming?: boolean;
  brandPreference?: string;
  [key: string]: string | number | boolean | undefined;
}

export interface UserPreferences {
  userId: string;
  quizAnswers: QuizAnswers;
  savedProductIds: string[];
  priceAlerts: PriceAlert[];
}

export interface PriceAlert {
  id: string;
  productId: string;
  targetPrice: number;
  isActive: boolean;
  createdAt: Date;
}

// -------------------------------------------
// AI Chat
// -------------------------------------------

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  /** Products referenced in this message */
  productRefs?: string[];
}

export interface ChatSession {
  id: string;
  userId?: string;
  messages: ChatMessage[];
  quizAnswers: QuizAnswers;
  recommendedProductIds: string[];
  createdAt: Date;
}

// -------------------------------------------
// API Responses
// -------------------------------------------

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface SearchFilters {
  query?: string;
  category?: DeviceCategory;
  minPrice?: number;
  maxPrice?: number;
  brand?: string;
  retailer?: RetailerSlug;
  minRating?: number;
  sortBy?: 'price' | 'dealScore' | 'rating' | 'newest';
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

export interface SearchResults {
  products: Product[];
  total: number;
  page: number;
  totalPages: number;
}
