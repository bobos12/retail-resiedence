'use client';

import { AnimatePresence, m } from 'motion/react';
import { useTranslations } from 'next-intl';
import { useRef, useSyncExternalStore, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { DUR, EASE_OUT } from '@/lib/motion';
import { useDialog } from '@/lib/use-dialog';

const noop = () => () => {};

type Props = {
  open: boolean;
  onClose: () => void;
  /** Visible heading and accessible name. */
  title: string;
  /** Small line before the title, e.g. the residence name. */
  eyebrow?: string;
  children: ReactNode;
};

// Dark full-screen sheet for media (video, 3D tour): a header rule, the content centred below.
export function Modal({ open, onClose, title, eyebrow, children }: Props) {
  const t = useTranslations('common');
  const dialog = useRef<HTMLDivElement>(null);
  const mounted = useSyncExternalStore(noop, () => true, () => false);
  useDialog(open, onClose, dialog);
  if (!mounted) return null;

  return createPortal(
    <AnimatePresence>
      {open && (
        <m.div
          ref={dialog}
          role="dialog"
          aria-modal="true"
          aria-label={eyebrow ? `${title} · ${eyebrow}` : title}
          tabIndex={-1}
          data-theme="dark"
          data-lenis-prevent
          className="fixed inset-0 z-50 flex flex-col bg-night text-bone outline-none"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: DUR.base, ease: EASE_OUT }}
        >
          <div className="page-x flex h-header shrink-0 items-center justify-between gap-4 border-b border-night-line">
            <p className="min-w-0 truncate text-small">
              <span className="font-medium">{title}</span>
              {eyebrow && <span className="text-bone-soft"> · {eyebrow}</span>}
            </p>
            <button
              type="button"
              onClick={onClose}
              className="inline-flex min-h-tap shrink-0 items-center gap-3 rounded-pill border border-night-line px-5 text-small font-medium transition-colors duration-(--dur-fast) hover:border-bone"
            >
              {t('close')}
              <svg viewBox="0 0 20 20" className="size-3.5" fill="none" stroke="currentColor" strokeWidth="1.4" aria-hidden>
                <path d="m4 4 12 12M16 4 4 16" />
              </svg>
            </button>
          </div>
          <m.div
            className="page-x flex min-h-0 flex-1 items-center justify-center py-6"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: DUR.base, ease: EASE_OUT, delay: 0.05 }}
          >
            <div className="modal-media w-full">{children}</div>
          </m.div>
        </m.div>
      )}
    </AnimatePresence>,
    document.body,
  );
}
