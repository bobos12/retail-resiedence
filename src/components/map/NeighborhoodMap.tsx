import { getImageProps } from 'next/image';
import { getTranslations } from 'next-intl/server';
import { getImage } from '@/content/images';
import { Arrow } from '@/components/ui/Arrow';
import { destinations, DIRECTIONS_URL, mapMarkers } from '@/content/neighborhood';
import { cn } from '@/lib/cn';

type Pt = { x: number; y: number };
const EDGE = 0.05;

/** Where an off-frame destination meets the frame, travelling from Retal. */
function edgePoint(from: Pt, to: Pt): Pt & { angle: number } {
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  const limits = [
    dx > 0 ? (1 - EDGE - from.x) / dx : dx < 0 ? (EDGE - from.x) / dx : Infinity,
    dy > 0 ? (1 - EDGE - from.y) / dy : dy < 0 ? (EDGE - from.y) / dy : Infinity,
  ];
  const k = Math.min(...limits);
  return { x: from.x + dx * k, y: from.y + dy * k, angle: (Math.atan2(dy, dx) * 180) / Math.PI };
}

const inside = (p: Pt) => p.x > EDGE && p.x < 1 - EDGE && p.y > EDGE && p.y < 1 - EDGE;
/** Destinations this close to Retal get a number chip instead of a full label. */
const NEAR = 0.06;
const near = (a: Pt, b: Pt) => Math.hypot(a.x - b.x, a.y - b.y) < NEAR;
const pct = (v: number) => `${(v * 100).toFixed(2)}%`;

async function MapMarkers({ variant, className }: { variant: 'neighborhood' | 'neighborhood-portrait'; className?: string }) {
  const t = await getTranslations('neighborhood');
  const tc = await getTranslations('common');
  const { points, areas } = mapMarkers[variant];
  const home = points.retal;

  return (
    <div className={cn('pointer-events-none absolute inset-0', className)} dir="ltr">
      {Object.entries(areas).map(([key, p]) => (
        <span
          key={key}
          className={cn(
            'eyebrow absolute -translate-y-1/2 whitespace-nowrap text-ink-muted',
            p.x > 0.8 ? '-translate-x-full' : p.x < 0.2 ? 'translate-x-0' : '-translate-x-1/2',
          )}
          style={{ left: pct(Math.min(Math.max(p.x, 0.03), 0.97)), top: pct(p.y) }}
        >
          {t(`areas.${key}`)}
        </span>
      ))}

      {destinations.map((d, i) => {
        if (!d.point) return null;
        const p = points[d.point];
        const n = String(i + 1).padStart(2, '0');
        const time = tc('minutes', { n: d.minutes, num: String(d.minutes) });
        if (near(p, home)) {
          if (variant === 'neighborhood-portrait') return null;
          return (
            <span key={d.key} className="absolute" style={{ left: pct(p.x), top: pct(p.y) }}>
              <span className="tabular absolute flex size-6 -translate-1/2 items-center justify-center rounded-pill bg-ink text-micro text-canvas ring-2 ring-canvas">
                {n}
              </span>
            </span>
          );
        }
        if (inside(p)) {
          const flip = p.x > 0.72;
          return (
            <span key={d.key} className="absolute" style={{ left: pct(p.x), top: pct(p.y) }}>
              <span className="absolute size-2.5 -translate-1/2 rounded-pill bg-ink ring-4 ring-canvas/70" />
              <span
                className={cn(
                  'absolute top-0 flex -translate-y-1/2 items-center gap-2 whitespace-nowrap rounded-pill bg-canvas px-2.5 py-1 text-micro text-ink',
                  flip ? 'right-3' : 'left-3',
                )}
                dir="auto"
              >
                <span className="tabular text-ink-muted">{n}</span>
                <span className="font-medium">{t(`short.${d.key}`)}</span>
                <span className="tabular text-ink-muted">{time}</span>
              </span>
            </span>
          );
        }
        const e = edgePoint(home, p);
        return (
          <span key={d.key} className="absolute" style={{ left: pct(e.x), top: pct(e.y) }}>
            <span
              className="absolute flex size-7 -translate-1/2 items-center justify-center rounded-pill bg-ink text-canvas"
              style={{ rotate: `${e.angle}deg` }}
            >
              <svg viewBox="0 0 20 20" className="size-3.5" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden>
                <path d="M3 10h13.5M11.5 5l5 5-5 5" />
              </svg>
            </span>
            <span
              className={cn(
                'absolute flex items-center gap-2 whitespace-nowrap rounded-pill bg-canvas px-2.5 py-1 text-micro text-ink',
                e.x > 0.5 ? 'right-5' : 'left-5',
                e.y > 0.5 ? 'bottom-2' : 'top-2',
              )}
              dir="auto"
            >
              <span className="tabular text-ink-muted">{n}</span>
              <span className="font-medium">{t(`short.${d.key}`)}</span>
              <span className="tabular text-ink-muted">{time}</span>
            </span>
          </span>
        );
      })}

      {/* Retal */}
      <span className="absolute" style={{ left: pct(home.x), top: pct(home.y) }}>
        <span className="absolute size-16 -translate-1/2 rounded-pill border border-copper/60 bg-copper/10" />
        <span className="absolute size-4 -translate-1/2 rotate-45 bg-copper ring-4 ring-canvas" />
        <span
          className={cn(
            'absolute whitespace-nowrap rounded-pill bg-ink px-3 py-1.5 text-micro font-medium text-canvas',
            variant === 'neighborhood' ? 'left-6 top-0 -translate-y-1/2' : 'bottom-6 left-1/2 -translate-x-1/2',
          )}
          dir="auto"
        >
          {t('you')}
        </span>
      </span>
    </div>
  );
}

// Styled static map (rendered from OpenStreetMap data by scripts/render-map.mjs) with
// translated HTML markers. Phones get a portrait frame with its own marker positions.
// The whole map opens the location in Google Maps.
export async function NeighborhoodMap({ className, sizes = '100vw' }: { className?: string; sizes?: string }) {
  const t = await getTranslations('neighborhood');
  const tAlt = await getTranslations('images');
  const tc = await getTranslations('common');
  const wide = getImage('map/neighborhood');
  const tall = getImage('map/neighborhood-portrait');
  const shared = { alt: tAlt('map/neighborhood'), quality: 90, loading: 'lazy' } as const;
  const { props: wideProps } = getImageProps({ ...shared, src: wide.src, width: wide.width, height: wide.height, sizes });
  const { props: tallProps } = getImageProps({ ...shared, src: tall.src, width: tall.width, height: tall.height, sizes: '100vw' });

  return (
    <figure className={className}>
      <a
        href={DIRECTIONS_URL}
        target="_blank"
        rel="noopener noreferrer"
        className="group relative block aspect-4/5 overflow-hidden bg-canvas-deep md:aspect-8/5"
        aria-label={`${t('openMap')}: ${t('mapLabel')} (${tc('opensNewTab')})`}
      >
        <picture>
          <source media="(min-width: 768px)" srcSet={wideProps.srcSet} sizes={wideProps.sizes} />
          <img {...tallProps} alt={shared.alt} className="absolute inset-0 size-full object-cover" />
        </picture>
        <MapMarkers variant="neighborhood-portrait" className="md:hidden" />
        <MapMarkers variant="neighborhood" className="hidden md:block" />
        <span className="absolute bottom-3 start-3 inline-flex min-h-tap items-center gap-2 rounded-pill bg-ink px-5 text-small font-medium text-canvas transition-colors duration-(--dur-fast) group-hover:bg-copper-deep">
          {t('openMap')}
          <Arrow external />
        </span>
      </a>
      <figcaption className="mt-3 text-micro text-ink-muted">{t('mapAttribution')}</figcaption>
    </figure>
  );
}
