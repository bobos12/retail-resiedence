'use client';

import { animate, AnimatePresence, m, useReducedMotion } from 'motion/react';
import dynamic from 'next/dynamic';
import Image from 'next/image';
import { useEffect, useId, useRef, useState } from 'react';
import { loadFloorPlanViewer } from '@/components/residences/FloorPlan';
import type { MediaKind } from '@/components/residences/MediaModal';
import { Arrow } from '@/components/ui/Arrow';
import { ButtonLink } from '@/components/ui/ButtonLink';
import { Icon, type IconName } from '@/components/ui/Icon';
import type { Photo } from '@/content/images';
import type { ResidenceType } from '@/content/residences';
import { cn } from '@/lib/cn';
import { DUR, EASE_OUT } from '@/lib/motion';

const loadLightbox = () => import('@/components/residences/Lightbox').then((mod) => mod.Lightbox);
const loadMediaModal = () => import('@/components/residences/MediaModal');
const Lightbox = dynamic(loadLightbox, { ssr: false });
const FloorPlanViewer = dynamic(loadFloorPlanViewer, { ssr: false });
const MediaModal = dynamic(loadMediaModal, { ssr: false });

export type ExplorerResidence = {
  slug: string;
  code: string;
  type: ResidenceType;
  typeLabel: string;
  name: string;
  size: number;
  bedrooms: number;
  bathrooms: number;
  floors: number;
  /** Extras as one localized phrase, or empty. */
  extras: string;
  youtube: string;
  tour?: string;
  cover: Photo;
  gallery: Photo[];
  plan: Photo;
};

export type ExplorerLabels = {
  list: string;
  sqm: string;
  livingSpace: string;
  bedrooms: string;
  bathrooms: string;
  floors: string;
  garage: string;
  garageValue: string;
  furnished: string;
  furnishedValue: string;
  appliances: string;
  appliancesValue: string;
  internet: string;
  internetValue: string;
  extras: string;
  none: string;
  gallery: string;
  video: string;
  tour: string;
  tourLoading: string;
  tourStart: string;
  tourBody: string;
  fullscreen: string;
  plan: string;
  view: string;
  previous: string;
  next: string;
  nextResidence: string;
  galleryTitle: string;
  videoPlay: string;
  tourCta: string;
  tourHint: string;
  tourOpen: string;
  newTab: string;
};

type Props = {
  residences: ExplorerResidence[];
  groups: { type: ResidenceType; label: string }[];
  labels: ExplorerLabels;
};

type Open = { kind: 'gallery' | 'plan' | MediaKind; index?: number } | null;

const HASH = 'residence-';

/** A number that counts to its new value. */
function Count({ value, reduced }: { value: number; reduced: boolean }) {
  const ref = useRef<HTMLSpanElement>(null);
  const shown = useRef(value);
  useEffect(() => {
    const el = ref.current;
    if (!el || shown.current === value) return;
    if (reduced) {
      el.textContent = String(value);
      shown.current = value;
      return;
    }
    const controls = animate(shown.current, value, {
      duration: DUR.reveal,
      ease: EASE_OUT,
      onUpdate: (v) => {
        el.textContent = String(Math.round(v));
        shown.current = v;
      },
    });
    return () => controls.stop();
  }, [value, reduced]);
  return <span ref={ref}>{value}</span>;
}

type LiveTourProps = { src: string; title: string; started: boolean; onStart: () => void; labels: { start: string; body: string; loading: string } };

/**
 * The residence's 3D tour. Our own start card sits over the cover photograph (the tour's own
 * title screen never shows); one click loads the tour, which opens straight into the space.
 */
function LiveTour({ src, title, started, onStart, labels }: LiveTourProps) {
  const [ready, setReady] = useState(false);
  if (!started) {
    return (
      <button type="button" onClick={onStart} className="group absolute inset-0 flex flex-col items-center justify-center gap-3 p-6 text-bone">
        <span className="inline-flex min-h-tap items-center gap-4 rounded-pill bg-bone py-2.5 pe-7 ps-2.5 text-body font-medium text-ink transition-colors duration-(--dur-fast) group-hover:bg-canvas">
          <span className="relative inline-flex size-11 items-center justify-center rounded-pill bg-ink text-canvas">
            <span className="absolute inset-0 animate-tour-ping rounded-pill border border-ink" aria-hidden />
            <Icon name="cube" className="size-5" />
          </span>
          {labels.start}
        </span>
        <span className="rounded-pill bg-night/75 px-3 py-1 text-small max-sm:hidden">{labels.body}</span>
      </button>
    );
  }
  return (
    <>
      <iframe
        src={src}
        title={title}
        allow="fullscreen; xr-spatial-tracking; gyroscope; accelerometer"
        allowFullScreen
        onLoad={() => setReady(true)}
        className={cn('absolute inset-0 size-full transition-opacity duration-(--dur-slow)', ready ? 'opacity-100' : 'opacity-0')}
      />
      {!ready && (
        <p className="absolute inset-x-0 bottom-4 mx-auto flex w-fit items-center gap-2 rounded-pill bg-night/80 px-4 py-2 text-small text-bone" role="status">
          <Icon name="cube" className="size-4" />
          {labels.loading}
        </p>
      )}
    </>
  );
}

/** A spec value that slides in when it changes. */
function Swap({ value }: { value: string | number }) {
  return (
    <span className="relative inline-flex overflow-hidden">
      <AnimatePresence mode="popLayout" initial={false}>
        <m.span
          key={value}
          initial={{ y: '100%', opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: '-100%', opacity: 0 }}
          transition={{ duration: DUR.base, ease: EASE_OUT }}
        >
          {value}
        </m.span>
      </AnimatePresence>
    </span>
  );
}

// Home: the seven residences as a tab list, a large photograph and a spec sheet, with the
// gallery, video, 3D tour and floor plan one tap away. State is shareable via the URL hash.
export function ResidenceExplorer({ residences, groups, labels }: Props) {
  const id = useId();
  const reduced = useReducedMotion() ?? false;
  const [active, setActive] = useState(0);
  const [depth, setDepth] = useState(1);
  const [open, setOpen] = useState<Open>(null);
  // Kept after closing so the sheet doesn't swap content while it fades out.
  const [media, setMedia] = useState<MediaKind>('video');
  const [loaded, setLoaded] = useState<Set<string>>(() => new Set());
  const [warm, setWarm] = useState<Set<number>>(() => new Set());
  const tabs = useRef<(HTMLButtonElement | null)[]>([]);
  const stage = useRef<HTMLDivElement>(null);
  const [started, setStarted] = useState(false);
  const r = residences[active]!;

  const select = (i: number, focus = false, reveal = false) => {
    // On phones the stage sits below the list: bring it into view after a tap.
    if (reveal && !window.matchMedia('(min-width: 1024px)').matches) {
      stage.current?.scrollIntoView({ block: 'start', behavior: reduced ? 'auto' : 'smooth' });
    }
    if (i === active) return;
    setActive(i);
    setStarted(false);
    setDepth((d) => d + 1);
    setOpen(null);
    const code = residences[i]!.code;
    window.history.replaceState(window.history.state, '', `#${HASH}${code}`);
    if (focus) {
      const tab = tabs.current[i];
      tab?.focus();
      tab?.scrollIntoView({ block: 'nearest', inline: 'nearest' });
    }
  };

  // Open the residence named in the URL (#residence-3br-apartment), now and on hash changes.
  useEffect(() => {
    const sync = () => {
      const code = window.location.hash.slice(1 + HASH.length);
      const i = residences.findIndex((x) => x.code === code);
      if (i >= 0) {
        setActive(i);
        setStarted(false);
      }
    };
    window.addEventListener('hashchange', sync);
    queueMicrotask(sync);
    return () => window.removeEventListener('hashchange', sync);
  }, [residences]);

  const onKeyDown = (e: React.KeyboardEvent) => {
    const rtl = document.documentElement.dir === 'rtl';
    const last = residences.length - 1;
    const forward = ['ArrowDown', rtl ? 'ArrowLeft' : 'ArrowRight'];
    const back = ['ArrowUp', rtl ? 'ArrowRight' : 'ArrowLeft'];
    let next: number | null = null;
    if (forward.includes(e.key)) next = active === last ? 0 : active + 1;
    else if (back.includes(e.key)) next = active === 0 ? last : active - 1;
    else if (e.key === 'Home') next = 0;
    else if (e.key === 'End') next = last;
    if (next === null) return;
    e.preventDefault();
    select(next, true);
  };

  const use = (kind: NonNullable<Open>['kind'], index?: number) => {
    setLoaded((s) => (s.has(kind) ? s : new Set(s).add(kind)));
    if (kind === 'video' || kind === 'tour') setMedia(kind);
    setOpen({ kind, index });
  };
  const close = () => setOpen(null);
  const prefetch = { gallery: loadLightbox, plan: loadFloorPlanViewer, video: loadMediaModal, tour: loadMediaModal };

  const rtlClip = typeof document !== 'undefined' && document.documentElement.dir === 'rtl';
  const hidden = rtlClip ? 'inset(0 0 0 100%)' : 'inset(0 100% 0 0)';

  // Full screen for the live tour; phones without element full screen get the tour in a new tab.
  const tourFullscreen = () => {
    if (!r.tour) return;
    setStarted(true);
    if (document.fullscreenEnabled && stage.current) stage.current.requestFullscreen();
    else window.open(r.tour, '_blank', 'noopener');
  };

  const count = residences.length;
  const prev = (active - 1 + count) % count;
  const next = (active + 1) % count;
  const pad = (n: number) => String(n).padStart(2, '0');
  const actions: { kind: keyof typeof prefetch; icon: IconName; label: string; meta?: string; show: boolean }[] = [
    { kind: 'tour', icon: 'cube', label: labels.tour, show: Boolean(r.tour) },
    { kind: 'gallery', icon: 'gallery', label: labels.gallery, meta: String(r.gallery.length).padStart(2, '0'), show: true },
    { kind: 'video', icon: 'play', label: labels.video, show: true },
    { kind: 'plan', icon: 'plan', label: labels.plan, show: true },
  ];

  const specs: [IconName, string, string | number][] = [
    ['bed', labels.bedrooms, r.bedrooms],
    ['bath', labels.bathrooms, r.bathrooms],
    ['floors', labels.floors, r.floors],
    ['garage', labels.garage, labels.garageValue],
    ['sofa', labels.furnished, labels.furnishedValue],
    ['appliance', labels.appliances, labels.appliancesValue],
    ['wifi', labels.internet, labels.internetValue],
    ['plus', labels.extras, r.extras || labels.none],
  ];

  return (
    <div className="grid-page gap-y-10">
      {/* Every residence as a selectable option, grouped by type. */}
      <div role="tablist" aria-label={labels.list} aria-orientation="vertical" onKeyDown={onKeyDown} className="col-span-4 flex flex-col gap-6 md:col-span-6 lg:col-span-3">
        {groups.map((g) => (
          <div key={g.type} role="presentation">
            <p className="eyebrow mb-3 text-ink-muted" aria-hidden>
              {g.label}
            </p>
            <div role="presentation" className="grid gap-2 sm:grid-cols-2 lg:grid-cols-1">
              {residences.map((x, i) => {
                if (x.type !== g.type) return null;
                const on = i === active;
                return (
                  <button
                    key={x.slug}
                    ref={(el) => {
                      tabs.current[i] = el;
                    }}
                    id={`${HASH}${x.code}`}
                    type="button"
                    role="tab"
                    aria-selected={on}
                    aria-controls={`${id}-panel`}
                    tabIndex={on ? 0 : -1}
                    onClick={() => select(i, false, true)}
                    onPointerEnter={() => setWarm((s) => (s.has(i) ? s : new Set(s).add(i)))}
                    className={cn(
                      'group flex min-h-tap w-full scroll-mt-header items-center gap-3 border px-4 py-3 text-start transition-colors duration-(--dur-fast)',
                      on ? 'border-ink bg-ink text-canvas' : 'border-line bg-canvas hover:border-ink hover:bg-canvas-deep',
                    )}
                  >
                    <span
                      className={cn(
                        'grid size-4 shrink-0 place-items-center rounded-pill border transition-colors duration-(--dur-fast)',
                        on ? 'border-copper' : 'border-ink-muted group-hover:border-ink',
                      )}
                      aria-hidden
                    >
                      <span className={cn('size-2 rounded-pill bg-copper transition-transform duration-(--dur-fast)', on ? 'scale-100' : 'scale-0')} />
                    </span>
                    <span className="min-w-0 flex-1 text-small font-medium lg:text-body">{x.name}</span>
                    <span className={cn('tabular shrink-0 text-small', on ? 'text-canvas/70' : 'text-ink-muted')}>
                      {x.size} {labels.sqm}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      <div
        role="tabpanel"
        id={`${id}-panel`}
        aria-labelledby={`${HASH}${r.code}`}
        className="col-span-4 grid gap-8 md:col-span-6 lg:col-span-9 lg:grid-cols-9 lg:gap-x-gap"
      >
        <div className="lg:col-span-6 lg:flex lg:flex-col">
          {/* Stage: the live 3D tour where there is one, over the cover photograph while it loads.
              Each change wipes in from the reading edge; on desktop it matches the spec sheet's height. */}
          <div
            ref={stage}
            className="relative aspect-4/3 scroll-mt-header overflow-hidden bg-canvas-deep lg:aspect-auto lg:min-h-gallery-md lg:flex-1"
            data-lenis-prevent
          >
            <AnimatePresence initial={false}>
              <m.div
                key={r.slug}
                className="absolute inset-0"
                style={{ zIndex: depth }}
                initial={reduced ? { opacity: 0 } : { clipPath: hidden }}
                animate={reduced ? { opacity: 1 } : { clipPath: 'inset(0 0% 0 0%)' }}
                exit={{ opacity: 1, transition: { duration: DUR.reveal } }}
                transition={{ duration: DUR.reveal, ease: EASE_OUT }}
              >
                <m.div
                  className="absolute inset-0"
                  initial={reduced ? false : { scale: 1.06 }}
                  animate={{ scale: 1 }}
                  transition={{ duration: DUR.slow, ease: EASE_OUT }}
                >
                  <Image
                    src={r.cover.src}
                    alt={r.cover.alt}
                    fill
                    sizes="(min-width: 1024px) 50vw, 100vw"
                    quality={80}
                    placeholder="blur"
                    blurDataURL={r.cover.blurDataURL}
                    className="object-cover"
                  />
                </m.div>
                {r.tour && (
                  <LiveTour
                    src={r.tour}
                    title={`${labels.tour} · ${r.name}`}
                    started={started}
                    onStart={() => setStarted(true)}
                    labels={{ start: labels.tourStart, body: labels.tourBody, loading: labels.tourLoading }}
                  />
                )}
              </m.div>
            </AnimatePresence>

            {/* Step through the residences without going back to the list. */}
            <div
              className="absolute end-3 top-3 flex items-center rounded-pill bg-night/80 text-bone sm:end-4 sm:top-4"
              style={{ zIndex: depth + 1 }}
            >
              <button type="button" onClick={() => select(prev)} className="inline-flex size-tap items-center justify-center transition-colors duration-(--dur-fast) hover:text-copper">
                <Arrow className="rotate-180" />
                <span className="sr-only">
                  {labels.previous}: {residences[prev]!.name}
                </span>
              </button>
              <span className="tabular px-1 text-small" dir="ltr" aria-hidden>
                {pad(active + 1)} / {pad(count)}
              </span>
              <button type="button" onClick={() => select(next)} className="inline-flex size-tap items-center justify-center transition-colors duration-(--dur-fast) hover:text-copper">
                <Arrow />
                <span className="sr-only">
                  {labels.next}: {residences[next]!.name}
                </span>
              </button>
            </div>
          </div>
          {/* Warm the photograph behind a hovered option so the wipe never reveals a blank. */}
          <div className="invisible absolute size-px overflow-hidden" aria-hidden>
            {[...warm].map((i) =>
              i === active ? null : (
                <Image key={i} src={residences[i]!.cover.src} alt="" width={residences[i]!.cover.width} height={residences[i]!.cover.height} sizes="(min-width: 1024px) 50vw, 100vw" quality={80} />
              ),
            )}
          </div>

          <div className="mt-gap grid grid-cols-2 gap-2 sm:grid-cols-4">
            {actions
              .filter((a) => a.show)
              .map((a) => (
                <button
                  key={a.kind}
                  type="button"
                  aria-haspopup={a.kind === 'tour' ? undefined : 'dialog'}
                  onClick={() => (a.kind === 'tour' ? tourFullscreen() : use(a.kind, a.kind === 'gallery' ? 0 : undefined))}
                  onPointerEnter={() => prefetch[a.kind]()}
                  onFocus={() => prefetch[a.kind]()}
                  className={"group flex min-h-tap items-center gap-3 bg-ink px-4 py-3 text-start text-small font-medium text-canvas transition-colors duration-(--dur-fast) hover:bg-copper-deep"}
                >
                  <Icon name={a.icon} />
                  <span className="min-w-0 flex-1">
                    {a.label}
                    {a.kind === 'tour' && <span className="sr-only"> · {labels.fullscreen}</span>}
                  </span>
                  <span className="tabular text-micro opacity-70 max-sm:hidden">
                    {a.kind === 'tour' ? <Icon name="expand" className="size-4" /> : (a.meta ?? <Arrow className="size-3" />)}
                  </span>
                </button>
              ))}
          </div>
        </div>

        {/* Spec sheet */}
        <div className="lg:col-span-3">
          <p className="eyebrow text-ink-muted">
            <Swap value={r.typeLabel} />
          </p>
          <h3 className="mt-3 text-h3 font-medium">
            <Swap value={r.name} />
          </h3>
          <div className="mt-8 flex items-end gap-4">
            <span className="grid size-12 shrink-0 place-items-center border border-line text-copper-deep" aria-hidden>
              <Icon name="area" className="size-6" />
            </span>
            <div>
              <p className="tabular text-stat font-medium">
                <Count value={r.size} reduced={reduced} />
                <span className="ms-2 text-h4 text-ink-muted">{labels.sqm}</span>
              </p>
              <p className="mt-1 text-small text-ink-muted">{labels.livingSpace}</p>
            </div>
          </div>
          <dl className="mt-8 border-t border-line">
            {specs.map(([icon, label, value]) => (
              <div key={label} className="flex items-center justify-between gap-4 border-b border-line py-2.5 text-small">
                <dt className="flex shrink-0 items-center gap-3 text-ink-muted">
                  <Icon name={icon} className="text-copper-deep" />
                  {label}
                </dt>
                <dd className="tabular text-end font-medium">
                  <Swap value={value} />
                </dd>
              </div>
            ))}
          </dl>
          <ButtonLink href={`/residences/${r.slug}`} className="mt-8 w-full">
            {labels.view}
          </ButtonLink>
          <button
            type="button"
            onClick={() => select(next, false, true)}
            onPointerEnter={() => setWarm((s) => (s.has(next) ? s : new Set(s).add(next)))}
            className="group mt-3 flex min-h-tap w-full items-center justify-between gap-3 rounded-pill border border-ink/30 px-6 py-3 text-start text-small transition-colors duration-(--dur-fast) hover:border-ink"
          >
            <span className="min-w-0">
              <span className="text-ink-muted">{labels.nextResidence}</span> <span className="font-medium">{residences[next]!.name}</span>
            </span>
            <Arrow className="shrink-0 transition-transform duration-(--dur-base) ease-out group-hover:translate-x-1 rtl:group-hover:-translate-x-1" />
          </button>
        </div>
      </div>

      {loaded.has('gallery') && (
        <Lightbox
          photos={r.gallery}
          index={open?.kind === 'gallery' ? (open.index ?? 0) : null}
          onChange={(index) => setOpen(index === null ? null : { kind: 'gallery', index })}
          label={`${labels.galleryTitle} · ${r.name}`}
        />
      )}
      {loaded.has('plan') && <FloorPlanViewer plan={r.plan} title={r.name} open={open?.kind === 'plan'} onClose={close} />}
      {(loaded.has('video') || loaded.has('tour')) && (
        <MediaModal
          kind={media}
          open={open?.kind === 'video' || open?.kind === 'tour'}
          onClose={close}
          residence={r.name}
          youtube={r.youtube}
          tour={r.tour}
          poster={r.gallery[1] ?? r.cover}
          labels={{
            video: labels.video,
            videoPlay: labels.videoPlay,
            tour: labels.tour,
            tourCta: labels.tourCta,
            tourHint: labels.tourHint,
            tourOpen: labels.tourOpen,
            newTab: labels.newTab,
          }}
        />
      )}
    </div>
  );
}
