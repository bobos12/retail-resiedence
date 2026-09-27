import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { VisitCta } from '@/components/home/VisitCta';
import { IncludedBand } from '@/components/residences/IncludedBand';
import { ResidencesExplorer } from '@/components/residences/ResidencesExplorer';
import { ToursStrip } from '@/components/residences/ToursStrip';
import { PageHeader } from '@/components/ui/PageHeader';
import { photo } from '@/content/images';
import { residenceSummaries } from '@/content/residence-summaries';
import type { Locale } from '@/i18n/routing';
import { pageMetadata } from '@/lib/seo';

export async function generateMetadata({ params }: PageProps<'/[locale]/residences'>): Promise<Metadata> {
  const locale = (await params).locale as Locale;
  const t = await getTranslations({ locale, namespace: 'meta.residences' });
  return pageMetadata({ locale, path: '/residences', title: t('title'), description: t('description'), image: 'residences/3br-town-villa/living-room' });
}

export default async function ResidencesPage({ params }: PageProps<'/[locale]/residences'>) {
  const locale = (await params).locale as Locale;
  setRequestLocale(locale);
  const t = await getTranslations('residences.index');
  const tAlt = await getTranslations('images');
  const residences = await residenceSummaries();
  const aside = { photo: photo('site/street-dusk', tAlt), caption: t('compound') };

  return (
    <>
      <PageHeader eyebrow={t('eyebrow')} title={t('title')} intro={t('intro')} />
      <section className="page-x">
        <ResidencesExplorer residences={residences} aside={aside} />
      </section>
      <ToursStrip className="pt-section" />
      <IncludedBand className="page-x pt-section-sm" />
      <VisitCta />
    </>
  );
}
