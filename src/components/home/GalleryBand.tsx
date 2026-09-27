'use client';

import { m, useReducedMotion } from 'motion/react';
import dynamic from 'next/dynamic';
import Image from 'next/image';
import { useState } from 'react';
import type { Photo } from '@/content/images';
import { cn } from '@/lib/cn';
import { DUR, EASE_OUT, VIEWPORT } from '@/lib/motion';
import { blurBackground, useNearViewport } from '@/lib/use-near-viewport';

const loadLightbox = () => import('@/components/residences/Lightbox').then((mod) => mod.Lightbox);
const Lightbox = dynamic(loadLightbox, { ssr: false });

/** Blocks of four: a large landscape, a wide landscape, then two portraits. */
type Block = [Photo, Photo, Photo, Photo];
type Props = { eyebrow: string; hint: string; openLabel: string; blocks: Block[] };

function Tile({ photo, index, sizes, className, onOpen, openLabel }: { photo: Photo; index: number; sizes: string; className?: string; onOpen: () => void; openLabel: string }) {
  const reduce = useReducedMotion();
  const [ref, near] = useNearViewport<HTMLButtonElement>();
  return (
    <m.button
      ref={ref}
      type="button"
      onClick={onOpen}
      onPointerEnter={loadLightbox}
      aria-haspopup="dialog"
      className={cn('group relative block overflow-hidden bg-canvas-deep', className)}
      style={near ? undefined : blurBackground(photo.blurDataURL)}
      initial={reduce ? false : { clipPath: 'inset(8% 8% 8% 8%)', opacity: 0 }}
      whileInView={{ clipPath: 'inset(0% 0% 0% 0%)', opacity: 1 }}
      viewport={VIEWPORT}
      transition={{ duration: DUR.reveal, ease: EASE_OUT, delay: index * 0.08 }}
    >
      {near && (
        <Image
          src={photo.src}
          alt=""
          fill
          sizes={sizes}
          placeholder="blur"
          blurDataURL={photo.blurDataURL}
          className="object-cover transition-transform duration-(--dur-slow) ease-out group-hover:scale-104"
        />
      )}
      <span className="sr-only">
        {openLabel}: {photo.alt}
      </span>
    </m.button>
  );
}

// Around the compound: blocks of one large photograph, one wide and two portraits, composed on the
// grid at a single height; every second block is mirrored. Any photograph opens the full-screen viewer.
export function GalleryBand({ eyebrow, hint, openLabel, blocks }: Props) {
  const photos = blocks.flat();
  const [index, setIndex] = useState<number | null>(null);
  const [used, setUsed] = useState(false);
  const open = (i: number) => {
    setUsed(true);
    setIndex(i);
  };

  return (
    <section aria-label={eyebrow} className="page-x py-section-sm">
      <div className="mb-8 flex flex-wrap items-baseline justify-between gap-4">
        <p className="eyebrow flex items-center gap-3">
          <span className="size-1.5 rounded-pill bg-copper" aria-hidden />
          {eyebrow}
        </p>
        <p className="text-small text-ink-muted">{hint}</p>
      </div>

      <div className="flex flex-col gap-gap">
        {blocks.map(([big, wide, left, right], b) => {
          const at = b * 4;
          const flip = b % 2 === 1;
          const tile = (photo: Photo, i: number, sizes: string, className: string) => (
            <Tile photo={photo} index={i % 4} onOpen={() => open(at + i)} openLabel={openLabel} sizes={sizes} className={className} />
          );
          return (
            <div key={big.src} className="gallery-mosaic grid grid-cols-2 gap-gap lg:grid-cols-12">
              {tile(big, 0, '(min-width: 1024px) 58vw, 100vw', cn('col-span-2 aspect-4/3 lg:col-span-7 lg:row-span-2 lg:aspect-auto', flip && 'lg:col-start-6'))}
              {tile(wide, 1, '(min-width: 1024px) 42vw, 100vw', cn('col-span-2 aspect-3/2 lg:col-span-5 lg:aspect-auto', flip && 'lg:col-start-1 lg:row-start-1'))}
              <div className={cn('col-span-2 grid grid-cols-2 gap-gap lg:col-span-5', flip && 'lg:col-start-1 lg:row-start-2')}>
                {tile(left, 2, '(min-width: 1024px) 21vw, 50vw', 'aspect-4/5 lg:aspect-auto')}
                {tile(right, 3, '(min-width: 1024px) 21vw, 50vw', 'aspect-4/5 lg:aspect-auto')}
              </div>
            </div>
          );
        })}
      </div>

      {used && <Lightbox photos={photos} index={index} onChange={setIndex} label={eyebrow} />}
    </section>
  );
}
