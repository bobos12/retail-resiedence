import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { VisitCta } from '@/components/home/VisitCta';
import { DriveTimes } from '@/components/map/DriveTimes';
import { NeighborhoodMap } from '@/components/map/NeighborhoodMap';
import { ParallaxImage } from '@/components/motion/ParallaxImage';
import { Reveal } from '@/components/motion/Reveal';
import { RevealLines } from '@/components/motion/RevealLines';
import { ButtonAnchor } from '@/components/ui/ButtonLink';
import { PageHeader } from '@/components/ui/PageHeader';
import { contact } from '@/content/contact';
import { photo } from '@/content/images';
import { DIRECTIONS_URL, GEO } from '@/content/neighborhood';
import type { Locale } from '@/i18n/routing';
import { pageMetadata } from '@/lib/seo';

export async function generateMetadata({ params }: PageProps<'/[locale]/neighborhood'>): Promise<Metadata> {
  const locale = (await params).locale as Locale;
  const t = await getTranslations({ locale, namespace: 'meta.neighborhood' });
  return pageMetadata({ locale, path: '/neighborhood', title: t('title'), description: t('description'), image: 'site/aerial-compound-dusk' });
}

export default async function NeighborhoodPage({ params }: PageProps<'/[locale]/neighborhood'>) {
  const locale = (await params).locale as Locale;
  setRequestLocale(locale);
  const t = await getTranslations('neighborhood');
  const tAlt = await getTranslations('images');
  const tc = await getTranslations('common');

  return (
    <>
      <PageHeader eyebrow={t('hero.eyebrow')} title={t('hero.title')} intro={t('hero.subtitle')} />

      <section className="page-x">
        <NeighborhoodMap />
      </section>

      <section className="page-x py-section-sm">
        <div className="grid-page gap-y-12">
          <DriveTimes className="col-span-4 md:col-span-6 lg:col-span-8" columns={1} />
          <Reveal className="col-span-4 md:col-span-6 lg:col-span-3 lg:col-start-10">
            <h2 className="eyebrow mb-4 text-ink-muted">{t('address')}</h2>
            <address className="text-body not-italic">
              <span dir="ltr">{contact.company}</span>
              <br />
              <span dir="ltr">{contact.address.street}</span>
              <br />
              <span dir="ltr">
                {contact.address.city} {contact.address.postalCode}
              </span>
            </address>
            <p className="tabular mt-4 text-small text-ink-muted" dir="ltr">
              {GEO.lat}° N, {GEO.lng}° E
            </p>
            <ButtonAnchor href={DIRECTIONS_URL} target="_blank" variant="outline" newTabLabel={tc('opensNewTab')} className="mt-6">
              {t('directions')}
            </ButtonAnchor>
          </Reveal>
        </div>
      </section>

      <section className="pb-section" aria-labelledby="aerial-title">
        <ParallaxImage photo={photo('site/aerial-compound-dusk', tAlt)} sizes="100vw" className="aspect-4/3 w-full md:aspect-21/9" />
        <div className="page-x mt-12 grid-page gap-y-6">
          <p className="eyebrow col-span-4 flex items-center gap-3 md:col-span-6 lg:col-span-12">
            <span className="size-1.5 rounded-pill bg-copper" aria-hidden />
            {t('aerial.eyebrow')}
          </p>
          <RevealLines as="h2" text={t('aerial.title')} className="col-span-4 text-h2 font-medium md:col-span-6 lg:col-span-6" />
          <Reveal className="col-span-4 self-end md:col-span-5 lg:col-span-4 lg:col-start-9" delay={0.1}>
            <p className="max-w-prose text-lead text-ink-soft">{t('aerial.body')}</p>
          </Reveal>
        </div>
        {/* The villas and the Clubhouse from the air, side by side at one height. */}
        <div className="page-x mt-12 grid gap-gap md:grid-cols-2">
          <ParallaxImage photo={photo('site/aerial-villas', tAlt)} sizes="(min-width: 768px) 50vw, 100vw" className="aspect-4/3" />
          <ParallaxImage photo={photo('site/aerial-clubhouse-dusk', tAlt)} sizes="(min-width: 768px) 50vw, 100vw" className="aspect-4/3" />
        </div>
      </section>

      <VisitCta />
    </>
  );
}
