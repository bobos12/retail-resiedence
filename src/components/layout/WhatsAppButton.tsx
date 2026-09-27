'use client';

import { useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';
import { contact } from '@/content/contact';
import { cn } from '@/lib/cn';

// Small, quiet, and only after the visitor starts scrolling. Sits at the inline end, so it mirrors in RTL.
export function WhatsAppButton() {
  const t = useTranslations('nav');
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      if (window.scrollY > 80) {
        setShown(true);
        window.removeEventListener('scroll', onScroll);
      }
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <a
      href={contact.whatsapp.href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={t('whatsappLabel')}
      tabIndex={shown ? 0 : -1}
      aria-hidden={!shown}
      className={cn(
        'fixed bottom-5 end-5 z-30 inline-flex min-h-tap min-w-tap items-center justify-center gap-2 rounded-pill bg-ink px-3.5 text-small font-medium text-canvas',
        'transition-[opacity,translate,background-color] duration-(--dur-base) ease-out hover:bg-copper-deep sm:px-5',
        shown ? 'translate-y-0 opacity-100' : 'pointer-events-none translate-y-4 opacity-0',
      )}
    >
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" className="size-5" aria-hidden>
        <path d="M4.5 19.5 5.6 16A7.8 7.8 0 1 1 8.4 18.6Z" strokeLinejoin="round" />
        <path d="M9.3 9.2c.3 1.9 1.6 3.6 3.6 4.5l1.2-1 1.7.8-.3 1.3c-3.3.2-6.6-2.8-6.8-6.1l1.3-.4.8 1.7Z" strokeLinejoin="round" />
      </svg>
      <span className="hidden sm:inline">{t('whatsapp')}</span>
    </a>
  );
}
