'use client';

import dynamic from 'next/dynamic';
import { useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';
import { Logo } from '@/components/brand/Logo';
import { buttonClass } from '@/components/ui/ButtonLink';
import { Link, usePathname } from '@/i18n/navigation';
import { cn } from '@/lib/cn';
import { LanguageSwitcher } from './LanguageSwitcher';
import { navItems, overlayHeroes } from './nav-items';

// Only phones and tablets ever open it; load it when first needed.
const MobileMenu = dynamic(() => import('./MobileMenu').then((mod) => mod.MobileMenu), { ssr: false });

const SOLID_AFTER = 24;
const HIDE_AFTER = 320;

export function Header() {
  const t = useTranslations('nav');
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [menuLoaded, setMenuLoaded] = useState(false);

  useEffect(() => {
    let last = window.scrollY;
    let frame = 0;
    const update = () => {
      frame = 0;
      const y = window.scrollY;
      setScrolled(y > SOLID_AFTER);
      if (Math.abs(y - last) > 4) {
        setHidden(y > last && y > HIDE_AFTER);
        last = y;
      }
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    frame = requestAnimationFrame(update);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
      cancelAnimationFrame(frame);
    };
  }, []);

  // A new page starts with the header visible and the menu closed.
  const [lastPath, setLastPath] = useState(pathname);
  if (lastPath !== pathname) {
    setLastPath(pathname);
    setHidden(false);
    setMenuOpen(false);
  }

  const overlayTone = !scrolled && !menuOpen ? overlayHeroes[pathname] : undefined;
  const overlay = overlayTone !== undefined;
  const isActive = (href: string) => pathname === href || pathname.startsWith(`${href}/`);

  return (
    <>
      <header
        className={cn(
          'fixed inset-x-0 top-0 z-40 border-b transition-[translate,background-color,border-color,color] duration-(--dur-base) ease-out',
          overlayTone === 'light' && 'border-transparent bg-transparent text-bone',
          overlayTone === 'dark' && 'border-transparent bg-transparent text-ink',
          !overlay && 'border-night-line bg-night text-bone',
          hidden && !menuOpen && '-translate-y-full',
        )}
      >
        <div className="page-x flex h-header items-center justify-between gap-6">
          <Link href="/" className="-ms-1 flex min-h-tap items-center p-1" onClick={() => setMenuOpen(false)}>
            <Logo className="h-10 w-auto" />
          </Link>

          <nav aria-label={t('primary')} className="hidden items-center gap-8 lg:flex">
            <ul className="flex items-center gap-7">
              {navItems.map((item) => (
                <li key={item.key}>
                  <Link
                    href={item.href}
                    aria-current={isActive(item.href) ? 'page' : undefined}
                    className="group relative inline-flex min-h-tap items-center text-small font-medium"
                  >
                    {t(item.key)}
                    <span
                      className={cn(
                        'absolute inset-x-0 bottom-2 h-px origin-left scale-x-0 bg-current transition-transform duration-(--dur-base) ease-out rtl:origin-right',
                        'group-hover:scale-x-100 group-aria-[current=page]:scale-x-100',
                      )}
                    />
                  </Link>
                </li>
              ))}
            </ul>
            <span className={cn('h-5 w-px', overlayTone === 'dark' ? 'bg-line' : 'bg-bone/35')} aria-hidden />
            <LanguageSwitcher />
            <Link href="/contact" className={buttonClass(overlayTone === 'dark' ? 'solid' : 'light', 'px-5')}>
              {t('cta')}
            </Link>
          </nav>

          <div className="flex items-center gap-2 lg:hidden">
            <LanguageSwitcher className="px-2" />
            <button
              type="button"
              onClick={() => {
                setMenuLoaded(true);
                setMenuOpen((v) => !v);
              }}
              aria-expanded={menuOpen}
              aria-controls="mobile-menu"
              className="-me-2 inline-flex min-h-tap min-w-tap items-center justify-center gap-3 px-2 text-small font-medium"
            >
              <span>{menuOpen ? t('close') : t('menu')}</span>
              <span className="relative block h-3 w-6" aria-hidden>
                <span
                  className={cn(
                    'absolute inset-x-0 top-1/2 h-px bg-current transition-transform duration-(--dur-base) ease-out',
                    menuOpen ? 'rotate-45' : '-translate-y-1',
                  )}
                />
                <span
                  className={cn(
                    'absolute inset-x-0 top-1/2 h-px bg-current transition-transform duration-(--dur-base) ease-out',
                    menuOpen ? '-rotate-45' : 'translate-y-1',
                  )}
                />
              </span>
              <span className="sr-only">{menuOpen ? t('closeMenu') : t('openMenu')}</span>
            </button>
          </div>
        </div>
      </header>
      {menuLoaded && <MobileMenu open={menuOpen} onClose={() => setMenuOpen(false)} />}
    </>
  );
}
