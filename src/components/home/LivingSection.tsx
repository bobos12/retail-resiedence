import { getTranslations } from 'next-intl/server';
import { ParallaxImage } from '@/components/motion/ParallaxImage';
import { Reveal } from '@/components/motion/Reveal';
import { ButtonLink } from '@/components/ui/ButtonLink';
import { SectionIntro } from '@/components/ui/SectionIntro';
import { photo } from '@/content/images';
import { destinations } from '@/content/neighborhood';

function Theme({ label, title, body, className }: { label: string; title: string; body: string; className?: string }) {
  return (
    <Reveal className={className}>
      <p className="inline-flex rounded-pill border border-line px-3 py-1 text-micro font-medium">{label}</p>
      <h3 className="mt-5 text-h3 font-medium">{title}</h3>
      <p className="mt-3 max-w-prose text-body text-ink-soft">{body}</p>
    </Reveal>
  );
}

// Residents' everyday life: schools, shopping, healthcare, community. Four different
// compositions rather than four identical cards; healthcare leads with its drive time.
export async function LivingSection() {
  const t = await getTranslations('home.living');
  const tAlt = await getTranslations('images');
  const tc = await getTranslations('common');
  const hospital = destinations.find((d) => d.key === 'hospital')?.minutes ?? 10;
  const theme = (key: string) => ({
    label: t(`themes.${key}.label`),
    title: t(`themes.${key}.title`),
    body: t(`themes.${key}.body`),
  });

  return (
    <section className="page-x py-section">
      <SectionIntro
        eyebrow={t('eyebrow')}
        title={t('title')}
        intro={t('intro')}
        aside={
          <ButtonLink href="/living" variant="outline" className="self-start">
            {t('cta')}
          </ButtonLink>
        }
        className="mb-section-sm"
      />

      {/* Schools */}
      <div className="grid-page items-end gap-y-8">
        <ParallaxImage
          photo={photo('living/playground', tAlt)}
          sizes="(min-width: 1024px) 58vw, 100vw"
          className="col-span-4 aspect-3/2 md:col-span-6 lg:col-span-7"
        />
        <Theme {...theme('schools')} className="col-span-4 md:col-span-4 lg:col-span-4 lg:col-start-9" />
      </div>

      {/* Shopping */}
      <div className="mt-section-sm grid-page items-start gap-y-8">
        <Theme {...theme('shopping')} className="col-span-4 md:col-span-3 lg:col-span-4 lg:col-start-2 lg:pt-section-sm" />
        <ParallaxImage
          photo={photo('clubhouse/mini-market', tAlt)}
          sizes="(min-width: 1024px) 42vw, (min-width: 768px) 50vw, 100vw"
          className="col-span-4 aspect-4/5 md:col-span-3 lg:col-span-5 lg:col-start-7"
        />
      </div>

      {/* Healthcare: the fact first, a quiet street beside it */}
      <div className="mt-section-sm grid-page items-center gap-y-8 border-t border-line pt-10">
        <p className="tabular col-span-4 text-stat font-medium md:col-span-2 lg:col-span-3" aria-hidden>
          {hospital}
          <span className="ms-2 text-h3 text-ink-muted">{tc('minUnit', { n: hospital })}</span>
        </p>
        <Theme {...theme('healthcare')} className="col-span-4 md:col-span-4 lg:col-span-4" />
        <ParallaxImage
          photo={photo('site/street-palms', tAlt)}
          sizes="(min-width: 1024px) 33vw, 100vw"
          className="col-span-4 aspect-3/2 md:col-span-6 lg:col-span-4 lg:col-start-9"
        />
      </div>

      {/* Community: full-width */}
      <div className="mt-section-sm">
        <ParallaxImage photo={photo('clubhouse/pool-terrace', tAlt)} sizes="100vw" className="aspect-4/5 md:aspect-2/1" />
        <div className="mt-8 grid-page">
          <Theme {...theme('community')} className="col-span-4 md:col-span-4 lg:col-span-5" />
        </div>
      </div>
    </section>
  );
}
