'use client';

import dynamic from 'next/dynamic';
import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { useState } from 'react';
import type { Photo } from '@/content/images';

export const loadFloorPlanViewer = () => import('./FloorPlanViewer');
const FloorPlanViewer = dynamic(loadFloorPlanViewer, { ssr: false });

// Plan preview; the zoomable viewer is fetched the first time it is needed.
export function FloorPlan({ plan, title }: { plan: Photo; title: string }) {
  const t = useTranslations('residences.detail');
  const [open, setOpen] = useState(false);
  const [used, setUsed] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => {
          setUsed(true);
          setOpen(true);
        }}
        onPointerEnter={loadFloorPlanViewer}
        onFocus={loadFloorPlanViewer}
        className="group relative block w-full overflow-hidden bg-bone p-6 md:p-10"
        aria-haspopup="dialog"
      >
        <span className="relative block" style={{ aspectRatio: `${plan.width} / ${plan.height}` }}>
          <Image src={plan.src} alt={plan.alt} fill sizes="(min-width: 1024px) 60vw, 100vw" quality={90} className="object-contain" />
        </span>
        <span className="absolute bottom-4 end-4 inline-flex min-h-tap items-center gap-2 rounded-pill bg-ink px-5 text-small font-medium text-canvas transition-colors duration-(--dur-fast) group-hover:bg-copper-deep">
          <svg viewBox="0 0 20 20" className="size-4" fill="none" stroke="currentColor" strokeWidth="1.4" aria-hidden>
            <circle cx="8.5" cy="8.5" r="5.5" />
            <path d="m13 13 4.5 4.5M8.5 6v5M6 8.5h5" />
          </svg>
          {t('planZoom')}
        </span>
      </button>
      {used && <FloorPlanViewer plan={plan} title={title} open={open} onClose={() => setOpen(false)} />}
    </>
  );
}
