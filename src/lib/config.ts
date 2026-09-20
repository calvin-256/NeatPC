// ===========================================
// NeatPC — Centralized Configuration
// ===========================================
// All environment variables are accessed through this module.
// Never read process.env directly in other files.
// Run validateConfig() on startup to check for missing keys.

function getEnv(key: string): string {
  return process.env[key] || '';
}

/** Check if an env var is set (non-empty) */
function hasEnv(key: string): boolean {
  return !!process.env[key]?.trim();
}

/** Application configuration — single source of truth */
export const config = {
  // App
  appName: 'NeatPC',
  appUrl: getEnv('NEXTAUTH_URL') || 'http://localhost:3000',
  isDev: process.env.NODE_ENV === 'development',
  isProd: process.env.NODE_ENV === 'production',

  // AI
  gemini: {
    apiKey: getEnv('GEMINI_API_KEY'),
    isConfigured: hasEnv('GEMINI_API_KEY'),
  },

  // Database
  database: {
    url: getEnv('DATABASE_URL') || 'file:./dev.db',
  },

  // Auth
  auth: {
    secret: getEnv('NEXTAUTH_SECRET'),
    google: {
      clientId: getEnv('GOOGLE_CLIENT_ID'),
      clientSecret: getEnv('GOOGLE_CLIENT_SECRET'),
      isConfigured: hasEnv('GOOGLE_CLIENT_ID') && hasEnv('GOOGLE_CLIENT_SECRET'),
    },
    github: {
      clientId: getEnv('GITHUB_CLIENT_ID'),
      clientSecret: getEnv('GITHUB_CLIENT_SECRET'),
      isConfigured: hasEnv('GITHUB_CLIENT_ID') && hasEnv('GITHUB_CLIENT_SECRET'),
    },
  },

  // Retailer APIs (Phase 2)
  retailers: {
    amazon: {
      accessKey: getEnv('AMAZON_ACCESS_KEY'),
      secretKey: getEnv('AMAZON_SECRET_KEY'),
      partnerTag: getEnv('AMAZON_PARTNER_TAG'),
      isConfigured: hasEnv('AMAZON_ACCESS_KEY') && hasEnv('AMAZON_SECRET_KEY'),
    },
    bestbuy: {
      apiKey: getEnv('BESTBUY_API_KEY'),
      isConfigured: hasEnv('BESTBUY_API_KEY'),
    },
    walmart: {
      apiKey: getEnv('WALMART_API_KEY'),
      isConfigured: hasEnv('WALMART_API_KEY'),
    },
  },

  // Email (Phase 5)
  email: {
    resendApiKey: getEnv('RESEND_API_KEY'),
    isConfigured: hasEnv('RESEND_API_KEY'),
  },

  // Analytics (Phase 6)
  analytics: {
    gaId: getEnv('NEXT_PUBLIC_GA_ID'),
    isConfigured: hasEnv('NEXT_PUBLIC_GA_ID'),
  },
} as const;

// ===========================================
// Service Status (for health check)
// ===========================================

export type ServiceStatus = 'ready' | 'not_configured' | 'error';

export interface ServiceHealth {
  name: string;
  status: ServiceStatus;
  required: boolean;
}

/** Get status of all configured services */
export function getServiceHealth(): ServiceHealth[] {
  return [
    {
      name: 'Database',
      status: config.database.url ? 'ready' : 'not_configured',
      required: true,
    },
    {
      name: 'Gemini AI',
      status: config.gemini.isConfigured ? 'ready' : 'not_configured',
      required: false, // App works without AI, just no recommendations
    },
    {
      name: 'Google OAuth',
      status: config.auth.google.isConfigured ? 'ready' : 'not_configured',
      required: false,
    },
    {
      name: 'GitHub OAuth',
      status: config.auth.github.isConfigured ? 'ready' : 'not_configured',
      required: false,
    },
    {
      name: 'Amazon API',
      status: config.retailers.amazon.isConfigured ? 'ready' : 'not_configured',
      required: false,
    },
    {
      name: 'Best Buy API',
      status: config.retailers.bestbuy.isConfigured ? 'ready' : 'not_configured',
      required: false,
    },
    {
      name: 'Walmart API',
      status: config.retailers.walmart.isConfigured ? 'ready' : 'not_configured',
      required: false,
    },
    {
      name: 'Email (Resend)',
      status: config.email.isConfigured ? 'ready' : 'not_configured',
      required: false,
    },
  ];
}

// ===========================================
// Startup Validation
// ===========================================

/** 
 * Validate config on startup. Logs warnings for missing optional services.
 * Call this in a server component or API route on first load.
 */
export function validateConfig(): { valid: boolean; warnings: string[] } {
  const warnings: string[] = [];
  const services = getServiceHealth();

  // Check required services
  const missingRequired = services.filter((s) => s.required && s.status !== 'ready');
  if (missingRequired.length > 0) {
    warnings.push(
      `❌ Missing required services: ${missingRequired.map((s) => s.name).join(', ')}`
    );
  }

  // Log optional service status
  const missingOptional = services.filter((s) => !s.required && s.status !== 'ready');
  if (missingOptional.length > 0) {
    warnings.push(
      `⚠️  Optional services not configured: ${missingOptional.map((s) => s.name).join(', ')}`
    );
  }

  const readyCount = services.filter((s) => s.status === 'ready').length;
  if (config.isDev) {
    console.log(`\n🔧 NeatPC Config: ${readyCount}/${services.length} services ready`);
    warnings.forEach((w) => console.log(`   ${w}`));
    console.log('');
  }

  return {
    valid: missingRequired.length === 0,
    warnings,
  };
}

export default config;
