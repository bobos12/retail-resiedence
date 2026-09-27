'use client';

import type Lenis from 'lenis';
import { useEffect } from 'react';
import { usePathname } from '@/i18n/navigation';
import { getLenis, setLenis } from '@/lib/lenis';

// Lenis smooth scrolling, off for people who prefer reduced motion. Loaded after
// first paint so it never competes with the hero.
export function SmoothScroll() {
  const pathname = usePathname();

  useEffect(() => {
    const query = window.matchMedia('(prefers-reduced-motion: reduce)');
    let lenis: Lenis | null = null;
    let disposed = false;
    const start = async () => {
      if (query.matches || lenis) return;
      const { default: LenisCtor } = await import('lenis');
      if (disposed || query.matches || lenis) return;
      lenis = new LenisCtor({ autoRaf: true, lerp: 0.11, anchors: { offset: -72 } });
      setLenis(lenis);
    };
    const stop = () => {
      lenis?.destroy();
      lenis = null;
      setLenis(null);
    };
    const onChange = () => (query.matches ? stop() : void start());
    const idle = window.requestIdleCallback ?? ((cb: () => void) => window.setTimeout(cb, 200));
    idle(() => void start());
    query.addEventListener('change', onChange);
    return () => {
      disposed = true;
      query.removeEventListener('change', onChange);
      stop();
    };
  }, []);

  // New page, new scroll position: keep Lenis in step with the router.
  useEffect(() => {
    if (!window.location.hash) getLenis()?.scrollTo(0, { immediate: true, force: true });
  }, [pathname]);

  return null;
}
