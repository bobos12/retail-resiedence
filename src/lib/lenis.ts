import type Lenis from 'lenis';

// The one Lenis instance, shared with components that need to pause scrolling (menu, lightbox).
let instance: Lenis | null = null;

export const setLenis = (lenis: Lenis | null) => {
  instance = lenis;
};

export const getLenis = () => instance;

/** Stop page scrolling while an overlay is open; returns a function that restores it. */
export function lockScroll() {
  const root = document.documentElement;
  const previous = root.style.overflow;
  root.style.overflow = 'hidden';
  instance?.stop();
  return () => {
    root.style.overflow = previous;
    instance?.start();
  };
}
