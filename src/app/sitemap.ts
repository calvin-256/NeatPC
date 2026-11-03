import { MetadataRoute } from 'next';
import prisma from '@/lib/db';
import config from '@/lib/config';

// Reads the DB, so render per request; prerendering at build needs a live database.
export const dynamic = 'force-dynamic';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = config.appUrl;

  // 1. Core static routes
  const staticRoutes = [
    {
      url: `${baseUrl}`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 1.0,
    },
    {
      url: `${baseUrl}/search`,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 0.8,
    },
  ];

  // 2. Fetch all dynamic products
  const products = await prisma.product.findMany({
    select: {
      slug: true,
      updatedAt: true,
    },
  });

  const productRoutes = products.map((product) => ({
    url: `${baseUrl}/product/${product.slug}`,
    lastModified: product.updatedAt,
    changeFrequency: 'daily' as const,
    priority: 0.9,
  }));

  return [...staticRoutes, ...productRoutes];
}
