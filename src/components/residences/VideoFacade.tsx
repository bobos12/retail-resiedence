'use client';

import Image from 'next/image';
import { useState } from 'react';
import type { Photo } from '@/content/images';
import { blurBackground, useNearViewport } from '@/lib/use-near-viewport';

type Props = { id: string; title: string; playLabel: string; poster: Photo };

// No YouTube iframe until the visitor asks for it: our own photograph stands in.
export function VideoFacade({ id, title, playLabel, poster }: Props) {
  const [playing, setPlaying] = useState(false);
  const [frame, near] = useNearViewport<HTMLDivElement>();

  return (
    <div
      ref={frame}
      className="relative aspect-video overflow-hidden bg-night"
      style={near ? undefined : blurBackground(poster.blurDataURL)}
    >
      {playing ? (
        <iframe
          src={`https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0&modestbranding=1&playsinline=1`}
          title={title}
          allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
          allowFullScreen
          className="absolute inset-0 size-full"
        />
      ) : (
        <button type="button" onClick={() => setPlaying(true)} className="group absolute inset-0 size-full">
          {near && (
            <Image
              src={poster.src}
              alt=""
              fill
              sizes="(min-width: 1024px) 58vw, 100vw"
              placeholder="blur"
              blurDataURL={poster.blurDataURL}
              className="object-cover transition-transform duration-(--dur-slow) ease-out group-hover:scale-103"
            />
          )}
          <span className="absolute bottom-5 start-5 inline-flex min-h-tap items-center gap-3 rounded-pill bg-bone py-2 pe-5 ps-2 text-small font-medium text-ink transition-colors duration-(--dur-fast) group-hover:bg-canvas">
            <span className="inline-flex size-9 items-center justify-center rounded-pill bg-ink text-canvas">
              <svg viewBox="0 0 20 20" className="size-3.5 translate-x-px" fill="currentColor" aria-hidden>
                <path d="M6 4.5v11l9-5.5-9-5.5Z" />
              </svg>
            </span>
            <span>{playLabel}</span>
          </span>
        </button>
      )}
    </div>
  );
}
