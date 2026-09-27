import { getTranslations } from 'next-intl/server';
import { ParallaxImage } from '@/components/motion/ParallaxImage';
import { Reveal } from '@/components/motion/Reveal';
import { Icon, type IconName } from '@/components/ui/Icon';
import { photo } from '@/content/images';

const principles: { key: 'design' | 'stroll' | 'security'; icon: IconName }[] = [
  { key: 'design', icon: 'plan' },
  { key: 'stroll', icon: 'pin' },
  { key: 'security', icon: 'shield' },
];

// Editorial statement, then the compound and its lobby side by side at one height,
// then the three principles.
export async function Statement() {
  const t = await getTranslations('home.statement');
  const tAlt = await getTranslations('images');

  return (
    <section className="page-x py-section">
      <div className="grid-page items-start gap-y-6">
        <h2 className="eyebrow col-span-4 flex items-center gap-3 md:col-span-6 lg:col-span-3 lg:pt-3">
          <span className="size-1.5 rounded-pill bg-copper" aria-hidden />
          {t('eyebrow')}
        </h2>
        <Reveal className="col-span-4 md:col-span-6 lg:col-span-9">
          <p className="max-w-statement text-h3 font-medium">{t('text')}</p>
        </Reveal>
      </div>

      {/* Phones: the aerial alone. Tablet and up: aerial and lobby share one height. */}
      <div className="mt-12 grid-page gap-y-gap md:mt-16">
        <ParallaxImage
          photo={photo('site/aerial-compound', tAlt)}
          sizes="(min-width: 768px) 66vw, 100vw"
          className="col-span-4 aspect-4/3 md:col-span-4 md:aspect-auto md:h-full lg:col-span-8"
        />
        <ParallaxImage
          photo={photo('clubhouse/lobby-portrait', tAlt)}
          sizes="(min-width: 768px) 33vw, 1px"
          className="aspect-4/5 max-md:hidden md:col-span-2 lg:col-span-4"
        />
      </div>

      <ol className="mt-12 grid-page gap-y-gap md:mt-16">
        {principles.map(({ key, icon }, i) => (
          <Reveal as="li" key={key} delay={i * 0.08} className="col-span-4 flex gap-5 border-t border-ink pt-6 md:col-span-2 md:flex-col lg:col-span-4 lg:flex-row">
            <span className="grid size-12 shrink-0 place-items-center border border-line text-copper-deep" aria-hidden>
              <Icon name={icon} className="size-6" />
            </span>
            <div>
              <p className="flex items-baseline gap-3">
                <span className="tabular text-micro text-ink-muted">{String(i + 1).padStart(2, '0')}</span>
                <span className="text-h4 font-medium">{t(`principles.${key}.title`)}</span>
              </p>
              <p className="mt-3 max-w-prose text-body text-ink-soft">{t(`principles.${key}.body`)}</p>
            </div>
          </Reveal>
        ))}
      </ol>
    </section>
  );
}
