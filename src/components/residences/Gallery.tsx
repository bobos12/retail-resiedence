'use client';

import dynamic from 'next/dynamic';
import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { useMemo, useState } from 'react';
import type { Photo } from '@/content/images';
import { cn } from '@/lib/cn';
import { blurBackground, useNearViewport } from '@/lib/use-near-viewport';

export const loadLightbox = () => import('./Lightbox').then((m) => m.Lightbox);
const Lightbox = dynamic(loadLightbox, { ssr: false });

type Slot = { photo: Photo; className: string; sizes: string };

const landscape = (p: Photo) => p.width >= p.height;

/**
 * Lays photos out in rows that suit their shape and resolution, so nothing is
 * cropped hard or shown larger than its source:
 *  - sharp galleries pair a wide landscape with a portrait, or two landscapes;
 *  - galleries from 1080p video frames use a steady two-up grid;
 *  - galleries with small (~1000px) photos use thirds.
 */
function layout(photos: Photo[]): Slot[] {
  const minWidth = Math.min(...photos.filter(landscape).map((p) => p.width), Infinity);
  const tier = minWidth >= 1900 ? 'sharp' : minWidth >= 1500 ? 'frames' : 'small';

  if (tier === 'small') {
    return photos.map((photo) => ({
      photo,
      className: 'md:col-span-3 lg:col-span-4 aspect-3/2',
      sizes: '(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw',
    }));
  }

  const wide = photos.filter(landscape);
  const tall = photos.filter((p) => !landscape(p));
  const pairAspect = tier === 'sharp' ? 'aspect-3/2' : 'aspect-16/10';
  const slots: Slot[] = [];
  let flip = false;

  while (wide.length || tall.length) {
    if (tier === 'sharp' && wide.length && tall.length) {
      const big: Slot = {
        photo: wide.shift()!,
        className: 'md:col-span-6 lg:col-span-8 aspect-3/2',
        sizes: '(min-width: 1024px) 66vw, 100vw',
      };
      const narrow: Slot = {
        photo: tall.shift()!,
        className: 'md:col-span-6 lg:col-span-4 aspect-4/5 lg:aspect-auto',
        sizes: '(min-width: 1024px) 33vw, 100vw',
      };
      slots.push(...(flip ? [narrow, big] : [big, narrow]));
      flip = !flip;
    } else if (wide.length >= 2) {
      for (const photo of wide.splice(0, 2)) {
        slots.push({ photo, className: cn('md:col-span-3 lg:col-span-6', pairAspect), sizes: '(min-width: 768px) 50vw, 100vw' });
      }
    } else if (wide.length === 1) {
      slots.push({ photo: wide.shift()!, className: cn('md:col-span-6 lg:col-span-8', pairAspect), sizes: '(min-width: 1024px) 66vw, 100vw' });
    } else {
      for (const photo of tall.splice(0, 3)) {
        slots.push({ photo, className: 'md:col-span-2 lg:col-span-4 aspect-4/5', sizes: '(min-width: 768px) 33vw, 100vw' });
      }
    }
  }
  return slots;
}

type Props = { photos: Photo[]; title: string };

export function Gallery({ photos, title }: Props) {
  const t = useTranslations('residences.detail');
  const [index, setIndex] = useState<number | null>(null);
  // Mount the (lazily loaded) lightbox on first use, then keep it for its exit animation.
  const [used, setUsed] = useState(false);
  const [grid, near] = useNearViewport<HTMLUListElement>();
  const slots = useMemo(() => layout(photos), [photos]);
  const ordered = useMemo(() => slots.map((s) => s.photo), [slots]);

  return (
    <>
      <ul ref={grid} className="grid-page gap-y-gap">
        {slots.map(({ photo: p, className, sizes }, i) => (
          <li key={p.src} className={cn('col-span-4 flex', className)}>
            <button
              type="button"
              onClick={() => {
                setUsed(true);
                setIndex(i);
              }}
              onPointerEnter={loadLightbox}
              className="group relative block w-full overflow-hidden bg-canvas-deep"
              style={near ? undefined : blurBackground(p.blurDataURL)}
            >
              {near && (
                <Image
                  src={p.src}
                  alt=""
                  fill
                  sizes={sizes}
                  quality={80}
                  placeholder="blur"
                  blurDataURL={p.blurDataURL}
                  className="object-cover transition-transform duration-(--dur-slow) ease-out group-hover:scale-104"
                />
              )}
              <span className="sr-only">
                {t('galleryOpen', { num: String(i + 1), total: String(slots.length) })}: {p.alt}
              </span>
            </button>
          </li>
        ))}
      </ul>
      {used && <Lightbox photos={ordered} index={index} onChange={setIndex} label={title} />}
    </>
  );
}
