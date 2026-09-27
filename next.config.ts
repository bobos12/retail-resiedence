import type { NextConfig } from 'next';
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts');

const nextConfig: NextConfig = {
  // Static export: `npm run build` writes a plain folder (out/) that any Apache/cPanel host serves
  // as is. Locale redirects, caching and the contact form's mailer live in public/.htaccess and
  // public/contact.php.
  output: 'export',
  trailingSlash: true,
  reactStrictMode: true,
  // Next 16.3 appends agent notes to CLAUDE.md on `next dev`; this project's Claude.md is the client brief.
  agentRules: false,
  poweredByHeader: false,
  // Lets a production build run beside `next dev` without sharing .next (NEXT_DIST_DIR=.next-build).
  distDir: process.env.NEXT_DIST_DIR || '.next',
  images: {
    // No image server on static hosting: the optimizer pre-renders every width below as WebP.
    loader: 'custom',
    loaderFile: './src/lib/image-loader.ts',
    qualities: [75, 80, 90],
    deviceSizes: [640, 828, 1080, 1440, 1920, 2560],
    imageSizes: [384],
  },
  experimental: {
    globalNotFound: true,
    optimizePackageImports: ['motion', 'motion/react', 'framer-motion'],
  },
};

export default withNextIntl(nextConfig);
