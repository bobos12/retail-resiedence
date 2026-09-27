import { getTranslations } from 'next-intl/server';
import { ParallaxImage } from '@/components/motion/ParallaxImage';
import { Reveal } from '@/components/motion/Reveal';
import { RevealLines } from '@/components/motion/RevealLines';
import { photo } from '@/content/images';

const services = ['security', 'housekeeping', 'laundry', 'supermarket', 'facilities'] as const;

// Trust, shown with photographs of the gate and the services, not an icon grid.
export async function SecuritySection() {
  const t = await getTranslations('home.security');
  const tAlt = await getTranslations('images');

  return (
    <section className="bg-canvas-deep py-section">
      <div className="page-x grid-page gap-y-12">
        <ParallaxImage
          photo={photo('site/gate-guard', tAlt)}
          sizes="(min-width: 1024px) 42vw, (min-width: 768px) 50vw, 100vw"
          className="col-span-4 aspect-4/5 md:col-span-3 lg:col-span-5 lg:row-span-2 lg:aspect-auto"
        />
        <div className="col-span-4 md:col-span-3 lg:col-span-6 lg:col-start-7">
          <p className="eyebrow flex items-center gap-3">
            <span className="size-1.5 rounded-pill bg-copper" aria-hidden />
            {t('eyebrow')}
          </p>
          <RevealLines text={t('title')} className="mt-8 text-h2 font-medium" />
          <Reveal delay={0.1}>
            <p className="mt-6 max-w-prose text-lead text-ink-soft">{t('body')}</p>
          </Reveal>
          <ol className="mt-10 border-t border-ink">
            {services.map((key, i) => (
              <Reveal as="li" key={key} delay={i * 0.05} y={12} className="flex items-baseline gap-6 border-b border-line py-4">
                <span className="tabular text-micro text-ink-muted">{String(i + 1).padStart(2, '0')}</span>
                <span className="text-h4 font-medium">{t(`services.${key}`)}</span>
              </Reveal>
            ))}
          </ol>
        </div>
        <div className="col-span-4 grid grid-cols-2 gap-gap md:col-span-6 lg:col-span-6 lg:col-start-7 lg:self-end">
          <ParallaxImage photo={photo('site/gate-checkpoint', tAlt)} sizes="(min-width: 1024px) 25vw, 50vw" className="aspect-4/5" />
          <ParallaxImage photo={photo('site/gate-dusk-portrait', tAlt)} sizes="(min-width: 1024px) 25vw, 50vw" className="aspect-4/5" />
        </div>
      </div>
    </section>
  );
}
