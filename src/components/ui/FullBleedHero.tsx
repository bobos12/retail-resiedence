import { getImageProps } from 'next/image';
import { getTranslations } from 'next-intl/server';
import type { CSSProperties, ReactNode } from 'react';
import { getImage, type ImageId } from '@/content/images';
import { cn } from '@/lib/cn';

type Props = {
  eyebrow: string;
  /** Lines separated by "\n". */
  title: string;
  wide: ImageId;
  portrait: ImageId;
  /** Text colour: light over a dark sky, dark over a pale one. */
  tone: 'light' | 'dark';
  /** object-position for each crop, e.g. "50% 30%". */
  widePosition?: string;
  portraitPosition?: string;
  /** Buttons pinned to the foot of the frame. */
  actions?: ReactNode;
};

// Full-screen photograph with a short centred title set into open sky, so the photo
// needs no overlay. Phones get their own portrait crop.
export async function FullBleedHero({ eyebrow, title, wide, portrait, tone, widePosition = '50% 50%', portraitPosition = '50% 50%', actions }: Props) {
  const tAlt = await getTranslations('images');
  const w = getImage(wide);
  const p = getImage(portrait);
  const common = { alt: tAlt(wide), sizes: '100vw', quality: 80, priority: true } as const;
  const { props: wideProps } = getImageProps({ ...common, src: w.src, width: w.width, height: w.height });
  const { props: portraitProps } = getImageProps({ ...common, src: p.src, width: p.width, height: p.height });
  const lines = title.split('\n');
  const light = tone === 'light';

  return (
    <section
      data-theme={light ? 'dark' : undefined}
      className={cn('relative isolate h-svh min-h-hero overflow-hidden', light ? 'bg-night text-bone' : 'bg-canvas-deep text-ink')}
      style={{ '--wide-pos': widePosition, '--portrait-pos': portraitPosition } as CSSProperties}
    >
      <picture>
        <source media="(min-aspect-ratio: 1/1)" srcSet={wideProps.srcSet} sizes={wideProps.sizes} />
        <img
          {...portraitProps}
          alt={common.alt}
          fetchPriority="high"
          className="intro-settle absolute inset-0 -z-10 size-full object-cover object-(--portrait-pos) landscape:object-(--wide-pos)"
        />
      </picture>

      <div className="page-x flex h-full flex-col items-center pb-8 pt-hero-top text-center">
        <p className="intro-fade eyebrow flex items-center gap-3" style={{ '--i': -2 } as CSSProperties}>
          <span className="size-1.5 rounded-pill bg-copper" aria-hidden />
          {eyebrow}
        </p>
        <h1 className="mt-5 text-hero-center font-medium">
          <span className="sr-only">{lines.join(' ')}</span>
          {lines.map((line, i) => (
            <span key={i} className="line-mask" aria-hidden>
              <span className="intro-line" style={{ '--i': i } as CSSProperties}>
                {line}
              </span>
            </span>
          ))}
        </h1>
        {actions && (
          <div className="intro-fade mt-auto flex flex-wrap justify-center gap-3" style={{ '--i': 3 } as CSSProperties}>
            {actions}
          </div>
        )}
      </div>
    </section>
  );
}
