import { getTranslations } from 'next-intl/server';
import { DriveTimes } from '@/components/map/DriveTimes';
import { NeighborhoodMap } from '@/components/map/NeighborhoodMap';
import { ButtonLink } from '@/components/ui/ButtonLink';
import { SectionIntro } from '@/components/ui/SectionIntro';

export async function NeighborhoodSection() {
  const t = await getTranslations('home.neighborhood');
  return (
    <section className="page-x py-section">
      <SectionIntro
        eyebrow={t('eyebrow')}
        title={t('title')}
        intro={t('intro')}
        aside={
          <ButtonLink href="/neighborhood" variant="outline" className="self-start">
            {t('cta')}
          </ButtonLink>
        }
        className="mb-12"
      />
      {/* Map and drive times side by side on desktop; the map opens in Google Maps. */}
      <div className="grid-page items-start gap-y-10">
        <NeighborhoodMap className="col-span-4 md:col-span-6 lg:col-span-7" sizes="(min-width: 1024px) 58vw, 100vw" />
        <DriveTimes className="col-span-4 md:col-span-6 lg:col-span-5" columns={1} />
      </div>
    </section>
  );
}
