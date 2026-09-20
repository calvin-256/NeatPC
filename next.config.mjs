/** @type {import('next').NextConfig} */
const nextConfig = {
  // Allow external images from retailer CDNs
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '**.apple.com' },
      { protocol: 'https', hostname: '**.samsung.com' },
      { protocol: 'https', hostname: '**.googleusercontent.com' },
      { protocol: 'https', hostname: '**.dell.com' },
      { protocol: 'https', hostname: '**.asus.com' },
      { protocol: 'https', hostname: '**.acer.com' },
      { protocol: 'https', hostname: '**.hp.com' },
      { protocol: 'https', hostname: '**.lenovo.com' },
      { protocol: 'https', hostname: '**.frame.work' },
      { protocol: 'https', hostname: '**.amazon.com' },
      { protocol: 'https', hostname: '**.bestbuy.com' },
      { protocol: 'https', hostname: '**.walmart.com' },
    ],
  },

  // Security headers
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()',
          },
        ],
      },
    ];
  },
};

export default nextConfig;
