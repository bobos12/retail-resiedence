import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { VisitCta } from '@/components/home/VisitCta';
import { ParallaxImage } from '@/components/motion/ParallaxImage';
import { Reveal } from '@/components/motion/Reveal';
import { RevealLines } from '@/components/motion/RevealLines';
import { FullBleedHero } from '@/components/ui/FullBleedHero';
import { photo, type ImageId } from '@/content/images';
import { destinations } from '@/content/neighborhood';
import type { Locale } from '@/i18n/routing';
import { cn } from '@/lib/cn';
import { pageMetadata } from '@/lib/seo';

export async function generateMetadata({ params }: PageProps<'/[locale]/living'>): Promise<Metadata> {
  const locale = (await params).locale as Locale;
  const t = await getTranslations({ locale, namespace: 'meta.living' });
  return pageMetadata({ locale, path: '/living', title: t('title'), description: t('description'), image: 'living/playground' });
}

// Each theme pairs a landscape photograph with a portrait one, each in a frame of its own shape.
const themes: { key: 'schools' | 'shopping' | 'healthcare' | 'community'; minutes?: number; images: [ImageId, ImageId] }[] = [
  { key: 'schools', minutes: destinations.find((d) => d.key === 'bisak')?.minutes, images: ['living/playground-train', 'living/wayfinding-nursery'] },
  { key: 'shopping', minutes: destinations.find((d) => d.key === 'mall')?.minutes, images: ['clubhouse/arcade', 'clubhouse/mini-market'] },
  { key: 'healthcare', minutes: destinations.find((d) => d.key === 'hospital')?.minutes, images: ['site/villa-corner', 'site/villa-corner-portrait'] },
  { key: 'community', images: ['clubhouse/pool-umbrellas', 'living/fitness-portrait'] },
];

export default async function LivingPage({ params }: PageProps<'/[locale]/living'>) {
  const locale = (await params).locale as Locale;
  setRequestLocale(locale);
  const t = await getTranslations('living');
  const tAlt = await getTranslations('images');
  const tc = await getTranslations('common');
  const tHome = await getTranslations('home.security.services');

  return (
    <>
      <FullBleedHero
        eyebrow={t('hero.eyebrow')}
        title={t('hero.title')}
        wide="site/street-palms"
        portrait="site/street-palms-portrait"
        tone="dark"
        widePosition="50% 60%"
        portraitPosition="50% 40%"
      />

      <section className="page-x py-section">
        <Reveal className="text-center">
          <p className="mx-auto max-w-statement text-h2 font-medium">{t('intro')}</p>
          <p className="mx-auto mt-8 max-w-prose text-lead text-ink-soft">{t('hero.subtitle')}</p>
        </Reveal>
      </section>

      {themes.map((theme, i) => {
        const flip = i % 2 === 1;
        return (
          <section key={theme.key} aria-labelledby={`theme-${theme.key}`} className="page-x pb-section">
            <div className="grid-page items-end gap-y-10 border-t border-ink pt-8">
              <div className={cn('col-span-4 md:col-span-6 lg:col-span-5', flip && 'lg:order-2 lg:col-start-8')}>
                <p className="flex items-center gap-4">
                  <span className="tabular text-micro text-ink-muted">{String(i + 1).padStart(2, '0')}</span>
                  <span className="inline-flex rounded-pill border border-line px-3 py-1 text-micro font-medium">
                    {t(`themes.${theme.key}.label`)}
                  </span>
                </p>
                {theme.minutes !== undefined && (
                  <p className="tabular mt-10 text-stat font-medium" aria-hidden>
                    {theme.minutes}
                    <span className="ms-2 text-h3 text-ink-muted">{tc('minUnit', { n: theme.minutes })}</span>
                  </p>
                )}
                <RevealLines as="h2" text={t(`themes.${theme.key}.title`)} className="mt-6 text-h2 font-medium" />
                <Reveal delay={0.1}>
                  <p className="mt-6 max-w-prose text-lead text-ink-soft">{t(`themes.${theme.key}.body`)}</p>
                </Reveal>
              </div>
              <div className={cn('col-span-4 grid grid-cols-5 items-end gap-gap md:col-span-6 lg:col-span-7', flip ? 'lg:order-1' : 'lg:col-start-6')}>
                <ParallaxImage
                  photo={photo(theme.images[0], tAlt)}
                  sizes="(min-width: 1024px) 36vw, 60vw"
                  className={cn('col-span-3 aspect-3/2', flip && 'order-2')}
                />
                <ParallaxImage
                  photo={photo(theme.images[1], tAlt)}
                  sizes="(min-width: 1024px) 25vw, 40vw"
                  className={cn('col-span-2 aspect-3/4', flip && 'order-1')}
                />
              </div>
            </div>
          </section>
        );
      })}

      {/* Outdoors: a strip of four frames */}
      <section className="pb-section" aria-labelledby="outdoors-title">
        <div className="page-x grid-page mb-12 gap-y-6">
          <p className="eyebrow col-span-4 flex items-center gap-3 md:col-span-6 lg:col-span-12">
            <span className="size-1.5 rounded-pill bg-copper" aria-hidden />
            {t('outdoors.eyebrow')}
          </p>
          <RevealLines as="h2" text={t('outdoors.title')} className="col-span-4 text-h2 font-medium md:col-span-6 lg:col-span-6" />
          <Reveal className="col-span-4 self-end md:col-span-5 lg:col-span-4 lg:col-start-9" delay={0.1}>
            <p className="max-w-prose text-lead text-ink-soft">{t('outdoors.body')}</p>
          </Reveal>
        </div>
        {/* Portrait, landscape, portrait: equal heights on a 3 / 6 / 3 split. */}
        <div className="page-x grid grid-cols-2 gap-gap md:grid-cols-12">
          <ParallaxImage photo={photo('living/kids-zone-dusk', tAlt)} sizes="(min-width: 768px) 25vw, 50vw" className="aspect-3/4 md:col-span-3" />
          <ParallaxImage
            photo={photo('living/benches-evening', tAlt)}
            sizes="(min-width: 768px) 50vw, 100vw"
            className="col-span-2 aspect-3/2 max-md:order-first md:col-span-6"
          />
          <ParallaxImage photo={photo('living/garden-bench', tAlt)} sizes="(min-width: 768px) 25vw, 50vw" className="aspect-3/4 md:col-span-3" />
        </div>
      </section>

      {/* Services */}
      <section data-theme="dark" className="bg-night py-section text-bone" aria-labelledby="services-title">
        <div className="page-x grid-page gap-y-12">
          <div className="col-span-4 md:col-span-6 lg:col-span-5">
            <p className="eyebrow flex items-center gap-3">
              <span className="size-1.5 rounded-pill bg-copper" aria-hidden />
              {t('services.eyebrow')}
            </p>
            <RevealLines as="h2" text={t('services.title')} className="mt-6 text-h2 font-medium" />
            <p className="mt-6 max-w-prose text-lead text-bone-soft">{t('services.body')}</p>
            <ol className="mt-10 border-t border-night-line">
              {(['housekeeping', 'laundry', 'supermarket', 'security'] as const).map((key, i) => (
                <li key={key} className="flex items-baseline gap-6 border-b border-night-line py-4">
                  <span className="tabular text-micro text-bone-soft">{String(i + 1).padStart(2, '0')}</span>
                  <span className="text-h4 font-medium">{tHome(key)}</span>
                </li>
              ))}
            </ol>
          </div>
          <div className="col-span-4 grid grid-cols-2 gap-gap md:col-span-6 lg:col-span-6 lg:col-start-7">
            <ParallaxImage photo={photo('clubhouse/laundry', tAlt)} sizes="(min-width: 1024px) 25vw, 50vw" className="aspect-3/4" />
            <ParallaxImage photo={photo('site/gate-day', tAlt)} sizes="(min-width: 1024px) 25vw, 50vw" className="aspect-3/4 lg:mt-section-sm" />
          </div>
        </div>
      </section>

      <VisitCta />
    </>
  );
}
