'use client';

import { useEffect, useRef, type RefObject } from 'react';
import { lockScroll } from './lenis';

const FOCUSABLE = 'button:not([disabled]), a[href], iframe, input, select, textarea, [tabindex]:not([tabindex="-1"])';

/**
 * Modal behaviour for a dialog element: locks page scroll, moves focus in, keeps Tab
 * inside, closes on Escape and hands focus back to whatever opened it.
 */
export function useDialog(open: boolean, onClose: () => void, dialog: RefObject<HTMLElement | null>) {
  const close = useRef(onClose);
  useEffect(() => {
    close.current = onClose;
  });

  useEffect(() => {
    if (!open) return;
    const unlock = lockScroll();
    const previous = document.activeElement as HTMLElement | null;
    // Wait a frame so a portal's content is in the DOM.
    const raf = requestAnimationFrame(() => dialog.current?.focus());

    const onKey = (e: KeyboardEvent) => {
      const el = dialog.current;
      if (!el) return;
      if (e.key === 'Escape' && !document.fullscreenElement) {
        e.preventDefault();
        close.current();
      } else if (e.key === 'Tab') {
        const items = [...el.querySelectorAll<HTMLElement>(FOCUSABLE)].filter((n) => n.offsetParent !== null);
        const first = items[0];
        const last = items[items.length - 1];
        if (!first || !last) {
          e.preventDefault();
          return;
        }
        if (e.shiftKey && (document.activeElement === first || document.activeElement === el)) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    window.addEventListener('keydown', onKey);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('keydown', onKey);
      unlock();
      previous?.focus({ preventScroll: true });
    };
  }, [open, dialog]);
}
