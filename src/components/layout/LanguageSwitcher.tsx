'use client';

import { useLocale, useTranslations } from 'next-intl';
import { useEffect, useId, useRef, useState } from 'react';
import { Link, usePathname } from '@/i18n/navigation';
import { localeNames, routing, type Locale } from '@/i18n/routing';
import { cn } from '@/lib/cn';

type Props = {
  /** `menu`: a compact button with a dropdown (header). `list`: every language inline (footer, mobile menu). */
  variant?: 'menu' | 'list';
  /** Colour scheme for the dropdown panel. */
  tone?: 'dark' | 'light';
  className?: string;
  onNavigate?: () => void;
};

const link = 'inline-flex min-h-tap items-center underline decoration-transparent underline-offset-4 transition-[text-decoration-color] duration-(--dur-fast) hover:decoration-current';

// Every language named in itself; the current one is marked, never linked.
export function LanguageSwitcher({ variant = 'menu', tone = 'dark', className, onNavigate }: Props) {
  const t = useTranslations('nav');
  const locale = useLocale() as Locale;
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const root = useRef<HTMLDivElement>(null);
  const id = useId();

  useEffect(() => {
    if (!open) return;
    const onDown = (e: PointerEvent) => {
      if (!root.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setOpen(false);
        root.current?.querySelector('button')?.focus();
      }
    };
    document.addEventListener('pointerdown', onDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('pointerdown', onDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  const items = routing.locales.map((l) =>
    l === locale ? (
      <span key={l} lang={l} aria-current="true" className={cn(link, 'font-medium text-copper')}>
        {localeNames[l]}
      </span>
    ) : (
      <Link
        key={l}
        href={pathname}
        locale={l}
        hrefLang={l}
        lang={l}
        onClick={() => {
          setOpen(false);
          onNavigate?.();
        }}
        className={link}
      >
        {localeNames[l]}
      </Link>
    ),
  );

  if (variant === 'list') {
    return (
      <nav aria-label={t('language')} className={cn('flex flex-wrap gap-x-5 text-small', className)}>
        {items}
      </nav>
    );
  }

  return (
    <div ref={root} className={cn('relative', className)}>
      <button
        type="button"
        aria-expanded={open}
        aria-controls={id}
        onClick={() => setOpen((v) => !v)}
        className="inline-flex min-h-tap items-center gap-1.5 px-1 text-small font-medium uppercase"
      >
        <span className="sr-only">{t('language')}: </span>
        {locale}
        <svg viewBox="0 0 20 20" className={cn('size-3.5 transition-transform duration-(--dur-fast)', open && 'rotate-180')} fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden>
          <path d="m5 7.5 5 5 5-5" />
        </svg>
      </button>
      <div
        id={id}
        hidden={!open}
        className={cn(
          'absolute end-0 top-full z-50 mt-2 min-w-44 border p-2 text-small shadow-none',
          tone === 'dark' ? 'border-night-line bg-night text-bone' : 'border-line bg-canvas text-ink',
        )}
      >
        <ul>
          {items.map((item, i) => (
            <li key={routing.locales[i]} className="px-3 [&>*]:w-full">
              {item}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
