import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { VisitCta } from '@/components/home/VisitCta';
import { ParallaxImage } from '@/components/motion/ParallaxImage';
import { Reveal } from '@/components/motion/Reveal';
import { RevealLines } from '@/components/motion/RevealLines';
import { buttonClass } from '@/components/ui/ButtonLink';
import { FullBleedHero } from '@/components/ui/FullBleedHero';
import { ClubhouseTour } from '@/components/tour/ClubhouseTour';
import { amenityCategories } from '@/content/amenities';
import { photo, type ImageId } from '@/content/images';
import type { Locale } from '@/i18n/routing';
import { cn } from '@/lib/cn';
import { pageMetadata } from '@/lib/seo';

export async function generateMetadata({ params }: PageProps<'/[locale]/clubhouse'>): Promise<Metadata> {
  const locale = (await params).locale as Locale;
  const t = await getTranslations({ locale, namespace: 'meta.clubhouse' });
  return pageMetadata({ locale, path: '/clubhouse', title: t('title'), description: t('description'), image: 'clubhouse/facade-night-wide' });
}

const figures = ['cinema', 'bowling', 'amenities'] as const;

function Eyebrow({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <p className={cn('eyebrow flex items-center gap-3', className)}>
      <span className="size-1.5 rounded-pill bg-copper" aria-hidden />
      {children}
    </p>
  );
}

export default async function ClubhousePage({ params }: PageProps<'/[locale]/clubhouse'>) {
  const locale = (await params).locale as Locale;
  setRequestLocale(locale);
  const t = await getTranslations('clubhouse');
  const tAlt = await getTranslations('images');
  const img = (id: ImageId) => photo(id, tAlt);

  return (
    <>
      <FullBleedHero
        eyebrow={t('hero.eyebrow')}
        title={t('hero.title')}
        wide="clubhouse/facade-night-wide"
        portrait="clubhouse/facade-night-portrait"
        tone="light"
        widePosition="50% 40%"
        portraitPosition="50% 35%"
        actions={
          <>
            <a href="#tour" className={buttonClass('light')}>
              {t('hero.tourCta')}
            </a>
            <a href="#amenities" className={buttonClass('solid')}>
              {t('hero.explore')}
            </a>
          </>
        }
      />

      {/* Centred statement and figures */}
      <section className="page-x py-section text-center">
        <Eyebrow className="justify-center">{t('hero.eyebrow')}</Eyebrow>
        <Reveal>
          <p className="mx-auto mt-8 max-w-statement text-h3 font-medium">{t('intro')}</p>
        </Reveal>
        <dl className="mx-auto mt-section-sm grid max-w-page grid-cols-3 border-y border-line">
          {figures.map((key, i) => (
            <Reveal key={key} delay={i * 0.06} className="flex flex-col items-center gap-3 border-e border-line px-3 py-8 last:border-e-0">
              <dt className="order-2 max-w-3xs text-small text-ink-soft">{t(`figures.${key}.label`)}</dt>
              <dd className="tabular order-1 text-stat font-medium">{t(`figures.${key}.value`)}</dd>
            </Reveal>
          ))}
        </dl>
      </section>

      {/* Arrival: the lobby, then the corridors and reception beyond */}
      <section className="page-x pb-section" aria-labelledby="arrival-title">
        <div className="grid-page items-center gap-y-10">
          <ParallaxImage photo={img('clubhouse/lobby')} sizes="(min-width: 1024px) 66vw, 100vw" className="col-span-4 aspect-3/2 md:col-span-6 lg:col-span-8" />
          <div className="col-span-4 md:col-span-6 lg:col-span-4">
            <Eyebrow>{t('arrival.eyebrow')}</Eyebrow>
            <RevealLines as="h2" id="arrival-title" text={t('arrival.title')} className="mt-6 text-h2 font-medium" />
            <Reveal delay={0.1}>
              <p className="mt-6 max-w-prose text-lead text-ink-soft">{t('arrival.body')}</p>
            </Reveal>
          </div>
        </div>
        <div className="mt-gap grid grid-cols-2 gap-gap md:grid-cols-12">
          <ParallaxImage photo={img('clubhouse/corridor')} sizes="(min-width: 768px) 33vw, 50vw" className="aspect-3/4 md:col-span-4 md:aspect-auto" />
          <ParallaxImage photo={img('clubhouse/reception')} sizes="(min-width: 768px) 66vw, 100vw" className="aspect-3/4 md:col-span-8 md:aspect-3/2" />
        </div>
      </section>

      {/* 360° tour: every room of the Clubhouse */}
      <ClubhouseTour variant="full" tone="dark" id="tour" className="py-section-sm" />

      {/* Every amenity, by category, with its own photographs */}
      <div id="amenities" className="scroll-mt-header">
        {amenityCategories.map((cat, ci) => {
          const dark = ci === 1;
          return (
            <section
              key={cat.key}
              aria-labelledby={`cat-${cat.key}`}
              className={cn('py-section', dark && 'bg-night text-bone')}
              data-theme={dark ? 'dark' : undefined}
            >
              <div className="page-x">
                <div className="grid-page items-start gap-y-10">
                  <div className="col-span-4 md:col-span-6 lg:col-span-4">
                    <p className={cn('tabular text-micro', dark ? 'text-copper' : 'text-copper-deep')}>{String(ci + 1).padStart(2, '0')}</p>
                    <h2 id={`cat-${cat.key}`} className="mt-4 text-h2 font-medium">
                      {t(`categories.${cat.key}.title`)}
                    </h2>
                    <p className="mt-4 max-w-prose text-lead opacity-75">{t(`categories.${cat.key}.body`)}</p>
                    <ol className="mt-8 border-t border-current/30">
                      {cat.amenities.map((a, i) => (
                        <Reveal as="li" key={a} delay={i * 0.04} y={12} className="hairline flex items-baseline gap-5 border-b py-3.5">
                          <span className="tabular text-micro opacity-60">{String(i + 1).padStart(2, '0')}</span>
                          <span className="text-body font-medium">{t(`amenities.${a}`)}</span>
                        </Reveal>
                      ))}
                    </ol>
                  </div>
                  <ParallaxImage
                    photo={img(cat.lead)}
                    sizes="(min-width: 1024px) 58vw, 100vw"
                    className="col-span-4 aspect-3/2 md:col-span-6 lg:col-span-8 lg:col-start-5"
                  />
                </div>
                <div className={cn('mt-gap grid gap-gap', cat.portraits.length === 3 ? 'grid-cols-2 md:grid-cols-3' : 'grid-cols-2')}>
                  {cat.portraits.map((id, i) => (
                    <ParallaxImage
                      key={id}
                      photo={img(id)}
                      sizes={cat.portraits.length === 3 ? '(min-width: 768px) 33vw, 50vw' : '50vw'}
                      className={cn('aspect-4/5', cat.portraits.length === 3 && i === 2 && 'max-md:col-span-2 max-md:aspect-3/2')}
                    />
                  ))}
                </div>
                {cat.closing && (
                  <ParallaxImage photo={img(cat.closing)} sizes="100vw" className="mt-gap aspect-3/2 md:aspect-21/9" />
                )}
              </div>
            </section>
          );
        })}
      </div>

      <figure>
        <ParallaxImage photo={img('site/aerial-courtyard')} sizes="100vw" className="aspect-4/3 w-full md:aspect-21/9" />
        <figcaption className="page-x mt-3 text-micro text-ink-muted">{tAlt('site/aerial-courtyard')}</figcaption>
      </figure>

      <VisitCta />
    </>
  );
}
