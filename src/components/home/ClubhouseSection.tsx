import { getTranslations } from 'next-intl/server';
import { ButtonLink } from '@/components/ui/ButtonLink';
import { SectionIntro } from '@/components/ui/SectionIntro';
import { clubhouseHighlights } from '@/content/amenities';
import { photo } from '@/content/images';
import { ClubhouseIndex } from './ClubhouseIndex';

// Dark rhythm break: the Clubhouse, as a numbered index with a swapping photograph.
export async function ClubhouseSection() {
  const t = await getTranslations('home.clubhouse');
  const tAlt = await getTranslations('images');
  const items = clubhouseHighlights.map((h) => ({
    key: h.key,
    title: t(`items.${h.key}.title`),
    body: t(`items.${h.key}.body`),
    photo: photo(h.image, tAlt),
  }));

  return (
    <section data-theme="dark" className="bg-night py-section text-bone">
      <div className="page-x">
        <SectionIntro
          eyebrow={t('eyebrow')}
          title={t('title')}
          intro={t('intro')}
          aside={
            <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
              <ButtonLink href="/clubhouse" variant="light">
                {t('cta')}
              </ButtonLink>
              <a
                href="#clubhouse-tour"
                className="inline-flex min-h-tap items-center text-small font-medium underline decoration-bone/40 underline-offset-4 hover:decoration-bone"
              >
                {t('tour')}
              </a>
            </div>
          }
          className="mb-16"
        />
        <ClubhouseIndex items={items} />
      </div>
    </section>
  );
}
