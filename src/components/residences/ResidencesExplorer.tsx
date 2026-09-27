'use client';

import { AnimatePresence, LayoutGroup, m } from 'motion/react';
import { useTranslations } from 'next-intl';
import { useState } from 'react';
import type { ResidenceSummary } from '@/content/residence-summaries';
import { residenceTypes, type ResidenceType } from '@/content/residences';
import Image from 'next/image';
import type { Photo } from '@/content/images';
import { cn } from '@/lib/cn';
import { DUR, EASE_OUT } from '@/lib/motion';
import { ResidenceCard } from './ResidenceCard';
import { ResidenceTable } from './ResidenceTable';
import { ViewToggle, type View } from './ViewToggle';

type Filter = 'all' | ResidenceType;
type Aside = { photo: Photo; caption: string };

/** Classes for the closing photo so it fills whatever the last row leaves empty. */
function fillerClass(count: number) {
  const md = count % 2 === 1 ? 'md:flex' : 'md:hidden';
  const xl = count % 3 === 0 ? 'xl:hidden' : count % 3 === 1 ? 'xl:flex xl:col-span-2' : 'xl:flex xl:col-span-1';
  return cn('hidden', md, xl);
}

export function ResidencesExplorer({ residences, aside }: { residences: ResidenceSummary[]; aside: Aside }) {
  const t = useTranslations('residences');
  const [filter, setFilter] = useState<Filter>('all');
  const [view, setView] = useState<View>('cards');
  const shown = filter === 'all' ? residences : residences.filter((r) => r.type === filter);
  const count = { n: shown.length, num: String(shown.length) };

  return (
    <div>
      <div className="flex flex-col gap-6 border-b border-line pb-6 lg:flex-row lg:items-center lg:justify-between">
        <div role="group" aria-label={t('index.filter')} className="no-scrollbar -mx-gutter flex gap-2 overflow-x-auto px-gutter lg:mx-0 lg:px-0">
          <LayoutGroup id="residence-filter">
            {(['all', ...residenceTypes] as Filter[]).map((f) => (
              <button
                key={f}
                type="button"
                aria-pressed={filter === f}
                onClick={() => setFilter(f)}
                className={cn(
                  'relative isolate inline-flex min-h-tap shrink-0 items-center rounded-pill border px-5 text-small font-medium transition-colors duration-(--dur-fast)',
                  filter === f ? 'border-ink text-canvas' : 'border-line text-ink-soft hover:border-ink hover:text-ink',
                )}
              >
                {filter === f && (
                  <m.span
                    layoutId="filter-pill"
                    className="absolute inset-0 -z-10 rounded-pill bg-ink"
                    transition={{ duration: DUR.base, ease: EASE_OUT }}
                  />
                )}
                {f === 'all' ? t('index.all') : t(`typesPlural.${f}`)}
              </button>
            ))}
          </LayoutGroup>
        </div>
        <div className="flex items-center justify-between gap-6">
          <p className="tabular text-small text-ink-muted" aria-live="polite">
            {t('index.count', count)}
          </p>
          <ViewToggle value={view} onChange={setView} />
        </div>
      </div>

      <AnimatePresence mode="wait" initial={false}>
        {view === 'cards' ? (
          <m.ul
            key="cards"
            className="mt-10 grid gap-x-gap gap-y-14 md:grid-cols-2 xl:grid-cols-3"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: DUR.base, ease: EASE_OUT }}
          >
            <AnimatePresence mode="popLayout" initial={false}>
              {shown.map((r) => (
                <m.li
                  key={r.slug}
                  layout
                  initial={{ opacity: 0, scale: 0.97 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.97 }}
                  transition={{ duration: DUR.base, ease: EASE_OUT }}
                >
                  <ResidenceCard residence={r} sizes="(min-width: 1280px) 31vw, (min-width: 768px) 48vw, 100vw" />
                </m.li>
              ))}
              <m.li
                key="aside"
                layout
                className={cn('flex-col', fillerClass(shown.length))}
                transition={{ duration: DUR.base, ease: EASE_OUT }}
              >
                <figure className="flex flex-1 flex-col">
                  <div className="relative min-h-0 flex-1 overflow-hidden bg-canvas-deep">
                    <Image
                      src={aside.photo.src}
                      alt={aside.photo.alt}
                      fill
                      sizes="(min-width: 1280px) 62vw, 48vw"
                      quality={80}
                      placeholder="blur"
                      blurDataURL={aside.photo.blurDataURL}
                      className="object-cover"
                    />
                  </div>
                  <figcaption className="mt-4 border-t border-line pt-4 text-small text-ink-soft">{aside.caption}</figcaption>
                </figure>
              </m.li>
            </AnimatePresence>
          </m.ul>
        ) : (
          <m.div
            key="table"
            className="mt-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: DUR.base, ease: EASE_OUT }}
          >
            <ResidenceTable residences={shown} caption={t('index.eyebrow')} />
          </m.div>
        )}
      </AnimatePresence>
    </div>
  );
}
