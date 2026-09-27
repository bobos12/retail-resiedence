'use client';

import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { Arrow } from '@/components/ui/Arrow';
import type { ResidenceSummary } from '@/content/residence-summaries';
import { Link } from '@/i18n/navigation';
import { cn } from '@/lib/cn';
import { blurBackground, useNearViewport } from '@/lib/use-near-viewport';

type Props = { residence: ResidenceSummary; sizes: string; className?: string };

// Image-first card: photo with tag pills, then name, rooms and an arrow.
export function ResidenceCard({ residence: r, sizes, className }: Props) {
  const t = useTranslations('residences');
  const tc = useTranslations('common');
  const n = (value: number) => ({ n: value, num: String(value) });
  const [frame, near] = useNearViewport<HTMLDivElement>();

  return (
    <Link href={`/residences/${r.slug}`} className={cn('group block', className)}>
      <div
        ref={frame}
        className="relative aspect-4/3 overflow-hidden bg-canvas-deep"
        style={near ? undefined : blurBackground(r.photo.blurDataURL)}
      >
        {near && (
          <Image
            src={r.photo.src}
            alt={r.photo.alt}
            fill
            sizes={sizes}
            quality={80}
            placeholder="blur"
            blurDataURL={r.photo.blurDataURL}
            className="object-cover transition-transform duration-(--dur-slow) ease-out group-hover:scale-104"
          />
        )}
        {r.hasTour && (
          <span className="absolute bottom-3 end-3 inline-flex items-center gap-2 rounded-pill bg-ink px-3 py-1.5 text-micro font-medium text-canvas">
            <span className="size-1.5 rounded-pill bg-copper" aria-hidden />
            {t('tours.badge')}
          </span>
        )}
        <div className="absolute start-3 top-3 flex flex-wrap gap-1.5">
          <span className="rounded-pill bg-canvas px-3 py-1 text-micro font-medium text-ink">{t(`types.${r.type}`)}</span>
          <span className="tabular rounded-pill bg-canvas px-3 py-1 text-micro font-medium text-ink">{tc('sqm', { value: r.size })}</span>
        </div>
      </div>
      <div className="mt-4 flex items-start justify-between gap-4 border-t border-line pt-4">
        <div>
          <h3 className="text-h4 font-medium">{r.name}</h3>
          <p className="mt-1 text-small text-ink-muted">
            {tc('bedrooms', n(r.bedrooms))} · {tc('bathrooms', n(r.bathrooms))}
          </p>
        </div>
        <span className="mt-1 inline-flex size-10 shrink-0 items-center justify-center rounded-pill border border-line transition-colors duration-(--dur-fast) group-hover:border-ink group-hover:bg-ink group-hover:text-canvas">
          <Arrow />
        </span>
      </div>
    </Link>
  );
}
