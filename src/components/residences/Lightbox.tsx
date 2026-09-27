'use client';

import { AnimatePresence, m } from 'motion/react';
import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from 'react';
import { createPortal } from 'react-dom';
import { Arrow } from '@/components/ui/Arrow';
import type { Photo } from '@/content/images';
import { DUR, EASE_OUT } from '@/lib/motion';
import { useDialog } from '@/lib/use-dialog';

type Props = {
  photos: Photo[];
  index: number | null;
  onChange: (index: number | null) => void;
  label: string;
};

const SWIPE = 50;
const MAX_ZOOM = 3;
const noop = () => () => {};
const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));
type Zoom = { scale: number; x: number; y: number };
const NO_ZOOM: Zoom = { scale: 1, x: 0, y: 0 };

// Full-screen photo viewer: arrow keys, swipe, pinch or double-tap to zoom, Escape to close.
// The photos either side are fetched in the background so stepping through is instant.
export function Lightbox({ photos, index, onChange, label }: Props) {
  const t = useTranslations('common');
  const dialog = useRef<HTMLDivElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  const [direction, setDirection] = useState(1);
  const [zoom, setZoom] = useState<Zoom>(NO_ZOOM);
  const pointers = useRef(new Map<number, { x: number; y: number }>());
  const pinch = useRef<number | null>(null);
  const swipeStart = useRef<number | null>(null);
  const open = index !== null;
  const mounted = useSyncExternalStore(noop, () => true, () => false);
  const close = useCallback(() => onChange(null), [onChange]);
  useDialog(open, close, dialog);

  const go = useCallback(
    (step: number) => {
      if (index === null) return;
      setDirection(step);
      setZoom(NO_ZOOM);
      onChange((index + step + photos.length) % photos.length);
    },
    [index, onChange, photos.length],
  );

  const zoomTo = useCallback((scale: number) => {
    setZoom((z) => {
      const s = clamp(scale, 1, MAX_ZOOM);
      return s === 1 ? NO_ZOOM : { scale: s, x: (z.x * s) / z.scale, y: (z.y * s) / z.scale };
    });
  }, []);

  const pan = useCallback((dx: number, dy: number) => {
    setZoom((z) => {
      const el = stage.current;
      if (!el || z.scale === 1) return z;
      const mx = ((z.scale - 1) * el.clientWidth) / 2;
      const my = ((z.scale - 1) * el.clientHeight) / 2;
      return { ...z, x: clamp(z.x + dx, -mx, mx), y: clamp(z.y + dy, -my, my) };
    });
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      const rtl = document.documentElement.dir === 'rtl';
      // "Next" is visually to the left in Arabic.
      if (e.key === 'ArrowRight') go(rtl ? -1 : 1);
      else if (e.key === 'ArrowLeft') go(rtl ? 1 : -1);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, go]);

  if (!mounted) return null;
  const current = index !== null ? photos[index] : null;
  const neighbours = index === null || photos.length < 2 ? [] : [photos[(index + 1) % photos.length], photos[(index - 1 + photos.length) % photos.length]];

  const onPointerDown = (e: React.PointerEvent) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (pointers.current.size === 1) swipeStart.current = e.clientX;
  };
  const onPointerMove = (e: React.PointerEvent) => {
    const prev = pointers.current.get(e.pointerId);
    if (!prev) return;
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (pointers.current.size === 2) {
      swipeStart.current = null;
      const [a, b] = [...pointers.current.values()];
      const dist = Math.hypot(a!.x - b!.x, a!.y - b!.y);
      if (pinch.current) zoomTo(zoom.scale * (dist / pinch.current));
      pinch.current = dist;
    } else if (zoom.scale > 1) {
      pan(e.clientX - prev.x, e.clientY - prev.y);
    }
  };
  const onPointerUp = (e: React.PointerEvent) => {
    pointers.current.delete(e.pointerId);
    if (pointers.current.size < 2) pinch.current = null;
    if (swipeStart.current === null || zoom.scale > 1) return;
    const dx = e.clientX - swipeStart.current;
    swipeStart.current = null;
    if (Math.abs(dx) < SWIPE) return;
    const rtl = document.documentElement.dir === 'rtl';
    go((dx < 0 ? 1 : -1) * (rtl ? -1 : 1));
  };

  const control =
    'inline-flex size-tap items-center justify-center rounded-pill border border-night-line transition-colors duration-(--dur-fast) hover:border-bone';

  return createPortal(
    <AnimatePresence>
      {open && current && (
        <m.div
          ref={dialog}
          role="dialog"
          aria-modal="true"
          aria-label={label}
          tabIndex={-1}
          data-theme="dark"
          data-lenis-prevent
          className="fixed inset-0 z-50 flex flex-col bg-night text-bone outline-none"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: DUR.base, ease: EASE_OUT }}
        >
          <div className="page-x flex h-header shrink-0 items-center justify-between gap-4">
            <p className="tabular text-small text-bone-soft" aria-live="polite">
              {String((index ?? 0) + 1).padStart(2, '0')} <span aria-hidden>/</span>
              <span className="sr-only">{t('of')}</span> {String(photos.length).padStart(2, '0')}
            </p>
            <p className="hidden min-w-0 truncate text-small md:block">{label}</p>
            <button
              type="button"
              onClick={close}
              className="inline-flex min-h-tap items-center gap-3 rounded-pill border border-night-line px-5 text-small font-medium transition-colors duration-(--dur-fast) hover:border-bone"
            >
              {t('close')}
              <svg viewBox="0 0 20 20" className="size-3.5" fill="none" stroke="currentColor" strokeWidth="1.4" aria-hidden>
                <path d="m4 4 12 12M16 4 4 16" />
              </svg>
            </button>
          </div>

          <div
            ref={stage}
            className="relative min-h-0 flex-1 touch-none select-none overflow-hidden"
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
            onPointerCancel={onPointerUp}
            onDoubleClick={() => zoomTo(zoom.scale > 1 ? 1 : 2)}
            onWheel={(e) => e.ctrlKey && zoomTo(zoom.scale * (e.deltaY < 0 ? 1.1 : 1 / 1.1))}
          >
            <AnimatePresence initial={false} custom={direction} mode="popLayout">
              <m.figure
                key={current.src}
                custom={direction}
                className="absolute inset-0 flex flex-col px-gutter pb-4"
                initial={{ opacity: 0, x: `${direction * 4}%` }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: `${direction * -4}%` }}
                transition={{ duration: DUR.base, ease: EASE_OUT }}
              >
                {/* Never enlarge a photo past its own size. */}
                <div className="relative mx-auto min-h-0 w-full flex-1" style={{ maxWidth: current.width }}>
                  <div
                    className="absolute inset-0 transition-transform duration-(--dur-fast) ease-out"
                    style={{ transform: `translate(${zoom.x}px, ${zoom.y}px) scale(${zoom.scale})` }}
                  >
                    <Image
                      src={current.src}
                      alt={current.alt}
                      fill
                      sizes="100vw"
                      quality={90}
                      placeholder="blur"
                      blurDataURL={current.blurDataURL}
                      className="object-contain"
                      draggable={false}
                    />
                  </div>
                </div>
                <figcaption className="mx-auto mt-4 max-w-prose text-center">
                  {current.caption && <span className="block text-body font-medium">{current.caption}</span>}
                  <span className="block text-small text-bone-soft">{current.alt}</span>
                </figcaption>
              </m.figure>
            </AnimatePresence>
            {/* Same sizes as the visible image, so the browser caches the exact file it will need. */}
            <div className="pointer-events-none invisible absolute size-px overflow-hidden" aria-hidden>
              {neighbours.map((p) =>
                p ? <Image key={p.src} src={p.src} alt="" width={p.width} height={p.height} sizes="100vw" quality={90} loading="eager" /> : null,
              )}
            </div>
          </div>

          <div className="page-x flex shrink-0 items-center justify-between gap-4 pb-6">
            <button type="button" onClick={() => go(-1)} className={control}>
              <Arrow className="rotate-180" />
              <span className="sr-only">{t('previous')}</span>
            </button>
            <p className="hidden text-micro text-bone-soft sm:block">{t('zoomHint')}</p>
            <button type="button" onClick={() => go(1)} className={control}>
              <Arrow />
              <span className="sr-only">{t('next')}</span>
            </button>
          </div>
        </m.div>
      )}
    </AnimatePresence>,
    document.body,
  );
}
