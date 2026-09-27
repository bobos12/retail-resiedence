import type { MetadataRoute } from 'next';

export const dynamic = 'force-static';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Retal Residence',
    short_name: 'Retal',
    description: 'Furnished apartments and villas in Al Khobar.',
    start_url: '/en',
    display: 'browser',
    background_color: '#f3f1eb',
    theme_color: '#f3f1eb',
    icons: [
      { src: '/icon.svg', type: 'image/svg+xml', sizes: 'any' },
      { src: '/apple-icon', type: 'image/png', sizes: '180x180' },
    ],
  };
}
