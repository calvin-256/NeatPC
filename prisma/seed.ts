// ===========================================
// NeatPC — Database Seed Script
// ===========================================
// Run with: npm run db:seed
// Populates the database with real-world products
// and multi-retailer pricing for development.

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface SeedProduct {
  name: string;
  brand: string;
  category: string;
  slug: string;
  imageUrl: string;
  description: string;
  specs: Record<string, string | number>;
  rating: number;
  reviewCount: number;
  prices: {
    retailer: string;
    price: number;
    originalPrice?: number;
    url: string;
    inStock: boolean;
  }[];
}

const products: SeedProduct[] = [
  // ===================== LAPTOPS =====================
  {
    name: 'MacBook Air 15" M3',
    brand: 'Apple',
    category: 'laptop',
    slug: 'macbook-air-15-m3',
    imageUrl: 'https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/mba15-m3-midnight-select-202402',
    description: 'Impossibly thin, with the M3 chip, a 15.3-inch Liquid Retina display, 18 hours of battery life, and a fanless design.',
    specs: {
      cpu: 'Apple M3 (8-core)',
      gpu: 'Apple M3 (10-core GPU)',
      ramGb: 16,
      storageGb: 256,
      storageType: 'SSD',
      displaySize: 15.3,
      displayResolution: '2880x1864',
      batteryHours: 18,
      weightKg: 1.51,
      os: 'macos',
    },
    rating: 4.7,
    reviewCount: 2841,
    prices: [
      { retailer: 'amazon', price: 1049, originalPrice: 1299, url: 'https://amazon.com/dp/B0CX22ZW1T', inStock: true },
      { retailer: 'bestbuy', price: 1099, originalPrice: 1299, url: 'https://bestbuy.com/site/6565837', inStock: true },
      { retailer: 'bh', price: 1099, originalPrice: 1299, url: 'https://bhphotovideo.com/c/product/1810290', inStock: true },
    ],
  },
  {
    name: 'MacBook Pro 14" M3 Pro',
    brand: 'Apple',
    category: 'laptop',
    slug: 'macbook-pro-14-m3-pro',
    imageUrl: 'https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/mbp14-m3-pro-max-select-202310',
    description: 'The most advanced pro laptop chip. Stunning Liquid Retina XDR display. All-day battery life.',
    specs: {
      cpu: 'Apple M3 Pro (12-core)',
      gpu: 'Apple M3 Pro (18-core GPU)',
      ramGb: 18,
      storageGb: 512,
      storageType: 'SSD',
      displaySize: 14.2,
      displayResolution: '3024x1964',
      batteryHours: 17,
      weightKg: 1.61,
      os: 'macos',
    },
    rating: 4.8,
    reviewCount: 1563,
    prices: [
      { retailer: 'amazon', price: 1649, originalPrice: 1999, url: 'https://amazon.com/dp/B0CM5JLXKS', inStock: true },
      { retailer: 'bestbuy', price: 1699, originalPrice: 1999, url: 'https://bestbuy.com/site/6534615', inStock: true },
      { retailer: 'bh', price: 1649, originalPrice: 1999, url: 'https://bhphotovideo.com/c/product/1793630', inStock: true },
    ],
  },
  {
    name: 'Dell XPS 14 (2024)',
    brand: 'Dell',
    category: 'laptop',
    slug: 'dell-xps-14-2024',
    imageUrl: 'https://i.dell.com/is/image/DellContent/content/dam/ss2/product-images/dell-client-products/notebooks/xps-notebooks/xps-14-9440/media-gallery/silver/notebook-xps-14-9440-t-silver-gallery-1.psd',
    description: 'Stunning 14.5-inch OLED display with Intel Core Ultra, sleek zero-lattice keyboard design.',
    specs: {
      cpu: 'Intel Core Ultra 7 155H',
      gpu: 'Intel Arc (integrated)',
      ramGb: 16,
      storageGb: 512,
      storageType: 'SSD',
      displaySize: 14.5,
      displayResolution: '2560x1600',
      batteryHours: 12,
      weightKg: 1.68,
      os: 'windows',
    },
    rating: 4.3,
    reviewCount: 892,
    prices: [
      { retailer: 'amazon', price: 1199, originalPrice: 1499, url: 'https://amazon.com/dp/B0CYRKMXYS', inStock: true },
      { retailer: 'bestbuy', price: 1249, originalPrice: 1499, url: 'https://bestbuy.com/site/6571583', inStock: true },
      { retailer: 'newegg', price: 1179, originalPrice: 1499, url: 'https://newegg.com/p/N82E16834986127', inStock: true },
    ],
  },
  {
    name: 'Lenovo ThinkPad X1 Carbon Gen 12',
    brand: 'Lenovo',
    category: 'laptop',
    slug: 'thinkpad-x1-carbon-gen12',
    imageUrl: 'https://p3-ofp.static.pub/fes/cms/2024/01/31/x1carbon-g12-gallery-1.webp',
    description: 'The legendary business ultrabook. Under 2.5 lbs with Intel Core Ultra, all-day battery, and the best keyboard in the game.',
    specs: {
      cpu: 'Intel Core Ultra 7 155U',
      gpu: 'Intel (integrated)',
      ramGb: 16,
      storageGb: 512,
      storageType: 'SSD',
      displaySize: 14,
      displayResolution: '1920x1200',
      batteryHours: 15,
      weightKg: 1.08,
      os: 'windows',
    },
    rating: 4.6,
    reviewCount: 674,
    prices: [
      { retailer: 'amazon', price: 1299, originalPrice: 1649, url: 'https://amazon.com/dp/B0D1J9D1WY', inStock: true },
      { retailer: 'bestbuy', price: 1349, originalPrice: 1649, url: 'https://bestbuy.com/site/6573443', inStock: true },
      { retailer: 'newegg', price: 1279, originalPrice: 1649, url: 'https://newegg.com/p/1TS-000E-1FDP3', inStock: true },
    ],
  },
  {
    name: 'ASUS ROG Zephyrus G14 (2024)',
    brand: 'ASUS',
    category: 'laptop',
    slug: 'asus-rog-zephyrus-g14-2024',
    imageUrl: 'https://dlcdnwebimgs.asus.com/gain/F42DB3A0-2B2E-4CB9-A3B8-6A2B69E5E5DF/w1000/h732',
    description: 'The ultimate 14-inch gaming laptop. AMD Ryzen 9, NVIDIA RTX 4070, OLED display, under 3.5 lbs.',
    specs: {
      cpu: 'AMD Ryzen 9 8945HS',
      gpu: 'NVIDIA RTX 4070 (8GB)',
      ramGb: 16,
      storageGb: 1000,
      storageType: 'SSD',
      displaySize: 14,
      displayResolution: '2880x1800',
      batteryHours: 10,
      weightKg: 1.57,
      os: 'windows',
      refreshRate: 120,
    },
    rating: 4.5,
    reviewCount: 1205,
    prices: [
      { retailer: 'amazon', price: 1399, originalPrice: 1599, url: 'https://amazon.com/dp/B0CQR7MXLK', inStock: true },
      { retailer: 'bestbuy', price: 1449, originalPrice: 1599, url: 'https://bestbuy.com/site/6570270', inStock: true },
      { retailer: 'newegg', price: 1379, originalPrice: 1599, url: 'https://newegg.com/p/N82E16834234902', inStock: true },
    ],
  },
  {
    name: 'HP Pavilion 15 (2024)',
    brand: 'HP',
    category: 'laptop',
    slug: 'hp-pavilion-15-2024',
    imageUrl: 'https://ssl-product-images.www8-hp.com/digmedialib/prodimg/lowres/c08870015.png',
    description: 'Solid all-rounder for students and everyday use. Great display, good battery, and affordable price.',
    specs: {
      cpu: 'AMD Ryzen 5 7530U',
      gpu: 'AMD Radeon (integrated)',
      ramGb: 8,
      storageGb: 256,
      storageType: 'SSD',
      displaySize: 15.6,
      displayResolution: '1920x1080',
      batteryHours: 8,
      weightKg: 1.75,
      os: 'windows',
    },
    rating: 4.2,
    reviewCount: 3421,
    prices: [
      { retailer: 'amazon', price: 449, originalPrice: 549, url: 'https://amazon.com/dp/B0CS3FRXKB', inStock: true },
      { retailer: 'bestbuy', price: 479, originalPrice: 549, url: 'https://bestbuy.com/site/6571369', inStock: true },
      { retailer: 'walmart', price: 439, originalPrice: 549, url: 'https://walmart.com/ip/2835067381', inStock: true },
    ],
  },
  {
    name: 'Acer Chromebook Plus 516 GE',
    brand: 'Acer',
    category: 'laptop',
    slug: 'acer-chromebook-plus-516-ge',
    imageUrl: 'https://static-ecapac.acer.com/media/catalog/product/c/b/cb516-2h-main_nx-kxwaa-001_2.png',
    description: 'Cloud gaming beast. 16-inch QHD 120Hz display, 8GB RAM, and fast Wi-Fi 6E — all on ChromeOS.',
    specs: {
      cpu: 'Intel Core i5-1240P',
      gpu: 'Intel Iris Xe (integrated)',
      ramGb: 8,
      storageGb: 256,
      storageType: 'SSD',
      displaySize: 16,
      displayResolution: '2560x1600',
      batteryHours: 10,
      weightKg: 1.78,
      os: 'chromeos',
      refreshRate: 120,
    },
    rating: 4.4,
    reviewCount: 789,
    prices: [
      { retailer: 'amazon', price: 379, originalPrice: 649, url: 'https://amazon.com/dp/B0C5MZCV5D', inStock: true },
      { retailer: 'bestbuy', price: 399, originalPrice: 649, url: 'https://bestbuy.com/site/6541837', inStock: true },
      { retailer: 'walmart', price: 369, originalPrice: 649, url: 'https://walmart.com/ip/1768204591', inStock: true },
    ],
  },
  {
    name: 'Framework Laptop 16',
    brand: 'Framework',
    category: 'laptop',
    slug: 'framework-laptop-16',
    imageUrl: 'https://frame.work/media/Framework_Laptop_16_Front_Right.png',
    description: 'The modular, repairable, upgradeable gaming laptop. Swap GPU modules, expand ports, and customize everything.',
    specs: {
      cpu: 'AMD Ryzen 7 7840HS',
      gpu: 'AMD Radeon RX 7700S (8GB)',
      ramGb: 16,
      storageGb: 512,
      storageType: 'SSD',
      displaySize: 16,
      displayResolution: '2560x1600',
      batteryHours: 7,
      weightKg: 2.1,
      os: 'windows',
      refreshRate: 165,
    },
    rating: 4.3,
    reviewCount: 412,
    prices: [
      { retailer: 'amazon', price: 1399, originalPrice: 1399, url: 'https://amazon.com/dp/B0DFWLSKL5', inStock: true },
      { retailer: 'bh', price: 1399, originalPrice: 1399, url: 'https://bhphotovideo.com/c/product/1830219', inStock: false },
    ],
  },

  // ===================== PHONES =====================
  {
    name: 'iPhone 15 Pro',
    brand: 'Apple',
    category: 'phone',
    slug: 'iphone-15-pro',
    imageUrl: 'https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/iphone-15-pro-finish-select-202309-6-1inch-naturaltitanium',
    description: 'A17 Pro chip. 48MP camera system. Titanium design. Action button. USB-C.',
    specs: {
      cpu: 'Apple A17 Pro',
      ramGb: 8,
      storageGb: 256,
      displaySize: 6.1,
      displayResolution: '2556x1179',
      os: 'ios',
      cameraMp: 48,
      refreshRate: 120,
      batteryHours: 23,
      weightKg: 0.187,
    },
    rating: 4.7,
    reviewCount: 8934,
    prices: [
      { retailer: 'amazon', price: 899, originalPrice: 999, url: 'https://amazon.com/dp/B0CMDRZ23B', inStock: true },
      { retailer: 'bestbuy', price: 899, originalPrice: 999, url: 'https://bestbuy.com/site/6525473', inStock: true },
      { retailer: 'walmart', price: 929, originalPrice: 999, url: 'https://walmart.com/ip/5113183756', inStock: true },
    ],
  },
  {
    name: 'Samsung Galaxy S24 Ultra',
    brand: 'Samsung',
    category: 'phone',
    slug: 'samsung-galaxy-s24-ultra',
    imageUrl: 'https://image-us.samsung.com/us/smartphones/galaxy-s24-ultra/images/galaxy-s24-ultra-highlights-color-titanium-gray-back-mo.jpg',
    description: 'Galaxy AI built in. 200MP camera. Titanium frame. S Pen included. 6.8-inch QHD+ display.',
    specs: {
      cpu: 'Snapdragon 8 Gen 3',
      ramGb: 12,
      storageGb: 256,
      displaySize: 6.8,
      displayResolution: '3120x1440',
      os: 'android',
      cameraMp: 200,
      refreshRate: 120,
      batteryHours: 30,
      weightKg: 0.232,
    },
    rating: 4.6,
    reviewCount: 6712,
    prices: [
      { retailer: 'amazon', price: 1049, originalPrice: 1299, url: 'https://amazon.com/dp/B0CMDJBBM3', inStock: true },
      { retailer: 'bestbuy', price: 1099, originalPrice: 1299, url: 'https://bestbuy.com/site/6570301', inStock: true },
      { retailer: 'walmart', price: 1079, originalPrice: 1299, url: 'https://walmart.com/ip/5077891729', inStock: true },
    ],
  },
  {
    name: 'Google Pixel 8 Pro',
    brand: 'Google',
    category: 'phone',
    slug: 'google-pixel-8-pro',
    imageUrl: 'https://lh3.googleusercontent.com/2ma_EpNpDpSLbkL3x4VdqMXahKrIWvZmSqXPTwrFERsk-zM-tE2BDQvxRInxxAJQqEGh',
    description: 'The best of Google AI in a phone. 50MP camera with Magic Eraser, 7 years of updates, Tensor G3 chip.',
    specs: {
      cpu: 'Google Tensor G3',
      ramGb: 12,
      storageGb: 128,
      displaySize: 6.7,
      displayResolution: '2992x1344',
      os: 'android',
      cameraMp: 50,
      refreshRate: 120,
      batteryHours: 24,
      weightKg: 0.213,
    },
    rating: 4.5,
    reviewCount: 4231,
    prices: [
      { retailer: 'amazon', price: 749, originalPrice: 999, url: 'https://amazon.com/dp/B0CGTD5KVT', inStock: true },
      { retailer: 'bestbuy', price: 799, originalPrice: 999, url: 'https://bestbuy.com/site/6559236', inStock: true },
      { retailer: 'bh', price: 749, originalPrice: 999, url: 'https://bhphotovideo.com/c/product/1793145', inStock: true },
    ],
  },
  {
    name: 'Samsung Galaxy A55 5G',
    brand: 'Samsung',
    category: 'phone',
    slug: 'samsung-galaxy-a55-5g',
    imageUrl: 'https://image-us.samsung.com/us/smartphones/galaxy-a55/all-galaxy-a55-awesome-iceblue-front.jpg',
    description: 'Premium mid-range. 6.6-inch Super AMOLED 120Hz, 50MP triple camera, IP67 water resistance, and all-day battery.',
    specs: {
      cpu: 'Samsung Exynos 1480',
      ramGb: 8,
      storageGb: 128,
      displaySize: 6.6,
      displayResolution: '2340x1080',
      os: 'android',
      cameraMp: 50,
      refreshRate: 120,
      batteryHours: 25,
      weightKg: 0.213,
    },
    rating: 4.3,
    reviewCount: 2156,
    prices: [
      { retailer: 'amazon', price: 329, originalPrice: 449, url: 'https://amazon.com/dp/B0D1X2N6SZ', inStock: true },
      { retailer: 'bestbuy', price: 349, originalPrice: 449, url: 'https://bestbuy.com/site/6576809', inStock: true },
      { retailer: 'walmart', price: 319, originalPrice: 449, url: 'https://walmart.com/ip/5089672841', inStock: true },
    ],
  },
];

function calculateDealScore(prices: SeedProduct['prices']): number {
  const bestPrice = Math.min(...prices.map((p) => p.price));
  const avgOriginal = prices.reduce((sum, p) => sum + (p.originalPrice || p.price), 0) / prices.length;

  if (avgOriginal <= 0) return 50;

  const discountPercent = ((avgOriginal - bestPrice) / avgOriginal) * 100;
  const retailerCount = prices.filter((p) => p.inStock).length;

  // Score: base from discount + bonus for availability across retailers
  let score = Math.min(discountPercent * 2.5, 80);
  score += Math.min(retailerCount * 5, 15);
  score += 5; // base

  return Math.round(Math.min(score, 100));
}

async function main() {
  console.log('🌱 Seeding NeatPC database...\n');

  // Clear existing data
  await prisma.chatMessage.deleteMany();
  await prisma.chatSession.deleteMany();
  await prisma.feedback.deleteMany();
  await prisma.searchHistory.deleteMany();
  await prisma.priceAlert.deleteMany();
  await prisma.savedProduct.deleteMany();
  await prisma.priceHistory.deleteMany();
  await prisma.retailerPrice.deleteMany();
  await prisma.product.deleteMany();

  console.log('  ✓ Cleared existing data');

  for (const prod of products) {
    const bestPrice = Math.min(...prod.prices.map((p) => p.price));
    const dealScore = calculateDealScore(prod.prices);

    const product = await prisma.product.create({
      data: {
        name: prod.name,
        brand: prod.brand,
        category: prod.category,
        slug: prod.slug,
        imageUrl: prod.imageUrl,
        description: prod.description,
        specsJson: JSON.stringify(prod.specs),
        bestPrice,
        dealScore,
        rating: prod.rating,
        reviewCount: prod.reviewCount,
        prices: {
          create: prod.prices.map((p) => ({
            retailer: p.retailer,
            price: p.price,
            originalPrice: p.originalPrice,
            url: p.url,
            inStock: p.inStock,
          })),
        },
        // Also create initial price history entries
        priceHistory: {
          create: prod.prices.map((p) => ({
            retailer: p.retailer,
            price: p.price,
            recordedAt: new Date(),
          })),
        },
      },
    });

    console.log(`  ✓ ${product.name} — $${bestPrice} (deal score: ${dealScore})`);
  }

  console.log(`\n✅ Seeded ${products.length} products successfully!`);
  console.log('   Run "npx prisma studio" to browse the data.\n');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
