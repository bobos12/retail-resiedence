'use client';

import { AnimatePresence, m } from 'motion/react';
import { useTranslations } from 'next-intl';
import { useEffect, useRef } from 'react';
import { buttonClass } from '@/components/ui/ButtonLink';
import { contact } from '@/content/contact';
import { Link, usePathname } from '@/i18n/navigation';
import { lockScroll } from '@/lib/lenis';
import { DUR, EASE_OUT, STAGGER } from '@/lib/motion';
import { LanguageSwitcher } from './LanguageSwitcher';
import { navItems } from './nav-items';

type Props = { open: boolean; onClose: () => void };

// Full-screen menu for phones and tablets: large type, contact details at the foot.
export function MobileMenu({ open, onClose }: Props) {
  const t = useTranslations('nav');
  const pathname = usePathname();
  const panel = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const unlock = lockScroll();
    const previous = document.activeElement as HTMLElement | null;
    panel.current?.querySelector<HTMLElement>('a, button')?.focus();

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key !== 'Tab' || !panel.current) return;
      // Keep focus inside the menu (the header toggle stays reachable before it).
      const toggle = document.querySelector<HTMLElement>('[aria-controls="mobile-menu"]');
      const focusable = [toggle, ...panel.current.querySelectorAll<HTMLElement>('a, button')].filter(Boolean) as HTMLElement[];
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last?.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first?.focus();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => {
      window.removeEventListener('keydown', onKey);
      unlock();
      previous?.focus();
    };
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <m.div
          id="mobile-menu"
          ref={panel}
          role="dialog"
          aria-modal="true"
          aria-label={t('menu')}
          className="fixed inset-0 z-30 flex flex-col bg-canvas pt-header text-ink lg:hidden"
          initial={{ clipPath: 'inset(0 0 100% 0)' }}
          animate={{ clipPath: 'inset(0 0 0% 0)' }}
          exit={{ clipPath: 'inset(0 0 100% 0)' }}
          transition={{ duration: DUR.base, ease: EASE_OUT }}
          data-lenis-prevent
        >
          <nav aria-label={t('primary')} className="page-x flex-1 overflow-y-auto py-8">
            <ul className="border-t border-line">
              {[{ key: 'home', href: '/' } as const, ...navItems].map((item, i) => (
                <m.li
                  key={item.key}
                  className="border-b border-line"
                  initial={{ opacity: 0, y: 24 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: DUR.reveal, ease: EASE_OUT, delay: 0.1 + i * STAGGER * 0.6 }}
                >
                  <Link
                    href={item.href}
                    onClick={onClose}
                    aria-current={pathname === item.href ? 'page' : undefined}
                    className="flex min-h-tap items-baseline justify-between gap-4 py-4 text-h2 font-medium aria-[current=page]:text-copper-deep"
                  >
                    {t(item.key)}
                    <span className="text-micro tabular text-ink-muted">{String(i + 1).padStart(2, '0')}</span>
                  </Link>
                </m.li>
              ))}
            </ul>
          </nav>
          <m.div
            className="page-x grid gap-6 border-t border-line pb-8 pt-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: DUR.reveal, delay: 0.35 }}
          >
            <Link href="/book" onClick={onClose} className={buttonClass('solid', 'w-full')}>
              {t('cta')}
            </Link>
            <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-2 text-small">
              <a href={contact.phone.href} className="inline-flex min-h-tap items-center tabular" dir="ltr">
                {contact.phone.display}
              </a>
              <a href={contact.whatsapp.href} className="inline-flex min-h-tap items-center" target="_blank" rel="noopener noreferrer">
                {t('whatsapp')}
              </a>
            </div>
            <LanguageSwitcher variant="list" onNavigate={onClose} className="border-t border-line pt-3" />
          </m.div>
        </m.div>
      )}
    </AnimatePresence>
  );
}
