'use client';

import type { AutorotatePlugin } from '@photo-sphere-viewer/autorotate-plugin';
import type { Viewer } from '@photo-sphere-viewer/core';
import type { GyroscopePlugin } from '@photo-sphere-viewer/gyroscope-plugin';
import { AnimatePresence, m, useReducedMotion } from 'motion/react';
import Image from 'next/image';
import { useCallback, useEffect, useId, useRef, useState, useSyncExternalStore, type ReactNode } from 'react';
import type { Photo } from '@/content/images';
import { Arrow } from '@/components/ui/Arrow';
import { Icon } from '@/components/ui/Icon';
import { cn } from '@/lib/cn';
import { DUR, EASE_OUT } from '@/lib/motion';

export type TourScene = {
  slug: string;
  name: string;
  poster: Photo;
  pano: { desktop: string; mobile: string; yaw: number; pitch: number };
};

export type TourLabels = {
  enter: string;
  loading: string;
  drag: string;
  viewer: string;
  scenes: string;
  previous: string;
  next: string;
  rotate: string;
  gyro: string;
  fullscreen: string;
  exitFullscreen: string;
  ctrlZoom: string;
  twoFingers: string;
  choose: string;
};

type Props = {
  scenes: TourScene[];
  /** Two columns of rooms beside the viewer on desktop (the full 26-room tour). */
  twoColumns?: boolean;
  labels: TourLabels;
  tone: 'light' | 'dark';
  /** Heading and paragraph, placed above the scene list. */
  intro: ReactNode;
};

type Status = 'idle' | 'loading' | 'ready';
type Loop = { renderer: { setAnimationLoop(cb: ((t: number) => void) | null): void }; __renderLoop(t: number): void };

const noop = () => () => {};
const pad = (n: number) => String(n).padStart(2, '0');
const deg = (n: number) => `${n}deg`;
const textureFor = (s: TourScene) => (window.matchMedia('(min-width: 1024px)').matches ? s.pano.desktop : s.pano.mobile);

/** Stop or restart the WebGL render loop (Photo Sphere Viewer has no public pause). */
function setRendering(viewer: Viewer, on: boolean) {
  const r = viewer.renderer as unknown as Loop;
  r.renderer.setAnimationLoop(on ? (t) => r.__renderLoop(t) : null);
}

function Mark({ d, className }: { d: string; className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={cn('size-5', className)} fill="none" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d={d} />
    </svg>
  );
}

const MARKS = {
  prev: 'M14.5 6 8.5 12l6 6',
  next: 'M9.5 6l6 6-6 6',
  rotate: 'M19.5 12a7.5 7.5 0 1 1-2.2-5.3M19.5 4.5v3.8h-3.8',
  gyro: 'M8 3.5h8a1 1 0 0 1 1 1v15a1 1 0 0 1-1 1H8a1 1 0 0 1-1-1v-15a1 1 0 0 1 1-1ZM11 17.5h2',
  expand: 'M4 9V4h5M15 4h5v5M20 15v5h-5M9 20H4v-5',
  collapse: 'M9 4v5H4M20 9h-5V4M15 20v-5h5M4 15h5v5',
};

// 360° Clubhouse tour: a numbered scene list beside a large viewer. Nothing heavier than the
// poster photograph loads until "Enter 360°"; then Photo Sphere Viewer is fetched and takes over.
export function TourViewer({ scenes, twoColumns = false, labels, tone, intro }: Props) {
  const id = useId();
  const viewerId = `${id}-viewer`;
  const reduced = useReducedMotion();
  const [active, setActive] = useState(0);
  const [status, setStatus] = useState<Status>('idle');
  const [switching, setSwitching] = useState(false);
  const [rotating, setRotating] = useState(false);
  const [gyroSupported, setGyroSupported] = useState(false);
  const [gyroOn, setGyroOn] = useState(false);
  const [hint, setHint] = useState(true);
  const [fullscreen, setFullscreen] = useState(false);
  const canFullscreen = useSyncExternalStore(noop, () => document.fullscreenEnabled, () => false);

  const shell = useRef<HTMLDivElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  const frame = useRef<HTMLDivElement>(null);
  const viewer = useRef<Viewer | null>(null);
  const autorotate = useRef<AutorotatePlugin | null>(null);
  const gyro = useRef<GyroscopePlugin | null>(null);
  const activeRef = useRef(0);
  /** Keep rotating until the visitor takes over (or asks for it again). */
  const wantRotate = useRef(true);

  const scene = scenes[active]!;
  const light = tone === 'light';
  const muted = light ? 'text-ink-muted' : 'text-bone-soft';

  const enter = async () => {
    if (status !== 'idle' || !stage.current) return;
    setStatus('loading');
    const psv = await import('./psv');
    const s = scenes[activeRef.current]!;
    const night = getComputedStyle(document.documentElement).getPropertyValue('--color-night').trim();
    const v = new psv.Viewer({
      container: stage.current,
      panorama: textureFor(s),
      defaultYaw: deg(s.pano.yaw),
      defaultPitch: deg(s.pano.pitch),
      navbar: false,
      keyboard: false,
      mousewheelCtrlKey: true,
      loadingTxt: '',
      canvasBackground: night,
      defaultTransition: reduced ? { speed: 350, rotation: false, effect: 'fade' } : { speed: 1100, rotation: true, effect: 'fade' },
      lang: { ctrlZoom: labels.ctrlZoom, twoFingers: labels.twoFingers },
      plugins: [
        [psv.AutorotatePlugin, { autostartDelay: null, autostartOnIdle: false, autorotateSpeed: '0.8rpm' }],
        [psv.GyroscopePlugin, { touchmove: true }],
      ],
    });
    viewer.current = v;
    autorotate.current = v.getPlugin<AutorotatePlugin>(psv.AutorotatePlugin);
    gyro.current = v.getPlugin<GyroscopePlugin>(psv.GyroscopePlugin);
    autorotate.current.addEventListener('autorotate', (e) => setRotating(e.autorotateEnabled));
    gyro.current.addEventListener('gyroscope-updated', (e) => setGyroOn(e.gyroscopeEnabled));
    v.addEventListener(
      'ready',
      () => {
        setStatus('ready');
        wantRotate.current = !reduced;
        if (!reduced) autorotate.current?.start();
        gyro.current?.isSupported().then(setGyroSupported);
        stage.current?.focus({ preventScroll: true });
      },
      { once: true },
    );
  };

  const select = useCallback(
    (i: number) => {
      activeRef.current = i;
      setActive(i);
      const v = viewer.current;
      if (!v || !v.state.ready) return;
      const s = scenes[i]!;
      setSwitching(true);
      v.setPanorama(textureFor(s), { position: { yaw: deg(s.pano.yaw), pitch: deg(s.pano.pitch) }, zoom: 50, showLoader: false })
        .then((done) => {
          if (done && wantRotate.current && !autorotate.current?.isEnabled()) autorotate.current?.start();
        })
        .catch(() => {})
        .finally(() => setSwitching(false));
    },
    [scenes],
  );

  const step = (d: number) => {
    const i = (active + d + scenes.length) % scenes.length;
    select(i);
  };

  // Tapping a room below the viewer on a phone brings the viewer back into sight.
  const pick = (i: number) => {
    select(i);
    const el = frame.current;
    if (!el || window.matchMedia('(min-width: 1024px)').matches) return;
    if (el.getBoundingClientRect().top < 0) el.scrollIntoView({ block: 'start', behavior: reduced ? 'auto' : 'smooth' });
  };

  const interacted = () => {
    setHint(false);
    wantRotate.current = false;
  };

  const toggleRotate = () => {
    const a = autorotate.current;
    if (!a) return;
    wantRotate.current = !a.isEnabled();
    a.toggle();
  };

  const toggleGyro = () => {
    const g = gyro.current;
    if (!g) return;
    if (g.isEnabled()) g.stop();
    else g.start().catch(() => setGyroSupported(false));
  };

  const toggleFullscreen = () => {
    if (document.fullscreenElement) document.exitFullscreen();
    else shell.current?.requestFullscreen();
  };

  useEffect(() => {
    const onChange = () => setFullscreen(document.fullscreenElement === shell.current);
    document.addEventListener('fullscreenchange', onChange);
    return () => document.removeEventListener('fullscreenchange', onChange);
  }, []);

  // Stop drawing (and rotating) while the tour is scrolled out of view.
  useEffect(() => {
    const el = shell.current;
    if (!el || status !== 'ready') return;
    let resumeRotate = false;
    const io = new IntersectionObserver(([e]) => {
      const v = viewer.current;
      if (!v || !e) return;
      if (e.isIntersecting) {
        setRendering(v, true);
        if (resumeRotate) autorotate.current?.start();
      } else {
        resumeRotate = autorotate.current?.isEnabled() ?? false;
        autorotate.current?.stop();
        setRendering(v, false);
      }
    });
    io.observe(el);
    return () => io.disconnect();
  }, [status]);

  useEffect(() => () => viewer.current?.destroy(), []);

  const control = cn(
    'inline-flex size-tap items-center justify-center text-bone transition-colors duration-(--dur-fast) hover:text-copper',
    'focus-visible:outline-offset-[-4px]',
  );

  // Room cards: a thumbnail, number and name, filled when showing. On desktop the list and the
  // viewer share one height, side by side; on phones two columns of cards sit under the viewer.
  const idle = light ? 'border-line bg-canvas hover:border-ink hover:bg-canvas-deep' : 'border-night-line hover:border-bone hover:bg-night-raised';
  const on = light ? 'border-ink bg-ink text-canvas' : 'border-bone bg-bone text-ink';
  const list = (
    <nav aria-label={labels.scenes} className="lg:flex lg:h-full lg:flex-col">
      <p className={cn('mb-4 flex items-center gap-2 text-small', muted)}>
        <Icon name="pin" className="size-4 text-copper" />
        {labels.choose}
      </p>
      <ol className={cn('grid grid-cols-2 gap-1.5 lg:flex-1 lg:auto-rows-fr', twoColumns ? 'lg:grid-cols-2' : 'lg:grid-cols-1')}>
        {scenes.map((s, i) => {
          const current = i === active;
          return (
            <li key={s.slug} className="min-w-0">
              <button
                type="button"
                onClick={() => pick(i)}
                aria-current={current || undefined}
                aria-controls={viewerId}
                className={cn(
                  'group flex size-full min-h-tap items-center gap-3 border p-1.5 pe-3 text-start transition-colors duration-(--dur-fast)',
                  current ? on : idle,
                )}
              >
                <span className="relative block h-9 w-12 shrink-0 overflow-hidden bg-night">
                  <Image src={s.poster.src} alt="" fill sizes="96px" quality={75} className="object-cover" />
                </span>
                <span className={cn('tabular text-micro max-sm:hidden', twoColumns && 'lg:hidden', current ? 'opacity-70' : muted)}>{pad(i + 1)}</span>
                <span className={cn('min-w-0 flex-1 text-small font-medium leading-tight', !twoColumns && 'lg:text-body')}>{s.name}</span>
                <span className={cn('shrink-0 transition-opacity duration-(--dur-fast)', current ? 'text-copper' : 'opacity-0 group-hover:opacity-60 max-lg:hidden')} aria-hidden>
                  {current ? <Icon name="cube" className="size-4" /> : <Arrow className="size-3" />}
                </span>
              </button>
            </li>
          );
        })}
      </ol>
    </nav>
  );

  return (
    <div className="grid-page gap-y-8 lg:gap-y-12">
      <div className="col-span-4 md:col-span-6 lg:col-span-12">{intro}</div>

      <div ref={frame} className={cn('col-span-4 scroll-mt-header md:col-span-6 lg:order-2', twoColumns ? 'lg:col-span-7' : 'lg:col-span-8')}>
        <div ref={shell} className="relative overflow-hidden bg-night text-bone max-lg:-mx-gutter lg:h-full">
          <div className="relative aspect-4/5 sm:aspect-3/2 lg:aspect-auto lg:h-full lg:min-h-gallery-lg fullscreen:aspect-auto fullscreen:h-full">
            {/* Photo Sphere Viewer mounts here. */}
            <div
              ref={stage}
              id={viewerId}
              tabIndex={status === 'ready' ? 0 : -1}
              role="application"
              aria-roledescription="360°"
              aria-label={labels.viewer.replace('{name}', scene.name)}
              onFocus={() => viewer.current?.startKeyboardControl()}
              onBlur={() => viewer.current?.stopKeyboardControl()}
              onPointerDown={interacted}
              onWheel={interacted}
              onKeyDown={(e) => {
                if (e.key.startsWith('Arrow')) {
                  e.preventDefault();
                  interacted();
                }
              }}
              className="absolute inset-0 focus-visible:outline-offset-[-3px]"
            />

            {/* Poster: the scene's starting view, until the viewer is ready. */}
            <AnimatePresence initial={false}>
              {status !== 'ready' && (
                <m.div
                  key={scene.slug}
                  className="absolute inset-0"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: DUR.base, ease: EASE_OUT }}
                >
                  <Image
                    src={scene.poster.src}
                    alt={scene.poster.alt}
                    fill
                    sizes="(min-width: 1024px) 62vw, 100vw"
                    quality={80}
                    placeholder="blur"
                    blurDataURL={scene.poster.blurDataURL}
                    className="object-cover"
                  />
                </m.div>
              )}
            </AnimatePresence>

            {status !== 'ready' && (
              <div className="absolute inset-0 flex items-center justify-center p-6">
                <button
                  type="button"
                  onClick={enter}
                  aria-busy={status === 'loading'}
                  aria-controls={viewerId}
                  className="group inline-flex min-h-tap items-center gap-4 rounded-pill bg-bone py-2.5 pe-7 ps-2.5 text-body font-medium text-ink transition-colors duration-(--dur-fast) hover:bg-canvas"
                >
                  <span className="relative inline-flex size-11 items-center justify-center rounded-pill bg-ink text-canvas">
                    {status === 'idle' && <span className="absolute inset-0 animate-tour-ping rounded-pill border border-ink" aria-hidden />}
                    <svg viewBox="0 0 24 24" className="size-6" fill="none" stroke="currentColor" strokeWidth="1.2" aria-hidden>
                      <ellipse cx="12" cy="12" rx="9" ry="3.6" />
                      <ellipse cx="12" cy="12" rx="3.6" ry="9" />
                    </svg>
                  </span>
                  {status === 'loading' ? labels.loading : labels.enter}
                </button>
              </div>
            )}

            {/* Thin progress rule while a panorama loads. */}
            {(status === 'loading' || switching) && (
              <span className="absolute inset-x-0 top-0 h-px overflow-hidden bg-bone/25" aria-hidden>
                <span className="block h-full w-1/3 animate-tour-load bg-bone" />
              </span>
            )}

            <AnimatePresence>
              {status === 'ready' && hint && (
                <m.p
                  className="pointer-events-none absolute inset-x-0 top-5 mx-auto w-fit rounded-pill bg-night/75 px-4 py-1.5 text-small text-bone"
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: DUR.base, ease: EASE_OUT }}
                >
                  {labels.drag}
                </m.p>
              )}
            </AnimatePresence>

            {/* Caption and controls */}
            <div className="pointer-events-none absolute inset-x-0 bottom-0 flex items-end justify-between gap-4 p-3 sm:p-4">
              <p className="pointer-events-auto inline-flex min-h-tap min-w-0 items-center gap-3 rounded-pill bg-night/75 px-4 text-small" aria-live="polite">
                <span className="tabular text-bone-soft">
                  {pad(active + 1)}/{pad(scenes.length)}
                </span>
                <span className={cn('truncate font-medium', status === 'ready' && 'max-sm:hidden')}>{scene.name}</span>
              </p>
              {status === 'ready' && (
                <div className="pointer-events-auto flex shrink-0 items-center rounded-pill bg-night/75 px-1">
                  <button type="button" className={control} onClick={() => step(-1)}>
                    <Mark d={MARKS.prev} className="flip-rtl" />
                    <span className="sr-only">{labels.previous}</span>
                  </button>
                  <button type="button" className={control} onClick={() => step(1)}>
                    <Mark d={MARKS.next} className="flip-rtl" />
                    <span className="sr-only">{labels.next}</span>
                  </button>
                  <span className="mx-1 h-5 w-px bg-night-line" aria-hidden />
                  <button type="button" className={cn(control, rotating && 'text-copper')} onClick={toggleRotate} aria-pressed={rotating}>
                    <Mark d={MARKS.rotate} />
                    <span className="sr-only">{labels.rotate}</span>
                  </button>
                  {gyroSupported && (
                    <button type="button" className={cn(control, gyroOn && 'text-copper')} onClick={toggleGyro} aria-pressed={gyroOn}>
                      <Mark d={MARKS.gyro} />
                      <span className="sr-only">{labels.gyro}</span>
                    </button>
                  )}
                  {canFullscreen && (
                    <button type="button" className={control} onClick={toggleFullscreen} aria-pressed={fullscreen}>
                      <Mark d={fullscreen ? MARKS.collapse : MARKS.expand} />
                      <span className="sr-only">{fullscreen ? labels.exitFullscreen : labels.fullscreen}</span>
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

      </div>

      <div className={cn('col-span-4 md:col-span-6 lg:order-1', twoColumns ? 'lg:col-span-5' : 'lg:col-span-4')}>{list}</div>
    </div>
  );
}
