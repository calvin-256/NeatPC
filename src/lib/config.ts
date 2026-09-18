// ===========================================
// NeatPC — Centralized Configuration
// ===========================================
// All environment variables are accessed through this module.
// Never read process.env directly in other files.

function getEnv(key: string, required: boolean = false): string {
  const value = process.env[key] || '';
  if (required && !value) {
    throw new Error(
      `Missing required environment variable: ${key}\n` +
      `Copy .env.example to .env.local and fill in your keys.`
    );
  }
  return value;
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
    },
    github: {
      clientId: getEnv('GITHUB_CLIENT_ID'),
      clientSecret: getEnv('GITHUB_CLIENT_SECRET'),
    },
  },

  // Retailer APIs (Phase 2)
  retailers: {
    amazon: {
      accessKey: getEnv('AMAZON_ACCESS_KEY'),
      secretKey: getEnv('AMAZON_SECRET_KEY'),
      partnerTag: getEnv('AMAZON_PARTNER_TAG'),
    },
    bestbuy: {
      apiKey: getEnv('BESTBUY_API_KEY'),
    },
    walmart: {
      apiKey: getEnv('WALMART_API_KEY'),
    },
  },

  // Email (Phase 5)
  email: {
    resendApiKey: getEnv('RESEND_API_KEY'),
  },

  // Analytics (Phase 6)
  analytics: {
    gaId: getEnv('NEXT_PUBLIC_GA_ID'),
  },
} as const;

export default config;
