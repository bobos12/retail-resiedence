'use client';

import { useEffect, useRef, useState } from 'react';

/**
 * True once the element comes within `margin` of the viewport. Used to hold back
 * below-the-fold photographs until the page is interactive, so they don't compete
 * with the fonts, CSS and hero on slow connections. The blur placeholder shows until then.
 */
export function useNearViewport<T extends Element>(margin = '100% 100%') {
  const ref = useRef<T>(null);
  const [near, setNear] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el || near) return;
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setNear(true);
          io.disconnect();
        }
      },
      { rootMargin: margin },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [near, margin]);

  return [ref, near] as const;
}

/** Inline style that paints the blur placeholder behind a not-yet-loaded image. */
export const blurBackground = (blurDataURL: string) => ({
  backgroundImage: `url("${blurDataURL}")`,
  backgroundSize: 'cover',
  backgroundPosition: 'center',
});
