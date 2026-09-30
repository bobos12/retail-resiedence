import type { MetadataRoute } from 'next';
import { SITE_URL } from '@/content/contact';
import { residences } from '@/content/residences';
import { routing } from '@/i18n/routing';
import { localePath } from '@/lib/seo';

export const dynamic = 'force-static';

const pages = ['/', '/residences', ...residences.map((r) => `/residences/${r.slug}`), '/clubhouse', '/living', '/neighborhood', '/book', '/contact'];

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  return pages.flatMap((path) =>
    routing.locales.map((locale) => ({
      url: `${SITE_URL}${localePath(locale, path)}`,
      lastModified: now,
      changeFrequency: path === '/' ? 'weekly' : 'monthly',
      priority: path === '/' ? 1 : path.startsWith('/residences/') ? 0.8 : 0.7,
      alternates: {
        languages: Object.fromEntries(routing.locales.map((l) => [l, `${SITE_URL}${localePath(l, path)}`])),
      },
    })),
  );
}
