import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { BookingSection } from '@/components/home/BookingSection';
import { ClubhouseSection } from '@/components/home/ClubhouseSection';
import { GalleryBand } from '@/components/home/GalleryBand';
import { Hero } from '@/components/home/Hero';
import { LivingSection } from '@/components/home/LivingSection';
import { NeighborhoodSection } from '@/components/home/NeighborhoodSection';
import { ResidencesSection } from '@/components/home/ResidencesSection';
import { SecuritySection } from '@/components/home/SecuritySection';
import { Statement } from '@/components/home/Statement';
import { Stats } from '@/components/home/Stats';
import { VisitCta } from '@/components/home/VisitCta';
import { ClubhouseTour } from '@/components/tour/ClubhouseTour';
import { photo, type ImageId, type Photo } from '@/content/images';
import type { Locale } from '@/i18n/routing';
import { complexJsonLd, JsonLd, pageMetadata } from '@/lib/seo';

// Blocks of four: a large landscape, a wide landscape, then two portraits (see GalleryBand).
const gallery: [ImageId, ImageId, ImageId, ImageId][] = [
  ['site/aerial-clubhouse-courtyard', 'site/street-dusk', 'residences/3br-town-villa/living-portrait', 'site/street-palms-portrait'],
  ['clubhouse/tennis-sunset', 'residences/3br-town-villa/dining', 'clubhouse/bowling-portrait', 'living/kids-zone-dusk'],
];

export async function generateMetadata({ params }: PageProps<'/[locale]'>): Promise<Metadata> {
  const locale = (await params).locale as Locale;
  const t = await getTranslations({ locale, namespace: 'meta.home' });
  return pageMetadata({
    locale,
    path: '/',
    title: t('title'),
    description: t('description'),
    image: 'clubhouse/pool-night',
    absoluteTitle: true,
  });
}

export default async function HomePage({ params }: PageProps<'/[locale]'>) {
  const locale = (await params).locale as Locale;
  setRequestLocale(locale);
  const t = await getTranslations('home.gallery');
  const tAlt = await getTranslations('images');

  return (
    <>
      <Hero />
      <BookingSection />
      <Statement />
      <Stats />
      <ResidencesSection />
      <ClubhouseSection />
      <ClubhouseTour variant="home" tone="light" id="clubhouse-tour" className="pt-section" />
      <LivingSection />
      <SecuritySection />
      <NeighborhoodSection />
      <GalleryBand
        eyebrow={t('eyebrow')}
        hint={t('hint')}
        openLabel={t('open')}
        blocks={gallery.map((ids) => ids.map((id) => photo(id, tAlt)) as [Photo, Photo, Photo, Photo])}
      />
      <VisitCta />
      <JsonLd data={await complexJsonLd(locale)} />
    </>
  );
}
