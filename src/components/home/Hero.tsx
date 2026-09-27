import { getImageProps } from 'next/image';
import { getTranslations } from 'next-intl/server';
import type { CSSProperties } from 'react';
import { ButtonLink } from '@/components/ui/ButtonLink';
import { getImage } from '@/content/images';
import { GEO } from '@/content/neighborhood';

// Full-screen: the Clubhouse pool at night. Copy sits at the foot of the frame over the water,
// with a soft fade on the lower part only so the architecture stays untouched.
export async function Hero() {
  const t = await getTranslations('home.hero');
  const tAlt = await getTranslations('images');
  const portrait = getImage('clubhouse/lobby-portrait');
  const wide = getImage('clubhouse/pool-night');
  const common = { alt: tAlt('clubhouse/pool-night'), sizes: '100vw', quality: 80, priority: true } as const;
  const { props: wideProps } = getImageProps({ ...common, src: wide.src, width: wide.width, height: wide.height });
  const { props: portraitProps } = getImageProps({ ...common, src: portrait.src, width: portrait.width, height: portrait.height });
  const lines = t('title').split('\n');

  return (
    <section data-theme="dark" className="relative isolate h-svh min-h-hero overflow-hidden bg-night text-bone">
      <picture>
        <source media="(min-aspect-ratio: 1/1)" srcSet={wideProps.srcSet} sizes={wideProps.sizes} />
        <img
          {...portraitProps}
          alt={common.alt}
          fetchPriority="high"
          className="intro-settle absolute inset-0 -z-20 size-full object-cover brightness-55 portrait:brightness-40"
        />
      </picture>
      <div className="hero-fade-top absolute inset-x-0 top-0 -z-10 h-40" aria-hidden />
      <div className="hero-fade absolute inset-x-0 bottom-0 -z-10 h-3/5" aria-hidden />

      <div className="page-x flex h-full flex-col justify-end pb-6 pt-hero-top">
        <p className="intro-fade eyebrow flex items-center gap-3" style={{ '--i': -2 } as CSSProperties}>
          <span className="size-1.5 rounded-pill bg-copper" aria-hidden />
          {t('location')}
        </p>
        <div className="mt-6 grid-page items-end gap-y-8">
          <h1 className="col-span-4 text-display font-medium md:col-span-6 lg:col-span-8">
            <span className="sr-only">{lines.join(' ')}</span>
            {lines.map((line, i) => (
              <span key={i} className="line-mask" aria-hidden>
                <span className="intro-line" style={{ '--i': i } as CSSProperties}>
                  {line}
                </span>
              </span>
            ))}
          </h1>
          <div className="intro-fade col-span-4 md:col-span-5 lg:col-span-4" style={{ '--i': 2 } as CSSProperties}>
            <p className="text-lead font-medium">{t('subtitle')}</p>
            <p className="mt-3 hidden max-w-prose text-body text-bone/85 sm:block">{t('description')}</p>
            <div className="mt-6 flex flex-wrap gap-2 sm:gap-3">
              <ButtonLink href="/residences" variant="light" className="max-sm:px-4">
                {t('primary')}
              </ButtonLink>
              <ButtonLink href="/contact" variant="outline-light" arrow={false} className="max-sm:px-4">
                {t('secondary')}
              </ButtonLink>
            </div>
          </div>
        </div>

        <div
          className="intro-fade mt-10 flex items-center justify-between gap-6 border-t border-bone/25 pt-4 text-micro text-bone/85"
          style={{ '--i': 4 } as CSSProperties}
        >
          <p className="tabular" dir="ltr">
            {GEO.lat.toFixed(2)}° N, {GEO.lng.toFixed(2)}° E
          </p>
          <p className="eyebrow flex items-center gap-3">
            {t('scroll')}
            <span className="relative block h-6 w-px overflow-hidden bg-bone/30" aria-hidden>
              <span className="absolute inset-x-0 top-0 h-1/2 animate-scroll-cue bg-bone" />
            </span>
          </p>
        </div>
      </div>
    </section>
  );
}
