'use client';

import Image from 'next/image';
import { useState } from 'react';
import type { Photo } from '@/content/images';
import { cn } from '@/lib/cn';
import { blurBackground, useNearViewport } from '@/lib/use-near-viewport';

type Item = { key: string; title: string; body: string; photo: Photo };

// Numbered list; hovering, focusing or tapping an item swaps the photograph beside it.
export function ClubhouseIndex({ items }: { items: Item[] }) {
  const [active, setActive] = useState(0);
  const [frame, near] = useNearViewport<HTMLDivElement>();

  return (
    <div className="grid-page gap-y-10">
      <div
        ref={frame}
        style={near ? undefined : blurBackground(items[0]!.photo.blurDataURL)}
        className="relative col-span-4 aspect-4/5 overflow-hidden bg-night-raised md:col-span-6 md:aspect-3/2 lg:order-2 lg:col-span-6 lg:col-start-7 lg:aspect-4/5"
      >
        {near &&
          items.map((item, i) => (
            <Image
              key={item.key}
              src={item.photo.src}
              alt={i === active ? item.photo.alt : ''}
              aria-hidden={i !== active}
              fill
              sizes="(min-width: 1024px) 50vw, 100vw"
              placeholder="blur"
              blurDataURL={item.photo.blurDataURL}
              className={cn(
                'object-cover transition-[opacity,scale] duration-(--dur-reveal) ease-out',
                i === active ? 'scale-100 opacity-100' : 'scale-105 opacity-0',
              )}
            />
          ))}
        <p className="tabular absolute bottom-4 end-4 rounded-pill bg-night/80 px-3 py-1 text-micro text-bone" aria-hidden>
          {String(active + 1).padStart(2, '0')} / {String(items.length).padStart(2, '0')}
        </p>
      </div>

      <ol className="col-span-4 border-t border-night-line md:col-span-6 lg:order-1 lg:col-span-5">
        {items.map((item, i) => {
          const on = i === active;
          return (
            <li key={item.key} className="border-b border-night-line">
              <button
                type="button"
                onMouseEnter={() => setActive(i)}
                onFocus={() => setActive(i)}
                onClick={() => setActive(i)}
                aria-expanded={on}
                className="group grid w-full grid-cols-[auto_1fr] items-baseline gap-x-6 py-5 text-start md:py-6"
              >
                <span className={cn('tabular text-micro transition-colors duration-(--dur-fast)', on ? 'text-copper' : 'text-bone-soft')}>
                  {String(i + 1).padStart(2, '0')}
                </span>
                <span
                  className={cn(
                    'text-h3 font-medium transition-[color,translate] duration-(--dur-base) ease-out',
                    on ? 'translate-x-2 text-bone rtl:-translate-x-2' : 'text-bone-soft group-hover:text-bone',
                  )}
                >
                  {item.title}
                </span>
                <span
                  className={cn(
                    'col-start-2 grid transition-[grid-template-rows,opacity] duration-(--dur-base) ease-out',
                    on ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0',
                  )}
                >
                  <span className="overflow-hidden">
                    <span className="block max-w-prose pt-3 text-body text-bone-soft">{item.body}</span>
                  </span>
                </span>
              </button>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
