import type { NextConfig } from 'next';
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts');

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // Next 16.3 appends agent notes to CLAUDE.md on `next dev`; this project's Claude.md is the client brief.
  agentRules: false,
  poweredByHeader: false,
  images: {
    formats: ['image/avif', 'image/webp'],
    qualities: [75, 80, 90],
    deviceSizes: [640, 828, 1080, 1440, 1920, 2560],
    imageSizes: [384],
    minimumCacheTTL: 60 * 60 * 24 * 365,
  },
  experimental: {
    globalNotFound: true,
    optimizePackageImports: ['motion', 'motion/react', 'framer-motion'],
  },
  async headers() {
    return [
      {
        source: '/images/:path*',
        headers: [{ key: 'Cache-Control', value: 'public, max-age=31536000, immutable' }],
      },
    ];
  },
};

export default withNextIntl(nextConfig);
