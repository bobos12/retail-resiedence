'use client';

import Image from 'next/image';
import { useState } from 'react';
import type { Photo } from '@/content/images';
import { cn } from '@/lib/cn';
import { blurBackground, useNearViewport } from '@/lib/use-near-viewport';
import { Arrow } from './Arrow';

type Props = {
  src: string;
  /** Accessible title for the iframe once loaded. */
  title: string;
  poster: Photo;
  /** Big label on the poster, e.g. "Start the 3D tour". */
  cta: string;
  /** Small line under the button, e.g. "Loads the interactive tour here". */
  hint?: string;
  /** Label for the full-screen link shown once the tour is running. */
  openLabel: string;
  newTabLabel: string;
  className?: string;
};

// The tour itself is heavy, so nothing loads until the visitor asks for it:
// a photograph with one large button, then the live tour in place.
export function TourEmbed({ src, title, poster, cta, hint, openLabel, newTabLabel, className }: Props) {
  const [active, setActive] = useState(false);
  const [frame, near] = useNearViewport<HTMLDivElement>();

  return (
    <div className={className}>
      <div
        ref={frame}
        className="relative aspect-4/5 overflow-hidden bg-night sm:aspect-video"
        style={near ? undefined : blurBackground(poster.blurDataURL)}
        data-lenis-prevent={active || undefined}
      >
        {active ? (
          <iframe
            src={src}
            title={title}
            allow="fullscreen; xr-spatial-tracking; gyroscope; accelerometer"
            allowFullScreen
            className="absolute inset-0 size-full"
          />
        ) : (
          <button type="button" onClick={() => setActive(true)} className="group absolute inset-0 size-full text-bone">
            {near && (
              <Image
                src={poster.src}
                alt=""
                fill
                sizes="(min-width: 1024px) 90vw, 100vw"
                quality={80}
                placeholder="blur"
                blurDataURL={poster.blurDataURL}
                className="object-cover transition-transform duration-(--dur-slow) ease-out group-hover:scale-103"
              />
            )}
            <span className="absolute inset-0 flex flex-col items-center justify-center gap-4 p-6">
              <span
                className={cn(
                  'inline-flex min-h-tap items-center gap-4 rounded-pill bg-bone py-3 pe-7 ps-3 text-body font-medium text-ink',
                  'transition-colors duration-(--dur-fast) group-hover:bg-canvas',
                )}
              >
                <span className="relative inline-flex size-12 items-center justify-center rounded-pill bg-ink text-canvas">
                  <span className="absolute inset-0 animate-tour-ping rounded-pill border border-ink" aria-hidden />
                  <svg viewBox="0 0 24 24" className="size-6" fill="none" stroke="currentColor" strokeWidth="1.3" aria-hidden>
                    <path d="M12 3 20 7.5v9L12 21l-8-4.5v-9L12 3Z" strokeLinejoin="round" />
                    <path d="M4 7.5 12 12l8-4.5M12 12v9" strokeLinejoin="round" />
                  </svg>
                </span>
                {cta}
              </span>
              {hint && <span className="rounded-pill bg-night/70 px-3 py-1 text-small text-bone">{hint}</span>}
            </span>
          </button>
        )}
      </div>
      {active && (
        <a
          href={src}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-3 inline-flex min-h-tap items-center gap-2 text-small font-medium underline decoration-line underline-offset-4 hover:decoration-current"
        >
          {openLabel}
          <Arrow external />
          <span className="sr-only">({newTabLabel})</span>
        </a>
      )}
    </div>
  );
}
