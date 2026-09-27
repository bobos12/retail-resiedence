'use client';

import { AnimatePresence, m } from 'motion/react';
import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from 'react';
import { createPortal } from 'react-dom';
import type { Photo } from '@/content/images';
import { DUR, EASE_OUT } from '@/lib/motion';
import { useDialog } from '@/lib/use-dialog';

const MIN = 1;
const MAX = 4;
const STEP = 0.5;
const noop = () => () => {};
const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));

type View = { scale: number; x: number; y: number };
const RESET: View = { scale: 1, x: 0, y: 0 };

type Props = { plan: Photo; title: string; open: boolean; onClose: () => void };

// Full-screen plan viewer: wheel or pinch to zoom, drag to pan, +/−/0 and arrow keys,
// buttons for everything, and the drawing itself to download. Loaded only when first opened.
export default function FloorPlanViewer({ plan, title, open, onClose }: Props) {
  const t = useTranslations('residences.detail');
  const tc = useTranslations('common');
  const [view, setView] = useState<View>(RESET);
  const stage = useRef<HTMLDivElement>(null);
  const dialog = useRef<HTMLDivElement>(null);
  const pointers = useRef(new Map<number, { x: number; y: number }>());
  const pinch = useRef<number | null>(null);
  const mounted = useSyncExternalStore(noop, () => true, () => false);

  const close = useCallback(() => {
    onClose();
    setView(RESET);
  }, [onClose]);
  useDialog(open, close, dialog);

  const zoomTo = useCallback((next: number) => {
    setView((v) => {
      const scale = clamp(next, MIN, MAX);
      const k = scale / v.scale;
      return scale === MIN ? RESET : { scale, x: v.x * k, y: v.y * k };
    });
  }, []);

  const pan = useCallback((dx: number, dy: number) => {
    setView((v) => {
      const el = stage.current;
      if (!el || v.scale === 1) return v;
      const maxX = ((v.scale - 1) * el.clientWidth) / 2;
      const maxY = ((v.scale - 1) * el.clientHeight) / 2;
      return { ...v, x: clamp(v.x + dx, -maxX, maxX), y: clamp(v.y + dy, -maxY, maxY) };
    });
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === '+' || e.key === '=') zoomTo(view.scale + STEP);
      else if (e.key === '-') zoomTo(view.scale - STEP);
      else if (e.key === '0') setView(RESET);
      else if (e.key.startsWith('Arrow')) {
        e.preventDefault();
        const d = 60;
        pan(e.key === 'ArrowLeft' ? d : e.key === 'ArrowRight' ? -d : 0, e.key === 'ArrowUp' ? d : e.key === 'ArrowDown' ? -d : 0);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, zoomTo, pan, view.scale]);

  // Wheel zoom needs a non-passive listener to stop the page from scrolling.
  useEffect(() => {
    const el = stage.current;
    if (!open || !el) return;
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      zoomTo(view.scale * (e.deltaY < 0 ? 1.15 : 1 / 1.15));
    };
    el.addEventListener('wheel', onWheel, { passive: false });
    return () => el.removeEventListener('wheel', onWheel);
  }, [open, zoomTo, view.scale]);

  const onPointerMove = (e: React.PointerEvent) => {
    const prev = pointers.current.get(e.pointerId);
    if (!prev) return;
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (pointers.current.size === 2) {
      const [a, b] = [...pointers.current.values()];
      const dist = Math.hypot(a!.x - b!.x, a!.y - b!.y);
      if (pinch.current) zoomTo(view.scale * (dist / pinch.current));
      pinch.current = dist;
    } else {
      pan(e.clientX - prev.x, e.clientY - prev.y);
    }
  };
  const endPointer = (e: React.PointerEvent) => {
    pointers.current.delete(e.pointerId);
    if (pointers.current.size < 2) pinch.current = null;
  };

  if (!mounted) return null;
  const control =
    'inline-flex size-tap items-center justify-center rounded-pill border border-line bg-canvas text-h4 transition-colors duration-(--dur-fast) hover:border-ink disabled:opacity-40';
  const pill = 'inline-flex min-h-tap shrink-0 items-center gap-2 rounded-pill border border-line px-5 text-small font-medium hover:border-ink';

  return createPortal(
    <AnimatePresence>
      {open && (
        <m.div
          ref={dialog}
          role="dialog"
          aria-modal="true"
          aria-label={`${t('plan')}: ${title}`}
          tabIndex={-1}
          data-lenis-prevent
          className="fixed inset-0 z-50 flex flex-col bg-canvas text-ink outline-none"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: DUR.base, ease: EASE_OUT }}
        >
          <div className="page-x flex h-header shrink-0 items-center justify-between gap-4 border-b border-line">
            <p className="min-w-0 truncate text-small font-medium">
              {t('plan')} · {title}
            </p>
            <div className="flex items-center gap-2">
              <a href={plan.src} download className={`${pill} max-sm:hidden`}>
                {t('planDownload')}
              </a>
              <button type="button" onClick={close} className={pill}>
                {tc('close')}
              </button>
            </div>
          </div>
          <div
            ref={stage}
            className="relative min-h-0 flex-1 cursor-grab touch-none overflow-hidden bg-bone active:cursor-grabbing"
            onPointerDown={(e) => {
              e.currentTarget.setPointerCapture(e.pointerId);
              pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
            }}
            onPointerMove={onPointerMove}
            onPointerUp={endPointer}
            onPointerCancel={endPointer}
            onDoubleClick={() => zoomTo(view.scale > 1 ? 1 : 2)}
          >
            <div
              className="absolute inset-4 transition-transform duration-(--dur-fast) ease-out md:inset-10"
              style={{ transform: `translate(${view.x}px, ${view.y}px) scale(${view.scale})` }}
            >
              <Image src={plan.src} alt={plan.alt} fill sizes="100vw" quality={90} className="object-contain" draggable={false} />
            </div>
          </div>
          <div className="page-x flex shrink-0 flex-wrap items-center justify-between gap-4 border-t border-line py-4">
            <p className="text-small text-ink-muted max-sm:hidden">{t('planHint')}</p>
            <a href={plan.src} download className={`${pill} sm:hidden`}>
              {t('planDownload')}
            </a>
            <div className="flex items-center gap-2">
              <button type="button" className={control} onClick={() => zoomTo(view.scale - STEP)} disabled={view.scale <= MIN}>
                <span aria-hidden>−</span>
                <span className="sr-only">{t('zoomOut')}</span>
              </button>
              <span className="tabular w-14 text-center text-small" aria-live="polite">
                {Math.round(view.scale * 100)}%
              </span>
              <button type="button" className={control} onClick={() => zoomTo(view.scale + STEP)} disabled={view.scale >= MAX}>
                <span aria-hidden>+</span>
                <span className="sr-only">{t('zoomIn')}</span>
              </button>
              <button type="button" className="inline-flex min-h-tap items-center rounded-pill border border-line px-4 text-small hover:border-ink" onClick={() => setView(RESET)}>
                {t('zoomReset')}
              </button>
            </div>
          </div>
        </m.div>
      )}
    </AnimatePresence>,
    document.body,
  );
}
